/**
 * @file deviceInfo.ts
 * @description Device information and unique device ID
 * 
 * Features:
 * - Get unique device ID
 * - Get device model, brand, OS version
 * - Device binding for token security
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { devLog } from './devLogger';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  brand: string;
  model: string;
  osName: string;
  osVersion: string;
  appVersion: string;
  platform: 'ios' | 'android' | 'web';
}

/**
 * Get unique device ID
 * - iOS: Uses identifierForVendor (changes if all apps from vendor are uninstalled)
 * - Android: Uses androidId (unique per device, persists across app reinstalls)
 */
export async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === 'ios') {
      // iOS: identifierForVendor
      const id = await Application.getIosIdForVendorAsync();
      return id || Constants.deviceId || 'unknown-ios';
    } else if (Platform.OS === 'android') {
      // Android: androidId
      const id = Application.getAndroidId();
      return id || Constants.deviceId || 'unknown-android';
    } else {
      // Web or other platforms
      return Constants.deviceId || 'unknown-web';
    }
  } catch (error) {
    devLog.error('Error getting device ID:', error);
    return Constants.deviceId || 'unknown';
  }
}

/**
 * Get device name
 */
export function getDeviceName(): string {
  return Device.deviceName || 'Unknown Device';
}

/**
 * Get device brand (Apple, Samsung, etc.)
 */
export function getDeviceBrand(): string {
  return Device.brand || 'Unknown';
}

/**
 * Get device model (iPhone 14 Pro, Galaxy S23, etc.)
 */
export function getDeviceModel(): string {
  return Device.modelName || Device.modelId || 'Unknown';
}

/**
 * Get OS name (iOS, Android)
 */
export function getOSName(): string {
  return Device.osName || Platform.OS;
}

/**
 * Get OS version (16.0, 13.0, etc.)
 */
export function getOSVersion(): string {
  return Device.osVersion || 'Unknown';
}

/**
 * Get app version
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version || Application.nativeApplicationVersion || '1.0.0';
}

/**
 * Get platform (ios, android, web)
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Platform.OS as 'ios' | 'android' | 'web';
}

/**
 * Get complete device info
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const deviceId = await getDeviceId();
  
  return {
    deviceId,
    deviceName: getDeviceName(),
    brand: getDeviceBrand(),
    model: getDeviceModel(),
    osName: getOSName(),
    osVersion: getOSVersion(),
    appVersion: getAppVersion(),
    platform: getPlatform(),
  };
}

/**
 * Get device fingerprint (for device binding)
 * Combines multiple device properties for unique identification
 */
export async function getDeviceFingerprint(): Promise<string> {
  const info = await getDeviceInfo();
  
  // Create fingerprint from device properties
  const fingerprint = `${info.deviceId}-${info.platform}-${info.brand}-${info.model}`;
  
  return fingerprint;
}

export const deviceInfo = {
  getDeviceId,
  getDeviceName,
  getDeviceBrand,
  getDeviceModel,
  getOSName,
  getOSVersion,
  getAppVersion,
  getPlatform,
  getDeviceInfo,
  getDeviceFingerprint,
};
