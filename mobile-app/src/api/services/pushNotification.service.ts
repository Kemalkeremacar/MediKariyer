/**
 * @file pushNotification.service.ts
 * @description Push notification service - Expo Notifications integration
 * 
 * Ana İşlevler:
 * - Request permissions
 * - Get push token
 * - Register device token with backend
 * - Handle notification received
 * - Handle notification tapped
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { notificationService } from './notification.service';
import { errorLogger } from '@/utils/errorLogger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationService {
  requestPermissions: () => Promise<boolean>;
  getExpoPushToken: () => Promise<string | null>;
  registerDeviceToken: () => Promise<void>;
  addNotificationReceivedListener: (
    callback: (notification: any) => void
  ) => any;
  addNotificationResponseReceivedListener: (
    callback: (response: any) => void
  ) => any;
  getBadgeCount: () => Promise<number>;
  setBadgeCount: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
}

/**
 * Request notification permissions from user
 */
async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permissions');
    return false;
  }

  return true;
}

/**
 * Get Expo push token
 */
async function getExpoPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      console.warn('Must use physical device for push notifications');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.warn('Project ID not found in app config');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  } catch (error) {
    errorLogger.logError(error as Error, {
      context: 'getExpoPushToken',
    });
    return null;
  }
}

/**
 * Register device token with backend
 */
async function registerDeviceToken(): Promise<void> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('No notification permission, skipping token registration');
      return;
    }

    const expoPushToken = await getExpoPushToken();
    if (!expoPushToken) {
      console.warn('Failed to get Expo push token');
      return;
    }

    // Import deviceInfo dynamically to avoid circular dependency
    const { deviceInfo } = await import('@/utils/deviceInfo');
    const deviceId = await deviceInfo.getDeviceId();
    const platform = deviceInfo.getPlatform();
    const appVersion = deviceInfo.getAppVersion();

    // Only register for mobile platforms
    if (platform === 'ios' || platform === 'android') {
      await notificationService.registerDeviceToken({
        expo_push_token: expoPushToken,
        device_id: deviceId,
        platform,
        app_version: appVersion,
      });
    }

    console.log('Device token registered successfully');
  } catch (error) {
    errorLogger.logError(error as Error, {
      context: 'registerDeviceToken',
    });
  }
}

/**
 * Add listener for notifications received while app is in foreground
 */
function addNotificationReceivedListener(
  callback: (notification: any) => void
): any {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification tapped by user
 */
function addNotificationResponseReceivedListener(
  callback: (response: any) => void
): any {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get current badge count
 */
async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

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
