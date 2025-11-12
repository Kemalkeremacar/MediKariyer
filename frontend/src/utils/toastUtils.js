/**
 * @file toastUtils.js
 * @description Toast Utilities - Toast notification yönetimi
 * 
 * Bu dosya, uygulama genelinde kullanılan toast notification'larını
 * yönetmek için yardımcı fonksiyonlar sağlar. Sonner kütüphanesini
 * kullanarak toast gösterimi yapar.
 * 
 * Ana Özellikler:
 * - Toast tipleri: Success, error, warning, info, loading
 * - Promise tabanlı toast: Promise durumuna göre otomatik toast
 * - Custom toast: Özel component gösterimi
 * - Onay modal'ı: Toast üzerinden onay modal'ı gösterimi
 * - Toast yönetimi: Dismiss, dismissAll fonksiyonları
 * 
 * Toast Tipleri:
 * - success: Başarı mesajları (5 saniye)
 * - error: Hata mesajları (7 saniye)
 * - warning: Uyarı mesajları (6 saniye)
 * - info: Bilgi mesajları (5 saniye)
 * - loading: Yükleme mesajları (sonsuz, manuel kapatılmalı)
 * 
 * Fonksiyonlar:
 * - success: Başarı toast'ı gösterir
 * - error: Hata toast'ı gösterir
 * - warning: Uyarı toast'ı gösterir
 * - info: Bilgi toast'ı gösterir
 * - loading: Yükleme toast'ı gösterir
 * - promise: Promise durumuna göre toast gösterir
 * - dismiss: Belirli bir toast'ı kapatır
 * - dismissAll: Tüm toast'ları kapatır
 * - custom: Özel component toast'ı gösterir
 * - confirm: Onay modal'ı gösterir (Promise döndürür)
 * 
 * Kullanım:
 * ```javascript
 * import { showToast } from '@/utils/toastUtils';
 * 
 * // Başarı mesajı
 * showToast.success('İşlem başarılı!');
 * 
 * // Hata mesajı
 * showToast.error('Bir hata oluştu!');
 * 
 * // Promise tabanlı
 * showToast.promise(
 *   apiRequest.post('/api/data', data),
 *   {
 *     loading: 'Yükleniyor...',
 *     success: 'Başarılı!',
 *     error: 'Hata oluştu!'
 *   }
 * );
 * 
 * // Onay modal'ı
 * const confirmed = await showToast.confirm({
 *   title: 'Onay',
 *   message: 'Emin misiniz?',
 *   onConfirm: () => console.log('Onaylandı'),
 *   onCancel: () => console.log('İptal edildi')
 * });
 * ```
 * 
 * Onay Modal'ı:
 * - showToast.confirm() fonksiyonu onay modal'ı gösterir
 * - Promise döndürür (true: onay, false: iptal)
 * - useUiStore üzerinden modal yönetilir
 * - Timeout desteği: Varsayılan 15 saniye
 * 
 * Toast Seçenekleri:
 * - duration: Toast süresi (ms), Infinity için manuel kapatma
 * - position: Toast pozisyonu (varsayılan: top-right)
 * - Sonner kütüphanesinin tüm seçenekleri desteklenir
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * IMPORTS - Kütüphane ve store import'ları
 * ============================================================================
 */

/**
 * Sonner toast kütüphanesi
 * 
 * Modern ve kullanıcı dostu toast notification'lar için kullanılır
 * React için optimize edilmiş toast kütüphanesi
 */
import { toast } from "sonner";

/**
 * UI Store
 * 
 * Modal yönetimi için kullanılır (onay modal'ı için)
 */
import useUiStore from '../store/uiStore';

/**
 * Toast mesaj şablonları ve formatlama fonksiyonları
 */
import { formatErrorMessage } from '@/config/toast';

// ============================================================================
// TOAST UTILITIES - Toast notification fonksiyonları
// ============================================================================

/**
 * Toast fonksiyonları objesi
 * 
 * Farklı tip toast mesajları için yardımcı fonksiyonlar
 * Tüm toast tipleri için convenience metodlar sağlar
 * 
 * @type {Object} Toast fonksiyonları objesi
 */
export const showToast = {
  /**
   * Başarı mesajı gösterir
   * 
   * Yeşil renkte başarı toast'ı gösterir
   * Varsayılan süre: 5 saniye
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri (Sonner options)
   * @returns {string|number} Toast ID'si
   * 
   * @example
   * showToast.success('İşlem başarılı!');
   */
  success: (message, options = {}) =>
    toast.success(message, {
      duration: 5000, // 5 saniye
      ...options,
    }),

  /**
   * Hata mesajı gösterir
   * 
   * Kırmızı renkte hata toast'ı gösterir
   * Varsayılan süre: 7 saniye (hata mesajları daha uzun kalmalı)
   * 
   * @param {string|Error} message - Gösterilecek mesaj veya Error objesi
   * @param {object} options - Toast seçenekleri
   * @param {string} options.defaultMessage - Varsayılan mesaj (Error objesi kullanıldığında)
   * @returns {string|number} Toast ID'si
   * 
   * @example
   * showToast.error('Bir hata oluştu!');
   * showToast.error(error, { defaultMessage: 'İşlem başarısız' });
   */
  error: (message, options = {}) => {
    const formattedMessage = typeof message === 'string' 
      ? message 
      : formatErrorMessage(message, options.defaultMessage || 'Bir hata oluştu');
    
    return toast.error(formattedMessage, {
      duration: 7000, // 7 saniye - hata mesajları daha uzun kalsın
      ...options,
    });
  },

  /**
   * Uyarı mesajı gösterir
   * 
   * Sarı/turuncu renkte uyarı toast'ı gösterir
   * Varsayılan süre: 6 saniye
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   * @returns {string|number} Toast ID'si
   * 
   * @example
   * showToast.warning('Dikkat: Bu işlem geri alınamaz!');
   */
  warning: (message, options = {}) =>
    toast.warning(message, {
      duration: 6000, // 6 saniye
      ...options,
    }),

  /**
   * Bilgi mesajı gösterir
   * 
   * Mavi renkte bilgi toast'ı gösterir
   * Varsayılan süre: 5 saniye
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   * @returns {string|number} Toast ID'si
   * 
   * @example
   * showToast.info('Yeni bir güncelleme mevcut');
   */
  info: (message, options = {}) =>
    toast.info(message, {
      duration: 5000, // 5 saniye
      ...options,
    }),

  /**
   * Yükleme mesajı gösterir
   * 
   * Loading spinner ile yükleme toast'ı gösterir
   * Varsayılan süre: Infinity (manuel kapatılmalı)
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   * @returns {string|number} Toast ID'si
   * 
   * @example
   * const toastId = showToast.loading('Yükleniyor...');
   * // İşlem tamamlandığında
   * toast.dismiss(toastId);
   */
  loading: (message, options = {}) =>
    toast.loading(message, {
      duration: Infinity, // kendiliğinden kapanmasın
      ...options,
    }),

  /**
   * Promise tabanlı toast gösterir
   * 
   * Promise durumuna göre otomatik toast gösterir
   * Loading → Success veya Error otomatik geçiş yapar
   * 
   * @param {Promise} promise - Çalıştırılacak promise
   * @param {object} messages - Loading, success, error mesajları
   * @param {string} messages.loading - Loading durumunda gösterilecek mesaj
   * @param {string|function} messages.success - Başarı durumunda gösterilecek mesaj
   * @param {string|function} messages.error - Hata durumunda gösterilecek mesaj
   * @param {object} options - Toast seçenekleri
   * @returns {Promise} Promise sonucu
   * 
   * @example
   * showToast.promise(
   *   apiRequest.post('/api/data', data),
   *   {
   *     loading: 'Yükleniyor...',
   *     success: 'Başarılı!',
   *     error: (err) => formatErrorMessage(err, 'Hata oluştu!')
   *   }
   * );
   */
  promise: (promise, { loading, success, error }, options = {}) => {
    // Error mesajını formatla (eğer fonksiyon değilse)
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
   * Belirli bir toast'ı kapatır
   * 
   * @param {string|number} id - Kapatılacak toast'ın ID'si
   * 
   * @example
   * const toastId = showToast.success('Mesaj');
   * showToast.dismiss(toastId);
   */
  dismiss: (id) => toast.dismiss(id),

  /**
   * Tüm toast'ları kapatır
   * 
   * Ekrandaki tüm aktif toast'ları kapatır
   * 
   * @example
   * showToast.dismissAll();
   */
  dismissAll: () => toast.dismiss(),

  /**
   * Custom toast gösterir
   * 
   * Özel React component'i toast olarak gösterir
   * 
   * @param {React.Component} component - Gösterilecek custom component
   * @param {object} options - Toast seçenekleri
   * @returns {string|number} Toast ID'si
   * 
   * @example
   * showToast.custom(<CustomToastComponent />, { duration: 10000 });
   */
  custom: (component, options = {}) =>
    toast.custom(component, {
      duration: 5000,
      ...options,
    }),

  /**
   * Onay modal'ı gösterir
   * 
   * Promise tabanlı onay modal'ı gösterir
   * Kullanıcı onay veya iptal seçeneğini seçtiğinde Promise resolve edilir
   * Timeout desteği: Varsayılan 15 saniye (timeout sonrası false döner)
   * 
   * @param {object} options - Modal seçenekleri
   * @param {string} options.title - Modal başlığı (varsayılan: 'Onay Gerekli')
   * @param {string} options.message - Modal mesajı (varsayılan: 'Bu işlemi onaylamak istediğinizden emin misiniz?')
   * @param {string} options.confirmText - Onay butonu metni (varsayılan: 'Onayla')
   * @param {string} options.cancelText - İptal butonu metni (varsayılan: 'İptal')
   * @param {string} options.type - Modal tipi (info, warning, error, success, varsayılan: 'info')
   * @param {string} options.size - Modal boyutu (small, medium, large, varsayılan: 'medium')
   * @param {boolean} options.closeOnBackdrop - Backdrop'a tıklayınca kapanır mı (varsayılan: true)
   * @param {boolean} options.destructive - Destructive işlem mi (varsayılan: false)
   * @param {number} options.timeout - Timeout süresi ms (varsayılan: 15000)
   * @param {Function} options.onConfirm - Onay callback fonksiyonu
   * @param {Function} options.onCancel - İptal callback fonksiyonu
   * @returns {Promise<boolean>} Kullanıcının seçimi (true: onay, false: iptal veya timeout)
   * 
   * @example
   * const confirmed = await showToast.confirm({
   *   title: 'Sil',
   *   message: 'Bu kaydı silmek istediğinizden emin misiniz?',
   *   type: 'warning',
   *   destructive: true,
   *   onConfirm: () => console.log('Onaylandı'),
   *   onCancel: () => console.log('İptal edildi')
   * });
   */
  confirm: (options = {}) => {
    /**
     * UI Store'dan openModal fonksiyonunu al
     */
    const { openModal } = useUiStore.getState();
    
    /**
     * Promise döndür
     * 
     * Kullanıcı onay veya iptal seçeneğini seçtiğinde resolve edilir
     */
    return new Promise((resolve) => {
      /**
       * Timeout ayarla
       * 
       * Belirtilen süre içinde kullanıcı seçim yapmazsa
       * otomatik olarak false döndürülür
       */
      const timeoutId = setTimeout(() => {
        /**
         * Timeout durumunda false döndür
         * 
         * Kullanıcı seçim yapmadıysa iptal edilmiş sayılır
         */
        resolve(false); // Timeout durumunda false döndür
      }, options.timeout || 15000); // 15 saniye timeout

      /**
       * Modal'ı aç
       * 
       * useUiStore üzerinden confirmation modal'ı açılır
       */
      openModal('confirmation', {
        /**
         * Modal props'ları
         */
        title: options.title || 'Onay Gerekli',
        message: options.message || 'Bu işlemi onaylamak istediğinizden emin misiniz?',
        confirmText: options.confirmText || 'Onayla',
        cancelText: options.cancelText || 'İptal',
        type: options.type || 'info',
        size: options.size || 'medium',
        closeOnBackdrop: options.closeOnBackdrop !== false,
        destructive: options.destructive || false,
        
        /**
         * Onay callback
         * 
         * Kullanıcı onay butonuna tıkladığında çağrılır
         */
        onConfirm: () => {
          /**
           * Timeout'u temizle
           */
          clearTimeout(timeoutId);
          
          /**
           * Kullanıcının onConfirm callback'ini çağır (varsa)
           */
          options.onConfirm?.();
          
          /**
           * Promise'i true ile resolve et
           */
          resolve(true);
        },
        
        /**
         * İptal callback
         * 
         * Kullanıcı iptal butonuna tıkladığında çağrılır
         */
        onCancel: () => {
          /**
           * Timeout'u temizle
           */
          clearTimeout(timeoutId);
          
          /**
           * Kullanıcının onCancel callback'ini çağır (varsa)
           */
          options.onCancel?.();
          
          /**
           * Promise'i false ile resolve et
           */
          resolve(false);
        }
      });
    });
  },
};

// ============================================================================
// EXPORTS - Toast utilities export
// ============================================================================

/**
 * Hata mesajı formatlama fonksiyonu export
 * 
 * Diğer dosyalardan da kullanılabilir
 * toast.js'den re-export ediliyor
 */
export { formatErrorMessage };

/**
 * Default export
 * 
 * Direct import için: import showToast from '@/utils/toastUtils'
 */
export default showToast;
