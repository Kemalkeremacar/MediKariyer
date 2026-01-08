/**
 * @file alertRef.ts
 * @description Imperative alert API for non-component code
 * 
 * This module provides a ref-based approach for triggering alerts from
 * non-component code (API interceptors, utility functions, etc.).
 * 
 * When the AlertProvider is mounted, it connects to this ref via useImperativeHandle.
 * When the ref is not available (provider not mounted), falls back to native Alert.alert.
 * 
 * Usage in non-component code:
 * ```typescript
 * import { imperativeAlert } from '@/utils/alertRef';
 * 
 * // In API interceptor
 * if (error.response?.status === 401) {
 *   imperativeAlert.error('Session expired');
 * }
 * ```
 * 
 * Requirements: 8.5
 */

import { createRef } from 'react';
import { Alert, AlertButton } from 'react-native';
import type { AlertConfig, AlertRef } from '@/types/alert';
import { overlayDevLog } from '@/utils/devLogger';

/**
 * Ref that AlertProvider connects to via useImperativeHandle
 * This allows non-component code to access alert functionality
 */
export const alertRef = createRef<AlertRef>();

/**
 * Imperative alert API for non-component code.
 * Falls back to native Alert.alert when AlertProvider is not mounted.
 * 
 * Note: Prefer using useAlertHelpers hook in components.
 * This API is intended for:
 * - API interceptors
 * - Utility functions called outside React component tree
 * - Error handlers in non-component code
 */
export const imperativeAlert = {
  /**
   * Show a success alert
   * @param message - Message to display
   * @param onConfirm - Optional callback when user confirms
   */
  success: (message: string, onConfirm?: () => void) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'success',
        title: 'Başarılı',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert('Başarılı', message, [{ text: 'Tamam', onPress: onConfirm }]);
    }
  },

  /**
   * Show an error alert
   * @param message - Message to display
   * @param onConfirm - Optional callback when user confirms
   */
  error: (message: string, onConfirm?: () => void) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'error',
        title: 'Hata',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert('Hata', message, [{ text: 'Tamam', onPress: onConfirm }]);
    }
  },

  /**
   * Show an info alert
   * @param message - Message to display
   * @param onConfirm - Optional callback when user confirms
   */
  info: (message: string, onConfirm?: () => void) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'info',
        title: 'Bilgi',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert('Bilgi', message, [{ text: 'Tamam', onPress: onConfirm }]);
    }
  },

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
    options?: { title?: string; confirmText?: string; cancelText?: string }
  ) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'confirm',
        title: options?.title ?? 'Emin misiniz?',
        message,
        onConfirm,
        onCancel,
        confirmText: options?.confirmText ?? 'Onayla',
        cancelText: options?.cancelText ?? 'İptal',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert(options?.title ?? 'Emin misiniz?', message, [
        { text: options?.cancelText ?? 'İptal', style: 'cancel', onPress: onCancel },
        { text: options?.confirmText ?? 'Onayla', onPress: onConfirm },
      ]);
    }
  },

  /**
   * Show a destructive confirmation dialog
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
    confirmText = 'Sil'
  ) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'confirmDestructive',
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText: 'İptal',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert(title, message, [
        { text: 'İptal', style: 'cancel', onPress: onCancel },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ]);
    }
  },

  /**
   * Show a custom alert with full configuration
   * @param config - Full alert configuration
   */
  custom: (config: AlertConfig) => {
    if (alertRef.current) {
      alertRef.current.showAlert(config);
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      const buttons: AlertButton[] = [];
      
      if (config.type === 'confirm' || config.type === 'confirmDestructive') {
        buttons.push({
          text: config.cancelText ?? 'İptal',
          style: 'cancel',
          onPress: config.onCancel,
        });
        buttons.push({
          text: config.confirmText ?? 'Tamam',
          style: config.type === 'confirmDestructive' ? 'destructive' : 'default',
          onPress: config.onConfirm,
        });
      } else {
        buttons.push({
          text: config.confirmText ?? 'Tamam',
          onPress: config.onConfirm,
        });
      }
      
      Alert.alert(config.title, config.message, buttons);
    }
  },

  /**
   * Hide the currently visible alert
   * Only works when AlertProvider is mounted
   */
  hide: () => {
    if (alertRef.current) {
      alertRef.current.hideAlert();
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, cannot hide alert');
    }
  },
};
