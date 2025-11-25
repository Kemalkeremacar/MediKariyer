import { useEffect } from 'react';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';

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
        if (accessToken && refreshToken) {
          setAuthState({ accessToken, refreshToken });
        } else {
          markUnauthenticated();
        }
      } finally {
        setHydrating(false);
      }
    };

    hydrate();
  }, [markUnauthenticated, setAuthState, setHydrating]);
};

