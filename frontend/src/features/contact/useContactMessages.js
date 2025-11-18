/**
 * Contact Hooks - İletişim mesajları için React Query hooks
 * Service katmanı kaldırıldı - API çağrıları doğrudan hook'larda
 * Public ve Admin işlemleri için ayrılmış
 * 
 * Ana İşlevler:
 * - Public: Mesaj gönderme (ContactPage)
 * - Admin: Mesaj listeleme, görüntüleme, yanıtlama (ContactMessagesPage)
 * - Admin: Mesaj durumu güncelleme, silme
 * - Admin: İstatistikler ve toplu işlemler
 * 
 * Cache Stratejisi:
 * - Public mesajlar: ['contact', 'messages'] cache key'i
 * - Admin mesajlar: ['admin', 'contact-messages'] cache key'i
 * - 2 dakika stale time (mesajlar sık değişir)
 * - Background refetch var (admin için)
 * 
 * @author MediKariyer Development Team
 * @version 2.1.0
 * @since 2024
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS, buildEndpoint, buildQueryString } from '@config/api.js';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { adminQueryConfig, detailQueryConfig } from '@/config/queryConfig.js';

// 🔹 Public: Mesaj Gönderme Hook'u
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (messageData) => {
      return await apiRequest.post(ENDPOINTS.CONTACT.MESSAGES, messageData);
    },
    onSuccess: (result) => {
      showToast.success(toastMessages.message.sendSuccess);
    },
    onError: (error) => {
      console.error('Mesaj gönderme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.message.sendError });
    },
  });
};

// 🔹 Admin: Mesaj Listesi Hook'u
export const useContactMessages = (filters = {}) => {
  return useQuery({
    queryKey: ['admin', 'contact-messages', filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}${queryString}`);
    },
    select: (res) => res.data,
    ...adminQueryConfig({ keepPreviousData: true }), // REALTIME: Admin mesajları hemen görmeli
  });
};

// 🔹 Admin: Tek Mesaj Detayı Hook'u
export const useContactMessageById = (messageId) => {
  return useQuery({
    queryKey: ['admin', 'contact-message', messageId],
    queryFn: () => {
      const endpoint = buildEndpoint(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}/:id`, { id: messageId });
      return apiRequest.get(endpoint);
    },
    select: (res) => res.data,
    ...detailQueryConfig({ enabled: !!messageId }), // SEMI_REALTIME: Detay sayfası
  });
};

// 🔹 Admin: Mesaj Durumu Güncelleme Hook'u
export const useUpdateContactMessageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, status }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}/:id/status`, { id: messageId });
      return apiRequest.patch(endpoint, { status });
    },
    onSuccess: (data, variables) => {
      // Tek mesajı güncelle
      queryClient.setQueryData(['admin', 'contact-message', variables.messageId], data);
      // Mesaj listesini yenile
      queryClient.invalidateQueries(['admin', 'contact-messages']);
      // İstatistikleri yenile
      queryClient.invalidateQueries(['admin', 'contact-statistics']);
      
      showToast.success(toastMessages.message.updateStatusSuccess);
    },
    onError: (error) => {
      console.error('Mesaj durumu güncelleme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.message.updateStatusError });
    },
  });
};

// 🔹 Admin: Mesaja Yanıt Verme Hook'u
export const useReplyToContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, adminReply }) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}/:id/reply`, { id: messageId });
      return apiRequest.post(endpoint, { admin_reply: adminReply });
    },
    onSuccess: (data, variables) => {
      // Tek mesajı güncelle
      queryClient.setQueryData(['admin', 'contact-message', variables.messageId], data);
      // Mesaj listesini yenile
      queryClient.invalidateQueries(['admin', 'contact-messages']);
      // İstatistikleri yenile
      queryClient.invalidateQueries(['admin', 'contact-statistics']);
      
      showToast.success(toastMessages.message.replySuccess);
    },
    onError: (error) => {
      console.error('Yanıt gönderme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.message.replyError });
    },
  });
};

// 🔹 Admin: Mesaj Silme Hook'u
export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId) => {
      const endpoint = buildEndpoint(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}/:id`, { id: messageId });
      return apiRequest.delete(endpoint);
    },
    onSuccess: (data, messageId) => {
      // Silinen mesajı cache'den kaldır
      queryClient.removeQueries(['admin', 'contact-message', messageId]);
      // Mesaj listesini yenile
      queryClient.invalidateQueries(['admin', 'contact-messages']);
      // İstatistikleri yenile
      queryClient.invalidateQueries(['admin', 'contact-statistics']);
      
      showToast.success(toastMessages.message.deleteSuccess);
    },
    onError: (error) => {
      console.error('Mesaj silme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.message.deleteError });
    },
  });
};

// 🔹 Admin: İletişim İstatistikleri Hook'u
export const useContactStatistics = (dateRange = {}) => {
  return useQuery({
    queryKey: ['admin', 'contact-statistics', dateRange],
    queryFn: () => {
      const queryString = buildQueryString(dateRange);
      return apiRequest.get(`${ENDPOINTS.ADMIN.CONTACT_STATISTICS}${queryString}`);
    },
    select: (res) => res.data,
    refetchInterval: 60 * 1000, // 1 dakikada bir yenile
    refetchIntervalInBackground: true,
  });
};

// 🔹 Admin: Toplu Durum Güncelleme Hook'u
export const useBulkUpdateContactStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageIds, status }) => {
      return apiRequest.patch(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}/bulk-status`, { messageIds, status });
    },
    onSuccess: (data, variables) => {
      // Tüm mesaj query'lerini yenile
      queryClient.invalidateQueries(['admin', 'contact-messages']);
      queryClient.invalidateQueries(['admin', 'contact-statistics']);
      
      showToast.success(`${variables.messageIds.length} mesajın durumu güncellendi`);
    },
    onError: (error) => {
      console.error('Toplu durum güncelleme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.message.bulkUpdateError });
    },
  });
};

// 🔹 Admin: Toplu Mesaj Silme Hook'u
export const useBulkDeleteContactMessages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageIds) => {
      return apiRequest.delete(`${ENDPOINTS.ADMIN.CONTACT_MESSAGES}/bulk`, { data: { messageIds } });
    },
    onSuccess: (data, messageIds) => {
      // Silinen mesajları cache'den kaldır
      messageIds.forEach(messageId => {
        queryClient.removeQueries(['admin', 'contact-message', messageId]);
      });
      // Mesaj listesini yenile
      queryClient.invalidateQueries(['admin', 'contact-messages']);
      // İstatistikleri yenile
      queryClient.invalidateQueries(['admin', 'contact-statistics']);
      
      showToast.success(`${messageIds.length} mesaj silindi`);
    },
    onError: (error) => {
      console.error('Toplu mesaj silme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.message.bulkDeleteError });
    },
  });
};

// Default export - Tüm contact hooks
const useContactHooks = {
  // Public
  useSendMessage,
  
  // Admin
  useContactMessages,
  useContactMessageById,
  useUpdateContactMessageStatus,
  useReplyToContactMessage,
  useDeleteContactMessage,
  useContactStatistics,
  useBulkUpdateContactStatus,
  useBulkDeleteContactMessages,
};

export default useContactHooks;
