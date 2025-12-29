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
const { generateAccessToken, generateRefreshToken, createRefreshTokenRecord, revokeRefreshTokenByValue } = require('../../utils/jwtUtils');
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

const login = async ({ email, password }, req) => {
  const user = await authService.loginUnified(email, password, req);
  ensureDoctorRole(user);

  // Check if user is approved - unapproved users cannot login
  const isApproved = user.is_approved === 1 || user.is_approved === true || user.is_approved === '1' || user.is_approved === 'true';
  if (!isApproved) {
    throw new AppError('Hesabınız henüz admin tarafından onaylanmadı. Lütfen onay bekleyin.', 403);
  }

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
      is_approved: user.is_approved,
      is_active: user.is_active,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null
    },
    // Login response'da profile photo'yu dahil etme (çok büyük)
    profile: profile ? profileTransformer.toMobileProfile(profile, false) : null
  };
};

const refresh = async (refreshToken) => {
  const result = await authService.refreshToken(refreshToken);
  ensureDoctorRole(result.user);

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      is_approved: result.user.is_approved,
      is_active: result.user.is_active
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
  const profile = await doctorService.getProfile(userId);
  
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }

  // SQL Server bit tipini boolean'a çevir
  const isApproved = profile.is_approved === 1 || profile.is_approved === true;
  const isActive = profile.is_active === 1 || profile.is_active === true;

  return {
    user: {
      id: profile.user_id,
      email: profile.email || null,
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

