/**
 * @file authStore.ts
 * @description Kimlik doğrulama durum yönetimi (Zustand)
 * 
 * ÖNEMLİ: Token'lar artık burada saklanmıyor!
 * - Token'lar sadece SecureStore'da saklanır (tokenManager)
 * - Bu store sadece kullanıcı verilerini ve auth durumunu yönetir
 * - Token'lar için tek kaynak: SecureStore
 * 
 * Özellikler:
 * - Kullanıcı bilgilerini yönetir (user)
 * - Auth durumunu yönetir (authenticated/unauthenticated/idle)
 * - AsyncStorage ile persist edilir (offline erişim için)
 * - Hydration durumunu yönetir (uygulama başlangıcında)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStatus, AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null; // Kullanıcı bilgileri
  authStatus: AuthStatus; // Auth durumu: 'idle' | 'authenticated' | 'unauthenticated'
  isHydrating: boolean; // Uygulama başlangıcında store yükleniyor mu?
  hasSeenSplash: boolean; // Kullanıcı splash screen'i daha önce gördü mü?
  setUser: (user: AuthUser | null) => void; // Kullanıcı bilgilerini güncelle
  setAuthStatus: (status: AuthStatus) => void; // Auth durumunu güncelle
  markAuthenticated: (user: AuthUser) => void; // Kullanıcıyı authenticated olarak işaretle
  markUnauthenticated: () => void; // Kullanıcıyı unauthenticated olarak işaretle
  setHydrating: (value: boolean) => void; // Hydration durumunu güncelle
  markSplashSeen: () => void; // Splash screen görüldü olarak işaretle
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      authStatus: 'idle',
      isHydrating: true,
      hasSeenSplash: false,

      setUser: (user) =>
        set({
          user,
        }),

      setAuthStatus: (status) =>
        set({
          authStatus: status,
        }),

      markAuthenticated: (user) =>
        set({
          user,
          authStatus: 'authenticated',
        }),

      markUnauthenticated: () =>
        set({
          user: null,
          authStatus: 'unauthenticated',
        }),

      setHydrating: (value) => set({ isHydrating: value }),

      markSplashSeen: () => set({ hasSeenSplash: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        authStatus: state.authStatus,
        hasSeenSplash: state.hasSeenSplash, // Bu kalıcı olarak saklanacak
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrating(true);
        }
      },
    }
  )
);

