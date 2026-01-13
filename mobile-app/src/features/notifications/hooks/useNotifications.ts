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

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notification.service';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { devLog } from '@/utils/devLogger';
import { useToast } from '@/providers/ToastProvider';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { queryKeys } from '@/api/queryKeys';
import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';

const RETRY_DELAY = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);

/**
 * In-App State Update Handler
 * Backend'den gelen bildirimdeki action ve entity_id'ye göre ilgili query'leri invalidate eder
 * 
 * @param data - Bildirim data objesi (action, entity_id, entity_type içerir)
 * @param queryClient - React Query client
 */
const handleInAppStateUpdate = (
  data: import('@/types/notification').NotificationData | null | undefined,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  if (!data) {
    devLog.log('[handleInAppStateUpdate] No data found in notification');
    return;
  }
  
  const { action, entity_id, entity_type } = data;
  
  if (!action) {
    devLog.log('[handleInAppStateUpdate] No action found in notification data');
    return;
  }
  
  devLog.log(`[handleInAppStateUpdate] Action: ${action}, Entity ID: ${entity_id}, Entity Type: ${entity_type}`);
  
  switch (action) {
    case 'application_created':
    case 'application_status_changed':
    case 'application_withdrawn':
      // Başvuru ile ilgili bildirimler
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.applications.all,
        exact: false,
      });
      
      // Eğer entity_id varsa, spesifik başvuru detayını da invalidate et
      if (entity_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.applications.detail(Number(entity_id)),
        });
      }
      
      // Dashboard'daki özet sayıları da güncelle
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.all,
      });
      break;
      
    // NOT: profile_updated action'ı kaldırıldı - Profil güncelleme bildirimleri gönderilmiyor
    // case 'profile_updated':
    //   queryClient.invalidateQueries({ queryKey: queryKeys.profile.all, exact: false });
    //   break;
      
    case 'job_status_changed':
      // İş ilanı durumu değişikliği
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.jobs.all,
        exact: false,
      });
      
      // Eğer entity_id varsa, spesifik iş ilanı detayını da invalidate et
      if (entity_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobs.detail(Number(entity_id)),
        });
      }
      break;
      
    default:
      devLog.log(`[handleInAppStateUpdate] Unknown action: ${action}`);
      // Bilinmeyen action için sadece bildirim listesini güncelle
      break;
  }
};

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
  // NOT: Bu listener sadece bir kez oluşturulmalı, dependency array boş olmalı
  useEffect(() => {
    // Önceki listener varsa temizle (double mount durumunda)
    if (notificationListenerRef.current) {
      try {
        notificationListenerRef.current.remove();
      } catch {
        // Ignore cleanup errors
      }
    }
    
    notificationListenerRef.current = pushNotificationService.addNotificationReceivedListener(
      (notification) => {
        devLog.log('[useNotifications] Foreground notification received:', notification);
        const data = (notification.request?.content?.data || {}) as import('@/types/notification').NotificationData;
        
        // In-App State Update: Backend'den gelen action ve entity_id'ye göre ilgili query'leri invalidate et
        handleInAppStateUpdate(data, queryClient);
        
        // Bildirim listesini de güncelle
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
          // Expo Notifications subscription'ları .remove() metodu ile temizlenir
          notificationListenerRef.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        notificationListenerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Boş dependency - listener sadece mount'ta oluşturulmalı
  
  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications.list({ showUnreadOnly, limit }),
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
    refetchOnMount: true, // Mount olduğunda sadece stale ise refetch yap (always yerine true - döngüyü önlemek için)
    refetchOnWindowFocus: false, // Focus'ta otomatik refetch yapma (React Native'de window focus yok, useFocusEffect kullanılıyor)
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
    // refetchInterval kaldırıldı - polling sadece NotificationScreen'de yapılacak (useFocusEffect ile)
    retry: 2,
    retryDelay: RETRY_DELAY,
  });

  // Refetch fonksiyonunu stable tut - useCallback ile sarmalayarak sonsuz döngüyü önle
  // NOT: query.refetch her render'da aynı referans olmalı (React Query garantisi)
  // Ama güvenlik için useRef kullanıyoruz
  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;
  
  const safeRefetch = useCallback(async () => {
    return refetchRef.current();
  }, []); // Boş dependency - fonksiyon referansı hiç değişmeyecek

  // Pages'leri birleştir ve duplicate'leri temizle (cache sorunlarını önlemek için)
  const notifications = useMemo(() => {
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
        devLog.warn('[useNotifications] Badge count güncellenemedi:', error);
      }
    };

    // Unread count değiştiğinde badge'i güncelle
    updateBadgeCount();
  }, [unreadCount]);

  // Backend'den gelen toplam bildirim sayısı (pagination.total)
  const totalCount = useMemo(() => {
    return query.data?.pages?.[0]?.pagination?.total ?? 0;
  }, [query.data?.pages]);

  return {
    ...query,
    notifications,
    unreadCount,
    totalCount, // Backend'den gelen toplam bildirim sayısı
    refetch: safeRefetch, // Override refetch: pages'i sıfırla ve yeniden fetch et
  };
};

/**
 * Bildirim sayıları hook'u (toplam ve okunmamış)
 * Tek API çağrısı ile hem totalCount hem unreadCount döndürür
 * 
 * @returns Bildirim sayıları ve query durumu
 */
export const useUnreadCount = () => {
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await notificationService.getUnreadCount();
      return {
        unreadCount: response.unreadCount ?? response.count ?? 0,
        totalCount: response.totalCount ?? 0,
      };
    },
    staleTime: 1000 * 60, // 1 dakika stale time (push notification zaten anında günceller)
    gcTime: 1000 * 60 * 5, // 5 dakika cache
    refetchOnMount: true, // Mount olduğunda stale ise refetch yap
    refetchOnWindowFocus: false, // Focus'ta otomatik refetch yapma (push notification kullanılıyor)
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
  });

  const unreadCount = query.data?.unreadCount ?? 0;
  const totalCount = query.data?.totalCount ?? 0;

  // Badge count'u unread count ile senkronize et (iOS/Android app icon badge)
  useEffect(() => {
    const updateBadgeCount = async () => {
      try {
        await pushNotificationService.setBadgeCount(unreadCount);
      } catch (error) {
        // Badge count hatası kritik değil, sessizce ignore et
        devLog.warn('[useUnreadCount] Badge count güncellenemedi:', error);
      }
    };

    // Unread count değiştiğinde badge'i güncelle
    updateBadgeCount();
  }, [unreadCount]);

  return {
    unreadCount,
    totalCount,
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
  const alert = useAlertHelpers();

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
      // useUnreadCount hook'u { unreadCount, totalCount } objesi döndürüyor
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (!old) return old;
          const currentUnread = old.unreadCount ?? 0;
          return {
            ...old,
            unreadCount: Math.max(0, currentUnread - 1),
          };
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
      alert.error('Bildirim okundu olarak işaretlenemedi. Lütfen tekrar deneyin.');
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
  const alert = useAlertHelpers();

  return useMutation({
    mutationFn: async () => {
      // Backend'deki mark-all-read endpoint'ini kullan
      const response = await apiClient.patch<ApiResponse<{ count: number }>>(
        endpoints.notifications.markAllAsRead
      );
      return response.data.data;
    },
    onMutate: async () => {
      // Optimistic update: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      
      // Tüm notification query'lerini güncelle (tüm okunmamış bildirimleri okundu yap)
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all, exact: false },
        (old: any) => {
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((notification: any) => {
                // Sadece okunmamış bildirimleri okundu yap
                const isRead = notification.isRead ?? notification.is_read ?? false;
                if (!isRead) {
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
      
      // Unread count'u 0 yap
      // useUnreadCount hook'u { unreadCount, totalCount } objesi döndürüyor
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (!old) return { unreadCount: 0, totalCount: old?.totalCount ?? 0 };
          return {
            ...old,
            unreadCount: 0,
          };
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
      alert.error('Bildirimler okundu işaretlenemedi. Lütfen tekrar deneyin.');
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
    onMutate: async (notificationId) => {
      // Optimistic update: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      
      // Silinecek bildirimin okunmuş mu okunmamış mı olduğunu bul
      let wasUnread = false;
      
      // Tüm notification query'lerini güncelle (bildirimi kaldır)
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all, exact: false },
        (old: any) => {
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.filter((notification: any) => {
                if (notification.id === notificationId) {
                  // Silinen bildirimin okunmamış olup olmadığını kontrol et
                  const isRead = notification.isRead ?? notification.is_read ?? false;
                  if (!isRead) wasUnread = true;
                  return false; // Bu bildirimi çıkar
                }
                return true;
              }) || [],
            })),
          };
        }
      );
      
      // Sayıları güncelle
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalCount: Math.max(0, (old.totalCount ?? 0) - 1),
            unreadCount: wasUnread ? Math.max(0, (old.unreadCount ?? 0) - 1) : old.unreadCount,
          };
        }
      );
      
      return { wasUnread };
    },
    onSuccess: () => {
      // Başarılı olduğunda query'leri invalidate et (fresh data için)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      showToast('Bildirim silindi', 'success');
    },
    onError: (error: Error) => {
      // Hata durumunda optimistic update'i geri al
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      devLog.error('Failed to delete notification:', error);
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
    onMutate: async (notificationIds) => {
      // Optimistic update: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      
      // Silinecek okunmamış bildirim sayısını hesapla
      let unreadDeleteCount = 0;
      const idsSet = new Set(notificationIds);
      
      // Tüm notification query'lerini güncelle (bildirimleri kaldır)
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all, exact: false },
        (old: any) => {
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.filter((notification: any) => {
                if (idsSet.has(notification.id)) {
                  // Silinen bildirimin okunmamış olup olmadığını kontrol et
                  const isRead = notification.isRead ?? notification.is_read ?? false;
                  if (!isRead) unreadDeleteCount++;
                  return false; // Bu bildirimi çıkar
                }
                return true;
              }) || [],
            })),
          };
        }
      );
      
      // Sayıları güncelle
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalCount: Math.max(0, (old.totalCount ?? 0) - notificationIds.length),
            unreadCount: Math.max(0, (old.unreadCount ?? 0) - unreadDeleteCount),
          };
        }
      );
      
      return { unreadDeleteCount };
    },
    onSuccess: (data) => {
      // Başarılı olduğunda query'leri invalidate et (fresh data için)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      showToast(`${data.deleted_count} bildirim silindi`, 'success');
    },
    onError: (error: Error) => {
      // Hata durumunda optimistic update'i geri al
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      devLog.error('Failed to delete notifications:', error);
      showToast('Bildirimler silinemedi', 'error');
    },
  });
};

/**
 * Okunmuş bildirimleri temizle hook'u
 * @returns Mutation fonksiyonu
 */
export const useClearReadNotifications = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const alert = useAlertHelpers();

  return useMutation({
    mutationFn: () => notificationService.clearReadNotifications(),
    onMutate: async () => {
      // Optimistic update: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      
      // Önce mevcut okunmuş bildirim sayısını hesapla
      const currentData = queryClient.getQueryData<any>(queryKeys.notifications.unreadCount());
      const currentTotalCount = currentData?.totalCount ?? 0;
      const currentUnreadCount = currentData?.unreadCount ?? 0;
      // Okunmuş bildirim sayısı = toplam - okunmamış
      const readCount = Math.max(0, currentTotalCount - currentUnreadCount);
      
      // Tüm notification query'lerini güncelle (okunmuş bildirimleri kaldır)
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all, exact: false },
        (old: any) => {
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => {
              const filteredData = page.data?.filter((notification: any) => {
                const isRead = notification.isRead ?? notification.is_read ?? false;
                return !isRead; // Okunmamışları tut, okunmuşları çıkar
              }) || [];
              
              return {
                ...page,
                data: filteredData,
              };
            }),
          };
        }
      );

      // totalCount'u güncelle (okunmuş bildirimler siliniyor)
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.unreadCount() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalCount: Math.max(0, (old.totalCount ?? 0) - readCount),
            // unreadCount değişmez çünkü sadece okunmuşlar siliniyor
          };
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
      showToast(`${data.count} okunmuş bildirim temizlendi`, 'success');
    },
    onError: () => {
      // Hata durumunda optimistic update'i geri al
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      alert.error('Okunmuş bildirimler temizlenemedi. Lütfen tekrar deneyin.');
    },
  });
};