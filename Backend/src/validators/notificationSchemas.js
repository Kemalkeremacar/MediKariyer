/**
 * @file notificationSchemas.js
 * @description Bildirim işlemleri için kullanılan Joi doğrulama şemaları - Tüm kullanıcılar için.
 * Bu dosya, bildirim CRUD işlemleri, filtreleme ve admin bildirim gönderme için
 * gerekli tüm validation şemalarını içerir.
 * 
 * Ana Özellikler:
 * - Tüm kullanıcılar için ortak şemalar
 * - Doktor/Hastane/Admin ayrımı netleştirilmiş
 * - Custom validation: İş kurallarına uygun doğrulama
 * - Türkçe hata mesajları: Kullanıcı dostu mesajlar
 * - Flexible input: Frontend'den gelen farklı formatları destekler
 * 
 * Şema Türleri:
 * - notificationFilterSchema: Bildirim filtreleme (tüm kullanıcılar için)
 * - markMultipleAsReadSchema: Çoklu okundu işaretleme (tüm kullanıcılar için)
 * - sendNotificationSchema: Bildirim gönderme (sadece admin için)
 * - cleanupSchema: Temizleme işlemleri (tüm kullanıcılar için)
 * - notificationIdParamSchema: URL parametresi doğrulama
 * 
 * Servis Ayrımı Mantığı:
 * - Bu şemalar TÜM kullanıcılar için ortak bildirim işlemlerini içerir
 * - Doktorlar: Bildirimleri alır ve yönetir
 * - Hastaneler: Bildirimleri alır ve yönetir
 * - Adminler: Bildirimleri hem alır hem gönderir
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

const Joi = require('joi');

// ============================================================================
// BİLDİRİM DURUMU YÖNETİMİ ŞEMALARI
// ============================================================================

/**
 * Bildirimi okundu olarak işaretleme şeması
 * @description Bildirim okundu/okunmadı durumu güncelleme için kullanılır
 */
const updateNotificationStatusSchema = Joi.object({
  isRead: Joi.boolean().required().messages({
    'boolean.base': 'Okundu bilgisi true/false olmalıdır',
    'any.required': 'Okundu bilgisi zorunludur'
  })
});

// ============================================================================
// BİLDİRİM FİLTRELEME VE SAYFALAMA ŞEMALARI
// ============================================================================

/**
 * Bildirimleri filtreleme şeması
 * @description Bildirim listesi için filtreleme, sıralama ve sayfalama parametreleri
 */
const notificationFilterSchema = Joi.object({
  // Durum filtreleri
  isRead: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false').custom((value, helpers) => {
      return value === 'true';
    })
  ).optional().messages({
    'boolean.base': 'Okundu durumu true/false olmalıdır',
    'any.only': 'Okundu durumu true/false olmalıdır'
  }),
  
  // Tip filtreleri
  type: Joi.string().valid('info', 'warning', 'success', 'error').optional().messages({
    'any.only': 'Geçerli bir bildirim türü seçiniz (info, warning, success, error)'
  }),
  
  // Tarih filtreleri
  start_date: Joi.date().iso().optional().messages({
    'date.format': 'Başlangıç tarihi ISO formatında olmalıdır (YYYY-MM-DD)'
  }),
  end_date: Joi.date().iso().optional().messages({
    'date.format': 'Bitiş tarihi ISO formatında olmalıdır (YYYY-MM-DD)'
  }),
  
  // Sayfalama parametreleri
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Sayfa numarası sayı olmalıdır',
    'number.integer': 'Sayfa numarası tam sayı olmalıdır',
    'number.min': 'Sayfa numarası en az 1 olmalıdır'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Sayfa limiti sayı olmalıdır',
    'number.integer': 'Sayfa limiti tam sayı olmalıdır',
    'number.min': 'Sayfa limiti en az 1 olmalıdır',
    'number.max': 'Sayfa limiti en fazla 100 olabilir'
  }),
  
  // Sıralama parametreleri
  sort_by: Joi.string().valid('created_at', 'type', 'title').optional().default('created_at').messages({
    'any.only': 'Geçerli bir sıralama alanı seçiniz (created_at, type, title)'
  }),
  sort_order: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sıralama düzeni asc veya desc olmalıdır'
  })
}).unknown(true); // Bilinmeyen parametrelere izin ver

// ============================================================================
// ADMIN BİLDİRİM GÖNDERME ŞEMALARI
// ============================================================================

/**
 * Admin bildirim gönderme şeması
 * @description Admin tarafından kullanıcılara bildirim gönderme için kullanılır
 */
const sendNotificationSchema = Joi.object({
  // Zorunlu alanlar
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Başlık boş olamaz',
    'string.min': 'Başlık en az 1 karakter olmalıdır',
    'string.max': 'Başlık en fazla 200 karakter olabilir',
    'any.required': 'Başlık zorunludur'
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Mesaj boş olamaz',
    'string.min': 'Mesaj en az 1 karakter olmalıdır',
    'string.max': 'Mesaj en fazla 1000 karakter olabilir',
    'any.required': 'Mesaj zorunludur'
  }),
  
  // Opsiyonel alanlar
  type: Joi.string().valid('info', 'warning', 'success', 'error').optional().default('info').messages({
    'any.only': 'Geçerli bir bildirim türü seçiniz (info, warning, success, error)'
  }),
  
  // Hedef kullanıcı belirleme (en az biri gerekli)
  user_ids: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': 'Kullanıcı ID\'leri array formatında olmalıdır',
    'number.base': 'Kullanıcı ID\'si sayı olmalıdır',
    'number.integer': 'Kullanıcı ID\'si tam sayı olmalıdır',
    'number.positive': 'Kullanıcı ID\'si pozitif sayı olmalıdır'
  }),
  role: Joi.string().valid('doctor', 'hospital', 'admin', 'all').optional().messages({
    'any.only': 'Geçerli bir rol seçiniz (doctor, hospital, admin, all)'
  })
}).custom((value, helpers) => {
  // En az bir hedef belirtilmeli (user_ids veya role)
  if (!value.user_ids && !value.role) {
    return helpers.error('custom.targetRequired', {
      message: 'En az bir hedef belirtmelisiniz (user_ids veya role)'
    });
  }
  return value;
}).messages({
  'custom.targetRequired': 'En az bir hedef belirtmelisiniz (user_ids veya role)'
});

// ============================================================================
// BİLDİRİM ID PARAMETRESİ ŞEMALARI
// ============================================================================

/**
 * Bildirim ID parametresi şeması
 * @description URL parametresindeki bildirim ID'si için kullanılır
 */
const notificationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Bildirim ID\'si sayı olmalıdır',
    'number.integer': 'Bildirim ID\'si tam sayı olmalıdır',
    'number.positive': 'Bildirim ID\'si pozitif sayı olmalıdır',
    'any.required': 'Bildirim ID\'si zorunludur'
  })
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Bildirim durumu yönetimi
  updateNotificationStatusSchema,
  
  // Bildirim filtreleme ve sayfalama
  notificationFilterSchema,
  
  // Admin bildirim gönderme
  sendNotificationSchema,
  
  // Bildirim ID parametresi
  notificationIdParamSchema
};
