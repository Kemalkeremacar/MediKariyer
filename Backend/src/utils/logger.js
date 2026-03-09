/**
 * @file logger.js
 * @description Production-ready Winston logger yapılandırması - uygulama loglarını yönetir
 * 
 * Özellikler:
 * - Daily rotate file transport (logs klasöründe tarih bazlı dosyalar)
 * - Error ve combined log ayrımı
 * - Production/development ortam ayrımı
 * - Disk taşma koruması (maxSize, maxFiles)
 * - Console ve file transport desteği
 * 
 * Log Dosyaları:
 * - logs/error-YYYY-MM-DD.log: Sadece error seviyesi loglar
 * - logs/combined-YYYY-MM-DD.log: Tüm seviye loglar
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const DatabaseTransport = require('./databaseTransport');

// Log seviyeleri
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Renk kodları
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Log formatı
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console formatı (renkli)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Transport'lar
const transports = [];

// Console transport (her zaman aktif)
transports.push(
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  })
);

// Production ortamında file transport'ları ekle
if (process.env.NODE_ENV === 'production') {
  // Error log dosyası
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: format,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      zippedArchive: true
    })
  );

  // Combined log dosyası
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: format,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      zippedArchive: true
    })
  );
}

// Database transport ekle
// Development'ta da aktif olabilir (ENABLE_DB_LOGGING=true ile)
// Production'da default olarak aktif
const enableDbLogging = process.env.ENABLE_DB_LOGGING !== undefined 
  ? process.env.ENABLE_DB_LOGGING === 'true'
  : process.env.NODE_ENV === 'production';

if (enableDbLogging) {
  try {
    // DB_LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug'
    // 'info' seviyesi: info, warn, error loglarını database'e yazar
    // 'http' seviyesi: http, info, warn, error loglarını database'e yazar
    const dbLogLevel = process.env.DB_LOG_LEVEL || 'info';
    
    transports.push(
      new DatabaseTransport({
        level: dbLogLevel, // info seviyesi ile tüm önemli loglar yazılır
        category: 'application',
        batchSize: 5, // Daha küçük batch
        flushInterval: 2000 // 2 saniye
      })
    );
    
    console.log('✅ Database logging aktif - Level:', dbLogLevel, '| Batch: 5 | Interval: 2s');
  } catch (error) {
    console.error('❌ Database transport başlatılamadı:', error.message);
  }
} else {
  console.log('⚠️ Database logging devre dışı - ENABLE_DB_LOGGING:', process.env.ENABLE_DB_LOGGING);
}

// Logger oluştur
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// HTTP request logging için stream
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = logger;