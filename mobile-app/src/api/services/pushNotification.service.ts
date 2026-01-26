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
 * Expo push token al
 * 
 * @returns Expo push token veya null
 * 
 * **Gereksinimler:**
 * - Fiziksel cihaz olmalı
 * - Native build: Firebase FCM gerekli (google-services.json)
 * - EAS build: app.json'da projectId gerekli
 */
async function getExpoPushToken(): Promise<string | null> {
  try {
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

    // Token al
    // Native build (Firebase FCM) kullanıyoruz, projectId gerekmez
    // Expo otomatik olarak Firebase'den token alır
    const token = await Notifications.getExpoPushTokenAsync();

    return token.data;
  } catch (error) {
    // Expo Go'da hata bekleniyor, sessizce null dön
    const isExpoGo = Constants.appOwnership === 'expo';
    if (!isExpoGo) {
      // Sadece production/development build'de hata logla
      errorLogger.logError(error as Error, {
        context: 'getExpoPushToken',
      });
    }
    return null;
  }
}

/**
 * Cihaz token'ını backend'e kaydet
 * 
 * **İşlem Adımları:**
 * 1. İzin iste
 * 2. Expo push token al
 * 3. Cihaz bilgilerini topla
 * 4. Backend'e kaydet
 */
async function registerDeviceToken(): Promise<void> {
  try {
    // Expo Go kontrolü - Expo Go'da push notification çalışmaz
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      // Sessizce çık, hata loglamaya gerek yok
      return;
    }

    // 1. İzin kontrolü
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('No notification permission, skipping token registration');
      return;
    }

    // 2. Push token al
    const expoPushToken = await getExpoPushToken();
    if (!expoPushToken) {
      // Token alınamadı, sessizce çık
      return;
    }

    // 3. Cihaz bilgilerini topla
    // Circular dependency'yi önlemek için dinamik import
    const { deviceInfo } = await import('@/utils/deviceInfo');
    const deviceId = await deviceInfo.getDeviceId();
    const platform = deviceInfo.getPlatform();
    const appVersion = deviceInfo.getAppVersion();

    // 4. Backend'e kaydet (sadece mobil platformlar için)
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
      // Sadece production/development build'de hata logla
      errorLogger.logError(error as Error, {
        context: 'registerDeviceToken',
      });
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
