/**
 * useErrorHandler Hook
 * Provides comprehensive error handling functionality
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/store/uiStore';
import { errorLogger } from '@/utils/errorLogger';
import {
  getUserFriendlyErrorMessage,
  isNetworkError,
  isAuthError,
  isValidationError,
} from '@/utils/errorHandler';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: Record<string, any>;
}

interface UseErrorHandlerReturn {
  handleError: (error: unknown, options?: ErrorHandlerOptions) => string;
  handleApiError: (error: unknown, endpoint?: string) => string;
  handleNetworkError: (error: unknown) => string;
  isNetworkError: (error: unknown) => boolean;
  isAuthError: (error: unknown) => boolean;
  isValidationError: (error: unknown) => boolean;
}

/**
 * Hook for handling errors consistently across the app
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { showError } = useToast();
  const { setLoading } = useUIStore();

  /**
   * Handle any error with options
   */
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}): string => {
      const {
        showToast = true,
        logError: shouldLog = true,
        context = {},
      } = options;

      // Stop any loading indicators
      setLoading(false);

      // Get user-friendly message
      const message = getUserFriendlyErrorMessage(error);

      // Log the error
      if (shouldLog) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        errorLogger.logError(errorObj, context);
      }

      // Show toast notification
      if (showToast) {
        showError(message);
      }

      return message;
    },
    [showError, setLoading]
  );

  /**
   * Handle API errors specifically
   */
  const handleApiError = useCallback(
    (error: unknown, endpoint?: string): string => {
      return handleError(error, {
        showToast: true,
        logError: true,
        context: {
          type: 'api',
          endpoint,
        },
      });
    },
    [handleError]
  );

  /**
   * Handle network errors specifically
   */
  const handleNetworkError = useCallback(
    (error: unknown): string => {
      return handleError(error, {
        showToast: true,
        logError: true,
        context: {
          type: 'network',
        },
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    isNetworkError,
    isAuthError,
    isValidationError,
  };
};
