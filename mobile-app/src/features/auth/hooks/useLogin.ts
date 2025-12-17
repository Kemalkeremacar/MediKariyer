import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    onSettled: userOnSettled,
    ...restOptions
  } = options || {};

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data, variables, context) => {
      // Core auth side-effects (single source of truth)
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      setAuthState(data.user);

      // Clear all user-scoped query cache so the new user never sees stale data
      // (e.g. previous user's profile, applications, notifications)
      queryClient.clear();

      // Let consumer run additional side-effects
      if (userOnSuccess) {
        await userOnSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (userOnError) {
        userOnError(error, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      if (userOnSettled) {
        userOnSettled(data, error, variables, context);
      }
    },
    ...restOptions,
  });
};
