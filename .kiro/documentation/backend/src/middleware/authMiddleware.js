/**
 * @file authMiddleware.js
 * @description Dokümantasyon sistemi kimlik doğrulama middleware'i
 * Ana MediKariyer JWT sistemini kullanır
 */

'use strict';

const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/securityConfig');
const { AppError } = require('../utils/errorHandler');
const { db } = require('../config/dbConfig');
const logger = require('../utils/logger');

/**
 * JWT token doğrulama middleware'i
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Authorization header'ını kontrol et
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(new AppError('Erişim token\'ı gerekli', 401, 'TOKEN_REQUIRED'));
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN_SECRET);
    
    // Kullanıcı bilgilerini veritabanından al (Ana MediKariyer tablosundan)
    const user = await db('Users')
      .select('UserID', 'Email', 'Role', 'IsActive')
      .where('UserID', decoded.userId)
      .first();

    if (!user) {
      return next(new AppError('Kullanıcı bulunamadı', 401, 'USER_NOT_FOUND'));
    }

    if (!user.IsActive) {
      return next(new AppError('Hesap aktif değil', 401, 'ACCOUNT_INACTIVE'));
    }

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      id: user.UserID,
      email: user.Email,
      role: user.Role,
      isActive: user.IsActive
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Geçersiz token', 401, 'INVALID_TOKEN'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token süresi dolmuş', 401, 'TOKEN_EXPIRED'));
    }

    logger.error('Auth middleware hatası:', error);
    return next(new AppError('Kimlik doğrulama hatası', 500, 'AUTH_ERROR'));
  }
};

/**
 * Opsiyonel kimlik doğrulama (token varsa doğrula, yoksa devam et)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next(); // Token yoksa devam et
      return;
    }

    // Token varsa doğrula
    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN_SECRET);
    
    const user = await db('Users')
      .select('UserID', 'Email', 'Role', 'IsActive')
      .where('UserID', decoded.userId)
      .first();

    if (user && user.IsActive) {
      req.user = {
        id: user.UserID,
        email: user.Email,
        role: user.Role,
        isActive: user.IsActive
      };
    }

    next();
  } catch (error) {
    // Token geçersizse de devam et (opsiyonel auth)
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};