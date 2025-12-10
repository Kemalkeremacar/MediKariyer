import axios, { AxiosInstance } from 'axios';
import { env } from '@/config/env';
import { REQUEST_TIMEOUT_MS } from '@/config/constants';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { endpoints } from './endpoints';
import { errorLogger } from '@/utils/errorLogger';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler';

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];

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

const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config) => {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      // Don't log request data to avoid logging base64 images
      
      // Check if token needs refresh before making request
      const shouldRefresh = await tokenManager.shouldRefreshAccessToken();
      if (shouldRefresh && !config.url?.includes('/auth/refresh-token')) {
        console.log('🔄 Token needs refresh, triggering proactive refresh...');
        try {
          const refreshToken = await tokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(
              `${env.API_BASE_URL}${endpoints.auth.refreshToken}`,
              { refreshToken },
            );
            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
            await tokenManager.saveTokens(accessToken, newRefreshToken);
            useAuthStore.getState().markAuthenticated(user);
            console.log('✅ Proactive token refresh successful');
          }
        } catch (error) {
          console.warn('⚠️ Proactive token refresh failed, will retry on 401');
        }
      }
      
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
      console.error('❌ Request error:', error);
      errorLogger.logError(error, {
        type: 'request',
        phase: 'interceptor',
      });
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url);
      console.log('📥 Response status:', response.status);
      // Don't log response data to avoid logging base64 images
      return response;
    },
    async (error) => {
      console.error('❌ API Error:', error.config?.url, error.response?.status);
      console.error('❌ Error response:', JSON.stringify(error.response?.data, null, 2));
      
      // Network error handling
      if (!error.response) {
        // Determine specific network error message
        let errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Bağlantı zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.';
        } else if (!error.request) {
          errorMessage = 'İstek gönderilemedi. Lütfen tekrar deneyin.';
        }
        
        const networkError = new Error(errorMessage);
        networkError.name = 'NetworkError';
        
        // Log network error with details
        errorLogger.logNetworkError(networkError, error.config?.url);
        errorLogger.logError(networkError, {
          type: 'network',
          code: error.code,
          url: error.config?.url,
          method: error.config?.method,
        });
        
        return Promise.reject(networkError);
      }

      const originalRequest = error.config;
      const status = error.response?.status;
      
      // 403 (Forbidden) hatası - yetki hatası, refresh token yapmaya gerek yok
      if (status === 403) {
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        const errorMessage = backendMessage || 'Bu işlem için yetkiniz yok';
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        // Log API error
        errorLogger.logApiError(formattedError, error.config?.url, status);
        
        return Promise.reject(formattedError);
      }
      
      // 401 (Unauthorized) hatası değilse veya zaten retry yapıldıysa
      if (status !== 401 || originalRequest._retry) {
        // Backend'den gelen mesajı al, yoksa genel mesaj kullan
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        const errorMessage = backendMessage || getUserFriendlyErrorMessage(error);
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        // Log API error
        errorLogger.logApiError(formattedError, error.config?.url, status);
        
        return Promise.reject(formattedError);
      }

      if (isRefreshing) {
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

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await tokenManager.getRefreshToken();

      if (!refreshToken) {
        useAuthStore.getState().markUnauthenticated();
        await tokenManager.clearTokens();
        isRefreshing = false;
        
        // Backend'den gelen mesajı al
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        const errorMessage = backendMessage || 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        // Log authentication error
        errorLogger.logError(formattedError, {
          type: 'auth',
          action: 'token_refresh',
        });
        
        return Promise.reject(formattedError);
      }

      try {
        const response = await axios.post(
          `${env.API_BASE_URL}${endpoints.auth.refreshToken}`,
          {
            refreshToken,
          },
        );

        const { accessToken, refreshToken: newRefreshToken, user } =
          response.data.data;

        await tokenManager.saveTokens(accessToken, newRefreshToken);
        useAuthStore.getState().markAuthenticated(user);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().markUnauthenticated();
        await tokenManager.clearTokens();
        
        // Backend'den gelen mesajı al veya genel mesaj kullan
        const backendMessage = (refreshError as any)?.response?.data?.message || (refreshError as any)?.response?.data?.error;
        const errorMessage = backendMessage || 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        // Log token refresh failure
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

const apiClient = attachInterceptors(
  axios.create({
    baseURL: env.API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
  }),
);

const rootApiClient = attachInterceptors(
  axios.create({
    baseURL: env.PRIMARY_API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
  }),
);

export { rootApiClient, apiClient };
export default apiClient;

