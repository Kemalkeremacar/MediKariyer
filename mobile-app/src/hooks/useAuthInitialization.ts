import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuthInitialization = () => {
  const markUnauthenticated = useAuthStore(
    (state) => state.markUnauthenticated,
  );
  const setHydrating = useAuthStore((state) => state.setHydrating);

  useEffect(() => {
    // Basitleştirilmiş versiyon - sadece unauthenticated olarak başlat
    markUnauthenticated();
    setHydrating(false);
  }, [markUnauthenticated, setHydrating]);
};

