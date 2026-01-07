/**
 * @file mobileAuthService.js
 * @description Mobile authentication servisi - Mobil uygulama için kimlik doğrulama işlemlerini yönetir.
 * Bu servis, mobileAuthController tarafından kullanılan temel authentication işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Mobil login işlemi (sadece doktor rolü)
 * - Token yenileme (refresh token)
 * - Logout işlemi
 * - Şifre sıfırlama talebi (forgot password - web ile aynı mantık)
 * 
 * Veritabanı Tabloları:
 * - users: Kullanıcı bilgileri
 * - doctor_profiles: Doktor profil bilgileri
 * - refresh_tokens: Yenileme token'ları
 * 
 * Özellikler:
 * - Doktor rolü kontrolü (ensureDoctorRole)
 * - Minimal response payload (mobile optimized)
 * - Profile transformer kullanımı
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const authService = require('../authService');
const doctorService = require('../doctorService');
const { AppError } = require('../../utils/errorHandler');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  createRefreshTokenRecord, 
  revokeRefreshTokenByValue,
  verifyRefreshTokenRecord,
  hashRefreshToken
} = require('../../utils/jwtUtils');
const profileTransformer = require('../../mobile/transformers/profileTransformer');

const ensureDoctorRole = (user) => {
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı', 401);
  }
  if (user.role !== 'doctor') {
    throw new AppError('Bu uygulama sadece doktorlar için kullanılabilir', 403);
  }
};

const buildTokenPayload = (user) => ({
  userId: user.id,
  role: user.role,
  isApproved: user.is_approved,
  isActive: user.is_active
});

const registerDoctor = async (registrationData, req) => {
  const { email, password, first_name, last_name, title, specialty_id, subspecialty_id, profile_photo } = registrationData;

  // AuthService ile doktor kaydı yap (web ile aynı mantık)
  // NOTE: authService.registerDoctor uses database transaction to ensure atomicity
  // (both users and doctor_profiles inserts succeed or both fail)
  const result = await authService.registerDoctor({
    email,
    password,
    first_name,
    last_name,
    title,
    specialty_id,
    subspecialty_id,
    profile_photo
  });

  // Mobile için minimal response döndür
  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      is_approved: result.user.is_approved,
      is_active: result.user.is_active
    },
    profile: {
      id: result.profile.id,
      first_name: result.profile.first_name,
      last_name: result.profile.last_name,
      title: result.profile.title,
      specialty_id: result.profile.specialty_id,
      subspecialty_id: result.profile.subspecialty_id,
      profile_photo: result.profile.profile_photo
    }
  };
};

/**
 * Mobile-specific credential validation (allows pending users)
 * @description Validates credentials without blocking unapproved users (for mobile waiting screen)
 */
const validateMobileCredentials = async (email, password) => {
  const db = require('../../config/dbConfig').db;
  const bcrypt = require('bcryptjs');
  const logger = require('../../utils/logger');

  // Email'i normalize et (trim ve lowercase)
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  // Case-insensitive email araması
  const user = await db('users')
    .whereRaw('LOWER(email) = ?', [normalizedEmail])
    .first();

  if (!user) {
    return null;
  }

  // SQL Server bit tipini boolean'a çevir
  const isActive = user.is_active === null || user.is_active === undefined 
    ? true
    : (user.is_active === 1 || user.is_active === true || user.is_active === '1' || user.is_active === 'true');

  // Şifre kontrolü
  if (!user.password_hash || !user.password_hash.startsWith('$2')) {
    return null;
  }

  const passwordHashString = String(user.password_hash);
  const isPasswordValid = await bcrypt.compare(password, passwordHashString);

  if (!isPasswordValid) {
    return null;
  }

  // Mobile: Sadece is_active kontrolü yap (suspended users cannot login)
  // is_approved kontrolü YAPILMAZ (pending users can login to see waiting screen)
  if (!isActive) {
    throw new AppError('Hesabınız pasifleştirilmiştir. Lütfen sistem yöneticisi ile iletişime geçin.', 403);
  }

  return user;
};

const login = async ({ email, password }, req) => {
  // Mobile-specific credential validation (allows pending users)
  const user = await validateMobileCredentials(email, password);
  
  if (!user) {
    throw new AppError('E-posta veya şifre hatalı', 401);
  }

  ensureDoctorRole(user);

  // SQL Server bit tipini boolean'a çevir - users tablosundan gelen değerleri kullan
  // NULL durumunda varsayılan değerleri kullan: is_active DEFAULT 1, is_approved DEFAULT 0
  const isActive = user.is_active === null || user.is_active === undefined 
    ? true  // NULL ise varsayılan 1 (aktif) - SQL DEFAULT ((1))
    : (user.is_active === 1 || user.is_active === true || user.is_active === '1' || user.is_active === 'true');
  
  const isApproved = user.is_approved === null || user.is_approved === undefined
    ? false  // NULL ise varsayılan 0 (onaysız) - SQL DEFAULT ((0))
    : (user.is_approved === 1 || user.is_approved === true || user.is_approved === '1' || user.is_approved === 'true');
  
  // CRITICAL CHANGE: Pending users (is_approved = false) CAN login
  // Mobile app will show "Waiting for Approval" screen based on is_approved flag
  // Only suspended users (is_active = false) are blocked

  const tokens = {
    accessToken: generateAccessToken(buildTokenPayload(user)),
    refreshToken: generateRefreshToken({ userId: user.id })
  };

  await createRefreshTokenRecord(user.id, tokens.refreshToken, req?.get?.('User-Agent') || 'mobile-app', req?.ip || null);

  const profile = await doctorService.getProfile(user.id);

  return {
    tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_approved: isApproved, // Boolean'a çevrilmiş değer (false = pending, true = approved)
      is_active: isActive, // Boolean'a çevrilmiş değer
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null
    },
    // Login response'da profile photo'yu dahil etme (çok büyük)
    profile: profile ? profileTransformer.toMobileProfile(profile, false) : null
  };
};

/**
 * Mobile-specific refresh token validation (allows pending users)
 * @description Validates refresh token without blocking unapproved users (for mobile waiting screen)
 */
const validateMobileRefreshToken = async (refreshToken) => {
  const db = require('../../config/dbConfig').db;
  
  // Token kaydını doğrula
  const tokenRecord = await verifyRefreshTokenRecord(refreshToken);
  if (!tokenRecord) {
    throw new AppError('Geçersiz refresh token', 401);
  }

  const user = await db('users')
    .where('id', tokenRecord.user_id)
    .first();

  if (!user) {
    await db('refresh_tokens').where('id', tokenRecord.id).del();
    throw new AppError('Kullanıcı bulunamadı', 401);
  }

  // SQL Server bit tipini boolean'a çevir
  const isActive = user.is_active === null || user.is_active === undefined 
    ? true
    : (user.is_active === 1 || user.is_active === true || user.is_active === '1' || user.is_active === 'true');

  // Mobile: Sadece is_active kontrolü yap (suspended users cannot refresh)
  // is_approved kontrolü YAPILMAZ (pending users can refresh tokens)
  if (user.role !== 'admin' && !isActive) {
    await db('refresh_tokens').where('user_id', user.id).del();
    throw new AppError('Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.', 403);
  }

  return { user, tokenRecord };
};

const refresh = async (refreshToken) => {
  const db = require('../../config/dbConfig').db;
  
  // Mobile-specific refresh token validation (allows pending users)
  const { user, tokenRecord } = await validateMobileRefreshToken(refreshToken);
  
  ensureDoctorRole(user);

  // SQL Server bit tipini boolean'a çevir - users tablosundan gelen değerleri kullan
  // NULL durumunda varsayılan değerleri kullan: is_active DEFAULT 1, is_approved DEFAULT 0
  const isActive = user.is_active === null || user.is_active === undefined 
    ? true  // NULL ise varsayılan 1 (aktif) - SQL DEFAULT ((1))
    : (user.is_active === 1 || user.is_active === true || user.is_active === '1' || user.is_active === 'true');
  
  const isApproved = user.is_approved === null || user.is_approved === undefined
    ? false  // NULL ise varsayılan 0 (onaysız) - SQL DEFAULT ((0))
    : (user.is_approved === 1 || user.is_approved === true || user.is_approved === '1' || user.is_approved === 'true');

  // Yeni access token oluştur
  const newAccessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    isApproved: isApproved,
    isActive: isActive
  });

  // Refresh token rotation - sadece gerektiğinde yeni token oluştur
  // Token'ın yarısı geçmişse yeni refresh token oluştur (güvenlik için)
  const DAY_IN_MS = 24 * 60 * 60 * 1000;
  const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 gün (JWT_REFRESH_EXPIRES_IN ile uyumlu)
  const REFRESH_TOKEN_EXPIRY_MS = REFRESH_TOKEN_EXPIRY_DAYS * DAY_IN_MS;
  
  let newRefreshToken = refreshToken; // Varsayılan olarak aynı token'ı kullan
  
  const tokenAge = Date.now() - new Date(tokenRecord.created_at).getTime();
  const tokenMaxAge = REFRESH_TOKEN_EXPIRY_MS;
  
  if (tokenAge > tokenMaxAge / 2) {
    // Token'ın yarısı geçmişse yeni refresh token oluştur (token rotation)
    newRefreshToken = generateRefreshToken({ userId: user.id });
    
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const expiryTime = REFRESH_TOKEN_EXPIRY_MS;
    
    // Transaction ile eski token'ı sil ve yeni token'ı kaydet
    await db.transaction(async (trx) => {
      await trx('refresh_tokens').where('id', tokenRecord.id).del();
      
      await trx('refresh_tokens').insert({
        user_id: user.id,
        token_hash: newRefreshTokenHash,
        expires_at: new Date(Date.now() + expiryTime),
        user_agent: tokenRecord.user_agent || 'mobile-app',
        ip: tokenRecord.ip || null,
        created_at: new Date()
      });
    });
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_approved: isApproved, // Boolean'a çevrilmiş değer
      is_active: isActive // Boolean'a çevrilmiş değer
    }
  };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await revokeRefreshTokenByValue(refreshToken);
  }

  return { success: true };
};

const getMe = async (userId) => {
  const db = require('../../config/dbConfig').db;
  
  // CRITICAL: is_active ve is_approved değerleri users tablosunda, doctor_profiles'da değil!
  // Önce users tablosundan is_active ve is_approved değerlerini al
  const user = await db('users').where('id', userId).select('is_active', 'is_approved', 'email').first();
  
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı', 404);
  }

  // Profil bilgilerini al
  const profile = await doctorService.getProfile(userId);
  
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }

  // SQL Server bit tipini boolean'a çevir - users tablosundan gelen değerleri kullan
  // NULL durumunda varsayılan değerleri kullan: is_active DEFAULT 1, is_approved DEFAULT 0
  const isActive = user.is_active === null || user.is_active === undefined 
    ? true  // NULL ise varsayılan 1 (aktif) - SQL DEFAULT ((1))
    : (user.is_active === 1 || user.is_active === true || user.is_active === '1' || user.is_active === 'true');
  
  const isApproved = user.is_approved === null || user.is_approved === undefined
    ? false  // NULL ise varsayılan 0 (onaysız) - SQL DEFAULT ((0))
    : (user.is_approved === 1 || user.is_approved === true || user.is_approved === '1' || user.is_approved === 'true');

  return {
    user: {
      id: profile.user_id,
      email: user.email || profile.email || null,
      role: 'doctor',
      is_approved: isApproved,
      is_active: isActive,
      first_name: profile.first_name,
      last_name: profile.last_name
    },
    // getMe'de de photo'yu dahil etme (çok büyük), gerekirse ayrı endpoint
    profile: profileTransformer.toMobileProfile(profile, false)
  };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const db = require('../../config/dbConfig').db;
  const bcrypt = require('bcryptjs');
  const logger = require('../../utils/logger');

  // Kullanıcıyı veritabanından getir
  const user = await db('users').where('id', userId).first();
  if (!user) throw new AppError('Kullanıcı bulunamadı', 404);

  // Mevcut şifreyi doğrula
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) throw new AppError('Mevcut şifre yanlış', 400);

  // Yeni şifreyi hash'le ve güncelle
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await db('users').where('id', user.id).update({
    password_hash: hashedPassword,
    updated_at: db.fn.now()
  });

  logger.info(`Password changed for user: ${user.email} (mobile)`);
  
  return { success: true };
};

/**
 * Request password reset - sends reset link to email
 * Web ile aynı mantık: authService.requestPasswordReset kullanıyor
 * Mail gönderme işi aynı, sadece mobile'dan çağrılıyor
 */
const forgotPassword = async (email, req) => {
  // Web'deki authService.requestPasswordReset'i kullan
  // Aynı mail gönderilir, aynı token oluşturulur
  // Aynı doktor hem web'den hem mobile'dan şifremi unuttum diyebilir
  await authService.requestPasswordReset({
    email,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('User-Agent') || 'mobile-app',
    source: 'mobile' // Mobile'dan gelen istek
  });
  
  return { success: true };
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  registerDoctor,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  forgotPassword
};

