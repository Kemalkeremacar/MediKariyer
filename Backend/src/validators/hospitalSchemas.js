/**
 * @file hospitalSchemas.js
 * @description Hastane validation schemas - Hastane kullanıcıları için veri doğrulama şemalarını içerir.
 * Bu modül, hospitalRoutes tarafından kullanılan validation middleware'lerini içerir.
 * 
 * Ana İşlevler:
 * - Hastane profil doğrulaması
 * - İş ilanı doğrulaması
 * - Başvuru durumu doğrulaması
 * - Departman doğrulaması
 * - İletişim bilgisi doğrulaması
 * - Türkçe hata mesajları
 * - Detaylı validasyon kuralları
 * 
 * Validation Şemaları:
 * - hospitalProfileSchema: Hastane profil güncelleme
 * - jobSchema: İş ilanı oluşturma/güncelleme
 * - applicationStatusSchema: Başvuru durumu güncelleme
 * - departmentSchema: Departman oluşturma/güncelleme
 * - contactSchema: İletişim bilgisi oluşturma/güncelleme
 * 
 * Schema.sql Uyumluluğu:
 * - hospital_profiles tablosu ile uyumlu
 * - jobs tablosu ile uyumlu
 * - application_statuses tablosu ile uyumlu
 * - hospital_departments tablosu ile uyumlu
 * - hospital_contacts tablosu ile uyumlu
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
// HASTANE PROFİL VALIDATION SCHEMAS
// ============================================================================

/**
 * Hastane profil güncelleme şeması
 * 
 * @description hospital_profiles tablosu ile uyumlu profil doğrulama şeması
 * @param {string} institution_name - Kurum adı (2-255 karakter, zorunlu)
 * @param {string} city - Şehir (2-100 karakter, zorunlu)
 * @param {string} address - Adres (max 500 karakter, opsiyonel)
 * @param {string} phone - Telefon (10-20 karakter, regex pattern, opsiyonel)
 * @param {string} email - Email (email format, opsiyonel)
 * @param {string} website - Website (URL format, opsiyonel)
 * @param {string} about - Hakkında (max 2000 karakter, opsiyonel)
 * 
 * @example
 * const { error, value } = hospitalProfileSchema.validate({
 *   institution_name: "ABC Hastanesi",
 *   city: "İstanbul",
 *   phone: "+90 212 555 0123"
 * });
 * 
 * @since 1.0.0
 */
const hospitalProfileSchema = Joi.object({
  institution_name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Kurum adı boş olamaz',
      'string.min': 'Kurum adı en az 2 karakter olmalıdır',
      'string.max': 'Kurum adı en fazla 255 karakter olabilir',
      'any.required': 'Kurum adı zorunludur'
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Şehir ID\'si sayı olmalıdır',
      'number.integer': 'Şehir ID\'si tam sayı olmalıdır',
      'number.positive': 'Şehir ID\'si pozitif olmalıdır',
      'any.required': 'Şehir seçimi zorunludur'
    }),

  address: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Adres en fazla 500 karakter olabilir'
    }),

  phone: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.min': 'Telefon numarası zorunludur',
      'string.max': 'Telefon numarası en fazla 20 karakter olabilir',
      'any.required': 'Telefon numarası zorunludur'
    }),

  email: Joi.string()
    .email()
    .allow('')
    .messages({
      'string.email': 'Geçerli bir email adresi giriniz'
    }),

  website: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Geçerli bir website adresi giriniz'
    }),

  about: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Hakkında bölümü en fazla 2000 karakter olabilir'
    }),

  logo: Joi.string()
    .required()
    .messages({
      'string.empty': 'Logo boş olamaz',
      'any.required': 'Logo zorunludur'
    })
});

// ============================================================================
// İŞ İLANI VALIDATION SCHEMAS
// ============================================================================
// İş ilanı oluşturma şeması (status_id yok, backend otomatik Aktif yapar)
const jobSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.empty': 'İş ilanı başlığı boş olamaz',
      'string.min': 'İş ilanı başlığı en az 5 karakter olmalıdır',
      'string.max': 'İş ilanı başlığı en fazla 255 karakter olabilir',
      'any.required': 'İş ilanı başlığı zorunludur'
    }),

  specialty_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Uzmanlık alanı ID sayı olmalıdır',
      'number.integer': 'Uzmanlık alanı ID tam sayı olmalıdır',
      'number.positive': 'Uzmanlık alanı ID pozitif olmalıdır',
      'any.required': 'Uzmanlık alanı zorunludur'
    }),

  subspecialty_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null, '')
    .messages({
      'number.base': 'Yan dal uzmanlığı ID sayı olmalıdır',
      'number.integer': 'Yan dal uzmanlığı ID tam sayı olmalıdır',
      'number.positive': 'Yan dal uzmanlığı ID pozitif olmalıdır'
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Şehir ID\'si sayı olmalıdır',
      'number.integer': 'Şehir ID\'si tam sayı olmalıdır',
      'number.positive': 'Şehir ID\'si pozitif olmalıdır',
      'any.required': 'Şehir seçimi zorunludur'
    }),

  employment_type: Joi.string()
    .valid("Tam Zamanlı", "Yarı Zamanlı", "Nöbet Usulü")
    .required()
    .messages({
      'any.only': 'İstihdam türü "Tam Zamanlı", "Yarı Zamanlı" veya "Nöbet Usulü" olmalıdır',
      'any.required': 'İstihdam türü zorunludur'
    }),

  min_experience_years: Joi.number()
    .integer()
    .min(0)
    .max(50)
    .optional()
    .allow(null, '')
    .messages({
      'number.base': 'Minimum deneyim yılı sayı olmalıdır',
      'number.integer': 'Minimum deneyim yılı tam sayı olmalıdır',
      'number.min': 'Minimum deneyim yılı 0\'dan küçük olamaz',
      'number.max': 'Minimum deneyim yılı 50\'den büyük olamaz'
    }),

  description: Joi.string()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'İş tanımı boş olamaz',
      'string.min': 'İş tanımı en az 10 karakter olmalıdır',
      'string.max': 'İş tanımı en fazla 5000 karakter olabilir',
      'any.required': 'İş tanımı zorunludur'
    }),

  // status_id sadece güncelleme için geçerli (oluşturmada otomatik Aktif)
  // 1=Aktif: Doktorlar görür ve başvuru yapar
  // 2=Pasif: Sadece hastane görür, doktorlar görmez
  status_id: Joi.number()
    .integer()
    .positive()
    .valid(1, 2) // 1=Aktif, 2=Pasif
    .optional()
    .messages({
      'number.base': 'İlan durumu sayı olmalıdır',
      'number.integer': 'İlan durumu tam sayı olmalıdır',
      'number.positive': 'İlan durumu pozitif olmalıdır',
      'any.only': 'Geçersiz ilan durumu. Sadece Aktif (1) veya Pasif (2) olabilir.'
    })
});

/**
 * İş ilanı durumu güncelleme şeması
 * @description Hospital tarafından iş ilanı durumu güncellenirken kullanılacak veri doğrulaması
 */
const jobStatusUpdateSchema = Joi.object({
  status_id: Joi.number()
    .integer()
    .positive()
    .valid(1, 2) // 1=Aktif, 2=Pasif
    .required()
    .messages({
      'number.base': 'Durum ID\'si sayı olmalıdır',
      'number.integer': 'Durum ID\'si tam sayı olmalıdır',
      'number.positive': 'Durum ID\'si pozitif olmalıdır',
      'any.only': 'Geçersiz durum. Sadece Aktif (1) veya Pasif (2) olabilir.',
      'any.required': 'Durum ID\'si gereklidir'
    }),
  reason: Joi.string()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Neden en az 5 karakter olmalıdır',
      'string.max': 'Neden en fazla 500 karakter olabilir'
    })
});

// ============================================================================
// BAŞVURU DURUMU VALIDATION SCHEMAS
// ============================================================================

/**
 * Başvuru durumu güncelleme şeması
 * @description Hospital tarafından başvuru durumu güncellenirken kullanılacak veri doğrulaması
 * Admin modülüyle uyumlu olması için status_id kullanılır (application_statuses.id)
 */
const applicationStatusSchema = Joi.object({
  status_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Durum ID\'si sayı olmalıdır',
      'number.integer': 'Durum ID\'si tam sayı olmalıdır',
      'number.positive': 'Durum ID\'si pozitif olmalıdır',
      'any.required': 'Durum ID\'si zorunludur'
    }),

  notes: Joi.string()
    .max(1000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Notlar en fazla 1000 karakter olabilir'
    })
});

// ============================================================================
// DEPARTMAN VE İLETİŞİM ŞEMALARI KALDIRILDI
// ============================================================================
// Bu şemalar artık kullanılmıyor çünkü departmanlar ve iletişim bilgileri
// ayrı tablolarda değil, hospital_profiles tablosunda tek satırda tutuluyor

// ============================================================================
// QUERY PARAMETRELERİ VALIDATION SCHEMAS
// ============================================================================

/**
 * Başvuru listesi sorgu parametreleri şeması
 * 
 * @description getApplicationsForMyJobs endpoint'i için query parametreleri doğrulama şeması
 * @param {number} [page=1] - Sayfa numarası
 * @param {number} [limit=20] - Sayfa başına kayıt sayısı
 * @param {number} [status] - Başvuru durumu ID'si
 * @param {number} [job_id] - İş ilanı ID'si
 * @param {string} [search] - Genel arama terimi
 * @param {string} [doctor_search] - Doktor adı arama terimi
 * @param {string} [job_search] - İş ilanı başlığı arama terimi
 * @param {string} [sortBy='applied_at'] - Sıralama alanı
 * @param {string} [sortOrder='desc'] - Sıralama yönü
 * 
 * @example
 * const { error, value } = applicationsQuerySchema.validate({
 *   page: 1,
 *   limit: 10,
 *   status: 1,
 *   search: "doktor"
 * });
 * 
 * @since 1.0.0
 */
const applicationsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Sayfa numarası sayı olmalıdır',
      'number.integer': 'Sayfa numarası tam sayı olmalıdır',
      'number.min': 'Sayfa numarası 1\'den küçük olamaz'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Sayfa limiti sayı olmalıdır',
      'number.integer': 'Sayfa limiti tam sayı olmalıdır',
      'number.min': 'Sayfa limiti 1\'den küçük olamaz',
      'number.max': 'Sayfa limiti 100\'den büyük olamaz'
    }),

  status: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'Durum ID sayı olmalıdır',
      'number.integer': 'Durum ID tam sayı olmalıdır',
      'number.positive': 'Durum ID pozitif olmalıdır'
    }),

  job_id: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'İş ilanı ID sayı olmalıdır',
      'number.integer': 'İş ilanı ID tam sayı olmalıdır',
      'number.positive': 'İş ilanı ID pozitif olmalıdır'
    }),

  search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Arama terimi en az 2 karakter olmalıdır',
      'string.max': 'Arama terimi en fazla 100 karakter olabilir'
    }),

  doctor_search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Doktor arama terimi en az 2 karakter olmalıdır',
      'string.max': 'Doktor arama terimi en fazla 100 karakter olabilir'
    }),

  job_search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'İş ilanı arama terimi en az 2 karakter olmalıdır',
      'string.max': 'İş ilanı arama terimi en fazla 100 karakter olabilir'
    }),

  sortBy: Joi.string()
    .valid('applied_at', 'updated_at', 'doctor_name', 'job_title', 'status')
    .default('applied_at')
    .messages({
      'any.only': 'Sıralama alanı geçerli değerlerden biri olmalıdır: applied_at, updated_at, doctor_name, job_title, status'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sıralama yönü asc veya desc olmalıdır'
    })
});

/**
 * Job ID Parameter Schema
 * @description URL parametresi olarak gelen job ID'si için validation
 */
const jobIdParamSchema = Joi.object({
  jobId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'İş ilanı ID\'si sayı olmalıdır',
      'number.integer': 'İş ilanı ID\'si tam sayı olmalıdır',
      'number.positive': 'İş ilanı ID\'si pozitif olmalıdır',
      'any.required': 'İş ilanı ID\'si zorunludur'
    })
});

/**
 * Job Status Change Notification Schema
 * @description İlan durumu değişikliği bildirimi için validation
 */
const jobStatusChangeSchema = Joi.object({
  newStatus: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Yeni durum metin olmalıdır',
      'string.min': 'Yeni durum en az 2 karakter olmalıdır',
      'string.max': 'Yeni durum en fazla 50 karakter olabilir',
      'any.required': 'Yeni durum gereklidir'
    }),
  oldStatus: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Eski durum metin olmalıdır',
      'string.min': 'Eski durum en az 2 karakter olmalıdır',
      'string.max': 'Eski durum en fazla 50 karakter olabilir',
      'any.required': 'Eski durum gereklidir'
    })
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Hastane profil validation
  hospitalProfileSchema,
  
  // İş ilanı validation
  jobSchema,
  jobStatusUpdateSchema,
  jobIdParamSchema,
  jobStatusChangeSchema,
  
  // Başvuru durumu validation
  applicationStatusSchema,
  
  // Query parametreleri validation
  applicationsQuerySchema
};
