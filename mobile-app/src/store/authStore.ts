/**
 * @file authStore.ts
 * @description Authentication state management
 * 
 * IMPORTANT: Tokens are NOT stored here anymore!
 * - Tokens are stored in SecureStore only (tokenManager)
 * - This store only manages user data and auth status
 * - Single source of truth for tokens: SecureStore
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
  user: AuthUser | null;
  authStatus: AuthStatus;
  isHydrating: boolean;
  setUser: (user: AuthUser | null) => void;
  setAuthStatus: (status: AuthStatus) => void;
  markAuthenticated: (user: AuthUser) => void;
  markUnauthenticated: () => void;
  setHydrating: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authStatus: 'idle',
      isHydrating: true,

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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        authStatus: state.authStatus,
      }),
      // IMPORTANT: Don't set isHydrating to false here!
      // Let useAuthInitialization handle hydration state.
      // Setting it to false here would cause stale persisted user data
      // to be used for routing before fresh user data is fetched.
      onRehydrateStorage: () => (state) => {
        // Keep isHydrating as true until useAuthInitialization completes
        // This prevents false routing based on stale persisted data
        if (state) {
          state.setHydrating(true);
        }
      },
    }
  )
);

