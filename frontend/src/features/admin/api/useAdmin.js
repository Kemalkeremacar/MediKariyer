/**
 * useAdmin.js - React Query hooks
 * Backend adminService.js'e birebir uygun olarak tasarlanmış
 * Tüm admin işlemleri için React Query hooks
 * 
 * Backend Uyumluluğu:
 * - adminService.js'deki tüm fonksiyonlarla eşleşir
 * - adminController.js'deki tüm endpoint'lerle uyumlu
 * - adminSchemas.js'deki validation kurallarına uygun
 * 
 * @author MediKariyer Development Team
 * @version 4.0.0
 * @since 2024
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../services/http/client';
import { ENDPOINTS, buildEndpoint, buildQueryString } from '@config/api.js';
import { showToast } from '@/utils/toastUtils';

// Query Keys - Backend adminService.js'ye birebir uygun
export const QUERY_KEYS = {
  // Kullanıcı yönetimi
  USERS: ['admin', 'users'],
  USER_DETAIL: ['admin', 'user'],
  USER_CREATE: ['admin', 'user-create'],
  
  // İş ilanı yönetimi
  JOBS: ['admin', 'jobs'],
  JOB_DETAIL: ['admin', 'job'],
  JOB_UPDATE: ['admin', 'job-update'],
  JOB_STATUS: ['admin', 'job-status'],
  JOB_APPROVE: ['admin', 'job-approve'],
  JOB_REVISION: ['admin', 'job-revision'],
  JOB_REJECT: ['admin', 'job-reject'],
  JOB_HISTORY: ['admin', 'job-history'],
  JOB_DELETE: ['admin', 'job-delete'],
  
  // Başvuru yönetimi
  APPLICATIONS: ['admin', 'applications'],
  APPLICATION_DETAIL: ['admin', 'application'],
  APPLICATION_STATUS: ['admin', 'application-status'],
  APPLICATION_DELETE: ['admin', 'application-delete'],
  
  // Bildirim yönetimi
  NOTIFICATIONS: ['admin', 'notifications'],
  NOTIFICATION_DETAIL: ['admin', 'notification'],
  NOTIFICATION_UPDATE: ['admin', 'notification-update'],
  NOTIFICATION_DELETE: ['admin', 'notification-delete'],
  
  // İletişim mesajları
  CONTACT_MESSAGES: ['admin', 'contact-messages'],
  CONTACT_STATISTICS: ['admin', 'contact-statistics'],
  CONTACT_MESSAGE_DETAIL: ['admin', 'contact-message'],
  CONTACT_MESSAGE_DELETE: ['admin', 'contact-message-delete'],
  
  // Dashboard ve Analytics
  DASHBOARD: ['admin', 'dashboard'],
  
  // Fotoğraf onay sistemi (yeni sistem)
  PHOTO_REQUESTS: ['admin', 'photo-requests'],
};

// ============================================================================
// KULLANICI YÖNETİMİ - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * Kullanıcı listesini getirir - Backend: getUsers
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, JSON.stringify(filters)],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.ADMIN.USERS}${queryString}`);
    },
    keepPreviousData: true,
    staleTime: 0, // Verileri hemen stale yap, filtreleme değiştiğinde yenile
  });
}

/**
 * Tek kullanıcı getirir - Backend: getUserDetails
 * @param {string|number} userId - Kullanıcı ID'si
 * @returns {Object} React Query result
 */
export function useUserById(userId) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_DETAIL, userId],
    queryFn: async () => {
      const response = await apiRequest.get(buildEndpoint(ENDPOINTS.ADMIN.USER_DETAIL, { id: userId }));
      return response.data; // Axios response'dan data'yı çıkar
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}


/**
 * Kullanıcı onay durumunu günceller - Backend: updateUserApproval
 * Backend approved (boolean) ve reason (string) bekliyor
 * @returns {Object} React Query mutation
 */
export function useUpdateUserApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, approved, reason }) => 
      apiRequest.patch(buildEndpoint(ENDPOINTS.ADMIN.USER_APPROVAL, { id: userId }), { 
        approved, 
        reason 
      }),
    onSuccess: (data, variables) => {
      const { userId, approved } = variables;
      
      // Ana sayfadaki kullanıcı listesini yenile (tüm filtrelerle)
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'users'],
        exact: false 
      });
      
      // Alternatif: Tüm admin query'lerini invalidate et
      queryClient.invalidateQueries({ 
        queryKey: ['admin'],
        exact: false 
      });
      
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      
      // Detay sayfasındaki kullanıcı verisini manuel güncelle
      queryClient.setQueryData([QUERY_KEYS.USER_DETAIL, userId], (oldData) => {
        if (oldData?.data?.user) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              user: {
                ...oldData.data.user,
                is_approved: approved
              }
            }
          };
        }
        return oldData;
      });
    },
  });
}

/**
 * Kullanıcı durumunu günceller - Backend: updateUserStatus
 * @returns {Object} React Query mutation
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, field, value, reason }) => 
      apiRequest.patch(buildEndpoint(ENDPOINTS.ADMIN.USER_STATUS, { id: userId }), { 
        field, 
        value,
        reason 
      }),
    onSuccess: (data, variables) => {
      const { userId, field, value } = variables;
      
      // Ana sayfadaki kullanıcı listesini yenile (tüm filtrelerle)
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'users'],
        exact: false 
      });
      
      // Alternatif: Tüm admin query'lerini invalidate et
      queryClient.invalidateQueries({ 
        queryKey: ['admin'],
        exact: false 
      });
      
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      
      // Detay sayfasındaki kullanıcı verisini manuel güncelle
      queryClient.setQueryData([QUERY_KEYS.USER_DETAIL, userId], (oldData) => {
        if (oldData?.data?.user) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              user: {
                ...oldData.data.user,
                [field]: value
              }
            }
          };
        }
        return oldData;
      });
    },
  });
}


// ============================================================================
// İŞ İLANI YÖNETİMİ - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * Tüm iş ilanlarını getirir - Backend: getAllJobs
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useAdminJobs(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.JOBS, filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.ADMIN.JOBS}${queryString}`);
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}

/**
 * Tek iş ilanı getirir - Backend: getJobDetails
 * @param {string|number} jobId - İş ilanı ID'si
 * @returns {Object} React Query result
 */
export function useJobById(jobId) {
  // ID'yi güvenli hale getir ("3,3" gibi değerleri 33'e çevirmek yerine 3'e düşür)
  const jobIdClean = (() => {
    if (jobId == null) return jobId;
    const onlyDigits = String(jobId).match(/\d+/);
    return onlyDigits ? Number(onlyDigits[0]) : jobId;
  })();
  return useQuery({
    queryKey: [QUERY_KEYS.JOB_DETAIL, jobIdClean],
    queryFn: () => apiRequest.get(buildEndpoint(ENDPOINTS.ADMIN.JOB_DETAIL, { id: jobIdClean })),
    enabled: !!jobIdClean,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * İş ilanını günceller - Backend: updateJob
 * @returns {Object} React Query mutation
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, jobData }) => 
      apiRequest.put(buildEndpoint(ENDPOINTS.ADMIN.JOB_UPDATE, { id: jobId }), jobData),
    onSuccess: (data, variables) => {
      const { jobId, jobData } = variables;
      
      // Ana sayfadaki iş ilanları listesini yenile
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      
      // Detay sayfasındaki iş ilanı verisini manuel güncelle
      queryClient.setQueryData([QUERY_KEYS.JOB_DETAIL, jobId], (oldData) => {
        if (oldData?.data?.job) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              job: {
                ...oldData.data.job,
                ...jobData
              }
            }
          };
        }
        return oldData;
      });
    },
  });
}

/**
 * İş ilanı durumunu günceller - Backend: updateJobStatus
 * Backend status_id (integer) bekliyor - job_statuses tablosundan ID
 * @returns {Object} React Query mutation
 */
export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status_id, reason }) => {
      const payload = { status_id };
      // Reason varsa ekle, yoksa ekleme
      if (reason && reason.trim()) {
        payload.reason = reason.trim();
      }
      return apiRequest.patch(buildEndpoint(ENDPOINTS.ADMIN.JOB_STATUS, { id: jobId }), payload);
    },
    onSuccess: (data, variables) => {
      const { jobId, status_id } = variables;
      
      // Ana sayfadaki iş ilanları listesini yenile
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      
      // Detay sayfasındaki iş ilanı verisini manuel güncelle
      queryClient.setQueryData([QUERY_KEYS.JOB_DETAIL, jobId], (oldData) => {
        if (oldData?.data?.job) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              job: {
                ...oldData.data.job,
                status_id: status_id
              }
            }
          };
        }
        return oldData;
      });
    },
  });
}

/**
 * İş ilanını siler - Backend: deleteJob
 * @returns {Object} React Query mutation
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => apiRequest.delete(buildEndpoint(ENDPOINTS.ADMIN.JOB_DELETE, { id: jobId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
}

/**
 * İş ilanını onaylar - Backend: approveJob
 * @returns {Object} React Query mutation
 */
export function useApproveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => apiRequest.post(buildEndpoint(ENDPOINTS.ADMIN.JOB_APPROVE, { id: jobId }), {}),
    onSuccess: (data, jobId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_DETAIL, jobId] });
      showToast.success('İş ilanı onaylandı');
    },
    onError: (error) => {
      showToast.error('İş ilanı onaylanırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    },
  });
}

/**
 * İş ilanı için revizyon talep eder - Backend: requestRevision
 * @returns {Object} React Query mutation
 */
export function useRequestRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, revision_note }) => 
      apiRequest.post(buildEndpoint(ENDPOINTS.ADMIN.JOB_REVISION, { id: jobId }), { revision_note }),
    onSuccess: (data, variables) => {
      const { jobId } = variables;
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_DETAIL, jobId] });
      showToast.success('Revizyon talebi gönderildi');
    },
    onError: (error) => {
      showToast.error('Revizyon talebi gönderilirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    },
  });
}

/**
 * İş ilanını reddeder - Backend: rejectJob
 * @returns {Object} React Query mutation
 */
export function useRejectJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, rejection_reason }) => 
      apiRequest.post(buildEndpoint(ENDPOINTS.ADMIN.JOB_REJECT, { id: jobId }), { rejection_reason }),
    onSuccess: (data, variables) => {
      const { jobId } = variables;
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_DETAIL, jobId] });
      showToast.success('İş ilanı reddedildi');
    },
    onError: (error) => {
      showToast.error('İş ilanı reddedilirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    },
  });
}

/**
 * İş ilanı statü geçmişini getirir - Backend: getJobHistory
 * @param {string|number} jobId - İş ilanı ID'si
 * @returns {Object} React Query result
 */
export function useJobHistory(jobId) {
  return useQuery({
    queryKey: [QUERY_KEYS.JOB_HISTORY, jobId],
    queryFn: () => apiRequest.get(buildEndpoint(ENDPOINTS.ADMIN.JOB_HISTORY, { id: jobId })),
    enabled: !!jobId,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// ============================================================================
// BAŞVURU YÖNETİMİ - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * Tüm başvuruları getirir - Backend: getAllApplications
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useApplications(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.APPLICATIONS, filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.ADMIN.APPLICATIONS}${queryString}`);
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}

/**
 * Tek başvuru getirir - Backend: getApplicationDetails
 * @param {string|number} applicationId - Başvuru ID'si
 * @returns {Object} React Query result
 */
export function useApplicationById(applicationId) {
  return useQuery({
    queryKey: [QUERY_KEYS.APPLICATION_DETAIL, applicationId],
    queryFn: () => apiRequest.get(buildEndpoint(ENDPOINTS.ADMIN.APPLICATION_DETAIL, { id: applicationId })),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

/**
 * Başvuru durumunu günceller - Backend: updateApplicationStatus
 * @returns {Object} React Query mutation
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status_id, reason }) => 
      apiRequest.put(buildEndpoint(ENDPOINTS.ADMIN.APPLICATION_STATUS, { id: applicationId }), { 
        status_id, 
        reason 
      }),
    onSuccess: (data, variables) => {
      const { applicationId, status_id } = variables;
      
      // Ana sayfadaki başvuru listesini yenile
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPLICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      
      // Detay sayfasındaki başvuru verisini manuel güncelle
      queryClient.setQueryData([QUERY_KEYS.APPLICATION_DETAIL, applicationId], (oldData) => {
        if (oldData?.data?.application) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              application: {
                ...oldData.data.application,
                status_id: status_id
              }
            }
          };
        }
        return oldData;
      });
    },
  });
}

/**
 * Başvuruyu siler - Backend: deleteApplication
 * @returns {Object} React Query mutation
 */
export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) => 
      apiRequest.delete(buildEndpoint(ENDPOINTS.ADMIN.APPLICATION_DELETE, { id: applicationId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPLICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
}

// ============================================================================
// BİLDİRİM YÖNETİMİ - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * Admin bildirimlerini getirir - Backend: getAllNotifications
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useAdminNotifications(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.ADMIN.NOTIFICATIONS}${queryString}`);
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}

/**
 * Tek bildirim getirir - Backend: getNotificationById
 * @param {string|number} notificationId - Bildirim ID'si
 * @returns {Object} React Query result
 */
export function useNotificationById(notificationId) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATION_DETAIL, notificationId],
    queryFn: () => apiRequest.get(buildEndpoint(ENDPOINTS.ADMIN.NOTIFICATION_DETAIL, { id: notificationId })),
    enabled: !!notificationId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}


/**
 * Bildirim günceller - Backend: updateNotification
 * @returns {Object} React Query mutation
 */
export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notificationId, notificationData }) => 
      apiRequest.patch(buildEndpoint(ENDPOINTS.ADMIN.NOTIFICATION_UPDATE, { id: notificationId }), notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION_DETAIL] });
    },
  });
}

/**
 * Bildirim siler - Backend: deleteNotification
 * @returns {Object} React Query mutation
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => 
      apiRequest.delete(buildEndpoint(ENDPOINTS.ADMIN.NOTIFICATION_DELETE, { id: notificationId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION_DETAIL] });
    },
  });
}


// ============================================================================
// İLETİŞİM MESAJLARI YÖNETİMİ - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * İletişim mesajlarını getirir - Backend: contactController.getContactMessages
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useContactMessages(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACT_MESSAGES, filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

/**
 * İletişim mesajı istatistiklerini getirir - Backend: contactController.getContactStatistics
 * @returns {Object} React Query result
 */
export function useContactStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.CONTACT_STATISTICS,
    queryFn: () => apiRequest.get(ENDPOINTS.ADMIN.CONTACT_STATISTICS),
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
}

/**
 * Tek iletişim mesajını getirir - Backend: contactController.getContactMessageById
 * @param {string|number} messageId - Mesaj ID'si
 * @returns {Object} React Query result
 */
export function useContactMessageById(messageId) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACT_MESSAGE_DETAIL, messageId],
    queryFn: () => apiRequest.get(ENDPOINTS.ADMIN.CONTACT_MESSAGE_BY_ID(messageId)),
    enabled: !!messageId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

/**
 * İletişim mesajını siler - Backend: contactController.deleteContactMessage
 * @returns {Object} React Query mutation
 */
export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId) => apiRequest.delete(buildEndpoint(ENDPOINTS.ADMIN.CONTACT_MESSAGE_DELETE, { id: messageId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACT_MESSAGES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACT_STATISTICS] });
    },
  });
}

// ============================================================================
// DASHBOARD VE ANALYTICS - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * Admin dashboard verilerini getirir - Backend: getDashboardData
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useDashboard(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const response = await apiRequest.get(`${ENDPOINTS.ADMIN.DASHBOARD}${queryString}`);
      return response.data; // Axios response'dan data'yı çıkar
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir yenile
  });
}


// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * Tüm admin hooks'ları export eder
 * 
 * Kullanıcı Yönetimi:
 * - useUsers, useUserById, useCreateUser
 * - useUpdateUserApproval, useUpdateUserStatus, useDeleteUser
 * 
 * İş İlanı Yönetimi:
 * - useAdminJobs, useJobById, useUpdateJob
 * - useUpdateJobStatus, useDeleteJob
 * 
 * Başvuru Yönetimi:
 * - useApplications, useApplicationById
 * - useUpdateApplicationStatus, useDeleteApplication
 * 
 * Bildirim Yönetimi:
 * - useAdminNotifications, useNotificationById
 * - useUpdateNotification, useDeleteNotification
 * 
 * İletişim Mesajları:
 * - useContactMessages, useContactStatistics, useContactMessageById
 * - useDeleteContactMessage
 * 
 * Dashboard ve Analytics:
 * - useDashboard
 * 
 * Fotoğraf Onay Sistemi (Yeni):
 * - usePhotoRequests, useReviewPhotoRequest
 * 
 * Legacy:
 * - usePendingApprovals
 */

// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ - Backend adminService.js ile uyumlu
// ============================================================================

/**
 * Fotoğraf onay taleplerini getirir - Backend: getPhotoRequests
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function usePhotoRequests(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.PHOTO_REQUESTS, JSON.stringify(filters)],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`/admin/photo-requests${queryString}`);
    },
    staleTime: 30 * 1000, // 30 saniye
    cacheTime: 5 * 60 * 1000, // 5 dakika
    retry: 2
  });
}

/**
 * Fotoğraf talebini onayla veya reddet - Backend: reviewPhotoRequest
 * @returns {Object} React Query mutation
 */
export function useReviewPhotoRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, action, reason }) => {
      return apiRequest.patch(`/admin/photo-requests/${requestId}`, {
        action,
        reason
      });
    },
    onSuccess: (data, variables) => {
      // Photo requests listesini yenile
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PHOTO_REQUESTS] });
      
      // Doktor profil cache'lerini yenile (fotoğraf her yerde güncellensin)
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'photo-request-status'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['hospital', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['hospital', 'application'] });
      queryClient.invalidateQueries({ queryKey: ['hospital', 'doctors'] });
      
      const actionText = variables.action === 'approve' ? 'onaylandı' : 'reddedildi';
      const message = variables.action === 'approve' 
        ? `Fotoğraf talebi ${actionText}. Yeni fotoğraf otomatik olarak her yerde güncellendi.`
        : `Fotoğraf talebi ${actionText}.`;
      showToast.success(message);
    },
    onError: (error) => {
      console.error('Review photo request error:', error);
      showToast.error('İşlem başarısız: ' + (error.response?.data?.message || error.message));
    }
  });
}