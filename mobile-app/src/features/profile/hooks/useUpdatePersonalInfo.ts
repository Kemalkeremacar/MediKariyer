/**
 * useUpdatePersonalInfo Hook - Stabilizasyon Faz 3
 * 
 * Kişisel bilgileri güncelleme
 * Sadece core profil cache'ini invalidate eder: ['profile', 'core']
 * 
 * NOT: showAlert kullanmıyoruz çünkü:
 * - ProfileEditScreen zaten showToast kullanıyor
 * - showAlert modal açıyor ve navigation.goBack() ile çakışıyor
 * - Modal açık kalırsa touch events engelleniyor
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileCoreService } from '@/api/services/profile/profile.core.service';
import type { UpdatePersonalInfoPayload } from '@/types/profile';

/**
 * Hook for updating personal information
 * Sadece core profil cache'ini invalidate eder
 * 
 * NOT: Alert/Toast gösterimi çağıran component'e bırakıldı
 * (ProfileEditScreen showToast kullanıyor)
 */
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePersonalInfoPayload) =>
      profileCoreService.updatePersonalInfo(payload),
    onSuccess: () => {
      // Sadece core profil'i invalidate et (diğer domain'ler etkilenmez)
      queryClient.invalidateQueries({ queryKey: ['profile', 'core'] });
      // Alert/Toast gösterimi çağıran component'e bırakıldı
      // (ProfileEditScreen showToast kullanıyor)
    },
    onError: (error) => {
      // Error handling de çağıran component'e bırakıldı
      // ProfileEditScreen handleSave'de try-catch ile yakalıyor
      throw error; // Re-throw so caller can handle it
    },
  });
};

