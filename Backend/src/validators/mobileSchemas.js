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
 * Mobile Register Doctor Schema
 * @description Mobile doktor kayıt endpoint için validasyon
 */
const mobileRegisterDoctorSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 100 karakter olabilir',
    'any.required': 'Ad zorunludur'
  }),
  last_name: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 100 karakter olabilir',
    'any.required': 'Soyad zorunludur'
  }),
  title: Joi.string().valid('Dr', 'Uz.Dr', 'Dr.Öğr.Üyesi', 'Doç.Dr', 'Prof.Dr').required().messages({
    'any.only': 'Ünvan Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr veya Prof.Dr olmalıdır',
    'any.required': 'Ünvan zorunludur'
  }),
  specialty_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Branş ID sayı olmalıdır',
    'number.integer': 'Branş ID tam sayı olmalıdır',
    'number.positive': 'Branş ID pozitif bir sayı olmalıdır',
    'any.required': 'Branş zorunludur'
  }),
  subspecialty_id: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': 'Yan dal ID sayı olmalıdır',
    'number.integer': 'Yan dal ID tam sayı olmalıdır',
    'number.positive': 'Yan dal ID pozitif bir sayı olmalıdır'
  }),
  profile_photo: Joi.string().max(5000000).required().messages({
    'string.max': 'Profil fotoğrafı çok büyük (max 5MB base64)',
    'any.required': 'Profil fotoğrafı zorunludur'
  })
});

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

/**
 * Mobile Change Password Schema
 * @description Mobile şifre değiştirme endpoint için validasyon
 */
const mobileChangePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Mevcut şifre zorunludur'
  }),
  newPassword: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Şifreler eşleşmiyor',
    'any.required': 'Şifre tekrarı zorunludur'
  })
});

// ==================== MOBILE DOCTOR PROFILE SCHEMAS ====================

/**
 * Mobile Update Personal Info Schema
 * @description Mobile profil güncelleme endpoint için validasyon
 */
const mobileUpdatePersonalInfoSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).trim().optional().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 100 karakter olabilir'
  }),
  last_name: Joi.string().min(2).max(100).trim().optional().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 100 karakter olabilir'
  }),
  title: Joi.string().valid('Dr', 'Uz.Dr', 'Dr.Öğr.Üyesi', 'Doç.Dr', 'Prof.Dr').optional().messages({
    'any.only': 'Ünvan Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr veya Prof.Dr olmalıdır'
  }),
  specialty_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Branş ID sayı olmalıdır',
    'number.integer': 'Branş ID tam sayı olmalıdır',
    'number.positive': 'Branş ID pozitif bir sayı olmalıdır'
  }),
  subspecialty_id: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': 'Yan dal ID sayı olmalıdır',
    'number.integer': 'Yan dal ID tam sayı olmalıdır',
    'number.positive': 'Yan dal ID pozitif bir sayı olmalıdır'
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).max(20).allow(null, '').optional().messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz',
    'string.max': 'Telefon numarası en fazla 20 karakter olabilir'
  }),
  dob: Joi.date().max('now').allow(null).optional().messages({
    'date.max': 'Doğum tarihi bugünden sonra olamaz'
  }),
  birth_place: Joi.string().max(100).allow(null, '').optional().messages({
    'string.max': 'Doğum yeri en fazla 100 karakter olabilir'
  }),
  residence_city: Joi.string().max(100).allow(null, '').optional().messages({
    'string.max': 'İkamet şehri en fazla 100 karakter olabilir'
  })
});

// ==================== MOBILE DOCTOR CRUD SCHEMAS ====================

/**
 * Mobile Education Schema
 * @description Mobile education CRUD endpoint için validasyon
 */
const mobileEducationSchema = Joi.object({
  education_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Eğitim türü ID sayı olmalıdır',
    'number.integer': 'Eğitim türü ID tam sayı olmalıdır',
    'number.positive': 'Eğitim türü ID pozitif bir sayı olmalıdır',
    'any.required': 'Eğitim türü zorunludur'
  }),
  education_type: Joi.string().min(2).max(100).allow('', null).optional().messages({
    'string.min': 'Eğitim türü en az 2 karakter olmalıdır',
    'string.max': 'Eğitim türü en fazla 100 karakter olabilir'
  }),
  education_institution: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Eğitim kurumu en az 2 karakter olmalıdır',
    'string.max': 'Eğitim kurumu en fazla 200 karakter olabilir',
    'any.required': 'Eğitim kurumu zorunludur'
  }),
  field: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Alan adı en az 2 karakter olmalıdır',
    'string.max': 'Alan adı en fazla 100 karakter olabilir',
    'any.required': 'Alan adı zorunludur'
  }),
  graduation_year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 10).required().messages({
    'number.base': 'Mezuniyet yılı sayı olmalıdır',
    'number.integer': 'Mezuniyet yılı tam sayı olmalıdır',
    'number.min': 'Mezuniyet yılı 1950\'den küçük olamaz',
    'number.max': `Mezuniyet yılı ${new Date().getFullYear() + 10}\'dan büyük olamaz`,
    'any.required': 'Mezuniyet yılı zorunludur'
  })
});

/**
 * Mobile Experience Schema
 * @description Mobile experience CRUD endpoint için validasyon
 */
const mobileExperienceSchema = Joi.object({
  organization: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Kurum adı en az 2 karakter olmalıdır',
    'string.max': 'Kurum adı en fazla 200 karakter olabilir',
    'any.required': 'Kurum adı zorunludur'
  }),
  role_title: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Ünvan en az 2 karakter olmalıdır',
    'string.max': 'Ünvan en fazla 100 karakter olabilir',
    'any.required': 'Ünvan zorunludur'
  }),
  specialty_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Uzmanlık alanı ID sayı olmalıdır',
    'number.integer': 'Uzmanlık alanı ID tam sayı olmalıdır',
    'number.positive': 'Uzmanlık alanı ID pozitif bir sayı olmalıdır',
    'any.required': 'Uzmanlık alanı zorunludur'
  }),
  subspecialty_id: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': 'Yan dal uzmanlık ID sayı olmalıdır',
    'number.integer': 'Yan dal uzmanlık ID tam sayı olmalıdır',
    'number.positive': 'Yan dal uzmanlık ID pozitif bir sayı olmalıdır'
  }),
  start_date: Joi.date().required().messages({
    'date.base': 'Başlangıç tarihi geçerli bir tarih olmalıdır',
    'any.required': 'Başlangıç tarihi zorunludur'
  }),
  end_date: Joi.date().allow(null).optional().messages({
    'date.base': 'Bitiş tarihi geçerli bir tarih olmalıdır'
  }),
  is_current: Joi.boolean().default(false).messages({
    'boolean.base': 'Hala çalışıyor mu alanı true veya false olmalıdır'
  }),
  description: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'İş açıklaması en fazla 1000 karakter olabilir'
  })
});

/**
 * Mobile Certificate Schema
 * @description Mobile certificate CRUD endpoint için validasyon
 */
const mobileCertificateSchema = Joi.object({
  certificate_name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Sertifika adı en az 2 karakter olmalıdır',
    'string.max': 'Sertifika adı en fazla 200 karakter olabilir',
    'any.required': 'Sertifika adı zorunludur'
  }),
  institution: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Kurum adı en az 2 karakter olmalıdır',
    'string.max': 'Kurum adı en fazla 200 karakter olabilir',
    'any.required': 'Kurum adı zorunludur'
  }),
  certificate_year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 10).required().messages({
    'number.base': 'Sertifika yılı sayı olmalıdır',
    'number.integer': 'Sertifika yılı tam sayı olmalıdır',
    'number.min': 'Sertifika yılı 1950\'den küçük olamaz',
    'number.max': `Sertifika yılı ${new Date().getFullYear() + 10}\'dan büyük olamaz`,
    'any.required': 'Sertifika yılı zorunludur'
  })
});

/**
 * Mobile Language Schema
 * @description Mobile language CRUD endpoint için validasyon
 */
const mobileLanguageSchema = Joi.object({
  language_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Dil ID sayı olmalıdır',
    'number.integer': 'Dil ID tam sayı olmalıdır',
    'number.positive': 'Dil ID pozitif bir sayı olmalıdır',
    'any.required': 'Dil zorunludur'
  }),
  level_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Dil seviyesi ID sayı olmalıdır',
    'number.integer': 'Dil seviyesi ID tam sayı olmalıdır',
    'number.positive': 'Dil seviyesi ID pozitif bir sayı olmalıdır',
    'any.required': 'Dil seviyesi zorunludur'
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
  employment_type: Joi.string().max(100).optional().messages({
    'string.max': 'Employment type en fazla 100 karakter olabilir'
  }),
  search: Joi.string().max(100).trim().allow('').optional().messages({
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
  status: Joi.string().valid('pending', 'reviewing', 'approved', 'rejected', 'withdrawn', 'Başvuruldu', 'İnceleniyor', 'Kabul Edildi', 'Reddedildi', 'Geri Çekildi').optional().messages({
    'any.only': 'Status geçerli bir başvuru durumu olmalıdır'
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
  jobId: Joi.number().integer().positive().required().messages({
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
  applicationId: Joi.number().integer().positive().required().messages({
    'number.base': 'Application ID sayı olmalıdır',
    'number.integer': 'Application ID tam sayı olmalıdır',
    'number.positive': 'Application ID pozitif bir sayı olmalıdır',
    'any.required': 'Application ID zorunludur'
  })
});

/**
 * Mobile Doctor CRUD Params Schemas
 * @description Doctor CRUD operations için params validasyonu
 */
const mobileEducationParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Education ID sayı olmalıdır',
    'number.integer': 'Education ID tam sayı olmalıdır',
    'number.positive': 'Education ID pozitif bir sayı olmalıdır',
    'any.required': 'Education ID zorunludur'
  })
});

const mobileExperienceParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Experience ID sayı olmalıdır',
    'number.integer': 'Experience ID tam sayı olmalıdır',
    'number.positive': 'Experience ID pozitif bir sayı olmalıdır',
    'any.required': 'Experience ID zorunludur'
  })
});

const mobileCertificateParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Certificate ID sayı olmalıdır',
    'number.integer': 'Certificate ID tam sayı olmalıdır',
    'number.positive': 'Certificate ID pozitif bir sayı olmalıdır',
    'any.required': 'Certificate ID zorunludur'
  })
});

const mobileLanguageParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Language ID sayı olmalıdır',
    'number.integer': 'Language ID tam sayı olmalıdır',
    'number.positive': 'Language ID pozitif bir sayı olmalıdır',
    'any.required': 'Language ID zorunludur'
  })
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Auth
  mobileRegisterDoctorSchema,
  mobileLoginSchema,
  mobileRefreshTokenSchema,
  mobileLogoutSchema,
  mobileChangePasswordSchema,
  
  // Doctor Profile
  mobileUpdatePersonalInfoSchema,
  
  // Doctor CRUD
  mobileEducationSchema,
  mobileExperienceSchema,
  mobileCertificateSchema,
  mobileLanguageSchema,
  
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
  mobileApplicationDetailParamsSchema,
  mobileEducationParamsSchema,
  mobileExperienceParamsSchema,
  mobileCertificateParamsSchema,
  mobileLanguageParamsSchema
};

