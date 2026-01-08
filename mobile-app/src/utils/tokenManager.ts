/**
 * @file tokenManager.ts
 * @description Secure token management with JWT decode and proactive refresh
 * 
 * Features:
 * - SecureStore only (single source of truth)
 * - JWT decode for expiry check
 * - Proactive token refresh (5 min before expiry)
 * - Token validation
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { deviceInfo } from './deviceInfo';
import { devLog } from './devLogger';

const ACCESS_TOKEN_KEY = 'medikariyer_access_token';
const REFRESH_TOKEN_KEY = 'medikariyer_refresh_token';
const DEVICE_FINGERPRINT_KEY = 'medikariyer_device_fingerprint';

// Token will be refreshed 5 minutes before expiry
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

interface JWTPayload {
  exp: number; // Expiry timestamp (seconds)
  iat: number; // Issued at timestamp (seconds)
  sub?: string; // Subject (user ID)
  [key: string]: any;
}

const canUseWebStorage =
  __DEV__ &&
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined';

const storage = {
  async setItem(key: string, value: string) {
    if (canUseWebStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string) {
    if (canUseWebStorage) {
      return window.localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async deleteItem(key: string) {
    if (canUseWebStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * Decode JWT token and extract payload
 */
function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    devLog.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now() / 1000; // Convert to seconds
  return decoded.exp < currentTime;
}

/**
 * Check if token needs refresh (within threshold)
 */
function shouldRefreshToken(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now();
  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const timeUntilExpiry = expiryTime - currentTime;

  // Refresh if token expires within threshold
  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Get token expiry time in milliseconds
 */
function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return decoded.exp * 1000; // Convert to milliseconds
}

export const tokenManager = {
  /**
   * Save tokens to secure storage with device binding
   */
  async saveTokens(accessToken: string, refreshToken: string) {
    // Validate tokens before saving
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid tokens: accessToken and refreshToken are required');
    }

    // Check if tokens are valid JWT
    const accessDecoded = decodeToken(accessToken);
    const refreshDecoded = decodeToken(refreshToken);

    if (!accessDecoded || !refreshDecoded) {
      throw new Error('Invalid JWT tokens');
    }

    // Get device fingerprint for device binding
    const fingerprint = await deviceInfo.getDeviceFingerprint();

    await Promise.all([
      storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      storage.setItem(DEVICE_FINGERPRINT_KEY, fingerprint),
    ]);
  },

  /**
   * Get access token from secure storage
   */
  async getAccessToken(): Promise<string | null> {
    return storage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Get refresh token from secure storage
   */
  async getRefreshToken(): Promise<string | null> {
    return storage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Get both tokens from secure storage
   */
  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);
    return { accessToken, refreshToken };
  },

  /**
   * Clear all tokens from secure storage
   */
  async clearTokens() {
    await Promise.all([
      storage.deleteItem(ACCESS_TOKEN_KEY),
      storage.deleteItem(REFRESH_TOKEN_KEY),
      storage.deleteItem(DEVICE_FINGERPRINT_KEY),
    ]);
  },

  /**
   * Validate device binding (check if tokens are from this device)
   */
  async validateDeviceBinding(): Promise<boolean> {
    try {
      const storedFingerprint = await storage.getItem(DEVICE_FINGERPRINT_KEY);
      if (!storedFingerprint) {
        // No fingerprint stored, tokens might be from old version
        return true; // Allow for backward compatibility
      }

      const currentFingerprint = await deviceInfo.getDeviceFingerprint();
      return storedFingerprint === currentFingerprint;
    } catch (error) {
      devLog.error('Error validating device binding:', error);
      return false;
    }
  },

  /**
   * Get stored device fingerprint
   */
  async getStoredDeviceFingerprint(): Promise<string | null> {
    return storage.getItem(DEVICE_FINGERPRINT_KEY);
  },

  /**
   * Check if access token is expired
   */
  async isAccessTokenExpired(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return isTokenExpired(token);
  },

  /**
   * Check if access token needs refresh (within threshold)
   */
  async shouldRefreshAccessToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return shouldRefreshToken(token);
  },

  /**
   * Get access token expiry time
   */
  async getAccessTokenExpiryTime(): Promise<number | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    return getTokenExpiryTime(token);
  },

  /**
   * Decode access token payload
   */
  async decodeAccessToken(): Promise<JWTPayload | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    return decodeToken(token);
  },

  /**
   * Validate tokens (check if they exist and are valid JWT)
   */
  async validateTokens(): Promise<boolean> {
    const { accessToken, refreshToken } = await this.getTokens();
    
    if (!accessToken || !refreshToken) {
      return false;
    }

    const accessDecoded = decodeToken(accessToken);
    const refreshDecoded = decodeToken(refreshToken);

    return !!(accessDecoded && refreshDecoded);
  },
};

