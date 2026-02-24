/**
 * @file usePushNotifications.ts
 * @description React hook for push notifications
 * 
 * ✅ APP STORE COMPLIANCE (Guideline 4.5.4):
 * - Does NOT automatically request notification permissions
 * - Only checks existing permission status
 * - Users must manually enable notifications in Settings
 * - App functions fully without push notifications
 * 
 * Usage:
 * - Call in App.tsx to initialize push notifications
 * - Automatically registers device token if permission already granted
 * - Handles notification received and tapped events
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0 (App Store Compliance Update)
 * @since 2024
 */

import { useEffect, useRef } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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
    // Skip push notification registration in Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      devLog.warn('[usePushNotifications] Running in Expo Go - Push notifications disabled');
      return;
    }

    // Only register if user is authenticated
    if (!isAuthenticated) {
      return;
    }

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
    const handleNotificationTapped = (response: any) => {
      try {
        const data = response.notification.request.content.data;
        const notificationId = data?.notificationId || data?.notification_id;

        // Deep linking: Bildirim tipine göre ilgili sayfaya yönlendir
        
        // 1. Başvuru durumu bildirimleri (application_id varsa)
        if (data?.application_id) {
          // Applications tab'ına git (başvuru detayına gidebiliriz ama şimdilik liste yeterli)
          if (navigationRef.isReady()) {
            navigationRef.navigate('ApplicationsTab' as any, { screen: 'ApplicationsList' });
          } else {
            navigation.navigate('ApplicationsTab', { screen: 'ApplicationsList' });
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
            } as any);
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

        // 4. Varsayılan: Bildirimde anlamlı data yoksa hiçbir yere gitme
        // Kullanıcı zaten bildirimi gördü, zorla yönlendirme yapma
        devLog.log('[usePushNotifications] No actionable data in notification, staying on current screen');
        return;
      } catch (error) {
        errorLogger.logError(error as Error, {
          context: 'handleNotificationTapped',
          extra: { response },
        });
        // Hata durumunda kullanıcıyı mevcut ekranda bırak
        // Zorla yönlendirme yapma
        devLog.warn('[usePushNotifications] Error handling notification tap, staying on current screen');
      }
    };

    // ✅ APP STORE FIX: Check existing permission WITHOUT requesting
    // Users must manually enable notifications in Settings
    const checkExistingPermission = async () => {
      try {
        // Check current permission status (does NOT request permission)
        const { status } = await Notifications.getPermissionsAsync();
        
        if (status === 'granted') {
          // Permission already granted - register token
          devLog.log('[usePushNotifications] Permission already granted - registering token');
          await pushNotificationService.registerDeviceToken();
        } else {
          // Permission not granted - do nothing
          // User can enable notifications manually in Settings
          devLog.log('[usePushNotifications] Permission not granted - skipping token registration');
          devLog.log('[usePushNotifications] Users can enable notifications in Settings > Notifications');
        }
      } catch (error) {
        errorLogger.logError(error as Error, {
          context: 'usePushNotifications - checkExistingPermission',
        });
      }
    };
    
    checkExistingPermission();

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
          
          // NOT: State update'i burada YAPMA - notificationListener zaten yapıyor
          // Sadece navigation handle et
          
          // Uygulama durumuna göre işlem yap
          const appState = AppState.currentState;
          if (appState === 'active') {
            // Uygulama açıkken tıklandı - hemen navigate et
            handleNotificationTapped(response);
            lastNotificationResponse.current = null; // İşlendi, temizle
          } else {
            // Uygulama kapalı/arka plandayken tıklandı
            // AppState listener'da handle edilecek, sadece kaydet
            lastNotificationResponse.current = response;
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
    // NOT: responseListener zaten çalışıyor, bu sadece fallback
    // responseListener tetiklenirse lastNotificationResponse.current dolar
    // Bu fonksiyon sadece responseListener çalışmazsa devreye girer
    const checkLastNotification = async () => {
      try {
        const lastNotification = await Notifications.getLastNotificationResponseAsync();
        if (lastNotification) {
          devLog.log('[usePushNotifications] Last notification on app start:', lastNotification);
          
          // responseListener zaten tetiklendiyse, lastNotificationResponse.current dolu olur
          // O zaman burada handle etmeye gerek yok, AppState listener halledecek
          // Sadece responseListener tetiklenmediyse (fallback) burada handle et
          if (!lastNotificationResponse.current) {
            // responseListener tetiklenmedi, direkt handle et
            setTimeout(() => {
              handleNotificationTapped(lastNotification);
            }, 1000); // Navigation hazır olması için bekle
          }
          // Eğer lastNotificationResponse.current doluysa, AppState listener halledecek
        }
      } catch (error) {
        // Hata durumunda sessizce ignore et
        devLog.warn('[usePushNotifications] Failed to get last notification:', error);
      }
    };

    // Uygulama açıldığında kontrol et
    // responseListener'ın tetiklenmesi için küçük bir delay
    setTimeout(() => {
      checkLastNotification();
    }, 200);

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
  }, [isAuthenticated, queryClient, navigation]);

  return {
    requestPermissions: pushNotificationService.requestPermissions,
    getBadgeCount: pushNotificationService.getBadgeCount,
    setBadgeCount: pushNotificationService.setBadgeCount,
    clearBadge: pushNotificationService.clearBadge,
  };
};
