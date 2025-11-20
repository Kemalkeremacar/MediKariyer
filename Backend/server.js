/**
 * @file server.js
 * @description MediKariyer API sunucusunun ana giriş dosyası.
 * Ortam yönetimi, Express yükleyicileri, cron görevleri, güvenli kapatma
 * ve global hataların ele alınması bu dosyada yönetilir.
 */

'use strict';

const path = require('path');

// ============================
// 🌍 ENVIRONMENT LOADING
// ============================
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  console.log("📦 [PROD] .env.production yüklendi");
} else {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  console.log("📦 [DEV] .env yüklendi");
}

// ============================
// 📦 DEPENDENCIES
// ============================
const express = require('express');
const logger = require('./src/utils/logger');
const expressLoader = require('./expressLoader');
const { testConnection } = require('./src/config/dbConfig');

const {
  startTokenCleanupScheduler,
  stopTokenCleanupScheduler
} = require('./src/utils/tokenCleanup');

const {
  startJobExpirationCron,
  stopJobExpirationCron
} = require('./src/utils/jobExpirationCron');

// ============================
// 🚀 EXPRESS APP
// ============================
const app = express();
let server;
const PORT = process.env.PORT || 3100;

// ============================
// 🔥 SERVER START FUNCTION
// ============================
const startServer = async () => {
  try {
    // Veritabanı bağlantısını test et
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.warn('⚠️ Veritabanı bağlantısı testte başarısız. Sunucu yine de başlatılıyor…');
    }

    // Express yükleyici (CORS, Helmet, ratelimit, routes vs.)
    expressLoader(app);

    // Scheduler – Token temizleme
    startTokenCleanupScheduler();

    // Scheduler – 30 günlük ilan süresi kontrolü
    startJobExpirationCron();

    // Sunucuyu başlat
    server = app.listen(PORT, () => {
      logger.info(`🚀 MediKariyer API ${PORT} portunda çalışıyor`);
      logger.info(`🌐 Ortam: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
    });

  } catch (error) {
    logger.error("❌ Sunucu başlatılamadı:", error);
    process.exit(1);
  }
};

// Başlat
startServer();

// ============================
// 🧹 GRACEFUL SHUTDOWN
// ============================
const shutdown = (signal) => {
  logger.info(`${signal} sinyali alındı. Sunucu kapatılıyor...`);

  stopTokenCleanupScheduler();
  stopJobExpirationCron();

  if (server) {
    server.close(() => {
      logger.info("Sunucu bağlantıları kapatıldı. Çıkılıyor...");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================
// ⚠️ GLOBAL ERROR HANDLERS
// ============================
process.on('uncaughtException', (err) => {
  logger.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error("💥 Unhandled Rejection:", err);
  process.exit(1);
});

// Testler için app export edilir
module.exports = app;
