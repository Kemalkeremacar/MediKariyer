/**
 * Environment Configuration
 * Type-safe access to environment variables
 */

import Constants from 'expo-constants';

// Expo'da environment variable'lar EXPO_PUBLIC_ prefix'i ile otomatik olarak yüklenir
const getEnvVar = (key: string, defaultValue?: string): string => {
  // @ts-ignore - Expo runtime'da process.env.EXPO_PUBLIC_* değişkenleri mevcuttur
  const value = process.env[key] || Constants.expoConfig?.extra?.[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not defined, using default value`);
  }
  return value || defaultValue || '';
};

export const env = {
  // API Configuration
  API_BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'http://10.0.2.2:3100/api/mobile'),
  PRIMARY_API_BASE_URL: getEnvVar('EXPO_PUBLIC_PRIMARY_API_BASE_URL', 'http://10.0.2.2:3100/api'),
  
  // App Configuration
  APP_ENV: getEnvVar('EXPO_PUBLIC_APP_ENV', 'development'),
  
  // Feature Flags
  ENABLE_PUSH_NOTIFICATIONS: getEnvVar('EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS', 'true') === 'true',
} as const;

export type Env = typeof env;
