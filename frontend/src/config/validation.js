/**
 * @file validation.js
 * @description Validation Schemas - Frontend form doğrulama şemaları
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm form doğrulama şemalarını içerir.
 * Zod kütüphanesi kullanılarak type-safe validasyon şemaları oluşturulmuştur.
 * Backend Joi şemalarıyla birebir uyumlu olacak şekilde tasarlanmıştır.
 * 
 * Ana Özellikler:
 * - Backend uyumluluk: Backend Joi şemalarıyla birebir eşleşme
 * - Type safety: Zod ile tip güvenli validasyon
 * - Tutarlılık: Aynı validasyon kuralları ve hata mesajları
 * - Field eşleşmesi: Backend field isimleriyle birebir uyumlu
 * - Transform fonksiyonları: Veri formatlama ve dönüşüm
 * - Custom refine: Özel validasyon mantıkları
 * - Error formatting: Kullanıcı dostu hata mesajları
 * 
 * Backend Uyumluluk:
 * - Backend validators/*Schemas.js dosyalarıyla uyumlu
 * - Aynı validasyon kuralları ve sınırlar
 * - Aynı hata mesajları (Türkçe)
 * - Aynı field isimleri ve yapıları
 * 
 * Schema Kategorileri:
 * 1. BASE SCHEMAS: Email, password, name, phone, id, date (temel şemalar)
 * 2. AUTH SCHEMAS: Login, register, password change, token refresh
 * 3. DOCTOR SCHEMAS: Profil, eğitim, deneyim, sertifika, dil
 * 4. HOSPITAL SCHEMAS: Profil, departman, iletişim
 * 5. JOB SCHEMAS: İş ilanı, başvuru durumu
 * 6. CONTACT SCHEMAS: İletişim formu
 * 
 * Utility Fonksiyonlar:
 * - transformLookupData: Lookup verilerini frontend formatına dönüştürür
 * - formatValidationErrors: Zod hatalarını kullanıcı dostu formata dönüştürür
 * - validateLogin, validateDoctorRegister, vb.: Validasyon wrapper fonksiyonları
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * import { loginSchema, registerDoctorSchema } from '@config/validation';
 * 
 * // Schema ile validasyon
 * const result = loginSchema.safeParse(formData);
 * if (result.success) {
 *   // Valid data
 * } else {
 *   // Validation errors
 * }
 * 
 * // Utility fonksiyon ile
 * const { isValid, data, errors } = validateLogin(formData);
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 5.0.0
 * @since 2024
 */

import { z } from 'zod';

// ============================================================================
// BASE VALIDATION SCHEMAS - Temel validasyon şemaları
// ============================================================================

/**
 * Email Schema - Backend emailSchema ile tam uyumlu
 * 
 * E-posta adresi validasyonu için temel şema
 * Format, uzunluk ve güvenlik kontrolleri içerir
 * 
 * Validasyon Kuralları:
 * - Geçerli e-posta formatı
 * - Maksimum 255 karakter
 * - Küçük harfe dönüştürme ve trim
 * - Ardışık nokta kontrolü
 * - Başlangıç/bitiş nokta kontrolü
 * - Spam domain kontrolü (tempmail vb.)
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
 * 
 * Şifre validasyonu için temel şema
 * Güvenlik kuralları ve uzunluk kontrolleri içerir
 * 
 * Validasyon Kuralları:
 * - Minimum 6 karakter, maksimum 128 karakter
 * - Boşluk içeremez
 * - En az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter
 * - Aynı karakterin 3 kez tekrarı yasak
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
 * 
 * İsim validasyonu için temel şema
 * Türkçe karakter desteği ile uzunluk ve format kontrolleri
 * 
 * Validasyon Kuralları:
 * - Minimum 2 karakter, maksimum 50 karakter
 * - Sadece harf ve boşluk içerebilir (Türkçe karakterler dahil)
 * - Trim işlemi ile baş/son boşluk temizleme
 */
const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalıdır')
  .max(50, 'İsim en fazla 50 karakter olabilir')
  .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf ve boşluk içerebilir')
  .transform((val) => val.trim());

/**
 * Phone Schema - Backend phoneSchema ile tam uyumlu
 * 
 * Türk cep telefonu numarası validasyonu için temel şema
 * Format kontrolü ve normalizasyon içerir
 * 
 * Validasyon Kuralları:
 * - Türk cep telefonu formatı: 5XXXXXXXXX (0 veya +90 ile başlayabilir)
 * - +90 ve 0 önekleri otomatik temizlenir
 * - 10 haneli numara formatı
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
 * 
 * Pozitif tam sayı ID validasyonu için temel şema
 * Veritabanı ID'leri için kullanılır
 * 
 * Validasyon Kuralları:
 * - Pozitif tam sayı olmalıdır
 * - 0 ve negatif sayılar geçersizdir
 */
const idSchema = z.number().int().positive('Geçerli bir ID giriniz');

/**
 * Date Schema - Backend dateSchema ile tam uyumlu
 * 
 * Tarih validasyonu için temel şema
 * API formatında (YYYY-MM-DD) tarih bekler
 * 
 * Validasyon Kuralları:
 * - YYYY-MM-DD formatında olmalıdır
 * - Örnek: 2024-01-15
 */
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)');

// ============================================================================
// AUTH VALIDATION SCHEMAS - Kimlik doğrulama validasyon şemaları
// ============================================================================

/**
 * Login Schema - Backend loginSchema ile tam uyumlu
 * 
 * Kullanıcı giriş formu validasyonu
 * E-posta ve şifre kontrolü içerir
 * 
 * Field'lar:
 * - email: E-posta adresi (emailSchema)
 * - password: Şifre (min 1 karakter, zorunlu)
 * - role: Kullanıcı rolü (opsiyonel, admin/doctor/hospital)
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre zorunludur'),
  role: z.enum(['admin', 'doctor', 'hospital']).optional()
});

/**
 * Doctor Registration Schema - Backend registerDoctorSchema ile tam uyumlu
 * 
 * Doktor kayıt formu validasyonu
 * Kişisel bilgiler, ünvan, branş ve profil fotoğrafı kontrolü içerir
 * 
 * Field'lar:
 * - email: E-posta adresi
 * - password: Şifre (min 3, max 128 karakter)
 * - first_name, last_name: İsim bilgileri
 * - title: Ünvan (Dr., Uz. Dr., Prof. Dr. vb.)
 * - specialty_id: Ana dal/branş (zorunlu)
 * - subspecialty_id: Yan dal (opsiyonel)
 * - profile_photo: Profil fotoğrafı (base64 veya URL)
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
 * 
 * Hastane kayıt formu validasyonu
 * Kurum bilgileri, şehir, telefon ve logo kontrolü içerir
 * 
 * Field'lar:
 * - email: E-posta adresi
 * - password: Şifre (min 3, max 128 karakter)
 * - institution_name: Kurum adı (min 2, max 255 karakter)
 * - city_id: Şehir seçimi (zorunlu)
 * - phone: Telefon numarası
 * - logo: Logo (base64 veya URL, zorunlu)
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
 * 
 * Şifre değiştirme formu validasyonu
 * Mevcut şifre, yeni şifre ve şifre doğrulama kontrolü içerir
 * 
 * Field'lar:
 * - currentPassword: Mevcut şifre (zorunlu)
 * - newPassword: Yeni şifre (passwordSchema kuralları)
 * - confirmPassword: Şifre tekrarı (newPassword ile eşleşmeli)
 * 
 * Custom Validation:
 * - Yeni şifre ve tekrar şifre eşleşmeli
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
 * 
 * Token yenileme formu validasyonu
 * Refresh token kontrolü içerir
 * 
 * Field'lar:
 * - refreshToken: Refresh token string (zorunlu, min 1 karakter)
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token zorunludur')
});

/**
 * Logout Schema - Backend logoutSchema ile tam uyumlu
 * 
 * Kullanıcı çıkış formu validasyonu
 * Boş obje bekler (backend uyumluluk için)
 */
export const logoutSchema = z.object({});

// ============================================================================
// DOCTOR VALIDATION SCHEMAS - Doktor profil ve form validasyon şemaları
// ============================================================================

/**
 * Doctor Personal Info Schema - Backend doctorPersonalInfoSchema ile tam uyumlu
 * 
 * Doktor kişisel bilgileri güncelleme formu validasyonu
 * İsim, ünvan, branş, doğum tarihi, şehir bilgileri kontrolü içerir
 * 
 * Field'lar:
 * - first_name, last_name: İsim bilgileri
 * - title: Ünvan (opsiyonel)
 * - specialty_id: Ana dal/branş (zorunlu)
 * - subspecialty_id: Yan dal (opsiyonel, null olabilir)
 * - profile_photo: Profil fotoğrafı (opsiyonel)
 * - dob: Doğum tarihi (opsiyonel, bugünden önce olmalı)
 * - birth_place_id: Doğum yeri şehir ID (opsiyonel, null olabilir)
 * - residence_city_id: İkamet şehir ID (opsiyonel, null olabilir)
 * - phone: Telefon numarası (opsiyonel, phoneSchema)
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
 * 
 * Doktor eğitim bilgileri formu validasyonu
 * Eğitim türü, kurum, alan ve mezuniyet yılı kontrolü içerir
 * 
 * Field'lar:
 * - education_type_id: Eğitim türü ID (zorunlu)
 * - education_institution: Eğitim kurumu adı (min 2, max 255 karakter)
 * - field: Alan adı (min 2, max 255 karakter)
 * - graduation_year: Mezuniyet yılı (1950 - bugün+5 yıl arası)
 * - education_type: Eğitim türü açıklama (sadece "DİĞER" için doldurulur)
 * 
 * Not: Sertifika bilgileri ayrı bir tablo (doctor_certificates) ve ayrı bir sekme
 * olduğu için bu şemada bulunmaz.
 */
export const doctorEducationSchema = z.object({
  education_type_id: idSchema,
  education_institution: z.string().min(2, 'Eğitim kurumu adı en az 2 karakter olmalıdır').max(255, 'Eğitim kurumu adı en fazla 255 karakter olabilir'),
  field: z.string().min(2, 'Alan adı en az 2 karakter olmalıdır').max(255, 'Alan adı en fazla 255 karakter olabilir'),
  graduation_year: z.number().int().min(1950, 'Mezuniyet yılı 1950\'den küçük olamaz').max(new Date().getFullYear() + 5, 'Mezuniyet yılı gelecek yıldan büyük olamaz'),
  // Not: Eğitim türü sadece eğitim türü "DİĞER" ise doldurulmalı; diğer durumlarda boş string gelebilir
  education_type: z.string().min(2, 'Eğitim türü en az 2 karakter olmalıdır').max(100, 'Eğitim türü en fazla 100 karakter olabilir').optional().or(z.literal(''))
});

/**
 * Doctor Experience Schema - Backend doctorExperienceSchema ile tam uyumlu
 * 
 * Doktor iş deneyimi formu validasyonu
 * Kurum, ünvan, branş, tarih aralığı ve açıklama kontrolü içerir
 * 
 * Field'lar:
 * - organization: Kurum adı (min 2, max 255 karakter)
 * - role_title: Ünvan (min 2, max 255 karakter)
 * - specialty_id: Ana dal/branş (zorunlu)
 * - subspecialty_id: Yan dal (opsiyonel, null veya empty string)
 * - start_date: Başlangıç tarihi (YYYY-MM-DD formatı, zorunlu)
 * - end_date: Bitiş tarihi (YYYY-MM-DD formatı, is_current=false ise zorunlu)
 * - is_current: Devam ediyor mu? (boolean, varsayılan: false)
 * - description: Açıklama (max 1000 karakter, opsiyonel)
 * 
 * Custom Validation:
 * - is_current=true ise end_date boş olmalı
 * - is_current=false ve end_date varsa, end_date > start_date olmalı
 */
export const doctorExperienceSchema = z.object({
  organization: z.string().min(2, 'Kurum adı en az 2 karakter olmalıdır').max(255, 'Kurum adı en fazla 255 karakter olabilir'),
  role_title: z.string().min(2, 'Ünvan en az 2 karakter olmalıdır').max(255, 'Ünvan en fazla 255 karakter olabilir'),
  specialty_id: idSchema,
  // Yan dal boş olabilir: null veya empty-string kabul edelim, backend'e null gönderelim
  subspecialty_id: idSchema.optional().nullable().or(z.literal('')),
  start_date: dateSchema,
  // is_current=true iken null olabilir
  end_date: dateSchema.optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().max(1000, 'Açıklama en fazla 1000 karakter olabilir').optional().nullable()
}).refine((data) => {
  // is_current=true ise end_date boş olmalı
  if (data.is_current && data.end_date) {
    return false;
  }
  // is_current=false ve end_date varsa, end_date > start_date olmalı
  if (!data.is_current && data.end_date && data.start_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end > start;
  }
  return true;
}, {
  message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
  path: ['end_date']
});

/**
 * Doctor Certificate Schema - Backend doctorCertificateSchema ile tam uyumlu
 * 
 * Doktor sertifika bilgileri formu validasyonu
 * Elle girilen sertifika türü, kurum ve yıl kontrolü içerir
 * 
 * Field'lar:
 * - certificate_name: Sertifika türü adı (min 2, max 255 karakter)
 * - institution: Sertifika veren kurum adı (min 2, max 255 karakter)
 * - certificate_year: Sertifika yılı (1950 - bugün arası tam sayı)
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
 * 
 * Doktor dil bilgileri formu validasyonu
 * Dil ve seviye kontrolü içerir
 * 
 * Field'lar:
 * - language_id: Dil ID (pozitif tam sayı, zorunlu)
 * - level_id: Dil seviyesi ID (pozitif tam sayı, zorunlu)
 */
export const doctorLanguageSchema = z.object({
  language_id: idSchema,
  level_id: idSchema
});

/**
 * Profile Update Notification Schema - Backend profileUpdateNotificationSchema ile tam uyumlu
 * 
 * Profil güncelleme bildirimi validasyonu
 * Güncelleme tipi ve açıklama kontrolü içerir
 * 
 * Field'lar:
 * - updateType: Güncelleme tipi (personal_info, education, experience, certificate, language)
 * - updateDescription: Güncelleme açıklaması (min 5, max 200 karakter)
 */
export const profileUpdateNotificationSchema = z.object({
  updateType: z.enum(['personal_info', 'education', 'experience', 'certificate', 'language']),
  updateDescription: z.string().min(5, 'Güncelleme açıklaması en az 5 karakter olmalıdır').max(200, 'Güncelleme açıklaması en fazla 200 karakter olabilir')
});

// ============================================================================
// HOSPITAL VALIDATION SCHEMAS - Hastane profil ve form validasyon şemaları
// ============================================================================

/**
 * Hospital Profile Schema - Backend hospitalProfileSchema ile tam uyumlu
 * 
 * Hastane profil güncelleme formu validasyonu
 * Kurum bilgileri, iletişim ve logo kontrolü içerir
 * 
 * Field'lar:
 * - institution_name: Kurum adı (min 2, max 255 karakter)
 * - city_id: Şehir seçimi (pozitif tam sayı, zorunlu)
 * - address: Adres (max 500 karakter, opsiyonel)
 * - contact_person: İletişim kişisi (min 2, max 100 karakter, opsiyonel)
 * - phone: Telefon numarası (min 3, max 20 karakter)
 * - website: Website URL (geçerli URL formatı, opsiyonel)
 * - about: Hakkında metni (max 2000 karakter, opsiyonel)
 * - logo: Logo (base64 veya URL formatı)
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

// ============================================================================
// JOB VALIDATION SCHEMAS - İş ilanı ve başvuru validasyon şemaları
// ============================================================================

/**
 * Job Schema - Backend jobSchema ile tam uyumlu
 * 
 * İş ilanı oluşturma/güncelleme formu validasyonu
 * İlan bilgileri, branş, şehir, istihdam türü ve açıklama kontrolü içerir
 * 
 * Field'lar:
 * - title: İş ilanı başlığı (min 5, max 255 karakter)
 * - specialty_id: Ana dal/branş ID (pozitif tam sayı, zorunlu)
 * - subspecialty_id: Yan dal ID (opsiyonel, null veya empty string)
 * - city_id: Şehir ID (pozitif tam sayı, zorunlu)
 * - employment_type: İstihdam türü ('Tam Zamanlı', 'Yarı Zamanlı', 'Nöbet Usulü')
 * - min_experience_years: Minimum deneyim yılı (0-50 arası, opsiyonel)
 * - description: İş tanımı (min 10, max 5000 karakter)
 * - status_id: İlan durumu (1=Aktif, 2=Pasif, sadece güncellemede kullanılır)
 */
export const jobSchema = z.object({
  title: z.string().min(5, 'İş ilanı başlığı en az 5 karakter olmalıdır').max(255, 'İş ilanı başlığı en fazla 255 karakter olabilir'),
  specialty_id: idSchema,
  subspecialty_id: idSchema.optional().nullable().or(z.literal('')),
  city_id: idSchema,
  employment_type: z.enum(['Tam Zamanlı', 'Yarı Zamanlı', 'Nöbet Usulü'], {
    errorMap: () => ({ message: 'İstihdam türü "Tam Zamanlı", "Yarı Zamanlı" veya "Nöbet Usulü" olmalıdır' })
  }),
  min_experience_years: z.number().int().min(0, 'Minimum deneyim yılı 0\'dan küçük olamaz').max(50, 'Minimum deneyim yılı 50\'den büyük olamaz').nullable().optional(),
  description: z.string().min(10, 'İş tanımı en az 10 karakter olmalıdır').max(5000, 'İş tanımı en fazla 5000 karakter olabilir'),
  // status_id sadece güncelleme için geçerli (oluşturmada backend otomatik 1 yapar)
  // 1=Aktif, 2=Pasif
  status_id: z.number().int().positive()
    .refine((val) => [1, 2].includes(val), 'Sadece Aktif (1) veya Pasif (2) seçilebilir')
    .optional()
});

/**
 * Application Status Schema - Backend applicationStatusSchema ile tam uyumlu
 * 
 * Başvuru durumu güncelleme formu validasyonu
 * Durum ID ve notlar kontrolü içerir
 * 
 * Field'lar:
 * - status: Başvuru durum ID (pozitif tam sayı)
 * - notes: Notlar/açıklama (max 1000 karakter, opsiyonel)
 */
export const applicationStatusUpdateSchema = z.object({
  status: idSchema,
  notes: z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir').optional()
});

// ============================================================================
// CONTACT VALIDATION SCHEMAS - İletişim formu validasyon şemaları
// ============================================================================

/**
 * Contact Schema - Backend contactSchema ile tam uyumlu
 * 
 * İletişim formu validasyonu (public sayfalar için)
 * İletişim bilgileri, konu ve mesaj kontrolü içerir
 * 
 * Field'lar:
 * - name: Ad Soyad (min 2, max 100 karakter)
 * - email: E-posta adresi (emailSchema)
 * - phone: Telefon numarası (regex formatı, 10-20 karakter, opsiyonel)
 * - subject: Konu (min 5, max 200 karakter, opsiyonel)
 * - message: Mesaj içeriği (min 10, max 2000 karakter)
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
 * 
 * İletişim mesajı formu validasyonu
 * Legacy uyumluluk için contactSchema'nın alias'ı
 */
export const contactMessageSchema = contactSchema;

// ============================================================================
// UTILITY FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * Transform Lookup Data - Backend transformLookupData ile tam uyumlu
 * 
 * Lookup verilerini frontend formatına dönüştürür
 * Backend'den gelen lookup verilerini React component'lerinde kullanılabilir
 * formata (label, value) dönüştürür
 * 
 * Parametreler:
 * @param {Array|Object} data - Backend'den gelen lookup verisi
 * 
 * Dönüş:
 * @returns {Array|Object} Frontend formatına dönüştürülmüş lookup verisi
 * 
 * Format Dönüşümü:
 * - Her öğeye `label` (name ile aynı) ve `value` (id) eklenir
 * - Slug oluşturulur (yoksa name'den türetilir)
 * - Array veya Object formatlarını destekler
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
 * Format Validation Errors - Backend formatValidationErrors ile tam uyumlu
 * 
 * Zod validation hatalarını kullanıcı dostu formata dönüştürür
 * Field path'leri ile hata mesajlarını eşleştirir
 * 
 * Parametreler:
 * @param {ZodError} error - Zod validation hatası objesi
 * 
 * Dönüş:
 * @returns {Object} Field path'leri ile hata mesajlarının eşleştirildiği obje
 * 
 * Örnek:
 * { email: 'Geçerli bir e-posta adresi giriniz', password: 'Şifre en az 6 karakter olmalıdır' }
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

// ============================================================================
// VALIDATION FUNCTIONS - Validasyon wrapper fonksiyonları
// ============================================================================

/**
 * Login Validation Function - Backend ile uyumlu
 * 
 * Login form verilerini validate eder ve sonucu döndürür
 * 
 * Parametreler:
 * @param {Object} data - Login form verileri (email, password, role?)
 * 
 * Dönüş:
 * @returns {Object} Validation sonucu
 * - isValid: {boolean} Validasyon geçti mi?
 * - data: {Object|null} Valid veri (isValid=true ise)
 * - errors: {Array<string>} Hata mesajları (isValid=false ise)
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
 * Doctor Registration Validation Function - Backend ile uyumlu
 * 
 * Doktor kayıt form verilerini validate eder
 * 
 * Parametreler:
 * @param {Object} data - Doktor kayıt form verileri
 * 
 * Dönüş:
 * @returns {Object} Validation sonucu (isValid, data, errors)
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
 * Hospital Registration Validation Function - Backend ile uyumlu
 * 
 * Hastane kayıt form verilerini validate eder
 * 
 * Parametreler:
 * @param {Object} data - Hastane kayıt form verileri
 * 
 * Dönüş:
 * @returns {Object} Validation sonucu (isValid, data, errors)
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
 * Refresh Token Validation Function - Backend ile uyumlu
 * 
 * Refresh token verilerini validate eder
 * 
 * Parametreler:
 * @param {Object} data - Refresh token verileri (refreshToken)
 * 
 * Dönüş:
 * @returns {Object} Validation sonucu (isValid, data, errors)
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
 * Logout Validation Function - Backend ile uyumlu
 * 
 * Logout verilerini validate eder (backend uyumluluk için)
 * 
 * Parametreler:
 * @param {Object} data - Logout verileri (genellikle boş obje)
 * 
 * Dönüş:
 * @returns {Object} Validation sonucu (isValid, data, errors)
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

// ============================================================================
// DEFAULT EXPORT - Tüm şemaları ve fonksiyonları export eder
// ============================================================================

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
