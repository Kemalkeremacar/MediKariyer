/**
 * @file modalStore.js
 * @description Modal Store - Global modal state yönetimi
 * 
 * Bu dosya, Zustand kullanarak global modal state'ini yönetir.
 * Birden fazla modal'ın aynı anda açık olabileceği durumlar için
 * modal stacking desteği sağlar.
 * 
 * Ana Özellikler:
 * - Modal stacking: Birden fazla modal'ı aynı anda yönetme
 * - Modal state: Her modal için unique ID ve data
 * - Modal kontrolü: Açma, kapatma, durum kontrolü
 * - Top modal: En üstteki modal'ı bulma
 * 
 * State Yapısı:
 * - openModals: Açık modal'ların array'i [{ id, data }, ...]
 * 
 * Actions:
 * - openModal: Yeni modal açar (stack'e ekler)
 * - closeModal: Modal'ı kapatır (stack'ten çıkarır)
 * - closeAllModals: Tüm modal'ları kapatır
 * - isModalOpen: Modal açık mı kontrol eder
 * - getModalData: Modal data'sını döndürür
 * - topModal: En üstteki modal'ı döndürür
 * 
 * Modal Stacking:
 * - Modal'lar stack yapısında saklanır
 * - Yeni modal açıldığında stack'in en üstüne eklenir
 * - Modal kapatıldığında stack'ten çıkarılır
 * - Aynı ID'ye sahip modal zaten açıksa tekrar eklenmez
 * 
 * Kullanım:
 * ```javascript
 * import { useModalStore } from '@/store/modalStore';
 * 
 * const { openModal, closeModal, isModalOpen } = useModalStore();
 * 
 * // Modal aç
 * openModal('confirmDialog', { title: 'Onay', message: 'Emin misiniz?' });
 * 
 * // Modal kontrol et
 * if (isModalOpen('confirmDialog')) {
 *   // Modal açık
 * }
 * 
 * // Modal kapat
 * closeModal('confirmDialog');
 * ```
 * 
 * Not: Bu store, uiStore'daki modal yönetiminden farklıdır.
 * uiStore modal state'i yönetirken, bu store modal stacking için kullanılır.
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
// MODAL STORE - Global modal state yönetimi
// ============================================================================

/**
 * Modal Store Instance
 * 
 * Global modal state'ini yönetir
 * Birden fazla modal'ın aynı anda açık olabileceği durumlar için
 * modal stacking desteği sağlar
 * 
 * Not: Persist middleware kullanılmaz (modal state geçicidir)
 * 
 * @type {Object} Zustand store instance
 */
export const useModalStore = create((set) => ({
  // ======================================================================
  // STATE - State değişkenleri
  // ======================================================================
  
  /**
   * Açık modal'ların array'i
   * 
   * Modal stacking için kullanılır
   * Her modal unique bir ID ve data objesi içerir
   * 
   * Format: [{ id: string, data: any }, ...]
   * 
   * @type {Array<Object>} Açık modal'ların listesi
   */
  openModals: [],
  
  // ======================================================================
  // ACTIONS - State değiştiren fonksiyonlar
  // ======================================================================
  
  /**
   * Modal açar
   * 
   * Yeni modal'ı stack'e ekler
   * Eğer aynı ID'ye sahip modal zaten açıksa tekrar eklenmez
   * 
   * @param {string} modalId - Modal unique ID'si
   * @param {any} data - Modal'a geçirilecek data (opsiyonel)
   */
  openModal: (modalId, data = null) => set((state) => {
    /**
     * Aynı ID'ye sahip modal zaten açıksa stack'e ekleme
     * 
     * Duplicate modal'ları önler
     */
    if (state.openModals.some(m => m.id === modalId)) {
      return state;
    }
    
    /**
     * Yeni modal'ı stack'e ekle
     * 
     * Array'in sonuna eklenir (stack yapısı)
     * En son eklenen modal en üstte olur
     */
    return {
      openModals: [...state.openModals, { id: modalId, data }]
    };
  }),
  
  /**
   * Modal kapatır
   * 
   * Belirtilen ID'ye sahip modal'ı stack'ten çıkarır
   * 
   * @param {string} modalId - Kapatılacak modal'ın ID'si
   */
  closeModal: (modalId) => set((state) => ({
    /**
     * Modal'ı stack'ten çıkar
     * 
     * Filter ile belirtilen ID'ye sahip modal kaldırılır
     */
    openModals: state.openModals.filter(m => m.id !== modalId)
  })),
  
  /**
   * Tüm modal'ları kapatır
   * 
   * Stack'teki tüm modal'ları temizler
   */
  closeAllModals: () => set({ openModals: [] }),
  
  // ======================================================================
  // GETTERS - State okuma fonksiyonları
  // ======================================================================
  
  /**
   * Modal açık mı kontrol eder
   * 
   * Belirtilen ID'ye sahip modal stack'te var mı kontrol eder
   * 
   * @param {string} modalId - Kontrol edilecek modal'ın ID'si
   * @returns {boolean} Modal açıksa true
   */
  isModalOpen: (modalId) => {
    /**
     * State'i al
     * 
     * getState() ile store'un current state'ini alırız
     */
    const state = useModalStore.getState();
    
    /**
     * Modal varlık kontrolü
     * 
     * Array'de belirtilen ID'ye sahip modal var mı kontrol et
     */
    return state.openModals.some(m => m.id === modalId);
  },
  
  /**
   * Modal data'sını döndürür
   * 
   * Belirtilen ID'ye sahip modal'ın data objesini döndürür
   * Modal yoksa null döndürür
   * 
   * @param {string} modalId - Data'sı alınacak modal'ın ID'si
   * @returns {any|null} Modal data'sı veya null
   */
  getModalData: (modalId) => {
    /**
     * State'i al
     */
    const state = useModalStore.getState();
    
    /**
     * Modal'ı bul
     * 
     * Array'de belirtilen ID'ye sahip modal'ı bul
     */
    const modal = state.openModals.find(m => m.id === modalId);
    
    /**
     * Data'yı döndür veya null
     * 
     * Modal varsa data'sını döndür, yoksa null
     */
    return modal?.data || null;
  },
  
  /**
   * En üstteki modal'ı döndürür
   * 
   * Stack yapısında en son eklenen (en üstteki) modal'ı döndürür
   * Modal yoksa null döndürür
   * 
   * Kullanım: Modal stacking durumlarında en üstteki modal'ı bulmak için
   * 
   * @returns {Object|null} En üstteki modal objesi veya null
   */
  topModal: () => {
    /**
     * State'i al
     */
    const state = useModalStore.getState();
    
    /**
     * En üstteki modal'ı döndür
     * 
     * Array'in son elemanı en üstteki modal'dır (LIFO - Last In First Out)
     * Array boşsa null döndür
     */
    return state.openModals[state.openModals.length - 1] || null;
  }
}));

