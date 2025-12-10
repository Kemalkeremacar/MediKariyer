import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import type { LoginPayload, AuthResponsePayload } from '@/types/auth';

type UseLoginOptions = Omit<
  UseMutationOptions<AuthResponsePayload, Error, LoginPayload>,
  'mutationFn'
>;

/**
 * Hook for login functionality
 * Handles authentication, token storage, and auth state updates
 */
export const useLogin = (options?: UseLoginOptions) => {
  const setAuthState = useAuthStore((state) => state.markAuthenticated);

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data, variables, context) => {
      try {
        // Save tokens to SecureStore (single source of truth)
        await tokenManager.saveTokens(data.accessToken, data.refreshToken);

        // Update auth state (user only, no tokens)
        setAuthState(data.user);
      } catch (error) {
        throw error;
      }
    },
    ...options,
  });
};
