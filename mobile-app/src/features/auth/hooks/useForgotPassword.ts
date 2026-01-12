/**
 * @file useForgotPassword.ts
 * @description Şifremi unuttum işlevi hook'u
 * 
 * Bu hook kullanıcının e-posta adresine şifre sıfırlama linki gönderir.
 * Kullanıcı bu linke tıklayarak şifresini sıfırlayabilir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';

/**
 * Forgot password callback tipleri
 * 
 * @interface UseForgotPasswordCallbacks
 * @property {Function} [onSuccess] - Başarılı olduğunda çağrılır
 * @property {Function} [onError] - Hata oluştuğunda çağrılır
 */
interface UseForgotPasswordCallbacks {
  onSuccess?: (data: { success: boolean; message: string }) => void | Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * Şifremi unuttum hook'u
 * 
 * **İşleyiş:**
 * 1. Kullanıcı e-posta adresini girer
 * 2. Backend'e istek gönderilir
 * 3. Backend kullanıcıya şifre sıfırlama linki içeren e-posta gönderir
 * 4. Kullanıcı linke tıklayarak şifresini sıfırlar
 * 
 * **Kullanım:**
 * ```tsx
 * const forgotPassword = useForgotPassword({
 *   onSuccess: () => {
 *     alert.success('Şifre sıfırlama linki e-postanıza gönderildi');
 *     navigation.navigate('Login');
 *   },
 *   onError: (error) => {
 *     alert.error(error.message);
 *   }
 * });
 * 
 * forgotPassword.mutate('user@example.com');
 * ```
 * 
 * @param callbacks - Başarı ve hata callback'leri
 * @returns React Query mutation objesi
 */
export const useForgotPassword = (callbacks?: UseForgotPasswordCallbacks) => {
  return useMutation({
    mutationFn: async (email: string) => {
      // Şifre sıfırlama isteği gönder
      const response = await authService.forgotPassword(email);
      return response;
    },
    onSuccess: async (data) => {
      // Başarılı olduğunda callback'i çağır
      await callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      // Hata oluştuğunda callback'i çağır
      callbacks?.onError?.(error);
    },
  });
};

