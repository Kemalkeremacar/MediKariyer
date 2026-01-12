/**
 * @file useRegister.ts
 * @description Doktor kayıt işlevi hook'u
 * 
 * Bu hook doktor kaydı işlemini yönetir. Kayıt sonrası kullanıcı
 * onay bekleyen duruma geçer.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
import { devLog } from '@/utils/devLogger';
import type { DoctorRegistrationPayload, DoctorRegistrationResponse } from '@/types/auth';

/**
 * Register options tipi
 * React Query mutation options'ından mutationFn hariç tüm seçenekler
 */
type UseRegisterOptions = Omit<
  UseMutationOptions<DoctorRegistrationResponse, Error, DoctorRegistrationPayload>,
  'mutationFn'
>;

/**
 * Doktor kayıt hook'u
 * 
 * **İşleyiş:**
 * 1. Kullanıcı kayıt formunu doldurur
 * 2. Backend'e kayıt isteği gönderilir
 * 3. Başarılı olursa kullanıcı "Onay Bekliyor" durumuna geçer
 * 4. Admin onayladıktan sonra giriş yapabilir
 * 
 * **Kullanım:**
 * ```tsx
 * const register = useRegister({
 *   onSuccess: () => {
 *     alert.success('Kaydınız alındı, onay bekleniyor');
 *     navigation.navigate('PendingApproval');
 *   },
 *   onError: (error) => {
 *     alert.error(error.message);
 *   }
 * });
 * 
 * register.mutate({
 *   email: 'doctor@example.com',
 *   password: '123456',
 *   name: 'Dr. Ahmet Yılmaz',
 *   // ... diğer alanlar
 * });
 * ```
 * 
 * @param options - React Query mutation seçenekleri
 * @returns React Query mutation objesi
 */
export const useRegister = (options?: UseRegisterOptions) => {
  return useMutation({
    mutationFn: async (data: DoctorRegistrationPayload) => {
      devLog.log('🔵 useRegister: mutationFn called');
      try {
        // Kayıt isteği gönder
        const response = await authService.registerDoctor(data);
        devLog.log('✅ useRegister: registration successful');
        return response;
      } catch (error) {
        devLog.log('❌ useRegister: registration error:', error);
        throw error;
      }
    },
    ...options,
  });
};
