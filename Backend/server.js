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
const fs = require('fs');

if (process.env.NODE_ENV === 'production') {
  // Production ortamında önce .env.production'ı dene, yoksa .env'i kullan
  const productionEnvPath = path.join(__dirname, '.env.production');
  const fallbackEnvPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(productionEnvPath)) {
    require('dotenv').config({ path: productionEnvPath });
    console.log("📦 [PROD] .env.production yüklendi");
  } else if (fs.existsSync(fallbackEnvPath)) {
    require('dotenv').config({ path: fallbackEnvPath });
    console.log("📦 [PROD] .env.production bulunamadı, .env kullanılıyor");
  } else {
    console.error("❌ Ne .env.production ne de .env dosyası bulunamadı!");
  }
  
  // Production ortamında console.log'ları devre dışı bırak
  // console.error ve console.warn hariç (kritik hatalar için)
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

const {
  startTokenCleanupScheduler,
  stopTokenCleanupScheduler
} = require('./src/utils/tokenCleanup');

const {
  startJobExpirationCron,
  stopJobExpirationCron
} = require('./src/utils/jobExpirationCron');

const {
  startLogCleanupCron
} = require('./src/utils/logCleanupCron');

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

    // Scheduler – Eski logları otomatik temizleme (her gün 02:00)
    startLogCleanupCron();

    // Sunucuyu başlat - Tüm network interface'lerinde dinle (0.0.0.0)
    // Bu sayede VPN, local network ve localhost üzerinden erişilebilir
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 MediKariyer API ${PORT} portunda çalışıyor`);
      logger.info(`🌐 Ortam: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Base URL: http://0.0.0.0:${PORT}${process.env.API_PREFIX || '/api'}`);
      // Network IP'lerini dinamik olarak bul
      const os = require('os');
      const nets = os.networkInterfaces();
      const networkIPs = [];
      Object.keys(nets).forEach(name => {
        nets[name].forEach(net => {
          if (net.family === 'IPv4' && !net.internal) {
            networkIPs.push(`http://${net.address}:${PORT}/api`);
          }
        });
      });
      
      logger.info(`📱 Network IPs: ${networkIPs.join(', ')}`);
      logger.info(`🔒 VPN Network: http://10.8.0.x:${PORT}/api (VPN IP'den erişim)`);
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
