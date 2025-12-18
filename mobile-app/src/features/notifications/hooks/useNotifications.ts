/**
 * @file useNotifications.ts
 * @description Bildirim hook'ları - Tüm bildirim işlemleri için hook'lar
 * 
 * Hook'lar:
 * - useNotifications: Bildirim listesi (infinite query)
 * - useUnreadCount: Okunmamış bildirim sayısı
 * - useMarkAsRead: Bildirimi okundu işaretle
 * - useMarkAllAsRead: Tüm bildirimleri okundu işaretle
 * - useDeleteNotification: Tek bildirim silme
 * - useDeleteNotifications: Çoklu bildirim silme
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notification.service';
import { useToast } from '@/providers/ToastProvider';
import { showAlert } from '@/utils/alert';
import type { NotificationsResponse } from '@/types/notification';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEYS = {
  notifications: 'notifications',
  unreadCount: 'unreadNotificationCount',
} as const;

const RETRY_DELAY = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);

// ============================================================================
// TYPES
// ============================================================================

export interface UseNotificationsParams {
  showUnreadOnly?: boolean;
  limit?: number;
}

// ============================================================================
// QUERY HOOKS (Read Operations)
// ============================================================================

/**
 * Bildirim listesi hook'u (infinite scroll destekli)
 * @param params - Filtreleme parametreleri
 * @returns Bildirim listesi, pagination ve query durumu
 */
export const useNotifications = (params: UseNotificationsParams = {}) => {
  const { showUnreadOnly = false, limit = 20 } = params;

  const query = useInfiniteQuery({
    queryKey: [QUERY_KEYS.notifications, { showUnreadOnly }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await notificationService.listNotifications({
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit,
        is_read: showUnreadOnly ? false : undefined,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.has_next ? pagination.current_page + 1 : undefined;
    },
    retry: 2,
    retryDelay: RETRY_DELAY,
  });

  const notifications =
    (query.data as InfiniteData<NotificationsResponse, number> | undefined)?.pages.flatMap(
      (page) => page.data
    ) ?? [];

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return {
    ...query,
    notifications,
    unreadCount,
  };
};

/**
 * Okunmamış bildirim sayısı hook'u
 * @returns Okunmamış bildirim sayısı
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.unreadCount],
    queryFn: async () => {
      const response = await notificationService.getUnreadCount();
      return response.count;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    refetchInterval: 1000 * 60 * 2, // 2 dakikada bir otomatik yenile
  });
};

// ============================================================================
// MUTATION HOOKS (Write Operations)
// ============================================================================

/**
 * Bildirimi okundu işaretle hook'u
 * @returns Mutation fonksiyonu
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => 
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Bildirim listesini ve sayacı yenile
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.unreadCount] });
    },
    onError: () => {
      showAlert.error('Bildirim okundu olarak işaretlenemedi. Lütfen tekrar deneyin.');
    },
  });
};

/**
 * Tüm bildirimleri okundu işaretle hook'u
 * @returns Mutation fonksiyonu
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (notificationIds: number[]) => {
      // Tüm bildirimleri sırayla okundu işaretle
      await Promise.all(
        notificationIds.map((id) => notificationService.markAsRead(id))
      );
      return { success: true, count: notificationIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.unreadCount] });
      showToast(`${data.count} bildirim okundu işaretlendi`, 'success');
    },
    onError: () => {
      showAlert.error('Bildirimler okundu işaretlenemedi. Lütfen tekrar deneyin.');
    },
  });
};

/**
 * Tek bildirim silme hook'u
 * @returns Mutation fonksiyonu
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (notificationId: number) => 
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.unreadCount] });
      showToast('Bildirim silindi', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete notification:', error);
      showToast('Bildirim silinemedi', 'error');
    },
  });
};

/**
 * Çoklu bildirim silme hook'u
 * @returns Mutation fonksiyonu
 */
export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (notificationIds: number[]) => 
      notificationService.deleteNotifications(notificationIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.unreadCount] });
      showToast(`${data.deleted_count} bildirim silindi`, 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete notifications:', error);
      showToast('Bildirimler silinemedi', 'error');
    },
  });
};
