/**
 * @file logger.js
 * @description Dokümantasyon sistemi için Winston tabanlı loglama sistemi
 * Ana MediKariyer sistemine uygun yapılandırma
 */

'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Log seviyelerini tanımla
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Log renklerini tanımla
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// Log formatını oluştur
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Dosya log formatı (renksiz)
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transport'ları tanımla
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  }),
  
  // Error log dosyası
  new DailyRotateFile({
    filename: path.join('logs', 'documentation-error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileLogFormat,
    maxSize: '20m',
    maxFiles: '14d'
  }),
  
  // Combined log dosyası
  new DailyRotateFile({
    filename: path.join('logs', 'documentation-combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileLogFormat,
    maxSize: '20m',
    maxFiles: '14d'
  })
];

// Logger'ı oluştur
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels: logLevels,
  format: fileLogFormat,
  transports,
  exitOnError: false
});

// Morgan için stream oluştur
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = logger;