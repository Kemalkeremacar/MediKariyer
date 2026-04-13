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
import { MAX_RETRY_ATTEMPTS } from '@/config/constants';
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
 * 3. Network hatası durumunda otomatik retry
 * 4. Başarılı olursa kullanıcı "Onay Bekliyor" durumuna geçer
 * 5. Admin onayladıktan sonra giriş yapabilir
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
      
      let lastError: Error;
      
      // Retry mekanizması
      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          devLog.log(`🔄 Register attempt ${attempt}/${MAX_RETRY_ATTEMPTS}`);
          
          // Kayıt isteği gönder
          const response = await authService.registerDoctor(data);
          devLog.log('✅ useRegister: registration successful');
          return response;
          
        } catch (error: any) {
          lastError = error;
          devLog.log(`❌ useRegister: attempt ${attempt} failed:`, error.message);
          
          // Network hatası değilse retry yapma
          if (error.name !== 'NetworkError' && !error.message?.includes('Network')) {
            devLog.log('🚫 Non-network error, not retrying');
            throw error;
          }
          
          // Son deneme ise hata fırlat
          if (attempt === MAX_RETRY_ATTEMPTS) {
            devLog.log('🚫 Max retry attempts reached');
            throw error;
          }
          
          // Retry öncesi kısa bekleme
          const delay = attempt * 1000; // 1s, 2s, 3s...
          devLog.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError!;
    },
    retry: false, // Kendi retry mekanizmamızı kullanıyoruz
    ...options,
  });
};
