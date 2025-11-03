/**
 * Modal Store - Zustand
 * 
 * Global modal state yönetimi için
 * Birden fazla modal kontrolü gereken durumlar için
 */

import { create } from 'zustand';

export const useModalStore = create((set) => ({
  // Açık modal ID'leri (stacking için array)
  openModals: [],
  
  // Modal aç
  openModal: (modalId, data = null) => set((state) => {
    // Eğer zaten açıksa stack'e ekleme
    if (state.openModals.some(m => m.id === modalId)) {
      return state;
    }
    return {
      openModals: [...state.openModals, { id: modalId, data }]
    };
  }),
  
  // Modal kapat
  closeModal: (modalId) => set((state) => ({
    openModals: state.openModals.filter(m => m.id !== modalId)
  })),
  
  // Tüm modalleri kapat
  closeAllModals: () => set({ openModals: [] }),
  
  // Modal açık mı kontrol et
  isModalOpen: (modalId) => {
    const state = useModalStore.getState();
    return state.openModals.some(m => m.id === modalId);
  },
  
  // Modal data'sını al
  getModalData: (modalId) => {
    const state = useModalStore.getState();
    const modal = state.openModals.find(m => m.id === modalId);
    return modal?.data || null;
  },
  
  // En üstteki modal (stacking için)
  topModal: () => {
    const state = useModalStore.getState();
    return state.openModals[state.openModals.length - 1] || null;
  }
}));

