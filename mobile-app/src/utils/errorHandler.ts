/**
 * @file errorHandler.ts
 * @description Hata yönetimi yardımcı fonksiyonları
 * 
 * Özellikler:
 * - Kullanıcı dostu hata mesajları
 * - Farklı hata tiplerini yönetme (API, Network, Validation)
 * - Hata loglama entegrasyonu
 * - Toast bildirimi desteği
 * 
 * Hata Tipleri:
 * - ApiError: API'den gelen hatalar
 * - NetworkError: Ağ bağlantı hataları
 * - ValidationError: Validasyon hataları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { isAxiosError } from 'axios';
import { errorLogger } from './errorLogger';

// API hatası tipi
export interface ApiError extends Error {
  statusCode?: number; // HTTP durum kodu
  data?: unknown; // Hata verisi
}

// Network hatası tipi
export interface NetworkError extends Error {
  code?: string; // Hata kodu (ECONNABORTED, ECONNREFUSED, vb.)
}

/**
 * Hata objesinden kullanıcı dostu hata mesajı al
 * @param error - Hata objesi
 * @returns Kullanıcı dostu hata mesajı
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'Bilinmeyen bir hata oluştu';
  }

  // Error objelerini yönet
  if (error instanceof Error) {
    // Network hataları
    if (error.name === 'NetworkError') {
      return error.message || 'İnternet bağlantınızı kontrol edin';
    }

    // API hataları
    if (error.name === 'ApiError') {
      return error.message || 'Bir hata oluştu. Lütfen tekrar deneyin';
    }

    // Validasyon hataları
    if (error.name === 'ValidationError') {
      return error.message || 'Lütfen girdiğiniz bilgileri kontrol edin';
    }

    // Mesajı olan genel hata
    if (error.message) {
      return error.message;
    }
  }

  // String hataları yönet
  if (typeof error === 'string') {
    return error;
  }

  // Axios hatalarını yönet
  if (isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin';
};

/**
 * API hatalarını loglama ve kullanıcı geri bildirimi ile yönet
 * @param error - Hata objesi
 * @param endpoint - API endpoint'i (opsiyonel)
 * @param showToast - Toast gösterme fonksiyonu (opsiyonel)
 * @returns Kullanıcı dostu hata mesajı
 */
export const handleApiError = (
  error: unknown,
  endpoint?: string,
  showToast?: (message: string, type: 'error') => void
): string => {
  const message = getUserFriendlyErrorMessage(error);

  // Hatayı logla
  if (error instanceof Error) {
    const statusCode = (error as ApiError).statusCode;
    errorLogger.logApiError(error, endpoint, statusCode);
  } else {
    errorLogger.logError(new Error(String(error)), {
      type: 'api',
      endpoint,
    });
  }

  // Toast göster (sağlanmışsa)
  if (showToast) {
    showToast(message, 'error');
  }

  return message;
};

/**
 * Network hatalarını loglama ve kullanıcı geri bildirimi ile yönet
 * @param error - Hata objesi
 * @param endpoint - API endpoint'i (opsiyonel)
 * @param showToast - Toast gösterme fonksiyonu (opsiyonel)
 * @returns Kullanıcı dostu hata mesajı
 */
export const handleNetworkError = (
  error: unknown,
  endpoint?: string,
  showToast?: (message: string, type: 'error') => void
): string => {
  const message = getUserFriendlyErrorMessage(error);

  // Hatayı logla
  if (error instanceof Error) {
    errorLogger.logNetworkError(error, endpoint);
  } else {
    errorLogger.logError(new Error(String(error)), {
      type: 'network',
      endpoint,
    });
  }

  // Toast göster (sağlanmışsa)
  if (showToast) {
    showToast(message, 'error');
  }

  return message;
};

/**
 * Hatanın network hatası olup olmadığını kontrol et
 * @param error - Hata objesi
 * @returns Network hatası ise true, değilse false
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'NetworkError';
  }

  if (isAxiosError(error)) {
    // Network hatalarını kontrol et (sunucudan yanıt yok)
    if (!error.response && error.request) {
      return true;
    }
    // Timeout hatalarını kontrol et
    if (error.code === 'ECONNABORTED') {
      return true;
    }
    // Bağlantı reddedildi hatalarını kontrol et
    if (error.code === 'ECONNREFUSED') {
      return true;
    }
  }

  return false;
};

/**
 * Hatanın kimlik doğrulama hatası olup olmadığını kontrol et
 * @param error - Hata objesi
 * @returns Auth hatası ise true, değilse false
 */
export const isAuthError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.response?.status === 401;
  }

  return false;
};

/**
 * Hatanın validasyon hatası olup olmadığını kontrol et
 * @param error - Hata objesi
 * @returns Validasyon hatası ise true, değilse false
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'ValidationError';
  }

  if (isAxiosError(error)) {
    return error.response?.status === 422 || error.response?.status === 400;
  }

  return false;
};
