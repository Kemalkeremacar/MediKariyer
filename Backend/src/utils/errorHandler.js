/**
 * @file errorHandler.js
 * @description Merkezi hata yönetimi mekanizması.
 * Bu dosya, uygulama genelinde hataları yakalamak, sınıflandırmak ve istemciye tutarlı, güvenli yanıtlar göndermek için gereken tüm araçları içerir.
 * - AppError: Öngörülen, operasyonel hatalar için özel bir hata sınıfı.
 * - Türe özgü hata işleyicileri: Veritabanı, JWT, validasyon gibi sık karşılaşılan hata türlerini standartlaştırır.
 * - globalErrorHandler: Tüm hataların geçtiği ana middleware. Ortama (development/production) göre farklı yanıtlar üretir.
 * - catchAsync: Asenkron fonksiyonlardaki (örn: controller'lar) try-catch bloklarını ortadan kaldıran bir yardımcı fonksiyon.
 */

'use strict';

const logger = require('./logger');

/**
 * @class AppError
 * @extends Error
 * @description Uygulama içinde öngörülen (operasyonel) hataları temsil etmek için kullanılan özel hata sınıfı.
 * Bu sınıf, standart Error nesnesini statusCode, status ve isOperational gibi alanlarla genişletir.
 * @param {string} message - İstemciye gösterilecek hata mesajı.
 * @param {number} statusCode - HTTP durum kodu (örn: 400, 404, 500).
 * @param {boolean} [isOperational=true] - Hatayı operasyonel (öngörülen) olarak işaretler. Production ortamında sadece operasyonel hataların mesajları istemciye gösterilir.
 */
class AppError extends Error {
  constructor(message, statusCode, details = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Veritabanı hatalarını işler ve standart bir AppError nesnesine dönüştürür.
 * @param {Error} error - Knex veya veritabanı sürücüsünden gelen orijinal hata nesnesi.
 * @returns {AppError} - İstemciye gönderilmek üzere formatlanmış, anlaşılır bir AppError nesnesi.
 */
const handleDatabaseError = (error) => {
  let message = 'Veritabanı hatası oluştu';
  let statusCode = 500;

  // Belirli veritabanı hatalarını işle
  if (error.code === 'EREQUEST') {
    if (error.message.includes('duplicate key')) {
      message = 'Bu kayıt zaten mevcut';
      statusCode = 409;
    } else if (error.message.includes('foreign key')) {
      message = 'İlişkili kayıt bulunamadı';
      statusCode = 400;
    } else if (error.message.includes('check constraint')) {
      message = 'Geçersiz veri formatı';
      statusCode = 400;
    }
  } else if (error.code === 'ELOGIN') {
    message = 'Veritabanı bağlantı hatası';
    statusCode = 503;
  } else if (error.code === 'ETIMEOUT') {
    message = 'Veritabanı zaman aşımı';
    statusCode = 504;
  }

  return new AppError(message, statusCode);
};

/**
 * JSON Web Token (JWT) ile ilgili kimlik doğrulama hatalarını işler.
 * 'TokenExpiredError', 'JsonWebTokenError' gibi farklı JWT hatalarını yakalayıp standart bir 401 Unauthorized hatasına dönüştürür.
 * @param {Error} error - 'jsonwebtoken' kütüphanesinden gelen orijinal hata nesnesi.
 * @returns {AppError} - Standart bir kimlik doğrulama hatası mesajı içeren AppError nesnesi.
 */
const handleJWTError = (error) => {
  let message = 'Kimlik doğrulama hatası';
  let statusCode = 401;

  if (error.name === 'TokenExpiredError') {
    message = 'Token süresi dolmuş';
  } else if (error.name === 'JsonWebTokenError') {
    message = 'Geçersiz token';
  } else if (error.name === 'NotBeforeError') {
    message = 'Token henüz aktif değil';
  }

  return new AppError(message, statusCode);
};

/**
 * Joi validasyon hatalarını işler.
 * Joi tarafından üretilen detaylı hata nesnesini, istemciye gösterilebilecek tek bir hata mesajı haline getirir.
 * @param {Error} error - Joi'nin `validate` metodundan gelen validasyon hatası nesnesi.
 * @returns {AppError} - Tüm validasyon hatalarını içeren bir mesajla formatlanmış AppError nesnesi (400 Bad Request).
 */
const handleValidationError = (error) => {
  const message = error.details ? 
    error.details.map(detail => detail.message).join(', ') : 
    'Doğrulama hatası';
  
  return new AppError(message, 400);
};

/**
 * Geliştirme (development) ortamında hata yanıtı gönderir.
 * Hata ayıklamayı kolaylaştırmak için hatanın tüm detaylarını (mesaj, stack trace, vb.) içerir.
 * @param {AppError} err - İşlenmiş veya orijinal hata nesnesi.
 * @param {object} res - Express response nesnesi.
 */
const sendErrorDev = (err, res) => {
  // Detaylı hata loglama
  logger.error('Development Error Details:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    details: err.details,
    timestamp: new Date().toISOString(),
    url: res.req?.originalUrl,
    method: res.req?.method,
    ip: res.req?.ip,
    userAgent: res.req?.get('User-Agent'),
    userId: res.req?.user?.id,
    userRole: res.req?.user?.role
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err.message,
    details: err.details,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    requestId: res.req?.id || 'unknown'
  });
};

/**
 * Üretim (production) ortamında hata yanıtı gönderir.
 * Güvenlik nedeniyle hata detaylarını sızdırmaz.
 * - Eğer hata operasyonel ise (AppError ve isOperational=true), istemciye anlamlı bir mesaj gönderir.
 * - Eğer hata programlama hatası veya bilinmeyen bir hata ise, genel bir mesaj gönderir ve hatayı loglar.
 * @param {AppError} err - İşlenmiş hata nesnesi.
 * @param {object} res - Express response nesnesi.
 */
const sendErrorProd = (err, res) => {
  // Operasyonel, güvenilir hata: istemciye mesaj gönder
  if (err.isOperational) {
    // Operasyonel hataları da logla ama daha az detayla
    logger.warn('Operational Error:', {
      message: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      url: res.req?.originalUrl,
      method: res.req?.method,
      ip: res.req?.ip,
      userId: res.req?.user?.id,
      userRole: res.req?.user?.role
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: 'OPERATIONAL_ERROR',
      details: err.details,
      timestamp: new Date().toISOString(),
      requestId: res.req?.id || 'unknown'
    });
  } else {
    // Programlama veya diğer bilinmeyen hata: hata ayrıntılarını sızdırma
    logger.error('Critical System Error:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
      timestamp: new Date().toISOString(),
      url: res.req?.originalUrl,
      method: res.req?.method,
      ip: res.req?.ip,
      userAgent: res.req?.get('User-Agent'),
      userId: res.req?.user?.id,
      userRole: res.req?.user?.role,
      requestBody: res.req?.body ? JSON.stringify(res.req.body).substring(0, 500) : null,
      requestQuery: res.req?.query ? JSON.stringify(res.req.query) : null
    });
    
    res.status(500).json({
      success: false,
      message: 'Bir şeyler yanlış gitti!',
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      requestId: res.req?.id || 'unknown'
    });
  }
};

/**
 * Global Hata Yönetimi Middleware'i.
 * Express pipeline'ında `next(error)` ile fırlatılan tüm hataları yakalayan merkezi noktadır.
 * 1. Hatanın durum kodunu ve statüsünü belirler (varsayılan 500).
 * 2. Çalışma ortamını (NODE_ENV) kontrol eder.
 * 3. Geliştirme ortamıysa, `sendErrorDev` ile detaylı hata gönderir.
 * 4. Üretim ortamıysa, hatayı sınıflandırmak için `handle...Error` fonksiyonlarını kullanır ve `sendErrorProd` ile güvenli yanıt gönderir.
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Belirli hata türlerini işle
    if (error.code === 'EREQUEST' || error.code === 'ELOGIN' || error.code === 'ETIMEOUT') {
      error = handleDatabaseError(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
      error = handleJWTError(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }

    sendErrorProd(error, res);
  }
};

/**
 * Asenkron fonksiyonlar için bir sarmalayıcı (wrapper).
 * Bu fonksiyon, async/await kullanılan route handler'larını (controller'ları) sararak, 
 * her birinin içine `try-catch` bloğu yazma zorunluluğunu ortadan kaldırır.
 * Bir promise reddedildiğinde (hata fırlatıldığında), `.catch(next)` bunu yakalar ve hatayı otomatik olarak globalErrorHandler'a iletir.
 * @param {Function} fn - Sarılacak olan asenkron controller fonksiyonu.
 * @returns {Function} - Express'in anlayacağı standart bir (req, res, next) middleware fonksiyonu.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  handleDatabaseError,
  handleJWTError,
  handleValidationError
};
