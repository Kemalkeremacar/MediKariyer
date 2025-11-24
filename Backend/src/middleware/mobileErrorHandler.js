/**
 * @file mobileErrorHandler.js
 * @description Mobile API error handler middleware - Mobil uygulama için özel hata yönetimi middleware'leri.
 * Bu middleware'ler, mobile route'larında tüm hataların JSON formatında dönmesini garanti eder.
 * 
 * Ana Middleware'ler:
 * - mobileErrorHandler: JSON Content-Type header'ı ayarlar
 * - mobileErrorBoundary: Tüm hataları JSON formatında döndürür
 * 
 * Özellikler:
 * - HTML hata sayfaları yerine JSON error responses
 * - Web API'lerden farklı olarak sadece JSON döner
 * - Global error handler entegrasyonu
 * 
 * Kullanım:
 * - mobileErrorHandler: Route'lardan ÖNCE (başta)
 * - mobileErrorBoundary: Route'lardan SONRA (sonda)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const { globalErrorHandler } = require('../utils/errorHandler');

// ============================================================================
// MIDDLEWARE FONKSİYONLARI
// ============================================================================

/**
 * Mobile API'lerde tüm yanıtların JSON formatında dönebilmesi için
 * response header'larını önceden ayarlayan middleware.
 */
const mobileErrorHandler = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.locals.isMobileApi = true;
  next();
};

/**
 * Mobile route zincirinin sonuna eklenmesi gereken hata yakalayıcı.
 * HTML döndürmek yerine globalErrorHandler aracılığıyla JSON döndürür.
 */
const mobileErrorBoundary = (err, req, res, next) => {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }

  if (typeof globalErrorHandler === 'function') {
    return globalErrorHandler(err, req, res, next);
  }

  return res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || 'Sunucu hatası',
    timestamp: new Date().toISOString()
  });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  mobileErrorHandler,
  mobileErrorBoundary
};

