/**
 * @file useChangePassword.ts
 * @description Şifre değiştirme hook'u
 * 
 * Bu hook kullanıcının mevcut şifresini değiştirmesini sağlar.
 * Alert/Toast gösterimi çağıran component'e bırakılmıştır.
 * 
 * **NOT:** showAlert kullanılmıyor çünkü:
 * - ChangePasswordScreen zaten showToast kullanıyor
 * - showAlert modal açıyor ve navigation.goBack() ile çakışıyor
 * - Modal açık kalırsa touch events engelleniyor
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';

/**
 * Şifre değiştirme payload tipi
 * 
 * @interface ChangePasswordPayload
 * @property {string} currentPassword - Mevcut şifre
 * @property {string} newPassword - Yeni şifre
 * @property {string} confirmPassword - Yeni şifre tekrarı
 */
interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Şifre değiştirme hook'u
 * 
 * **Kullanım:**
 * ```tsx
 * const changePassword = useChangePassword();
 * 
 * changePassword.mutate({
 *   currentPassword: 'old123',
 *   newPassword: 'new456',
 *   confirmPassword: 'new456'
 * });
 * ```
 * 
 * @returns Mutation hook
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
