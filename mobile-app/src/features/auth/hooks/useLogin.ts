import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import { navigationRef } from '@/navigation/navigationRef';
import type { LoginPayload, AuthResponsePayload } from '@/types/auth';

interface UseLoginCallbacks {
  onSuccess?: (data: AuthResponsePayload) => void | Promise<void>;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/**
 * Hook for login functionality
 * Handles authentication, token storage, and auth state updates
 */
export const useLogin = (callbacks?: UseLoginCallbacks) => {
  const setAuthState = useAuthStore((state) => state.markAuthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data) => {
      console.log('🔐 useLogin onSuccess - Starting auth setup...');
      console.log('🔐 useLogin onSuccess - User data:', JSON.stringify(data.user, null, 2));
      
      // Core auth side-effects (single source of truth)
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      console.log('🔐 useLogin onSuccess - Tokens saved');
      
      setAuthState(data.user);
      console.log('🔐 useLogin onSuccess - Auth state updated');
      
      // CRITICAL: Set isHydrating to false after successful login
      // Otherwise RootNavigator will keep showing Auth screen
      setHydrating(false);
      console.log('🔐 useLogin onSuccess - Hydration set to false');
      
      // Verify state was updated
      const currentState = useAuthStore.getState();
      console.log('🔐 useLogin onSuccess - Current auth state:', {
        authStatus: currentState.authStatus,
        hasUser: !!currentState.user,
        userId: currentState.user?.id,
        isActive: currentState.user?.is_active,
        isApproved: currentState.user?.is_approved,
        isHydrating: currentState.isHydrating,
      });

      // Clear all user-scoped query cache so the new user never sees stale data
      // (e.g. previous user's profile, applications, notifications)
      queryClient.clear();

      // CRITICAL: Reset navigation to App screen after successful login
      // This ensures navigation happens immediately after state update
      // RootNavigator's state-based navigation should handle this, but we do it manually
      // to ensure immediate navigation (React Navigation's initialRouteName only works on first render)
      // Use requestAnimationFrame to ensure state updates are flushed before navigation
      requestAnimationFrame(() => {
        if (navigationRef.isReady()) {
          // Type-safe checks for is_approved and is_active
          const isApproved = 
            data.user.is_approved === true || 
            data.user.is_approved === 1 || 
            (typeof data.user.is_approved === 'string' && (data.user.is_approved === 'true' || data.user.is_approved === '1'));
          const isActive = 
            data.user.is_active === true || 
            data.user.is_active === 1 || 
            (typeof data.user.is_active === 'string' && (data.user.is_active === 'true' || data.user.is_active === '1'));
          const isAdmin = data.user.role === 'admin';
          
          if (isActive && (isApproved || isAdmin)) {
            console.log('🔐 useLogin onSuccess - Resetting navigation to App screen');
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'App' }],
            });
            console.log('🔐 useLogin onSuccess - Navigation reset completed');
          } else {
            console.log('🔐 useLogin onSuccess - User not active/approved, skipping navigation reset');
          }
        } else {
          console.log('🔐 useLogin onSuccess - Navigation ref not ready, RootNavigator will handle navigation');
        }
      });

      // Let consumer run additional side-effects
      await callbacks?.onSuccess?.(data);
      console.log('🔐 useLogin onSuccess - Callbacks completed');
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
};
