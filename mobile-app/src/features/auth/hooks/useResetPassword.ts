import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
import { showAlert } from '@/utils/alert';
import { handleApiError } from '@/utils/errorHandler';

interface UseResetPasswordCallbacks {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

type ResetPasswordPayload = {
  token: string;
  password: string;
};

/**
 * Hook for reset password functionality
 * Resets password using token from email link
 */
export const useResetPassword = (callbacks?: UseResetPasswordCallbacks) => {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const response = await authService.resetPassword(payload.token, payload.password);
      return response;
    },
    onSuccess: async () => {
      showAlert.success('Şifreniz başarıyla değiştirildi. Lütfen yeni şifrenizle giriş yapın.');
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      const errorMessage = handleApiError(
        error,
        '/auth/reset-password',
        (msg) => showAlert.error(msg)
      );
      callbacks?.onError?.(error);
    },
  });
};

