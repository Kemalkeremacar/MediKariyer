/**
 * @file server.js
 * @description MediKariyer Dokümantasyon Sistemi API sunucusunun ana giriş dosyası.
 * Mevcut MediKariyer backend yapısına uygun olarak tasarlanmıştır.
 */

'use strict';

const path = require('path');

// ============================
// 🌍 ENVIRONMENT LOADING
// ============================
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  
  // Production ortamında console.log'ları devre dışı bırak
  console.log = function() {};
  console.debug = function() {};
  console.info = function() {};
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

// ============================
// 🚀 EXPRESS APP
// ============================
const app = express();
let server;
const PORT = process.env.PORT || 3200;

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

    // Express yükleyici
    expressLoader(app);

    // Sunucuyu başlat
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 MediKariyer Dokümantasyon API ${PORT} portunda çalışıyor`);
      logger.info(`🌐 Ortam: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Base URL: http://0.0.0.0:${PORT}${process.env.API_PREFIX || '/api'}`);
    });

  } catch (error) {
    logger.error("❌ Sunucu başlatılamadı:", error);
    process.exit(1);
  }
};

startServer();

// ============================
// 🧹 GRACEFUL SHUTDOWN
// ============================
const shutdown = (signal) => {
  logger.info(`${signal} sinyali alındı. Sunucu kapatılıyor...`);

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

module.exports = app;