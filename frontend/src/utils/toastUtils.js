/**
 * Toast Utilities
 * Toast fonksiyonları ve yardımcı metodlar
 */

import { toast } from "sonner";
import useUiStore from '../store/uiStore';

/**
 * Toast fonksiyonları
 * Farklı tip toast mesajları için yardımcı fonksiyonlar
 */
export const showToast = {
  /**
   * Başarı mesajı gösterir
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   */
  success: (message, options = {}) =>
    toast.success(message, {
      duration: 5000, // 5 saniye
      ...options,
    }),

  /**
   * Hata mesajı gösterir
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   */
  error: (message, options = {}) =>
    toast.error(message, {
      duration: 7000, // 7 saniye - hata mesajları daha uzun kalsın
      ...options,
    }),

  /**
   * Uyarı mesajı gösterir
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   */
  warning: (message, options = {}) =>
    toast.warning(message, {
      duration: 6000, // 6 saniye
      ...options,
    }),

  /**
   * Bilgi mesajı gösterir
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   */
  info: (message, options = {}) =>
    toast.info(message, {
      duration: 5000, // 5 saniye
      ...options,
    }),

  /**
   * Yükleme mesajı gösterir
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   */
  loading: (message, options = {}) =>
    toast.loading(message, {
      duration: Infinity, // kendiliğinden kapanmasın
      ...options,
    }),

  /**
   * Promise tabanlı toast gösterir
   * @param {Promise} promise - Çalıştırılacak promise
   * @param {object} messages - Loading, success, error mesajları
   * @param {object} options - Toast seçenekleri
   */
  promise: (promise, { loading, success, error }, options = {}) =>
    toast.promise(promise, {
      loading,
      success,
      error,
      ...options,
    }),

  /**
   * Belirli bir toast'ı kapatır
   * @param {string|number} id - Toast ID'si
   */
  dismiss: (id) => toast.dismiss(id),

  /**
   * Tüm toast'ları kapatır
   */
  dismissAll: () => toast.dismiss(),

  /**
   * Custom toast gösterir
   * @param {React.Component} component - Gösterilecek custom component
   * @param {object} options - Toast seçenekleri
   */
  custom: (component, options = {}) =>
    toast.custom(component, {
      duration: 5000,
      ...options,
    }),

  /**
   * Onay modalı gösterir
   * @param {object} options - Modal seçenekleri
   * @returns {Promise<boolean>} - Kullanıcının seçimi (true: onay, false: iptal)
   */
  confirm: (options = {}) => {
    const { openModal } = useUiStore.getState();
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false); // Timeout durumunda false döndür
      }, options.timeout || 15000); // 15 saniye timeout

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

export default showToast;
