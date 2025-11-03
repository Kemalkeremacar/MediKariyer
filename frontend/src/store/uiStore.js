/**
 * @file uiStore.js
 * @description UI Store - UI state yönetimi
 * 
 * Bu dosya, Zustand kullanarak uygulama genelindeki UI state'ini yönetir.
 * Theme, navigation, loading, notifications, modals, form states gibi
 * tüm UI durumları bu store üzerinden yönetilir.
 * 
 * Ana Özellikler:
 * - Theme yönetimi: Light/dark theme kontrolü
 * - Navigation state: Sidebar ve mobile menu durumları
 * - Loading states: Global ve page-level loading durumları
 * - Notification yönetimi: Toast notification'lar için state
 * - Modal yönetimi: Modal açma/kapama ve props yönetimi
 * - Form state: Form hataları ve loading durumları
 * - Responsive helpers: Mobile, tablet, desktop kontrol fonksiyonları
 * - Accessibility helpers: Screen reader desteği
 * 
 * State Yapısı:
 * - theme: 'light' | 'dark'
 * - sidebarOpen: Sidebar açık/kapalı durumu
 * - mobileMenuOpen: Mobil menü açık/kapalı durumu
 * - globalLoading: Global loading durumu
 * - pageLoading: Sayfa loading durumu
 * - notifications: Notification array'i
 * - modals: Modal state objesi
 * - formErrors: Form hataları objesi
 * - formLoading: Form loading durumları objesi
 * 
 * Theme Actions:
 * - setTheme: Theme'i ayarlar
 * - toggleTheme: Theme'i değiştirir
 * 
 * Navigation Actions:
 * - setSidebarOpen: Sidebar durumunu ayarlar
 * - toggleSidebar: Sidebar'ı aç/kapat
 * - setMobileMenuOpen: Mobil menü durumunu ayarlar
 * - toggleMobileMenu: Mobil menüyü aç/kapat
 * 
 * Loading Actions:
 * - setGlobalLoading: Global loading durumunu ayarlar
 * - setPageLoading: Sayfa loading durumunu ayarlar
 * 
 * Notification Actions:
 * - addNotification: Yeni notification ekler
 * - removeNotification: Notification'ı kaldırır
 * - clearNotifications: Tüm notification'ları temizler
 * - showSuccess/showError/showWarning/showInfo: Convenience metodlar
 * 
 * Modal Actions:
 * - openModal: Modal açar
 * - closeModal: Modal kapatır
 * - closeAllModals: Tüm modalleri kapatır
 * - isModalOpen: Modal açık mı kontrol eder
 * - getModalProps: Modal props'unu döndürür
 * - showConfirm: Onay modal'ı gösterir (Promise döndürür)
 * 
 * Form Actions:
 * - setFormError: Form hatası ekler
 * - clearFormErrors: Form hatalarını temizler
 * - setFormLoading: Form loading durumunu ayarlar
 * - getFormErrors: Form hatalarını döndürür
 * - isFormLoading: Form loading durumunu kontrol eder
 * 
 * Utility Functions:
 * - reset: Tüm state'i sıfırlar
 * - getNotificationCount: Notification sayısını döndürür
 * - hasUnreadNotifications: Okunmamış notification var mı kontrol eder
 * - isMobile/isTablet/isDesktop: Responsive kontrol fonksiyonları
 * - announceToScreenReader: Screen reader'a mesaj gönderir
 * 
 * Kullanım:
 * ```javascript
 * import useUiStore from '@/store/uiStore';
 * 
 * const { 
 *   theme, 
 *   sidebarOpen, 
 *   setTheme, 
 *   toggleSidebar,
 *   showSuccess,
 *   showError 
 * } = useUiStore();
 * 
 * // Notification göster
 * showSuccess('İşlem başarılı!');
 * 
 * // Modal aç
 * openModal('confirmDialog', { title: 'Onay', message: 'Emin misiniz?' });
 * ```
 * 
 * Not: Search, pagination ve filter state'leri kullanılmamaktadır
 * (sayfa bazlı state management tercih edilmiştir).
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * IMPORTS - Kütüphane import'ları
 * ============================================================================
 */

/**
 * Zustand store oluşturucu fonksiyonu
 * State management için kullanılır
 */
import { create } from 'zustand';

// ============================================================================
// UI STORE - Global UI state yönetimi
// ============================================================================

/**
 * UI Store Instance
 * 
 * Uygulama genelindeki UI state'ini yönetir
 * Theme, navigation, loading, notifications, modals, form states
 * gibi tüm UI durumları bu store üzerinden yönetilir
 * 
 * Not: Persist middleware kullanılmaz (UI state geçicidir)
 * 
 * @type {Object} Zustand store instance
 */
const useUiStore = create((set, get) => ({
  // ======================================================================
  // STATE - State değişkenleri
  // ======================================================================
  
  /**
   * Theme state
   * 
   * Uygulama tema durumu
   * 'light': Açık tema
   * 'dark': Koyu tema
   * 
   * @type {string} 'light' | 'dark'
   */
  theme: 'light',
  
  /**
   * Navigation state
   */
  
  /**
   * Sidebar açık/kapalı durumu
   * 
   * Admin ve diğer sayfalarda sidebar'ın açık olup olmadığını belirtir
   * 
   * @type {boolean} Sidebar açık ise true
   */
  sidebarOpen: false,
  
  /**
   * Mobil menü açık/kapalı durumu
   * 
   * Mobil cihazlarda menünün açık olup olmadığını belirtir
   * 
   * @type {boolean} Mobil menü açık ise true
   */
  mobileMenuOpen: false,
  
  /**
   * Loading states
   */
  
  /**
   * Global loading durumu
   * 
   * Uygulama genelinde bir işlem yapılırken true olur
   * Örn: Sayfa geçişleri, büyük veri yüklemeleri
   * 
   * @type {boolean} Global loading aktif ise true
   */
  globalLoading: false,
  
  /**
   * Sayfa loading durumu
   * 
   * Belirli bir sayfanın yüklenmesi sırasında true olur
   * 
   * @type {boolean} Sayfa loading aktif ise true
   */
  pageLoading: false,
  
  /**
   * Notification state
   */
  
  /**
   * Notification array'i
   * 
   * Tüm aktif notification'ları tutar
   * Format: [{ id, type, message, duration, timestamp, read }, ...]
   * 
   * @type {Array<Object>} Notification'ların listesi
   */
  notifications: [],
  
  /**
   * Modal state
   */
  
  /**
   * Modal state objesi
   * 
   * Her modal için state ve props tutar
   * Format: { [modalId]: { open: boolean, props: Object } }
   * 
   * @type {Object} Modal state objesi
   */
  modals: {},
  
  /**
   * Form state
   */
  
  /**
   * Form hataları objesi
   * 
   * Her form için field bazlı hataları tutar
   * Format: { [formId]: { [fieldName]: errorMessage } }
   * 
   * @type {Object} Form hataları objesi
   */
  formErrors: {},
  
  /**
   * Form loading durumları objesi
   * 
   * Her form için loading durumunu tutar
   * Format: { [formId]: boolean }
   * 
   * @type {Object} Form loading durumları objesi
   */
  formLoading: {},
  
  /**
   * Not: Search, pagination ve filter state'leri kullanılmıyor
   * Sayfa bazlı state management tercih edilmiştir
   */
  
  // ======================================================================
  // ACTIONS - State değiştiren fonksiyonlar
  // ======================================================================
  
  /**
   * Theme actions
   */
  
  /**
   * Theme'i ayarlar
   * 
   * @param {string} theme - 'light' veya 'dark'
   */
  setTheme: (theme) => set({ theme }),
  
  /**
   * Theme'i değiştirir (toggle)
   * 
   * Light ise dark, dark ise light yapar
   */
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  /**
   * Navigation actions
   */
  
  /**
   * Sidebar durumunu ayarlar
   * 
   * @param {boolean} open - Sidebar açık ise true
   */
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  /**
   * Sidebar'ı aç/kapat (toggle)
   */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  /**
   * Mobil menü durumunu ayarlar
   * 
   * @param {boolean} open - Mobil menü açık ise true
   */
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  
  /**
   * Mobil menüyü aç/kapat (toggle)
   */
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  
  /**
   * Loading actions
   */
  
  /**
   * Global loading durumunu ayarlar
   * 
   * @param {boolean} loading - Global loading aktif ise true
   */
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  /**
   * Sayfa loading durumunu ayarlar
   * 
   * @param {boolean} loading - Sayfa loading aktif ise true
   */
  setPageLoading: (loading) => set({ pageLoading: loading }),
  
  /**
   * Notification actions
   */
  
  /**
   * Yeni notification ekler
   * 
   * Notification'a unique ID ve timestamp ekler
   * Duration > 0 ise otomatik olarak kaldırılır
   * 
   * @param {Object} notification - Notification objesi
   * @param {string} notification.type - Notification tipi (success, error, warning, info)
   * @param {string} notification.message - Notification mesajı
   * @param {number} notification.duration - Otomatik kaldırma süresi (ms, 0 ise kaldırılmaz)
   * @returns {string} Notification ID'si
   */
  addNotification: (notification) => {
    /**
     * Unique ID oluştur
     * 
     * Timestamp kullanarak unique ID üretilir
     */
    const id = Date.now().toString();
    
    /**
     * Notification objesini oluştur
     * 
     * Default değerler:
     * - type: 'info'
     * - duration: 5000ms (5 saniye)
     * - timestamp: Şu anki zaman (ISO string)
     */
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: new Date().toISOString()
    };
    
    /**
     * Notification'ı state'e ekle
     */
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    /**
     * Otomatik kaldırma
     * 
     * Duration > 0 ise belirtilen süre sonra notification kaldırılır
     */
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    /**
     * Notification ID'sini döndür
     * 
     * Manuel kaldırma için kullanılabilir
     */
    return id;
  },
  
  /**
   * Notification'ı kaldırır
   * 
   * @param {string} id - Kaldırılacak notification'ın ID'si
   */
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  /**
   * Tüm notification'ları temizler
   */
  clearNotifications: () => set({ notifications: [] }),
  
  /**
   * Convenience notification methods
   * 
   * Hızlı kullanım için convenience metodlar
   */
  
  /**
   * Success notification gösterir
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {Object} options - Ek seçenekler
   * @returns {string} Notification ID'si
   */
  showSuccess: (message, options = {}) => {
    return get().addNotification({
      type: 'success',
      message,
      ...options
    });
  },
  
  /**
   * Error notification gösterir
   * 
   * Default duration: 8000ms (8 saniye)
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {Object} options - Ek seçenekler
   * @returns {string} Notification ID'si
   */
  showError: (message, options = {}) => {
    return get().addNotification({
      type: 'error',
      message,
      duration: 8000,
      ...options
    });
  },
  
  /**
   * Warning notification gösterir
   * 
   * Default duration: 6000ms (6 saniye)
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {Object} options - Ek seçenekler
   * @returns {string} Notification ID'si
   */
  showWarning: (message, options = {}) => {
    return get().addNotification({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    });
  },
  
  /**
   * Info notification gösterir
   * 
   * @param {string} message - Gösterilecek mesaj
   * @param {Object} options - Ek seçenekler
   * @returns {string} Notification ID'si
   */
  showInfo: (message, options = {}) => {
    return get().addNotification({
      type: 'info',
      message,
      ...options
    });
  },
  
  /**
   * Modal actions
   */
  
  /**
   * Modal açar
   * 
   * @param {string} modalId - Modal unique ID'si
   * @param {Object} props - Modal props'ları
   */
  openModal: (modalId, props = {}) => set((state) => ({
    modals: {
      ...state.modals,
      [modalId]: { open: true, props }
    }
  })),
  
  /**
   * Modal kapatır
   * 
   * @param {string} modalId - Kapatılacak modal'ın ID'si
   */
  closeModal: (modalId) => set((state) => ({
    modals: {
      ...state.modals,
      [modalId]: { open: false, props: {} }
    }
  })),
  
  /**
   * Tüm modal'ları kapatır
   */
  closeAllModals: () => set({ modals: {} }),
  
  /**
   * Modal açık mı kontrol eder
   * 
   * @param {string} modalId - Kontrol edilecek modal'ın ID'si
   * @returns {boolean} Modal açıksa true
   */
  isModalOpen: (modalId) => {
    const modal = get().modals[modalId];
    return modal?.open || false;
  },
  
  /**
   * Modal props'unu döndürür
   * 
   * @param {string} modalId - Props'u alınacak modal'ın ID'si
   * @returns {Object} Modal props'ları
   */
  getModalProps: (modalId) => {
    const modal = get().modals[modalId];
    return modal?.props || {};
  },
  
  /**
   * Confirmation modal gösterir
   * 
   * Promise döndürür, onConfirm veya onCancel çağrıldığında resolve edilir
   * 
   * @param {string} title - Modal başlığı
   * @param {string} message - Modal mesajı
   * @param {Object} options - Ek seçenekler
   * @returns {Promise<boolean>} Onay verildiyse true, iptal edildiyse false
   */
  showConfirm: (title, message, options = {}) => {
    return new Promise((resolve) => {
      const modalId = 'confirmation';
      get().openModal(modalId, {
        title,
        message,
        onConfirm: () => {
          get().closeModal(modalId);
          resolve(true);
        },
        onCancel: () => {
          get().closeModal(modalId);
          resolve(false);
        },
        ...options
      });
    });
  },
  
  /**
   * Form actions
   */
  
  /**
   * Form hatası ekler
   * 
   * @param {string} formId - Form ID'si
   * @param {string} field - Field adı
   * @param {string} error - Hata mesajı
   */
  setFormError: (formId, field, error) => set((state) => ({
    formErrors: {
      ...state.formErrors,
      [formId]: {
        ...state.formErrors[formId],
        [field]: error
      }
    }
  })),
  
  /**
   * Form hatalarını temizler
   * 
   * @param {string} formId - Form ID'si
   */
  clearFormErrors: (formId) => set((state) => ({
    formErrors: {
      ...state.formErrors,
      [formId]: {}
    }
  })),
  
  /**
   * Form loading durumunu ayarlar
   * 
   * @param {string} formId - Form ID'si
   * @param {boolean} loading - Loading durumu
   */
  setFormLoading: (formId, loading) => set((state) => ({
    formLoading: {
      ...state.formLoading,
      [formId]: loading
    }
  })),
  
  /**
   * Form hatalarını döndürür
   * 
   * @param {string} formId - Form ID'si
   * @returns {Object} Form hataları objesi
   */
  getFormErrors: (formId) => {
    return get().formErrors[formId] || {};
  },
  
  /**
   * Form loading durumunu kontrol eder
   * 
   * @param {string} formId - Form ID'si
   * @returns {boolean} Form loading aktif ise true
   */
  isFormLoading: (formId) => {
    return get().formLoading[formId] || false;
  },
  
  /**
   * Not: Search, pagination ve filter fonksiyonları kullanılmıyor
   * Sayfa bazlı state management tercih edilmiştir
   */
  
  /**
   * Utility actions
   */
  
  /**
   * Store'u sıfırlar
   * 
   * Tüm state'i başlangıç değerlerine döndürür
   * 
   * Not: reset() fonksiyonu kullanılmayan state'leri de içerir
   * (searchQuery, searchResults, vb.) - bu alanlar gelecekte kaldırılabilir
   */
  reset: () => set({
    sidebarOpen: false,
    mobileMenuOpen: false,
    globalLoading: false,
    pageLoading: false,
    notifications: [],
    alerts: [],
    modals: {},
    formErrors: {},
    formLoading: {},
    searchQuery: '',
    searchResults: [],
    searchLoading: false,
    currentPage: 1,
    activeFilters: {}
  }),
  
  /**
   * Getters
   */
  
  /**
   * Notification sayısını döndürür
   * 
   * @returns {number} Aktif notification sayısı
   */
  getNotificationCount: () => get().notifications.length,
  
  /**
   * Alert sayısını döndürür
   * 
   * Not: alerts state'i kullanılmıyor, bu fonksiyon gelecekte kaldırılabilir
   * 
   * @returns {number} Alert sayısı
   */
  getAlertCount: () => get().alerts?.length || 0,
  
  /**
   * Okunmamış notification var mı kontrol eder
   * 
   * @returns {boolean} Okunmamış notification varsa true
   */
  hasUnreadNotifications: () => {
    return get().notifications.some(n => !n.read);
  },
  
  /**
   * Responsive helpers
   */
  
  /**
   * Mobil cihaz kontrolü
   * 
   * Ekran genişliği < 768px ise mobil cihaz
   * 
   * @returns {boolean} Mobil cihaz ise true
   */
  isMobile: () => window.innerWidth < 768,
  
  /**
   * Tablet cihaz kontrolü
   * 
   * Ekran genişliği >= 768px ve < 1024px ise tablet
   * 
   * @returns {boolean} Tablet cihaz ise true
   */
  isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  
  /**
   * Desktop cihaz kontrolü
   * 
   * Ekran genişliği >= 1024px ise desktop
   * 
   * @returns {boolean} Desktop cihaz ise true
   */
  isDesktop: () => window.innerWidth >= 1024,
  
  /**
   * Accessibility helpers
   */
  
  /**
   * Screen reader'a mesaj gönderir
   * 
   * Accessibility için screen reader'a mesaj bildirir
   * aria-live="polite" ile mesaj ekrana eklenir ve 1 saniye sonra kaldırılır
   * 
   * @param {string} message - Screen reader'a gönderilecek mesaj
   */
  announceToScreenReader: (message) => {
    /**
     * Announcement elementi oluştur
     * 
     * aria-live="polite": Ekran okuyucuya mesajı bildirir
     * aria-atomic="true": Tüm mesajı bir bütün olarak okur
     * className="sr-only": Ekranda görünmez ama screen reader okur
     */
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    /**
     * Element'i DOM'a ekle
     */
    document.body.appendChild(announcement);
    
    /**
     * 1 saniye sonra elementi kaldır
     * 
     * Mesaj okunduktan sonra DOM'dan temizlenir
     */
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}));

// ============================================================================
// EXPORTS - Store export
// ============================================================================

/**
 * Default export
 * 
 * Direct import için: import useUiStore from '@/store/uiStore'
 */
export default useUiStore;
