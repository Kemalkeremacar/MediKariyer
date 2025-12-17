import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/api/services/authService';

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Get refresh token
        const refreshToken = await tokenManager.getRefreshToken();
        
        // Call logout API if refresh token exists
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
      } catch (error) {
        // Even if API call fails, we still want to clear local data
      }
      
      // Clear tokens from secure storage
      await tokenManager.clearTokens();
      
      // Clear all user-scoped query cache so no data from the previous user leaks
      queryClient.clear();
      
      // Clear auth state
      markUnauthenticated();
    },
  });
};
