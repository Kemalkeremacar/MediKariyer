/**
 * UI Store - UI state management
 * Zustand ile UI durumu yönetimi
 */

import { create } from 'zustand';

const useUiStore = create((set, get) => ({
  // Theme state
  theme: 'light',
  
  // Navigation state
  sidebarOpen: false,
  mobileMenuOpen: false,
  
  // Loading states
  globalLoading: false,
  pageLoading: false,
  
  // Notification state
  notifications: [],
  
  
  // Modal state
  modals: {},
  
  // Form state
  formErrors: {},
  formLoading: {},
  
  // Search, pagination ve filter state'leri kullanılmıyor - kaldırıldı
  
  // Actions
  
  // Theme actions
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  // Navigation actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  
  // Loading actions
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  setPageLoading: (loading) => set({ pageLoading: loading }),
  
  // Notification actions
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: new Date().toISOString()
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto remove notification
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Convenience notification methods
  showSuccess: (message, options = {}) => {
    return get().addNotification({
      type: 'success',
      message,
      ...options
    });
  },
  
  showError: (message, options = {}) => {
    return get().addNotification({
      type: 'error',
      message,
      duration: 8000,
      ...options
    });
  },
  
  showWarning: (message, options = {}) => {
    return get().addNotification({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    });
  },
  
  showInfo: (message, options = {}) => {
    return get().addNotification({
      type: 'info',
      message,
      ...options
    });
  },
  
  
  // Modal actions
  openModal: (modalId, props = {}) => set((state) => ({
    modals: {
      ...state.modals,
      [modalId]: { open: true, props }
    }
  })),
  
  closeModal: (modalId) => set((state) => ({
    modals: {
      ...state.modals,
      [modalId]: { open: false, props: {} }
    }
  })),
  
  closeAllModals: () => set({ modals: {} }),
  
  isModalOpen: (modalId) => {
    const modal = get().modals[modalId];
    return modal?.open || false;
  },
  
  getModalProps: (modalId) => {
    const modal = get().modals[modalId];
    return modal?.props || {};
  },
  
  // Confirmation modal
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
  
  // Form actions
  setFormError: (formId, field, error) => set((state) => ({
    formErrors: {
      ...state.formErrors,
      [formId]: {
        ...state.formErrors[formId],
        [field]: error
      }
    }
  })),
  
  clearFormErrors: (formId) => set((state) => ({
    formErrors: {
      ...state.formErrors,
      [formId]: {}
    }
  })),
  
  setFormLoading: (formId, loading) => set((state) => ({
    formLoading: {
      ...state.formLoading,
      [formId]: loading
    }
  })),
  
  getFormErrors: (formId) => {
    return get().formErrors[formId] || {};
  },
  
  isFormLoading: (formId) => {
    return get().formLoading[formId] || false;
  },
  
  // Search, pagination ve filter fonksiyonları kullanılmıyor - kaldırıldı
  
  // Utility actions
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
  
  // Getters
  getNotificationCount: () => get().notifications.length,
  getAlertCount: () => get().alerts.length,
  hasUnreadNotifications: () => {
    return get().notifications.some(n => !n.read);
  },
  
  // Responsive helpers
  isMobile: () => window.innerWidth < 768,
  isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024,
  
  // Accessibility helpers
  announceToScreenReader: (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}));

export default useUiStore;
