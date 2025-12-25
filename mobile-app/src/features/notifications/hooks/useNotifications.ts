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

import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notification.service';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { useToast } from '@/providers/ToastProvider';
import { showAlert } from '@/utils/alert';
import { queryKeys } from '@/api/queryKeys';

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

  const queryClient = useQueryClient();
  const notificationListenerRef = useRef<any>(null);
  
  // Foreground notification listener: Uygulama açıkken bildirim gelirse otomatik refresh
  useEffect(() => {
    notificationListenerRef.current = pushNotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('[useNotifications] Foreground notification received:', notification);
        // Bildirim geldiğinde query'leri invalidate et ve aktif query'leri hemen refetch et
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notifications.all,
          exact: false,
          refetchType: 'active', // Sadece aktif query'leri refetch et
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notifications.unreadCount(),
          refetchType: 'active',
        });
      }
    );

    return () => {
      if (notificationListenerRef.current) {
        try {
          // Cleanup listener on unmount
          const { removeNotificationSubscription } = require('expo-notifications');
          removeNotificationSubscription(notificationListenerRef.current);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [queryClient]);
  
  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications.list({ showUnreadOnly }),
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
    staleTime: 1000 * 30, // 30 saniye stale time (bildirimler canlı olmalı ama çok sık değil)
    gcTime: 1000 * 60 * 2, // 2 dakika cache
    refetchOnMount: 'always', // Mount olduğunda her zaman fresh data çek (bildirimler önemli)
    refetchOnWindowFocus: false, // Focus'ta otomatik refetch yapma (React Native'de window focus yok, useFocusEffect kullanılıyor)
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
    refetchInterval: (query) => {
      // Sadece aktif query'ler için polling yap (arka planda çalışırken)
      // Screen focus olduğunda useFocusEffect ile manuel refetch yapılıyor
      return query.state.data ? 1000 * 60 : false; // 1 dakikada bir otomatik yenile (sadece data varsa)
    },
    retry: 2,
    retryDelay: RETRY_DELAY,
  });

  // Refetch fonksiyonunu override et: pages'i sıfırla ve sadece ilk sayfayı fetch et
  const safeRefetch = React.useCallback(async () => {
    // Query'yi reset et (pages'i sıfırla, duplicate önlemek için)
    // resetQueries query'yi invalidate eder ve otomatik olarak ilk sayfayı fetch eder
    await queryClient.resetQueries({ 
      queryKey: queryKeys.notifications.list({ showUnreadOnly }),
      exact: true, // Sadece tam eşleşen query'leri reset et
    });
    // resetQueries zaten query'yi invalidate ediyor ve otomatik refetch yapıyor
    // Ama emin olmak için manuel refetch yapalım
    return query.refetch();
  }, [queryClient, showUnreadOnly, query]);

  // Pages'leri birleştir ve duplicate'leri temizle (cache sorunlarını önlemek için)
  const notifications = React.useMemo(() => {
    if (!query.data?.pages || query.data.pages.length === 0) {
      return [];
    }
    
    const allNotifications = query.data.pages.flatMap((page) => page.data || []);
    
    // Duplicate bildirimleri temizle (ID'ye göre unique) - en son gelen versiyonu tut
    const notificationMap = new Map<number, typeof allNotifications[0]>();
    allNotifications.forEach((item) => {
      // Eğer aynı ID'li bildirim varsa, en yeni olanı tut (createdAt veya created_at'e göre)
      const existing = notificationMap.get(item.id);
      if (!existing) {
        notificationMap.set(item.id, item);
      } else {
        // camelCase (createdAt) veya snake_case (created_at) destekle
        const existingDate = new Date(existing.createdAt || existing.created_at || 0).getTime();
        const currentDate = new Date(item.createdAt || item.created_at || 0).getTime();
        if (currentDate > existingDate) {
          notificationMap.set(item.id, item);
        }
      }
    });
    
    const uniqueNotifications = Array.from(notificationMap.values());
    
    // En yeni bildirimler önce gelsin (createdAt veya created_at'e göre sırala)
    return uniqueNotifications.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [query.data]);

  // isRead veya is_read field'ını kullan (camelCase öncelikli)
  const unreadCount = notifications.filter((item) => {
    // Backend'den camelCase (isRead) geliyor, geriye dönük uyumluluk için is_read de kontrol et
    return !(item.isRead ?? item.is_read ?? false);
  }).length;

  // Badge count'u unread count ile senkronize et (iOS/Android app icon badge)
  useEffect(() => {
    const updateBadgeCount = async () => {
      try {
        await pushNotificationService.setBadgeCount(unreadCount);
      } catch (error) {
        // Badge count hatası kritik değil, sessizce ignore et
        console.warn('[useNotifications] Badge count güncellenemedi:', error);
      }
    };

    // Unread count değiştiğinde badge'i güncelle
    updateBadgeCount();
  }, [unreadCount]);

  return {
    ...query,
    notifications,
    unreadCount,
    refetch: safeRefetch, // Override refetch: pages'i sıfırla ve yeniden fetch et
  };
};

/**
 * Okunmamış bildirim sayısı hook'u
 * NOT: Bu hook şu anda kullanılmıyor. DashboardScreen'de useNotifications'un unreadCount'u kullanılıyor.
 * Eğer sadece sayı gerekiyorsa ve liste gerekmeyen durumlarda bu hook kullanılabilir.
 * 
 * @returns Okunmamış bildirim sayısı
 */
export const useUnreadCount = () => {
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await notificationService.getUnreadCount();
      return response.count;
    },
    staleTime: 1000 * 30, // 30 saniye stale time (bildirimler canlı olmalı ama çok sık değil)
    gcTime: 1000 * 60 * 2, // 2 dakika cache
    refetchOnMount: true, // Mount olduğunda stale ise refetch yap (her zaman değil, çok agresif olmasın)
    refetchOnWindowFocus: false, // Focus'ta otomatik refetch yapma (manuel refresh kullanılacak)
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
    refetchInterval: 30000, // 30 saniyede bir otomatik refetch (okunmamış sayısı için polling)
  });

  const unreadCount = query.data ?? 0;

  // Badge count'u unread count ile senkronize et (iOS/Android app icon badge)
  useEffect(() => {
    const updateBadgeCount = async () => {
      try {
        await pushNotificationService.setBadgeCount(unreadCount);
      } catch (error) {
        // Badge count hatası kritik değil, sessizce ignore et
        console.warn('[useUnreadCount] Badge count güncellenemedi:', error);
      }
    };

    // Unread count değiştiğinde badge'i güncelle
    updateBadgeCount();
  }, [unreadCount]);

  return {
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
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
    onMutate: async (notificationId) => {
      // Optimistic update: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      
      // Tüm notification query'lerini güncelle
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all, exact: false },
        (old: any) => {
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((notification: any) => {
                if (notification.id === notificationId) {
                  return {
                    ...notification,
                    isRead: true,
                    is_read: true, // Geriye dönük uyumluluk
                    read_at: new Date().toISOString(),
                  };
                }
                return notification;
              }) || [],
            })),
          };
        }
      );
      
      // Unread count'u da güncelle
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (typeof old === 'number') {
            return Math.max(0, old - 1);
          }
          return old;
        }
      );
    },
    onSuccess: () => {
      // Başarılı olduğunda query'leri invalidate et (fresh data için)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: () => {
      // Hata durumunda optimistic update'i geri al
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
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
    onMutate: async (notificationIds) => {
      // Optimistic update: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      
      // Tüm notification query'lerini güncelle
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all, exact: false },
        (old: any) => {
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((notification: any) => {
                if (notificationIds.includes(notification.id)) {
                  return {
                    ...notification,
                    isRead: true,
                    is_read: true, // Geriye dönük uyumluluk
                    read_at: new Date().toISOString(),
                  };
                }
                return notification;
              }) || [],
            })),
          };
        }
      );
      
      // Unread count'u da güncelle
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (typeof old === 'number') {
            return Math.max(0, old - notificationIds.length);
          }
          return old;
        }
      );
    },
    onSuccess: (data) => {
      // Başarılı olduğunda query'leri invalidate et (fresh data için)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      showToast(`${data.count} bildirim okundu işaretlendi`, 'success');
    },
    onError: () => {
      // Hata durumunda optimistic update'i geri al
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
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
      // Tüm notification list query'lerini invalidate et
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false, // Tüm alt query'leri de invalidate et
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      showToast('Bildirim silindi', 'success');
    },
    onError: (error: Error) => {
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
      // Tüm notification list query'lerini invalidate et
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false, // Tüm alt query'leri de invalidate et
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      showToast(`${data.deleted_count} bildirim silindi`, 'success');
    },
    onError: (error: Error) => {
      console.error('Failed to delete notifications:', error);
      showToast('Bildirimler silinemedi', 'error');
    },
  });
};
