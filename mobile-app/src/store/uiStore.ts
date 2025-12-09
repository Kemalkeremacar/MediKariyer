import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  loadingMessage?: string;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingMessage: undefined,
  setLoading: (loading, message) =>
    set({
      isLoading: loading,
      loadingMessage: message,
    }),
}));
