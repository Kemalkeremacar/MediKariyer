import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import apiClient from '@/api/client';

export const useAuthInitialization = () => {
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const markUnauthenticated = useAuthStore(
    (state) => state.markUnauthenticated,
  );
  const setHydrating = useAuthStore((state) => state.setHydrating);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setHydrating(true);
        
        // Token'ları al
        const { accessToken, refreshToken } = await tokenManager.getTokens();
        
        if (!accessToken) {
          // Token yok, logout
          markUnauthenticated();
          return;
        }
        
        // Token varsa, kullanıcı bilgilerini al
        try {
          const response = await apiClient.get('/auth/me');
          const user = response.data.data;
          
          setAuthState({
            user,
            accessToken,
            refreshToken,
          });
        } catch (error) {
          // Token geçersiz, logout
          console.error('Token validation error:', error);
          await tokenManager.clearTokens();
          markUnauthenticated();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        markUnauthenticated();
      } finally {
        setHydrating(false);
      }
    };

    initializeAuth();
  }, [setAuthState, markUnauthenticated, setHydrating]);
};

