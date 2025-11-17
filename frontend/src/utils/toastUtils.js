/**
 * @file toastUtils.js
 * @description Toast notification yönetimi - Custom toast sistemi
 * 
 * Merkezi toast yönetimi ve yardımcı fonksiyonlar
 */

import { toast } from '@/components/ui/CustomToast';
import useUiStore from '../store/uiStore';
import { formatErrorMessage } from '@/config/toast';

/**
 * Toast fonksiyonları
 */
export const showToast = {
  /**
   * Başarı mesajı (yeşil, 4 saniye)
   */
  success: (message, options = {}) =>
    toast.success(message, {
      duration: 4000,
      ...options,
    }),

  /**
   * Hata mesajı (kırmızı, 5 saniye)
   */
  error: (message, options = {}) => {
    const formattedMessage = typeof message === 'string' 
      ? message 
      : formatErrorMessage(message, options.defaultMessage || 'Bir hata oluştu');
    
    return toast.error(formattedMessage, {
      duration: 5000,
      ...options,
    });
  },

  /**
   * Uyarı mesajı (turuncu, 4.5 saniye)
   */
  warning: (message, options = {}) =>
    toast.warning(message, {
      duration: 4500,
      ...options,
    }),

  /**
   * Bilgi mesajı (mavi, 4 saniye)
   */
  info: (message, options = {}) =>
    toast.info(message, {
      duration: 4000,
      ...options,
    }),

  /**
   * Yükleme mesajı (spinner, manuel kapatılmalı)
   */
  loading: (message, options = {}) =>
    toast.loading(message, {
      duration: Infinity,
      ...options,
    }),

  /**
   * Promise tabanlı toast (loading → success/error)
   */
  promise: (promise, { loading, success, error }, options = {}) => {
    const formattedError = typeof error === 'function' 
      ? error 
      : (err) => formatErrorMessage(err, error || 'Bir hata oluştu');
    
    return toast.promise(promise, {
      loading,
      success,
      error: formattedError,
      ...options,
    });
  },

  /**
   * Toast kapatma
   */
  dismiss: (id) => toast.dismiss(id),
  dismissAll: () => toast.dismiss(),

  /**
   * Custom component toast
   */
  custom: (component, options = {}) =>
    toast.custom(component, {
      duration: 5000,
      ...options,
    }),

  /**
   * Onay modal'ı (Promise döndürür)
   */
  confirm: (options = {}) => {
    const { openModal } = useUiStore.getState();
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, options.timeout || 15000);

      openModal('confirmation', {
        title: options.title || 'Onay Gerekli',
        message: options.message || 'Bu işlemi onaylamak istediğinizden emin misiniz?',
        confirmText: options.confirmText || 'Onayla',
        cancelText: options.cancelText || 'İptal',
        type: options.type || 'info',
        size: options.size || 'medium',
        closeOnBackdrop: options.closeOnBackdrop !== false,
        destructive: options.destructive || false,
        
        onConfirm: () => {
          clearTimeout(timeoutId);
          options.onConfirm?.();
          resolve(true);
        },
        
        onCancel: () => {
          clearTimeout(timeoutId);
          options.onCancel?.();
          resolve(false);
        }
      });
    });
  },
};

export { formatErrorMessage };
export default showToast;
