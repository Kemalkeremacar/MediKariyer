/**
 * Hospital API Hook - React Query ile entegre
 * Service katmanı kaldırıldı - API çağrıları doğrudan hook'larda
 * Backend hospitalService.js ve hospitalController.js ile tam uyumlu
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
 * @version 2.2.0
 * @since 2024
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, fileUploadClient, createFormData } from '@/services/http/client';
import { ENDPOINTS, buildEndpoint, buildQueryString } from '@config/api.js';
import { showToast } from '@/utils/toastUtils';
import useAuthStore from '@/store/authStore';

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
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
    refetchOnWindowFocus: false,
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
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
    refetchOnWindowFocus: false,
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
      showToast.success('Profil başarıyla güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Profil güncellenemedi');
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
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    cacheTime: 5 * 60 * 1000, // 5 dakika cache
    refetchOnWindowFocus: false,
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
    staleTime: 30 * 1000, // 30 saniye - İş ilanları daha dinamik
    keepPreviousData: true,
    refetchOnWindowFocus: false,
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
      showToast.success('İş ilanı başarıyla oluşturuldu');
    },
    onError: (err) => {
      showToast.error(err.message || 'İş ilanı oluşturulamadı');
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
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 dakika
    refetchOnWindowFocus: false,
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
      showToast.success('İş ilanı başarıyla güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'İş ilanı güncellenemedi');
    },
  });
};

/**
 * Hastane iş ilanını siler
 * Backend: DELETE /api/hospital/jobs/:jobId
 * hospitalService.deleteJob() ile uyumlu
 */
export const useDeleteHospitalJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.JOBS}/:jobId`, { jobId });
      return apiRequest.delete(endpoint);
    },
    onSuccess: (_, jobId) => {
      queryClient.removeQueries(['hospital', 'jobs', jobId]);
      queryClient.invalidateQueries(['hospital', 'jobs']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success('İş ilanı başarıyla silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'İş ilanı silinemedi');
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
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    queryKey: ['hospital', 'applications', cleanParams],
    queryFn: () => {
      const queryString = buildQueryString(cleanParams);
      return apiRequest.get(`${ENDPOINTS.HOSPITAL.APPLICATIONS}${queryString}`);
    },
    select: (res) => res.data,
    staleTime: 2 * 60 * 1000, // 2 dakika
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Belirli bir iş ilanına gelen başvuruları getirir
 * Backend: GET /api/hospital/jobs/:jobId/applications
 * hospitalService.getApplications() ile uyumlu
 */
export const useHospitalJobApplications = (jobId, filters = {}) => {
  // Boş parametreleri filtrele
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => 
      value !== '' && value !== null && value !== undefined
    )
  );

  return useQuery({
    queryKey: ['hospital', 'job-applications', jobId, cleanParams],
    queryFn: () => {
      const queryString = buildQueryString(cleanParams);
      const endpoint = buildEndpoint(`${ENDPOINTS.HOSPITAL.JOBS}/:jobId/applications`, { jobId });
      return apiRequest.get(`${endpoint}${queryString}`);
    },
    select: (res) => res.data,
    staleTime: 2 * 60 * 1000, // 2 dakika
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: !!jobId,
  });
};

/**
 * Başvuru durumunu günceller
 * Backend: PUT /api/hospital/applications/:applicationId/status
 * hospitalService.updateApplicationStatus() ile uyumlu
 * Backend status_id (integer) ve notes (string) bekliyor - Admin modülüyle uyumlu
 */
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status_id, notes }) => {
      // ENDPOINTS.HOSPITAL.APPLICATION_STATUS = '/hospital/applications/:id/status'
      const endpoint = `/hospital/applications/${applicationId}/status`;
      return apiRequest.put(endpoint, { status_id, notes });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['hospital', 'applications', variables.applicationId], data);
      queryClient.invalidateQueries(['hospital', 'applications']);
      queryClient.invalidateQueries(['hospital', 'job-applications']);
      queryClient.invalidateQueries(['hospital', 'dashboard']);
      showToast.success('Başvuru durumu güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Başvuru durumu güncellenemedi');
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
    staleTime: 10 * 60 * 1000, // 10 dakika
    refetchOnWindowFocus: false,
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
      showToast.success('Departman başarıyla eklendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Departman eklenemedi');
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
      showToast.success('Departman başarıyla güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Departman güncellenemedi');
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
      showToast.success('Departman başarıyla silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'Departman silinemedi');
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
    staleTime: 10 * 60 * 1000, // 10 dakika
    refetchOnWindowFocus: false,
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
      showToast.success('İletişim bilgisi başarıyla eklendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'İletişim bilgisi eklenemedi');
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
      showToast.success('İletişim bilgisi başarıyla güncellendi');
    },
    onError: (err) => {
      showToast.error(err.message || 'İletişim bilgisi güncellenemedi');
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
      showToast.success('İletişim bilgisi başarıyla silindi');
    },
    onError: (err) => {
      showToast.error(err.message || 'İletişim bilgisi silinemedi');
    },
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
    staleTime: 2 * 60 * 1000, // 2 dakika
    keepPreviousData: true,
    refetchOnWindowFocus: false,
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
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 dakika
    refetchOnWindowFocus: false,
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
  useDeleteHospitalJob,
  
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

