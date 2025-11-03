/**
 * @file jwt.js
 * @description JWT Utility Functions - JWT token işlemleri
 * 
 * Bu dosya, JWT token'ları ile ilgili işlemler için utility fonksiyonlar sağlar.
 * Token decode, expire kontrolü, payload çıkarma ve token validasyon
 * işlemleri yapılır.
 * 
 * Ana Özellikler:
 * - Token decode: JWT token'ını decode eder (verify etmez)
 * - Expire kontrolü: Token'ın süresinin dolup dolmadığını kontrol eder
 * - User bilgisi çıkarma: Token'dan kullanıcı bilgilerini çıkarır
 * - Token geçerlilik kontrolü: Token'ın geçerli olup olmadığını kontrol eder
 * - Kalan süre hesaplama: Token'ın ne kadar süre kaldığını hesaplar
 * - Refresh kontrolü: Token'ın yenilenmesi gerekip gerekmediğini kontrol eder
 * 
 * Fonksiyonlar:
 * - decodeToken: JWT token'ı decode eder
 * - isTokenExpired: Token'ın süresi dolmuş mu kontrol eder
 * - getUserFromToken: Token'dan kullanıcı bilgilerini çıkarır
 * - isValidToken: Token'ın geçerli olup olmadığını kontrol eder
 * - getTokenRemainingMinutes: Token'ın kalan süresini dakika olarak döndürür
 * - shouldRefreshToken: Token yenilenmeli mi kontrol eder
 * 
 * JWT Token Yapısı:
 * - Header.Payload.Signature formatında
 * - Payload base64 encoded JSON objesi
 * - Payload içinde: id, email, role, isApproved, iat, exp gibi claim'ler
 * 
 * Token Claims:
 * - id: Kullanıcı ID'si
 * - email: Kullanıcı email'i
 * - role: Kullanıcı rolü (doctor, hospital, admin)
 * - isApproved: Kullanıcı onay durumu
 * - iat: Token oluşturulma zamanı (issued at)
 * - exp: Token bitiş zamanı (expiration)
 * 
 * Kullanım:
 * ```javascript
 * import { 
 *   decodeToken, 
 *   isTokenExpired, 
 *   getUserFromToken,
 *   isValidToken 
 * } from '@/utils/jwt';
 * 
 * // Token decode
 * const payload = decodeToken(token);
 * console.log(payload.id, payload.email, payload.role);
 * 
 * // Expire kontrolü
 * if (isTokenExpired(token)) {
 *   console.log('Token süresi dolmuş');
 * }
 * 
 * // User bilgisi çıkarma
 * const user = getUserFromToken(token);
 * console.log(user.id, user.email, user.role);
 * 
 * // Geçerlilik kontrolü
 * if (isValidToken(token)) {
 *   console.log('Token geçerli');
 * }
 * ```
 * 
 * Not: Bu fonksiyonlar token'ı verify etmez, sadece decode eder.
 * Token'ın imzası doğrulanmaz, sadece format ve expire kontrolü yapılır.
 * Güvenlik için backend'de token verify edilmelidir.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * JWT UTILITY FUNCTIONS - JWT token işlemleri
 * ============================================================================
 */

/**
 * JWT token'ı decode eder
 * 
 * Token'ı verify etmez, sadece payload'ı çıkarır
 * Güvenlik için backend'de token verify edilmelidir
 * 
 * JWT Formatı:
 * - Header.Payload.Signature (3 kısım)
 * - Payload base64 encoded JSON objesi
 * - Base64 URL-safe encoding kullanılır (+, /, = karakterleri özel işlem gerektirir)
 * 
 * @param {string} token - JWT token string
 * @returns {Object|null} Decode edilmiş payload objesi veya null
 * 
 * @example
 * const payload = decodeToken('eyJhbGciOiJIUzI1NiIs...');
 * console.log(payload.id, payload.email, payload.role);
 */
export const decodeToken = (token) => {
  try {
    /**
     * Token varlık kontrolü
     */
    if (!token) return null;
    
    /**
     * JWT format kontrolü
     * 
     * JWT token 3 kısımdan oluşur: Header.Payload.Signature
     * Split('.') ile kontrol edilir
     */
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    /**
     * Payload çıkarma
     * 
     * parts[0]: Header
     * parts[1]: Payload (bizim ihtiyacımız olan)
     * parts[2]: Signature
     */
    const payload = parts[1];
    
    /**
     * Base64 decode ve JSON parse
     * 
     * Base64 URL-safe encoding karakterleri düzeltilir:
     * - '-' → '+'
     * - '_' → '/'
     * 
     * atob(): Base64 decode eder
     * JSON.parse(): String'i objeye çevirir
     */
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    /**
     * Decode edilmiş payload'ı döndür
     */
    return decoded;
  } catch (error) {
    /**
     * Hata yakalama
     * 
     * Token formatı hatalıysa veya decode başarısızsa null döndür
     */
    console.error('Token decode hatası:', error);
    return null;
  }
};

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder
 * 
 * JWT token'ın exp (expiration) claim'ini kontrol eder
 * Unix timestamp formatında (saniye cinsinden) karşılaştırma yapar
 * 
 * @param {string} token - JWT token string
 * @returns {boolean} Token süresi dolmuşsa true, geçerliyse false
 * 
 * @example
 * if (isTokenExpired(token)) {
 *   console.log('Token süresi dolmuş, yenileme gerekli');
 * }
 */
export const isTokenExpired = (token) => {
  try {
    /**
     * Token'ı decode et
     */
    const decoded = decodeToken(token);
    
    /**
     * Decode başarısız veya exp claim yoksa expire olmuş sayılır
     */
    if (!decoded || !decoded.exp) return true;
    
    /**
     * Expire kontrolü
     * 
     * decoded.exp: Token'ın expire zamanı (Unix timestamp, saniye)
     * currentTime: Şu anki zaman (Unix timestamp, saniye)
     * 
     * exp < currentTime ise token expire olmuştur
     */
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    /**
     * Hata durumunda expire olmuş sayılır (güvenlik için)
     */
    console.error('Token expire kontrolü hatası:', error);
    return true;
  }
};

/**
 * Token'dan kullanıcı bilgilerini çıkarır
 * 
 * JWT token'ın payload'ından kullanıcı bilgilerini çıkarır
 * id, email, role, isApproved, iat, exp gibi bilgileri döndürür
 * 
 * @param {string} token - JWT token string
 * @returns {Object|null} Kullanıcı bilgileri objesi veya null
 * 
 * @returns {number|null} user.id - Kullanıcı ID'si
 * @returns {string|null} user.email - Kullanıcı email'i
 * @returns {string|null} user.role - Kullanıcı rolü (doctor, hospital, admin)
 * @returns {boolean|null} user.isApproved - Kullanıcı onay durumu
 * @returns {number|null} user.iat - Token oluşturulma zamanı (issued at)
 * @returns {number|null} user.exp - Token bitiş zamanı (expiration)
 * 
 * @example
 * const user = getUserFromToken(token);
 * console.log(user.id, user.email, user.role);
 */
export const getUserFromToken = (token) => {
  try {
    /**
     * Token'ı decode et
     */
    const decoded = decodeToken(token);
    
    /**
     * Decode başarısızsa null döndür
     */
    if (!decoded) return null;
    
    /**
     * Kullanıcı bilgilerini çıkar
     * 
     * Payload'dan gerekli alanları al ve obje oluştur
     */
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isApproved: decoded.isApproved,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    /**
     * Hata durumunda null döndür
     */
    console.error('Token\'dan kullanıcı çıkarma hatası:', error);
    return null;
  }
};

/**
 * Token'ın geçerli olup olmadığını kontrol eder
 * 
 * Token geçerlilik kontrolü:
 * 1. Token varlık kontrolü
 * 2. Token decode kontrolü
 * 3. Temel alanların varlığı (id, email, role)
 * 4. Token expire kontrolü
 * 
 * Not: Token imzası verify edilmez (backend'de yapılmalıdır)
 * 
 * @param {string} token - JWT token string
 * @returns {boolean} Token geçerliyse true, değilse false
 * 
 * @example
 * if (isValidToken(token)) {
 *   console.log('Token geçerli, işlem yapılabilir');
 * }
 */
export const isValidToken = (token) => {
  try {
    /**
     * Token varlık kontrolü
     */
    if (!token) return false;
    
    /**
     * Token decode kontrolü
     */
    const decoded = decodeToken(token);
    if (!decoded) return false;
    
    /**
     * Temel alanların varlığını kontrol et
     * 
     * JWT token'da olması gereken minimum alanlar:
     * - id: Kullanıcı ID'si
     * - email: Kullanıcı email'i
     * - role: Kullanıcı rolü
     */
    if (!decoded.id || !decoded.email || !decoded.role) return false;
    
    /**
     * Süre kontrolü
     * 
     * Token expire olmuşsa geçersizdir
     */
    if (isTokenExpired(token)) return false;
    
    /**
     * Tüm kontroller başarılı, token geçerli
     */
    return true;
  } catch (error) {
    /**
     * Hata durumunda geçersiz sayılır
     */
    console.error('Token geçerlilik kontrolü hatası:', error);
    return false;
  }
};

/**
 * Token'dan kalan süreyi dakika olarak döndürür
 * 
 * Token'ın expire olmasına ne kadar süre kaldığını hesaplar
 * Dakika cinsinden döndürür
 * 
 * @param {string} token - JWT token string
 * @returns {number} Kalan dakika sayısı, hatalıysa veya expire olmuşsa 0
 * 
 * @example
 * const remaining = getTokenRemainingMinutes(token);
 * console.log(`Token'ın ${remaining} dakikası kaldı`);
 */
export const getTokenRemainingMinutes = (token) => {
  try {
    /**
     * Token'ı decode et
     */
    const decoded = decodeToken(token);
    
    /**
     * Decode başarısız veya exp claim yoksa 0 döndür
     */
    if (!decoded || !decoded.exp) return 0;
    
    /**
     * Kalan süre hesaplama
     * 
     * decoded.exp: Expire zamanı (Unix timestamp, saniye)
     * currentTime: Şu anki zaman (Unix timestamp, saniye)
     * remainingSeconds: Kalan süre (saniye)
     */
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp - currentTime;
    
    /**
     * Expire olmuşsa 0 döndür
     */
    if (remainingSeconds <= 0) return 0;
    
    /**
     * Dakika cinsine çevir ve yuvarla
     * 
     * Saniye / 60 = Dakika
     * Math.floor ile aşağı yuvarlanır
     */
    return Math.floor(remainingSeconds / 60);
  } catch (error) {
    /**
     * Hata durumunda 0 döndür
     */
    console.error('Token kalan süre hesaplama hatası:', error);
    return 0;
  }
};

/**
 * Token'ın yenilenmesi gerekip gerekmediğini kontrol eder
 * 
 * Token'ın expire olmasına belirtilen eşik (threshold) süresi veya daha az kaldıysa
 * true döndürür. Bu, proaktif token refresh için kullanılır.
 * 
 * Mantık:
 * - Token expire olmuşsa: false (zaten yenilenmesi gerekti, kontrol edilemez)
 * - Kalan süre > threshold: false (henüz yenilemeye gerek yok)
 * - Kalan süre <= threshold ve > 0: true (yenileme gerekli)
 * 
 * @param {string} token - JWT token string
 * @param {number} refreshThresholdMinutes - Yenileme eşiği (dakika, varsayılan: 15)
 * @returns {boolean} Yenilenmesi gerekiyorsa true, değilse false
 * 
 * @example
 * if (shouldRefreshToken(token, 15)) {
 *   console.log('Token 15 dakika içinde expire olacak, yenileme gerekli');
 * }
 */
export const shouldRefreshToken = (token, refreshThresholdMinutes = 15) => {
  try {
    /**
     * Kalan dakikayı hesapla
     */
    const remainingMinutes = getTokenRemainingMinutes(token);
    
    /**
     * Yenileme kontrolü
     * 
     * Kalan süre > 0 ve <= threshold ise yenileme gerekli
     * 
     * Örnek: threshold = 15
     * - remainingMinutes = 20 → false (henüz erken)
     * - remainingMinutes = 10 → true (yenileme gerekli)
     * - remainingMinutes = 0 → false (zaten expire olmuş)
     */
    return remainingMinutes > 0 && remainingMinutes <= refreshThresholdMinutes;
  } catch (error) {
    /**
     * Hata durumunda false döndür (yenileme yapılmaz)
     */
    console.error('Token yenileme kontrolü hatası:', error);
    return false;
  }
};
