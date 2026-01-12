/**
 * @file useResetPassword.ts
 * @description Şifre sıfırlama işlevi hook'u
 * 
 * Bu hook e-posta ile gelen token kullanarak şifre sıfırlama işlemini yapar.
 * Forgot password akışının ikinci adımıdır.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
import { useAlertHelpers } from '@/utils/alertHelpers';

/**
 * Reset password callback tipleri
 * 
 * @interface UseResetPasswordCallbacks
 * @property {Function} [onSuccess] - Başarılı olduğunda çağrılır
 * @property {Function} [onError] - Hata oluştuğunda çağrılır
 */
interface UseResetPasswordCallbacks {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * Reset password payload tipi
 * 
 * @type ResetPasswordPayload
 * @property {string} token - E-posta ile gelen sıfırlama token'ı
 * @property {string} password - Yeni şifre
 */
type ResetPasswordPayload = {
  token: string;
  password: string;
};

/**
 * Şifre sıfırlama hook'u
 * 
 * **İşleyiş:**
 * 1. Kullanıcı e-postasındaki linke tıklar
 * 2. Link'te token parametresi bulunur
 * 3. Kullanıcı yeni şifresini girer
 * 4. Token ve yeni şifre ile backend'e istek gönderilir
 * 5. Başarılı olursa kullanıcı login ekranına yönlendirilir
 * 
 * **Kullanım:**
 * ```tsx
 * const resetPassword = useResetPassword({
 *   onSuccess: () => {
 *     navigation.navigate('Login');
 *   },
 *   onError: (error) => {
 *     alert.error(error.message);
 *   }
 * });
 * 
 * resetPassword.mutate({
 *   token: 'abc123...',
 *   password: 'newPassword123'
 * });
 * ```
 * 
 * @param callbacks - Başarı ve hata callback'leri
 * @returns React Query mutation objesi
 */
export const useResetPassword = (callbacks?: UseResetPasswordCallbacks) => {
  const alert = useAlertHelpers();
  
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      // Şifre sıfırlama isteği gönder
      const response = await authService.resetPassword(payload.token, payload.password);
      return response;
    },
    onSuccess: async () => {
      // Başarı mesajı göster
      alert.success('Şifreniz başarıyla değiştirildi. Lütfen yeni şifrenizle giriş yapın.');
      // Callback'i çağır
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      // Hata callback'ini çağır
      callbacks?.onError?.(error);
    },
  });
};

