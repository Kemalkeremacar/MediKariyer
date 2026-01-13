/**
 * @file usePushNotifications.ts
 * @description React hook for push notifications
 * 
 * Usage:
 * - Call in App.tsx to initialize push notifications
 * - Automatically registers device token on mount
 * - Handles notification received and tapped events
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useRef } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { errorLogger } from '@/utils/errorLogger';
import { queryKeys } from '@/api/queryKeys';
import { navigationRef } from '@/navigation/navigationRef';
import { devLog } from '@/utils/devLogger';
import type { RootNavigationParamList } from '@/navigation/types';

/**
 * In-App State Update Handler
 * Backend'den gelen bildirimdeki action ve entity_id'ye göre ilgili query'leri invalidate eder
 * Bu sayede bildirim geldiğinde UI otomatik olarak güncellenir
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

export const usePushNotifications = () => {
  const navigation = useNavigation<NavigationProp<RootNavigationParamList>>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const appStateListener = useRef<any>(null);
  const lastNotificationResponse = useRef<any>(null);

  useEffect(() => {
    // Only register if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Register device token
    pushNotificationService.registerDeviceToken().catch((error) => {
      errorLogger.logError(error, {
        context: 'usePushNotifications - registerDeviceToken',
      });
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current =
      pushNotificationService.addNotificationReceivedListener(
        (notification) => {
          devLog.log('[usePushNotifications] Foreground notification received:', notification);
          const data = notification.request?.content?.data || {};
          
          // In-App State Update: Backend'den gelen action ve entity_id'ye göre ilgili query'leri invalidate et
          handleInAppStateUpdate(data, queryClient);
          
          // Bildirim listesini de güncelle
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.notifications.all,
            exact: false,
          });
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.notifications.unreadCount(),
          });
        }
      );

    // Listen for notification tapped by user (works for both foreground and background)
    responseListener.current =
      pushNotificationService.addNotificationResponseReceivedListener(
        (response) => {
          devLog.log('[usePushNotifications] Notification tapped:', response);
          lastNotificationResponse.current = response;
          
          // In-App State Update: Bildirime tıklandığında da state'i güncelle
          const data = (response.notification?.request?.content?.data || {}) as import('@/types/notification').NotificationData;
          handleInAppStateUpdate(data, queryClient);
          
          // Uygulama durumuna göre işlem yap
          const appState = AppState.currentState;
          if (appState === 'active') {
            // Uygulama açıkken tıklandı - hemen navigate et
            handleNotificationTapped(response);
          } else {
            // Uygulama kapalı/arka plandayken tıklandı - appState değiştiğinde handle edilecek
            // AppState listener'da handle edilecek
          }
        }
      );

    // Background notification handling: Uygulama kapalıyken gelen bildirimler
    // Uygulama açıldığında veya arka plandan döndüğünde son bildirimi kontrol et
    appStateListener.current = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && lastNotificationResponse.current) {
        // Uygulama aktif oldu ve bir bildirim tıklanmış
        // Kısa bir gecikme ile navigate et (navigation hazır olması için)
        setTimeout(() => {
          handleNotificationTapped(lastNotificationResponse.current);
          lastNotificationResponse.current = null; // İşlendikten sonra temizle
        }, 500);
      }
    });

    // Uygulama açıldığında bekleyen bildirimleri kontrol et (cold start)
    // Expo Notifications API'si uygulama kapalıyken tıklanan bildirimleri otomatik olarak
    // getLastNotificationResponseAsync() ile alabiliriz
    const checkLastNotification = async () => {
      try {
        const lastNotification = await Notifications.getLastNotificationResponseAsync();
        if (lastNotification) {
          devLog.log('[usePushNotifications] Last notification on app start:', lastNotification);
          // Uygulama açıldığında son bildirimi handle et
          setTimeout(() => {
            handleNotificationTapped(lastNotification);
          }, 1000); // Navigation hazır olması için bekle
        }
      } catch (error) {
        // Hata durumunda sessizce ignore et
        devLog.warn('[usePushNotifications] Failed to get last notification:', error);
      }
    };

    // Uygulama açıldığında kontrol et
    checkLastNotification();

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        try {
          notificationListener.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        notificationListener.current = null;
      }
      if (responseListener.current) {
        try {
          responseListener.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        responseListener.current = null;
      }
      if (appStateListener.current) {
        try {
          appStateListener.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        appStateListener.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, queryClient]);

  /**
   * Handle notification tapped - navigate to relevant screen (Deep Linking)
   * 
   * Notification data structure from backend:
   * - notificationId: Bildirim ID'si
   * - type: Bildirim tipi (application, job, system, message, etc.)
   * - application_id: Başvuru ID'si (varsa)
   * - job_id: İş ilanı ID'si (varsa)
   * - job_title: İş ilanı başlığı (varsa)
   * - hospital_name: Hastane adı (varsa)
   * - status: Durum bilgisi (varsa)
   */
  const handleNotificationTapped = (
    response: any
  ) => {
    try {
      const data = response.notification.request.content.data;
      const notificationId = data?.notificationId || data?.notification_id;

      // Deep linking: Bildirim tipine göre ilgili sayfaya yönlendir
      
      // 1. Başvuru durumu bildirimleri (application_id varsa)
      if (data?.application_id) {
        // Applications tab'ına git (başvuru detayına gidebiliriz ama şimdilik liste yeterli)
        if (navigationRef.isReady()) {
          navigationRef.navigate('Applications' as any);
        } else {
          navigation.navigate('Applications');
        }
        return;
      }

      // 2. İş ilanı bildirimleri (job_id varsa)
      if (data?.job_id) {
        // İş ilanı detay sayfasına git
        if (navigationRef.isReady()) {
          navigationRef.navigate('JobsTab' as any, {
            screen: 'JobDetail',
            params: { id: Number(data.job_id) },
          });
        } else {
          navigation.navigate('JobsTab', {
            screen: 'JobDetail',
            params: { id: Number(data.job_id) },
          });
        }
        return;
      }

      // 3. Bildirim detay sayfası (notificationId varsa ve tip bildirim ise)
      if (notificationId && (data?.type === 'system' || data?.type === 'message' || data?.type === 'info')) {
        // Bildirimler sayfasına git (gelecekte notification detail sayfası eklenebilir)
        if (navigationRef.isReady()) {
          navigationRef.navigate('ProfileTab' as any, {
            screen: 'Notifications',
          });
        } else {
          navigation.navigate('ProfileTab', {
            screen: 'Notifications',
          });
        }
        return;
      }

      // 4. Varsayılan: Bildirimler sayfasına git
      if (navigationRef.isReady()) {
        navigationRef.navigate('ProfileTab' as any, {
          screen: 'Notifications',
        });
      } else {
        navigation.navigate('ProfileTab', {
          screen: 'Notifications',
        });
      }
    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'handleNotificationTapped',
        extra: { response },
      });
      // Hata durumunda bildirimler sayfasına git
      try {
        if (navigationRef.isReady()) {
          navigationRef.navigate('ProfileTab' as any, {
            screen: 'Notifications',
          });
        } else {
          navigation.navigate('ProfileTab', {
            screen: 'Notifications',
          });
        }
      } catch (navError) {
        // Navigation hatası - sessizce ignore et
        devLog.warn('[usePushNotifications] Navigation failed after notification tap:', navError);
      }
    }
  };

  return {
    requestPermissions: pushNotificationService.requestPermissions,
    getBadgeCount: pushNotificationService.getBadgeCount,
    setBadgeCount: pushNotificationService.setBadgeCount,
    clearBadge: pushNotificationService.clearBadge,
  };
};
