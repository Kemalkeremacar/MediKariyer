/**
 * @file useUpdatePersonalInfo.ts
 * @description Kişisel bilgileri güncelleme hook'u
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Doktorun kişisel bilgilerini (ad, soyad, telefon, unvan, uzmanlık) günceller.
 * 
 * **CACHE YÖNETİMİ:**
 * Sadece ['profile', 'core'] cache'ini invalidate eder.
 * Diğer domain'ler (eğitim, deneyim, vb.) etkilenmez.
 * 
 * **TOAST MESAJI:**
 * Başarılı güncelleme sonrası otomatik toast mesajı gösterir.
 * Hata durumunda da toast ile bildirim yapılır.
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * const updateMutation = useUpdatePersonalInfo();
 * 
 * updateMutation.mutate({
 *   first_name: 'Ahmet',
 *   last_name: 'Yılmaz',
 *   phone: '5551234567',
 *   title: 'Dr',
 *   specialty_id: 1
 * });
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileCoreService } from '@/api/services/profile/profile.core.service';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { handleApiError } from '@/utils/errorHandler';
import type { UpdatePersonalInfoPayload } from '@/types/profile';

/**
 * Kişisel bilgileri güncelleyen mutation hook
 * 
 * **GÜNCELLENEBİLEN ALANLAR:**
 * - Ad (first_name)
 * - Soyad (last_name)
 * - Telefon (phone)
 * - Unvan (title)
 * - Uzmanlık alanı (specialty_id)
 * - Yan dal (subspecialty_id)
 * 
 * **CACHE YÖNETİMİ:**
 * Başarılı güncelleme sonrası sadece ['profile', 'core'] invalidate edilir.
 * 
 * **TOAST MESAJI:**
 * Başarılı: "Temel bilgiler güncellendi"
 * Hata: API'den gelen hata mesajı
 * 
 * @returns {UseMutationResult} React Query mutation sonucu
 */
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();
  const alert = useAlertHelpers();

  return useMutation({
    mutationFn: (payload: UpdatePersonalInfoPayload) =>
      profileCoreService.updatePersonalInfo(payload),
    onSuccess: () => {
      /**
       * Başarılı güncelleme sonrası cache yönetimi
       * Sadece core profil invalidate edilir, diğer domain'ler etkilenmez
       */
      queryClient.invalidateQueries({ queryKey: ['profile', 'core'] });
      
      /**
       * Toast mesajı göster (dil bilgisi gibi)
       */
      alert.success('Temel bilgiler güncellendi');
    },
    onError: (error: Error) => {
      /**
       * Hata durumunda toast mesajı göster
       */
      const message = handleApiError(error, '/doctor/profile');
      alert.error(message);
    },
  });
};

