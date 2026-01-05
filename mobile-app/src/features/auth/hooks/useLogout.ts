import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/api/services/authService';
import { navigationRef } from '@/navigation/navigationRef';

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔴 useLogout - Starting logout process...');
      
      try {
        // Get refresh token
        const refreshToken = await tokenManager.getRefreshToken();
        
        // Call logout API if refresh token exists
        if (refreshToken) {
          console.log('🔴 useLogout - Calling logout API...');
          await authService.logout(refreshToken);
          console.log('🔴 useLogout - Logout API call successful');
        } else {
          console.log('🔴 useLogout - No refresh token found, skipping API call');
        }
      } catch (error) {
        // Even if API call fails, we still want to clear local data
        console.warn('🔴 useLogout - Logout API call failed, continuing with local cleanup:', error);
      }
      
      // Clear tokens from secure storage
      console.log('🔴 useLogout - Clearing tokens...');
      await tokenManager.clearTokens();
      
      // Clear all user-scoped query cache so no data from the previous user leaks
      console.log('🔴 useLogout - Clearing query cache...');
      queryClient.clear();
      
      // Clear auth state
      console.log('🔴 useLogout - Marking unauthenticated...');
      markUnauthenticated();
      
      // CRITICAL: Set isHydrating to false after logout
      // This ensures RootNavigator shows Auth screen properly (not splash screen)
      setHydrating(false);
      console.log('🔴 useLogout - Hydration set to false');
      
      // CRITICAL: Reset navigation to Auth screen
      // React Navigation's initialRouteName only works on first render,
      // so we need to manually reset navigation after logout
      if (navigationRef.isReady()) {
        console.log('🔴 useLogout - Resetting navigation to Auth screen...');
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
        console.log('🔴 useLogout - Navigation reset to Auth screen');
      } else {
        console.warn('🔴 useLogout - Navigation ref not ready, navigation will be handled by RootNavigator');
      }
      
      // Verify state was cleared
      const currentState = useAuthStore.getState();
      console.log('🔴 useLogout - Final auth state:', {
        authStatus: currentState.authStatus,
        hasUser: !!currentState.user,
        isHydrating: currentState.isHydrating,
      });
    },
  });
};
