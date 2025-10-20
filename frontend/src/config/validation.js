/**
 * @file validation.js
 * @description Tüm validation schemas - Backend schemas ile tam uyumlu
 * Zod ile frontend form doğrulama şemaları
 * 
 * Backend Uyumluluk:
 * - Backend Joi şemalarıyla birebir uyumlu
 * - Aynı validasyon kuralları ve hata mesajları
 * - Aynı field isimleri ve yapıları
 * 
 * @author MediKariyer Development Team
 * @version 5.0.0
 * @since 2024
 */

import { z } from 'zod';

// ==================== BASE VALIDATION SCHEMAS ====================

/**
 * Email Schema - Backend emailSchema ile tam uyumlu
 * @description E-posta adresi validasyonu - format, uzunluk, güvenlik kontrolleri
 */
const emailSchema = z
  .string()
  .email('Geçerli bir e-posta adresi giriniz')
  .max(255, 'E-posta adresi en fazla 255 karakter olabilir')
  .transform((val) => val.toLowerCase().trim())
  .refine((val) => !val.includes('..'), 'E-posta adresi ardışık nokta içeremez')
  .refine((val) => !val.startsWith('.') && !val.endsWith('.'), 'E-posta adresi nokta ile başlayamaz veya bitemez')
  .refine((val) => {
    const spamDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = val.split('@')[1];
    return !spamDomains.includes(domain);
  }, 'Geçici e-posta servisleri kullanılamaz');

/**
 * Password Schema - Backend passwordSchema ile tam uyumlu
 * @description Şifre validasyonu - uzunluk, güvenlik kontrolleri
 */
const passwordSchema = z
  .string()
  .min(6, 'Şifre en az 6 karakter olmalıdır')
  .max(128, 'Şifre en fazla 128 karakter olabilir')
  .refine((val) => !val.includes(' '), 'Şifre boşluk içeremez')
  .refine((val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), 'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir')
  .refine((val) => !/(.)\1{2,}/.test(val), 'Şifre aynı karakterin 3 kez tekrarını içeremez');

/**
 * Name Schema - Backend nameSchema ile tam uyumlu
 * @description İsim validasyonu - uzunluk, karakter kontrolleri
 */
const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalıdır')
  .max(50, 'İsim en fazla 50 karakter olabilir')
  .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf ve boşluk içerebilir')
  .transform((val) => val.trim());

/**
 * Phone Schema - Backend phoneSchema ile tam uyumlu
 * @description Telefon numarası validasyonu - format kontrolleri
 */
const phoneSchema = z
  .string()
  .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz (örn: 05551234567)')
  .transform((val) => {
    // +90 ile başlıyorsa +90'ı kaldır
    if (val.startsWith('+90')) return val.substring(3);
    // 0 ile başlıyorsa 0'ı kaldır
    if (val.startsWith('0')) return val.substring(1);
    return val;
  });

/**
 * ID Schema - Backend idSchema ile tam uyumlu
 * @description Pozitif tam sayı ID validasyonu
 */
const idSchema = z.number().int().positive('Geçerli bir ID giriniz');

/**
 * Date Schema - Backend dateSchema ile tam uyumlu
 * @description Tarih validasyonu
 */
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)');

// ==================== AUTH VALIDATION SCHEMAS ====================

/**
 * Login Schema - Backend loginSchema ile tam uyumlu
 * @description Giriş formu validasyonu
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre zorunludur'),
  role: z.enum(['admin', 'doctor', 'hospital']).optional()
});

/**
 * Doctor Registration Schema - Backend registerDoctorSchema ile tam uyumlu
 * @description Doktor kayıt formu validasyonu
 */
export const registerDoctorSchema = z.object({
  email: emailSchema,
  password: z.string().min(3, 'Şifre en az 3 karakter olmalıdır').max(128, 'Şifre en fazla 128 karakter olabilir'),
  first_name: nameSchema,
  last_name: nameSchema,
  title: z.enum(['Dr.', 'Uz. Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.'], {
    errorMap: () => ({ message: 'Geçerli bir ünvan seçiniz' })
  }),
  specialty_id: z.number().int().positive('Branş seçimi zorunludur'),
  subspecialty_id: z.number().int().positive().optional(),
  profile_photo: z.string().min(1, 'Profil fotoğrafı zorunludur').refine(
    (val) => val.startsWith('data:image/') || val.startsWith('http'),
    'Geçerli bir fotoğraf formatı giriniz'
  )
});

/**
 * Hospital Registration Schema - Backend registerHospitalSchema ile tam uyumlu
 * @description Hastane kayıt formu validasyonu
 */
export const registerHospitalSchema = z.object({
  email: emailSchema,
  password: z.string().min(3, 'Şifre en az 3 karakter olmalıdır').max(128, 'Şifre en fazla 128 karakter olabilir'),
  institution_name: z.string().min(2, 'Kurum adı en az 2 karakter olmalıdır').max(255, 'Kurum adı en fazla 255 karakter olabilir'),
  city_id: z.number().int().positive('Şehir seçimi zorunludur'),
  phone: z.string().min(3, 'Telefon numarası zorunludur'),
  logo: z.string().min(1, 'Logo yüklenmesi zorunludur')
});

/**
 * Change Password Schema - Backend changePasswordSchema ile tam uyumlu
 * @description Şifre değiştirme formu validasyonu
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre zorunludur'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Yeni şifreler eşleşmiyor',
  path: ['confirmPassword']
});

/**
 * Refresh Token Schema - Backend refreshTokenSchema ile tam uyumlu
 * @description Token yenileme formu validasyonu
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token zorunludur')
});

/**
 * Logout Schema - Backend logoutSchema ile tam uyumlu
 * @description Çıkış formu validasyonu
 */
export const logoutSchema = z.object({});

// ==================== DOCTOR VALIDATION SCHEMAS ====================

/**
 * Doctor Personal Info Schema - Backend doctorPersonalInfoSchema ile tam uyumlu
 * @description Doktor kişisel bilgileri validasyonu
 */
export const doctorPersonalInfoSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  title: z.enum(['Dr.', 'Uz. Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.']).optional(),
  specialty_id: z.number().int().positive('Uzmanlık seçimi zorunludur'),
  subspecialty_id: z.number().int().positive().optional().nullable(),
  profile_photo: z.string().optional(),
  dob: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return date <= new Date();
  }, 'Doğum tarihi bugünden önce olmalıdır').or(z.literal('')),
  birth_place_id: z.number().int().positive().optional().nullable(),
  residence_city_id: z.number().int().positive().optional().nullable(),
  phone: phoneSchema.optional().or(z.literal(''))
});

/**
 * Doctor Education Schema - Backend doctorEducationSchema ile tam uyumlu
 * @description Doktor eğitim formu validasyonu
 */
export const doctorEducationSchema = z.object({
  education_type_id: idSchema,
  education_institution: z.string().min(2, 'Eğitim kurumu adı en az 2 karakter olmalıdır').max(255, 'Eğitim kurumu adı en fazla 255 karakter olabilir'),
  field: z.string().min(2, 'Alan adı en az 2 karakter olmalıdır').max(255, 'Alan adı en fazla 255 karakter olabilir'),
  graduation_year: z.number().int().min(1950, 'Mezuniyet yılı 1950\'den küçük olamaz').max(new Date().getFullYear() + 5, 'Mezuniyet yılı gelecek yıldan büyük olamaz'),
  // Not: Eğitim türü sadece eğitim türü "DİĞER" ise doldurulmalı; diğer durumlarda boş string gelebilir
  education_type: z.string().min(2, 'Eğitim türü en az 2 karakter olmalıdır').max(100, 'Eğitim türü en fazla 100 karakter olabilir').optional().or(z.literal('')),
  // Sertifika bilgileri (opsiyonel - elle yazılır)
  certificate_name: z.string().min(2, 'Sertifika türü en az 2 karakter olmalıdır').max(255, 'Sertifika türü en fazla 255 karakter olabilir').optional().nullable().or(z.literal('')),
  certificate_year: z.number().int().min(1950, 'Sertifika yılı 1950\'den küçük olamaz').max(new Date().getFullYear(), 'Sertifika yılı bugünden büyük olamaz').optional().nullable()
});

/**
 * Doctor Experience Schema - Backend doctorExperienceSchema ile tam uyumlu
 * @description Doktor deneyim formu validasyonu
 */
export const doctorExperienceSchema = z.object({
  organization: z.string().min(2, 'Kurum adı en az 2 karakter olmalıdır').max(255, 'Kurum adı en fazla 255 karakter olabilir'),
  role_title: z.string().min(2, 'Pozisyon adı en az 2 karakter olmalıdır').max(255, 'Pozisyon adı en fazla 255 karakter olabilir'),
  specialty_id: idSchema,
  // Yan dal boş olabilir: null veya empty-string kabul edelim, backend'e null gönderelim
  subspecialty_id: idSchema.optional().nullable().or(z.literal('')),
  start_date: dateSchema,
  // is_current=true iken null olabilir
  end_date: dateSchema.optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().max(1000, 'Açıklama en fazla 1000 karakter olabilir').optional().nullable()
});

/**
 * Doctor Certificate Schema - Backend doctorCertificateSchema ile tam uyumlu
 * @description Doktor sertifika formu validasyonu (elle yazılan tür + yıl)
 */
export const doctorCertificateSchema = z.object({
  certificate_name: z.string()
    .min(2, 'Sertifika türü en az 2 karakter olmalıdır')
    .max(255, 'Sertifika türü en fazla 255 karakter olabilir'),
  institution: z.string()
    .min(2, 'Kurum adı en az 2 karakter olmalıdır')
    .max(255, 'Kurum adı en fazla 255 karakter olabilir'),
  certificate_year: z.number()
    .int('Sertifika yılı geçerli bir sayı olmalıdır')
    .min(1950, 'Sertifika yılı 1950\'den küçük olamaz')
    .max(new Date().getFullYear(), 'Sertifika yılı bugünden büyük olamaz')
});

/**
 * Doctor Language Schema - Backend doctorLanguageSchema ile tam uyumlu
 * @description Doktor dil formu validasyonu
 */
export const doctorLanguageSchema = z.object({
  language_id: idSchema,
  level_id: idSchema
});

/**
 * Profile Update Notification Schema - Backend profileUpdateNotificationSchema ile tam uyumlu
 * @description Profil güncelleme bildirimi validasyonu
 */
export const profileUpdateNotificationSchema = z.object({
  updateType: z.enum(['personal_info', 'education', 'experience', 'certificate', 'language']),
  updateDescription: z.string().min(5, 'Güncelleme açıklaması en az 5 karakter olmalıdır').max(200, 'Güncelleme açıklaması en fazla 200 karakter olabilir')
});

// ==================== HOSPITAL VALIDATION SCHEMAS ====================

/**
 * Hospital Profile Schema - Backend hospitalProfileSchema ile tam uyumlu
 * @description Hastane profil güncelleme formu validasyonu
 */
export const hospitalProfileUpdateSchema = z.object({
  institution_name: z.string().min(2, 'Kurum adı en az 2 karakter olmalıdır').max(255, 'Kurum adı en fazla 255 karakter olabilir'),
  city_id: z.number().int().positive('Şehir seçimi zorunludur'),
  address: z.string().max(500, 'Adres en fazla 500 karakter olabilir').optional(),
  contact_person: z.string().min(2, 'İletişim kişisi en az 2 karakter olmalıdır').max(100, 'İletişim kişisi en fazla 100 karakter olabilir').optional(),
  phone: z.string().min(3, 'Telefon numarası zorunludur').max(20, 'Telefon numarası en fazla 20 karakter olabilir'),
  website: z.string().url('Geçerli bir website adresi giriniz').optional(),
  about: z.string().max(2000, 'Hakkında bölümü en fazla 2000 karakter olabilir').optional(),
  logo: z.string().refine(
    (val) => val.startsWith('data:image/') || val.startsWith('http'),
    'Geçerli bir logo formatı giriniz'
  )
});

/**
 * Hospital Department Schema - Backend departmentSchema ile tam uyumlu
 * @description Hastane departman formu validasyonu
 */
export const hospitalDepartmentSchema = z.object({
  department_name: z.string().min(2, 'Departman adı en az 2 karakter olmalıdır').max(255, 'Departman adı en fazla 255 karakter olabilir'),
  description: z.string().max(500, 'Departman açıklaması en fazla 500 karakter olabilir').optional()
});

/**
 * Hospital Contact Schema - Backend contactSchema ile tam uyumlu
 * @description Hastane iletişim formu validasyonu
 */
export const hospitalContactSchema = z.object({
  phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{10,20}$/, 'Geçerli bir telefon numarası giriniz').optional(),
  email: z.string().email('Geçerli bir email adresi giriniz').optional()
});

// ==================== JOB VALIDATION SCHEMAS ====================

/**
 * Job Schema - Backend jobSchema ile tam uyumlu
 * @description İş ilanı formu validasyonu
 */
export const jobSchema = z.object({
  title: z.string().min(5, 'İş ilanı başlığı en az 5 karakter olmalıdır').max(255, 'İş ilanı başlığı en fazla 255 karakter olabilir'),
  specialty_id: idSchema,
  subspecialty_id: idSchema,
  city_id: idSchema,
  employment_type: z.enum(['Tam Zamanlı', 'Yarı Zamanlı', 'Nöbet Usulü'], {
    errorMap: () => ({ message: 'İstihdam türü "Tam Zamanlı", "Yarı Zamanlı" veya "Nöbet Usulü" olmalıdır' })
  }),
  min_experience_years: z.number().int().min(0, 'Minimum deneyim yılı 0\'dan küçük olamaz').max(50, 'Minimum deneyim yılı 50\'den büyük olamaz').nullable().optional(),
  description: z.string().min(10, 'İş tanımı en az 10 karakter olmalıdır').max(5000, 'İş tanımı en fazla 5000 karakter olabilir'),
  // status_id sadece güncelleme için geçerli (oluşturmada backend otomatik 1 yapar)
  // 1=Aktif, 2=Pasif, 3=Silinmiş (geri getirebilmek için 3 de kabul edilmeli)
  status_id: z.number().int().positive()
    .refine((val) => [1, 2, 3].includes(val), 'Sadece Aktif (1), Pasif (2) veya Silinmiş (3) seçilebilir')
    .optional()
});

/**
 * Application Status Schema - Backend applicationStatusSchema ile tam uyumlu
 * @description Başvuru durumu güncelleme formu validasyonu
 */
export const applicationStatusUpdateSchema = z.object({
  status: idSchema,
  notes: z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir').optional()
});

// ==================== CONTACT VALIDATION SCHEMAS ====================

/**
 * Contact Schema - Backend contactSchema ile tam uyumlu
 * @description İletişim formu validasyonu
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
  email: emailSchema,
  phone: z.string().regex(/^[0-9+\-\s\(\)]+$/, 'Geçerli bir telefon numarası giriniz').min(10, 'Telefon numarası en az 10 karakter olmalıdır').max(20, 'Telefon numarası en fazla 20 karakter olabilir').optional(),
  subject: z.string().min(5, 'Konu en az 5 karakter olmalıdır').max(200, 'Konu en fazla 200 karakter olabilir').optional(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır').max(2000, 'Mesaj en fazla 2000 karakter olabilir')
});

/**
 * Contact Message Schema - contactSchema ile aynı
 * @description İletişim mesajı formu validasyonu (legacy uyumluluk için)
 */
export const contactMessageSchema = contactSchema;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Transform lookup data - Backend transformLookupData ile tam uyumlu
 * @description Lookup verilerini frontend formatına dönüştürür
 */
export const transformLookupData = (data) => {
  if (!data) return [];
  
  // Eğer data bir array ise, direkt array olarak döndür
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item.id,
      name: item.name,
      label: item.name, // Frontend için label ekle
      value: item.id,   // Frontend için value ekle
      slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'),
      ...item
    }));
  }
  
  // Eğer data bir obje ise, eski format için dönüşüm
  const transformed = {};
  
  // Her lookup türü için dönüşüm
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      transformed[key] = data[key].map(item => ({
        id: item.id,
        name: item.name,
        label: item.name, // Frontend için label ekle
        value: item.id,   // Frontend için value ekle
        slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'),
        ...item
      }));
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      // Object'i array'e çevir (indexed object -> array)
      const objToArray = Object.values(data[key]).map(item => ({
        id: item.id,
        name: item.name,
        label: item.name, // Frontend için label ekle
        value: item.id,   // Frontend için value ekle
        slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'),
        ...item
      }));
      transformed[key] = objToArray;
    } else {
      transformed[key] = data[key];
    }
  });
  
  return transformed;
};

/**
 * Format validation errors - Backend formatValidationErrors ile tam uyumlu
 * @description Zod hatalarını kullanıcı dostu formata dönüştürür
 */
export const formatValidationErrors = (error) => {
  if (!error || !error.errors) return {};
  
  const formatted = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  
  return formatted;
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Login validation function - Backend ile uyumlu
 * @param {Object} data - Login data
 * @returns {Object} Validation result
 */
export const validateLogin = (data) => {
  try {
    const validatedData = loginSchema.parse(data);
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      data: null, 
      errors: error.errors?.map(err => err.message) || ['Validation error'] 
    };
  }
};

/**
 * Doctor registration validation function - Backend ile uyumlu
 * @param {Object} data - Doctor registration data
 * @returns {Object} Validation result
 */
export const validateDoctorRegister = (data) => {
  try {
    const validatedData = registerDoctorSchema.parse(data);
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      data: null, 
      errors: error.errors?.map(err => err.message) || ['Validation error'] 
    };
  }
};

/**
 * Hospital registration validation function - Backend ile uyumlu
 * @param {Object} data - Hospital registration data
 * @returns {Object} Validation result
 */
export const validateHospitalRegister = (data) => {
  try {
    const validatedData = registerHospitalSchema.parse(data);
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      data: null, 
      errors: error.errors?.map(err => err.message) || ['Validation error'] 
    };
  }
};

/**
 * Refresh token validation function - Backend ile uyumlu
 * @param {Object} data - Refresh token data
 * @returns {Object} Validation result
 */
export const validateRefreshToken = (data) => {
  try {
    const validatedData = refreshTokenSchema.parse(data);
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      data: null, 
      errors: error.errors?.map(err => err.message) || ['Validation error'] 
    };
  }
};

/**
 * Logout validation function - Backend ile uyumlu
 * @param {Object} data - Logout data
 * @returns {Object} Validation result
 */
export const validateLogout = (data) => {
  try {
    const validatedData = logoutSchema.parse(data);
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      data: null, 
      errors: error.errors?.map(err => err.message) || ['Validation error'] 
    };
  }
};

// ==================== EXPORT ALL SCHEMAS ====================

export default {
  // Auth schemas
  loginSchema,
  registerDoctorSchema,
  registerHospitalSchema,
  changePasswordSchema,
  refreshTokenSchema,
  logoutSchema,
  
  // Doctor schemas
  doctorPersonalInfoSchema,
  doctorEducationSchema,
  doctorExperienceSchema,
  doctorCertificateSchema,
  doctorLanguageSchema,
  profileUpdateNotificationSchema,
  
  // Hospital schemas
  hospitalProfileUpdateSchema,
  hospitalDepartmentSchema,
  hospitalContactSchema,
  
  // Job schemas
  jobSchema,
  applicationStatusUpdateSchema,
  
  // Contact schemas
  contactSchema,
  
  // Legacy schemas
  contactMessageSchema: contactSchema,
  doctorProfileSchema: doctorPersonalInfoSchema,
  hospitalProfileSchema: hospitalProfileUpdateSchema,
  
  // Utility functions
  transformLookupData,
  formatValidationErrors,
  
  // Validation functions
  validateLogin,
  validateDoctorRegister,
  validateHospitalRegister,
  validateRefreshToken,
  validateLogout,
};
