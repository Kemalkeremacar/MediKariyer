/**
 * useAxiosInterceptor Hook - Stabilizasyon Faz 1
 * 
 * Navigation container ile entegre çalışan axios interceptor hook'u
 * 
 * Kullanım:
 * ```tsx
 * import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';
 * 
 * function App() {
 *   useAxiosInterceptor();
 *   return <NavigationContainer>...</NavigationContainer>;
 * }
 * ```
 * 
 * Özellikler:
 * - 401 hatası alındığında otomatik logout ve Auth ekranına yönlendirme
 * - Token refresh başarısız olduğunda otomatik logout
 * - Navigation container ile entegre çalışır
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { navigationRef } from '@/navigation/navigationRef';
import { devLog } from '@/utils/devLogger';

/**
 * Axios interceptor hook for navigation integration
 * Handles automatic logout and navigation on auth errors
 * 
 * This hook should be called once at the app root level,
 * after NavigationContainer is mounted
 */
export const useAxiosInterceptor = () => {
  const navigation = useNavigation();
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);

  useEffect(() => {
    // This hook is mainly for documentation and future extensibility
    // The actual interceptor logic is in client.ts
    // 
    // If we need to add navigation-specific logic here in the future,
    // we can listen to auth store changes and navigate accordingly
    
    devLog.log('🔧 useAxiosInterceptor: Hook initialized');
    
    // Track previous auth status to detect actual logout vs login failure
    let previousAuthStatus: 'idle' | 'authenticated' | 'unauthenticated' = 'idle';
    
    // Optional: Listen to auth status changes for navigation
    // Note: Zustand subscribe API - callback receives the entire state
    const unsubscribe = useAuthStore.subscribe((state) => {
      const currentAuthStatus = state.authStatus;
      
      // CRITICAL: Don't trigger navigation/logout on login failures
      // Login failures are handled in client.ts interceptor and should not trigger logout
      // Only trigger if we transitioned from authenticated to unauthenticated (actual logout)
      if (
        currentAuthStatus === 'unauthenticated' && 
        previousAuthStatus === 'authenticated' &&
        navigationRef.isReady()
      ) {
        devLog.log('🔧 useAxiosInterceptor: User unauthenticated (logout detected), ensuring navigation to Auth');
        // Navigation will be handled by RootNavigator based on authStatus
        // This hook is mainly for future extensibility
      } else if (
        currentAuthStatus === 'unauthenticated' && 
        previousAuthStatus !== 'authenticated'
      ) {
        // This is likely a login failure or initial state, don't log or navigate
        devLog.log('🔧 useAxiosInterceptor: User unauthenticated (login failure or initial state), skipping navigation');
      }
      
      // Update previous status
      previousAuthStatus = currentAuthStatus;
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, markUnauthenticated]);

  // Return helper functions if needed in the future
  return {
    // Future: Add helper functions here if needed
    // Example: forceLogout, checkAuthStatus, etc.
  };
};

/**
 * Standalone function to handle logout and navigation
 * Can be called from anywhere in the app
 */
export const handleAuthError = async () => {
  devLog.warn('🔒 handleAuthError: Clearing tokens and logging out');
  
  try {
    // Clear tokens
    await tokenManager.clearTokens();
    
    // Update auth store
    useAuthStore.getState().markUnauthenticated();
    
    // Navigate to Auth screen if navigation is ready
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  } catch (error) {
    devLog.error('Error during auth error handling:', error);
  }
};

