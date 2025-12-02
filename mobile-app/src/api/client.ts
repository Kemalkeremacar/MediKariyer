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
      errorLogger.logError(error, {
        type: 'request',
        phase: 'interceptor',
      });
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
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
        const errorMessage = error.response?.data?.message || 'Bu işlem için yetkiniz yok';
        const formattedError = new Error(errorMessage);
        formattedError.name = 'ApiError';
        
        // Log API error
        errorLogger.logApiError(formattedError, error.config?.url, status);
        
        return Promise.reject(formattedError);
      }
      
      // 401 (Unauthorized) hatası değilse veya zaten retry yapıldıysa
      if (status !== 401 || originalRequest._retry) {
        // Format error message for better UX
        const errorMessage = getUserFriendlyErrorMessage(error);
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
        
        // Log authentication error
        errorLogger.logError(new Error('No refresh token available'), {
          type: 'auth',
          action: 'token_refresh',
        });
        
        return Promise.reject(error);
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
        useAuthStore
          .getState()
          .setAuthState({ user, accessToken, refreshToken: newRefreshToken });

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().markUnauthenticated();
        await tokenManager.clearTokens();
        
        // Log token refresh failure
        errorLogger.logError(
          refreshError instanceof Error ? refreshError : new Error('Token refresh failed'),
          {
            type: 'auth',
            action: 'token_refresh_failed',
          }
        );
        
        return Promise.reject(refreshError);
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

export { rootApiClient };
export default apiClient;

