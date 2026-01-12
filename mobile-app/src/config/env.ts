/**
 * @file env.ts
 * @description Ortam değişkenleri yapılandırması
 * 
 * Özellikler:
 * - Tip güvenli ortam değişkenlerine erişim
 * - Expo Constants üzerinden değişken yükleme
 * - EXPO_PUBLIC_ prefix'i ile otomatik yükleme
 * - Varsayılan değer desteği
 * 
 * Kullanım:
 * - .env dosyasında EXPO_PUBLIC_ prefix'i ile tanımlanmalı
 * - Örnek: EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3100/api/mobile
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import Constants from 'expo-constants';

// Expo'da environment variable'lar EXPO_PUBLIC_ prefix'i ile otomatik olarak yüklenir
const getEnvVar = (key: string, defaultValue?: string): string => {
  // @ts-ignore - Expo runtime'da process.env.EXPO_PUBLIC_* değişkenleri mevcuttur
  const value = process.env[key] || Constants.expoConfig?.extra?.[key];
  if (!value && !defaultValue) {
    console.warn(`Ortam değişkeni ${key} tanımlı değil, varsayılan değer kullanılıyor`);
  }
  return value || defaultValue || '';
};

export const env = {
  // API Yapılandırması
  API_BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'http://10.0.2.2:3100/api/mobile'),
  PRIMARY_API_BASE_URL: getEnvVar('EXPO_PUBLIC_PRIMARY_API_BASE_URL', 'http://10.0.2.2:3100/api'),
  
  // Uygulama Yapılandırması
  APP_ENV: getEnvVar('EXPO_PUBLIC_APP_ENV', 'development'),
  
  // Özellik Bayrakları
  ENABLE_PUSH_NOTIFICATIONS: getEnvVar('EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS', 'true') === 'true',

  // Hata Takibi (Sentry)
  // Sentry DSN'inizi .env dosyasında EXPO_PUBLIC_SENTRY_DSN olarak ayarlayın
  SENTRY_DSN: getEnvVar('EXPO_PUBLIC_SENTRY_DSN', ''),
} as const;

export type Env = typeof env;
