/**
 * @file tokenUtils.js
 * @description Token Management Utilities - Token yönetim yardımcı fonksiyonları
 * 
 * Bu dosya, localStorage üzerinden token yönetimi için yardımcı fonksiyonlar sağlar.
 * Access token, refresh token ve kullanıcı verilerinin saklanması, alınması
 * ve yönetimi için utility fonksiyonlar içerir.
 * 
 * Ana Özellikler:
 * - Token saklama: localStorage'a token kaydetme
 * - Token alma: localStorage'dan token okuma
 * - Token temizleme: Token'ları silme
 * - Token geçerlilik kontrolü: JWT token'ın geçerlilik kontrolü
 * - Token süre hesaplama: Token'ın ne kadar süre kaldığını hesaplama
 * - Auth durumu kontrolü: Tüm auth verilerinin durumunu kontrol etme
 * 
 * Token Keys:
 * - ACCESS_TOKEN: 'mediKariyer_access_token'
 * - REFRESH_TOKEN: 'mediKariyer_refresh_token'
 * - USER_DATA: 'mediKariyer_user_data'
 * 
 * Fonksiyonlar:
 * - setAccessToken: Access token'ı kaydeder
 * - getAccessToken: Access token'ı döndürür
 * - setRefreshToken: Refresh token'ı kaydeder
 * - getRefreshToken: Refresh token'ı döndürür
 * - setUserData: Kullanıcı verilerini kaydeder
 * - getUserData: Kullanıcı verilerini döndürür
 * - clearAuthData: Tüm auth verilerini temizler
 * - isTokenValid: Token'ın geçerli olup olmadığını kontrol eder
 * - getTokenExpiryTime: Token'ın süresinin dolmasına ne kadar kaldığını hesaplar
 * - getAuthStatus: Tüm auth durumunu döndürür
 * 
 * Token Validation:
 * - JWT token decode edilir
 * - exp (expiration) claim kontrol edilir
 * - Current time ile karşılaştırılır
 * - Token geçerli ise true, değilse false döner
 * 
 * Kullanım:
 * ```javascript
 * import { 
 *   setAccessToken, 
 *   getAccessToken, 
 *   isTokenValid,
 *   clearAuthData 
 * } from '@/utils/tokenUtils';
 * 
 * // Token kaydet
 * setAccessToken('eyJhbGciOiJIUzI1NiIs...');
 * 
 * // Token al
 * const token = getAccessToken();
 * 
 * // Token geçerlilik kontrolü
 * if (isTokenValid(token)) {
 *   console.log('Token geçerli');
 * }
 * 
 * // Auth verilerini temizle
 * clearAuthData();
 * ```
 * 
 * Not: Bu utility fonksiyonları doğrudan localStorage kullanır.
 * Zustand persist middleware ile birlikte kullanılabilir, ancak
 * doğrudan localStorage erişimi gerektiğinde kullanılır.
 * 
 * JWT Token Yapısı:
 * - Header.Payload.Signature formatında
 * - Payload decode edilerek exp claim okunur
 * - exp: Unix timestamp (saniye cinsinden)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * CONSTANTS - Sabitler
 * ============================================================================
 */

/**
 * Token localStorage key'leri
 * 
 * localStorage'da kullanılan key isimleri
 * Tüm key'ler 'mediKariyer_' prefix'i ile başlar
 * 
 * @type {Object} Token key'leri objesi
 */
const TOKEN_KEYS = {
  /**
   * Access token key
   * 
   * JWT access token'ın saklandığı key
   */
  ACCESS_TOKEN: 'mediKariyer_access_token',
  
  /**
   * Refresh token key
   * 
   * JWT refresh token'ın saklandığı key
   */
  REFRESH_TOKEN: 'mediKariyer_refresh_token',
  
  /**
   * User data key
   * 
   * Kullanıcı bilgilerinin saklandığı key
   */
  USER_DATA: 'mediKariyer_user_data'
};

// ============================================================================
// TOKEN MANAGEMENT FUNCTIONS - Token yönetim fonksiyonları
// ============================================================================

/**
 * Access token'ı localStorage'a kaydet
 * 
 * Token varsa localStorage'a kaydeder
 * Token null/undefined ise localStorage'dan siler
 * 
 * @param {string|null} token - JWT access token veya null
 * 
 * @example
 * setAccessToken('eyJhbGciOiJIUzI1NiIs...');
 * setAccessToken(null); // Token'ı sil
 */
export const setAccessToken = (token) => {
  if (token) {
    /**
     * Token varsa localStorage'a kaydet
     */
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  } else {
    /**
     * Token yoksa localStorage'dan sil
     */
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  }
};

/**
 * Access token'ı localStorage'dan al
 * 
 * @returns {string|null} JWT access token veya null
 * 
 * @example
 * const token = getAccessToken();
 * if (token) {
 *   console.log('Token mevcut');
 * }
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Refresh token'ı localStorage'a kaydet
 * 
 * Token varsa localStorage'a kaydeder
 * Token null/undefined ise localStorage'dan siler
 * 
 * @param {string|null} token - JWT refresh token veya null
 * 
 * @example
 * setRefreshToken('eyJhbGciOiJIUzI1NiIs...');
 * setRefreshToken(null); // Token'ı sil
 */
export const setRefreshToken = (token) => {
  if (token) {
    /**
     * Token varsa localStorage'a kaydet
     */
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
  } else {
    /**
     * Token yoksa localStorage'dan sil
     */
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }
};

/**
 * Refresh token'ı localStorage'dan al
 * 
 * @returns {string|null} JWT refresh token veya null
 * 
 * @example
 * const refreshToken = getRefreshToken();
 */
export const getRefreshToken = () => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Kullanıcı verilerini localStorage'a kaydet
 * 
 * User data objesini JSON string'e dönüştürerek kaydeder
 * Data null/undefined ise localStorage'dan siler
 * 
 * @param {Object|null} userData - Kullanıcı bilgileri objesi veya null
 * 
 * @example
 * setUserData({ id: 1, email: 'user@example.com', role: 'doctor' });
 * setUserData(null); // User data'yı sil
 */
export const setUserData = (userData) => {
  if (userData) {
    /**
     * User data varsa JSON string'e dönüştür ve kaydet
     */
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
  } else {
    /**
     * User data yoksa localStorage'dan sil
     */
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  }
};

/**
 * Kullanıcı verilerini localStorage'dan al
 * 
 * JSON string'i parse ederek obje döndürür
 * Data yoksa null döndürür
 * 
 * @returns {Object|null} Kullanıcı bilgileri objesi veya null
 * 
 * @example
 * const userData = getUserData();
 * if (userData) {
 *   console.log(userData.email, userData.role);
 * }
 */
export const getUserData = () => {
  /**
   * localStorage'dan user data'yı al
   */
  const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
  
  /**
   * Data varsa parse et ve döndür, yoksa null döndür
   */
  return userData ? JSON.parse(userData) : null;
};

/**
 * Tüm auth verilerini temizle (logout)
 * 
 * Access token, refresh token ve user data'yı
 * localStorage'dan siler
 * 
 * Kullanım: Logout işlemlerinde kullanılır
 * 
 * @example
 * clearAuthData(); // Tüm auth verileri temizlenir
 */
export const clearAuthData = () => {
  /**
   * Tüm auth verilerini localStorage'dan sil
   */
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.USER_DATA);
};

// ============================================================================
// TOKEN VALIDATION FUNCTIONS - Token validasyon fonksiyonları
// ============================================================================

/**
 * Token'ın geçerli olup olmadığını kontrol eder
 * 
 * JWT token'ın exp (expiration) claim'ini kontrol eder
 * Token formatı hatalıysa veya expire olmuşsa false döndürür
 * 
 * Not: Token imzası verify edilmez (backend'de yapılmalıdır)
 * 
 * @param {string} token - JWT token string
 * @returns {boolean} Token geçerliyse true, değilse false
 * 
 * @example
 * if (isTokenValid(token)) {
 *   console.log('Token geçerli');
 * } else {
 *   console.log('Token geçersiz veya expire olmuş');
 * }
 */
export const isTokenValid = (token) => {
  /**
   * Token varlık kontrolü
   */
  if (!token) {
    console.log('isTokenValid: No token provided');
    return false;
  }
  
  try {
    /**
     * JWT payload'ını decode et
     * 
     * Token formatı: Header.Payload.Signature
     * Payload base64 encoded JSON objesi
     */
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    /**
     * Expire kontrolü
     * 
     * payload.exp: Token'ın expire zamanı (Unix timestamp, saniye)
     * currentTime: Şu anki zaman (Unix timestamp, saniye)
     */
    const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp (saniye)
    const isValid = payload.exp > currentTime;
    
    /**
     * Debug log (development'ta detaylı bilgi)
     * 
     * Token durumu hakkında detaylı bilgi loglar
     */
    console.log('isTokenValid:', { 
      expTime: payload.exp, 
      currentTime, 
      isValid,
      timeUntilExpiry: payload.exp - currentTime,
      expDate: new Date(payload.exp * 1000).toISOString(),
      currentDate: new Date().toISOString(),
      tokenPreview: token.substring(0, 50) + '...',
      /**
       * Token'ın ne kadar süre kaldığını dakika cinsinden göster
       */
      minutesUntilExpiry: Math.floor((payload.exp - currentTime) / 60)
    });
    
    /**
     * Token'ın süresi dolmuş mu kontrol et
     * 
     * exp > currentTime ise token geçerlidir
     */
    return isValid;
  } catch (error) {
    /**
     * Hata yakalama
     * 
     * Token formatı hatalıysa veya decode başarısızsa
     * false döndürülür (güvenlik için)
     */
    console.error('isTokenValid - Token validation error:', error);
    return false;
  }
};

/**
 * Token'ın süresinin dolmasına ne kadar kaldığını hesaplar
 * 
 * Token'ın expire zamanı ile şu anki zaman arasındaki
 * farkı saniye cinsinden döndürür
 * 
 * @param {string} token - JWT token string
 * @returns {number} Saniye cinsinden kalan süre, hatalıysa veya expire olmuşsa 0
 * 
 * @example
 * const remaining = getTokenExpiryTime(token);
 * console.log(`Token'ın ${remaining} saniyesi kaldı`);
 */
export const getTokenExpiryTime = (token) => {
  /**
   * Token varlık kontrolü
   */
  if (!token) return 0;
  
  try {
    /**
     * JWT payload'ını decode et
     */
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    /**
     * Kalan süre hesaplama
     * 
     * payload.exp: Expire zamanı (Unix timestamp, saniye)
     * currentTime: Şu anki zaman (Unix timestamp, saniye)
     * Kalan süre: exp - currentTime (saniye)
     */
    const currentTime = Date.now() / 1000;
    
    /**
     * Math.max(0, ...) ile negatif değerleri 0 yap
     * 
     * Expire olmuş token'lar için 0 döndürülür
     */
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    /**
     * Hata durumunda 0 döndür
     */
    console.error('Token expiry calculation error:', error);
    return 0;
  }
};

/**
 * Auth durumunu kontrol eder
 * 
 * Tüm auth verilerinin durumunu kontrol eder ve
 * comprehensive bir durum objesi döndürür
 * 
 * @returns {Object} Auth durumu bilgileri
 * @returns {boolean} isAuthenticated - Access token var ve geçerli mi
 * @returns {boolean} hasRefreshToken - Refresh token var ve geçerli mi
 * @returns {Object|null} userData - Kullanıcı bilgileri
 * @returns {string|null} accessToken - Access token
 * @returns {string|null} refreshToken - Refresh token
 * 
 * @example
 * const authStatus = getAuthStatus();
 * if (authStatus.isAuthenticated) {
 *   console.log('Kullanıcı authenticate');
 * }
 */
export const getAuthStatus = () => {
  /**
   * Tüm auth verilerini al
   */
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const userData = getUserData();
  
  /**
   * Auth durumu objesi
   * 
   * Tüm auth bilgilerini içeren comprehensive obje
   */
  return {
    /**
     * Authentication durumu
     * 
     * Access token var ve geçerli ise true
     */
    isAuthenticated: !!accessToken && isTokenValid(accessToken),
    
    /**
     * Refresh token durumu
     * 
     * Refresh token var ve geçerli ise true
     */
    hasRefreshToken: !!refreshToken && isTokenValid(refreshToken),
    
    /**
     * Kullanıcı bilgileri
     */
    userData,
    
    /**
     * Token'lar
     * 
     * Not: Güvenlik için production'da token'lar döndürülmemelidir
     * Bu utility debugging için kullanılabilir
     */
    accessToken,
    refreshToken
  };
};
