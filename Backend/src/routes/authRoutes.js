/**
 * @file authRoutes.js
 * @description Kimlik doğrulama (authentication) route'ları - API endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, authentication ile ilgili tüm HTTP endpoint'lerini içerir ve Swagger dokümantasyonunu sağlar.
 * 
 * Ana Endpoint'ler:
 * - POST /api/auth/registerDoctor - Doktor kayıt işlemi
 * - POST /api/auth/registerHospital - Hastane kayıt işlemi
 * - POST /api/auth/login - Unified login (tüm roller için)
 * - POST /api/auth/refresh - Access token yenileme
 * - POST /api/auth/logout - Çıkış (refresh token iptal)
 * - POST /api/auth/logout-all - Tüm cihazlardan çıkış
 * - POST /api/auth/change-password - Şifre değiştirme
 * - GET /api/auth/me - Kullanıcı bilgileri
 * - POST /api/auth/verify-token - Token doğrulama
 * 
 * Middleware'ler:
 * - validate: Request body validasyonu
 * - authMiddleware: JWT token doğrulama
 * 
 * Güvenlik Özellikleri:
 * - Rate limiting (rateLimiter middleware)
 * - Input validation (Joi schemas)
 * - JWT token authentication
 * - Password hashing (bcrypt)
 * - Refresh token management
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ==================== DEPENDENCIES ====================
const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Validation Schemas
const {
  registerDoctorSchema,
  registerHospitalSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema
} = require('../validators/authSchemas');
// ==================== END DEPENDENCIES ====================

// ==================== ROUTER SETUP ====================
const router = express.Router();
// ==================== END ROUTER SETUP ====================

// ==================== REGISTRATION ROUTES ====================


/**
 * @route   POST /api/auth/registerDoctor
 * @desc    Doktor kayıt işlemi
 * @access  Herkese Açık
 * @middleware validate(registerDoctorSchema, 'body') - Request body validasyonu
 * 
 * İşlem Adımları:
 * 1. Request body validasyonu (email, password, first_name, last_name)
 * 2. E-posta tekrarını kontrol et
 * 3. Şifreyi hash'le
 * 4. Users tablosuna doktor kaydı oluştur
 * 5. Doctor_profiles tablosunda profil oluştur
 * 6. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/registerDoctor
 * {
 *   "email": "doctor@example.com",
 *   "password": "Password123!",
 *   "first_name": "Ahmet",
 *   "last_name": "Yılmaz"
 * }
 */
router.post('/registerDoctor', 
  // authLimiter, // Test için geçici olarak kapatıldı
  validate(registerDoctorSchema, 'body'),
  authController.registerDoctor
);


/**
 * @route   POST /api/auth/registerHospital
 * @desc    Hastane kayıt işlemi
 * @access  Herkese Açık
 * @middleware validate(registerHospitalSchema, 'body') - Request body validasyonu
 * 
 * İşlem Adımları:
 * 1. Request body validasyonu (email, password, institution_name, city, address, phone, website, about)
 * 2. E-posta tekrarını kontrol et
 * 3. Şifreyi hash'le
 * 4. Users tablosuna hastane kaydı oluştur
 * 5. Hospital_profiles tablosunda profil oluştur
 * 6. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/registerHospital
 * {
 *   "email": "hospital@example.com",
 *   "password": "Password123!",
 *   "institution_name": "Acıbadem Hastanesi",
 *   "city": "İstanbul",
 *   "address": "Kadıköy Mahallesi, Acıbadem Caddesi No:1"
 * }
 */
router.post('/registerHospital', 
  // authLimiter, // Test için geçici olarak kapatıldı
  validate(registerHospitalSchema, 'body'),
  authController.registerHospital
);
// ==================== END REGISTRATION ROUTES ====================



// ==================== LOGIN ROUTES ====================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     description: Kullanıcı kimlik doğrulama
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token
 *                         refreshToken:
 *                           type: string
 *                           description: JWT refresh token
 *       401:
 *         description: Kimlik doğrulama hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       429:
 *         description: Rate limit aşıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
/**
 * @route   POST /api/auth/login
 * @desc    Unified login - herhangi bir role
 * @access  Herkese Açık
 * @middleware validate(loginSchema, 'body') - Request body validasyonu
 * 
 * İşlem Adımları:
 * 1. Request body validasyonu (email, password)
 * 2. Kimlik bilgilerini doğrula
 * 3. Access token oluştur
 * 4. Refresh token oluştur
 * 5. Refresh token'ı veritabanına kaydet
 * 6. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "doctor@example.com",
 *   "password": "Password123!"
 * }
 */
router.post('/login', 
  // authLimiter, // Test için geçici olarak kapatıldı
  validate(loginSchema, 'body'),
  authController.loginUnified
);
// ==================== END LOGIN ROUTES ====================

// ==================== TOKEN MANAGEMENT ROUTES ====================

/**
 * @route   POST /api/auth/refresh
 * @desc    Erişim token'ını yenile
 * @access  Herkese Açık
 * @middleware validate(refreshTokenSchema, 'body') - Request body validasyonu
 * 
 * İşlem Adımları:
 * 1. Request body validasyonu (refreshToken)
 * 2. Refresh token'ı doğrula
 * 3. Yeni access token oluştur
 * 4. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/refresh
 * {
 *   "refreshToken": "refresh_token_string"
 * }
 */
router.post('/refresh',
  validate(refreshTokenSchema, 'body'),
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Çıkış yap (belirli refresh token'ı geçersiz kıl)
 * @access  Public (refresh token body'de gönderilir)
 * @middleware validate(logoutSchema, 'body') - Request body validasyonu
 * 
 * İşlem Adımları:
 * 1. Request body validasyonu
 * 2. AuthService ile çıkış işlemi (tek cihaz)
 * 3. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/logout
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
router.post('/logout',
  validate(logoutSchema, 'body'),
  authController.logout
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Tüm cihazlardan çıkış yap (tüm yenileme token'larını geçersiz kıl)
 * @access  Özel (JWT token gerekli)
 * @middleware authMiddleware - JWT token doğrulama
 * 
 * İşlem Adımları:
 * 1. JWT token doğrulama
 * 2. Kullanıcının tüm refresh token'larını iptal et
 * 3. Başarılı response döndür
 * 
 * @example
 * POST /api/auth/logout-all
 * Headers: Authorization: Bearer <access_token>
 */
router.post('/logout-all',
  authMiddleware,
  authController.logoutAll
);
// ==================== END TOKEN MANAGEMENT ROUTES ====================


// ==================== PASSWORD MANAGEMENT ROUTES ====================

/**
 * @route   POST /api/auth/change-password
 * @desc    Şifre değiştir (kimliği doğrulanmış kullanıcı)
 * @access  Özel (JWT token gerekli)
 * @middleware authMiddleware - JWT token doğrulama
 * @middleware validate(changePasswordSchema, 'body') - Request body validasyonu
 * 
 * İşlem Adımları:
 * 1. JWT token doğrulama
 * 2. Request body validasyonu (currentPassword, newPassword, confirmPassword)
 * 3. Kullanıcıyı veritabanından getir
 * 4. Mevcut şifreyi doğrula
 * 5. Yeni şifreyi hash'le ve güncelle
 * 6. Başarılı response döndür
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
router.post('/change-password',
  authMiddleware,
  validate(changePasswordSchema, 'body'),
  authController.changePassword
);
// ==================== END PASSWORD MANAGEMENT ROUTES ====================

// ==================== USER INFO ROUTES ====================

/**
 * @route   GET /api/auth/me
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @access  Özel (JWT token gerekli)
 * @middleware authMiddleware - JWT token doğrulama
 * 
 * İşlem Adımları:
 * 1. JWT token doğrulama
 * 2. Kullanıcıyı veritabanından getir
 * 3. Kullanıcı bilgilerini döndür
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
router.get('/me',
  authMiddleware,
  authController.getMe
);
/**
 * @route   POST /api/auth/verify-token
 * @desc    Token'ın geçerliliğini doğrula
 * @access  Özel (JWT token gerekli)
 * @middleware authMiddleware - JWT token doğrulama
 * 
 * İşlem Adımları:
 * 1. JWT token doğrulama
 * 2. Token geçerliliğini kontrol et
 * 3. Kullanıcı bilgilerini döndür
 * 
 * @example
 * POST /api/auth/verify-token
 * Headers: Authorization: Bearer <access_token>
 */
router.post('/verify-token',
  authMiddleware,
  authController.verifyToken
);
// ==================== END USER INFO ROUTES ====================

// ==================== MODULE EXPORTS ====================
/**
 * AuthRoutes modülü export'ları
 * @description Tüm authentication route'larını dışa aktarır
 */
module.exports = router;
// ==================== END MODULE EXPORTS ====================
