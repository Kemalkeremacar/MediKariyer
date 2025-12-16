import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/utils/alert';
import { profileService } from '@/api/services/profile.service';
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
} from '@/types/profile';

/**
 * Hook for fetching complete profile data
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile', 'complete'],
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
    queryKey: ['profile', 'completion'],
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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showAlert.success('Kişisel bilgiler güncellendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Bilgiler güncellenirken bir hata oluştu');
    },
  });
};

/**
 * Hook for fetching education list
 */
export const useEducations = () => {
  return useQuery({
    queryKey: ['profile', 'educations'],
    queryFn: () => profileService.getEducations(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for managing education entries
 */
export const useEducation = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateEducationPayload) => profileService.createEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'educations'] });
      showAlert.success('Eğitim bilgisi eklendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Eğitim bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEducationPayload }) =>
      profileService.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'educations'] });
      showAlert.success('Eğitim bilgisi güncellendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Eğitim bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'educations'] });
      showAlert.success('Eğitim bilgisi silindi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Eğitim bilgisi silinirken bir hata oluştu');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

/**
 * Hook for fetching experience list
 */
export const useExperiences = () => {
  return useQuery({
    queryKey: ['profile', 'experiences'],
    queryFn: () => profileService.getExperiences(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for managing experience entries
 */
export const useExperience = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateExperiencePayload) => profileService.createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'experiences'] });
      showAlert.success('Deneyim bilgisi eklendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Deneyim bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExperiencePayload }) =>
      profileService.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'experiences'] });
      showAlert.success('Deneyim bilgisi güncellendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Deneyim bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'experiences'] });
      showAlert.success('Deneyim bilgisi silindi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Deneyim bilgisi silinirken bir hata oluştu');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

/**
 * Hook for fetching certificate list
 */
export const useCertificates = () => {
  return useQuery({
    queryKey: ['profile', 'certificates'],
    queryFn: () => profileService.getCertificates(),
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook for managing certificate entries
 */
export const useCertificate = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateCertificatePayload) => profileService.createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'certificates'] });
      showAlert.success('Sertifika bilgisi eklendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Sertifika bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCertificatePayload }) =>
      profileService.updateCertificate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'certificates'] });
      showAlert.success('Sertifika bilgisi güncellendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Sertifika bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'certificates'] });
      showAlert.success('Sertifika bilgisi silindi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Sertifika bilgisi silinirken bir hata oluştu');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

/**
 * Hook for fetching language list
 */
export const useLanguages = () => {
  return useQuery({
    queryKey: ['profile', 'languages'], // Unique key - lookup ile çakışmasın
    queryFn: () => profileService.getLanguages(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // Her zaman fresh data çek
    refetchOnMount: 'always', // Mount olduğunda her zaman refetch yap
  });
};

/**
 * Hook for managing language entries
 */
export const useLanguage = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateLanguagePayload) => profileService.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'languages'] });
      showAlert.success('Dil bilgisi eklendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Dil bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLanguagePayload }) =>
      profileService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'languages'] });
      showAlert.success('Dil bilgisi güncellendi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Dil bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'languages'] });
      showAlert.success('Dil bilgisi silindi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Dil bilgisi silinirken bir hata oluştu');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

/**
 * Hook for managing profile photo
 */
export const useProfilePhoto = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (payload: UploadPhotoPayload) => profileService.uploadPhoto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoRequestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['photoHistory'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showAlert.success('Fotoğraf değişiklik talebi gönderildi. Admin onayı bekleniyor.');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Fotoğraf yüklenirken bir hata oluştu');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => profileService.cancelPhotoRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoRequestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['photoHistory'] });
      showAlert.success('Fotoğraf değişiklik talebi iptal edildi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Talep iptal edilirken bir hata oluştu');
    },
  });

  const statusQuery = useQuery({
    queryKey: ['photoRequestStatus'],
    queryFn: () => profileService.getPhotoRequestStatus(),
  });

  const historyQuery = useQuery({
    queryKey: ['photoHistory'],
    queryFn: () => profileService.getPhotoRequestHistory(),
  });

  return {
    upload: uploadMutation,
    cancel: cancelMutation,
    status: statusQuery,
    history: historyQuery,
  };
};
