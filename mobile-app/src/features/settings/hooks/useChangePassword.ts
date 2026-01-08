import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Hook for changing password
 * 
 * NOT: showAlert kullanmıyoruz çünkü:
 * - ChangePasswordScreen zaten showToast kullanıyor
 * - showAlert modal açıyor ve navigation.goBack() ile çakışıyor
 * - Modal açık kalırsa touch events engelleniyor
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
    onSuccess: () => {
      // Alert/Toast gösterimi çağıran component'e bırakıldı
      // (ChangePasswordScreen showToast kullanıyor)
    },
    onError: (error: any) => {
      // Error handling çağıran component'e bırakıldı
      throw error; // Re-throw so caller can handle it
    },
  });
};
