/**
 * Environment Configuration
 * Type-safe access to environment variables
 */

import Constants from 'expo-constants';

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not defined`);
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
