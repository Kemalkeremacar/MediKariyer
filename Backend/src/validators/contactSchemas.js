/**
 * @file contactSchemas.js
 * @description İletişim formu validation şemaları - İletişim mesajları için veri doğrulama şemalarını içerir.
 * Bu dosya, contactController ve contactRoutes tarafından kullanılan public validation şemalarını içerir.
 * 
 * Ana İşlevler:
 * - İletişim formu doğrulaması (public)
 * - Türkçe hata mesajları
 * - Detaylı validasyon kuralları
 * 
 * Şema Türleri:
 * - contactSchema: Genel iletişim formu (public)
 * 
 * Not: Admin mesaj yönetimi şemaları adminSchemas.js dosyasında tanımlanmıştır.
 * Kullanıcılar giriş yaptıktan sonra mesaj gönderme özelliği kullanılamaz.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const Joi = require('joi');

// ============================================================================
// İLETİŞİM FORMU VALIDATION SCHEMAS
// ============================================================================

/**
 * Genel iletişim formu (/contact)
 */
const contactSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Ad Soyad gereklidir',
      'string.min': 'Ad Soyad en az 2 karakter olmalıdır',
      'string.max': 'Ad Soyad en fazla 100 karakter olabilir',
      'any.required': 'Ad Soyad gereklidir'
    }),

  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'string.empty': 'E-posta adresi gereklidir',
      'string.max': 'E-posta adresi en fazla 255 karakter olabilir',
      'any.required': 'E-posta adresi gereklidir'
    }),

  phone: Joi.string()
    .pattern(/^[0-9+\-\s\(\)]+$/)
    .min(10)
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Geçerli bir telefon numarası giriniz',
      'string.min': 'Telefon numarası en az 10 karakter olmalıdır',
      'string.max': 'Telefon numarası en fazla 20 karakter olabilir'
    }),

  subject: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Konu en az 5 karakter olmalıdır',
      'string.max': 'Konu en fazla 200 karakter olabilir'
    }),

  message: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Mesaj gereklidir',
      'string.min': 'Mesaj en az 10 karakter olmalıdır',
      'string.max': 'Mesaj en fazla 2000 karakter olabilir',
      'any.required': 'Mesaj gereklidir'
    })
});

// ============================================================================
// ADMIN MESAJ YÖNETİMİ VALIDATION SCHEMAS
// ============================================================================

/**
 * İletişim mesajı filtreleme şeması
 * @description Admin tarafından mesaj filtreleme için kullanılır
 */
const contactFilterSchema = Joi.object({
  status: Joi.string().valid('new', 'read', 'replied', 'archived').optional(),
  search: Joi.string().max(100).optional().messages({
    'string.max': 'Arama terimi en fazla 100 karakter olabilir'
  }),
  start_date: Joi.date().iso().optional().messages({
    'date.format': 'Başlangıç tarihi ISO formatında olmalıdır (YYYY-MM-DD)'
  }),
  end_date: Joi.date().iso().optional().messages({
    'date.format': 'Bitiş tarihi ISO formatında olmalıdır (YYYY-MM-DD)'
  }),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sort_by: Joi.string().valid('created_at', 'name', 'email', 'status').optional().default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').optional().default('desc')
}).unknown(true);

/**
 * İletişim mesajı ID parametresi şeması
 * @description URL parametresindeki mesaj ID'si için kullanılır
 */
const contactIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Mesaj ID\'si sayı olmalıdır',
    'number.integer': 'Mesaj ID\'si tam sayı olmalıdır',
    'number.positive': 'Mesaj ID\'si pozitif sayı olmalıdır',
    'any.required': 'Mesaj ID\'si zorunludur'
  })
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Public iletişim formu
  contactSchema,
  
  // Admin mesaj yönetimi (sadece okuma)
  contactFilterSchema,
  contactIdParamSchema
};
