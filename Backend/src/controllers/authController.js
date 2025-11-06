/**
 * @file authController.js
 * @description Kimlik doğrulama (authentication) controller'ı - HTTP isteklerini işler ve authService ile iletişim kurar.
 * Bu controller, authentication endpoint'lerini yönetir ve kullanıcı kayıt/giriş işlemlerini koordine eder.
 * 
 * Ana İşlevler:
 * - Kullanıcı kayıt işlemleri (role'e göre otomatik profil oluşturma)
 * - Unified login (tüm roller için tek endpoint)
 * - Token yenileme ve çıkış işlemleri
 * - Şifre değiştirme
 * - Kullanıcı bilgilerini getirme
 * - Token doğrulama
 * 
 * Endpoint'ler:
 * - POST /api/auth/register - Kullanıcı kaydı
 * - POST /api/auth/login - Kullanıcı girişi
 * - POST /api/auth/refresh - Token yenileme
 * - POST /api/auth/logout - Çıkış
 * - POST /api/auth/logout-all - Tüm cihazlardan çıkış
 * - POST /api/auth/change-password - Şifre değiştirme
 * - GET /api/auth/me - Kullanıcı bilgileri
 * - POST /api/auth/verify-token - Token doğrulama
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ==================== DEPENDENCIES ====================
const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const LogService = require('../services/logService');
const { db } = require('../config/dbConfig');
const { generateAccessToken, generateRefreshToken, createRefreshTokenRecord, revokeRefreshTokenByValue, revokeAllUserTokens } = require('../utils/jwtUtils');
const { sendSuccess, sendCreated } = require('../utils/response');
const { AppError, catchAsync } = require('../utils/errorHandler');
const logger = require('../utils/logger');
// ==================== END DEPENDENCIES ====================

// ==================== REGISTRATION FUNCTIONS ====================

/**
 * Doktor kayıt işlemi
 * @description Yeni doktor kullanıcısı kaydı yapar ve doctor_profiles tablosunda profil oluşturur
 * @param {object} req - Express request objesi
 * @param {object} req.body - Request body
 * @param {string} req.body.email - Doktorun e-posta adresi
 * @param {string} req.body.password - Doktorun şifresi
 * @param {string} req.body.first_name - Doktorun adı
 * @param {string} req.body.last_name - Doktorun soyadı
 * @param {string} req.body.title - Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * @param {number} req.body.specialty_id - Branş (lookup'tan id)
 * @param {number} [req.body.subspecialty_id] - Yan dal (lookup'tan id)
 * @param {string} req.body.region - Bölge (ist_avrupa, ist_anadolu, ankara, izmir, diger, yurtdisi)
 * @param {string} req.body.profile_photo - Profil fotoğrafı (zorunlu)
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * @throws {AppError} E-posta zaten kayıtlı, validasyon hatası
 * 
 * @example
 * POST /api/auth/registerDoctor
 * {
 *   "email": "doctor@example.com",
 *   "password": "Password123!",
 *   "first_name": "Ahmet",
 *   "last_name": "Yılmaz",
 *   "title": "Dr",
 *   "specialty_id": 1,
 *   "subspecialty_id": 2,
 *   "region": "ist_avrupa",
 *   "profile_photo": "/uploads/photo.jpg"
 * }
 */
const registerDoctor = catchAsync(async (req, res) => {
  const { email, password, first_name, last_name, title, specialty_id, subspecialty_id, region, profile_photo } = req.body;

  logger.info(`Doctor registration request received`, { 
    email, 
    hasPassword: !!password, 
    first_name, 
    last_name,
    title,
    specialty_id,
    subspecialty_id,
    region,
    hasProfilePhoto: !!profile_photo
  });

  try {
    // AuthService ile doktor kaydı yap
    const result = await authService.registerDoctor({
      email,
      password,
      first_name,
      last_name,
      title,
      specialty_id,
      subspecialty_id,
      region,
      profile_photo
    });

    logger.info(`New doctor registered successfully: ${email}`);

    // Audit log kaydet
    await LogService.createAuditLog({
      actorId: result.user.id,
      actorRole: result.user.role,
      actorName: `${result.profile.first_name} ${result.profile.last_name}`,
      actorEmail: result.user.email,
      action: 'user.register',
      resourceType: 'doctor',
      resourceId: result.profile.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { 
        email: result.user.email,
        first_name: result.profile.first_name,
        last_name: result.profile.last_name,
        specialty_id
      }
    }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));

    // Security log kaydet
    await LogService.createSecurityLog({
      eventType: 'user_registered',
      severity: 'low',
      message: `Yeni doktor kaydı: ${result.profile.first_name} ${result.profile.last_name}`,
      userId: result.user.id,
      email: result.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { role: 'doctor', specialty_id }
    }).catch(err => logger.error('Security log kayıt hatası', { error: err.message }));

    return sendCreated(res, 'Doktor kaydı başarılı, admin onayı bekleniyor.', {
      user: { 
        id: result.user.id, 
        email: result.user.email, 
        role: result.user.role, 
        is_approved: result.user.is_approved 
      },
      profile: {
        id: result.profile.id,
        first_name: result.profile.first_name,
        last_name: result.profile.last_name,
        title: result.profile.title,
        specialty_id: result.profile.specialty_id,
        subspecialty_id: result.profile.subspecialty_id,
        region: result.profile.region,
        profile_photo: result.profile.profile_photo,
        photo_status: result.profile.photo_status
      }
    }, 201);
  } catch (error) {
    logger.error(`Doctor registration failed for ${email}:`, {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    throw error;
  }
});

/**
 * Hastane kayıt işlemi
 * @description Yeni hastane kullanıcısı kaydı yapar ve hospital_profiles tablosunda profil oluşturur
 * @param {object} req - Express request objesi
 * @param {object} req.body - Request body
 * @param {string} req.body.email - Hastanenin e-posta adresi
 * @param {string} req.body.password - Hastanenin şifresi
 * @param {string} req.body.institution_name - Kurum adı
 * @param {number} req.body.city_id - Şehir ID'si
 * @param {string} req.body.phone - Telefon numarası
 * @param {string} [req.body.address] - Adres
 * @param {string} [req.body.website] - Web sitesi URL'si
 * @param {string} [req.body.about] - Kurum hakkında bilgi
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * @throws {AppError} E-posta zaten kayıtlı, validasyon hatası
 * 
 * @example
 * POST /api/auth/registerHospital
 * {
 *   "email": "hospital@example.com",
 *   "password": "Password123!",
 *   "institution_name": "Acıbadem Hastanesi",
 *   "city_id": 1,
 *   "phone": "+905551234567",
 *   "address": "Kadıköy Mahallesi, Acıbadem Caddesi No:1"
 * }
 */
const registerHospital = catchAsync(async (req, res) => {
  const { email, password, institution_name, city_id, phone, address, website, about, logo } = req.body;

  logger.info(`Hospital registration request received`, { 
    email, 
    hasPassword: !!password, 
    institution_name,
    city_id,
    phone,
    hasLogo: !!logo
  });

  try {
    // AuthService ile hastane kaydı yap
    const result = await authService.registerHospital({
      email,
      password,
      institution_name,
      city_id,
      phone,
      address,
      website,
      about,
      logo
    });

    logger.info(`New hospital registered successfully: ${email}`);

    // Audit log kaydet
    await LogService.createAuditLog({
      actorId: result.user.id,
      actorRole: result.user.role,
      actorName: result.profile.institution_name,
      actorEmail: result.user.email,
      action: 'user.register',
      resourceType: 'hospital',
      resourceId: result.profile.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { 
        email: result.user.email,
        institution_name: result.profile.institution_name,
        city_id
      }
    }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));

    // Security log kaydet
    await LogService.createSecurityLog({
      eventType: 'user_registered',
      severity: 'low',
      message: `Yeni hastane kaydı: ${result.profile.institution_name}`,
      userId: result.user.id,
      email: result.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { role: 'hospital', city_id }
    }).catch(err => logger.error('Security log kayıt hatası', { error: err.message }));

    return sendCreated(res, 'Hastane kaydı başarılı, admin onayı bekleniyor.', {
      user: { 
        id: result.user.id, 
        email: result.user.email, 
        role: result.user.role, 
        is_approved: result.user.is_approved 
      },
      profile: {
        id: result.profile.id,
        institution_name: result.profile.institution_name
      }
    }, 201);
  } catch (error) {
    logger.error(`Hospital registration failed for ${email}:`, {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    throw error;
  }
});

// ==================== END REGISTRATION FUNCTIONS ====================





// ==================== LOGIN FUNCTIONS ====================

/**
 * Unified login - herhangi bir role ile giriş
 * @description Tüm kullanıcı rolleri (admin, doctor, hospital) için tek giriş endpoint'i
 * @param {object} req - Express request objesi
 * @param {object} req.body - Request body
 * @param {string} req.body.email - Kullanıcının e-posta adresi
 * @param {string} req.body.password - Kullanıcının şifresi
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * @throws {AppError} Geçersiz kimlik bilgileri, hesap durumu
 * 
 * İşlem Adımları:
 * 1. Kimlik bilgilerini doğrula
 * 2. Access token oluştur
 * 3. Refresh token oluştur
 * 4. Refresh token'ı veritabanına kaydet
 * 5. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "doctor@example.com",
 *   "password": "Password123!"
 * }
 */
const loginUnified = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  // Kimlik bilgilerini doğrula (req nesnesini geç - failed login logging için)
  const user = await authService.loginUnified(email, password, req);

  // Token'ları oluştur
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, isApproved: user.is_approved });
  const refreshToken = generateRefreshToken({ userId: user.id });
  
  // Refresh token'ı veritabanına kaydet
  await createRefreshTokenRecord(user.id, refreshToken, req.get('User-Agent'), req.ip);

  logger.info(`User logged in: ${email} (${user.role})`);

  // Kullanıcı bilgilerini al (audit log için)
  const userInfo = await LogService.getUserInfoForAudit(user.id, user.role).catch(() => ({ name: null, email: user.email }));

  // Audit log kaydet
  await LogService.createAuditLog({
    actorId: user.id,
    actorRole: user.role,
    actorName: userInfo.name,
    actorEmail: userInfo.email || email,
    action: 'user.login',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { approved: user.is_approved, active: user.is_active }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));

  // Security log kaydet (başarılı giriş)
  await LogService.createSecurityLog({
    eventType: 'login_success',
    severity: 'low',
    message: `Kullanıcı başarıyla giriş yaptı: ${email}`,
    userId: user.id,
    email: email,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { role: user.role }
  }).catch(err => logger.error('Security log kayıt hatası', { error: err.message }));

  return sendSuccess(res, 'Giriş başarılı', {
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      is_approved: user.is_approved,
      is_active: user.is_active,
      profile: user.profile
    },
    tokens: { accessToken, refreshToken }
  });
});
// ==================== END LOGIN FUNCTIONS ====================

// ==================== TOKEN MANAGEMENT FUNCTIONS ====================

/**
 * Token yenile
 * @description Süresi dolmuş access token'ı refresh token ile yeniler
 * @param {object} req - Express request objesi
 * @param {object} req.body - Request body
 * @param {string} req.body.refreshToken - Yenileme token'ı
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * @throws {AppError} Geçersiz refresh token
 * 
 * İşlem Adımları:
 * 1. Refresh token'ı doğrula
 * 2. Yeni access token oluştur
 * 3. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/refresh
 * {
 *   "refreshToken": "refresh_token_string"
 * }
 */
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  
  // AuthService ile token yenileme işlemi
  const result = await authService.refreshToken(token);
  
  return sendSuccess(res, 'Token yenilendi', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user
  });
});

/**
 * Çıkış yap (tek cihaz)
 * @description Kullanıcının belirli bir refresh token'ını geçersiz kılar
 * @param {object} req - Express request objesi
 * @param {object} req.body - Request body
 * @param {string} req.body.refreshToken - Geçersiz kılınacak refresh token
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * 
 * @example
 * POST /api/auth/logout
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  
  // AuthService ile çıkış işlemi (tek cihaz)
  await authService.logout(refreshToken);

  // Audit log kaydet (eğer req.user varsa - authMiddleware'den geçtiyse)
  if (req.user) {
    const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: null, email: req.user.email }));
    
    await LogService.createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: userInfo.name,
      actorEmail: userInfo.email,
      action: 'user.logout',
      resourceType: 'user',
      resourceId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  }

  return sendSuccess(res, 'Çıkış yapıldı');
});

/**
 * Tüm cihazlardan çıkış yap
 * @description Kullanıcının tüm refresh token'larını geçersiz kılar
 * @param {object} req - Express request objesi (authMiddleware ile gelen user bilgisi)
 * @param {object} req.user - Kimlik doğrulanmış kullanıcı bilgileri
 * @param {number} req.user.id - Kullanıcının ID'si
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * 
 * @example
 * POST /api/auth/logout-all
 * Headers: Authorization: Bearer <access_token>
 */
const logoutAll = catchAsync(async (req, res) => {
  // AuthService ile tüm cihazlardan çıkış işlemi
  await authService.logoutAll(req.user.id);

  logger.info(`User logged out from all devices: ${req.user.email}`);

  // Kullanıcı bilgilerini al (audit log için)
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: null, email: req.user.email }));

  // Audit log kaydet
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name,
    actorEmail: userInfo.email,
    action: 'user.logout_all',
    resourceType: 'user',
    resourceId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));

  // Security log kaydet (güvenlik nedeniyle tüm cihazlardan çıkış)
  await LogService.createSecurityLog({
    eventType: 'logout_all_devices',
    severity: 'medium',
    message: `Kullanıcı tüm cihazlardan çıkış yaptı: ${req.user.email}`,
    userId: req.user.id,
    email: req.user.email,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  }).catch(err => logger.error('Security log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, 'Tüm cihazlardan çıkış yapıldı');
});
// ==================== END TOKEN MANAGEMENT FUNCTIONS ====================


// ==================== PASSWORD MANAGEMENT FUNCTIONS ====================

/**
 * Şifre değiştir
 * @description Kimlik doğrulanmış kullanıcının şifresini değiştirir
 * @param {object} req - Express request objesi (authMiddleware ile gelen user bilgisi)
 * @param {object} req.user - Kimlik doğrulanmış kullanıcı bilgileri
 * @param {number} req.user.id - Kullanıcının ID'si
 * @param {object} req.body - Request body
 * @param {string} req.body.currentPassword - Mevcut şifre
 * @param {string} req.body.newPassword - Yeni şifre
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * @throws {AppError} Kullanıcı bulunamadı, mevcut şifre yanlış
 * 
 * İşlem Adımları:
 * 1. Kullanıcıyı veritabanından getir
 * 2. Mevcut şifreyi doğrula
 * 3. Yeni şifreyi hash'le
 * 4. Şifreyi güncelle
 * 5. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/change-password
 * Headers: Authorization: Bearer <access_token>
 * {
 *   "currentPassword": "OldPassword123!",
 *   "newPassword": "NewPassword123!",
 *   "confirmPassword": "NewPassword123!"
 * }
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Kullanıcıyı veritabanından getir
  const user = await db('users').where('id', req.user.id).first();
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

  logger.info(`Password changed for user: ${user.email}`);
  
  return sendSuccess(res, 'Şifre başarıyla değiştirildi');
});
// ==================== END PASSWORD MANAGEMENT FUNCTIONS ====================

// ==================== USER INFO FUNCTIONS ====================

/**
 * Kullanıcı bilgilerini getir
 * @description Kimlik doğrulanmış kullanıcının temel bilgilerini döndürür
 * @param {object} req - Express request objesi (authMiddleware ile gelen user bilgisi)
 * @param {object} req.user - Kimlik doğrulanmış kullanıcı bilgileri
 * @param {number} req.user.id - Kullanıcının ID'si
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * @throws {AppError} Kullanıcı bulunamadı
 * 
 * Döndürülen Bilgiler:
 * - id: Kullanıcı ID'si
 * - email: E-posta adresi
 * - role: Kullanıcı rolü
 * - is_approved: Onay durumu
 * - is_active: Aktiflik durumu
 * - created_at: Kayıt tarihi
 * - last_login: Son giriş tarihi
 * 
 * @example
 * GET /api/auth/me
 * Headers: Authorization: Bearer <access_token>
 */
const getMe = catchAsync(async (req, res) => {
  // Kullanıcıyı veritabanından getir
  const user = await db('users').where('id', req.user.id).first();
  if (!user) throw new AppError('Kullanıcı bulunamadı', 404);

  // Kullanıcının profil bilgilerini al (doctor veya hospital için)
  let profileData = null;
  if (user.role === 'doctor') {
    const doctorProfile = await db('doctor_profiles').where('user_id', user.id).first();
    if (doctorProfile) {
      profileData = {
        first_name: doctorProfile.first_name,
        last_name: doctorProfile.last_name
      };
    }
  } else if (user.role === 'hospital') {
    const hospitalProfile = await db('hospital_profiles').where('user_id', user.id).first();
    if (hospitalProfile) {
      profileData = {
        first_name: hospitalProfile.institution_name, // Hospital için institution_name alanını first_name olarak kullan
        last_name: null
      };
    }
  }

  return sendSuccess(res, 'Kullanıcı bilgileri getirildi', {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_approved: user.is_approved,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
      first_name: profileData?.first_name || null,
      last_name: profileData?.last_name || null
    }
  });
});

/**
 * Token doğrula
 * @description Access token'ın geçerliliğini kontrol eder
 * @param {object} req - Express request objesi (authMiddleware ile gelen user bilgisi)
 * @param {object} req.user - Kimlik doğrulanmış kullanıcı bilgileri
 * @param {number} req.user.id - Kullanıcının ID'si
 * @param {string} req.user.role - Kullanıcının rolü
 * @param {object} res - Express response objesi
 * @returns {Promise<void>} HTTP response
 * 
 * Bu endpoint genellikle frontend'de token'ın geçerliliğini kontrol etmek için kullanılır.
 * 
 * @example
 * POST /api/auth/verify-token
 * Headers: Authorization: Bearer <access_token>
 */
const verifyToken = catchAsync(async (req, res) => {
  return sendSuccess(res, 'Token geçerli', {
    user: { id: req.user.id, role: req.user.role }
  });
});
// ==================== END USER INFO FUNCTIONS ====================

// ==================== MODULE EXPORTS ====================
/**
 * AuthController modülü export'ları
 * @description Tüm authentication controller fonksiyonlarını dışa aktarır
 */
module.exports = {
  // Registration Functions
  registerDoctor,
  registerHospital,
  
  // Login Functions
  loginUnified,
  
  // Token Management Functions
  refreshToken,
  logout,
  logoutAll,
  
  // Password Management Functions
  changePassword,
  
  // User Info Functions
  getMe,
  verifyToken
};
// ==================== END MODULE EXPORTS ====================
