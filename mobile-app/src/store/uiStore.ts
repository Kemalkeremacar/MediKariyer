import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  loadingMessage?: string;
  activeModal: string | null;
  modalData: any;
  setLoading: (loading: boolean, message?: string) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingMessage: undefined,
  activeModal: null,
  modalData: null,
  setLoading: (loading, message) =>
    set({
      isLoading: loading,
      loadingMessage: message,
    }),
  openModal: (modalId, data) =>
    set({
      activeModal: modalId,
      modalData: data,
    }),
  closeModal: () =>
    set({
      activeModal: null,
      modalData: null,
    }),
}));
