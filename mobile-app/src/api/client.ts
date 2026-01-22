/**
 * @file client.ts
 * @description API istemci yönetimi - Axios instance'ları ve interceptor'lar
 * 
 * Mimari: Factory pattern ile refactor edildi (ARCH-001)
 * 
 * Export'lar:
 * - apiClient: Mobile API için (/api/mobile)
 * - rootApiClient: Root API için (/api)
 * - createApiClient: Özel client oluşturmak için factory fonksiyonu
 * 
 * Özellikler:
 * - Güçlü JSON hata ayrıştırma
 * - Geliştirilmiş token yenileme mekanizması
 * - Backend'den hata mesajı çıkarma
 * - SecureStore entegrasyonu ve doğrulama
 * - Proaktif token yenileme (süresi dolmadan 5 dk önce)
 * - Network hata yönetimi
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { REQUEST_TIMEOUT_MS } from '@/config/constants';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { endpoints } from './endpoints';
import { errorLogger } from '@/utils/errorLogger';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler';
import { devLog } from '@/utils/devLogger';

// ============================================================================
// TİPLER
// ============================================================================

// Başarısız istek kuyruğu için tip
type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

// Bekleyen istek kuyruğu için tip
type PendingRequest = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

// Client oluşturma seçenekleri
interface CreateClientOptions {
  baseURL: string;
  timeout?: number;
}

// Backend hata yanıt formatı
interface BackendErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]> | string[];
  data?: unknown;
  [key: string]: unknown;
}

// ============================================================================
// DURUM YÖNETİMİ (tüm client'lar arasında paylaşılan)
// ============================================================================

let isRefreshing = false; // Token yenileme işlemi devam ediyor mu?
const failedQueue: FailedRequest[] = []; // 401 hatası alan istekler
const pendingQueue: PendingRequest[] = []; // Token yenileme bekleyen istekler

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(token);
  });
  failedQueue.length = 0;
};

const processPendingQueue = (error: unknown) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve();
  });
  pendingQueue.length = 0;
};

/**
 * Backend yanıtından hata mesajını çıkar
 * @description Çeşitli backend hata formatlarını işler ve kullanıcı dostu mesaj döndürür
 * @param error - Axios hata objesi
 * @returns Kullanıcı dostu hata mesajı
 */
const extractErrorMessage = (error: AxiosError<BackendErrorResponse>): string => {
  const response = error.response;
  if (!response?.data) {
    return getUserFriendlyErrorMessage(error);
  }

  const data = response.data;

  // Öncelik 1: Doğrudan message alanı
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  // Öncelik 2: Error alanı
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }

      // Öncelik 3: Errors objesi (validasyon hataları)
      if (data.errors) {
        if (Array.isArray(data.errors)) {
          // Hata mesajları dizisi
          return data.errors.join(', ');
        }
        if (typeof data.errors === 'object') {
          // Alan bazlı hatalar içeren obje
          const errorMessages = Object.entries(data.errors)
            .map(([, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return String(messages);
            })
            .filter(Boolean);
          if (errorMessages.length > 0) {
            return errorMessages.join('; ');
          }
        }
      }

  // Öncelik 4: HTTP durum koduna göre mesajlar
  const status = response.status;
  switch (status) {
    case 400:
      return 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.';
    case 401:
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    case 403:
      return 'Bu işlem için yetkiniz yok.';
    case 404:
      return 'İstenen kaynak bulunamadı.';
    case 422:
      return 'Girdiğiniz bilgiler geçersiz. Lütfen kontrol edin.';
    case 500:
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    case 503:
      return 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    default:
      return getUserFriendlyErrorMessage(error);
  }
};

/**
 * Endpoint'in public olup olmadığını kontrol et
 * @description Public endpoint'ler kimlik doğrulama gerektirmez
 * @param url - Kontrol edilecek URL
 * @returns Public ise true, değilse false
 */
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  
  const publicEndpoints = [
    '/auth/login',
    '/auth/registerDoctor',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/lookup/',
    '/upload/register-photo',
  ];
  
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};

const attachInterceptors = (instance: AxiosInstance) => {
  // ============================================================================
  // İSTEK INTERCEPTOR'I
  // ============================================================================
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
      devLog.log('📤 API İsteği:', config.method?.toUpperCase(), fullUrl);
      
      // Public endpoint'ler için token yenileme mantığını atla
      if (isPublicEndpoint(config.url)) {
        // Refresh endpoint için token olabilir
        if (config.url?.includes('/auth/refresh')) {
          const token = await tokenManager.getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        config.headers = config.headers ?? {
          'Content-Type': 'application/json',
        };
        return config;
      }
      
      // İstek yapmadan önce token'ın yenilenmesi gerekip gerekmediğini kontrol et
      const shouldRefresh = await tokenManager.shouldRefreshAccessToken();
      
      // FIXED: Proactive refresh with proper await and race condition prevention
      if (shouldRefresh) {
        // If another request is already refreshing, wait for it
        if (isRefreshing) {
          devLog.log('⏳ Refresh already in progress by another request, waiting...');
          await new Promise<void>((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          });
          // After refresh completes, token will be fetched below
        } else {
          // This request will handle the refresh
          devLog.log('🔄 Token needs refresh, triggering proactive refresh...');
          isRefreshing = true;
          
          try {
            const refreshToken = await tokenManager.getRefreshToken();
            if (!refreshToken) {
              devLog.warn('⚠️ No refresh token available, requests will proceed');
              processPendingQueue(null);
            } else {
              const response = await axios.post<{
                success: boolean;
                data: {
                  accessToken: string;
                  refreshToken: string;
                  user: unknown;
                };
              }>(
                `${env.API_BASE_URL}${endpoints.auth.refreshToken}`,
                { refreshToken },
              );

              // Validate response structure
              if (!response.data?.data?.accessToken || !response.data?.data?.refreshToken) {
                throw new Error('Invalid refresh token response structure');
              }

              const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
              
              // Validate tokens before saving
              await tokenManager.saveTokens(accessToken, newRefreshToken);
              useAuthStore.getState().markAuthenticated(user as any);
              
              devLog.log('✅ Proactive token refresh successful');
              // Release all waiting requests - they will fetch the new token below
              processPendingQueue(null);
            }
          } catch (error) {
            devLog.warn('⚠️ Proactive token refresh failed, requests will proceed and retry on 401');
            // Release waiting requests with error - they will try with old token and may get 401
            processPendingQueue(error);
          } finally {
            isRefreshing = false;
          }
        }
      }
      
      // Get token and attach to request
      // This will get the NEW token if refresh just completed
      const token = await tokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      config.headers = config.headers ?? {
        'Content-Type': 'application/json',
      };
      
      return config;
    },
    (error) => {
      // Request error (network error, timeout, etc.)
      devLog.error('❌ Request error:', error);
      errorLogger.logError(error, {
        type: 'request',
        phase: 'interceptor',
      });
      return Promise.reject(error);
    },
  );

  // ============================================================================
  // RESPONSE INTERCEPTOR
  // ============================================================================
  instance.interceptors.response.use(
    (response) => {
      devLog.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url);
      devLog.log('📥 Response status:', response.status);
      return response;
    },
    async (error: AxiosError<BackendErrorResponse>) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || '';
      
      // 403 hatası için özel kontrol - onay bekleyen kullanıcılar için sessiz
      const isPendingApproval403 = status === 403 && (
        requestUrl.includes('/auth/me') ||
        error.response?.data?.message?.includes('onay') ||
        error.response?.data?.message?.includes('bekliyor')
      );
      
      if (isPendingApproval403) {
        // Sessiz 403 - log gösterme
        devLog.log('⏳ User pending approval - expected 403 from', requestUrl, '(silent)');
      } else {
        devLog.error('❌ API Error:', requestUrl, status);
      }
      
      // Network error handling (no response from server)
      if (!error.response) {
        let errorMessage = 'Sunucuya bağlanılamıyor. Backend sunucusunun çalıştığından emin olun.';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'İstek zaman aşımına uğradı (30 saniye). Backend sunucusu çalışıyor mu?';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Sunucuya bağlanılamadı. Backend sunucusu çalışmıyor olabilir.';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Bağlantı zaman aşımına uğradı. VPN bağlantınızı kontrol edin.';
        } else if (!error.request) {
          errorMessage = 'İstek gönderilemedi. Lütfen tekrar deneyin.';
        }
        
        const networkError = new Error(errorMessage);
        networkError.name = 'NetworkError';
        
        errorLogger.logNetworkError(networkError, error.config?.url);
        errorLogger.logError(networkError, {
          type: 'network',
          code: error.code,
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        });
        
        return Promise.reject(networkError);
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      // status ve requestUrl zaten yukarıda tanımlandı
      
      // 403 (Forbidden) hatası - yetki hatası, refresh token yapmaya gerek yok
      if (status === 403) {
        const errorMessage = extractErrorMessage(error);
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        // CRITICAL: Eğer hata mesajı "pasif" veya "disabled" içeriyorsa,
        // kullanıcının hesabı pasif yapılmış demektir. Store'u güncelle.
        // RootNavigator otomatik olarak AccountDisabled ekranına yönlendirecek.
        // Safe implementation to prevent crash if errorMessage is undefined or not a string
        let isAccountDisabled = false;
        if (errorMessage && typeof errorMessage === 'string') {
          const lowerMsg = errorMessage.toLowerCase();
          isAccountDisabled = 
            lowerMsg.includes('pasif') || 
            lowerMsg.includes('disabled') || 
            lowerMsg.includes('pasifleştirilmiş');
        }
        
        if (isAccountDisabled) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            // Sadece is_active değeri değiştiyse güncelle (gereksiz güncellemeleri önle)
            // MSSQL BIT tipi için toleranslı kontrol (boolean, number, string değerlerini kabul eder)
            const currentIsActive = 
              currentUser.is_active === true || 
              currentUser.is_active === 1 || 
              (typeof currentUser.is_active === 'string' && (currentUser.is_active === '1' || currentUser.is_active === 'true'));
            
            if (currentIsActive) {
              // Store'u güncelle: is_active = false
              useAuthStore.getState().markAuthenticated({
                ...currentUser,
                is_active: false,
              });
              devLog.log('🛑 Account disabled detected, updated store. RootNavigator will redirect to AccountDisabled screen.');
            } else {
              // Zaten pasif, gereksiz güncelleme yapma
              devLog.log('🛑 Account disabled detected, but user already marked as inactive. Skipping store update.');
            }
          }
          
          // Hesap pasif durumu beklenen bir durumdur (admin tarafından yapılan bir işlem)
          // Bu yüzden error logger'ı çağırmıyoruz (gereksiz error spam'ini önlemek için)
          // Sadece hatayı reject ediyoruz, böylece UI'da gösterilebilir ama log spam'i olmaz
          return Promise.reject(formattedError);
        }
        
        // Check if this is an expected 403 from /auth/me for unapproved users
        // Don't log these as errors since they're expected during approval polling
        const isPendingApprovalError = 
          requestUrl.includes('/auth/me') && 
          errorMessage && 
          typeof errorMessage === 'string' && 
          (errorMessage.toLowerCase().includes('admin onayını bekliyor') ||
           errorMessage.toLowerCase().includes('onaylanmadı') ||
           errorMessage.toLowerCase().includes('yetkiniz yok'));
        
        if (isPendingApprovalError) {
          // Expected 403 during approval polling - don't log as error
          // Mark this error as "silent" so it won't trigger any UI alerts
          devLog.log('⏳ User pending approval - expected 403 from /auth/me (silent)');
          const silentError = formattedError as any;
          silentError.isSilent = true; // Flag to prevent UI alerts
          return Promise.reject(silentError);
        }
        
        // Diğer 403 hataları için normal error logging
        errorLogger.logApiError(formattedError, error.config?.url, status);
        return Promise.reject(formattedError);
      }
      
      // 401 (Unauthorized) hatası kontrolü
      // CRITICAL: Login/Register endpoint'lerinden gelen 401 hataları için token refresh yapma!
      // Bu endpoint'ler zaten public ve 401 hatası "yanlış şifre" anlamına gelir
      const isLoginRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/login');
      const isRegisterRequest = requestUrl.includes('/auth/register') || requestUrl.includes('/register');
      
      devLog.log('🔐 DEBUG 401 Check:', {
        status,
        requestUrl,
        isLoginRequest,
        isRegisterRequest,
        isPublicEndpoint: isPublicEndpoint(requestUrl),
      });
      
      if (status === 401 && (isLoginRequest || isRegisterRequest)) {
        // Login/Register sırasında 401 = yanlış şifre/kayıt hatası
        // Token refresh yapma, direkt hatayı döndür
        // HİÇBİR ŞEY YAPMA (Logout tetikleme) - Hatayı olduğu gibi bırak
        devLog.log('🔐 Login/Register 401 error - SKIPPING token refresh and logout, returning error directly');
        const errorMessage = extractErrorMessage(error);
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        errorLogger.logApiError(formattedError, error.config?.url, status);
        return Promise.reject(formattedError);
      }
      
      // 401 (Unauthorized) hatası değilse veya zaten retry yapıldıysa
      if (status !== 401 || originalRequest._retry) {
        const errorMessage = extractErrorMessage(error);
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        errorLogger.logApiError(formattedError, error.config?.url, status);
        return Promise.reject(formattedError);
      }

      // Handle 401 - Token refresh needed (only for authenticated endpoints)
      if (isRefreshing) {
        // Another request is already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark request as retried
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();

        if (!refreshToken) {
          useAuthStore.getState().markUnauthenticated();
          await tokenManager.clearTokens();
          isRefreshing = false;
          
          const errorMessage = extractErrorMessage(error);
          const formattedError = new Error(errorMessage);
          formattedError.name = 'ApiError';
          
          errorLogger.logError(formattedError, {
            type: 'auth',
            action: 'token_refresh',
          });
          
          return Promise.reject(formattedError);
        }

        // Attempt token refresh
        const response = await axios.post<{
          success: boolean;
          data: {
            accessToken: string;
            refreshToken: string;
            user: unknown;
          };
        }>(
          `${env.API_BASE_URL}${endpoints.auth.refreshToken}`,
          { refreshToken },
        );

        // Validate response structure
        if (!response.data?.data?.accessToken || !response.data?.data?.refreshToken) {
          throw new Error('Invalid refresh token response structure');
        }

        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

        // Save new tokens
        await tokenManager.saveTokens(accessToken, newRefreshToken);
        useAuthStore.getState().markAuthenticated(user as any);

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and logout
        processQueue(refreshError, null);
        useAuthStore.getState().markUnauthenticated();
        await tokenManager.clearTokens();
        
        const errorMessage = extractErrorMessage(error);
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        errorLogger.logError(formattedError, {
          type: 'auth',
          action: 'token_refresh_failed',
        });
        
        return Promise.reject(formattedError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
};

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates a new API client with interceptors attached
 * Use this to create custom clients for different APIs
 */
export const createApiClient = (options: CreateClientOptions): AxiosInstance => {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return attachInterceptors(instance);
};

// ============================================================================
// PRE-CONFIGURED CLIENTS
// ============================================================================

/**
 * Mobile API Client
 * Base URL: /api/mobile
 * Used for: jobs, applications, notifications, profile CRUD
 */
const apiClient = createApiClient({
  baseURL: env.API_BASE_URL,
});

/**
 * Root API Client
 * Base URL: /api
 * Used for: lookup data, photo management
 */
const rootApiClient = createApiClient({
  baseURL: env.PRIMARY_API_BASE_URL,
});

// ============================================================================
// EXPORTS
// ============================================================================

export { rootApiClient, apiClient };
export default apiClient;
