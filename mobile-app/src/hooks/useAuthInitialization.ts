import { useEffect } from 'react';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth';

export const useAuthInitialization = () => {
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const markUnauthenticated = useAuthStore(
    (state) => state.markUnauthenticated,
  );
  const setHydrating = useAuthStore((state) => state.setHydrating);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { accessToken, refreshToken } = await tokenManager.getTokens();
        
        if (!accessToken || !refreshToken) {
          markUnauthenticated();
          return;
        }

        // Token'lar varsa user bilgisini çek
        try {
          const user = await authService.getMe();
          setAuthState({ user, accessToken, refreshToken });
        } catch (error) {
          // Token geçersizse veya user bulunamazsa logout yap
          console.log('Token validation failed, clearing auth state:', error);
          await tokenManager.clearTokens();
          markUnauthenticated();
        }
      } catch (error) {
        console.error('Auth hydration error:', error);
        markUnauthenticated();
      } finally {
        setHydrating(false);
      }
    };

    hydrate();
  }, [markUnauthenticated, setAuthState, setHydrating]);
};

