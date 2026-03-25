/**
 * @file pushNotification.service.ts
 * @description Push notification servisi - Expo Notifications entegrasyonu
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Ana İşlevler:**
 * - İzin isteme (Request permissions)
 * - Push token alma (Get push token)
 * - Cihaz token'ını backend'e kaydetme
 * - Bildirim alındığında işleme (Handle notification received)
 * - Bildirime tıklandığında işleme (Handle notification tapped)
 * - Badge yönetimi
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import { notificationService } from './notification.service';
import { errorLogger } from '@/utils/errorLogger';

// ============================================================================
// NOTIFICATION CONFIGURATION
// ============================================================================

/**
 * Bildirim davranışını yapılandır
 * Uygulama foreground'dayken bildirimlerin nasıl gösterileceğini belirler
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // Alert göster
    shouldPlaySound: true,    // Ses çal
    shouldSetBadge: true,     // Badge güncelle
  }),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Push Notification Service interface
 */
export interface PushNotificationService {
  /** Bildirim izinlerini iste */
  requestPermissions: () => Promise<boolean>;
  /** Expo push token al */
  getExpoPushToken: () => Promise<string | null>;
  /** Cihaz token'ını backend'e kaydet */
  registerDeviceToken: () => Promise<void>;
  /** Bildirim alındığında listener ekle */
  addNotificationReceivedListener: (callback: (notification: any) => void) => any;
  /** Bildirime tıklandığında listener ekle */
  addNotificationResponseReceivedListener: (callback: (response: any) => void) => any;
  /** Badge sayısını al */
  getBadgeCount: () => Promise<number>;
  /** Badge sayısını ayarla */
  setBadgeCount: (count: number) => Promise<void>;
  /** Badge'i temizle */
  clearBadge: () => Promise<void>;
}

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

/**
 * Kullanıcıdan bildirim izinlerini iste
 * 
 * @returns İzin verildi mi?
 * 
 * **NOT:** Push notification'lar sadece fiziksel cihazlarda çalışır
 */
async function requestPermissions(): Promise<boolean> {
  // Fiziksel cihaz kontrolü
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return false;
  }

  // Mevcut izin durumunu kontrol et
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // İzin verilmemişse iste
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // İzin kontrolü
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permissions');
    return false;
  }

  return true;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Expo push token al (retry mekanizması ile)
 * 
 * @param maxRetries - Maksimum deneme sayısı (varsayılan: 3)
 * @returns Expo push token veya null
 * 
 * **Gereksinimler:**
 * - Fiziksel cihaz olmalı
 * - Native build: Firebase FCM gerekli (google-services.json)
 * - EAS build: app.json'da projectId gerekli
 * 
 * **Retry Stratejisi:**
 * - 1. deneme: Hemen
 * - 2. deneme: 2 saniye sonra
 * - 3. deneme: 4 saniye sonra
 */
async function getExpoPushToken(maxRetries: number = 3): Promise<string | null> {
  // Fiziksel cihaz kontrolü
  if (!Device.isDevice) {
    console.warn('Must use physical device for push notifications');
    return null;
  }

  // Expo Go kontrolü - Expo Go'da push notification çalışmaz
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    // Sessizce null dön, hata loglamaya gerek yok
    return null;
  }

  // Retry mekanizması ile token alma
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Token al (15 saniye timeout ile)
      const tokenPromise = Notifications.getExpoPushTokenAsync();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Token fetch timeout')), 15000)
      );

      const token = await Promise.race([tokenPromise, timeoutPromise]);
      return token.data;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (isLastAttempt) {
        // Son denemede hata logla (warning seviyesinde)
        errorLogger.logError(error as Error, {
          context: 'getExpoPushToken',
          severity: 'warning', // Kritik değil, warning olarak işaretle
          metadata: {
            attempt,
            maxRetries,
            errorMessage,
          },
        });
        return null;
      }

      // Bir sonraki deneme için bekle (exponential backoff)
      const waitTime = 2000 * attempt;
      if (__DEV__) {
        console.log(`Token fetch failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return null;
}

/**
 * Cihaz token'ını backend'e kaydet (ağ kontrolü ve kullanıcı bildirimi ile)
 * 
 * **İşlem Adımları:**
 * 1. Ağ bağlantısını kontrol et
 * 2. İzin iste
 * 3. Expo push token al (retry ile)
 * 4. Cihaz bilgilerini topla
 * 5. Backend'e kaydet
 * 
 * **Hata Yönetimi:**
 * - Ağ yoksa: Sessizce çık (kullanıcı bilgilendirilmez)
 * - Token alınamazsa: Warning log + kullanıcıya bildir
 * - Backend hatası: Warning log + kullanıcıya bildir
 */
async function registerDeviceToken(): Promise<void> {
  try {
    // Expo Go kontrolü - Expo Go'da push notification çalışmaz
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      // Sessizce çık, hata loglamaya gerek yok
      return;
    }

    // 1. Ağ bağlantısını kontrol et
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected || networkState.isInternetReachable === false) {
      // Ağ yoksa sessizce çık, kullanıcıyı rahatsız etme
      if (__DEV__) {
        console.log('No internet connection, skipping device token registration');
      }
      return;
    }

    // 2. İzin kontrolü
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('No notification permission, skipping token registration');
      return;
    }

    // 3. Push token al (retry mekanizması ile)
    const expoPushToken = await getExpoPushToken();
    if (!expoPushToken) {
      // Token alınamadı - kullanıcıya bildir ama uygulamayı crash ettirme
      if (__DEV__) {
        console.warn('Failed to get push token after retries');
      }
      // Production'da kullanıcıya bildir (opsiyonel - UX'e göre karar verin)
      // Alert.alert(
      //   'Bildirim Hatası',
      //   'Bildirimler şu anda aktif edilemedi. Lütfen internet bağlantınızı kontrol edin ve uygulamayı yeniden başlatın.',
      //   [{ text: 'Tamam' }]
      // );
      return;
    }

    // 4. Cihaz bilgilerini topla
    // Circular dependency'yi önlemek için dinamik import
    const { deviceInfo } = await import('@/utils/deviceInfo');
    const deviceId = await deviceInfo.getDeviceId();
    const platform = deviceInfo.getPlatform();
    const appVersion = deviceInfo.getAppVersion();

    // 5. Backend'e kaydet (sadece mobil platformlar için)
    if (platform === 'ios' || platform === 'android') {
      await notificationService.registerDeviceToken({
        expo_push_token: expoPushToken,
        device_id: deviceId,
        platform,
        app_version: appVersion,
      });
    }

    if (__DEV__) {
      console.log('Device token registered successfully');
    }
  } catch (error) {
    // Expo Go'da hata bekleniyor, sessizce yoksay
    const isExpoGo = Constants.appOwnership === 'expo';
    if (!isExpoGo) {
      // Warning seviyesinde logla (kritik değil)
      errorLogger.logError(error as Error, {
        context: 'registerDeviceToken',
        severity: 'warning', // Kritik değil, warning olarak işaretle
      });

      // Kullanıcıya bildir (opsiyonel - UX'e göre karar verin)
      if (__DEV__) {
        console.warn('Failed to register device token:', error);
      }
      // Production'da kullanıcıya bildir (opsiyonel)
      // Alert.alert(
      //   'Bildirim Hatası',
      //   'Bildirimler şu anda aktif edilemedi. Daha sonra tekrar deneyin.',
      //   [{ text: 'Tamam' }]
      // );
    }
  }
}

// ============================================================================
// NOTIFICATION LISTENERS
// ============================================================================

/**
 * Uygulama foreground'dayken alınan bildirimler için listener ekle
 * 
 * @param callback - Bildirim alındığında çalışacak fonksiyon
 * @returns Listener subscription (cleanup için)
 * 
 * @example
 * ```typescript
 * const subscription = addNotificationReceivedListener((notification) => {
 *   console.log('Notification received:', notification);
 * });
 * 
 * // Cleanup
 * subscription.remove();
 * ```
 */
function addNotificationReceivedListener(
  callback: (notification: any) => void
): any {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Kullanıcı bildirime tıkladığında listener ekle
 * Hem foreground hem de background için çalışır
 * 
 * @param callback - Bildirime tıklandığında çalışacak fonksiyon
 * @returns Listener subscription (cleanup için)
 * 
 * @example
 * ```typescript
 * const subscription = addNotificationResponseReceivedListener((response) => {
 *   const data = response.notification.request.content.data;
 *   // Navigate to relevant screen based on data
 * });
 * 
 * // Cleanup
 * subscription.remove();
 * ```
 */
function addNotificationResponseReceivedListener(
  callback: (response: any) => void
): any {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// ============================================================================
// BADGE MANAGEMENT
// ============================================================================

/**
 * Mevcut badge sayısını al
 * 
 * @returns Badge sayısı
 */
async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Badge sayısını ayarla
 * 
 * @param count - Yeni badge sayısı
 */
async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Badge'i temizle (0'a ayarla)
 */
async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// ============================================================================
// SERVICE EXPORT
// ============================================================================

/**
 * Push Notification Service
 * Expo Notifications API'sini wrap eden servis
 */
export const pushNotificationService: PushNotificationService = {
  requestPermissions,
  getExpoPushToken,
  registerDeviceToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
};
