import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data) => {
      // Core auth side-effects (single source of truth)
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      setAuthState(data.user);

      // Clear all user-scoped query cache so the new user never sees stale data
      // (e.g. previous user's profile, applications, notifications)
      queryClient.clear();

      // Let consumer run additional side-effects
      await callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
};
