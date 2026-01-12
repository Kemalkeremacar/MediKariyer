/**
 * @file useProfile.ts
 * @description Profil hook'larının merkezi export dosyası (Backward Compatibility)
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Eski kodlarla uyumluluk için tüm profil hook'larını tek yerden export eder.
 * 
 * **YENİ MİMARİ (Domain-Driven Design):**
 * - useProfileCore.ts: Ana profil + doluluk oranı
 * - useEducations.ts: Eğitim CRUD
 * - useExperiences.ts: Deneyim CRUD
 * - useCertificates.ts: Sertifika CRUD
 * - useLanguages.ts: Dil CRUD
 * - useUpdatePersonalInfo.ts: Kişisel bilgi güncelleme
 * 
 * **ÖNEMLİ:**
 * @deprecated Yeni projelerde hook'ları doğrudan import edin:
 * ```typescript
 * import { useProfileCore } from './useProfileCore';
 * import { useEducations } from './useEducations';
 * ```
 * 
 * **KULLANIM ÖRNEĞİ (Eski Yöntem):**
 * ```typescript
 * import { useProfile, useEducations } from '@/features/profile/hooks/useProfile';
 * ```
 */

// Re-export new domain-driven hooks
export { useProfileCore, useProfileCompletion } from './useProfileCore';
export { useEducations, useEducation } from './useEducations';
export { useExperiences, useExperience } from './useExperiences';
export { useCertificates, useCertificate } from './useCertificates';
export { useLanguages, useLanguage } from './useLanguages';

// Legacy exports for backward compatibility
import { useProfileCore } from './useProfileCore';

/**
 * @deprecated Use useProfileCore instead
 * Hook for fetching complete profile data
 */
export const useProfile = useProfileCore;

/**
 * Hook for updating personal information
 */
export { useUpdatePersonalInfo } from './useUpdatePersonalInfo';

/**
 * Hook for managing profile photo
 * 
 * NOT: showAlert kullanmıyoruz çünkü:
 * - PhotoManagementScreen zaten showToast kullanıyor
 * - showAlert modal açıyor ve navigation.goBack() ile çakışıyor
 * - Modal açık kalırsa touch events engelleniyor
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile';
import { queryKeys } from '@/api/queryKeys';
import type { UploadPhotoPayload } from '@/types/profile';

export const useProfilePhoto = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (payload: UploadPhotoPayload) => profileService.uploadPhoto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.history() });
      // Sadece core profil'i invalidate et (fotoğraf değişti)
      queryClient.invalidateQueries({ queryKey: ['profile', 'core'] });
      // Alert/Toast gösterimi çağıran component'e bırakıldı
      // (PhotoManagementScreen showToast kullanıyor)
    },
    onError: (error) => {
      // Error handling çağıran component'e bırakıldı
      throw error; // Re-throw so caller can handle it
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => profileService.cancelPhotoRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.history() });
      // Alert/Toast gösterimi çağıran component'e bırakıldı
      // (PhotoManagementScreen showToast kullanıyor)
    },
    onError: (error) => {
      // Error handling çağıran component'e bırakıldı
      throw error; // Re-throw so caller can handle it
    },
  });

  const statusQuery = useQuery({
    queryKey: queryKeys.photo.status(),
    queryFn: () => profileService.getPhotoRequestStatus(),
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.photo.history(),
    queryFn: () => profileService.getPhotoRequestHistory(),
  });

  return {
    upload: uploadMutation,
    cancel: cancelMutation,
    status: statusQuery,
    history: historyQuery,
  };
};
