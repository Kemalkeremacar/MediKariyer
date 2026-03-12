/**
 * @file securityConfig.js
 * @description Dokümantasyon sistemi güvenlik yapılandırmaları.
 * Ana MediKariyer sistemine uygun güvenlik ayarları.
 */

'use strict';

// CORS Yapılandırması
const CORS_OPTIONS = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5000',
      'http://localhost:5000', // Frontend - Vite dev server
      'http://localhost:3000',
      'http://localhost:8081', // Expo web
      'http://127.0.0.1:8081',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000',
      'https://medikariyer.net',
      'https://www.medikariyer.net'
    ];

    // Production ortamında sadece production domain'lerine izin ver
    if (process.env.NODE_ENV === 'production') {
      const productionOrigins = [
        'https://medikariyer.net',
        'https://www.medikariyer.net'
      ];
      
      if (!origin) {
        return callback(null, true);
      }
      
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Bu kaynağa CORS politikası tarafından izin verilmiyor.'));
      return;
    }
    
    // Development ortamında daha esnek kontrol
    if (!origin) {
      return callback(null, true);
    }
    
    // Local network IP range kontrolü
    const localNetworkPattern = /^https?:\/\/192\.168\.1\.\d{1,3}(:\d+)?$/;
    if (localNetworkPattern.test(origin)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`CORS: Bilinmeyen origin: ${origin}`);
    }
    
    callback(new Error('Bu kaynağa CORS politikası tarafından izin verilmiyor.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'x-request-id', 
    'X-Request-ID',
    'x-client-version',
    'X-Client-Version'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// JWT Yapılandırması
const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ISSUER: 'medikariyer-documentation-api',
  AUDIENCE: 'medikariyer-documentation-client'
};

// Bcrypt Yapılandırması
const BCRYPT_CONFIG = {
  ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
};

module.exports = {
  CORS_OPTIONS,
  JWT_CONFIG,
  BCRYPT_CONFIG
};