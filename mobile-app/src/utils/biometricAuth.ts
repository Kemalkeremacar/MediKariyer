/**
 * @file biometricAuth.ts
 * @description Biometric authentication (Face ID, Touch ID, Fingerprint)
 * 
 * Features:
 * - Check if biometric is available
 * - Check if biometric is enrolled
 * - Authenticate with biometric
 * - Support for Face ID, Touch ID, Fingerprint
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'FINGERPRINT' | 'FACIAL_RECOGNITION' | 'IRIS' | 'NONE';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

/**
 * Check if device supports biometric authentication
 */
export async function isBiometricSupported(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
}

/**
 * Check if biometric is enrolled (user has set up Face ID/Touch ID/Fingerprint)
 */
export async function isBiometricEnrolled(): Promise<boolean> {
  try {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric enrollment:', error);
    return false;
  }
}

/**
 * Get available biometric types
 */
export async function getAvailableBiometricTypes(): Promise<BiometricType[]> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const biometricTypes: BiometricType[] = [];

    types.forEach((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          biometricTypes.push('FINGERPRINT');
          break;
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          biometricTypes.push('FACIAL_RECOGNITION');
          break;
        case LocalAuthentication.AuthenticationType.IRIS:
          biometricTypes.push('IRIS');
          break;
      }
    });

    return biometricTypes.length > 0 ? biometricTypes : ['NONE'];
  } catch (error) {
    console.error('Error getting biometric types:', error);
    return ['NONE'];
  }
}

/**
 * Get user-friendly biometric name
 */
export function getBiometricName(type: BiometricType): string {
  switch (type) {
    case 'FINGERPRINT':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Parmak İzi';
    case 'FACIAL_RECOGNITION':
      return Platform.OS === 'ios' ? 'Face ID' : 'Yüz Tanıma';
    case 'IRIS':
      return 'Iris Tanıma';
    default:
      return 'Biyometrik Kimlik Doğrulama';
  }
}

/**
 * Authenticate with biometric
 */
export async function authenticateWithBiometric(
  promptMessage?: string
): Promise<BiometricAuthResult> {
  try {
    // Check if biometric is supported
    const isSupported = await isBiometricSupported();
    if (!isSupported) {
      return {
        success: false,
        error: 'Cihazınız biyometrik kimlik doğrulamayı desteklemiyor.',
      };
    }

    // Check if biometric is enrolled
    const isEnrolled = await isBiometricEnrolled();
    if (!isEnrolled) {
      return {
        success: false,
        error: 'Biyometrik kimlik doğrulama ayarlanmamış. Lütfen cihaz ayarlarından ayarlayın.',
      };
    }

    // Get biometric type for custom message
    const types = await getAvailableBiometricTypes();
    const biometricName = types[0] !== 'NONE' ? getBiometricName(types[0]) : 'Biyometrik';

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || `${biometricName} ile doğrulayın`,
      cancelLabel: 'İptal',
      disableDeviceFallback: false, // Allow PIN/Password fallback
      fallbackLabel: 'Şifre Kullan',
    });

    if (result.success) {
      return {
        success: true,
      };
    }

    // Handle different error types
    if (result.error === 'user_cancel') {
      return {
        success: false,
        warning: 'Kimlik doğrulama iptal edildi.',
      };
    }

    if (result.error === 'lockout') {
      return {
        success: false,
        error: 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
      };
    }

    if (result.error === 'system_cancel') {
      return {
        success: false,
        warning: 'Sistem tarafından iptal edildi.',
      };
    }

    return {
      success: false,
      error: 'Kimlik doğrulama başarısız oldu.',
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
}

/**
 * Check if biometric is available and ready to use
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const isSupported = await isBiometricSupported();
  const isEnrolled = await isBiometricEnrolled();
  return isSupported && isEnrolled;
}

export const biometricAuth = {
  isSupported: isBiometricSupported,
  isEnrolled: isBiometricEnrolled,
  isAvailable: isBiometricAvailable,
  getAvailableTypes: getAvailableBiometricTypes,
  getBiometricName,
  authenticate: authenticateWithBiometric,
};
