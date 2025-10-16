/**
 * Token Management Utilities
 * Access token ve refresh token yönetimi için yardımcı fonksiyonlar
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'mediKariyer_access_token',
  REFRESH_TOKEN: 'mediKariyer_refresh_token',
  USER_DATA: 'mediKariyer_user_data'
};

/**
 * Access token'ı localStorage'a kaydet
 * @param {string} token - JWT access token
 */
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  } else {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  }
};

/**
 * Access token'ı localStorage'dan al
 * @returns {string|null} JWT access token
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Refresh token'ı localStorage'a kaydet
 * @param {string} token - JWT refresh token
 */
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }
};

/**
 * Refresh token'ı localStorage'dan al
 * @returns {string|null} JWT refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Kullanıcı verilerini localStorage'a kaydet
 * @param {Object} userData - Kullanıcı bilgileri
 */
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
  } else {
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  }
};

/**
 * Kullanıcı verilerini localStorage'dan al
 * @returns {Object|null} Kullanıcı bilgileri
 */
export const getUserData = () => {
  const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Tüm auth verilerini temizle (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.USER_DATA);
};

/**
 * Token'ın geçerli olup olmadığını kontrol et
 * @param {string} token - JWT token
 * @returns {boolean} Token geçerli mi?
 */
export const isTokenValid = (token) => {
  if (!token) {
    console.log('isTokenValid: No token provided');
    return false;
  }
  
  try {
    // JWT payload'ını decode et (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp (saniye)
    const isValid = payload.exp > currentTime;
    
    console.log('isTokenValid:', { 
      expTime: payload.exp, 
      currentTime, 
      isValid,
      timeUntilExpiry: payload.exp - currentTime,
      expDate: new Date(payload.exp * 1000).toISOString(),
      currentDate: new Date().toISOString(),
      tokenPreview: token.substring(0, 50) + '...',
      // Token'ın ne kadar süre kaldığını dakika cinsinden göster
      minutesUntilExpiry: Math.floor((payload.exp - currentTime) / 60)
    });
    
    // Token'ın süresi dolmuş mu kontrol et
    return isValid;
  } catch (error) {
    console.error('isTokenValid - Token validation error:', error);
    return false;
  }
};

/**
 * Token'ın süresinin dolmasına ne kadar kaldığını hesapla
 * @param {string} token - JWT token
 * @returns {number} Saniye cinsinden kalan süre
 */
export const getTokenExpiryTime = (token) => {
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.error('Token expiry calculation error:', error);
    return 0;
  }
};

/**
 * Auth durumunu kontrol et
 * @returns {Object} Auth durumu bilgileri
 */
export const getAuthStatus = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const userData = getUserData();
  
  return {
    isAuthenticated: !!accessToken && isTokenValid(accessToken),
    hasRefreshToken: !!refreshToken && isTokenValid(refreshToken),
    userData,
    accessToken,
    refreshToken
  };
};
