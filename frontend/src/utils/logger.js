/**
 * Logger Utility - Client-side logging
 * Ortam bazlı log seviyesi kontrolü ile optimize edilmiş logging sistemi
 * 
 * Ortam Ayarları:
 * - Development (NODE_ENV=development): Tüm loglar (DEBUG seviyesi)
 * - Production (NODE_ENV=production): Sadece ERROR ve WARN
 * - Manuel Override: VITE_LOG_LEVEL environment variable ile
 * 
 * Kullanım:
 * - logger.error('Hata mesajı', errorData)
 * - logger.warn('Uyarı mesajı', warningData)
 * - logger.info('Bilgi mesajı', infoData)
 * - logger.debug('Debug mesajı', debugData) // Sadece development'ta
 */

/**
 * Log seviyeleri
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Mevcut log seviyesi (environment'a göre otomatik ayarlanır)
 */
const getCurrentLogLevel = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Manuel log level override
  const manualLevel = import.meta.env.VITE_LOG_LEVEL;
  if (manualLevel) {
    return LOG_LEVELS[manualLevel.toUpperCase()] || LOG_LEVELS.INFO;
  }
  
  // Otomatik ortam bazlı ayarlama
  if (isDevelopment) {
    return LOG_LEVELS.DEBUG; // Development: Tüm loglar
  } else if (isProduction) {
    return LOG_LEVELS.WARN; // Production: Sadece error ve warn
  }
  
  // Fallback
  return LOG_LEVELS.INFO;
};

/**
 * Log mesajını formatlar
 * @param {string} level - Log seviyesi
 * @param {string} message - Log mesajı
 * @param {any} data - Ek veri
 * @returns {string} - Formatlanmış log
 */
const formatLogMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data) {
    return `${prefix} ${message} | Data: ${JSON.stringify(data, null, 2)}`;
  }
  
  return `${prefix} ${message}`;
};

/**
 * Console'a log yazdırır
 * @param {string} level - Log seviyesi
 * @param {string} message - Log mesajı
 * @param {any} data - Ek veri
 */
const writeToConsole = (level, message, data) => {
  const formattedMessage = formatLogMessage(level, message, data);
  
  switch (level) {
    case 'ERROR':
      console.error(formattedMessage);
      break;
    case 'WARN':
      console.warn(formattedMessage);
      break;
    case 'INFO':
      console.info(formattedMessage);
      break;
    case 'DEBUG':
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
};

/**
 * Log yazma fonksiyonu
 * @param {string} level - Log seviyesi
 * @param {string} message - Log mesajı
 * @param {any} data - Ek veri
 */
const log = (level, message, data = null) => {
  const currentLevel = getCurrentLogLevel();
  const messageLevel = LOG_LEVELS[level];
  
  // Seviye kontrolü
  if (messageLevel > currentLevel) {
    return;
  }
  
  // Console'a yaz
  writeToConsole(level, message, data);
  
  // Production'da hata raporlama servisi entegrasyonu
  if (level === 'ERROR' && import.meta.env.PROD) {
    // Sentry entegrasyonu (opsiyonel)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(new Error(message), {
        extra: data,
        tags: {
          logger: true,
          level: level
        }
      });
    }
    
    // Alternatif: Kendi error reporting servisiniz
    // reportErrorToServer(message, data);
  }
};

/**
 * Hata logu
 * @param {string} message - Hata mesajı
 * @param {any} data - Ek veri (error object, context vb.)
 */
export const error = (message, data = null) => {
  log('ERROR', message, data);
};

/**
 * Uyarı logu
 * @param {string} message - Uyarı mesajı
 * @param {any} data - Ek veri
 */
export const warn = (message, data = null) => {
  log('WARN', message, data);
};

/**
 * Bilgi logu
 * @param {string} message - Bilgi mesajı
 * @param {any} data - Ek veri
 */
export const info = (message, data = null) => {
  log('INFO', message, data);
};

/**
 * Debug logu
 * @param {string} message - Debug mesajı
 * @param {any} data - Ek veri
 */
export const debug = (message, data = null) => {
  log('DEBUG', message, data);
};

/**
 * API çağrısı logu
 * @param {string} method - HTTP method
 * @param {string} url - API URL
 * @param {any} requestData - İstek verisi
 * @param {any} responseData - Yanıt verisi
 * @param {number} duration - İstek süresi (ms)
 */
export const apiLog = (method, url, requestData = null, responseData = null, duration = 0) => {
  const message = `API ${method.toUpperCase()} ${url} (${duration}ms)`;
  const data = {
    request: requestData,
    response: responseData,
    duration
  };
  
  debug(message, data);
};

/**
 * Kullanıcı eylemi logu
 * @param {string} action - Eylem adı
 * @param {any} context - Eylem bağlamı
 */
export const userAction = (action, context = null) => {
  const message = `User Action: ${action}`;
  info(message, context);
};

/**
 * Performance logu
 * @param {string} operation - İşlem adı
 * @param {number} duration - İşlem süresi (ms)
 * @param {any} metadata - Ek bilgiler
 */
export const performance = (operation, duration, metadata = null) => {
  const message = `Performance: ${operation} took ${duration}ms`;
  
  if (duration > 1000) {
    warn(message, metadata);
  } else {
    debug(message, metadata);
  }
};

/**
 * Hata yakalama ve raporlama
 * @param {Error} error - Yakalanan hata
 * @param {string} context - Hata bağlamı
 * @param {any} additionalData - Ek veri
 */
export const captureError = (error, context = 'Unknown', additionalData = null) => {
  const message = `Error in ${context}: ${error.message}`;
  const data = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
  
  log('ERROR', message, data);
};

/**
 * Logger konfigürasyonu
 */
const loggerConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  currentLevel: getCurrentLogLevel(),
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
};

/**
 * Logger instance'ı
 */
const logger = {
  error,
  warn,
  info,
  debug,
  apiLog,
  userAction,
  performance,
  captureError,
  
  // Logger bilgileri
  getConfig: () => loggerConfig,
  
  // Ortam kontrolü
  isDevelopment: () => loggerConfig.isDevelopment,
  isProduction: () => loggerConfig.isProduction,
  
  // Log seviyesi kontrolü
  isLevelEnabled: (level) => {
    const messageLevel = LOG_LEVELS[level];
    return messageLevel <= loggerConfig.currentLevel;
  }
};

export default logger;
