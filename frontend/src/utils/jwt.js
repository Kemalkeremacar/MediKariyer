/**
 * JWT Utility Functions - JWT token işlemleri
 * Token decode, expire kontrolü ve payload çıkarma
 */

/**
 * JWT token'ı decode eder (verify etmez, sadece payload'ı çıkarır)
 * @param {string} token - JWT token
 * @returns {object|null} - Decode edilmiş payload veya null
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Token decode hatası:', error);
    return null;
  }
};

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder
 * @param {string} token - JWT token
 * @returns {boolean} - Token süresi dolmuşsa true
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Token expire kontrolü hatası:', error);
    return true;
  }
};

/**
 * Token'dan kullanıcı bilgilerini çıkarır
 * @param {string} token - JWT token
 * @returns {object|null} - Kullanıcı bilgileri veya null
 */
export const getUserFromToken = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isApproved: decoded.isApproved,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    console.error('Token'dan kullanıcı çıkarma hatası:', error);
    return null;
  }
};

/**
 * Token'ın geçerli olup olmadığını kontrol eder
 * @param {string} token - JWT token
 * @returns {boolean} - Token geçerliyse true
 */
export const isValidToken = (token) => {
  try {
    if (!token) return false;
    
    const decoded = decodeToken(token);
    if (!decoded) return false;
    
    // Temel alanların varlığını kontrol et
    if (!decoded.id || !decoded.email || !decoded.role) return false;
    
    // Süre kontrolü
    if (isTokenExpired(token)) return false;
    
    return true;
  } catch (error) {
    console.error('Token geçerlilik kontrolü hatası:', error);
    return false;
  }
};

/**
 * Token'dan kalan süreyi dakika olarak döndürür
 * @param {string} token - JWT token
 * @returns {number} - Kalan dakika sayısı, hatalıysa 0
 */
export const getTokenRemainingMinutes = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp - currentTime;
    
    if (remainingSeconds <= 0) return 0;
    
    return Math.floor(remainingSeconds / 60);
  } catch (error) {
    console.error('Token kalan süre hesaplama hatası:', error);
    return 0;
  }
};

/**
 * Token'ın yenilenmesi gerekip gerekmediğini kontrol eder
 * @param {string} token - JWT token
 * @param {number} refreshThresholdMinutes - Yenileme eşiği (dakika, varsayılan 15)
 * @returns {boolean} - Yenilenmesi gerekiyorsa true
 */
export const shouldRefreshToken = (token, refreshThresholdMinutes = 15) => {
  try {
    const remainingMinutes = getTokenRemainingMinutes(token);
    return remainingMinutes > 0 && remainingMinutes <= refreshThresholdMinutes;
  } catch (error) {
    console.error('Token yenileme kontrolü hatası:', error);
    return false;
  }
};
