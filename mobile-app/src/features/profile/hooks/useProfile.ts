/**
 * Profile Hooks
 * TD-003: CRUD hook'ları useCRUDMutation generic hook'u kullanacak şekilde refactor edildi
 * ARCH-003: queryKeys factory pattern uygulandı
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/utils/alert';
import { profileService } from '@/api/services/profile';
import { handleApiError } from '@/utils/errorHandler';
import { useCRUDMutation } from '@/hooks/useCRUDMutation';
import { queryKeys } from '@/api/queryKeys';
import type {
  UpdatePersonalInfoPayload,
  CreateEducationPayload,
  UpdateEducationPayload,
  CreateExperiencePayload,
  UpdateExperiencePayload,
  CreateCertificatePayload,
  UpdateCertificatePayload,
  CreateLanguagePayload,
  UpdateLanguagePayload,
  UploadPhotoPayload,
  DoctorEducation,
  DoctorExperience,
  DoctorCertificate,
  DoctorLanguage,
} from '@/types/profile';

/**
 * Hook for fetching complete profile data
 */
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile.complete(),
    queryFn: () => profileService.getCompleteProfile(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for fetching profile completion status
 */
export const useProfileCompletion = () => {
  return useQuery({
    queryKey: queryKeys.profile.completion(),
    queryFn: () => profileService.getProfileCompletion(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for updating personal information
 */
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePersonalInfoPayload) =>
      profileService.updatePersonalInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      showAlert.success('Kişisel bilgiler güncellendi');
    },
    onError: (error) => {
      const message = handleApiError(error, '/doctor/profile/personal');
      showAlert.error(message);
    },
  });
};

/**
 * Hook for fetching education list
 */
export const useEducations = () => {
  return useQuery({
    queryKey: queryKeys.profile.educations(),
    queryFn: () => profileService.getEducations(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for managing education entries
 * Uses generic useCRUDMutation hook
 */
export const useEducation = () => {
  return useCRUDMutation<CreateEducationPayload, UpdateEducationPayload, DoctorEducation>({
    entityName: 'Eğitim bilgisi',
    queryKey: queryKeys.profile.educations(),
    endpoint: '/doctor/educations',
    service: {
      create: profileService.createEducation,
      update: profileService.updateEducation,
      delete: profileService.deleteEducation,
    },
  });
};

/**
 * Hook for fetching experience list
 */
export const useExperiences = () => {
  return useQuery({
    queryKey: queryKeys.profile.experiences(),
    queryFn: () => profileService.getExperiences(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for managing experience entries
 * Uses generic useCRUDMutation hook
 */
export const useExperience = () => {
  return useCRUDMutation<CreateExperiencePayload, UpdateExperiencePayload, DoctorExperience>({
    entityName: 'Deneyim bilgisi',
    queryKey: queryKeys.profile.experiences(),
    endpoint: '/doctor/experiences',
    service: {
      create: profileService.createExperience,
      update: profileService.updateExperience,
      delete: profileService.deleteExperience,
    },
  });
};

/**
 * Hook for fetching certificate list
 */
export const useCertificates = () => {
  return useQuery({
    queryKey: queryKeys.profile.certificates(),
    queryFn: () => profileService.getCertificates(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for managing certificate entries
 * Uses generic useCRUDMutation hook
 */
export const useCertificate = () => {
  return useCRUDMutation<CreateCertificatePayload, UpdateCertificatePayload, DoctorCertificate>({
    entityName: 'Sertifika bilgisi',
    queryKey: queryKeys.profile.certificates(),
    endpoint: '/doctor/certificates',
    service: {
      create: profileService.createCertificate,
      update: profileService.updateCertificate,
      delete: profileService.deleteCertificate,
    },
  });
};

/**
 * Hook for fetching language list
 */
export const useLanguages = () => {
  return useQuery({
    queryKey: queryKeys.profile.languages(),
    queryFn: () => profileService.getLanguages(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // Her zaman fresh data çek
    refetchOnMount: 'always', // Mount olduğunda her zaman refetch yap
  });
};

/**
 * Hook for managing language entries
 * Uses generic useCRUDMutation hook
 */
export const useLanguage = () => {
  return useCRUDMutation<CreateLanguagePayload, UpdateLanguagePayload, DoctorLanguage>({
    entityName: 'Dil bilgisi',
    queryKey: queryKeys.profile.languages(),
    endpoint: '/doctor/languages',
    service: {
      create: profileService.createLanguage,
      update: profileService.updateLanguage,
      delete: profileService.deleteLanguage,
    },
  });
};

/**
 * Hook for managing profile photo
 */
export const useProfilePhoto = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (payload: UploadPhotoPayload) => profileService.uploadPhoto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.history() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      showAlert.success('Fotoğraf değişiklik talebi gönderildi. Admin onayı bekleniyor.');
    },
    onError: (error) => {
      const message = handleApiError(error, '/doctor/profile/photo');
      showAlert.error(message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => profileService.cancelPhotoRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.history() });
      showAlert.success('Fotoğraf değişiklik talebi iptal edildi');
    },
    onError: (error) => {
      const message = handleApiError(error, '/doctor/profile/photo/request');
      showAlert.error(message);
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
