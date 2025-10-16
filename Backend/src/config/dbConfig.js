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

// Doğrudan veritabanı yapılandırması
const config = {
  client: 'mssql',
  connection: {
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'MEDIKARIYER',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      instanceName: process.env.DB_INSTANCE,
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000
    }
  },
  pool: environment === 'production' 
    ? { min: 5, max: 20 }
    : { min: 2, max: 10 }
};

// Knex.js veritabanı bağlantı nesnesini oluştur.
const db = knex(config);

/**
 * Veritabanı bağlantısını test eder.
 * Sunucu başlatıldığında veya bir sağlık kontrolü (health check) endpoint'inde kullanılabilir.
 * @returns {Promise<boolean>} Bağlantı başarılıysa true, değilse false döner.
 */
const testConnection = async () => {
  try {
    // Veritabanına basit bir sorgu göndererek bağlantıyı kontrol et.
    // 'SELECT 1' sorgusu genellikle bu amaçla kullanılır çünkü sunucuya minimum yük bindirir.
    await db.raw('SELECT 1');
    logger.info('✅ Veritabanı bağlantısı başarıyla kuruldu.');
    return true;
  } catch (error) {
    // Bağlantı hatası durumunda konsola detaylı bir hata mesajı yazdır.
    logger.error('❌ Veritabanı bağlantısı kurulamadı:', error.message);
    return false;
  }
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
