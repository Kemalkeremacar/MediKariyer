/**
 * @file expressLoader.js
 * @description Dokümantasyon sistemi Express.js uygulamasını başlatır ve temel middleware'leri yapılandırır.
 * MediKariyer ana backend yapısına uygun olarak tasarlanmıştır.
 */
'use strict';

const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');
const { globalErrorHandler } = require('./src/utils/errorHandler');
const { CORS_OPTIONS } = require('./src/config/securityConfig');

/**
 * Express uygulamasını oluşturur ve yapılandırır.
 * @param {Express.Application} app Express uygulama nesnesi
 */
const expressLoader = (app) => {
  // Ters proxy arkasında çalışırken IP adreslerinin doğru alınması için
  app.set('trust proxy', 1);

  // --- Temel Middleware Katmanları ---

  // 1. Helmet Middleware (Güvenlik Headers)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // 2. CORS Middleware
  app.use(cors(CORS_OPTIONS));

  // 3. İstek Body'sini Ayrıştırma
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Yanıt Sıkıştırma
  app.use(compression());

  // 5. HTTP İstek Loglama
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logger.stream }));
  }

  // 6. Statik Dosya Servisi
  app.use('/uploads', express.static('uploads'));

  // --- Rotalar ve Özel Endpoint'ler ---

  // Sağlık Kontrolü Endpoint'i
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'MediKariyer Dokümantasyon API çalışıyor',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Ana API Rotaları
  app.use('/api', routes);
  logger.info('✅ Dokümantasyon API rotaları /api altında başarıyla yüklendi.');

  // --- Hata Yönetimi Katmanları ---

  // 404 - Bulunamadı Hata Yöneticisi
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ulaşmaya çalıştığınız kaynak bulunamadı.',
      error: 'NOT_FOUND'
    });
  });

  // Global Hata Yöneticisi
  app.use(globalErrorHandler);
};

module.exports = expressLoader;