/**
 * @file lookupSchemas.js
 * @description Lookup verileri için Joi validation şemaları - Sistem genelinde kullanılan lookup verilerinin doğruluğunu kontrol eder.
 * Bu dosya, lookup endpoint'leri için gelen verilerin doğruluğunu kontrol eder.
 * 
 * Ana Şemalar:
 * - specialtySchema: Uzmanlık alanı validasyonu
 * - citySchema: Şehir validasyonu
 * - doctorEducationTypeSchema: Doktor eğitim türü validasyonu
 * - languageLevelSchema: Dil seviyesi validasyonu
 * - languageSchema: Dil validasyonu
 * - certificateTypeSchema: Sertifika türü validasyonu
 * - jobStatusSchema: İş durumu validasyonu
 * - applicationStatusSchema: Başvuru durumu validasyonu
 * 
 * Validasyon Özellikleri:
 * - String uzunluk kontrolü (min/max)
 * - Sayı aralık kontrolü
 * - Boolean değer kontrolü
 * - Enum değer kontrolü
 * - Zorunlu alan kontrolü
 * - Opsiyonel alan kontrolü
 * 
 * Kullanım Alanları:
 * - Route middleware'lerinde input validasyonu
 * - API endpoint'lerinde veri doğrulama
 * - Frontend-backend veri uyumluluğu
 * - Admin panelinde lookup veri yönetimi
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ==================== DEPENDENCIES ====================
const Joi = require('joi');
// ==================== END DEPENDENCIES ====================

// ==================== BASE VALIDATION SCHEMAS ====================

/**
 * ID Schema
 * @description Pozitif tam sayı ID validasyonu
 * 
 * Validasyon Kuralları:
 * - Pozitif tam sayı olmalı
 * - Minimum 1 değeri
 * 
 * @example
 * 1 ✅
 * 0 ❌
 * -1 ❌
 * "1" ❌ (string)
 */
const idSchema = Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
    'number.base': 'ID sayı olmalıdır',
    'number.integer': 'ID tam sayı olmalıdır',
    'number.positive': 'ID pozitif sayı olmalıdır',
    'any.required': 'ID zorunludur'
  });

/**
 * Name Schema
 * @description İsim validasyonu - genel kullanım için
 * 
 * Validasyon Kuralları:
 * - Minimum 2 karakter
 * - Maksimum 100 karakter
 * - Boşluk içerebilir
 * - Türkçe karakterler desteklenir
 * 
 * @example
 * "Kardiyoloji" ✅
 * "A" ❌ (çok kısa)
 * "" ❌ (boş)
 */
const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .required()
  .messages({
    'string.min': 'İsim en az 2 karakter olmalıdır',
    'string.max': 'İsim en fazla 100 karakter olabilir',
    'any.required': 'İsim zorunludur'
  });

/**
 * Description Schema
 * @description Açıklama validasyonu - opsiyonel
 * 
 * Validasyon Kuralları:
 * - Maksimum 500 karakter
 * - Opsiyonel alan
 * 
 * @example
 * "Kalp ve damar hastalıkları" ✅
 * "" ✅ (boş olabilir)
 * null ✅ (null olabilir)
 */
const descriptionSchema = Joi.string()
  .max(500)
  .optional()
  .allow('', null)
  .messages({
    'string.max': 'Açıklama en fazla 500 karakter olabilir'
  });

// ==================== END BASE VALIDATION SCHEMAS ====================

// ==================== LOOKUP VALIDATION SCHEMAS ====================

/**
 * Uzmanlık Alanı Schema
 * @description Uzmanlık alanı oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Uzmanlık alanı adı
 * 
 * Opsiyonel Alanlar:
 * - description: Açıklama
 * 
 * @example
 * {
 *   "name": "Kardiyoloji",
 *   "description": "Kalp ve damar hastalıkları"
 * }
 */
const specialtySchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema
});

/**
 * Şehir Schema
 * @description Şehir oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Şehir adı
 * 
 * Opsiyonel Alanlar:
 * - country: Ülke adı (varsayılan: Turkey)
 * 
 * @example
 * {
 *   "name": "İstanbul",
 *   "country": "Turkey"
 * }
 */
const citySchema = Joi.object({
  name: nameSchema,
  country: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .default('Turkey')
    .messages({
      'string.min': 'Ülke adı en az 2 karakter olmalıdır',
      'string.max': 'Ülke adı en fazla 50 karakter olabilir'
    })
});

/**
 * Doktor Eğitim Türü Schema
 * @description Doktor eğitim türü oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Eğitim türü adı
 * 
 * Opsiyonel Alanlar:
 * - description: Açıklama
 * - is_required: Zorunlu mu (varsayılan: false)
 * 
 * @example
 * {
 *   "name": "Tıp Fakültesi",
 *   "description": "Lisans eğitimi",
 *   "is_required": true
 * }
 * 
 * @example
 * {
 *   "name": "DİĞER",
 *   "description": "Diğer eğitim türleri için özel alan",
 *   "is_required": false
 * }
 */
const doctorEducationTypeSchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema,
  is_required: Joi.boolean()
    .optional()
    .allow(null)
    .default(false)
    .messages({
      'boolean.base': 'Zorunlu alanı true/false değeri olmalıdır'
    })
});

/**
 * Dil Seviyesi Schema
 * @description Dil seviyesi oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Seviye adı
 * 
 * Opsiyonel Alanlar:
 * - description: Açıklama
 * 
 * @example
 * {
 *   "name": "Başlangıç",
 *   "description": "Temel seviye"
 * }
 */
const languageLevelSchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema
});

/**
 * Dil Schema
 * @description Dil oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Dil adı
 * 
 * Opsiyonel Alanlar:
 * - code: Dil kodu (ISO 639-1)
 * 
 * @example
 * {
 *   "name": "Türkçe",
 *   "code": "tr"
 * }
 */
const languageSchema = Joi.object({
  name: nameSchema,
  code: Joi.string()
    .min(2)
    .max(10)
    .optional()
    .messages({
      'string.min': 'Dil kodu en az 2 karakter olmalıdır',
      'string.max': 'Dil kodu en fazla 10 karakter olabilir'
    })
});

/**
 * Sertifika Türü Schema
 * @description Sertifika türü oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Sertifika türü adı
 * 
 * Opsiyonel Alanlar:
 * - description: Açıklama
 * - is_required: Zorunlu mu (varsayılan: false)
 * 
 * @example
 * {
 *   "name": "Tıp Diploması",
 *   "description": "Tıp fakültesi diploması",
 *   "is_required": true
 * }
 */
const certificateTypeSchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema,
  is_required: Joi.boolean()
    .optional()
    .allow(null)
    .default(false)
    .messages({
      'boolean.base': 'Zorunlu alanı true/false değeri olmalıdır'
    })
});

/**
 * İş Durumu Schema
 * @description İş durumu oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Durum adı
 * 
 * @example
 * {
 *   "name": "Aktif"
 * }
 */
const jobStatusSchema = Joi.object({
  name: nameSchema
});

/**
 * Başvuru Durumu Schema
 * @description Başvuru durumu oluşturma/güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - name: Durum adı
 * 
 * @example
 * {
 *   "name": "Beklemede"
 * }
 */
const applicationStatusSchema = Joi.object({
  name: nameSchema
});

// ==================== END LOOKUP VALIDATION SCHEMAS ====================

// ==================== QUERY VALIDATION SCHEMAS ====================

/**
 * Lookup Query Schema
 * @description Lookup verileri için genel query parametreleri
 * 
 * Opsiyonel Alanlar:
 * - page: Sayfa numarası (varsayılan: 1)
 * - limit: Sayfa başına kayıt sayısı (varsayılan: 100, maksimum: 1000)
 * - search: Arama terimi
 * - sort: Sıralama alanı
 * - order: Sıralama yönü (asc/desc)
 * 
 * @example
 * {
 *   "page": 1,
 *   "limit": 50,
 *   "search": "kardiyoloji",
 *   "sort": "name",
 *   "order": "asc"
 * }
 */
const lookupQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Sayfa numarası sayı olmalıdır',
      'number.integer': 'Sayfa numarası tam sayı olmalıdır',
      'number.min': 'Sayfa numarası en az 1 olmalıdır'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .default(100)
    .messages({
      'number.base': 'Limit sayı olmalıdır',
      'number.integer': 'Limit tam sayı olmalıdır',
      'number.min': 'Limit en az 1 olmalıdır',
      'number.max': 'Limit en fazla 1000 olabilir'
    }),
    
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Arama terimi en az 1 karakter olmalıdır',
      'string.max': 'Arama terimi en fazla 100 karakter olabilir'
    }),
    
  sort: Joi.string()
    .valid('id', 'name', 'created_at', 'updated_at')
    .optional()
    .default('name')
    .messages({
      'any.only': 'Sıralama alanı geçerli değerlerden biri olmalıdır: id, name, created_at, updated_at'
    }),
    
  order: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('asc')
    .messages({
      'any.only': 'Sıralama yönü asc veya desc olmalıdır'
    })
}).allow({});

// ==================== END QUERY VALIDATION SCHEMAS ====================

// ==================== PARAMETER VALIDATION SCHEMAS ====================

/**
 * Lookup ID Param Schema
 * @description URL parametrelerinde lookup ID'sini doğrular
 * 
 * @example
 * { id: 123 }
 */
const lookupIdParamSchema = Joi.object({
  id: idSchema
});

// ==================== END PARAMETER VALIDATION SCHEMAS ====================

// ==================== BULK OPERATION SCHEMAS ====================

/**
 * Bulk Create Schema
 * @description Toplu lookup verisi oluşturma validasyonu
 * 
 * Zorunlu Alanlar:
 * - items: Oluşturulacak verilerin dizisi
 * 
 * @example
 * {
 *   "items": [
 *     { "name": "Kardiyoloji", "description": "Kalp hastalıkları" },
 *     { "name": "Nöroloji", "description": "Sinir sistemi hastalıkları" }
 *   ]
 * }
 */
const bulkCreateSchema = Joi.object({
  items: Joi.array()
    .items(specialtySchema) // Bu örnekte specialtySchema kullanıldı, diğerleri için değiştirilebilir
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'En az 1 öğe eklenmelidir',
      'array.max': 'En fazla 100 öğe eklenebilir',
      'any.required': 'Öğeler zorunludur'
    })
});

/**
 * Bulk Update Schema
 * @description Toplu lookup verisi güncelleme validasyonu
 * 
 * Zorunlu Alanlar:
 * - items: Güncellenecek verilerin dizisi (id ile birlikte)
 * 
 * @example
 * {
 *   "items": [
 *     { "id": 1, "name": "Kardiyoloji", "description": "Kalp hastalıkları" },
 *     { "id": 2, "name": "Nöroloji", "description": "Sinir sistemi hastalıkları" }
 *   ]
 * }
 */
const bulkUpdateSchema = Joi.object({
  items: Joi.array()
    .items(specialtySchema.keys({ id: idSchema })) // ID eklenmiş hali
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'En az 1 öğe güncellenmelidir',
      'array.max': 'En fazla 100 öğe güncellenebilir',
      'any.required': 'Öğeler zorunludur'
    })
});

/**
 * Bulk Delete Schema
 * @description Toplu lookup verisi silme validasyonu
 * 
 * Zorunlu Alanlar:
 * - ids: Silinecek ID'lerin dizisi
 * 
 * @example
 * {
 *   "ids": [1, 2, 3]
 * }
 */
const bulkDeleteSchema = Joi.object({
  ids: Joi.array()
    .items(idSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'En az 1 ID silinmelidir',
      'array.max': 'En fazla 100 ID silinebilir',
      'any.required': 'ID\'ler zorunludur'
    })
});

// ==================== END BULK OPERATION SCHEMAS ====================

/**
 * LookupSchemas modülü export'ları
 * @description Tüm lookup validasyon şemalarını dışa aktarır
 * 
 * Ana Şemalar:
 * - specialtySchema: Uzmanlık alanı
 * - citySchema: Şehir
 * - doctorEducationTypeSchema: Doktor eğitim türü
 * - languageLevelSchema: Dil seviyesi
 * - languageSchema: Dil
 * - certificateTypeSchema: Sertifika türü
 * - jobStatusSchema: İş durumu
 * - applicationStatusSchema: Başvuru durumu
 * 
 * Yardımcı Şemalar:
 * - lookupQuerySchema: Query parametreleri
 * - lookupIdParamSchema: ID parametresi
 * - bulkCreateSchema: Toplu oluşturma
 * - bulkUpdateSchema: Toplu güncelleme
 * - bulkDeleteSchema: Toplu silme
 */
module.exports = {
  // Ana lookup şemaları
  specialtySchema,
  citySchema,
  doctorEducationTypeSchema,
  languageLevelSchema,
  languageSchema,
  certificateTypeSchema,
  jobStatusSchema,
  applicationStatusSchema,
  
  // Query şemaları
  lookupQuerySchema,
  
  // Parametre şemaları
  lookupIdParamSchema,
  
  // Toplu işlem şemaları
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  
  // Yardımcı şemalar
  idSchema,
  nameSchema,
  descriptionSchema
};

// ==================== END MODULE EXPORTS ====================
