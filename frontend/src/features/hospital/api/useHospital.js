/**
 * Hospital API Hook - React Query ile entegre
 * Service katmanı kaldırıldı - API çağrıları doğrudan hook'larda
 * Backend hospitalService.js ve hospitalController.js ile tam uyumlu
 * 
 * Cache Stratejisi:
 * - REALTIME: Dashboard, Profil → Her zaman fresh
 * - SEMI_REALTIME: İş ilanları, Başvurular → 30s cache
 * 
 * Ana İşlevler:
 * - Dashboard hooks (hospitalService.getDashboard)
 * - Profil yönetimi hooks (hospitalService.getProfile, updateProfile, getProfileCompletion)
 * - İş ilanı yönetimi hooks (hospitalService.getJobs, createJob, updateJob, deleteJob)
 * - Başvuru yönetimi hooks (hospitalService.getApplications, getAllApplications, updateApplicationStatus)
 * - Departman yönetimi hooks (hospitalService.getDepartments, addDepartment, updateDepartment, deleteDepartment)
 * - İletişim bilgisi yönetimi hooks (hospitalService.getContacts, addContact, updateContact, deleteContact)
 * - Doktor profil görüntüleme hooks (hospitalService.getDoctorProfiles, getDoctorProfileDetail)
 * 
 * @author MediKariyer Development Team
 * @version 2.3.0
 * @since 2024
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, fileUploadClient, createFormData } from '@/services/http/client';
import { ENDPOINTS, buildEndpoint, buildQueryString } from '@config/api.js';
import { showToast } from '@/utils/toastUtils';
import { toastMessages, formatErrorMessage } from '@/config/toast';
import useAuthStore from '@/store/authStore';
import { 
  profileQueryConfig, 
  dashboardQueryConfig, 
  listQueryConfig,
  detailQueryConfig,
  liveQueryConfig
} from '@/config/queryConfig.js';

// ============================================================================
// DASHBOARD HOOKS - hospitalService.getDashboard ile uyumlu
// ============================================================================

/**
 * Hastane dashboard verilerini getirir
 * Backend: GET /api/hospital/dashboard
 * hospitalService.getDashboard() ile uyumlu
 */
export const useHospitalDashboard = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['hospital', 'dashboard', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.HOSPITAL.DASHBOARD),
    select: (res) => res.data,
    ...dashboardQueryConfig({ enabled: !!userId }),
  });
};

// ============================================================================
// PROFİL YÖNETİMİ HOOKS - hospitalService profil fonksiyonları ile uyumlu
// ============================================================================

/**
 * Hastane profilini getirir
 * Backend: GET /api/hospital (root endpoint)
 * hospitalService.getProfile() ile uyumlu
 */
export const useHospitalProfile = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['hospital', 'profile', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.HOSPITAL.PROFILE),
    select: (res) => res.data,
    ...profileQueryConfig({ enabled: !!userId }),
  });
};

/**
 * Hastane profilini günceller
 * Backend: PUT /api/hospital (root endpoint)
 * hospitalService.updateProfile() ile uyumlu
 */
export const useUpdateHospitalProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData) => apiRequest.put(ENDPOINTS.HOSPITAL.PROFILE, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'profile']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success(toastMessages.profile.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.profile.updateError });
    },
  });
};

/**
 * Hastane profil tamamlanma oranını getirir
 * Backend: GET /api/hospital/profile/completion
 * hospitalService.getProfileCompletion() ile uyumlu
 */
export const useHospitalProfileCompletion = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['hospital', 'profile', 'completion', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.HOSPITAL.PROFILE_COMPLETION),
    select: (res) => res.data,
    ...profileQueryConfig({ enabled: !!userId }),
  });
};

// ============================================================================
// İŞ İLANI YÖNETİMİ HOOKS - hospitalService iş ilanı fonksiyonları ile uyumlu
// ============================================================================

/**
 * Hastane iş ilanlarını listeler
 * Backend: GET /api/hospital/jobs
 * hospitalService.getJobs() ile uyumlu
 */
export const useHospitalJobs = (filters = {}) => {
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    queryKey: ['hospital', 'jobs', cleanParams],
    queryFn: () => {
      const queryString = buildQueryString(cleanParams);
      return apiRequest.get(`${ENDPOINTS.HOSPITAL.JOBS}${queryString}`);
    },
    select: (res) => res.data,
    ...listQueryConfig({ keepPreviousData: true }), // SEMI_REALTIME: İş ilanları
  });
};

/**
 * Hastane iş ilanı oluşturur
 * Backend: POST /api/hospital/jobs
 * hospitalService.createJob() ile uyumlu
 */
export const useCreateHospitalJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobData) => apiRequest.post(ENDPOINTS.HOSPITAL.JOBS, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'jobs']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success(toastMessages.job.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.job.createError });
    },
  });
};

/**
 * Hastane iş ilanını getirir
 * Backend: GET /api/hospital/jobs/:jobId
 * hospitalService.getJobById() ile uyumlu
 */
export const useHospitalJobById = (jobId) => {
  return useQuery({
    queryKey: ['hospital', 'job', jobId],
    queryFn: () => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.JOBS}/:jobId`, { jobId });
      return apiRequest.get(endpoint);
    },
    select: (res) => res.data,
    ...detailQueryConfig({ enabled: !!jobId }), // SEMI_REALTIME: İş ilanı detayı
  });
};

/**
 * Hastane iş ilanını günceller
 * Backend: PUT /api/hospital/jobs/:jobId
 * hospitalService.updateJob() ile uyumlu
 */
export const useUpdateHospitalJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, jobData }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.JOBS}/:jobId`, { jobId });
      return apiRequest.put(endpoint, jobData);
    },
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['hospital', 'job', variables.jobId], response);
      queryClient.invalidateQueries(['hospital', 'jobs']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success(toastMessages.job.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.job.updateError });
    },
  });
};

/**
 * Hastane iş ilanı durumunu günceller
 * Backend: PATCH /api/hospital/jobs/:jobId/status
 * hospitalService.updateJobStatus() ile uyumlu
 */
export const useUpdateHospitalJobStatus = ({ enableToast = true } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status_id, reason }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.JOBS}/:jobId/status`, { jobId });
      return apiRequest.patch(endpoint, { status_id, reason });
    },
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['hospital', 'job', variables.jobId], response);
      queryClient.invalidateQueries(['hospital', 'jobs']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      queryClient.invalidateQueries(['hospital', 'applications']); // Başvuru sayfasını güncelle
      if (enableToast) {
        showToast.success(toastMessages.job.statusUpdateSuccess);
      }
    },
    onError: (err) => {
      if (enableToast) {
        showToast.error(err, { defaultMessage: toastMessages.job.statusUpdateError });
      }
    },
  });
};

/**
 * Hastane iş ilanını tekrar gönderir (resubmit)
 * Backend: POST /api/hospital/jobs/:jobId/resubmit
 * hospitalService.resubmitJob() ile uyumlu
 */
export const useResubmitHospitalJob = ({ enableToast = true } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => {
      const endpoint = buildEndpoint(ENDPOINTS.HOSPITAL.JOB_RESUBMIT, { id: jobId });
      return apiRequest.post(endpoint, {});
    },
    onSuccess: (response, jobId) => {
      queryClient.setQueryData(['hospital', 'job', jobId], response);
      queryClient.invalidateQueries(['hospital', 'jobs']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      if (enableToast) {
        showToast.success(toastMessages.job.resubmitSuccess);
      }
    },
    onError: (err) => {
      if (enableToast) {
        showToast.error(err, { defaultMessage: toastMessages.job.resubmitError });
      }
    },
  });
};

// ============================================================================
// BAŞVURU YÖNETİMİ HOOKS - hospitalService başvuru fonksiyonları ile uyumlu
// ============================================================================

/**
 * Hastanenin tüm ilanlarına gelen başvuruları getirir
 * Backend: GET /api/hospital/applications
 * hospitalService.getAllApplications() ile uyumlu
 */
export const useHospitalApplications = (filters = {}) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  // OPTİMİZASYON: Boş parametreleri filtrele ve memoize et
  const cleanParams = useMemo(() => {
    return Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    );
  }, [filters]);

  return useQuery({
    // GÜVENLİK: userId queryKey'e eklendi - farklı kullanıcılar için ayrı cache
    queryKey: ['hospital', 'applications', userId, cleanParams],
    queryFn: () => {
      const queryString = buildQueryString(cleanParams);
      return apiRequest.get(`${ENDPOINTS.HOSPITAL.APPLICATIONS}${queryString}`);
    },
    select: (res) => res.data,
    // OPTİMİZE: liveQueryConfig yerine listQueryConfig kullan (cache ile hızlandırma)
    // SEMI_REALTIME strateji: 30s cache, refetchOnMount: false, refetchOnWindowFocus: false
    ...listQueryConfig({ 
      enabled: !!userId, 
      keepPreviousData: true, // Filtre değiştiğinde önceki veriyi göster (daha iyi UX)
    }),
  });
};

/**
 * Tek bir başvuruyu detaylı getirir
 * Backend: GET /api/hospital/applications/:applicationId
 * hospitalService.getApplicationById() ile uyumlu
 */
export const useHospitalApplicationDetail = (applicationId) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['hospital', 'application', userId, applicationId],
    queryFn: async () => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.APPLICATIONS}/:applicationId`, { applicationId });
      const response = await apiRequest.get(endpoint);
      // Backend: { success: true, data: { application: {...} } }
      // apiRequest.get() zaten response.data döndürüyor: { success: true, data: { application: {...} } }
      // select ile res.data yapıyoruz: { application: {...} }
      return response;
    },
    select: (res) => {
      // Backend'den gelen: { success: true, data: { application: {...} } }
      // apiRequest.get() zaten response.data döndürüyor: { success: true, data: { application: {...} } }
      // select ile res.data.data yapıyoruz: { application: {...} }
      return res?.data?.data || res?.data || res;
    },
    ...liveQueryConfig({ 
      enabled: !!applicationId && !!userId,
    }),
  });
};

/**
 * Belirli bir iş ilanına gelen başvuruları getirir
 * Backend: GET /api/hospital/jobs/:jobId/applications
 * hospitalService.getApplications() ile uyumlu
 */
export const useHospitalJobApplications = (jobId, filters = {}) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    // GÜVENLİK: userId queryKey'e eklendi - farklı kullanıcılar için ayrı cache
    queryKey: ['hospital', 'job-applications', userId, jobId, cleanParams],
    queryFn: () => {
      const queryString = buildQueryString(cleanParams);
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.JOBS}/:jobId/applications`, { jobId });
      return apiRequest.get(`${endpoint}${queryString}`);
    },
    select: (res) => res.data,
    ...liveQueryConfig({ 
      enabled: !!jobId && !!userId,
      keepPreviousData: false,
    }),
  });
};

/**
 * Başvuru durumunu günceller
 * Backend: PUT /api/hospital/applications/:applicationId/status
 * hospitalService.updateApplicationStatus() ile uyumlu
 * Backend status_id (integer) ve notes (string) bekliyor - Admin modülüyle uyumlu
 */
export const useUpdateApplicationStatus = ({ enableToast = true } = {}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: ({ applicationId, status_id, notes }) => {
      // ENDPOINTS.HOSPITAL.APPLICATION_STATUS = '/hospital/applications/:id/status'
      const endpoint = `/hospital/applications/${applicationId}/status`;
      return apiRequest.put(endpoint, { status_id, notes });
    },
    // OPTİMİSTİC UPDATE: Kullanıcı anında geri bildirim alır
    onMutate: async (variables) => {
      // Tüm ilgili query'leri iptal et (refetch'i önle)
      await queryClient.cancelQueries(['hospital', 'applications', userId]);
      await queryClient.cancelQueries(['hospital', 'application', variables.applicationId]);
      await queryClient.cancelQueries(['hospital', 'job-applications']);
      
      // Önceki verileri sakla (rollback için)
      const previousApplications = queryClient.getQueryData(['hospital', 'applications', userId]);
      const previousApplicationDetail = queryClient.getQueryData(['hospital', 'application', variables.applicationId]);
      
      // Optimistic update: Applications listesi
      if (previousApplications?.data?.applications) {
        queryClient.setQueryData(['hospital', 'applications', userId], (old) => ({
          ...old,
          data: {
            ...old.data,
            applications: old.data.applications.map(app => 
              app.id === variables.applicationId 
                ? { ...app, status_id: variables.status_id, notes: variables.notes }
                : app
            )
          }
        }));
      }
      
      // Optimistic update: Application detail
      if (previousApplicationDetail?.data?.application) {
        queryClient.setQueryData(['hospital', 'application', variables.applicationId], (old) => ({
          ...old,
          data: {
            ...old.data,
            application: {
              ...old.data.application,
              status_id: variables.status_id,
              notes: variables.notes
            }
          }
        }));
      }
      
      return { previousApplications, previousApplicationDetail };
    },
    onSuccess: (data, variables, context) => {
      // Server'dan gelen gerçek veri ile güncelle
      queryClient.setQueryData(['hospital', 'application', variables.applicationId], data);
      queryClient.invalidateQueries(['hospital', 'applications', userId]);
      queryClient.invalidateQueries(['hospital', 'job-applications']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      if (enableToast) {
        showToast.success(toastMessages.application.updateStatusSuccess);
      }
    },
    onError: (err, variables, context) => {
      // Hata durumunda rollback yap
      if (context?.previousApplications) {
        queryClient.setQueryData(['hospital', 'applications', userId], context.previousApplications);
      }
      if (context?.previousApplicationDetail) {
        queryClient.setQueryData(['hospital', 'application', variables.applicationId], context.previousApplicationDetail);
      }
      if (enableToast) {
        showToast.error(err, { defaultMessage: toastMessages.application.updateStatusError });
      }
    },
  });
};

// ============================================================================
// DEPARTMAN YÖNETİMİ HOOKS - hospitalService departman fonksiyonları ile uyumlu
// ============================================================================

/**
 * Hastane departmanlarını getirir
 * Backend: GET /api/hospital/departments
 * hospitalService.getDepartments() ile uyumlu
 */
export const useHospitalDepartments = () => {
  return useQuery({
    queryKey: ['hospital', 'departments'],
    queryFn: () => apiRequest.get(ENDPOINTS.HOSPITAL.DEPARTMENTS),
    select: (res) => res.data,
    ...listQueryConfig(), // SEMI_REALTIME: Departmanlar
  });
};

/**
 * Hastane departmanı ekler
 * Backend: POST /api/hospital/departments
 * hospitalService.addDepartment() ile uyumlu
 */
export const useCreateHospitalDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentData) => apiRequest.post(ENDPOINTS.HOSPITAL.DEPARTMENTS, departmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'departments']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success(toastMessages.department.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.department.createError });
    },
  });
};

/**
 * Hastane departmanını günceller
 * Backend: PUT /api/hospital/departments/:departmentId
 * hospitalService.updateDepartment() ile uyumlu
 */
export const useUpdateHospitalDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, departmentData }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.DEPARTMENTS}/:departmentId`, { departmentId });
      return apiRequest.put(endpoint, departmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'departments']);
      showToast.success(toastMessages.department.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.department.updateError });
    },
  });
};

/**
 * Hastane departmanını siler
 * Backend: DELETE /api/hospital/departments/:departmentId
 * hospitalService.deleteDepartment() ile uyumlu
 */
export const useDeleteHospitalDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentId) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.DEPARTMENTS}/:departmentId`, { departmentId });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'departments']);
      showToast.success(toastMessages.department.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.department.deleteError });
    },
  });
};

// ============================================================================
// İLETİŞİM BİLGİSİ YÖNETİMİ HOOKS - hospitalService iletişim fonksiyonları ile uyumlu
// ============================================================================

/**
 * Hastane iletişim bilgilerini getirir
 * Backend: GET /api/hospital/contacts
 * hospitalService.getContacts() ile uyumlu
 */
export const useHospitalContacts = () => {
  return useQuery({
    queryKey: ['hospital', 'contacts'],
    queryFn: () => apiRequest.get(ENDPOINTS.HOSPITAL.CONTACTS),
    select: (res) => res.data,
    ...listQueryConfig(), // SEMI_REALTIME: İletişim bilgileri
  });
};

/**
 * Hastane iletişim bilgisi ekler
 * Backend: POST /api/hospital/contacts
 * hospitalService.addContact() ile uyumlu
 */
export const useCreateHospitalContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactData) => apiRequest.post(ENDPOINTS.HOSPITAL.CONTACTS, contactData),
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'contacts']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success(toastMessages.contact.createSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.contact.createError });
    },
  });
};

/**
 * Hastane iletişim bilgisi günceller
 * Backend: PUT /api/hospital/contacts/:contactId
 * hospitalService.updateContact() ile uyumlu
 */
export const useUpdateHospitalContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, contactData }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.CONTACTS}/:contactId`, { contactId });
      return apiRequest.put(endpoint, contactData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'contacts']);
      showToast.success(toastMessages.contact.updateSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.contact.updateError });
    },
  });
};

/**
 * Hastane iletişim bilgisi siler
 * Backend: DELETE /api/hospital/contacts/:contactId
 * hospitalService.deleteContact() ile uyumlu
 */
export const useDeleteHospitalContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.CONTACTS}/:contactId`, { contactId });
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'contacts']);
      showToast.success(toastMessages.contact.deleteSuccess);
    },
    onError: (err) => {
      showToast.error(err, { defaultMessage: toastMessages.contact.deleteError });
    },
  });
};

export const useDeactivateHospitalAccount = () => {
  return useMutation({
    mutationFn: () => apiRequest.post(ENDPOINTS.HOSPITAL.ACCOUNT_DEACTIVATE),
  });
};

// ============================================================================
// DOKTOR PROFİL GÖRÜNTÜLEME HOOKS - hospitalService doktor fonksiyonları ile uyumlu
// ============================================================================

/**
 * Hastane tarafından doktor profillerini listeler
 * Backend: GET /api/hospital/doctors
 * hospitalService.getDoctorProfiles() ile uyumlu
 */
export const useHospitalDoctorProfiles = (filters = {}) => {
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    queryKey: ['hospital', 'doctor-profiles', cleanParams],
    queryFn: () => {
      const queryString = buildQueryString(cleanParams);
      return apiRequest.get(`${ENDPOINTS.HOSPITAL.DOCTORS}${queryString}`);
    },
    select: (res) => res.data,
    ...listQueryConfig({ 
      keepPreviousData: true,
    }), // SEMI_REALTIME: Doktor profilleri
  });
};

/**
 * Hastane tarafından tek doktor profilini detaylı görüntüleme
 * Backend: GET /api/hospital/doctors/:doctorId
 * hospitalService.getDoctorProfileDetail() ile uyumlu
 */
export const useHospitalDoctorProfileDetail = (doctorId) => {
  return useQuery({
    queryKey: ['hospital', 'doctor-profile', doctorId],
    queryFn: () => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.DOCTORS}/:doctorId`, { doctorId });
      return apiRequest.get(endpoint);
    },
    select: (res) => res.data,
    ...detailQueryConfig({ enabled: !!doctorId }), // SEMI_REALTIME: Doktor profil detayı
  });
};

// ============================================================================
// DEFAULT EXPORT - Hospital hooks object
// ============================================================================

const useHospital = {
  // Dashboard
  useHospitalDashboard,
  
  // Profile
  useHospitalProfile,
  useUpdateHospitalProfile,
  useHospitalProfileCompletion,
  
  // Jobs
  useHospitalJobs,
  useHospitalJobById,
  useCreateHospitalJob,
  useUpdateHospitalJob,
  useUpdateHospitalJobStatus,
  useResubmitHospitalJob,
  
  // Applications
  useHospitalApplications,
  useHospitalJobApplications,
  useUpdateApplicationStatus,
  
  // Departments
  useHospitalDepartments,
  useCreateHospitalDepartment,
  useUpdateHospitalDepartment,
  useDeleteHospitalDepartment,
  
  // Contacts
  useHospitalContacts,
  useCreateHospitalContact,
  useUpdateHospitalContact,
  useDeleteHospitalContact,
  useDeactivateHospitalAccount,
  
  // Doctor Profiles
  useHospitalDoctorProfiles,
  useHospitalDoctorProfileDetail,
};

// ============================================================================
// HELPER FUNCTIONS - Profil tamamlanma ve validasyon fonksiyonları
// ============================================================================

/**
 * Hastane profil tamamlanma oranını hesaplar
 * Backend hospitalService.getProfileCompletion() ile uyumlu
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const requiredFields = [
    'institution_name',
    'city',
    'address',
    'phone',
    'email',
  ];

  const optionalFields = [
    'website',
    'about',
  ];

  let completedRequired = 0;
  let completedOptional = 0;

  requiredFields.forEach(field => {
    if (profile[field]?.toString().trim()) completedRequired++;
  });

  optionalFields.forEach(field => {
    if (profile[field]?.toString().trim()) completedOptional++;
  });

  const requiredPercentage = (completedRequired / requiredFields.length) * 80;
  const optionalPercentage = (completedOptional / optionalFields.length) * 20;

  return Math.round(requiredPercentage + optionalPercentage);
};

// Manuel validation fonksiyonu kaldırıldı - Zod schema'ları kullanılıyor

export default useHospital;

