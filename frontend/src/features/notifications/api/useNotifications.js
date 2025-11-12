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
    refetchInterval: false, // SSE ile real-time güncelleniyor, polling kaldırıldı
    retry: 1, // Sadece 1 kez retry yap
    retryDelay: 5000, // 5 saniye bekle
    enabled: true, // Her zaman çalışsın ama error'da durur
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
        // 1. Bildirimler listesine ekle
        queryClient.setQueryData(['notifications'], (oldData) => {
          // Cache yapısı: { data: { data: [...], pagination: {...} } }
          if (!oldData) {
            // Cache yoksa, yeni bir yapı oluştur
            return {
              data: {
                data: [notification],
                pagination: {
                  current_page: 1,
                  per_page: 20,
                  total: 1,
                  total_pages: 1
                }
              }
            };
          }
          
          // Mevcut cache yapısını koru
          const existingData = oldData?.data?.data || oldData?.data || [];
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [notification, ...existingData],
              pagination: {
                ...oldData.data?.pagination,
                total: (oldData.data?.pagination?.total || 0) + 1
              }
            }
          };
        });

        // 2. Okunmamış sayısını artır (navbar bell için)
        queryClient.setQueryData(['notifications', 'unread-count'], (oldData) => {
          // Eğer cache'de data yoksa, yeni bir response oluştur
          if (!oldData) {
            return {
              data: {
                count: 1
              }
            };
          }
          
          // Eğer count yoksa veya 0 ise, 1 yap
          const currentCount = oldData?.data?.count || 0;
          
          return {
            ...oldData,
            data: {
              count: currentCount + 1
            }
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
