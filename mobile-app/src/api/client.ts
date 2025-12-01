import axios, { AxiosInstance } from 'axios';
import {
  API_BASE_URL,
  PRIMARY_API_BASE_URL,
  REQUEST_TIMEOUT_MS,
} from '@/constants/config';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { endpoints } from './endpoints';

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
      console.error('Request error:', error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Network error handling
      if (!error.response) {
        // Network error (no response from server)
        const networkError = new Error(
          error.code === 'ECONNABORTED'
            ? 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
            : 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.',
        );
        networkError.name = 'NetworkError';
        return Promise.reject(networkError);
      }

      const originalRequest = error.config;
      const status = error.response?.status;
      
      // 403 (Forbidden) hatası - yetki hatası, refresh token yapmaya gerek yok
      if (status === 403) {
        if (error.response?.data?.message) {
          const formattedError = new Error(error.response.data.message);
          formattedError.name = 'ApiError';
          return Promise.reject(formattedError);
        }
        return Promise.reject(error);
      }
      
      // 401 (Unauthorized) hatası değilse veya zaten retry yapıldıysa
      if (status !== 401 || originalRequest._retry) {
        // Format error message for better UX
        if (error.response?.data?.message) {
          const formattedError = new Error(error.response.data.message);
          formattedError.name = 'ApiError';
          return Promise.reject(formattedError);
        }
        return Promise.reject(error);
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
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}${endpoints.auth.refreshToken}`,
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
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
  }),
);

const rootApiClient = attachInterceptors(
  axios.create({
    baseURL: PRIMARY_API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
  }),
);

export { rootApiClient };
export default apiClient;

