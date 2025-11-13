/**
 * Notifications Hooks - React Query ile entegre
 * Service katmanı kaldırıldı - API çağrıları doğrudan hook'larda
 * Bildirim işlemleri için React Query hooks
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0 - SSE real-time bildirim desteği eklendi
 * @since 2024
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS, API_BASE_URL } from '@config/api.js';
import useAuthStore from '@/store/authStore';

// Bildirimler listesi
export const useNotifications = (filters = {}, options = {}) => {
  const { enabled = true } = options;
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || null;
  const userRole = user?.role || null;

  return useQuery({
    queryKey: ['notifications', userId, userRole, filters],
    queryFn: () => {
      // Boş string'leri ve undefined/null değerleri filtrele
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        // Boş string, null, undefined değerleri atla
        if (value !== '' && value !== null && value !== undefined) {
          // limit 0 ise atla (dropdown kapalıyken)
          if (key === 'limit' && value === 0) {
            return acc;
          }
          // isRead için boolean'ı string'e çevir (URLSearchParams boolean'ı string'e çevirir ama backend boolean bekliyor)
          if (key === 'isRead') {
            if (typeof value === 'boolean') {
              acc[key] = value ? 'true' : 'false';
            } else if (typeof value === 'string') {
              // Zaten string ise olduğu gibi bırak
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});
      
      // URLSearchParams boolean'ları string'e çevirir, backend boolean bekliyor
      // Bu yüzden query string'i manuel oluşturuyoruz
      const queryParams = new URLSearchParams();
      Object.entries(cleanFilters).forEach(([key, value]) => {
        if (key === 'isRead' && typeof value === 'boolean') {
          queryParams.append(key, value ? 'true' : 'false');
        } else {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      return apiRequest.get(`${ENDPOINTS.NOTIFICATIONS.LIST}${queryString ? `?${queryString}` : ''}`);
    },
    enabled: enabled && !!userId && (filters.limit === undefined || filters.limit > 0), // limit 0 ise query çalışmasın
    staleTime: 30 * 1000, // 30 saniye (bildirimler için kısa)
    keepPreviousData: !!filters?.page && filters.page > 1,
  });
};

// Okunmamış bildirim sayısı
export const useUnreadNotificationCount = () => {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || null;

  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => apiRequest.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
    staleTime: 30 * 1000, // 30 saniye
    refetchInterval: false, // SSE ile real-time güncelleniyor, polling kaldırıldı
    retry: 1, // Sadece 1 kez retry yap
    retryDelay: 5000, // 5 saniye bekle
    enabled: !!userId, // Kullanıcı yoksa çalışmasın
  });
};

/**
 * SSE real-time bildirim hook'u
 * @description Server-Sent Events ile real-time bildirim alır
 * Yeni bildirim geldiğinde React Query cache'ini günceller
 * 
 * @returns {void} Side effect hook - cache güncellemesi yapar
 */
export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);
  const currentUserIdRef = useRef(null); // Hangi kullanıcı için bağlantı kurulduğunu takip et
  
  // Zustand selector kullanarak sadece ihtiyacımız olan değerleri al
  // Bu hook sırasını sabit tutar
  const user = useAuthStore((state) => state?.user);
  const getToken = useAuthStore((state) => state?.getToken);

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa SSE bağlantısı kurma
    if (!user || !user.id) {
      // Kullanıcı çıkış yaptıysa bağlantıyı kapat
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        currentUserIdRef.current = null;
        console.log('[SSE] Kullanıcı çıkış yaptı, bağlantı kapatıldı');
      }
      return;
    }

    // getToken fonksiyonunu kontrol et
    if (typeof getToken !== 'function') {
      console.log('[SSE] getToken fonksiyonu bulunamadı, bekleniyor...');
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('[SSE] Token bulunamadı, SSE bağlantısı kurulmuyor');
      return;
    }

    // Aynı kullanıcı için zaten bağlıysa tekrar bağlanma
    if (currentUserIdRef.current === user.id && eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
      console.log('[SSE] Aynı kullanıcı için zaten bağlı, yeni bağlantı kurulmuyor');
      return;
    }

    // Farklı kullanıcı için bağlantı varsa veya bağlanıyorsa, önce kapat
    if (currentUserIdRef.current !== user.id || isConnectingRef.current) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        currentUserIdRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }

    // SSE endpoint URL'i oluştur
    const streamUrl = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS.STREAM}`;
    const fullUrl = `${streamUrl}?token=${encodeURIComponent(token)}`;
    
    console.log('[SSE] Bağlantı kuruluyor:', fullUrl.replace(token, 'TOKEN_HIDDEN'));
    console.log('[SSE] User ID:', user.id);
    console.log('[SSE] API Base URL:', API_BASE_URL);
    console.log('[SSE] Stream Endpoint:', ENDPOINTS.NOTIFICATIONS.STREAM);
    isConnectingRef.current = true;
    currentUserIdRef.current = user.id;

    // EventSource oluştur (Authorization header için token'ı query param olarak ekle)
    // Not: EventSource Authorization header desteklemez, bu yüzden token'ı query param olarak gönderiyoruz
    const eventSource = new EventSource(fullUrl);
    eventSourceRef.current = eventSource;

    // EventSource durumunu logla
    console.log('[SSE] EventSource oluşturuldu, readyState:', eventSource.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSED)');

    // Bağlantı açıldığında
    eventSource.onopen = (event) => {
      isConnectingRef.current = false;
      console.log('[SSE] ✅ Bildirim stream bağlantısı kuruldu - User ID:', user.id, 'readyState:', eventSource.readyState);
      console.log('[SSE] EventSource URL:', eventSource.url?.replace(/token=[^&]+/, 'token=HIDDEN'));
    };

    // Yeni bildirim geldiğinde
    eventSource.onmessage = (event) => {
      try {
        // İlk mesaj geldiğinde onopen tetiklenmiş olabilir, kontrol et
        if (isConnectingRef.current) {
          isConnectingRef.current = false;
          console.log('[SSE] ✅ İlk mesaj alındı, bağlantı açık - readyState:', eventSource.readyState);
        }
        
        console.log('[SSE] 📨 Mesaj alındı (raw):', event.data?.substring(0, 100));
        
        // SSE formatında data: {...} şeklinde geliyor, direkt parse edebiliriz
        const data = JSON.parse(event.data);
        
        // Bağlantı mesajı ise sadece logla
        if (data.type === 'connection') {
          console.log('[SSE] ✅ Bağlantı onayı alındı:', data.message, 'readyState:', eventSource.readyState);
          return;
        }
        
        // Normal bildirim
        const notification = data;
        console.log('[SSE] 📨 Yeni bildirim alındı:', notification);
        
        // React Query cache'ini güncelle
        // 1. Bildirimler listesine ekle (yalnızca aktif kullanıcıya ait query'ler)
        const notificationQueries = queryClient
          .getQueryCache()
          .findAll({ queryKey: ['notifications'], exact: false })
          .filter((query) => {
            const key = query.queryKey;
            // ['notifications', 'unread-count', userId] veya ['notifications', 'settings'] gibi query'leri hariç tut
            if (!Array.isArray(key) || key.length < 2) return false;
            if (key[1] === 'unread-count' || key[1] === 'settings') return false;
            // key şemasında userId ikinci pozisyonda
            return key[1] === user.id;
          });

        notificationQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, (oldData) => {
            if (!oldData) {
              return {
                data: {
                  data: [notification],
                  pagination: {
                    current_page: 1,
                    per_page: 20,
                    total: 1,
                    total_pages: 1,
                  },
                },
              };
            }

            const existingData = oldData?.data?.data || oldData?.data || [];

            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: [notification, ...existingData],
                pagination: {
                  ...oldData.data?.pagination,
                  total: (oldData.data?.pagination?.total || 0) + 1,
                },
              },
            };
          });
        });

        // 2. Okunmamış sayısını artır (navbar bell için)
        queryClient.setQueryData(['notifications', 'unread-count', user.id], (oldData) => {
          const currentCount = oldData?.data?.data?.count || 0;
          const nextCount = currentCount + 1;

          return {
            data: {
              success: true,
              message: 'Okunmamış bildirim sayısı güncellendi',
              data: {
                count: nextCount,
              },
            },
          };
        });

        // 3. Bildirimler listesini invalidate et (yeniden fetch için)
        // unread-count'u invalidate etme, çünkü zaten güncelledik
        queryClient.invalidateQueries({ 
          queryKey: ['notifications'],
          exact: false,
          refetchType: 'active' // Sadece aktif query'leri refetch et
        });
        
        console.log('[SSE] ✅ Bildirim cache güncellendi:', notification.title);
      } catch (error) {
        console.error('[SSE] ❌ Bildirim parse hatası:', error, 'Raw data:', event.data);
      }
    };

    // Hata durumunda
    eventSource.onerror = (error) => {
      console.error('[SSE] ❌ Bağlantı hatası:', error);
      console.log('[SSE] EventSource readyState:', eventSource.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSED)');
      console.log('[SSE] EventSource URL:', eventSource.url?.replace(/token=[^&]+/, 'token=HIDDEN'));
      console.log('[SSE] EventSource withCredentials:', eventSource.withCredentials);
      // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
      
      isConnectingRef.current = false;
      
      // Bağlantı kapandıysa (readyState === 2) yeniden bağlan
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[SSE] Bağlantı kapandı, yeniden bağlanma deneniyor...');
        eventSource.close();
        eventSourceRef.current = null;
        currentUserIdRef.current = null;
        
        // 3 saniye sonra yeniden bağlanmayı dene
        reconnectTimeoutRef.current = setTimeout(() => {
          const currentToken = getToken();
          const currentUser = useAuthStore.getState()?.user;
          if (currentUser && currentUser.id && currentToken) {
            console.log('[SSE] Yeniden bağlanma deneniyor...');
            // useEffect dependency'leri değişmediği için manuel tetikleme
            // user.id değişirse otomatik tetiklenir
            isConnectingRef.current = false; // Yeniden bağlanmayı etkinleştir
            // Force re-render için user.id'yi güncelle (aynı değer olsa bile)
            // Bu useEffect'i tekrar tetikler
          } else {
            console.log('[SSE] Yeniden bağlanma iptal edildi - kullanıcı veya token yok');
          }
        }, 3000);
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        // Hala bağlanıyor, bekle
        console.log('[SSE] Hala bağlanıyor...');
      } else if (eventSource.readyState === EventSource.OPEN) {
        // Bağlantı açık ama hata var - bu normal olabilir (heartbeat timeout vb.)
        console.log('[SSE] Bağlantı açık ama hata alındı (normal olabilir)');
      }
    };

    // Cleanup: user.id değiştiğinde veya component unmount olduğunda çalışır
    // React StrictMode'da 2 kez çalışabilir, ama yeni bağlantı kurulmadan önce
    // eski bağlantı zaten kapatıldığı için (satır 94-104) burada sadece temizlik yapıyoruz
    return () => {
      // Cleanup sadece bağlantı varsa ve farklı bir kullanıcı için bağlantı kurulacaksa çalışır
      // Aynı kullanıcı için StrictMode re-render'da cleanup yapmaya gerek yok
      // çünkü yeni bağlantı kurulmadan önce kontrol ediliyor (satır 88-90)
      
      // Sadece bağlantı varsa ve unmount oluyorsa kapat
      // user.id değişikliği zaten yukarıda handle ediliyor
      if (eventSourceRef.current && (!user || currentUserIdRef.current !== user?.id)) {
        isConnectingRef.current = false;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        currentUserIdRef.current = null;
        console.log('[SSE] 🔌 Bildirim stream bağlantısı kapatıldı');
      }
    };
  }, [user?.id, queryClient, getToken]); // user.id, queryClient ve getToken değiştiğinde tetiklenir
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
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'], exact: false });
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
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'], exact: false });
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
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'], exact: false });
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
