/**
 * @file mobileSchemas.js
 * @description Mobile API validasyon şemaları - Mobil uygulama için Joi validation şemaları.
 * Bu dosya, mobile endpoint'leri için gelen verilerin doğruluğunu kontrol eder.
 * 
 * Ana Şemalar:
 * - mobileLoginSchema: Mobil login validasyonu
 * - mobileRefreshTokenSchema: Token yenileme validasyonu
 * - mobileLogoutSchema: Logout validasyonu
 * - mobileCreateApplicationSchema: Başvuru oluşturma validasyonu
 * - mobileDeviceTokenSchema: Device token registration validasyonu
 * - mobileJobsQuerySchema: Jobs query parametreleri validasyonu
 * - mobileApplicationsQuerySchema: Applications query parametreleri validasyonu
 * - mobileNotificationsQuerySchema: Notifications query parametreleri validasyonu
 * 
 * Validasyon Özellikleri:
 * - Email format kontrolü
 * - Password güvenlik kontrolü (MVP için minimal)
 * - Pagination validation (page, limit)
 * - Query parameter validation (filters, status)
 * - Params validation (ID'ler)
 * 
 * Güvenlik Kontrolleri:
 * - Input sanitization
 * - Type validation
 * - Range validation (min/max)
 * - Enum validation
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const Joi = require('joi');

// ============================================================================
// BASE SCHEMAS (Reuse from authSchemas if needed)
// ============================================================================

// ==================== BASE SCHEMAS (Reuse from authSchemas if needed) ====================

/**
 * Email Schema (minimal - mobile için)
 */
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(255)
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'string.max': 'E-posta adresi en fazla 255 karakter olabilir',
    'any.required': 'E-posta adresi zorunludur'
  });

/**
 * Password Schema (minimal - mobile için)
 */
const passwordSchema = Joi.string()
  .min(3) // MVP için minimal (production'da güçlendirilebilir)
  .max(128)
  .required()
  .messages({
    'string.min': 'Şifre en az 3 karakter olmalıdır',
    'string.max': 'Şifre en fazla 128 karakter olabilir',
    'any.required': 'Şifre zorunludur'
  });

// ==================== MOBILE AUTH SCHEMAS ====================

/**
 * Mobile Login Schema
 * @description Mobile login endpoint için validasyon
 */
const mobileLoginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema
});

/**
 * Mobile Refresh Token Schema
 * @description Mobile refresh token endpoint için validasyon
 */
const mobileRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token zorunludur'
  })
});

/**
 * Mobile Logout Schema
 * @description Mobile logout endpoint için validasyon
 */
const mobileLogoutSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token zorunludur'
  })
});

// ==================== MOBILE APPLICATION SCHEMAS ====================

/**
 * Mobile Create Application Schema
 * @description Mobile application create endpoint için validasyon
 */
const mobileCreateApplicationSchema = Joi.object({
  job_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Job ID sayı olmalıdır',
    'number.integer': 'Job ID tam sayı olmalıdır',
    'number.positive': 'Job ID pozitif bir sayı olmalıdır',
    'any.required': 'Job ID zorunludur'
  }),
  cover_letter: Joi.string().max(2000).allow(null, '').optional().messages({
    'string.max': 'Ön yazı en fazla 2000 karakter olabilir'
  })
});

// ==================== MOBILE DEVICE TOKEN SCHEMAS ====================

/**
 * Mobile Device Token Schema
 * @description Mobile device token registration için validasyon
 */
const mobileDeviceTokenSchema = Joi.object({
  expo_push_token: Joi.string().pattern(/^ExponentPushToken\[.+\]$/).required().messages({
    'string.pattern.base': 'Geçerli bir Expo Push token formatı giriniz',
    'any.required': 'Expo Push token zorunludur'
  }),
  device_id: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Device ID en az 1 karakter olmalıdır',
    'string.max': 'Device ID en fazla 255 karakter olabilir',
    'any.required': 'Device ID zorunludur'
  }),
  platform: Joi.string().valid('ios', 'android').required().messages({
    'any.only': 'Platform ios veya android olmalıdır',
    'any.required': 'Platform zorunludur'
  }),
  app_version: Joi.string().max(50).allow(null, '').optional()
});

// ==================== MOBILE QUERY SCHEMAS ====================

/**
 * Pagination Query Schema
 * @description Pagination için query parametreleri validasyonu
 */
const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Sayfa numarası sayı olmalıdır',
    'number.integer': 'Sayfa numarası tam sayı olmalıdır',
    'number.min': 'Sayfa numarası en az 1 olmalıdır'
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit sayı olmalıdır',
    'number.integer': 'Limit tam sayı olmalıdır',
    'number.min': 'Limit en az 1 olmalıdır',
    'number.max': 'Limit en fazla 100 olabilir'
  })
});

/**
 * Mobile Jobs Query Schema
 * @description Jobs listesi için query parametreleri validasyonu
 */
const mobileJobsQuerySchema = paginationQuerySchema.keys({
  specialty_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Specialty ID sayı olmalıdır',
    'number.integer': 'Specialty ID tam sayı olmalıdır',
    'number.positive': 'Specialty ID pozitif bir sayı olmalıdır'
  }),
  city_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'City ID sayı olmalıdır',
    'number.integer': 'City ID tam sayı olmalıdır',
    'number.positive': 'City ID pozitif bir sayı olmalıdır'
  }),
  work_type: Joi.string().valid('tam_zamanli', 'yari_zamanli', 'nobet').optional().messages({
    'any.only': 'Work type tam_zamanli, yari_zamanli veya nobet olmalıdır'
  }),
  search: Joi.string().max(100).trim().optional().messages({
    'string.max': 'Arama terimi en fazla 100 karakter olabilir'
  })
});

/**
 * Mobile Applications Query Schema
 * @description Applications listesi için query parametreleri validasyonu
 */
const mobileApplicationsQuerySchema = paginationQuerySchema.keys({
  status_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Status ID sayı olmalıdır',
    'number.integer': 'Status ID tam sayı olmalıdır',
    'number.positive': 'Status ID pozitif bir sayı olmalıdır'
  }),
  status: Joi.string().valid('pending', 'reviewing', 'approved', 'rejected', 'withdrawn').optional().messages({
    'any.only': 'Status pending, reviewing, approved, rejected veya withdrawn olmalıdır'
  })
});

/**
 * Mobile Notifications Query Schema
 * @description Notifications listesi için query parametreleri validasyonu
 */
const mobileNotificationsQuerySchema = paginationQuerySchema.keys({
  is_read: Joi.boolean().optional().messages({
    'boolean.base': 'is_read true veya false olmalıdır'
  }),
  type: Joi.string().valid('info', 'success', 'warning', 'error').optional().messages({
    'any.only': 'Type info, success, warning veya error olmalıdır'
  })
});

/**
 * Mobile Job Detail Params Schema
 * @description Job detail için params validasyonu
 */
const mobileJobDetailParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Job ID sayı olmalıdır',
    'number.integer': 'Job ID tam sayı olmalıdır',
    'number.positive': 'Job ID pozitif bir sayı olmalıdır',
    'any.required': 'Job ID zorunludur'
  })
});

/**
 * Mobile Application Detail Params Schema
 * @description Application detail için params validasyonu
 */
const mobileApplicationDetailParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Application ID sayı olmalıdır',
    'number.integer': 'Application ID tam sayı olmalıdır',
    'number.positive': 'Application ID pozitif bir sayı olmalıdır',
    'any.required': 'Application ID zorunludur'
  })
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Auth
  mobileLoginSchema,
  mobileRefreshTokenSchema,
  mobileLogoutSchema,
  
  // Applications
  mobileCreateApplicationSchema,
  
  // Device Token
  mobileDeviceTokenSchema,
  
  // Query Schemas
  paginationQuerySchema,
  mobileJobsQuerySchema,
  mobileApplicationsQuerySchema,
  mobileNotificationsQuerySchema,
  
  // Params Schemas
  mobileJobDetailParamsSchema,
  mobileApplicationDetailParamsSchema
};

