/**
 * @file rateLimitMiddleware.js
 * @description Dokümantasyon sistemi rate limiting middleware'i
 * Ana MediKariyer sistemine uygun rate limiting
 */

'use strict';

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Genel API rate limiting
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // IP başına maksimum 1000 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit aşıldı: ${req.ip} - ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Dokümantasyon oluşturma/güncelleme için sıkı rate limiting
 */
const documentationWriteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 50, // IP başına maksimum 50 yazma işlemi
  message: {
    success: false,
    message: 'Dokümantasyon yazma limitini aştınız. Lütfen 5 dakika sonra tekrar deneyin.',
    error: 'DOCUMENTATION_WRITE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Admin kullanıcıları için rate limit'i atla
    return req.user && req.user.role === 'admin';
  },
  handler: (req, res) => {
    logger.warn(`Dokümantasyon yazma rate limit aşıldı: ${req.ip} - ${req.user?.email || 'Anonim'}`);
    res.status(429).json({
      success: false,
      message: 'Dokümantasyon yazma limitini aştınız. Lütfen 5 dakika sonra tekrar deneyin.',
      error: 'DOCUMENTATION_WRITE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Etki analizi için rate limiting (CPU yoğun işlem)
 */
const impactAnalysisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  max: 20, // IP başına maksimum 20 analiz
  message: {
    success: false,
    message: 'Etki analizi limitini aştınız. Lütfen 10 dakika sonra tekrar deneyin.',
    error: 'IMPACT_ANALYSIS_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Etki analizi rate limit aşıldı: ${req.ip} - ${req.user?.email || 'Anonim'}`);
    res.status(429).json({
      success: false,
      message: 'Etki analizi limitini aştınız. Lütfen 10 dakika sonra tekrar deneyin.',
      error: 'IMPACT_ANALYSIS_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Arama işlemleri için rate limiting
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 100, // IP başına maksimum 100 arama
  message: {
    success: false,
    message: 'Arama limitini aştınız. Lütfen 1 dakika sonra tekrar deneyin.',
    error: 'SEARCH_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  documentationWriteLimiter,
  impactAnalysisLimiter,
  searchLimiter
};