/**
 * @file jwtUtils.js
 * @description JWT token işlemleri ve token yönetimi için merkezi modül.
 * Bu dosya, JWT token oluşturma/doğrulama ve refresh token veritabanı işlemlerini
 * tek bir yerde toplar. Token'ların güvenli bir şekilde yönetilmesini sağlar.
 */

'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/dbConfig').db;
const logger = require('./logger');

// JWT yapılandırması
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // 24 saat
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'; // 30 gün

// ==================== JWT TOKEN İŞLEMLERİ ====================

/**
 * Access Token oluşturur
 * @param {object} payload - Token içeriği (user id, role vb.)
 * @param {object} options - Ek seçenekler
 * @returns {string} Access token
 */
const generateAccessToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || JWT_EXPIRES_IN
  });
};

/**
 * Refresh Token oluşturur
 * @param {object} payload - Token içeriği
 * @param {object} options - Ek seçenekler
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: options.expiresIn || JWT_REFRESH_EXPIRES_IN
  });
};

/**
 * Access Token doğrular
 * @param {string} token - Doğrulanacak token
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Refresh Token doğrular
 * @param {string} token - Doğrulanacak token
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * Hem access hem refresh token döndürür
 * @param {object} payload - Token içeriği
 * @returns {object} Token çifti
 */
const generateTokenPair = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

// ==================== REFRESH TOKEN VERİTABANI İŞLEMLERİ ====================

/**
 * Verilen refresh token'ı hash'leyerek veritabanına kaydeder.
 * @param {number} userId - Token'ın ait olduğu kullanıcı ID'si
 * @param {string} refreshToken - Kullanıcıya verilen orijinal refresh token
 * @param {string} userAgent - İsteği yapan kullanıcının tarayıcı bilgisi
 * @param {string} ip - İsteği yapan kullanıcının IP adresi
 * @returns {Promise<object>} Veritabanında oluşturulan token kaydı
 */
const createRefreshTokenRecord = async (userId, refreshToken, userAgent, ip) => {
  try {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün

    const [tokenRecord] = await db('refresh_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        user_agent: userAgent,
        ip: ip
      })
      .returning('*');

    return tokenRecord;
  } catch (error) {
    logger.error('Error creating refresh token record:', error);
    throw error;
  }
};

/**
 * Verilen bir refresh token'ın geçerli olup olmadığını veritabanındaki hash ile karşılaştırarak doğrular.
 * ⚠️ PERFORMANCE FIX: JWT'yi decode edip user_id'yi alarak sadece o kullanıcının token'larını kontrol eder.
 * @param {string} refreshToken - Doğrulanacak olan refresh token
 * @returns {Promise<object|null>} Token geçerliyse veritabanı kaydı, değilse null
 */
const verifyRefreshTokenRecord = async (refreshToken) => {
  try {
    // JWT token'ı decode et (signature doğrulaması yapmadan sadece payload'u al)
    let userId;
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      userId = decoded.userId;
    } catch (error) {
      // Token decode edilemezse veya expire olduysa null döndür
      logger.warn('Refresh token decode failed:', error.message);
      return null;
    }

    if (!userId) {
      logger.warn('Refresh token does not contain userId');
      return null;
    }

    // Sadece bu kullanıcının aktif token'larını getir
    const tokenRecords = await db('refresh_tokens')
      .where('user_id', userId)
      .where('expires_at', '>', new Date())
      .whereNull('revoked_at');

    // Kullanıcının token'larını bcrypt ile kontrol et (genelde 1-3 token olur, tüm database değil!)
    for (const record of tokenRecords) {
      const isValid = await bcrypt.compare(refreshToken, record.token_hash);
      if (isValid) {
        return record;
      }
    }

    return null;
  } catch (error) {
    logger.error('Error verifying refresh token record:', error);
    throw error;
  }
};

/**
 * Belirli bir refresh token'ı geçersiz kılar.
 * @param {number} tokenId - İptal edilecek token'ın veritabanındaki ID'si
 * @returns {Promise<boolean>} İşlem başarılıysa true
 */
const revokeRefreshToken = async (tokenId) => {
  try {
    const updated = await db('refresh_tokens')
      .where('id', tokenId)
      .update({
        revoked_at: new Date()
      });

    return updated > 0;
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    throw error;
  }
};

/**
 * Refresh token string'i ile token'ı geçersiz kılar
 * @param {string} refreshToken - İptal edilecek refresh token string'i
 * @returns {Promise<boolean>} İşlem başarılıysa true
 */
const revokeRefreshTokenByValue = async (refreshToken) => {
  try {
    const tokenRecord = await verifyRefreshTokenRecord(refreshToken);
    if (tokenRecord) {
      return await revokeRefreshToken(tokenRecord.id);
    }
    return false;
  } catch (error) {
    logger.error('Error revoking refresh token by value:', error);
    throw error;
  }
};

/**
 * Bir kullanıcıya ait tüm aktif refresh token'ları geçersiz kılar.
 * @param {number} userId - Token'ları iptal edilecek kullanıcının ID'si
 * @returns {Promise<number>} İptal edilen token sayısı
 */
const revokeAllUserTokens = async (userId) => {
  try {
    const updated = await db('refresh_tokens')
      .where('user_id', userId)
      .whereNull('revoked_at')
      .update({
        revoked_at: new Date()
      });

    return updated;
  } catch (error) {
    logger.error('Error revoking all user tokens:', error);
    throw error;
  }
};

/**
 * Süresi dolmuş refresh token'ları veritabanından temizler.
 * @returns {Promise<number>} Silinen token sayısı
 */
const cleanupExpiredTokens = async () => {
  try {
    const deleted = await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .del();

    logger.info(`Cleaned up ${deleted} expired tokens`);
    return deleted;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    throw error;
  }
};

// ==================== ÖZEL TOKEN İŞLEMLERİ ====================

/**
 * Refresh token'ı hash'ler (bcrypt ile)
 * @param {string} refreshToken - Hash'lenecek refresh token
 * @returns {string} Hash'lenmiş token
 */
const hashRefreshToken = (refreshToken) => {
  return bcrypt.hashSync(refreshToken, 10);
};

/**
 * E-posta doğrulama işlemleri için kriptografik olarak güvenli, rastgele bir token oluşturur.
 * @returns {string} 32 byte'lık, hex formatında bir token string'i
 */
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  // JWT Token İşlemleri
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  
  // Refresh Token Veritabanı İşlemleri
  createRefreshTokenRecord,
  verifyRefreshTokenRecord,
  revokeRefreshToken,
  revokeRefreshTokenByValue,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  
  // Özel Token İşlemleri
  hashRefreshToken,
  generateEmailVerificationToken
};
