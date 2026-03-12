/**
 * @file dbConfig.js
 * @description Dokümantasyon sistemi veritabanı bağlantısını yönetir.
 * Ana MediKariyer veritabanını kullanır ancak dokümantasyon tabloları ile çalışır.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const knex = require('knex');
const logger = require('../utils/logger');

require('dotenv').config({ 
  path: path.resolve(__dirname, '../../../.env'),
  override: false
});

/**
 * .env dosyasından DB_PASSWORD değerini manuel olarak okur
 */
const readPasswordFromEnv = () => {
  try {
    const envPath = path.resolve(__dirname, '../../../.env');
    if (!fs.existsSync(envPath)) {
      return null;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      if (trimmedLine.startsWith('DB_PASSWORD=')) {
        const value = trimmedLine.substring('DB_PASSWORD='.length);
        
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith('\'') && value.endsWith('\''))) {
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

const environment = process.env.NODE_ENV || 'development';

// Veritabanı bağlantı yapılandırması
const serverName = process.env.DB_HOST || 'localhost';
const databaseName = process.env.DB_NAME || 'MEDIKARIYER';
const instanceName = process.env.DB_INSTANCE || null;

const finalServer = instanceName ? `${serverName}\\${instanceName}` : serverName;

let dbPassword = readPasswordFromEnv();
if (!dbPassword) {
  dbPassword = process.env.DB_PASSWORD;
}

if (!dbPassword) {
  logger.warn('⚠️ DB_PASSWORD ortam değişkeni tanımlı değil veya boş!');
} else {
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
      min: 5, 
      max: 50,
      acquireTimeoutMillis: 60000, 
      idleTimeoutMillis: 600000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    }
    : { 
      min: 2, 
      max: 10,
      acquireTimeoutMillis: 30000, 
      idleTimeoutMillis: 300000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000
    }
};

const db = knex(config);

/**
 * Veritabanı bağlantısını test eder
 */
const testConnection = async () => {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.raw('SELECT 1');
      logger.info('✅ Dokümantasyon sistemi veritabanı bağlantısı başarıyla kuruldu.');
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        logger.error('❌ Dokümantasyon sistemi veritabanı bağlantısı kurulamadı:', error);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return false;
};

/**
 * Veritabanı bağlantısını düzgün bir şekilde sonlandırır
 */
const closeConnection = async () => {
  try {
    await db.destroy();
    logger.info('Dokümantasyon sistemi veritabanı bağlantısı kapatıldı.');
  } catch (error) {
    logger.error('Dokümantasyon sistemi veritabanı bağlantısı kapatılırken hata oluştu:', error);
  }
};

module.exports = {
  db,
  testConnection,
  closeConnection
};