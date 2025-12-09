import { useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notification.service';
import type { NotificationsResponse } from '@/types/notification';

export interface UseNotificationsParams {
  showUnreadOnly?: boolean;
  limit?: number;
}

const RETRY_DELAY = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);

export const useNotifications = (params: UseNotificationsParams = {}) => {
  const { showUnreadOnly = false, limit = 20 } = params;

  const query = useInfiniteQuery({
    queryKey: ['notifications', { showUnreadOnly }],
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
