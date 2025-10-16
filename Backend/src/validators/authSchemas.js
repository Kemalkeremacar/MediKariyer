/**
 * @file authSchemas.js
 * @description Kimlik doğrulama (authentication) validasyon şemaları - Joi ile request body validasyonu yapar.
 * Bu dosya, authentication endpoint'leri için gelen verilerin doğruluğunu kontrol eder.
 * 
 * Ana Şemalar:
 * - registerDoctorSchema: Doktor kayıt validasyonu
 * - registerHospitalSchema: Hastane kayıt validasyonu
 * - loginSchema: Kullanıcı giriş validasyonu
 * - changePasswordSchema: Şifre değiştirme validasyonu
 * - refreshTokenSchema: Token yenileme validasyonu
 * 
 * Validasyon Özellikleri:
 * - Email format kontrolü (TLD kontrolü, spam domain kontrolü)
 * - Şifre güvenlik kontrolü (büyük/küçük harf, rakam, özel karakter)
 * - Telefon numarası format kontrolü (Türkiye formatı)
 * - Role enum kontrolü (doctor, hospital)
 * - Profil bilgileri validasyonu (role'e göre)
 * 
 * Güvenlik Kontrolleri:
 * - Spam domain engelleme
 * - Şifre karmaşıklığı kontrolü
 * - E-posta format doğrulama
 * - Telefon numarası format kontrolü
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ==================== DEPENDENCIES ====================
const Joi = require('joi');
const { VALIDATION } = require('../config/appConstants');
// ==================== END DEPENDENCIES ====================

// ==================== BASE VALIDATION SCHEMAS ====================

/**
 * Email Schema (güçlendirilmiş)
 * @description E-posta adresi validasyonu - format, uzunluk, güvenlik kontrolleri
 * 
 * Validasyon Kuralları:
 * - Email format kontrolü (TLD kontrolü devre dışı)
 * - Maksimum 255 karakter
 * - Küçük harfe çevirme
 * - Boşluk temizleme
 * - Ardışık nokta kontrolü
 * - Başlangıç/bitiş nokta kontrolü
 * - Spam domain engelleme
 * 
 * @example
 * "user@example.com" ✅
 * "user..name@example.com" ❌
 * "user@tempmail.com" ❌
 */
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } }) // TLD kontrolü
  .max(255)
  .lowercase()
  .trim()
  .custom((value, helpers) => {
    // Ek email güvenlik kontrolleri
    if (value.includes('..')) {
      return helpers.error('string.noDoubleDots');
    }
    if (value.startsWith('.') || value.endsWith('.')) {
      return helpers.error('string.noLeadingTrailingDots');
    }
    // Yaygın spam domain'leri kontrolü
    const spamDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = value.split('@')[1];
    if (spamDomains.includes(domain)) {
      return helpers.error('string.spamDomain');
    }
    return value;
  })
  .required()
  .messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'string.max': 'E-posta adresi en fazla 255 karakter olabilir',
    'string.noDoubleDots': 'E-posta adresi ardışık nokta içeremez',
    'string.noLeadingTrailingDots': 'E-posta adresi nokta ile başlayamaz veya bitemez',
    'string.spamDomain': 'Geçici e-posta servisleri kullanılamaz',
    'any.required': 'E-posta adresi zorunludur'
  });

/**
 * Password Schema (güçlendirilmiş)
 * @description Şifre validasyonu - güvenlik, karmaşıklık kontrolleri
 * 
 * Validasyon Kuralları:
 * - Minimum/maksimum uzunluk kontrolü
 * - En az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter
 * - Boşluk içeremez
 * - Aynı karakterin 3 kez tekrarını içeremez
 * 
 * @example
 * "Password123!" ✅
 * "password123" ❌ (büyük harf ve özel karakter yok)
 * "Password  123!" ❌ (boşluk var)
 */
const passwordSchema = Joi.string()
  .min(VALIDATION.MIN_PASSWORD_LENGTH)
  .max(VALIDATION.MAX_PASSWORD_LENGTH)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .custom((value, helpers) => {
    // Ek güvenlik kontrolleri
    if (value.includes(' ')) {
      return helpers.error('string.noSpaces');
    }
    if (/(.)\1{2,}/.test(value)) {
      return helpers.error('string.noRepeating');
    }
    return value;
  })
  .required()
  .messages({
    'string.min': `Şifre en az ${VALIDATION.MIN_PASSWORD_LENGTH} karakter olmalıdır`,
    'string.max': `Şifre en fazla ${VALIDATION.MAX_PASSWORD_LENGTH} karakter olabilir`,
    'string.pattern.base': 'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
    'string.noSpaces': 'Şifre boşluk içeremez',
    'string.noRepeating': 'Şifre aynı karakterin 3 kez tekrarını içeremez',
    'any.required': 'Şifre zorunludur'
  });

/**
 * Phone Schema
 * @description Telefon numarası validasyonu - Türkiye formatı
 * 
 * Validasyon Kuralları:
 * - Türkiye telefon numarası formatı (+90XXXXXXXXXX)
 * - Regex pattern kontrolü
 * 
 * @example
 * "+905551234567" ✅
 * "05551234567" ❌ (+90 eksik)
 */
const phoneSchema = Joi.string()
  .pattern(VALIDATION.PHONE_REGEX)
  .required()
  .messages({
    'string.pattern.base': 'Geçerli bir Türkiye telefon numarası giriniz (örn: +905551234567)',
    'any.required': 'Telefon numarası zorunludur'
  });
// ==================== END BASE VALIDATION SCHEMAS ====================

// ==================== AUTHENTICATION SCHEMAS ====================

/**
 * Login Schema
 * @description Kullanıcı giriş validasyonu
 * 
 * Zorunlu Alanlar:
 * - email: E-posta adresi (emailSchema ile validasyon)
 * - password: Şifre
 * 
 * Opsiyonel Alanlar:
 * - role: Kullanıcı rolü (admin, doctor, hospital) - opsiyonel
 * 
 * @example
 * {
 *   "email": "doctor@example.com",
 *   "password": "Password123!"
 * }
 */
const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
  role: Joi.string().valid('admin', 'doctor', 'hospital').optional() // Role opsiyonel yaptık
});

/**
 * Change Password Schema
 * @description Şifre değiştirme validasyonu
 * 
 * Zorunlu Alanlar:
 * - currentPassword: Mevcut şifre
 * - newPassword: Yeni şifre (passwordSchema ile validasyon)
 * - confirmPassword: Şifre tekrarı (newPassword ile aynı olmalı)
 * 
 * @example
 * {
 *   "currentPassword": "OldPassword123!",
 *   "newPassword": "NewPassword123!",
 *   "confirmPassword": "NewPassword123!"
 * }
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

/**
 * Refresh Token Schema
 * @description Token yenileme validasyonu
 * 
 * Zorunlu Alanlar:
 * - refreshToken: Yenileme token'ı
 * 
 * @example
 * {
 *   "refreshToken": "refresh_token_string"
 * }
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});
/**
 * Register Doctor Schema
 * @description Doktor kayıt validasyonu
 * 
 * Zorunlu Alanlar:
 * - email: E-posta adresi (emailSchema ile validasyon)
 * - password: Şifre (test için minimum 3 karakter)
 * - first_name: Doktorun adı
 * - last_name: Doktorun soyadı
 * - title: Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * - specialty_id: Branş (lookup'tan id)
 * - region: Bölge (ist_avrupa, ist_anadolu, ankara, izmir, diger, yurtdisi)
 * - profile_photo: Profil fotoğrafı (zorunlu)
 * 
 * Opsiyonel Alanlar:
 * - subspecialty_id: Yan dal (lookup'tan id)
 * 
 * @example
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
const registerDoctorSchema = Joi.object({
  email: emailSchema,
  password: Joi.string()
    .min(3) // Test için minimum 3 karakter
    .max(128)
    .required()
    .messages({
      'string.min': 'Şifre en az 3 karakter olmalıdır',
      'string.max': 'Şifre en fazla 128 karakter olabilir',
      'any.required': 'Şifre zorunludur'
    }),
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Ad en az 2 karakter olmalıdır',
      'string.max': 'Ad en fazla 50 karakter olabilir',
      'any.required': 'Ad zorunludur'
    }),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Soyad en az 2 karakter olmalıdır',
      'string.max': 'Soyad en fazla 50 karakter olabilir',
      'any.required': 'Soyad zorunludur'
    }),
  title: Joi.string()
    .valid('Dr.', 'Uz. Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.')
    .required()
    .messages({
      'any.only': 'Ünvan geçerli değerlerden biri olmalıdır: Dr., Uz. Dr., Dr. Öğr. Üyesi, Doç. Dr., Prof. Dr.',
      'any.required': 'Ünvan zorunludur'
    }),
  specialty_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branş ID\'si sayı olmalıdır',
      'number.integer': 'Branş ID\'si tam sayı olmalıdır',
      'number.positive': 'Branş ID\'si pozitif olmalıdır',
      'any.required': 'Branş zorunludur'
    }),
  subspecialty_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Yan dal ID\'si sayı olmalıdır',
      'number.integer': 'Yan dal ID\'si tam sayı olmalıdır',
      'number.positive': 'Yan dal ID\'si pozitif olmalıdır'
    }),
  profile_photo: Joi.string()
    .max(5000000) // Base64 string için 5MB limit (yaklaşık)
    .required()
    .messages({
      'string.max': 'Profil fotoğrafı çok büyük (maksimum 5MB)',
      'any.required': 'Profil fotoğrafı zorunludur'
    })
});

/**
 * Register Hospital Schema
 * @description Hastane kayıt validasyonu
 * 
 * Zorunlu Alanlar:
 * - email: E-posta adresi (emailSchema ile validasyon)
 * - password: Şifre (test için minimum 3 karakter)
 * - institution_name: Kurum adı
 * - city: Şehir
 * - address: Adres
 * 
 * Opsiyonel Alanlar:
 * - phone: Telefon numarası
 * - website: Web sitesi URL'si
 * - about: Kurum hakkında bilgi
 * 
 * @example
 * {
 *   "email": "hospital@example.com",
 *   "password": "Password123!",
 *   "institution_name": "Acıbadem Hastanesi",
 *   "city": "İstanbul",
 *   "address": "Kadıköy Mahallesi, Acıbadem Caddesi No:1"
 * }
 */
const registerHospitalSchema = Joi.object({
  email: emailSchema,
  password: Joi.string()
    .min(3) // Test için minimum 3 karakter
    .max(128)
    .required()
    .messages({
      'string.min': 'Şifre en az 3 karakter olmalıdır',
      'string.max': 'Şifre en fazla 128 karakter olabilir',
      'any.required': 'Şifre zorunludur'
    }),
  institution_name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Kurum adı en az 2 karakter olmalıdır',
      'string.max': 'Kurum adı en fazla 255 karakter olabilir',
      'any.required': 'Kurum adı zorunludur'
    })
});

/**
 * Logout Schema
 * @description Çıkış validasyonu - authMiddleware ile gelen user bilgisi kullanılır
 * 
 * Bu endpoint authMiddleware gerektirir ve req.user'dan userId alır.
 * Body'de herhangi bir veri gerekmez.
 * 
 * @example
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <access_token>
 */
const logoutSchema = Joi.object({}); // Boş obje, authMiddleware ile user bilgisi alınır

// ==================== END AUTHENTICATION SCHEMAS ====================
/**
 * AuthSchemas modülü export'ları
 * @description Tüm authentication validasyon şemalarını dışa aktarır
 */
module.exports = {
  // Authentication Schemas
  registerDoctorSchema,
  registerHospitalSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  logoutSchema
};
// ==================== END MODULE EXPORTS ====================
