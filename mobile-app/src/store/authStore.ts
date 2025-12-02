import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStatus, AuthUser } from '@/types/auth';
import { STORAGE_KEYS } from '@/config/constants';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  isHydrating: boolean;
  setAuthState: (payload: {
    user?: AuthUser | null;
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => void;
  markUnauthenticated: () => void;
  setHydrating: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      authStatus: 'idle',
      isHydrating: true,
      setAuthState: ({ user, accessToken, refreshToken }) =>
        set((state) => {
          const nextUser = user ?? state.user;
          const nextAccessToken =
            accessToken !== undefined ? accessToken : state.accessToken;
          const nextRefreshToken =
            refreshToken !== undefined ? refreshToken : state.refreshToken;

          const isAuthenticated = Boolean(
            nextUser || nextAccessToken || nextRefreshToken,
          );

          return {
            user: nextUser ?? null,
            accessToken: nextAccessToken ?? null,
            refreshToken: nextRefreshToken ?? null,
            authStatus: isAuthenticated ? 'authenticated' : 'unauthenticated',
          };
        }),
      markUnauthenticated: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          authStatus: 'unauthenticated',
        }),
      setHydrating: (value) => set({ isHydrating: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        authStatus: state.authStatus,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrating(false);
        }
      },
    }
  )
);

