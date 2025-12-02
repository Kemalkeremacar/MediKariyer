/**
 * Error Handler Utility
 * Provides user-friendly error messages and handles different error types
 */

import { errorLogger } from './errorLogger';

export interface ApiError extends Error {
  statusCode?: number;
  data?: any;
}

export interface NetworkError extends Error {
  code?: string;
}

/**
 * Get user-friendly error message from error object
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'Bilinmeyen bir hata oluştu';
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError') {
      return error.message || 'İnternet bağlantınızı kontrol edin';
    }

    // API errors
    if (error.name === 'ApiError') {
      return error.message || 'Bir hata oluştu. Lütfen tekrar deneyin';
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return error.message || 'Lütfen girdiğiniz bilgileri kontrol edin';
    }

    // Generic error with message
    if (error.message) {
      return error.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle axios errors
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as any;
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin';
};

/**
 * Handle API errors with logging and user feedback
 */
export const handleApiError = (
  error: unknown,
  endpoint?: string,
  showToast?: (message: string, type: 'error') => void
): string => {
  const message = getUserFriendlyErrorMessage(error);

  // Log the error
  if (error instanceof Error) {
    const statusCode = (error as ApiError).statusCode;
    errorLogger.logApiError(error, endpoint, statusCode);
  } else {
    errorLogger.logError(new Error(String(error)), {
      type: 'api',
      endpoint,
    });
  }

  // Show toast if provided
  if (showToast) {
    showToast(message, 'error');
  }

  return message;
};

/**
 * Handle network errors with logging and user feedback
 */
export const handleNetworkError = (
  error: unknown,
  endpoint?: string,
  showToast?: (message: string, type: 'error') => void
): string => {
  const message = getUserFriendlyErrorMessage(error);

  // Log the error
  if (error instanceof Error) {
    errorLogger.logNetworkError(error, endpoint);
  } else {
    errorLogger.logError(new Error(String(error)), {
      type: 'network',
      endpoint,
    });
  }

  // Show toast if provided
  if (showToast) {
    showToast(message, 'error');
  }

  return message;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'NetworkError';
  }

  if (typeof error === 'object' && error !== null) {
    const axiosError = error as any;
    // Check for network errors (no response from server)
    if (!axiosError.response && axiosError.request) {
      return true;
    }
    // Check for timeout errors
    if (axiosError.code === 'ECONNABORTED') {
      return true;
    }
    // Check for connection refused
    if (axiosError.code === 'ECONNREFUSED') {
      return true;
    }
  }

  return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as any;
    return axiosError.response?.status === 401;
  }

  return false;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'ValidationError';
  }

  if (typeof error === 'object' && error !== null) {
    const axiosError = error as any;
    return axiosError.response?.status === 422 || axiosError.response?.status === 400;
  }

  return false;
};
