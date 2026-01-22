/**
 * @file tokenManager.ts
 * @description Güvenli token yönetimi - JWT decode ve proaktif yenileme
 * 
 * Özellikler:
 * - SecureStore kullanımı (tek kaynak)
 * - JWT decode ile süre kontrolü
 * - Proaktif token yenileme (süresi dolmadan 5 dk önce)
 * - Token doğrulama
 * - Cihaz bağlama (device binding) güvenliği
 * 
 * Token Yenileme Stratejisi:
 * - Access token süresi dolmadan 5 dakika önce otomatik yenilenir
 * - Bu sayede kullanıcı deneyimi kesintisiz olur
 * - Token yenileme işlemi arka planda gerçekleşir
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

// Token süresi dolmadan 5 dakika önce yenilenecek
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 dakika

// JWT payload tipi
interface JWTPayload {
  exp: number; // Süre sonu timestamp (saniye)
  iat: number; // Oluşturulma timestamp (saniye)
  sub?: string; // Subject (kullanıcı ID'si)
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
 * JWT token'ı decode et ve payload'ı çıkar
 * @param token - JWT token string
 * @returns Decode edilmiş payload veya null (hata durumunda)
 */
function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    devLog.error('JWT token decode edilemedi:', error);
    return null;
  }
}

/**
 * Token'ın süresi dolmuş mu kontrol et
 * @param token - JWT token string
 * @returns Süresi dolmuşsa true, değilse false
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now() / 1000; // Saniyeye çevir
  return decoded.exp < currentTime;
}

/**
 * Token'ın yenilenmesi gerekiyor mu kontrol et (threshold içinde)
 * @param token - JWT token string
 * @returns Yenilenmesi gerekiyorsa true, değilse false
 */
function shouldRefreshToken(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now();
  const expiryTime = decoded.exp * 1000; // Milisaniyeye çevir
  const timeUntilExpiry = expiryTime - currentTime;

  // Token threshold içinde sona eriyorsa yenile
  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Token'ın süre sonu zamanını milisaniye cinsinden al
 * @param token - JWT token string
 * @returns Süre sonu zamanı (ms) veya null
 */
function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return decoded.exp * 1000; // Milisaniyeye çevir
}

export const tokenManager = {
  /**
   * Token'ları cihaz bağlama ile güvenli depolamaya kaydet
   * @param accessToken - Access token
   * @param refreshToken - Refresh token
   * @throws Token'lar geçersizse hata fırlatır
   */
  async saveTokens(accessToken: string, refreshToken: string) {
    // Kaydetmeden önce token'ları doğrula
    if (!accessToken || !refreshToken) {
      throw new Error('Geçersiz token\'lar: accessToken ve refreshToken gerekli');
    }

    // Token'ların geçerli JWT olup olmadığını kontrol et
    const accessDecoded = decodeToken(accessToken);
    const refreshDecoded = decodeToken(refreshToken);

    if (!accessDecoded || !refreshDecoded) {
      throw new Error('Geçersiz JWT token\'ları');
    }

    // FIXED: Check if tokens are already expired (defense layer)
    // Note: Auto-refresh will handle this anyway, but better to catch early
    const currentTime = Date.now() / 1000;
    if (accessDecoded.exp && accessDecoded.exp < currentTime) {
      devLog.warn('⚠️ Access token already expired, but saving anyway (will be auto-refreshed)');
      // Don't throw - let auto-refresh handle it
    }
    if (refreshDecoded.exp && refreshDecoded.exp < currentTime) {
      devLog.error('❌ Refresh token is expired, cannot save');
      throw new Error('Refresh token süresi dolmuş');
    }

    // Cihaz bağlama için cihaz parmak izi al
    const fingerprint = await deviceInfo.getDeviceFingerprint();

    await Promise.all([
      storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      storage.setItem(DEVICE_FINGERPRINT_KEY, fingerprint),
    ]);
  },

  /**
   * Güvenli depolamadan access token'ı al
   * @returns Access token veya null
   */
  async getAccessToken(): Promise<string | null> {
    return storage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Güvenli depolamadan refresh token'ı al
   * @returns Refresh token veya null
   */
  async getRefreshToken(): Promise<string | null> {
    return storage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Güvenli depolamadan her iki token'ı da al
   * @returns Token'lar objesi
   */
  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);
    return { accessToken, refreshToken };
  },

  /**
   * Güvenli depolamadan tüm token'ları temizle
   */
  async clearTokens() {
    await Promise.all([
      storage.deleteItem(ACCESS_TOKEN_KEY),
      storage.deleteItem(REFRESH_TOKEN_KEY),
      storage.deleteItem(DEVICE_FINGERPRINT_KEY),
    ]);
  },

  /**
   * Cihaz bağlamasını doğrula (token'lar bu cihazdan mı kontrol et)
   * @returns Geçerliyse true, değilse false
   */
  async validateDeviceBinding(): Promise<boolean> {
    try {
      const storedFingerprint = await storage.getItem(DEVICE_FINGERPRINT_KEY);
      if (!storedFingerprint) {
        // Parmak izi saklanmamış, eski versiyondan olabilir
        return true; // Geriye dönük uyumluluk için izin ver
      }

      const currentFingerprint = await deviceInfo.getDeviceFingerprint();
      return storedFingerprint === currentFingerprint;
    } catch (error) {
      devLog.error('Cihaz bağlama doğrulaması hatası:', error);
      return false;
    }
  },

  /**
   * Saklanan cihaz parmak izini al
   * @returns Cihaz parmak izi veya null
   */
  async getStoredDeviceFingerprint(): Promise<string | null> {
    return storage.getItem(DEVICE_FINGERPRINT_KEY);
  },

  /**
   * Access token'ın süresi dolmuş mu kontrol et
   * @returns Süresi dolmuşsa true, değilse false
   */
  async isAccessTokenExpired(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return isTokenExpired(token);
  },

  /**
   * Access token'ın yenilenmesi gerekiyor mu kontrol et (threshold içinde)
   * @returns Yenilenmesi gerekiyorsa true, değilse false
   */
  async shouldRefreshAccessToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return shouldRefreshToken(token);
  },

  /**
   * Access token'ın süre sonu zamanını al
   * @returns Süre sonu zamanı (ms) veya null
   */
  async getAccessTokenExpiryTime(): Promise<number | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    return getTokenExpiryTime(token);
  },

  /**
   * Access token payload'ını decode et
   * @returns Decode edilmiş payload veya null
   */
  async decodeAccessToken(): Promise<JWTPayload | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    return decodeToken(token);
  },

  /**
   * Token'ları doğrula (var mı ve geçerli JWT mi kontrol et)
   * @returns Geçerliyse true, değilse false
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

