/**
 * API Client - Stabilizasyon Faz 1
 * ARCH-001: Factory pattern ile refactor edildi
 * 
 * Export'lar:
 * - apiClient: Mobile API için (/api/mobile)
 * - rootApiClient: Root API için (/api)
 * - createApiClient: Custom client oluşturmak için factory
 * 
 * Stabilizasyon İyileştirmeleri:
 * - Robust JSON error parsing
 * - Improved token refresh mechanism
 * - Better error message extraction from backend
 * - SecureStore integration validation
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { REQUEST_TIMEOUT_MS } from '@/config/constants';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { endpoints } from './endpoints';
import { errorLogger } from '@/utils/errorLogger';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler';
import { devLog, devWarn, devError } from '@/utils/devLogger';

// ============================================================================
// TYPES
// ============================================================================

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

type PendingRequest = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

interface CreateClientOptions {
  baseURL: string;
  timeout?: number;
}

interface BackendErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]> | string[];
  data?: unknown;
  [key: string]: unknown;
}

// ============================================================================
// STATE (shared across all clients)
// ============================================================================

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];
const pendingQueue: PendingRequest[] = [];

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
 * Extract error message from backend response
 * Handles various backend error formats
 */
const extractErrorMessage = (error: AxiosError<BackendErrorResponse>): string => {
  const response = error.response;
  if (!response?.data) {
    return getUserFriendlyErrorMessage(error);
  }

  const data = response.data;

  // Priority 1: Direct message field
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  // Priority 2: Error field
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }

      // Priority 3: Errors object (validation errors)
      if (data.errors) {
        if (Array.isArray(data.errors)) {
          // Array of error messages
          return data.errors.join(', ');
        }
        if (typeof data.errors === 'object') {
          // Object with field-specific errors
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

  // Priority 4: Status code based messages
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
 * Check if endpoint is public (doesn't require authentication)
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
  // REQUEST INTERCEPTOR
  // ============================================================================
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
      devLog('📤 API Request:', config.method?.toUpperCase(), fullUrl);
      
      // Skip token refresh logic for public endpoints
      if (isPublicEndpoint(config.url)) {
        // For refresh endpoint, we might have a token
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
      
      // Check if token needs refresh before making request
      const shouldRefresh = await tokenManager.shouldRefreshAccessToken();
      
      // Start proactive refresh if needed (only one request will trigger this)
      if (shouldRefresh && !isRefreshing) {
        devLog('🔄 Token needs refresh, triggering proactive refresh...');
        isRefreshing = true;
        
        // Start refresh in background (don't await here, let it run async)
        (async () => {
          try {
            const refreshToken = await tokenManager.getRefreshToken();
            if (!refreshToken) {
              devWarn('⚠️ No refresh token available, requests will proceed');
              processPendingQueue(null);
              isRefreshing = false;
              return;
            }

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
            
            devLog('✅ Proactive token refresh successful');
            processPendingQueue(null);
          } catch (error) {
            devWarn('⚠️ Proactive token refresh failed, requests will proceed and retry on 401');
            processPendingQueue(error);
          } finally {
            isRefreshing = false;
          }
        })();
      }
      
      // If refresh is needed or in progress, wait for it to complete
      if (shouldRefresh || isRefreshing) {
        if (isRefreshing) {
          devLog('⏳ Refresh in progress, waiting...');
        } else {
          devLog('🔄 Token needs refresh, waiting for refresh to start...');
        }
        
        // Wait for refresh to complete
        await new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        });
      }
      
      // Get token and attach to request
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
      devError('❌ Request error:', error);
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
      devLog('📥 API Response:', response.config.method?.toUpperCase(), response.config.url);
      devLog('📥 Response status:', response.status);
      return response;
    },
    async (error: AxiosError<BackendErrorResponse>) => {
      devError('❌ API Error:', error.config?.url, error.response?.status);
      
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
      const status = error.response?.status;
      const requestUrl = error.config?.url || '';
      
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
              devLog('🛑 Account disabled detected, updated store. RootNavigator will redirect to AccountDisabled screen.');
            } else {
              // Zaten pasif, gereksiz güncelleme yapma
              devLog('🛑 Account disabled detected, but user already marked as inactive. Skipping store update.');
            }
          }
          
          // Hesap pasif durumu beklenen bir durumdur (admin tarafından yapılan bir işlem)
          // Bu yüzden error logger'ı çağırmıyoruz (gereksiz error spam'ini önlemek için)
          // Sadece hatayı reject ediyoruz, böylece UI'da gösterilebilir ama log spam'i olmaz
          return Promise.reject(formattedError);
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
      
      devLog('🔐 DEBUG 401 Check:', {
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
        devLog('🔐 Login/Register 401 error - SKIPPING token refresh and logout, returning error directly');
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
