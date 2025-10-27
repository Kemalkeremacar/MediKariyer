/**
 * @file dbConfig.js
 * @description Veritabanı bağlantısını yönetir.
 * Bu dosya, Knex.js kütüphanesini kullanarak doğrudan yapılandırma ile
 * veritabanı bağlantısını oluşturur. Migration ve seed kullanılmadığı için
 * knexfile.js dosyasına gerek yoktur.
 */

'use strict';

// Gerekli kütüphaneler
const knex = require('knex'); // SQL sorgu oluşturucu (Query Builder)
const logger = require('../utils/logger'); // Loglama sistemi

// Hangi ortamda (development, production vb.) çalışıldığını belirle.
const environment = process.env.NODE_ENV || 'development';

// Veritabanı bağlantı yapılandırması - Basit ve direkt yaklaşım
const serverName = process.env.DB_HOST || 'localhost';
const databaseName = process.env.DB_NAME || 'MEDIKARIYER';
const instanceName = process.env.DB_INSTANCE || null;

// Server adını oluştur (instance varsa ekle)
const finalServer = instanceName ? `${serverName}\\${instanceName}` : serverName;

const config = {
  client: 'mssql',
  connection: {
    server: finalServer,
    database: databaseName,
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false,  // Named Pipes için false
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 60000,
      connectionTimeout: 60000,
      useUTC: true
    }
  },
  pool: environment === 'production' 
    ? { min: 5, max: 20 }
    : { min: 2, max: 10 }
};

// Debug: Bağlantı bilgilerini logla
console.log('🔌 Veritabanı bağlantı bilgileri:', {
  server: finalServer,
  database: databaseName,
  user: config.connection.user,
  instanceName: instanceName || 'none',
  encrypt: config.connection.options.encrypt
});

// Knex.js veritabanı bağlantı nesnesini oluştur.
const db = knex(config);

/**
 * Veritabanı bağlantısını test eder.
 * Sunucu başlatıldığında veya bir sağlık kontrolü (health check) endpoint'inde kullanılabilir.
 * @returns {Promise<boolean>} Bağlantı başarılıysa true, değilse false döner.
 */
const testConnection = async () => {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Veritabanına basit bir sorgu göndererek bağlantıyı kontrol et.
      // 'SELECT 1' sorgusu genellikle bu amaçla kullanılır çünkü sunucuya minimum yük bindirir.
      await db.raw('SELECT 1');
      logger.info('✅ Veritabanı bağlantısı başarıyla kuruldu.');
      return true;
    } catch (error) {
      // Sadece tüm denemeler başarısız olduğunda hata göster
      if (attempt === maxRetries) {
        logger.error('❌ Veritabanı bağlantısı kurulamadı:', error);
        logger.error('📌 Bağlantı detayları:', {
          server: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          instance: process.env.DB_INSTANCE
        });
        return false;
      }
      // Retry yapılacak, kısa bekle (connection pool initialization için)
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return false;
};

/**
 * Veritabanı bağlantısını düzgün bir şekilde sonlandırır (Graceful Shutdown).
 * Uygulama kapatılırken (örn: SIGTERM sinyali alındığında) çağrılır.
 * Bu, açık bağlantıların düzgünce kapatılmasını ve veri kaybı riskinin azaltılmasını sağlar.
 */
const closeConnection = async () => {
  try {
    // Knex bağlantı havuzundaki (connection pool) tüm bağlantıları sonlandırır.
    await db.destroy();
    logger.info('Veritabanı bağlantısı kapatıldı.');
  } catch (error) {
    logger.error('Veritabanı bağlantısı kapatılırken hata oluştu:', error);
  }
};

// Projenin diğer dosyalarında kullanılmak üzere 'db' nesnesini ve yardımcı fonksiyonları dışa aktar.
module.exports = {
  db, // Veritabanı sorguları için ana Knex nesnesi
  testConnection, // Bağlantı testi fonksiyonu
  closeConnection // Bağlantıyı kapatma fonksiyonu
};
