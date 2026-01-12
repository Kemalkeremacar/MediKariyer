/**
 * @file deviceInfo.ts
 * @description Cihaz bilgileri ve benzersiz cihaz ID'si
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Benzersiz cihaz ID'si alma
 * - Cihaz modeli, marka, OS versiyonu bilgileri
 * - Token güvenliği için cihaz bağlama
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { devLog } from './devLogger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DeviceInfo {
  /** Benzersiz cihaz ID'si */
  deviceId: string;
  /** Cihaz adı */
  deviceName: string;
  /** Marka (Apple, Samsung, vb.) */
  brand: string;
  /** Model (iPhone 14 Pro, Galaxy S23, vb.) */
  model: string;
  /** İşletim sistemi adı (iOS, Android) */
  osName: string;
  /** İşletim sistemi versiyonu */
  osVersion: string;
  /** Uygulama versiyonu */
  appVersion: string;
  /** Platform (ios, android, web) */
  platform: 'ios' | 'android' | 'web';
}

// ============================================================================
// DEVICE ID
// ============================================================================

/**
 * Benzersiz cihaz ID'si al
 * 
 * **Platform Bazlı:**
 * - iOS: identifierForVendor kullanır (vendor'dan tüm uygulamalar kaldırılırsa değişir)
 * - Android: androidId kullanır (cihaz başına benzersiz, uygulama yeniden yüklemelerinde kalıcı)
 * 
 * @returns Benzersiz cihaz ID'si
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
      // Web veya diğer platformlar
      return Constants.deviceId || 'unknown-web';
    }
  } catch (error) {
    devLog.error('Error getting device ID:', error);
    return Constants.deviceId || 'unknown';
  }
}

// ============================================================================
// DEVICE INFORMATION
// ============================================================================

/**
 * Cihaz adını al
 */
export function getDeviceName(): string {
  return Device.deviceName || 'Unknown Device';
}

/**
 * Cihaz markasını al (Apple, Samsung, vb.)
 */
export function getDeviceBrand(): string {
  return Device.brand || 'Unknown';
}

/**
 * Cihaz modelini al (iPhone 14 Pro, Galaxy S23, vb.)
 */
export function getDeviceModel(): string {
  return Device.modelName || Device.modelId || 'Unknown';
}

/**
 * İşletim sistemi adını al (iOS, Android)
 */
export function getOSName(): string {
  return Device.osName || Platform.OS;
}

/**
 * İşletim sistemi versiyonunu al (16.0, 13.0, vb.)
 */
export function getOSVersion(): string {
  return Device.osVersion || 'Unknown';
}

/**
 * Uygulama versiyonunu al
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version || Application.nativeApplicationVersion || '1.0.0';
}

/**
 * Platform al (ios, android, web)
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Platform.OS as 'ios' | 'android' | 'web';
}

// ============================================================================
// COMPLETE DEVICE INFO
// ============================================================================

/**
 * Tam cihaz bilgisini al
 * 
 * @returns Tüm cihaz bilgileri
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
 * Cihaz parmak izi al (cihaz bağlama için)
 * Benzersiz tanımlama için birden fazla cihaz özelliğini birleştirir
 * 
 * @returns Cihaz parmak izi
 */
export async function getDeviceFingerprint(): Promise<string> {
  const info = await getDeviceInfo();
  
  // Cihaz özelliklerinden parmak izi oluştur
  const fingerprint = `${info.deviceId}-${info.platform}-${info.brand}-${info.model}`;
  
  return fingerprint;
}

// ============================================================================
// EXPORT
// ============================================================================

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
