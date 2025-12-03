import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '../services/authService';
import type { LoginPayload, AuthResponsePayload } from '../types';

type UseLoginOptions = Omit<
  UseMutationOptions<AuthResponsePayload, Error, LoginPayload>,
  'mutationFn'
>;

/**
 * Hook for login functionality
 * Handles authentication, token storage, and auth state updates
 */
export const useLogin = (options?: UseLoginOptions) => {
  const setAuthState = useAuthStore((state) => state.setAuthState);

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data, variables, context) => {
      try {
        await tokenManager.saveTokens(data.accessToken, data.refreshToken);

        setAuthState({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        // Call user's onSuccess if provided
        options?.onSuccess?.(data, variables, context);
      } catch (error) {
        throw error;
      }
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
