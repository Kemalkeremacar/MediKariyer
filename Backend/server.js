/**
 * @file server.js
 * @description MediKariyer API sunucusunun ana giriş noktası.
 * Bu dosya, sunucuyu başlatır, temel güvenlik katmanlarını (Helmet, CORS, Rate Limiting) uygular,
 * Express ayarlarını ve route'ları yükler, global hata yakalama mekanizmalarını kurar
 * ve sunucunun düzgün bir şekilde kapatılmasını (graceful shutdown) yönetir.
 */

'use strict';

// .env dosyasındaki ortam değişkenlerini yükler. Proje genelinde process.env üzerinden erişim sağlar.
require('dotenv').config();

// Gerekli kütüphaneler
const express = require('express'); // Node.js için web uygulama çatısı
const cors = require('cors'); // Cross-Origin Resource Sharing (Farklı kaynaklardan gelen isteklere izin verme) middleware'i
const helmet = require('helmet'); // HTTP başlıklarını güvenli hale getirerek çeşitli zafiyetlerden koruyan middleware
const rateLimit = require('express-rate-limit'); // API'ye yapılan istekleri sınırlamak için kullanılan middleware (Brute-force saldırılarına karşı koruma)

// Uygulama başlangıcında yüklenmesi gereken modüller (Loader'lar)
// Bu yapı, başlangıç konfigürasyonlarını ana dosyadan ayırarak daha temiz bir kod yapısı sağlar.
const expressLoader = require('./expressLoader'); // Express'in temel ayarlarını (body-parser, cookie-parser vb.) yükler.
// Not: routeLoader kaldırıldı. Rota yükleme sorumluluğu expressLoader'a devredildi.

// Proje genelinde kullanılacak yardımcı modüller (Utilities)
const logger = require('./src/utils/logger'); // Olayları (info, error, warning) kaydetmek için kullanılan Winston logger.
const { testConnection } = require('./src/config/dbConfig'); // Veritabanı bağlantı testi
const { startTokenCleanupScheduler } = require('./src/utils/tokenCleanup'); // Token temizleme sistemi
// Not: globalErrorHandler kaldırıldı. Hata yönetimi sorumluluğu expressLoader'a devredildi.

// Yeni bir Express uygulaması oluşturulur.
const app = express();

// Sunucunun çalışacağı port. .env dosyasından alınır, eğer tanımlı değilse varsayılan olarak 5000 kullanılır.
const PORT = process.env.PORT || 5000;

// Not: Temel güvenlik middleware'leri (Helmet, CORS, Rate Limiting) expressLoader içinde yönetilmektedir.

// --- YÜKLEYİCİLER (LOADERS) ---

// Başlatma fonksiyonu
let server; // Server değişkenini dışarıda tanımla

const startServer = async () => {
  try {
        // Veritabanı bağlantısını test et
        await testConnection();
        logger.info('✅ Veritabanı bağlantısı başarıyla kuruldu.');

    // Express uygulamasını yapılandır
    expressLoader(app);
    logger.info('✅ Express yükleyicisi başarıyla başlatıldı.');

    // Token temizleme sistemini başlat
    startTokenCleanupScheduler();
    logger.info('✅ Token temizleme sistemi başlatıldı.');

    // Sunucuyu başlat
    server = app.listen(PORT, () => {
      logger.info(`🚀 MediKariyer API Sunucusu ${PORT} portunda çalışıyor.`);
      logger.info(`📝 Ortam: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API Ana URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
    });

    // Graceful shutdown handlers zaten dosyanın başında tanımlanmış

  } catch (error) {
    logger.error('❌ Sunucu başlatma sırasında kritik hata:', error);
    process.exit(1);
  }
};

// Sunucuyu başlat
startServer();

// --- DÜZGÜN KAPATMA (GRACEFUL SHUTDOWN) ---
// Sunucunun beklenmedik bir şekilde kapanması yerine, mevcut işlemleri bitirip güvenli bir şekilde sonlanmasını sağlar.
// Bu, özellikle production ortamlarında veri kaybını önlemek için önemlidir.

// SIGTERM sinyali (genellikle process manager'lar tarafından gönderilir, örn: PM2, Docker)
process.on('SIGTERM', () => {
  logger.info('SIGTERM sinyali alındı, sunucu düzgün bir şekilde kapatılıyor.');
  if (server) {
    server.close(() => {
      logger.info('İşlem sonlandırıldı.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// SIGINT sinyali (genellikle Ctrl+C ile manuel olarak gönderilir)
process.on('SIGINT', () => {
  logger.info('SIGINT sinyali alındı, sunucu düzgün bir şekilde kapatılıyor.');
  if (server) {
    server.close(() => {
      logger.info('İşlem sonlandırıldı.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// --- YAKALANAMAYAN HATALAR (UNCAUGHT EXCEPTIONS & UNHANDLED REJECTIONS) ---
// Kodun herhangi bir yerinde try-catch bloğu ile yakalanamayan hataları yönetir.
// Bu tür hatalar genellikle uygulamanın kararsız bir duruma geldiğini gösterir, bu yüzden en güvenli yol uygulamayı yeniden başlatmaktır.

// Yakalanamayan senkron hatalar
process.on('uncaughtException', (err) => {
  logger.error('Yakalanamayan Hata (Uncaught Exception):', err);
  process.exit(1); // Hata sonrası uygulamayı sonlandır. Process manager (PM2) yeniden başlatacaktır.
});

// Yakalanamayan asenkron (Promise) hataları
process.on('unhandledRejection', (err) => {
  logger.error('İşlenmeyen Promise Reddi (Unhandled Rejection):', err);
  process.exit(1); // Hata sonrası uygulamayı sonlandır.
});

// Testler için uygulamayı dışa aktar.
module.exports = app;
