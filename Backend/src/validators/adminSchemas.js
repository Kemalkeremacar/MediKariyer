/**
 * @file adminSchemas.js
 * @description Admin paneli için Joi validation şemalarını tanımlar
 * Tüm admin endpoint'leri için gerekli validasyon kurallarını içerir
 * 
 * Dashboard ve İstatistikler:
 * - Dashboard verileri AnalyticsService'den alınır
 * - Tüm istatistikler analytics dosyalarından çekilir
 * - Admin paneli analytics servisini kullanır
 * 
 * İletişim Mesaj Yönetimi:
 * - Contact mesajları için ContactSchemas kullanılır
 * - Anasayfadan public olarak mesaj gönderilebilir
 * - Admin bunu görüntüleyebilir (yanıtlama yok)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */
'use strict';



const Joi = require('joi');

// ============================================================================
// KULLANICI YÖNETİMİ ŞEMALARI
// ============================================================================

/**
 * Kullanıcı listesi sorguları için validation şeması
 * @description Admin panelinde kullanıcı listesi sayfasında kullanılacak filtreleme parametrelerini doğrular
 */
const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  role: Joi.string().valid('doctor', 'hospital', 'admin').optional(),
  isApproved: Joi.string().valid('true', 'false').optional(),
  isActive: Joi.string().valid('true', 'false').optional(),
  search: Joi.string().max(100).pattern(/^[a-zA-Z0-9\sçğıöşüÇĞIİÖŞÜ@._\-,]*$/).optional(),
  email_search: Joi.string().max(100).pattern(/^[a-zA-Z0-9\sçğıöşüÇĞIİÖŞÜ@._\-,]*$/).optional(),
  doctor_search: Joi.string().max(100).pattern(/^[a-zA-Z0-9\sçğıöşüÇĞIİÖŞÜ._\-,]*$/).optional(),
  hospital_search: Joi.string().max(100).pattern(/^[a-zA-Z0-9\sçğıöşüÇĞIİÖŞÜ._\-,]*$/).optional(),
  specialty_id: Joi.number().integer().positive().optional(),
  subspecialty_id: Joi.number().integer().positive().optional(),
  city_id: Joi.number().integer().positive().optional()
}).allow({});


// ============================================================================
// KULLANICI DURUM YÖNETİMİ ŞEMALARI
// ============================================================================

/**
 * Kullanıcı onaylama için validation şeması
 * @description Kullanıcı onaylama işleminde kullanılacak veri doğrulaması
 */
const approveUserSchema = Joi.object({
  approved: Joi.boolean().required(),
  reason: Joi.string().max(500).optional()
});

// ============================================================================
// ONAY İŞLEMLERİ ŞEMALARI
// ============================================================================

/**
 * Kullanıcı ID parametresi için validation şeması
 * @description URL parametrelerinde kullanıcı ID'sini doğrular
 */
const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

/**
 * İş ilanı ID parametresi için validation şeması
 * @description URL parametrelerinde iş ilanı ID'sini doğrular
 */
const jobIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// ============================================================================
// İŞ İLANI YÖNETİMİ ŞEMALARI
// ============================================================================

/**
 * İş ilanı durum güncelleme için validation şeması
 * @description İş ilanı durumu değiştirirken kullanılacak veri doğrulaması
 * Database'de status_id integer olarak tutulduğu için ID kullanılır
 */
const jobStatusUpdateSchema = Joi.object({
  status_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Durum ID\'si sayı olmalıdır',
    'number.integer': 'Durum ID\'si tam sayı olmalıdır',
    'number.positive': 'Durum ID\'si pozitif olmalıdır',
    'any.required': 'Durum ID\'si zorunludur'
  }),
  reason: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Sebep en fazla 500 karakter olabilir',
    'string.base': 'Sebep string olmalıdır'
  })
});

/**
 * İş ilanı güncelleme için validation şeması
 * @description İş ilanı bilgilerini güncellerken kullanılacak veri doğrulaması
 * Database'deki jobs tablosu alanlarına göre tanımlanmıştır
 */
const jobUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(255).optional().messages({
    'string.min': 'Başlık en az 5 karakter olmalıdır',
    'string.max': 'Başlık en fazla 255 karakter olabilir'
  }),
  description: Joi.string().min(20).max(5000).optional().messages({
    'string.min': 'Açıklama en az 20 karakter olmalıdır',
    'string.max': 'Açıklama en fazla 5000 karakter olabilir'
  }),
  specialty_id: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Uzmanlık ID\'si pozitif olmalıdır'
  }),
  city_id: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Şehir ID\'si pozitif olmalıdır'
  }),
  employment_type: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'İstihdam türü en az 2 karakter olmalıdır',
    'string.max': 'İstihdam türü en fazla 100 karakter olabilir'
  }),
  min_experience_years: Joi.number().integer().min(0).max(50).optional().messages({
    'number.min': 'Deneyim en az 0 yıl olmalıdır',
    'number.max': 'Deneyim en fazla 50 yıl olabilir'
  }),
  status_id: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Durum ID\'si pozitif olmalıdır'
  })
}).min(1).messages({
  'object.min': 'En az bir alan güncellenmelidir'
});

/**
 * İş ilanı onaylama için validation şeması
 * @description İş ilanını onaylarken kullanılacak veri doğrulaması
 */
const jobApproveSchema = Joi.object({}).allow({});

/**
 * İş ilanı revizyon talep etme için validation şeması
 * @description İş ilanı için revizyon talep ederken kullanılacak veri doğrulaması
 */
const jobRevisionSchema = Joi.object({
  revision_note: Joi.string().min(10).max(1000).required().messages({
    'string.empty': 'Revizyon notu boş olamaz',
    'string.min': 'Revizyon notu en az 10 karakter olmalıdır',
    'string.max': 'Revizyon notu en fazla 1000 karakter olabilir',
    'any.required': 'Revizyon notu zorunludur'
  })
});

/**
 * İş ilanı reddetme için validation şeması
 * @description İş ilanını reddederken kullanılacak veri doğrulaması
 */
const jobRejectSchema = Joi.object({
  rejection_reason: Joi.string().min(5).max(500).optional().allow('', null).messages({
    'string.min': 'Red sebebi en az 5 karakter olmalıdır',
    'string.max': 'Red sebebi en fazla 500 karakter olabilir'
  })
}).allow({});

/**
 * Kullanıcı durum güncelleme için validation şeması
 * @description Kullanıcı aktiflik durumu değiştirirken kullanılacak veri doğrulaması
 */
const userStatusUpdateSchema = Joi.object({
  field: Joi.string().valid('is_active', 'is_approved').required(),
  value: Joi.boolean().required(),
  reason: Joi.string().max(500).optional()
});

// ============================================================================
// BİLDİRİM YÖNETİMİ ŞEMALARI
// ============================================================================

/**
 * Bildirim sorguları için validation şeması
 * @description Bildirim listesi sayfasında kullanılacak filtreleme parametrelerini doğrular
 */
const notificationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  type: Joi.string().optional(),
  user_id: Joi.number().integer().positive().optional(),
  is_read: Joi.boolean().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
}).allow({});

/**
 * Bildirim ID parametresi için validation şeması
 * @description URL parametrelerinde bildirim ID'sini doğrular
 */
const notificationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});


/**
 * Bildirim güncelleme için validation şeması
 * @description Mevcut bildirimi güncellerken kullanılacak veri doğrulaması
 */
const updateNotificationSchema = Joi.object({
  type: Joi.string().valid('info', 'success', 'warning', 'error', 'system').optional(),
  title: Joi.string().min(1).max(255).optional(),
  body: Joi.string().min(1).max(1000).optional(),
  channel: Joi.string().valid('inapp', 'email', 'sms').optional()
});

/**
 * Başvuru ID parametresi için validation şeması
 * @description URL parametresindeki başvuru ID'sini doğrular
 */
const applicationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

/**
 * Başvuru durumu güncelleme için validation şeması
 * @description Admin tarafından başvuru durumu güncellenirken kullanılacak veri doğrulaması
 */
const applicationStatusUpdateSchema = Joi.object({
  status_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Durum ID\'si sayı olmalıdır',
    'number.integer': 'Durum ID\'si tam sayı olmalıdır',
    'number.positive': 'Durum ID\'si pozitif olmalıdır',
    'any.required': 'Durum ID\'si zorunludur'
  }),
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Sebep en fazla 500 karakter olabilir'
  })
});

/**
 * Dashboard sorguları için validation şeması
 * @description Dashboard endpoint'i için query parametreleri
 * Service'de kullanılan parametrelere göre tanımlanmıştır
 */
const dashboardQuerySchema = Joi.object({
  period: Joi.string().valid('day', 'week', 'month', 'year').optional().default('month').messages({
    'any.only': 'Periyot day, week, month veya year olmalıdır'
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.format': 'Başlangıç tarihi ISO formatında olmalıdır'
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional().messages({
    'date.format': 'Bitiş tarihi ISO formatında olmalıdır',
    'date.greater': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
  })
}).allow({});

// ============================================================================
// DOKTOR FOTOĞRAF ONAY ŞEMALARI
// ============================================================================

/**
 * Fotoğraf onay talebi ID parametresi için validation şeması
 * @description URL parametresindeki photo request ID'sini doğrular
 */
const photoRequestIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Talep ID\'si sayı olmalıdır',
    'number.integer': 'Talep ID\'si tam sayı olmalıdır',
    'number.positive': 'Talep ID\'si pozitif olmalıdır',
    'any.required': 'Talep ID\'si zorunludur'
  })
});

/**
 * Fotoğraf onay talepleri sorguları için validation şeması
 * @description Fotoğraf talepleri listesini getirirken kullanılacak filtreleme parametrelerini doğrular
 */
const photoRequestQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').optional().default('pending').messages({
    'any.only': 'Durum pending, approved, rejected veya cancelled olmalıdır'
  }),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Sayfa numarası sayı olmalıdır',
    'number.min': 'Sayfa numarası en az 1 olmalıdır'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.base': 'Limit sayı olmalıdır',
    'number.min': 'Limit en az 1 olmalıdır',
    'number.max': 'Limit en fazla 100 olabilir'
  })
}).allow({});

/**
 * Doktor profil fotoğrafı onay/red için validation şeması
 * @description Admin tarafından doktor profil fotoğrafını onaylarken/reddederken kullanılacak veri doğrulaması
 * Controller'da 'action' field'ı kullanıldığı için 'action' olarak tanımlanmıştır
 */
const photoRequestReviewSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required().messages({
    'any.required': 'İşlem zorunludur',
    'any.only': 'İşlem approve veya reject olmalıdır'
  }),
  reason: Joi.string().max(500).optional().when('action', {
    is: 'reject',
    then: Joi.required().messages({
      'any.required': 'Red işleminde sebep zorunludur'
    })
  }).messages({
    'string.max': 'Red sebebi en fazla 500 karakter olabilir'
  })
});

/**
 * AdminSchemas modülü
 * Tüm admin endpoint'leri için gerekli validation şemalarını export eder
 */
module.exports = {
  getUsersQuerySchema,
  approveUserSchema,
  userIdParamSchema,
  jobIdParamSchema,
  userStatusUpdateSchema,
  jobStatusUpdateSchema,
  jobUpdateSchema,
  jobApproveSchema,
  jobRevisionSchema,
  jobRejectSchema,
  applicationIdParamSchema,
  applicationStatusUpdateSchema,
  notificationsQuerySchema,
  notificationIdParamSchema,
  updateNotificationSchema,
  dashboardQuerySchema,
  // Photo request schemas
  photoRequestIdParamSchema,
  photoRequestQuerySchema,
  photoRequestReviewSchema,
};
