import { useMutation } from '@tanstack/react-query';
import { showAlert } from '@/utils/alert';
import { authService } from '@/api/services/authService';
import { handleApiError } from '@/utils/errorHandler';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
    onSuccess: () => {
      showAlert.success('Şifreniz başarıyla değiştirildi');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, '/auth/change-password');
      showAlert.error(errorMessage);
    },
  });
};
