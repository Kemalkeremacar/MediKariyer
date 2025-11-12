/**
 * Doctor Hooks - React Query ile doktor işlemleri
 * Service katmanı kaldırıldı - API çağrıları doğrudan hook'larda
 * 
 * @author MediKariyer Development Team
 * @version 2.1.0
 * @since 2024
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS, buildEndpoint } from '@config/api.js';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import useAuthStore from '@/store/authStore';
import logger from '@/utils/logger';

// 🔹 Profil Bilgileri - Kullanıcı bazlı cache key
export const useDoctorProfile = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'profile', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.PROFILE),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { profile } }
    enabled: !!userId, // Sadece kullanıcı varsa çalıştır
    staleTime: 30 * 1000, // 30 saniye cache - profil sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useDoctorCompleteProfile = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'profile', 'complete', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.PROFILE_COMPLETE),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { profile } }
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 saniye cache - profil sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useUpdateDoctorProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.put(ENDPOINTS.DOCTOR.PROFILE, data),
    onSuccess: async (response) => {
      // Backend'den dönen güncellenmiş profili kullan
      const updatedProfile = response?.data?.profile;
      
      if (updatedProfile) {
        // Cache'i manuel olarak güncelle (invalidate yerine setQueryData)
        qc.setQueryData(['doctor', 'profile'], (oldData) => ({
          ...oldData,
          data: {
            ...oldData?.data,
            profile: updatedProfile
          }
        }));
      }
      
      // Profil tamamlanma oranını yenile
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      
      // Admin cache'ini invalidate et (admin kullanıcı detay sayfası için)
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['admin', 'users']);
      qc.invalidateQueries(['admin', 'applications']); // Admin başvurular sayfası
      
      // Hastane cache'ini invalidate et (hastane başvurular ve doktor listesi için)
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      qc.invalidateQueries(['hospital', 'doctors']);
      
      showToast.success(toastMessages.profile.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.profile.updateError });
    },
  });
};

export const useUpdateDoctorPersonalInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.patch(ENDPOINTS.DOCTOR.PROFILE_PERSONAL, data),
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'profile']);
      qc.invalidateQueries(['doctor', 'profile', 'complete']);
      showToast.success(toastMessages.profile.personalInfoUpdateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.profile.personalInfoUpdateError });
    },
  });
};

export const useDoctorProfileCompletion = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'profile', 'completion', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.PROFILE_COMPLETION),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { completion_percentage, ... } }
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 saniye cache - tamamlanma oranı sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// 🔹 Eğitim Bilgileri
export const useDoctorEducations = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'educations', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.EDUCATIONS),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { educations } }
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 saniye cache - eğitimler sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreateEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.post(ENDPOINTS.DOCTOR.EDUCATIONS, data),
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'educations']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.education.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.education.createError });
    },
  });
};

export const useUpdateEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.EDUCATIONS}/:id`, { id });
      return apiRequest.patch(endpoint, data);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'educations']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.education.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.education.updateError });
    },
  });
};

export const useDeleteEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.EDUCATIONS}/:id`, { id });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'educations']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.education.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.education.deleteError });
    },
  });
};

// 🔹 Deneyimler
export const useDoctorExperiences = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'experiences', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.EXPERIENCES),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { experiences } }
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 saniye cache - deneyimler sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.post(ENDPOINTS.DOCTOR.EXPERIENCES, data),
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'experiences']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.experience.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.experience.createError });
    },
  });
};

export const useUpdateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.EXPERIENCES}/:id`, { id });
      return apiRequest.patch(endpoint, data);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'experiences']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.experience.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.experience.updateError });
    },
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.EXPERIENCES}/:id`, { id });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'experiences']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.experience.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.experience.deleteError });
    },
  });
};

// 🔹 Sertifikalar
export const useDoctorCertificates = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'certificates', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.CERTIFICATES),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { certificates } }
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 saniye cache - sertifikalar sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreateCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.post(ENDPOINTS.DOCTOR.CERTIFICATES, data),
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'certificates']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.certificate.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.certificate.createError });
    },
  });
};

export const useUpdateCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.CERTIFICATES}/:id`, { id });
      return apiRequest.patch(endpoint, data);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'certificates']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.certificate.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.certificate.updateError });
    },
  });
};

export const useDeleteCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.CERTIFICATES}/:id`, { id });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'certificates']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.certificate.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.certificate.deleteError });
    },
  });
};

// 🔹 Diller
export const useDoctorLanguages = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['doctor', 'languages', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.LANGUAGES),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { languages } }
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 saniye cache - diller sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreateLanguage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.post(ENDPOINTS.DOCTOR.LANGUAGES, data),
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'languages']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.language.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.language.createError });
    },
  });
};

export const useUpdateLanguage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.LANGUAGES}/:id`, { id });
      return apiRequest.patch(endpoint, data);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'languages']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.language.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.language.updateError });
    },
  });
};

export const useDeleteLanguage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.DOCTOR.LANGUAGES}/:id`, { id });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'languages']);
      qc.invalidateQueries(['doctor', 'profile', 'completion']);
      qc.invalidateQueries(['admin', 'user']);
      qc.invalidateQueries(['hospital', 'applications']);
      qc.invalidateQueries(['hospital', 'application']);
      showToast.success(toastMessages.language.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.language.deleteError });
    },
  });
};

// 🔹 Dashboard
export const useDoctorDashboard = () => {
  return useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.DASHBOARD),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { dashboard } }
    staleTime: 0, // Fresh data - dashboard istatistikleri kritik
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};


// 🔹 İş İlanları (Doktor için)
export const useDoctorJobs = (params = {}) => {
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    queryKey: ['doctor', 'jobs', cleanParams],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.JOBS, { params: cleanParams }),
    select: (res) => res.data?.data,
    staleTime: 0, // Fresh data - iş ilanları kritik (pasif durumları için)
    cacheTime: 0,
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useDoctorJobDetail = (jobId) => {
  return useQuery({
    queryKey: ['doctor', 'job', jobId],
    queryFn: () => {
      const endpoint = buildEndpoint(ENDPOINTS.DOCTOR.JOB_DETAIL, { id: jobId });
      return apiRequest.get(endpoint);
    },
    select: (res) => res.data?.data, // Backend response: { success, message, data: job }
    enabled: !!jobId,
    staleTime: 0, // Fresh data - iş ilanı detayı kritik (pasif durumları için)
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useApplyToJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest.post(ENDPOINTS.DOCTOR.APPLICATIONS, data),
    onSuccess: () => {
      // Cache'leri invalidate et
      qc.invalidateQueries(['doctor', 'applications']);
      qc.invalidateQueries(['doctor', 'dashboard']);
      qc.invalidateQueries(['doctor', 'jobs']); // İş ilanları için de invalidate (başvuru durumu değişebilir)
      // showToast.success burada kaldırıldı - her sayfa kendi toast mesajını yönetiyor
    },
    // onError kaldırıldı - her sayfa kendi hata yönetimini yapıyor
  });
};

// 🔹 Başvurular
export const useMyApplications = (params = {}) => {
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    queryKey: ['doctor', 'applications', cleanParams],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.APPLICATIONS_ME, { params: cleanParams }),
    select: (res) => res.data?.data,
    staleTime: 0, // Fresh data - başvurular kritik
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useApplicationDetail = (applicationId) => {
  return useQuery({
    queryKey: ['doctor', 'application', applicationId],
    queryFn: () => {
      const endpoint = buildEndpoint(ENDPOINTS.DOCTOR.APPLICATION_DETAIL, { id: applicationId });
      return apiRequest.get(endpoint);
    },
    select: (res) => res.data?.data, // Backend response: { success, message, data: { application } }
    enabled: !!applicationId,
    staleTime: 0, // Fresh data - başvuru detayı kritik
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useWithdrawApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, reason }) => {
      const endpoint = buildEndpoint(ENDPOINTS.DOCTOR.APPLICATION_WITHDRAW, { id: applicationId });
      return apiRequest.patch(endpoint, { reason });
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'applications']);
      qc.invalidateQueries(['doctor', 'dashboard']); // Dashboard'u güncelle
      qc.invalidateQueries(['hospital', 'applications']); // Hastane başvurular sayfası
      qc.invalidateQueries(['hospital', 'dashboard']); // Hastane dashboard
      qc.invalidateQueries(['admin', 'applications']); // Admin başvurular sayfası
      showToast.success(toastMessages.application.withdrawSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.application.withdrawError });
    },
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) => {
      const endpoint = buildEndpoint(ENDPOINTS.DOCTOR.APPLICATION_DELETE, { id: applicationId });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      qc.invalidateQueries(['doctor', 'applications']);
      qc.invalidateQueries(['doctor', 'dashboard']); // Dashboard'u güncelle
      qc.invalidateQueries(['hospital', 'applications']); // Hastane başvurular sayfası
      qc.invalidateQueries(['hospital', 'dashboard']); // Hastane dashboard
      qc.invalidateQueries(['admin', 'applications']); // Admin başvurular sayfası
      showToast.success(toastMessages.application.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.application.deleteError });
    },
  });
};


// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ HOOKS
// ============================================================================

/**
 * Profil fotoğrafı değişiklik talebi oluştur
 * @description Doktor yeni fotoğraf yükler, admin onayına gönderir
 * @returns {Object} Mutation hook
 */
export const useRequestPhotoChange = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file) => {
      // Backend JSON bekliyor: { file_url: base64String }
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await apiRequest.post(ENDPOINTS.DOCTOR.PHOTO, { file_url: dataUrl });
      return response.data;
    },
    onSuccess: () => {
      // Photo request status'u yenile
      queryClient.invalidateQueries({ queryKey: ['doctor', 'photo-request-status'] });
      // Profili de yenile (fotoğraf onaylandığında güncellenir)
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
    },
    onError: (error) => {
      logger.error('Photo change request failed:', error);
    }
  });
};

/**
 * Fotoğraf talep durumunu getir
 * @description Doktorun son fotoğraf talep durumunu getirir
 * @returns {Object} Query hook
 */
export const usePhotoRequestStatus = () => {
  return useQuery({
    queryKey: ['doctor', 'photo-request-status'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.DOCTOR.PHOTO_STATUS);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 saniye cache - fotoğraf durumu sık değişmez
    cacheTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2
  });
};

/**
 * Fotoğraf talep geçmişini getir
 */
export const usePhotoRequestHistory = () => {
  return useQuery({
    queryKey: ['doctor', 'photo-request-history'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.DOCTOR.PHOTO_HISTORY);
      return response.data;
    },
    staleTime: 0, // Fresh data - fotoğraf geçmişi kritik
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1
  });
};

/**
 * Fotoğraf talebini iptal et
 * @description Doktor bekleyen fotoğraf talebini iptal eder
 * @returns {Object} Mutation hook
 */
export const useCancelPhotoRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest.delete(ENDPOINTS.DOCTOR.PHOTO_REQUEST),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', 'photo-request-status'] });
      qc.invalidateQueries({ queryKey: ['doctor', 'photo-request-history'] });
      qc.invalidateQueries({ queryKey: ['doctor', 'profile'] });
      showToast.success(toastMessages.photo.cancelRequestSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.photo.cancelRequestError });
    },
  });
};

export const useDeactivateDoctorAccount = () => {
  return useMutation({
    mutationFn: () => apiRequest.post(ENDPOINTS.DOCTOR.ACCOUNT_DEACTIVATE)
  });
};

export default {
  // Profil hook'ları
  useDoctorProfile,
  useDoctorCompleteProfile,
  useUpdateDoctorProfile,
  useUpdateDoctorPersonalInfo,
  useDoctorProfileCompletion,
  
  // Eğitim hook'ları
  useDoctorEducations,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  
  // Deneyim hook'ları
  useDoctorExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  
  // Sertifika hook'ları
  useDoctorCertificates,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  
  // Dil hook'ları
  useDoctorLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
  
  // Dashboard ve iş ilanları
  useDoctorDashboard,
  useDoctorJobs,
  useDoctorJobDetail,
  useApplyToJob,
  
  // Başvuru hook'ları
  useMyApplications,
  useApplicationDetail,
  useWithdrawApplication,
  useDeleteApplication,
  
  // Fotoğraf onay sistemi
  useRequestPhotoChange,
  usePhotoRequestStatus,
  usePhotoRequestHistory,
  useCancelPhotoRequest,
};
