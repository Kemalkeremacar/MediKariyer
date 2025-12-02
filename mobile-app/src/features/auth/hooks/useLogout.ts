import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '../services/authService';

type UseLogoutOptions = Omit<
  UseMutationOptions<void, Error, void>,
  'mutationFn'
>;

/**
 * Hook for logout functionality
 * Handles logout API call, token cleanup, and auth state reset
 */
export const useLogout = (options?: UseLogoutOptions) => {
  const markUnauthenticated = useAuthStore(
    (state) => state.markUnauthenticated,
  );
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSettled: async (data, error, variables, context) => {
      // Clear tokens from secure storage
      await tokenManager.clearTokens();

      // Clear auth state
      markUnauthenticated();

      // Call user's onSettled if provided
      options?.onSettled?.(data, error, variables, context);
    },
    ...options,
  });
};
