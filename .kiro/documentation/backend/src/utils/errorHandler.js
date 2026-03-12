/**
 * @file errorHandler.js
 * @description Dokümantasyon sistemi merkezi hata yönetimi
 * Ana MediKariyer sistemine uygun hata işleme
 */

'use strict';

const logger = require('./logger');

/**
 * Özel hata sınıfı
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global hata yakalayıcı middleware
 */
const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development ortamında detaylı hata bilgisi
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Production ortamında güvenli hata mesajları
    sendErrorProd(err, res);
  }
};

/**
 * Development ortamı hata yanıtı
 */
const sendErrorDev = (err, res) => {
  logger.error(`❌ Hata: ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode
  });

  res.status(err.statusCode).json({
    success: false,
    error: err.status,
    message: err.message,
    errorCode: err.errorCode,
    stack: err.stack
  });
};

/**
 * Production ortamı hata yanıtı
 */
const sendErrorProd = (err, res) => {
  // Operasyonel hatalar: güvenli mesaj gönder
  if (err.isOperational) {
    logger.error(`❌ Operasyonel Hata: ${err.message}`);
    
    res.status(err.statusCode).json({
      success: false,
      error: err.status,
      message: err.message,
      errorCode: err.errorCode
    });
  } else {
    // Programlama hataları: genel mesaj gönder
    logger.error('💥 Bilinmeyen Hata:', err);
    
    res.status(500).json({
      success: false,
      error: 'error',
      message: 'Bir şeyler yanlış gitti!'
    });
  }
};

/**
 * Async fonksiyonları sarmalayan yardımcı
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 404 hatası oluşturucu
 */
const createNotFoundError = (resource = 'Kaynak') => {
  return new AppError(`${resource} bulunamadı`, 404, 'NOT_FOUND');
};

/**
 * Validation hatası oluşturucu
 */
const createValidationError = (message) => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Yetkilendirme hatası oluşturucu
 */
const createAuthError = (message = 'Bu işlem için yetkiniz yok') => {
  return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  createNotFoundError,
  createValidationError,
  createAuthError
};