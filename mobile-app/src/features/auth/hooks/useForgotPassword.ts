import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';

interface UseForgotPasswordCallbacks {
  onSuccess?: (data: { success: boolean; message: string }) => void | Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * Hook for forgot password functionality
 * Sends password reset link to user's email
 */
export const useForgotPassword = (callbacks?: UseForgotPasswordCallbacks) => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await authService.forgotPassword(email);
      return response;
    },
    onSuccess: async (data) => {
      await callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
};

