/**
 * Notifications Hooks - React Query ile entegre
 * Service katmanı kaldırıldı - API çağrıları doğrudan hook'larda
 * Bildirim işlemleri için React Query hooks
 * 
 * @author MediKariyer Development Team
 * @version 2.1.0
 * @since 2024
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS } from '@config/api.js';

// Bildirimler listesi
export const useNotifications = (filters = {}) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => {
      const queryString = new URLSearchParams(filters).toString();
      return apiRequest.get(`${ENDPOINTS.NOTIFICATIONS.LIST}${queryString ? `?${queryString}` : ''}`);
    },
    staleTime: 30 * 1000, // 30 saniye (bildirimler için kısa)
    keepPreviousData: true,
  });
};

// Okunmamış bildirim sayısı
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiRequest.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
    staleTime: 30 * 1000, // 30 saniye
    refetchInterval: 60 * 1000, // 1 dakikada bir otomatik yenile
    retry: 1, // Sadece 1 kez retry yap
    retryDelay: 5000, // 5 saniye bekle
    enabled: true, // Her zaman çalışsın ama error'da durur
  });
};

// Bildirim okundu işaretle
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => {
      const endpoint = ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', notificationId);
      return apiRequest.patch(endpoint);
    },
    onSuccess: () => {
      // Bildirimler listesini yenile
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      console.error('Mark as read error:', error);
    }
  });
};

// Tüm bildirimleri okundu işaretle
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
    onSuccess: () => {
      // Tüm bildirim query'lerini yenile
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      console.error('Mark all as read error:', error);
    }
  });
};

// Bildirim silme
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => {
      const endpoint = ENDPOINTS.NOTIFICATIONS.DELETE.replace(':id', notificationId);
      return apiRequest.delete(endpoint);
    },
    onSuccess: () => {
      // Bildirimler listesini yenile
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      console.error('Delete notification error:', error);
    }
  });
};

// Bildirim ayarları getirme
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: () => apiRequest.get(ENDPOINTS.NOTIFICATIONS.SETTINGS),
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

// Bildirim ayarları güncelleme
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => apiRequest.put(ENDPOINTS.NOTIFICATIONS.SETTINGS, settings),
    onSuccess: (data) => {
      // Ayarları cache'e kaydet
      queryClient.setQueryData(['notifications', 'settings'], data);
    },
    onError: (error) => {
      console.error('Update notification settings error:', error);
    }
  });
};
