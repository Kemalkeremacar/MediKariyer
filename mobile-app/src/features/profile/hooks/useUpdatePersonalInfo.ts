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
 * **ÖNEMLİ NOT:**
 * showAlert kullanılmıyor çünkü:
 * - ProfileEditScreen zaten showToast kullanıyor
 * - showAlert modal açar ve navigation.goBack() ile çakışır
 * - Modal açık kalırsa touch events engellenir
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
 * **HATA YÖNETİMİ:**
 * Hata durumunda error re-throw edilir, çağıran component handle eder.
 * 
 * @returns {UseMutationResult} React Query mutation sonucu
 */
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();

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
       * Alert/Toast gösterimi çağıran component'e bırakıldı
       * ProfileEditScreen showToast kullanıyor
       */
    },
    onError: (error) => {
      /**
       * Hata yönetimi çağıran component'e bırakıldı
       * ProfileEditScreen handleSave'de try-catch ile yakalıyor
       * Error re-throw edilerek caller'a iletiliyor
       */
      throw error;
    },
  });
};

