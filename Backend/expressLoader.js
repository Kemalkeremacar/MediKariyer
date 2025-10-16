/**
 * @file expressLoader.js
 * @description Express.js uygulamasını başlatır ve temel middleware'leri yapılandırır.
 * Bu loader, uygulamanın bel kemiğini oluşturur: güvenlik, istek işleme, loglama,
 * route'lar ve hata yönetimi gibi tüm temel katmanlar burada sırayla devreye alınır.
 */
'use strict';

// Gerekli kütüphaneler ve modüller
const express = require('express');
const morgan = require('morgan'); // HTTP isteklerini loglamak için
const compression = require('compression'); // Yanıtları sıkıştırarak performansı artırmak için
const cors = require('cors'); // CORS middleware'i
const helmet = require('helmet'); // Güvenlik headers middleware'i
const routes = require('./src/routes'); // Ana API route'larını içeren dosya
const logger = require('./src/utils/logger'); // Winston tabanlı logger
const { globalErrorHandler } = require('./src/utils/errorHandler'); // Merkezi hata yönetimi
const { CORS_OPTIONS } = require('./src/config/securityConfig'); // CORS ayarları

/**
 * Express uygulamasını oluşturur ve yapılandırır.
 * @returns {Express.Application} Yapılandırılmış Express uygulama nesnesi.
 */
const expressLoader = (app) => {
  // Ters proxy (örn: Nginx, Heroku) arkasında çalışırken IP adreslerinin doğru alınması için.
  app.set('trust proxy', 1);

  // --- Temel Middleware Katmanları ---

  // 1. Helmet Middleware (Güvenlik Headers)
  // Güvenlik header'larını otomatik olarak ekler (XSS, CSRF, clickjacking koruması)
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

  // 2. CORS Middleware (Güvenlik)
  // Farklı kaynaklardan gelen isteklere izin verme politikalarını yönetir.
  app.use(cors(CORS_OPTIONS));

  // 3. İstek Body'sini Ayrıştırma (Body Parsing)
  // Gelen JSON ve URL-encoded verileri `req.body` nesnesine dönüştürür.
  app.use(express.json({ limit: '10mb' })); // JSON body'leri için limit (örn: dosya yükleme için artırılabilir).
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded body'ler için.

  // 4. Yanıt Sıkıştırma (Compression)
  // API yanıtlarını (JSON vb.) gzip formatında sıkıştırarak istemciye daha hızlı gönderir.
  app.use(compression());

  // 5. HTTP İstek Loglama (Logging)
  // Test ortamı dışında, gelen tüm HTTP isteklerini detaylı bir şekilde loglar.
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logger.stream }));
  }

  // 6. Statik Dosya Servisi
  // 'uploads' klasöründeki dosyaları '/uploads' URL'i üzerinden erişilebilir hale getirir.
  app.use('/uploads', express.static('uploads'));

  // --- Rotalar ve Özel Endpoint'ler ---

  // Sağlık Kontrolü (Health Check) Endpoint'i
  // Uygulamanın ayakta ve çalışır durumda olup olmadığını kontrol etmek için kullanılır.
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'MediKariyer API çalışıyor',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // Sunucunun ne kadar süredir ayakta olduğu (saniye).
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Ana API Rotaları
  // Tüm API endpoint'lerini `/api` ön eki altında gruplar.
  app.use('/api', routes);
  logger.info('✅ Rotalar /api altında başarıyla yüklendi.');

  // --- Hata Yönetimi Katmanları (En sonda olmalı) ---

  // 1. 404 - Bulunamadı Hata Yöneticisi
  // Yukarıdaki rotalardan hiçbiriyle eşleşmeyen bir istek geldiğinde bu middleware çalışır.
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ulaşmaya çalıştığınız kaynak bulunamadı.',
      error: 'NOT_FOUND'
    });
  });

  // 2. Global Hata Yöneticisi
  // Uygulamanın herhangi bir yerinde `next(error)` çağrıldığında veya bir hata fırlatıldığında bu middleware çalışır.
  // Tüm hataları yakalayan son noktadır.
  app.use(globalErrorHandler);
};

module.exports = expressLoader;
