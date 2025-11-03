/**
 * @file logger.js
 * @description Logger Utility - Client-side logging sistemi
 * 
 * Bu dosya, uygulama genelinde kullanılan logging sistemini sağlar.
 * Ortam bazlı log seviyesi kontrolü ile optimize edilmiş bir logging
 * sistemi sunar.
 * 
 * Ana Özellikler:
 * - Ortam bazlı log seviyesi: Development/Production otomatik ayarlama
 * - Manuel log seviyesi override: VITE_LOG_LEVEL environment variable
 * - Log formatlama: Timestamp ve seviye bilgisi ile formatlanmış loglar
 * - Console output: Seviyeye göre uygun console method kullanımı
 * - Error reporting: Production'da Sentry entegrasyonu desteği
 * - Özel log tipleri: API log, user action, performance log
 * 
 * Log Seviyeleri:
 * - ERROR (0): Hata logları, her zaman gösterilir
 * - WARN (1): Uyarı logları
 * - INFO (2): Bilgi logları
 * - DEBUG (3): Debug logları, sadece development'ta
 * 
 * Ortam Ayarları:
 * - Development (NODE_ENV=development): Tüm loglar (DEBUG seviyesi)
 * - Production (NODE_ENV=production): Sadece ERROR ve WARN
 * - Manuel Override: VITE_LOG_LEVEL environment variable ile kontrol
 * 
 * Log Fonksiyonları:
 * - error: Hata logları
 * - warn: Uyarı logları
 * - info: Bilgi logları
 * - debug: Debug logları
 * - apiLog: API çağrısı logları (method, URL, duration)
 * - userAction: Kullanıcı eylemi logları
 * - performance: Performans logları (süre kontrolü ile)
 * - captureError: Hata yakalama ve raporlama
 * 
 * Kullanım:
 * ```javascript
 * import logger from '@/utils/logger';
 * 
 * // Hata logu
 * logger.error('Bir hata oluştu', errorData);
 * 
 * // API logu
 * logger.apiLog('POST', '/api/doctor/applications', requestData, responseData, 250);
 * 
 * // Kullanıcı eylemi
 * logger.userAction('profile_updated', { field: 'email' });
 * 
 * // Performans logu
 * logger.performance('data_fetch', 1500, { endpoint: '/api/users' });
 * 
 * // Hata yakalama
 * logger.captureError(error, 'API Call', { url: '/api/data' });
 * ```
 * 
 * Production Error Reporting:
 * - Production'da ERROR seviyesindeki loglar Sentry'ye gönderilir
 * - Sentry entegrasyonu opsiyoneldir (window.Sentry kontrolü)
 * - Alternatif error reporting servisi entegrasyonu mümkündür
 * 
 * Log Formatı:
 * [timestamp] [LEVEL] message | Data: {...}
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
 * Log seviyeleri
 * 
 * Numeric değerlerle sıralı log seviyeleri
 * Düşük değer = Yüksek öncelik
 * 
 * @type {Object} Log seviyeleri objesi
 */
const LOG_LEVELS = {
  /**
   * ERROR (0): Hata logları
   * En yüksek öncelik, her zaman gösterilir
   */
  ERROR: 0,
  
  /**
   * WARN (1): Uyarı logları
   * İkinci öncelik
   */
  WARN: 1,
  
  /**
   * INFO (2): Bilgi logları
   * Üçüncü öncelik
   */
  INFO: 2,
  
  /**
   * DEBUG (3): Debug logları
   * En düşük öncelik, sadece development'ta gösterilir
   */
  DEBUG: 3
};

// ============================================================================
// UTILITY FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * Mevcut log seviyesini döndürür
 * 
 * Environment'a göre otomatik ayarlanır veya
 * manuel override ile kontrol edilebilir
 * 
 * Öncelik Sırası:
 * 1. VITE_LOG_LEVEL environment variable (manuel override)
 * 2. Development ortamı: DEBUG (tüm loglar)
 * 3. Production ortamı: WARN (sadece error ve warn)
 * 4. Fallback: INFO
 * 
 * @returns {number} Mevcut log seviyesi (LOG_LEVELS değeri)
 */
const getCurrentLogLevel = () => {
  /**
   * Ortam kontrolü
   */
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  /**
   * Manuel log level override
   * 
   * VITE_LOG_LEVEL environment variable ile manuel kontrol
   * Örn: VITE_LOG_LEVEL=DEBUG → tüm loglar gösterilir
   */
  const manualLevel = import.meta.env.VITE_LOG_LEVEL;
  if (manualLevel) {
    /**
     * Manuel seviye parse et
     * 
     * Büyük/küçük harf duyarsız kontrol
     * Geçersiz seviye durumunda INFO döndürülür
     */
    return LOG_LEVELS[manualLevel.toUpperCase()] || LOG_LEVELS.INFO;
  }
  
  /**
   * Otomatik ortam bazlı ayarlama
   */
  
  /**
   * Development ortamı
   * 
   * Tüm loglar gösterilir (DEBUG seviyesi)
   */
  if (isDevelopment) {
    return LOG_LEVELS.DEBUG; // Development: Tüm loglar
  }
  
  /**
   * Production ortamı
   * 
   * Sadece error ve warn logları gösterilir
   * Performans ve güvenlik için
   */
  if (isProduction) {
    return LOG_LEVELS.WARN; // Production: Sadece error ve warn
  }
  
  /**
   * Fallback
   * 
   * Ortam belirlenemezse INFO seviyesi kullanılır
   */
  return LOG_LEVELS.INFO;
};

/**
 * Log mesajını formatlar
 * 
 * Timestamp ve log seviyesi ile mesajı formatlar
 * Data varsa JSON formatında ekler
 * 
 * Format: [timestamp] [LEVEL] message | Data: {...}
 * 
 * @param {string} level - Log seviyesi (ERROR, WARN, INFO, DEBUG)
 * @param {string} message - Log mesajı
 * @param {any} data - Ek veri (opsiyonel)
 * @returns {string} Formatlanmış log string'i
 */
const formatLogMessage = (level, message, data) => {
  /**
   * Timestamp oluştur
   * 
   * ISO string formatında: 2024-01-15T10:30:00.000Z
   */
  const timestamp = new Date().toISOString();
  
  /**
   * Log prefix'i oluştur
   * 
   * Format: [timestamp] [LEVEL]
   */
  const prefix = `[${timestamp}] [${level}]`;
  
  /**
   * Data varsa ekle
   * 
   * JSON.stringify ile formatlanmış data eklenir
   * null, 2 parametreleri ile güzel formatlanmış JSON
   */
  if (data) {
    return `${prefix} ${message} | Data: ${JSON.stringify(data, null, 2)}`;
  }
  
  /**
   * Data yoksa sadece mesaj
   */
  return `${prefix} ${message}`;
};

/**
 * Console'a log yazdırır
 * 
 * Log seviyesine göre uygun console method'unu kullanır
 * 
 * @param {string} level - Log seviyesi (ERROR, WARN, INFO, DEBUG)
 * @param {string} message - Log mesajı
 * @param {any} data - Ek veri
 */
const writeToConsole = (level, message, data) => {
  /**
   * Mesajı formatla
   */
  const formattedMessage = formatLogMessage(level, message, data);
  
  /**
   * Log seviyesine göre uygun console method'u kullan
   * 
   * Her seviye için farklı console method kullanılır
   * Bu, browser console'da farklı renkler ve filtreleme sağlar
   */
  switch (level) {
    case 'ERROR':
      /**
       * Error log
       * 
       * Kırmızı renkte gösterilir
       * Console'da error olarak işaretlenir
       */
      console.error(formattedMessage);
      break;
    case 'WARN':
      /**
       * Warning log
       * 
       * Sarı/turuncu renkte gösterilir
       * Console'da warning olarak işaretlenir
       */
      console.warn(formattedMessage);
      break;
    case 'INFO':
      /**
       * Info log
       * 
       * Mavi renkte gösterilir
       * Console'da info olarak işaretlenir
       */
      console.info(formattedMessage);
      break;
    case 'DEBUG':
      /**
       * Debug log
       * 
       * Gri renkte gösterilir
       * Console'da debug olarak işaretlenir
       */
      console.debug(formattedMessage);
      break;
    default:
      /**
       * Fallback
       * 
       * Tanımlı olmayan seviyeler için console.log kullanılır
       */
      console.log(formattedMessage);
  }
};

/**
 * Log yazma fonksiyonu
 * 
 * Ana log yazma fonksiyonu
 * Seviye kontrolü yapar, console'a yazar ve
 * production'da error reporting yapar
 * 
 * @param {string} level - Log seviyesi (ERROR, WARN, INFO, DEBUG)
 * @param {string} message - Log mesajı
 * @param {any} data - Ek veri
 */
const log = (level, message, data = null) => {
  /**
   * Mevcut log seviyesini al
   */
  const currentLevel = getCurrentLogLevel();
  
  /**
   * Mesaj seviyesini al
   */
  const messageLevel = LOG_LEVELS[level];
  
  /**
   * Seviye kontrolü
   * 
   * Mesaj seviyesi mevcut seviyeden yüksekse log yazılmaz
   * 
   * Örnek:
   * - currentLevel = WARN (1)
   * - messageLevel = DEBUG (3)
   * - 3 > 1 → Log yazılmaz (DEBUG logları production'da gösterilmez)
   */
  if (messageLevel > currentLevel) {
    return;
  }
  
  /**
   * Console'a yaz
   * 
   * Seviye kontrolü başarılı, log yazılır
   */
  writeToConsole(level, message, data);
  
  /**
   * Production'da hata raporlama servisi entegrasyonu
   * 
   * ERROR seviyesindeki loglar production'da
   * error reporting servisine gönderilir
   */
  if (level === 'ERROR' && import.meta.env.PROD) {
    /**
     * Sentry entegrasyonu (opsiyonel)
     * 
     * window.Sentry varsa hata yakalanır ve Sentry'ye gönderilir
     * Sentry: Error tracking ve monitoring servisi
     */
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(new Error(message), {
        extra: data,
        tags: {
          logger: true,
          level: level
        }
      });
    }
    
    /**
     * Alternatif: Kendi error reporting servisiniz
     * 
     * Buraya kendi error reporting servisinizi entegre edebilirsiniz
     * Örn: Custom API endpoint'e error gönderme
     */
    // reportErrorToServer(message, data);
  }
};

// ============================================================================
// LOG FUNCTIONS - Log fonksiyonları
// ============================================================================

/**
 * Hata logu
 * 
 * ERROR seviyesinde log yazar
 * Production'da error reporting servisine gönderilir
 * 
 * @param {string} message - Hata mesajı
 * @param {any} data - Ek veri (error object, context vb.)
 * 
 * @example
 * logger.error('API isteği başarısız', { url: '/api/data', status: 500 });
 */
export const error = (message, data = null) => {
  log('ERROR', message, data);
};

/**
 * Uyarı logu
 * 
 * WARN seviyesinde log yazar
 * 
 * @param {string} message - Uyarı mesajı
 * @param {any} data - Ek veri
 * 
 * @example
 * logger.warn('Token yakında expire olacak', { remainingMinutes: 5 });
 */
export const warn = (message, data = null) => {
  log('WARN', message, data);
};

/**
 * Bilgi logu
 * 
 * INFO seviyesinde log yazar
 * 
 * @param {string} message - Bilgi mesajı
 * @param {any} data - Ek veri
 * 
 * @example
 * logger.info('Kullanıcı giriş yaptı', { userId: 123, role: 'doctor' });
 */
export const info = (message, data = null) => {
  log('INFO', message, data);
};

/**
 * Debug logu
 * 
 * DEBUG seviyesinde log yazar
 * Sadece development ortamında gösterilir
 * 
 * @param {string} message - Debug mesajı
 * @param {any} data - Ek veri
 * 
 * @example
 * logger.debug('State güncellendi', { previousState, newState });
 */
export const debug = (message, data = null) => {
  log('DEBUG', message, data);
};

/**
 * API çağrısı logu
 * 
 * API isteklerini özel format ile loglar
 * Method, URL, request/response data ve duration bilgilerini içerir
 * DEBUG seviyesinde loglanır
 * 
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {string} url - API URL
 * @param {any} requestData - İstek verisi (opsiyonel)
 * @param {any} responseData - Yanıt verisi (opsiyonel)
 * @param {number} duration - İstek süresi (ms)
 * 
 * @example
 * logger.apiLog('POST', '/api/doctor/applications', requestData, responseData, 250);
 */
export const apiLog = (method, url, requestData = null, responseData = null, duration = 0) => {
  /**
   * Log mesajı oluştur
   * 
   * Format: API METHOD URL (durationms)
   */
  const message = `API ${method.toUpperCase()} ${url} (${duration}ms)`;
  
  /**
   * Log data objesi
   * 
   * Request, response ve duration bilgilerini içerir
   */
  const data = {
    request: requestData,
    response: responseData,
    duration
  };
  
  /**
   * DEBUG seviyesinde logla
   * 
   * API logları debug seviyesinde loglanır
   * Production'da gösterilmez
   */
  debug(message, data);
};

/**
 * Kullanıcı eylemi logu
 * 
 * Kullanıcı eylemlerini loglar
 * INFO seviyesinde loglanır
 * 
 * @param {string} action - Eylem adı (örn: 'profile_updated', 'application_created')
 * @param {any} context - Eylem bağlamı (opsiyonel)
 * 
 * @example
 * logger.userAction('profile_updated', { field: 'email', userId: 123 });
 */
export const userAction = (action, context = null) => {
  const message = `User Action: ${action}`;
  info(message, context);
};

/**
 * Performance logu
 * 
 * İşlem sürelerini loglar
 * Süre > 1000ms ise WARN, değilse DEBUG seviyesinde loglanır
 * 
 * @param {string} operation - İşlem adı (örn: 'data_fetch', 'component_render')
 * @param {number} duration - İşlem süresi (ms)
 * @param {any} metadata - Ek bilgiler (opsiyonel)
 * 
 * @example
 * logger.performance('data_fetch', 1500, { endpoint: '/api/users' });
 */
export const performance = (operation, duration, metadata = null) => {
  const message = `Performance: ${operation} took ${duration}ms`;
  
  /**
   * Süre kontrolü
   * 
   * İşlem 1 saniyeden uzun sürerse warning olarak loglanır
   * Kısa süren işlemler debug olarak loglanır
   */
  if (duration > 1000) {
    /**
     * Yavaş işlem: WARN seviyesinde
     * 
     * Performans sorunları için uyarı verilir
     */
    warn(message, metadata);
  } else {
    /**
     * Hızlı işlem: DEBUG seviyesinde
     * 
     * Normal performanslı işlemler debug olarak loglanır
     */
    debug(message, metadata);
  }
};

/**
 * Hata yakalama ve raporlama
 * 
 * Hataları detaylı olarak yakalar ve loglar
 * Error object, context, additional data ve
 * environment bilgilerini içerir
 * 
 * ERROR seviyesinde loglanır ve production'da
 * error reporting servisine gönderilir
 * 
 * @param {Error} error - Yakalanan hata objesi
 * @param {string} context - Hata bağlamı (örn: 'API Call', 'Component Render')
 * @param {any} additionalData - Ek veri (opsiyonel)
 * 
 * @example
 * try {
 *   await apiRequest.post('/api/data', data);
 * } catch (error) {
 *   logger.captureError(error, 'API Call', { url: '/api/data', data });
 * }
 */
export const captureError = (error, context = 'Unknown', additionalData = null) => {
  /**
   * Hata mesajı oluştur
   */
  const message = `Error in ${context}: ${error.message}`;
  
  /**
   * Detaylı hata verisi
   * 
   * Error object, context, ek veriler ve
   * environment bilgilerini içerir
   */
  const data = {
    /**
     * Error object detayları
     */
    error: {
      name: error.name,      // Error tipi (Error, TypeError, vb.)
      message: error.message, // Hata mesajı
      stack: error.stack      // Stack trace
    },
    context,
    additionalData,
    /**
     * Environment bilgileri
     * 
     * Hata raporlama için kullanılır
     */
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
  
  /**
   * ERROR seviyesinde logla
   * 
   * Production'da error reporting servisine gönderilir
   */
  log('ERROR', message, data);
};

// ============================================================================
// LOGGER CONFIG - Logger konfigürasyonu
// ============================================================================

/**
 * Logger konfigürasyon objesi
 * 
 * Logger'ın mevcut durumu ve ayarları
 * 
 * @type {Object} Logger konfigürasyonu
 */
const loggerConfig = {
  /**
   * Development ortamı kontrolü
   * 
   * @type {boolean} Development ortamında true
   */
  isDevelopment: import.meta.env.DEV,
  
  /**
   * Production ortamı kontrolü
   * 
   * @type {boolean} Production ortamında true
   */
  isProduction: import.meta.env.PROD,
  
  /**
   * Mevcut log seviyesi
   * 
   * @type {number} LOG_LEVELS değeri
   */
  currentLevel: getCurrentLogLevel(),
  
  /**
   * Uygulama versiyonu
   * 
   * @type {string} App version
   */
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
};

// ============================================================================
// LOGGER INSTANCE - Logger instance objesi
// ============================================================================

/**
 * Logger instance
 * 
 * Tüm log fonksiyonlarını ve utility metodlarını içerir
 * 
 * @type {Object} Logger instance objesi
 */
const logger = {
  /**
   * Log fonksiyonları
   */
  error,
  warn,
  info,
  debug,
  apiLog,
  userAction,
  performance,
  captureError,
  
  /**
   * Logger bilgileri
   */
  
  /**
   * Logger konfigürasyonunu döndürür
   * 
   * @returns {Object} Logger konfigürasyon objesi
   */
  getConfig: () => loggerConfig,
  
  /**
   * Ortam kontrolü
   */
  
  /**
   * Development ortamında mı kontrol eder
   * 
   * @returns {boolean} Development ortamında ise true
   */
  isDevelopment: () => loggerConfig.isDevelopment,
  
  /**
   * Production ortamında mı kontrol eder
   * 
   * @returns {boolean} Production ortamında ise true
   */
  isProduction: () => loggerConfig.isProduction,
  
  /**
   * Log seviyesi kontrolü
   * 
   * Belirtilen log seviyesinin aktif olup olmadığını kontrol eder
   * 
   * @param {string} level - Kontrol edilecek log seviyesi (ERROR, WARN, INFO, DEBUG)
   * @returns {boolean} Log seviyesi aktif ise true
   * 
   * @example
   * if (logger.isLevelEnabled('DEBUG')) {
   *   // Debug logları gösterilecek
   * }
   */
  isLevelEnabled: (level) => {
    /**
     * Mesaj seviyesini al
     */
    const messageLevel = LOG_LEVELS[level];
    
    /**
     * Seviye kontrolü
     * 
     * Mesaj seviyesi <= mevcut seviye ise aktif
     */
    return messageLevel <= loggerConfig.currentLevel;
  }
};

// ============================================================================
// EXPORTS - Logger export
// ============================================================================

/**
 * Default export
 * 
 * Direct import için: import logger from '@/utils/logger'
 */
export default logger;
