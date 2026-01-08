/**
 * @file alertHelpers.ts
 * @description Convenience hook for common alert patterns
 * 
 * This hook wraps useAlert with ergonomic helper methods for common use cases.
 * All callbacks are passed through without modification.
 * 
 * Usage:
 * ```typescript
 * const alert = useAlertHelpers();
 * 
 * // Simple alerts
 * alert.success('Operation completed');
 * alert.error('Something went wrong');
 * alert.info('Here is some information');
 * 
 * // Confirmation dialogs
 * alert.confirm('Are you sure?', () => doSomething());
 * alert.confirmDestructive('Delete Item', 'This cannot be undone', () => deleteItem());
 * ```
 * 
 * Requirements: 8.1, 8.4
 */

import { useCallback, useMemo } from 'react';
import { useAlert } from '@/providers/AlertProvider';
import type { AlertConfig } from '@/types/alert';

/**
 * Options for confirm dialogs
 */
export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Alert helper methods returned by useAlertHelpers hook
 */
export interface AlertHelpers {
  /**
   * Show a success alert
   * @param message - Message to display
   * @param onConfirm - Optional callback when user confirms
   */
  success: (message: string, onConfirm?: () => void) => void;

  /**
   * Show an error alert
   * @param message - Message to display
   * @param onConfirm - Optional callback when user confirms
   */
  error: (message: string, onConfirm?: () => void) => void;

  /**
   * Show an info alert
   * @param message - Message to display
   * @param onConfirm - Optional callback when user confirms
   */
  info: (message: string, onConfirm?: () => void) => void;

  /**
   * Show a confirmation dialog
   * @param message - Message to display
   * @param onConfirm - Callback when user confirms
   * @param onCancel - Optional callback when user cancels
   * @param options - Optional title and button text overrides
   */
  confirm: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: ConfirmOptions
  ) => void;

  /**
   * Show a destructive confirmation dialog (for delete/remove actions)
   * @param title - Title of the alert
   * @param message - Message to display
   * @param onConfirm - Callback when user confirms
   * @param onCancel - Optional callback when user cancels
   * @param confirmText - Optional confirm button text (default: 'Sil')
   */
  confirmDestructive: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string
  ) => void;

  /**
   * Direct access to showAlert for custom configurations
   */
  showAlert: (config: AlertConfig) => void;

  /**
   * Hide the currently visible alert
   */
  hideAlert: () => void;
}

/**
 * Hook that provides convenience methods for common alert patterns.
 * Must be used within AlertProvider.
 * 
 * All callbacks are passed through without modification to ensure
 * business logic remains in the calling component.
 * 
 * @throws Error if used outside AlertProvider
 * @returns AlertHelpers object with convenience methods
 */
export const useAlertHelpers = (): AlertHelpers => {
  const { showAlert, hideAlert } = useAlert();

  const success = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({
        type: 'success',
        title: 'Başarılı',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    },
    [showAlert]
  );

  const error = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({
        type: 'error',
        title: 'Hata',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    },
    [showAlert]
  );

  const info = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({
        type: 'info',
        title: 'Bilgi',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    },
    [showAlert]
  );

  const confirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      options?: ConfirmOptions
    ) => {
      showAlert({
        type: 'confirm',
        title: options?.title ?? 'Emin misiniz?',
        message,
        onConfirm,
        onCancel,
        confirmText: options?.confirmText ?? 'Onayla',
        cancelText: options?.cancelText ?? 'İptal',
      });
    },
    [showAlert]
  );

  const confirmDestructive = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText = 'Sil'
    ) => {
      showAlert({
        type: 'confirmDestructive',
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText: 'İptal',
      });
    },
    [showAlert]
  );

  // Memoize the helpers object to prevent unnecessary re-renders
  const helpers = useMemo<AlertHelpers>(
    () => ({
      success,
      error,
      info,
      confirm,
      confirmDestructive,
      showAlert,
      hideAlert,
    }),
    [success, error, info, confirm, confirmDestructive, showAlert, hideAlert]
  );

  return helpers;
};
