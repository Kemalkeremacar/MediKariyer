/**
 * @file dbConfig.js
 * @description Veritabanı bağlantısını yönetir.
 * Bu dosya, Knex.js kütüphanesini kullanarak doğrudan yapılandırma ile
 * veritabanı bağlantısını oluşturur. Migration ve seed kullanılmadığı için
 * knexfile.js dosyasına gerek yoktur.
 */

'use strict';

// Gerekli kütüphaneler
const fs = require('fs');
const path = require('path');
const knex = require('knex'); // SQL sorgu oluşturucu (Query Builder)
const logger = require('../utils/logger'); // Loglama sistemi

// .env dosyasındaki ortam değişkenlerini yükler (eğer daha önce yüklenmediyse)
// Bu dosya birçok yerden require edilebildiği için burada da yüklenmesi gerekir
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../.env'),
  override: false // Eğer zaten yüklenmişse üzerine yazma
});

/**
 * .env dosyasından DB_PASSWORD değerini manuel olarak okur
 * dotenv, < ve > karakterlerini özel işlediği için manuel parse gerekir
 * @returns {string|null} DB_PASSWORD değeri veya null
 */
const readPasswordFromEnv = () => {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (!fs.existsSync(envPath)) {
      return null;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      // Yorum satırlarını ve boş satırları atla
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // DB_PASSWORD satırını bul
      if (trimmedLine.startsWith('DB_PASSWORD=')) {
        // = işaretinden sonrasını al
        const value = trimmedLine.substring('DB_PASSWORD='.length);
        
        // Tırnak işaretlerini kaldır (varsa)
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          return value.slice(1, -1);
        }
        
        return value;
      }
    }
    
    return null;
  } catch (error) {
    logger.error('❌ .env dosyasından DB_PASSWORD okunurken hata:', error);
    return null;
  }
};

// Hangi ortamda (development, production vb.) çalışıldığını belirle.
const environment = process.env.NODE_ENV || 'development';

// Veritabanı bağlantı yapılandırması - Basit ve direkt yaklaşım
const serverName = process.env.DB_HOST || 'localhost';
const databaseName = process.env.DB_NAME || 'MEDIKARIYER';
const instanceName = process.env.DB_INSTANCE || null;

// Server adını oluştur (instance varsa ekle)
const finalServer = instanceName ? `${serverName}\\${instanceName}` : serverName;

// DB_PASSWORD değerini güvenli şekilde oku (özel karakterler için)
// dotenv, < ve > karakterlerini özel işlediği için manuel okuma yapıyoruz
// Önce manuel okumayı dene, yoksa process.env'den al
let dbPassword = readPasswordFromEnv();
if (!dbPassword) {
  dbPassword = process.env.DB_PASSWORD;
}

if (!dbPassword) {
  logger.warn('⚠️ DB_PASSWORD ortam değişkeni tanımlı değil veya boş!');
} else {
  // Şifre yüklendi (güvenlik için tam değer loglanmıyor)
  logger.debug(`DB_PASSWORD yüklendi (uzunluk: ${dbPassword.length})`);
}

const config = {
  client: 'mssql',
  connection: {
    server: finalServer,
    database: databaseName,
    user: process.env.DB_USER || 'tstSqlUser',
    password: dbPassword,
    options: {
      encrypt: process.env.DB_ENCRYPT?.toLowerCase() === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE?.toLowerCase() === 'true',
      enableArithAbort: true,
      requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT) || 60000,
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 60000,
      useUTC: true
    }
  },
  pool: environment === 'production' 
    ? { 
        min: 10, 
        max: 100, // Production için artırıldı: 50 -> 100
        acquireTimeoutMillis: 60000, 
        idleTimeoutMillis: 600000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200
      }
    : { 
        min: 3, 
        max: 20, // Development için artırıldı: 15 -> 20
        acquireTimeoutMillis: 30000, 
        idleTimeoutMillis: 300000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000
      }
};

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
