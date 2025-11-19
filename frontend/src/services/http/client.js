/**
 * @file client.js
 * @description HTTP Client - Axios instance ve interceptor yönetimi
 * 
 * Bu dosya, uygulama genelinde kullanılan HTTP client yapılandırmasını içerir.
 * Axios instance oluşturur, request/response interceptor'ları yapılandırır ve
 * API çağrıları için yardımcı fonksiyonlar sağlar.
 * 
 * Ana Özellikler:
 * - Axios instance yapılandırması: Base URL, timeout, default headers
 * - Request interceptor: Token ekleme, public endpoint kontrolü, logging
 * - Response interceptor: Token refresh, error handling, logging
 * - Rate limiting: Basit rate limiter implementasyonu
 * - File upload client: Multipart/form-data için özel client
 * - API wrapper fonksiyonları: GET, POST, PUT, PATCH, DELETE
 * - Domain-specific helpers: Doctor ve Hospital için özel API fonksiyonları
 * 
 * Public Endpoints:
 * - Token gerektirmeyen endpoint'ler tanımlanmıştır
 * - Login, register, refresh, lookup, contact, health endpoint'leri
 * 
 * Token Yönetimi:
 * - Request interceptor'da token otomatik eklenir
 * - 401 hatası durumunda token refresh denenir
 * - Refresh başarısız olursa logout yapılır
 * 
 * Error Handling:
 * - 401 Unauthorized: Token refresh denemesi
 * - 403 Forbidden: Yetki hatası yönetimi
 * - Network errors: Network hata loglama
 * 
 * Rate Limiting:
 * - Basit sliding window algoritması
 * - 60 request/dakika limiti per endpoint
 * 
 * Kullanım:
 * ```javascript
 * import { apiRequest } from '@/services/http/client';
 * 
 * // GET request
 * const data = await apiRequest.get('/doctor/profile');
 * 
 * // POST request
 * const result = await apiRequest.post('/doctor/applications', applicationData);
 * 
 * // Domain-specific helper
 * import { doctorApiRequest } from '@/services/http/client';
 * const profile = await doctorApiRequest.getProfile();
 * ```
 * 
 * Backend Uyumluluk:
 * - Base URL environment variable'dan alınır
 * - Token format: "Bearer {token}"
 * - Request ID header eklenir (debugging için)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * IMPORTS - Kütüphane ve utility import'ları
 * ============================================================================
 */

/**
 * Axios HTTP client kütüphanesi
 * HTTP istekleri için kullanılan temel kütüphane
 */
import axios from 'axios';

/**
 * Uygulama konfigürasyon dosyası
 * USER_ROLES gibi sabit değerler için kullanılır
 */
import { APP_CONFIG } from '@config/app.js';

/**
 * Route konfigürasyon dosyası
 * Route path'leri için kullanılır (redirect'ler için)
 */
import { ROUTE_CONFIG } from '@config/routes.js';

/**
 * Logger utility
 * API çağrıları ve hataları için logging
 */
import logger from '../../utils/logger';

/**
 * Auth store
 * Token ve kullanıcı bilgilerine erişim için
 */
import useAuthStore from '../../store/authStore';

// ============================================================================
// CONSTANTS - Sabitler ve konfigürasyonlar
// ============================================================================

/**
 * Base URL - API base URL'i
 * 
 * Environment variable'dan alınır (VITE_API_URL)
 * Fallback: localhost için 'http://localhost:3100/api'
 * Fallback: prod için 'https://mkapi.monassist.com/api'
 * 
 * Tüm API istekleri bu base URL'e göre yapılır
 */
const BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3100/api' : 'https://mkapi.monassist.com/api');

/**
 * Public endpoint'ler - Token gerektirmeyen endpoint'ler
 * 
 * Bu endpoint'ler için Authorization header eklenmez
 * Kullanıcı girişi yapmadan erişilebilir
 * 
 * Endpoint'ler:
 * - /auth/login: Giriş endpoint'i
 * - /auth/registerDoctor: Doktor kayıt endpoint'i
 * - /auth/registerHospital: Hastane kayıt endpoint'i
 * - /auth/refresh: Token yenileme endpoint'i
 * - /auth/forgot-password: Şifre unutma endpoint'i
 * - /auth/reset-password: Şifre sıfırlama endpoint'i
 * - /lookup: Lookup verileri endpoint'i
 * - /contact: İletişim formu endpoint'i
 * - /health: Health check endpoint'i
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/registerDoctor',
  '/auth/registerHospital',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/lookup',
  '/contact',
  '/health'
];

// ============================================================================
// AXIOS INSTANCE - Ana API client instance'ı
// ============================================================================

/**
 * API Client Instance
 * 
 * Tüm API istekleri için kullanılan axios instance
 * 
 * Konfigürasyon:
 * - baseURL: BASE_URL sabiti (environment variable'dan)
 * - timeout: 30000ms (30 saniye) - uzun süren işlemler için yeterli
 * - headers: Default headers
 *   - Content-Type: application/json
 *   - X-Requested-With: XMLHttpRequest (CORS için)
 *   - X-Client-Version: 1.0.0 (API versioning için)
 * 
 * Not: Authorization header request interceptor'da dinamik olarak eklenir
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 saniye
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - İstek öncesi işlemler
// ============================================================================

/**
 * Request Interceptor - Token ekleme ve logging
 * 
 * Her API isteği öncesinde çalışır ve şunları yapar:
 * 1. Performance tracking: İstek başlangıç zamanını kaydeder
 * 2. Token kontrolü: Public endpoint kontrolü yapar
 * 3. Authorization header: Protected endpoint'ler için token ekler
 * 4. Request ID: Debugging için unique request ID ekler
 * 5. Logging: API çağrısını loglar
 * 
 * Parametreler:
 * @param {Object} config - Axios request config objesi
 * @param {string} config.url - Request URL'i
 * @param {string} config.method - HTTP method (GET, POST, vb.)
 * @param {Object} config.headers - Request headers
 * @param {any} config.data - Request body (POST, PUT için)
 * 
 * Dönüş:
 * @returns {Object} Modified config objesi
 */
apiClient.interceptors.request.use(
  (config) => {
    /**
     * Performance tracking
     * İstek başlangıç zamanını metadata'ya ekle
     * Response interceptor'da süre hesaplama için kullanılır
     */
    const startTime = Date.now();
    config.metadata = { startTime };
    
    /**
     * Token alma
     * Auth store'dan access token'ı al
     */
    const token = useAuthStore.getState().getToken();
    
    /**
     * Public endpoint kontrolü
     * 
     * URL'in public endpoint'lerden biri olup olmadığını kontrol eder
     * Kontrol mantığı:
     * - Tam eşleşme: config.url === endpoint
     * - Başlangıç eşleşmesi: endpoint '/' ile bitiyorsa startsWith kontrolü
     * - Başlangıç eşleşmesi: endpoint '/' ile bitmiyorsa startsWith(endpoint + '/') kontrolü
     * 
     * Örnek:
     * - endpoint: '/auth/login', url: '/auth/login' → true
     * - endpoint: '/lookup', url: '/lookup/cities' → true
     */
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => {
      // Tam eşleşme veya başlangıç eşleşmesi kontrolü
      return config.url === endpoint || 
             (endpoint.endsWith('/') && config.url?.startsWith(endpoint)) ||
             (!endpoint.endsWith('/') && config.url?.startsWith(endpoint + '/'));
    });
    
    /**
     * Protected endpoint işlemleri
     * Public endpoint değilse token kontrolü ve ekleme yapılır
     */
    if (!isPublicEndpoint) {
      /**
       * Token varlık kontrolü
       * Token yoksa istek reddedilir
       */
      if (!token) {
        logger.warn('No token found for protected endpoint', { url: config.url });
        return Promise.reject(new Error('Authorization header bulunamadı'));
      }
      
      /**
       * Token expire kontrolü
       * Token süresi dolmuşsa istek reddedilir
       */
      if (useAuthStore.getState().isTokenExpired()) {
        logger.warn('Token expired, skipping request', { url: config.url });
        return Promise.reject(new Error('Token expired'));
      }
      
      /**
       * Authorization header ekleme
       * Bearer token formatında Authorization header eklenir
       * Backend Bearer token formatını bekler
       */
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('Authorization header added', { url: config.url, tokenPreview: token.substring(0, 20) + '...' });
    }
    
    /**
     * Request ID ekleme
     * 
     * Her request için unique bir ID oluşturulur
     * Format: req_{timestamp}_{randomString}
     * 
     * Amaç: Request tracing ve debugging
     * Backend'de de bu ID loglanabilir (opsiyonel)
     */
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Request-ID'] = requestId;
    
    /**
     * API çağrısı loglama
     * 
     * Request detaylarını loglar
     * Method, URL, data bilgileri loglanır
     * Duration henüz bilinmediği için 0 olarak loglanır
     */
    logger.apiLog(config.method?.toUpperCase() || 'GET', config.url, config.data, null, 0);
    
    /**
     * Modified config döndür
     * Authorization header ve metadata eklenmiş config döndürülür
     */
    return config;
  },
  /**
   * Request interceptor error handler
   * 
   * Request interceptor'da hata oluşursa bu fonksiyon çağrılır
   * Hata loglanır ve reject edilir
   * 
   * @param {Error} error - Oluşan hata
   * @returns {Promise<Error>} Rejected promise
   */
  (error) => {
    logger.captureError(error, 'API Request Interceptor');
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Yanıt sonrası işlemler
// ============================================================================

/**
 * Response Interceptor - Token refresh ve error handling
 * 
 * Her API yanıtı sonrasında çalışır ve şunları yapar:
 * 1. Performance logging: İstek süresini hesaplar ve loglar
 * 2. Success handling: Başarılı yanıtları loglar
 * 3. Error handling: Hata yanıtlarını yönetir
 * 4. Token refresh: 401 hatası durumunda token yeniler
 * 5. Redirect: Yetki hatalarında yönlendirme yapar
 * 
 * İki handler fonksiyonu:
 * - Success handler: Başarılı yanıtlar için
 * - Error handler: Hata yanıtları için
 */
apiClient.interceptors.response.use(
  /**
   * Success Handler - Başarılı yanıt işleme
   * 
   * Başarılı API yanıtları için çalışır
   * Performance logging ve response logging yapar
   * 
   * @param {Object} response - Axios response objesi
   * @param {Object} response.config - Original request config
   * @param {Object} response.config.metadata - Request metadata (startTime)
   * @param {any} response.data - Response data
   * @returns {Object} Response objesi (değiştirilmeden döndürülür)
   */
  (response) => {
    /**
     * Performance logging
     * 
     * İstek süresini hesapla
     * Request interceptor'da kaydedilen startTime ile şu anki zamanı karşılaştır
     */
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    
    /**
     * API çağrısı loglama (response)
     * 
     * Method, URL, request data, response data ve duration loglanır
     * Başarılı çağrıların performans takibi için kullanılır
     */
    logger.apiLog(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url,
      response.config.data,
      response.data,
      duration
    );

    /**
     * Başarılı response döndür
     * Response objesi değiştirilmeden döndürülür
     */
    return response;
  },
  /**
   * Error Handler - Hata yanıtı işleme
   * 
   * Hatalı API yanıtları için çalışır
   * Token refresh, error logging, redirect işlemleri yapar
   * 
   * @param {Error} error - Axios error objesi
   * @param {Object} error.config - Original request config
   * @param {Object} error.response - HTTP response (varsa)
   * @param {number} error.response.status - HTTP status code
   * @param {Object} error.response.data - Response error data
   * @returns {Promise} Rejected promise veya retry promise
   */
  async (error) => {
    /**
     * Original request ve duration hesaplama
     * 
     * Orijinal request config'ini al
     * İstek süresini hesapla (hata olsa bile)
     */
    const originalRequest = error.config;
    const duration = Date.now() - (originalRequest.metadata?.startTime || Date.now());
    
    /**
     * Error logging
     * 
     * Hata detaylarını loglar:
     * - URL, method
     * - HTTP status, statusText
     * - Response data
     * - İstek süresi
     * 
     * 404 hatalarını loglama (beklenen durumlar):
     * - Silinmiş/bulunamayan iş ilanları
     * - Silinmiş/bulunamayan başvurular
     * - Diğer bulunamayan kaynaklar
     */
    const is404Error = error.response?.status === 404;
    const isJobDetailRequest = originalRequest.url?.includes('/jobs/') && originalRequest.method === 'get';
    const isApplicationDetailRequest = originalRequest.url?.includes('/applications/') && originalRequest.method === 'get';
    
    // 404 hatalarını sadece debug modda logla (production'da loglama)
    if (is404Error && (isJobDetailRequest || isApplicationDetailRequest)) {
      // Debug mode'da logla
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`404 Not Found: ${originalRequest.url}`, {
          url: originalRequest.url,
          method: originalRequest.method,
          status: 404
        });
      }
    } else {
      // Diğer hataları normal şekilde logla
      logger.captureError(error, 'API Response', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        duration
      });
    }
    
    /**
     * 401 Unauthorized - Token refresh denemesi
     * 
     * 401 hatası ve henüz retry yapılmamışsa token refresh dene
     * _retry flag'i ile sonsuz döngü önlenir
     */
    if (error.response?.status === 401 && !originalRequest._retry) {
      /**
       * Retry flag ayarla
       * Bu request için bir daha token refresh denenmemesi için
       */
      originalRequest._retry = true;
      
      /**
       * Public endpoint kontrolü
       * 
       * Public endpoint'ler için 401 hatası normal olabilir
       * (örn: yanlış şifre durumunda)
       * Bu durumda token refresh yapılmaz, hata direkt döndürülür
       */
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      if (isPublicEndpoint) {
        // Public endpoint'ler için 401 hatası normal - yönlendirme yapma
        logger.info('Public endpoint 401 error - not redirecting', { url: originalRequest.url });
        return Promise.reject(error);
      }
      
      /**
       * Refresh token alma
       * Auth store'dan refresh token'ı al
       */
      const refreshToken = useAuthStore.getState().getRefreshToken();
      
      if (refreshToken) {
        try {
          /**
           * Token refresh denemesi
           * 
           * Backend'e refresh token gönderilir
           * Yeni access token ve refresh token alınır
           */
          logger.info('Attempting token refresh');
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          /**
           * Yeni token'ları alma
           * Response'dan accessToken ve refreshToken çıkarılır
           */
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          /**
           * Auth store'u güncelleme
           * 
           * Yeni token'lar auth store'a kaydedilir
           * LocalStorage'a da otomatik olarak persist edilir (Zustand persist middleware)
           */
          useAuthStore.getState().updateTokens({
            accessToken,
            refreshToken: newRefreshToken
          });
          
          logger.info('Token refresh successful');
          
          /**
           * Orijinal request'i retry
           * 
           * Yeni access token ile original request tekrar gönderilir
           * Authorization header güncellenir ve request retry edilir
           */
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          /**
           * Refresh başarısız - logout
           * 
           * Token refresh başarısız olursa (refresh token geçersiz, expire, vb.)
           * Kullanıcı logout edilir ve hata döndürülür
           */
          logger.error('Token refresh failed', refreshError);
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        /**
         * Refresh token yok - logout
         * 
         * Refresh token mevcut değilse kullanıcı logout edilir
         * Bu durumda kullanıcı tekrar giriş yapmalıdır
         */
        logger.warn('No refresh token available, redirecting to home');
        useAuthStore.getState().logout();
      }
    }
    
    /**
     * 403 Forbidden - Yetkisiz erişim hatası
     * 
     * Kullanıcının yetkisi olmayan bir endpoint'e erişim denemesi
     * Rol bazlı error handling yapılır
     */
    if (error.response?.status === 403) {
      /**
       * Role-based error handling
       * 
       * Kullanıcı rolünü al
       * Rol bazlı özel işlemler yapılabilir
       */
      const userRole = useAuthStore.getState().getUserRole();
      
      logger.warn('Access forbidden', {
        userRole,
        url: originalRequest.url,
        method: originalRequest.method
      });
      
      /**
       * Onaylanmamış doktor kontrolü
       * 
       * Eğer kullanıcı doktor rolündeyse ve onaylanmamışsa
       * Dashboard'a yönlendirilir (onay bekleme sayfası için)
       */
      if (userRole === APP_CONFIG.USER_ROLES.DOCTOR && !useAuthStore.getState().isApproved()) {
        // Onaylanmamış doktor
        window.location.href = ROUTE_CONFIG.DOCTOR.DASHBOARD;
      } else {
        /**
         * Diğer yetki hataları
         * 
         * Genel yetki hatası loglanır
         * Kullanıcıya hata mesajı gösterilebilir (component tarafında)
         */
        logger.error('Unauthorized access', error.response.data);
      }
    }
    
    /**
     * Network error handling
     * 
     * HTTP response yoksa network hatası vardır
     * (Sunucuya ulaşılamadı, timeout, vb.)
     * Bu durum özel olarak loglanır
     */
    if (!error.response) {
      logger.error('Network error', {
        message: error.message,
        url: originalRequest.url,
        method: originalRequest.method
      });
    }
    
    /**
     * Hata döndür
     * 
     * Tüm hata durumları için error reject edilir
     * Component'ler bu hatayı yakalayıp kullanıcıya gösterebilir
     */
    return Promise.reject(error);
  }
);

// ============================================================================
// RATE LIMITER - Rate limiting implementasyonu
// ============================================================================

/**
 * Rate Limiter - Basit sliding window algoritması
 * 
 * Her endpoint için rate limiting yapar
 * 60 request/dakika limiti uygular
 * 
 * Algoritma:
 * - Sliding window: Son 1 dakika içindeki request'leri takip eder
 * - Her endpoint için ayrı limit uygulanır
 * - Eski request'ler otomatik olarak temizlenir
 * 
 * Kullanım:
 * Her API çağrısı öncesinde isAllowed() kontrol edilir
 * Limit aşılırsa request reddedilir
 */
const rateLimiter = {
  /**
   * Request history Map
   * 
   * Endpoint bazında request zamanlarını tutar
   * Key: endpoint URL
   * Value: timestamp array'i (son 1 dakika içindeki request zamanları)
   */
  requests: new Map(),
  
  /**
   * Rate limit kontrolü
   * 
   * Endpoint için rate limit kontrolü yapar
   * 60 request/dakika limitini uygular
   * 
   * @param {string} endpoint - Kontrol edilecek endpoint URL'i
   * @returns {boolean} Request yapılabilirse true, limit aşıldıysa false
   */
  isAllowed: (endpoint) => {
    /**
     * Zaman hesaplamaları
     * 
     * now: Şu anki zaman (ms)
     * windowStart: Sliding window başlangıç zamanı (1 dakika öncesi)
     */
    const now = Date.now();
    const windowStart = now - 60000; // 1 dakika
    
    /**
     * Endpoint için request history yoksa oluştur
     * 
     * İlk kez çağrılan endpoint'ler için boş array oluşturulur
     */
    if (!rateLimiter.requests.has(endpoint)) {
      rateLimiter.requests.set(endpoint, []);
    }
    
    /**
     * Endpoint'in request history'sini al
     */
    const requests = rateLimiter.requests.get(endpoint);
    
    /**
     * Eski request'leri temizle
     * 
     * windowStart'tan önceki request'leri filtrele
     * Sadece son 1 dakika içindeki request'leri tut
     */
    const recentRequests = requests.filter(time => time > windowStart);
    rateLimiter.requests.set(endpoint, recentRequests);
    
    /**
     * Limit kontrolü
     * 
     * Son 1 dakika içinde 60'dan fazla request varsa limit aşılmıştır
     * Request reddedilir
     */
    if (recentRequests.length >= 60) { // 60 çağrı/dakika
      return false;
    }
    
    /**
     * Yeni request'i ekle
     * 
     * Limit aşılmamışsa şu anki zamanı request history'ye ekle
     * Request'e izin verilir
     */
    recentRequests.push(now);
    return true;
  }
};

// ============================================================================
// API REQUEST WRAPPER - HTTP method wrapper fonksiyonları
// ============================================================================

/**
 * API Request Wrapper Fonksiyonları
 * 
 * Tüm HTTP method'ları için wrapper fonksiyonlar
 * Rate limiting kontrolü yapar ve apiClient'ı kullanır
 * 
 * Her fonksiyon:
 * 1. Rate limit kontrolü yapar
 * 2. Limit aşıldıysa hata fırlatır
 * 3. Limit aşılmadıysa apiClient ile request yapar
 * 
 * Wrapper kullanımı:
 * - Component'ler bu wrapper'ları kullanır
 * - Rate limiting otomatik uygulanır
 * - Interceptor'lar otomatik çalışır
 */
export const apiRequest = {
  /**
   * GET request wrapper
   * 
   * GET method için API çağrısı yapar
   * 
   * @param {string} url - API endpoint URL'i
   * @param {Object} config - Axios config objesi (headers, params, vb.)
   * @returns {Promise} Axios response promise
   * @throws {Error} Rate limit aşıldıysa hata fırlatır
   */
  get: async (url, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.get(url, config);
  },
  
  /**
   * POST request wrapper
   * 
   * POST method için API çağrısı yapar
   * 
   * @param {string} url - API endpoint URL'i
   * @param {any} data - Request body data
   * @param {Object} config - Axios config objesi
   * @returns {Promise} Axios response promise
   * @throws {Error} Rate limit aşıldıysa hata fırlatır
   */
  post: async (url, data, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.post(url, data, config);
  },
  
  /**
   * PUT request wrapper
   * 
   * PUT method için API çağrısı yapar (tam güncelleme)
   * 
   * @param {string} url - API endpoint URL'i
   * @param {any} data - Request body data
   * @param {Object} config - Axios config objesi
   * @returns {Promise} Axios response promise
   * @throws {Error} Rate limit aşıldıysa hata fırlatır
   */
  put: async (url, data, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.put(url, data, config);
  },
  
  /**
   * PATCH request wrapper
   * 
   * PATCH method için API çağrısı yapar (kısmi güncelleme)
   * 
   * @param {string} url - API endpoint URL'i
   * @param {any} data - Request body data
   * @param {Object} config - Axios config objesi
   * @returns {Promise} Axios response promise
   * @throws {Error} Rate limit aşıldıysa hata fırlatır
   */
  patch: async (url, data, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.patch(url, data, config);
  },
  
  /**
   * DELETE request wrapper
   * 
   * DELETE method için API çağrısı yapar
   * 
   * @param {string} url - API endpoint URL'i
   * @param {Object} config - Axios config objesi
   * @returns {Promise} Axios response promise
   * @throws {Error} Rate limit aşıldıysa hata fırlatır
   */
  delete: async (url, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.delete(url, config);
  }
};

// ============================================================================
// FILE UPLOAD CLIENT - Dosya yükleme için özel client
// ============================================================================

/**
 * File Upload Client Instance
 * 
 * Multipart/form-data formatında dosya yükleme için özel axios instance
 * 
 * Konfigürasyon:
 * - baseURL: BASE_URL sabiti (apiClient ile aynı)
 * - timeout: 60000ms (1 dakika) - dosya yükleme daha uzun sürebilir
 * - headers:
 *   - Content-Type: multipart/form-data (dosya yükleme formatı)
 *   - X-Requested-With: XMLHttpRequest
 *   - X-Client-Version: 1.0.0
 * 
 * Not: Authorization header request interceptor'da dinamik olarak eklenir
 */
export const fileUploadClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 1 dakika (dosya yükleme için daha uzun)
  headers: {
    'Content-Type': 'multipart/form-data',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
});

/**
 * File Upload Client Request Interceptor
 * 
 * Dosya yükleme request'leri için token ekler
 * 
 * Basitleştirilmiş interceptor:
 * - Sadece token kontrolü ve ekleme
 * - Performance tracking yok (dosya yükleme için gereksiz)
 * - Request ID yok (dosya yükleme için gereksiz)
 * 
 * @param {Object} config - Axios request config
 * @returns {Object} Modified config
 */
fileUploadClient.interceptors.request.use(
  (config) => {
    /**
     * Token kontrolü ve ekleme
     * 
     * Token varsa ve expire olmamışsa Authorization header ekle
     * Dosya yükleme endpoint'leri genelde protected'tır
     */
    const token = useAuthStore.getState().getToken();
    if (token && !useAuthStore.getState().isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  /**
   * Error handler
   * Hata durumunda reject et
   */
  (error) => Promise.reject(error)
);

// ============================================================================
// UTILITY FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * FormData oluşturma utility fonksiyonu
 * 
 * JavaScript objesini FormData formatına dönüştürür
 * Dosya yükleme ve form submission için kullanılır
 * 
 * İşlem mantığı:
 * - File objesi: Direkt append edilir
 * - Object: JSON.stringify ile string'e dönüştürülür
 * - Diğer tipler: Direkt append edilir
 * - null/undefined: Skip edilir
 * 
 * @param {Object} data - FormData'ya dönüştürülecek obje
 * @returns {FormData} Oluşturulmuş FormData objesi
 * 
 * @example
 * const formData = createFormData({
 *   name: 'John',
 *   avatar: fileObject,
 *   metadata: { role: 'doctor' }
 * });
 */
export const createFormData = (data) => {
  /**
   * Yeni FormData instance'ı oluştur
   */
  const formData = new FormData();
  
  /**
   * Her key için işlem yap
   * 
   * Object.keys() ile tüm key'leri iterate et
   * Her value için tip kontrolü yap ve uygun şekilde append et
   */
  Object.keys(data).forEach(key => {
    /**
     * null/undefined kontrolü
     * Boş değerler append edilmez
     */
    if (data[key] !== null && data[key] !== undefined) {
      /**
       * File objesi kontrolü
       * 
       * Eğer value bir File objesiyse direkt append et
       * File yükleme için gerekli
       */
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        /**
         * Object tipi kontrolü
         * 
         * Nested object'leri JSON string'e dönüştür
         * Backend'de JSON.parse ile parse edilebilir
         */
        formData.append(key, JSON.stringify(data[key]));
      } else {
        /**
         * Diğer tipler (string, number, boolean)
         * 
         * Direkt append et
         * FormData otomatik olarak string'e dönüştürür
         */
        formData.append(key, data[key]);
      }
    }
  });
  
  /**
   * Oluşturulmuş FormData'yı döndür
   */
  return formData;
};

// ============================================================================
// DOCTOR API HELPERS - Doktor modülü için özel API fonksiyonları
// ============================================================================

/**
 * Doctor API Request Helpers
 * 
 * Doktor modülü için özel API fonksiyonları
 * Tüm doctor endpoint'leri için wrapper fonksiyonlar
 * 
 * Kategoriler:
 * - Dashboard: Dashboard verileri
 * - Profile: Profil yönetimi
 * - Educations: Eğitim bilgileri CRUD
 * - Experiences: Deneyim bilgileri CRUD
 * - Certificates: Sertifika bilgileri CRUD
 * - Languages: Dil bilgileri CRUD
 * - Applications: Başvuru yönetimi
 * - Jobs: İş ilanları görüntüleme
 * - Profile Notifications: Profil güncelleme bildirimleri
 */
export const doctorApiRequest = {
  /**
   * Dashboard API çağrısı
   * 
   * Doktor dashboard'ı için verileri getirir
   * Son başvurular, önerilen iş ilanları, istatistikler
   * 
   * @returns {Promise} Dashboard data promise
   */
  getDashboard: () => apiRequest.get('/doctor/dashboard'),
  
  /**
   * Profil API çağrıları
   */
  
  /**
   * Temel profil bilgilerini getirir
   * 
   * @returns {Promise} Profile data promise
   */
  getProfile: () => apiRequest.get('/doctor/profile'),
  
  /**
   * Profil bilgilerini günceller
   * 
   * @param {Object} data - Güncellenecek profil verisi
   * @returns {Promise} Update response promise
   */
  updateProfile: (data) => apiRequest.put('/doctor/profile', data),
  
  /**
   * Tam profil bilgilerini getirir (tüm ilişkili verilerle)
   * 
   * @returns {Promise} Full profile data promise
   */
  getProfileFull: () => apiRequest.get('/doctor/profile/full'),
  
  /**
   * Profil tamamlanma durumunu getirir
   * 
   * @returns {Promise} Profile completion data promise
   */
  getProfileComplete: () => apiRequest.get('/doctor/profile/complete'),
  
  /**
   * Profil tamamlanma yüzdesini getirir
   * 
   * @returns {Promise} Profile completion percentage promise
   */
  getProfileCompletion: () => apiRequest.get('/doctor/profile/completion'),
  
  /**
   * Kişisel bilgileri günceller (kısmi güncelleme)
   * 
   * @param {Object} data - Güncellenecek kişisel bilgi verisi
   * @returns {Promise} Update response promise
   */
  updateProfilePersonal: (data) => apiRequest.patch('/doctor/profile/personal', data),
  
  /**
   * Eğitim API çağrıları
   */
  
  /**
   * Tüm eğitim bilgilerini getirir
   * 
   * @returns {Promise} Educations array promise
   */
  getEducations: () => apiRequest.get('/doctor/educations'),
  
  /**
   * Yeni eğitim bilgisi ekler
   * 
   * @param {Object} data - Eğitim verisi
   * @returns {Promise} Create response promise
   */
  createEducation: (data) => apiRequest.post('/doctor/educations', data),
  
  /**
   * Eğitim bilgisini günceller
   * 
   * @param {number} educationId - Eğitim ID'si
   * @param {Object} data - Güncellenecek eğitim verisi
   * @returns {Promise} Update response promise
   */
  updateEducation: (educationId, data) => apiRequest.patch(`/doctor/educations/${educationId}`, data),
  
  /**
   * Eğitim bilgisini siler
   * 
   * @param {number} educationId - Eğitim ID'si
   * @returns {Promise} Delete response promise
   */
  deleteEducation: (educationId) => apiRequest.delete(`/doctor/educations/${educationId}`),
  
  /**
   * Deneyim API çağrıları
   */
  
  /**
   * Tüm deneyim bilgilerini getirir
   * 
   * @returns {Promise} Experiences array promise
   */
  getExperiences: () => apiRequest.get('/doctor/experiences'),
  
  /**
   * Yeni deneyim bilgisi ekler
   * 
   * @param {Object} data - Deneyim verisi
   * @returns {Promise} Create response promise
   */
  createExperience: (data) => apiRequest.post('/doctor/experiences', data),
  
  /**
   * Deneyim bilgisini günceller
   * 
   * @param {number} experienceId - Deneyim ID'si
   * @param {Object} data - Güncellenecek deneyim verisi
   * @returns {Promise} Update response promise
   */
  updateExperience: (experienceId, data) => apiRequest.patch(`/doctor/experiences/${experienceId}`, data),
  
  /**
   * Deneyim bilgisini siler
   * 
   * @param {number} experienceId - Deneyim ID'si
   * @returns {Promise} Delete response promise
   */
  deleteExperience: (experienceId) => apiRequest.delete(`/doctor/experiences/${experienceId}`),
  
  /**
   * Sertifika API çağrıları
   */
  
  /**
   * Tüm sertifika bilgilerini getirir
   * 
   * @returns {Promise} Certificates array promise
   */
  getCertificates: () => apiRequest.get('/doctor/certificates'),
  
  /**
   * Yeni sertifika bilgisi ekler
   * 
   * @param {Object} data - Sertifika verisi
   * @returns {Promise} Create response promise
   */
  createCertificate: (data) => apiRequest.post('/doctor/certificates', data),
  
  /**
   * Sertifika bilgisini günceller
   * 
   * @param {number} certificateId - Sertifika ID'si
   * @param {Object} data - Güncellenecek sertifika verisi
   * @returns {Promise} Update response promise
   */
  updateCertificate: (certificateId, data) => apiRequest.patch(`/doctor/certificates/${certificateId}`, data),
  
  /**
   * Sertifika bilgisini siler
   * 
   * @param {number} certificateId - Sertifika ID'si
   * @returns {Promise} Delete response promise
   */
  deleteCertificate: (certificateId) => apiRequest.delete(`/doctor/certificates/${certificateId}`),
  
  /**
   * Dil API çağrıları
   */
  
  /**
   * Tüm dil bilgilerini getirir
   * 
   * @returns {Promise} Languages array promise
   */
  getLanguages: () => apiRequest.get('/doctor/languages'),
  
  /**
   * Yeni dil bilgisi ekler
   * 
   * @param {Object} data - Dil verisi
   * @returns {Promise} Create response promise
   */
  createLanguage: (data) => apiRequest.post('/doctor/languages', data),
  
  /**
   * Dil bilgisini günceller
   * 
   * @param {number} languageId - Dil ID'si
   * @param {Object} data - Güncellenecek dil verisi
   * @returns {Promise} Update response promise
   */
  updateLanguage: (languageId, data) => apiRequest.patch(`/doctor/languages/${languageId}`, data),
  
  /**
   * Dil bilgisini siler
   * 
   * @param {number} languageId - Dil ID'si
   * @returns {Promise} Delete response promise
   */
  deleteLanguage: (languageId) => apiRequest.delete(`/doctor/languages/${languageId}`),
  
  /**
   * Başvuru API çağrıları
   */
  
  /**
   * Yeni başvuru oluşturur
   * 
   * @param {Object} data - Başvuru verisi (job_id, cover_letter vb.)
   * @returns {Promise} Create response promise
   */
  createApplication: (data) => apiRequest.post('/doctor/applications', data),
  
  /**
   * Doktorun başvurularını getirir (filtreleme ile)
   * 
   * Filtre parametreleri:
   * - status_id: Başvuru durumu
   * - city_id: Şehir filtresi
   * - application_date: Başvuru tarihi filtresi
   * - page: Sayfa numarası
   * - limit: Sayfa başına kayıt sayısı
   * 
   * @param {Object} filters - Filtre objesi
   * @param {number} filters.status_id - Başvuru durumu ID'si
   * @param {number} filters.city_id - Şehir ID'si
   * @param {string} filters.application_date - Başvuru tarihi (YYYY-MM-DD)
   * @param {number} filters.page - Sayfa numarası
   * @param {number} filters.limit - Sayfa başına kayıt
   * @returns {Promise} Applications data promise
   */
  getMyApplications: (filters = {}) => {
    /**
     * Query parametrelerini oluştur
     * 
     * URLSearchParams kullanarak query string oluşturulur
     * null, undefined, boş string değerleri skip edilir
     */
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/doctor/applications/me${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * Başvuru detayını getirir
   * 
   * @param {number} applicationId - Başvuru ID'si
   * @returns {Promise} Application detail promise
   */
  getApplicationDetail: (applicationId) => apiRequest.get(`/doctor/applications/${applicationId}`),
  
  /**
   * Başvuruyu geri çeker (withdraw)
   * 
   * @param {number} applicationId - Başvuru ID'si
   * @returns {Promise} Withdraw response promise
   */
  withdrawApplication: (applicationId) => apiRequest.patch(`/doctor/applications/${applicationId}/withdraw`),
  
  /**
   * Başvuruyu siler (soft delete)
   * 
   * @param {number} applicationId - Başvuru ID'si
   * @returns {Promise} Delete response promise
   */
  deleteApplication: (applicationId) => apiRequest.delete(`/doctor/applications/${applicationId}`),
  
  /**
   * Başvuruyu yeniden başlatır (reapply)
   * 
   * Geri çekilmiş başvurular için kullanılır
   * 
   * @param {number} applicationId - Başvuru ID'si
   * @returns {Promise} Reapply response promise
   */
  reapplyApplication: (applicationId) => apiRequest.post(`/doctor/applications/${applicationId}/reapply`),
  
  /**
   * İş İlanları API çağrıları
   */
  
  /**
   * İş ilanlarını getirir (filtreleme ile)
   * 
   * Filtre parametreleri:
   * - city_id: Şehir filtresi
   * - specialty_id: Ana dal filtresi
   * - subspecialty_id: Yan dal filtresi
   * - employment_type: İstihdam türü
   * - search: Arama terimi (ilan başlığı ve hastane adı)
   * - page: Sayfa numarası
   * - limit: Sayfa başına kayıt sayısı
   * 
   * @param {Object} filters - Filtre objesi
   * @returns {Promise} Jobs data promise
   */
  getJobs: (filters = {}) => {
    /**
     * Query parametrelerini oluştur
     * Boş değerler skip edilir
     */
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/doctor/jobs${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * İş ilanı detayını getirir
   * 
   * @param {number} jobId - İş ilanı ID'si
   * @returns {Promise} Job detail promise
   */
  getJobDetail: (jobId) => apiRequest.get(`/doctor/jobs/${jobId}`),
  
  /**
   * Profil bildirimleri
   */
  
  /**
   * Profil güncelleme bildirimi gönderir
   * 
   * Profil güncellendiğinde admin'e bildirim gönderir
   * 
   * @returns {Promise} Notification response promise
   */
  notifyProfileUpdate: () => apiRequest.post('/doctor/profile/notify-update')
};

// ============================================================================
// HOSPITAL API HELPERS - Hastane modülü için özel API fonksiyonları
// ============================================================================

/**
 * Hospital API Request Helpers
 * 
 * Hastane modülü için özel API fonksiyonları
 * Tüm hospital endpoint'leri için wrapper fonksiyonlar
 * 
 * Kategoriler:
 * - Dashboard: Dashboard verileri
 * - Profile: Profil yönetimi
 * - Jobs: İş ilanı CRUD işlemleri
 * - Applications: Başvuru yönetimi
 * - Departments: Departman CRUD işlemleri
 * - Contacts: İletişim bilgileri CRUD işlemleri
 * - Doctors: Doktor profillerini görüntüleme
 */
export const hospitalApiRequest = {
  /**
   * Dashboard API çağrısı
   * 
   * Hastane dashboard'ı için verileri getirir
   * İstatistikler, son başvurular, aktif iş ilanları
   * 
   * @returns {Promise} Dashboard data promise
   */
  getDashboard: () => apiRequest.get('/hospital/dashboard'),
  
  /**
   * Profil API çağrıları
   */
  
  /**
   * Hastane profil bilgilerini getirir
   * 
   * @returns {Promise} Hospital profile data promise
   */
  getProfile: () => apiRequest.get('/hospital'),
  
  /**
   * Hastane profil bilgilerini günceller
   * 
   * @param {Object} data - Güncellenecek profil verisi
   * @returns {Promise} Update response promise
   */
  updateProfile: (data) => apiRequest.put('/hospital', data),
  
  /**
   * Profil tamamlanma yüzdesini getirir
   * 
   * @returns {Promise} Profile completion percentage promise
   */
  getProfileCompletion: () => apiRequest.get('/hospital/profile/completion'),
  
  /**
   * İş İlanları API çağrıları
   */
  
  /**
   * Hastanenin iş ilanlarını getirir (filtreleme ile)
   * 
   * @param {Object} filters - Filtre objesi
   * @returns {Promise} Jobs data promise
   */
  getJobs: (filters = {}) => {
    /**
     * Query parametrelerini oluştur
     */
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/jobs${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * Yeni iş ilanı oluşturur
   * 
   * @param {Object} data - İş ilanı verisi
   * @returns {Promise} Create response promise
   */
  createJob: (data) => apiRequest.post('/hospital/jobs', data),
  
  /**
   * İş ilanını günceller
   * 
   * @param {number} jobId - İş ilanı ID'si
   * @param {Object} data - Güncellenecek ilan verisi
   * @returns {Promise} Update response promise
   */
  updateJob: (jobId, data) => apiRequest.put(`/hospital/jobs/${jobId}`, data),
  
  /**
   * İş ilanını siler
   * 
   * @param {number} jobId - İş ilanı ID'si
   * @returns {Promise} Delete response promise
   */
  deleteJob: (jobId) => apiRequest.delete(`/hospital/jobs/${jobId}`),
  
  /**
   * İş ilanını tekrar gönderir (resubmit)
   * 
   * @param {number} jobId - İş ilanı ID'si
   * @returns {Promise} Resubmit response promise
   */
  resubmitJob: (jobId) => apiRequest.post(`/hospital/jobs/${jobId}/resubmit`, {}),
  
  /**
   * Başvuru API çağrıları
   */
  
  /**
   * Hastanenin tüm başvurularını getirir (filtreleme ile)
   * 
   * @param {Object} filters - Filtre objesi
   * @returns {Promise} Applications data promise
   */
  getApplications: (filters = {}) => {
    /**
     * Query parametrelerini oluştur
     */
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/applications${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * Belirli bir iş ilanına yapılan başvuruları getirir
   * 
   * @param {number} jobId - İş ilanı ID'si
   * @param {Object} filters - Filtre objesi
   * @returns {Promise} Job applications data promise
   */
  getJobApplications: (jobId, filters = {}) => {
    /**
     * Query parametrelerini oluştur
     */
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/jobs/${jobId}/applications${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * Başvuru durumunu günceller
   * 
   * Başvuru durumları:
   * - 1: Başvuruldu
   * - 2: İnceleniyor
   * - 3: Kabul Edildi
   * - 4: Red Edildi
   * - 5: Geri Çekildi
   * 
   * @param {number} applicationId - Başvuru ID'si
   * @param {Object} data - Güncellenecek durum verisi ({ status_id: number })
   * @returns {Promise} Update response promise
   */
  updateApplicationStatus: (applicationId, data) => 
    apiRequest.put(`/hospital/applications/${applicationId}/status`, data),
  
  /**
   * Doktor Profilleri API çağrıları
   */
  
  /**
   * Sistemdeki doktor profillerini getirir (filtreleme ile)
   * 
   * @param {Object} filters - Filtre objesi
   * @returns {Promise} Doctor profiles data promise
   */
  getDoctorProfiles: (filters = {}) => {
    /**
     * Query parametrelerini oluştur
     */
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/doctors${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * Doktor profil detayını getirir
   * 
   * @param {number} doctorId - Doktor ID'si
   * @returns {Promise} Doctor profile detail promise
   */
  getDoctorProfileDetail: (doctorId) => apiRequest.get(`/hospital/doctors/${doctorId}`)
};

// ============================================================================
// DEFAULT EXPORT - Ana API client export
// ============================================================================

/**
 * Default Export - Ana API Client
 * 
 * Axios instance'ı direkt export edilir
 * Özel kullanım durumları için (ör: custom interceptor ekleme)
 */
export default apiClient;
