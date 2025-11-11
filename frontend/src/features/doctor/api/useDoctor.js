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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
      
      showToast.success('Profil başarıyla güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Profil güncellenemedi');
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
      showToast.success('Kişisel bilgiler güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Kişisel bilgiler güncellenemedi');
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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
      showToast.success('Eğitim eklendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Eğitim eklenemedi');
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
      showToast.success('Eğitim güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Eğitim güncellenemedi');
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
      showToast.success('Eğitim silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Eğitim silinemedi');
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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
      showToast.success('Deneyim eklendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Deneyim eklenemedi');
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
      showToast.success('Deneyim güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Deneyim güncellenemedi');
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
      showToast.success('Deneyim silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Deneyim silinemedi');
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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
      showToast.success('Sertifika eklendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Sertifika eklenemedi');
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
      showToast.success('Sertifika güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Sertifika güncellenemedi');
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
      showToast.success('Sertifika silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Sertifika silinemedi');
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
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
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
      showToast.success('Dil eklendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Dil eklenemedi');
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
      showToast.success('Dil güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Dil güncellenemedi');
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
      showToast.success('Dil silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Dil silinemedi');
    },
  });
};

// 🔹 Dashboard
export const useDoctorDashboard = () => {
  return useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: () => apiRequest.get(ENDPOINTS.DOCTOR.DASHBOARD),
    select: (res) => res.data?.data, // Backend response: { success, message, data: { dashboard } }
    staleTime: 0, // Cache'i devre dışı bırak - her seferinde fresh data
    cacheTime: 0, // Cache'i devre dışı bırak
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
    staleTime: 30 * 1000, // 30 saniye - İş ilanları daha dinamik
    cacheTime: 2 * 60 * 1000, // 2 dakika cache
    retry: 1,
    refetchOnWindowFocus: false
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
    staleTime: 0, // Cache'i devre dışı bırak - her seferinde fresh data
    cacheTime: 0, // Cache'i devre dışı bırak
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
      showToast.success('Başvuru geri çekildi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Başvuru geri çekilemedi');
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
      showToast.success('Başvuru kalıcı olarak silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Başvuru silinemedi');
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
      const response = await apiRequest.post('/doctor/profile/photo', { file_url: dataUrl });
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
      const response = await apiRequest.get('/doctor/profile/photo/status');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 saniye
    cacheTime: 5 * 60 * 1000, // 5 dakika
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
      const response = await apiRequest.get('/doctor/profile/photo/history');
      return response.data;
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
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
      qc.invalidateQueries(['doctor', 'photo', 'status']);
      qc.invalidateQueries(['doctor', 'photo', 'history']);
      showToast.success('Fotoğraf talebi iptal edildi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Fotoğraf talebi iptal edilemedi');
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
