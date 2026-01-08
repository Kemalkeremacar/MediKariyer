import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/api/services/authService';
import { navigationRef } from '@/navigation/navigationRef';
import { devLog } from '@/utils/devLogger';

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      devLog.log('🔴 useLogout - Starting logout process...');
      
      try {
        // Get refresh token
        const refreshToken = await tokenManager.getRefreshToken();
        
        // Call logout API if refresh token exists
        if (refreshToken) {
          devLog.log('🔴 useLogout - Calling logout API...');
          await authService.logout(refreshToken);
          devLog.log('🔴 useLogout - Logout API call successful');
        } else {
          devLog.log('🔴 useLogout - No refresh token found, skipping API call');
        }
      } catch (error) {
        // Even if API call fails, we still want to clear local data
        devLog.warn('🔴 useLogout - Logout API call failed, continuing with local cleanup:', error);
      }
      
      // Clear tokens from secure storage
      devLog.log('🔴 useLogout - Clearing tokens...');
      await tokenManager.clearTokens();
      
      // Clear all user-scoped query cache so no data from the previous user leaks
      devLog.log('🔴 useLogout - Clearing query cache...');
      queryClient.clear();
      
      // Clear auth state
      devLog.log('🔴 useLogout - Marking unauthenticated...');
      markUnauthenticated();
      
      // CRITICAL: Set isHydrating to false after logout
      // This ensures RootNavigator shows Auth screen properly (not splash screen)
      setHydrating(false);
      devLog.log('🔴 useLogout - Hydration set to false');
      
      // CRITICAL: Reset navigation to Auth screen
      // React Navigation's initialRouteName only works on first render,
      // so we need to manually reset navigation after logout
      if (navigationRef.isReady()) {
        devLog.log('🔴 useLogout - Resetting navigation to Auth screen...');
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
        devLog.log('🔴 useLogout - Navigation reset to Auth screen');
      } else {
        devLog.warn('🔴 useLogout - Navigation ref not ready, navigation will be handled by RootNavigator');
      }
      
      // Verify state was cleared
      const currentState = useAuthStore.getState();
      devLog.log('🔴 useLogout - Final auth state:', {
        authStatus: currentState.authStatus,
        hasUser: !!currentState.user,
        isHydrating: currentState.isHydrating,
      });
    },
  });
};
