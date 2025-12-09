import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { authService } from '@/api/services/authService';

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
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Şifre değiştirme başarısız';
      Alert.alert('Hata', errorMessage);
    },
  });
};
