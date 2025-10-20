/**
 * @file doctorSchemas.js
 * @description Doktor validasyon şemaları - Doktor ile ilgili tüm input validasyonlarını içerir.
 * Bu dosya, Joi kütüphanesi kullanarak doktor verilerinin doğruluğunu kontrol eder.
 * 
 * Ana Şemalar:
 * - doctorPersonalInfoSchema: Kişisel bilgiler validasyonu
 * - doctorEducationSchema: Eğitim bilgileri validasyonu
 * - doctorExperienceSchema: Deneyim bilgileri validasyonu
 * - doctorCertificateSchema: Sertifika bilgileri validasyonu
 * - doctorLanguageSchema: Dil bilgileri validasyonu
 * 
 * Validasyon Kuralları:
 * - String uzunluk kontrolü (min/max)
 * - Email format kontrolü
 * - Telefon numarası format kontrolü (Türkiye)
 * - Tarih format kontrolü
 * - Sayı aralık kontrolü
 * - Enum değer kontrolü
 * - Zorunlu alan kontrolü
 * 
 * Kullanım Alanları:
 * - Route middleware'lerinde input validasyonu
 * - API endpoint'lerinde veri doğrulama
 * - Frontend-backend veri uyumluluğu
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * @file doctorSchemas.js
 * @description Doktor profiliyle ilgili (kişisel bilgiler, eğitim, deneyim, sertifikalar, diller)
 * tüm CRUD işlemleri için kullanılan Joi doğrulama şemalarını içerir.
 */

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const Joi = require('joi');

// ============================================================================
// TEMEL DOĞRULAMA ŞEMALARI
// ============================================================================

/**
 * @description Bu dosyadaki şemalarda tekrar eden alanlar için temel Joi doğrulama şemaları.
 */
const phoneSchema = Joi.string().pattern(/^(\+90|0)?[5][0-9]{9}$/).messages({
  'string.pattern.base': 'Geçerli bir Türkiye telefon numarası giriniz (örn: +905551234567)'
});

const dateSchema = Joi.date().messages({
  'date.base': 'Geçerli bir tarih giriniz'
});

// ============================================================================
// DOKTOR PROFİL ŞEMALARI
// ============================================================================

/**
 * Doktor kişisel bilgileri validasyon şeması
 * @description Doktorun temel kişisel bilgilerini (ad, soyad, telefon, doğum tarihi vb.) doğrular
 * @param {string} first_name - Doktorun adı (zorunlu, 2-50 karakter)
 * @param {string} last_name - Doktorun soyadı (zorunlu, 2-50 karakter)
 * @param {string} [phone] - Telefon numarası (Türkiye formatı)
 * @param {Date} [dob] - Doğum tarihi
 * @param {string} [birth_place] - Doğum yeri (max 100 karakter)
 * @param {string} [residence_city] - İkamet şehri (max 100 karakter)
 * @param {string} [title] - Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * @param {string} [work_type] - Çalışma türü (tam_zamanli, yari_zamanli, nobet)
 * @param {string} [profile_photo] - Profil fotoğrafı URL'si
 * @returns {Object} Joi validasyon şeması
 * 
 * @example
 * const { error, value } = doctorPersonalInfoSchema.validate({
 *   first_name: 'Ahmet',
 *   last_name: 'Yılmaz',
 *   phone: '+905551234567',
 *   dob: '1990-01-01',
 *   title: 'Uz.Dr',
 *   work_type: 'tam_zamanli'
 * });
 */
const doctorPersonalInfoSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 50 karakter olabilir',
    'any.required': 'Ad zorunludur'
  }),
  last_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 50 karakter olabilir',
    'any.required': 'Soyad zorunludur'
  }),
  specialty_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Branş seçimi zorunludur',
    'any.required': 'Branş seçimi zorunludur'
  }),
  subspecialty_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Geçerli bir yan dal seçiniz'
  }),
  dob: Joi.date().max('now').optional().allow(null).messages({
    'date.base': 'Geçerli bir doğum tarihi giriniz',
    'date.max': 'Doğum tarihi bugünden önce olmalıdır'
  }),
  birth_place_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Doğum yeri şehir ID sayısal olmalıdır'
  }),
  residence_city_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'İkamet şehri ID sayısal olmalıdır'
  }),
  phone: phoneSchema.optional().allow('', null).messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  }),
  title: Joi.string().valid('Dr.', 'Uz. Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.').optional().messages({
    'any.only': 'Ünvan Dr., Uz. Dr., Dr. Öğr. Üyesi, Doç. Dr. veya Prof. Dr. olmalıdır'
  }),
  profile_photo: Joi.string().max(5000000).optional().messages({
    'string.max': 'Profil fotoğrafı çok büyük (maksimum 5MB)'
  })
});

// ============================================================================
// EĞİTİM BİLGİLERİ ŞEMALARI
// ============================================================================

/**
 * Doktor eğitim bilgileri validasyon şeması
 * @description Doktorun eğitim bilgilerini (üniversite, uzmanlık vb.) doğrular
 * @param {number} education_type_id - Eğitim türü ID'si (lookup tablosundan)
 * @param {string} education_institution - Eğitim kurumu (zorunlu, 2-255 karakter)
 * @param {string} education_type - Eğitim türü (zorunlu, 2-100 karakter)
 * @param {string} [certificate_name] - Sertifika türü/adı (opsiyonel, elle yazılır, 2-255 karakter)
 * @param {number} [certificate_year] - Sertifika yılı (opsiyonel, sadece yıl olarak girilir, 1950-şimdi arası)
 * @param {string} field - Alan adı (zorunlu, 2-255 karakter)
 * @param {number} graduation_year - Mezuniyet yılı (zorunlu, 1950-2030 arası)
 * @returns {Object} Joi validasyon şeması
 * 
 * @example
 * const { error, value } = doctorEducationSchema.validate({
 *   education_type_id: 1,
 *   education_institution: 'İstanbul Üniversitesi',
 *   education_type: 'Tıp Fakültesi',
 *   certificate_name: 'Tıp Doktoru Diploması',
 *   certificate_year: 2015,
 *   field: 'Tıp',
 *   graduation_year: 2015
 * });
 */
const doctorEducationSchema = Joi.object({
  education_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Eğitim türü ID\'si sayı olmalıdır',
    'number.integer': 'Eğitim türü ID\'si tam sayı olmalıdır',
    'number.positive': 'Eğitim türü ID\'si pozitif olmalıdır',
    'any.required': 'Eğitim türü zorunludur'
  }),
  education_institution: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Eğitim kurumu adı en az 2 karakter olmalıdır',
    'string.max': 'Eğitim kurumu adı en fazla 255 karakter olabilir',
    'any.required': 'Eğitim kurumu adı zorunludur'
  }),
  field: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Alan adı en az 2 karakter olmalıdır',
    'string.max': 'Alan adı en fazla 255 karakter olabilir',
    'any.required': 'Alan adı zorunludur'
  }),
  graduation_year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 5).required().messages({
    'number.base': 'Geçerli bir mezuniyet yılı giriniz',
    'number.min': 'Mezuniyet yılı 1950\'den küçük olamaz',
    'number.max': 'Mezuniyet yılı gelecek yıldan büyük olamaz',
    'any.required': 'Mezuniyet yılı zorunludur'
  }),
  // Not: "DİĞER" seçilirse education_type zorunlu; kontrol service katmanında yapılır
  education_type: Joi.string().min(2).max(100).optional().allow('', null).messages({
    'string.min': 'Eğitim türü en az 2 karakter olmalıdır',
    'string.max': 'Eğitim türü en fazla 100 karakter olabilir'
  }),
  certificate_name: Joi.string().min(2).max(255).optional().allow('', null).messages({
    'string.min': 'Sertifika türü en az 2 karakter olmalıdır',
    'string.max': 'Sertifika türü en fazla 255 karakter olabilir'
  }),
  certificate_year: Joi.number().integer().min(1950).max(new Date().getFullYear()).optional().allow(null).messages({
    'number.base': 'Geçerli bir sertifika yılı giriniz',
    'number.min': 'Sertifika yılı 1950\'den küçük olamaz',
    'number.max': 'Sertifika yılı bugünden büyük olamaz'
  })
});

// ============================================================================
// DENEYİM BİLGİLERİ ŞEMALARI
// ============================================================================

/**
 * Doktor deneyim bilgileri validasyon şeması
 * @description Doktorun iş deneyimlerini doğrular
 * @param {string} organization - Kurum adı (zorunlu, 2-255 karakter)
 * @param {string} role_title - Pozisyon adı (zorunlu, 2-255 karakter)
 * @param {Date} start_date - Başlangıç tarihi (zorunlu)
 * @param {Date} [end_date] - Bitiş tarihi (opsiyonel, NULL olabilir)
 * @param {boolean} [is_current] - Hala çalışıyor mu (opsiyonel, default: false)
 * @param {string} [description] - İş açıklaması (opsiyonel, max 1000 karakter)
 * @returns {Object} Joi validasyon şeması
 * 
 * @note is_current = true ise end_date = NULL olmalı
 * 
 * @example
 * const { error, value } = doctorExperienceSchema.validate({
 *   organization: 'Acıbadem Hastanesi',
 *   role_title: 'Uzman Doktor',
 *   start_date: '2020-01-01',
 *   is_current: true,
 *   description: 'Kardiyoloji departmanında çalışıyorum'
 * });
 */
const doctorExperienceSchema = Joi.object({
  organization: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Kurum adı en az 2 karakter olmalıdır',
    'string.max': 'Kurum adı en fazla 255 karakter olabilir',
    'any.required': 'Kurum adı zorunludur'
  }),
  role_title: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Pozisyon adı en az 2 karakter olmalıdır',
    'string.max': 'Pozisyon adı en fazla 255 karakter olabilir',
    'any.required': 'Pozisyon adı zorunludur'
  }),
  specialty_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Uzmanlık alanı seçilmelidir',
    'number.positive': 'Geçersiz uzmanlık alanı',
    'any.required': 'Uzmanlık alanı zorunludur'
  }),
  subspecialty_id: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': 'Geçersiz yan dal uzmanlık',
    'number.positive': 'Geçersiz yan dal uzmanlık'
  }),
  start_date: dateSchema.required().messages({
    'any.required': 'Başlangıç tarihi zorunludur'
  }),
  end_date: Joi.alternatives().try(
    dateSchema.greater(Joi.ref('start_date')),
    Joi.valid(null)
  ).optional().messages({
    'date.greater': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
  }),
  is_current: Joi.boolean().default(false).messages({
    'boolean.base': 'Hala çalışıyor mu alanı boolean olmalıdır'
  }),
  description: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'Açıklama en fazla 1000 karakter olabilir'
  })
}).custom((value, helpers) => {
  // Eğer is_current = true ise end_date = NULL olmalı
  if (value.is_current === true && value.end_date !== null && value.end_date !== undefined) {
    return helpers.error('any.invalid', { message: 'Hala çalışıyorsanız bitiş tarihi boş olmalıdır' });
  }
  return value;
});

// ============================================================================
// SERTİFİKA BİLGİLERİ ŞEMALARI
// ============================================================================

/**
 * Doktor sertifika bilgileri validasyon şeması
 * @description Sertifika türü (elle), kurum ve yıl doğrulaması
 * @param {string} certificate_name - Sertifika türü/adı (2-255)
 * @param {string} institution - Kurum adı (2-255)
 * @param {number} certificate_year - Yıl (1950 - now)
 */
const doctorCertificateSchema = Joi.object({
  certificate_name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Sertifika türü en az 2 karakter olmalıdır',
    'string.max': 'Sertifika türü en fazla 255 karakter olabilir',
    'any.required': 'Sertifika türü zorunludur'
  }),
  institution: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Kurum adı en az 2 karakter olmalıdır',
    'string.max': 'Kurum adı en fazla 255 karakter olabilir',
    'any.required': 'Kurum adı zorunludur'
  }),
  certificate_year: Joi.number().integer().min(1950).max(new Date().getFullYear()).required().messages({
    'number.base': 'Sertifika yılı sayı olmalıdır',
    'number.integer': 'Sertifika yılı tam sayı olmalıdır',
    'number.min': 'Sertifika yılı 1950\'den küçük olamaz',
    'number.max': 'Sertifika yılı bugünden büyük olamaz',
    'any.required': 'Sertifika yılı zorunludur'
  })
});

// ============================================================================
// DİL BİLGİLERİ ŞEMALARI
// ============================================================================

/**
 * Doktor dil bilgileri validasyon şeması
 * @description Doktorun dil bilgilerini doğrular
 * @param {number} language_id - Dil ID'si (languages tablosundan)
 * @param {number} level_id - Dil seviyesi ID'si (language_levels tablosundan)
 * @returns {Object} Joi validasyon şeması
 * 
 * @example
 * const { error, value } = doctorLanguageSchema.validate({
 *   language_id: 1,
 *   level_id: 2
 * });
 */
const doctorLanguageSchema = Joi.object({
  language_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Dil ID\'si sayı olmalıdır',
    'number.integer': 'Dil ID\'si tam sayı olmalıdır',
    'number.positive': 'Dil ID\'si pozitif olmalıdır',
    'any.required': 'Dil ID\'si zorunludur'
  }),
  level_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Dil seviyesi ID\'si sayı olmalıdır',
    'number.integer': 'Dil seviyesi ID\'si tam sayı olmalıdır',
    'number.positive': 'Dil seviyesi ID\'si pozitif olmalıdır',
    'any.required': 'Dil seviyesi ID\'si zorunludur'
  })
});

/**
 * Profil güncelleme bildirimi şeması
 * @description Doktor profili güncellendiğinde bildirim gönderirken kullanılan validation şeması
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * { updateType: "education", updateDescription: "Yeni eğitim bilgisi eklendi" }
 */
const profileUpdateNotificationSchema = Joi.object({
  updateType: Joi.string()
    .valid('personal_info', 'education', 'experience', 'certificate', 'language')
    .required()
    .messages({
      'any.only': 'Güncelleme türü geçerli değerlerden biri olmalıdır: personal_info, education, experience, certificate, language',
      'any.required': 'Güncelleme türü zorunludur'
    }),
    
  updateDescription: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Güncelleme açıklaması en az 5 karakter olmalıdır',
      'string.max': 'Güncelleme açıklaması en fazla 200 karakter olabilir',
      'any.required': 'Güncelleme açıklaması zorunludur'
    })
});

// ============================================================================
// BAŞVURU ŞEMALARI (applicationSchemas'dan taşındı)
// ============================================================================

/**
 * Doktorlar için yeni iş başvurusu oluşturma şeması
 * @description Doktor tarafından yeni iş ilanı başvurusu oluştururken kullanılan validation şeması
 * İş ilanı ID'si zorunlu, özet mektubu opsiyonel
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * {
 *   jobId: 123,
 *   coverLetter: "Bu pozisyon için çok uygun olduğumu düşünüyorum..."
 * }
 */
const createApplicationSchema = Joi.object({
  jobId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'İş ilanı ID\'si sayı olmalıdır',
      'number.integer': 'İş ilanı ID\'si tam sayı olmalıdır',
      'number.positive': 'İş ilanı ID\'si pozitif sayı olmalıdır',
      'any.required': 'İş ilanı ID\'si zorunludur'
    }),
    
  coverLetter: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Özet mektubu en fazla 2000 karakter olabilir'
    })
});

/**
 * Başvuru geri çekme şeması
 * @description Doktor tarafından başvuru geri çekilirken kullanılan validation şeması
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * {
 *   reason: "Başka bir pozisyon buldum"
 * }
 */
const withdrawApplicationSchema = Joi.object({
  reason: Joi.string()
    .min(5)
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Geri çekme sebebi en az 5 karakter olmalıdır',
      'string.max': 'Geri çekme sebebi en fazla 500 karakter olabilir'
    })
});

/**
 * Başvuru filtreleme şeması
 * @description Doktor başvurularını filtrelerken kullanılan validation şeması
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * {
 *   status: "pending",
 *   page: 1,
 *   limit: 10
 * }
 */
const applicationFilterSchema = Joi.object({
  status: Joi.string()
    .valid('Başvuruldu', 'İnceleniyor', 'Kabul Edildi', 'Reddedildi', 'Geri Çekildi')
    .optional()
    .messages({
      'any.only': 'Durum geçerli değerlerden biri olmalıdır: Başvuruldu, İnceleniyor, Kabul Edildi, Reddedildi, Geri Çekildi'
    }),
    
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Sayfa numarası sayı olmalıdır',
      'number.integer': 'Sayfa numarası tam sayı olmalıdır',
      'number.min': 'Sayfa numarası en az 1 olmalıdır'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit sayı olmalıdır',
      'number.integer': 'Limit tam sayı olmalıdır',
      'number.min': 'Limit en az 1 olmalıdır',
      'number.max': 'Limit en fazla 100 olabilir'
    })
});

/**
 * Başvuru ID parametresi şeması
 * @description URL'deki başvuru ID parametresini doğrular
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * { id: 123 }
 */
const applicationIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Başvuru ID\'si sayı olmalıdır',
      'number.integer': 'Başvuru ID\'si tam sayı olmalıdır',
      'number.positive': 'Başvuru ID\'si pozitif sayı olmalıdır',
      'any.required': 'Başvuru ID\'si zorunludur'
    })
});

// ============================================================================
// İŞ İLANI ŞEMALARI (jobSchemas'dan taşındı)
// ============================================================================

/**
 * Hibrit ID şeması
 * @description Hem ID hem string kabul eden esnek şema
 * Öncelik ID'dedir, yoksa string kabul edilir
 * @type {Joi.AlternativesSchema}
 */
const hybridIdSchema = Joi.alternatives().try(
  Joi.number().integer().positive(),
  Joi.string().min(1).max(100)
).messages({
  'alternatives.match': 'Geçerli bir ID veya string değer giriniz'
});

/**
 * İş ilanı arama şeması
 * @description Doktorlar için iş ilanı arama ve filtreleme
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * {
 *   specialty: "Kardiyoloji",
 *   city: "İstanbul",
 *   hospital: "Acıbadem",
 *   search: "uzman",
 *   page: 1,
 *   limit: 10
 * }
 */
const jobSearchSchema = Joi.object({
  specialty: hybridIdSchema.optional(),
  city: Joi.string().min(2).max(50).allow('').optional().messages({
    'string.min': 'Şehir adı en az 2 karakter olmalıdır',
    'string.max': 'Şehir adı en fazla 50 karakter olabilir'
  }),
  hospital: hybridIdSchema.optional(),
  search: Joi.string().min(2).max(100).allow('').optional().messages({
    'string.min': 'Arama terimi en az 2 karakter olmalıdır',
    'string.max': 'Arama terimi en fazla 100 karakter olabilir'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Sayfa numarası sayı olmalıdır',
    'number.integer': 'Sayfa numarası tam sayı olmalıdır',
    'number.min': 'Sayfa numarası en az 1 olmalıdır'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit sayı olmalıdır',
    'number.integer': 'Limit tam sayı olmalıdır',
    'number.min': 'Limit en az 1 olmalıdır',
    'number.max': 'Limit en fazla 100 olabilir'
  })
});

/**
 * İş ilanı ID parametresi şeması
 * @description URL'deki iş ilanı ID parametresini doğrular
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * { id: 123 }
 */
const jobIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'İş ilanı ID\'si sayı olmalıdır',
      'number.integer': 'İş ilanı ID\'si tam sayı olmalıdır',
      'number.positive': 'İş ilanı ID\'si pozitif sayı olmalıdır',
      'any.required': 'İş ilanı ID\'si zorunludur'
    })
});

// ============================================================================
// DOKTOR PROFİL DETAY ID PARAMETRELERİ
// ============================================================================

/**
 * Eğitim ID parametresi şeması
 * @description URL'deki eğitim ID parametresini doğrular
 * @type {Joi.ObjectSchema}
 */
const educationIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Eğitim ID\'si sayı olmalıdır',
      'number.integer': 'Eğitim ID\'si tam sayı olmalıdır',
      'number.positive': 'Eğitim ID\'si pozitif sayı olmalıdır',
      'any.required': 'Eğitim ID\'si zorunludur'
    })
});

/**
 * Deneyim ID parametresi şeması
 * @description URL'deki deneyim ID parametresini doğrular
 * @type {Joi.ObjectSchema}
 */
const experienceIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Deneyim ID\'si sayı olmalıdır',
      'number.integer': 'Deneyim ID\'si tam sayı olmalıdır',
      'number.positive': 'Deneyim ID\'si pozitif sayı olmalıdır',
      'any.required': 'Deneyim ID\'si zorunludur'
    })
});

/**
 * Sertifika ID parametresi şeması
 * @description URL'deki sertifika ID parametresini doğrular
 * @type {Joi.ObjectSchema}
 */
const certificateIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Sertifika ID\'si sayı olmalıdır',
      'number.integer': 'Sertifika ID\'si tam sayı olmalıdır',
      'number.positive': 'Sertifika ID\'si pozitif sayı olmalıdır',
      'any.required': 'Sertifika ID\'si zorunludur'
    })
});

/**
 * Dil ID parametresi şeması
 * @description URL'deki dil ID parametresini doğrular
 * @type {Joi.ObjectSchema}
 */
const languageIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Dil ID\'si sayı olmalıdır',
      'number.integer': 'Dil ID\'si tam sayı olmalıdır',
      'number.positive': 'Dil ID\'si pozitif sayı olmalıdır',
      'any.required': 'Dil ID\'si zorunludur'
    })
});

/**
 * İş ilanı durum değişikliği bildirimi şeması
 * @description Admin tarafından iş ilanı durumu değiştirildiğinde bildirim gönderirken kullanılan validation şeması
 * @type {Joi.ObjectSchema}
 * 
 * @example
 * {
 *   newStatus: "closed",
 *   oldStatus: "active"
 * }
 */
const jobStatusChangeSchema = Joi.object({
  newStatus: Joi.string()
    .valid('Aktif', 'Pasif')
    .required()
    .messages({
      'any.only': 'Yeni durum geçerli değerlerden biri olmalıdır: Aktif, Pasif',
      'any.required': 'Yeni durum zorunludur'
    }),
    
  oldStatus: Joi.string()
    .valid('Aktif', 'Pasif')
    .required()
    .messages({
      'any.only': 'Eski durum geçerli değerlerden biri olmalıdır: Aktif, Pasif',
      'any.required': 'Eski durum zorunludur'
    })
});

module.exports = {
  // Doktor profil şemaları
  doctorPersonalInfoSchema,
  doctorEducationSchema,
  doctorExperienceSchema,
  doctorCertificateSchema,
  doctorLanguageSchema,
  profileUpdateNotificationSchema,
  
  // Başvuru şemaları
  createApplicationSchema,
  withdrawApplicationSchema,
  applicationFilterSchema,
  applicationIdParamSchema,
  
  // İş ilanı şemaları
  jobSearchSchema,
  jobIdParamSchema,
  jobStatusChangeSchema,
  
  // Profil detay ID parametreleri
  educationIdParamSchema,
  experienceIdParamSchema,
  certificateIdParamSchema,
  languageIdParamSchema,
  
  // Yardımcı şemalar
  hybridIdSchema
};