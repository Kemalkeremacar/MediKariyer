/**
 * @file doctorRoutes.js
 * @description Doktor routes - Doktor profil yönetimi için API endpoint'lerini tanımlar.
 * Bu dosya, doktor kullanıcıları için profil yönetimi route'larını içerir.
 * 
 * Servis Ayrımı Mantığı:
 * - Profil işlemleri → doctorService
 * - İş ilanları → jobService (doktor sadece read-only görür)
 * - Başvuru işlemleri → applicationService (ayrı route'da)
 * - Bildirimler → notificationService (ayrı route'da)
 * 
 * Ana Route Grupları:
 * - Profil Yönetimi (/profile, /profile/complete)
 * - Eğitim CRUD (/educations)
 * - Deneyim CRUD (/experiences)
 * - Sertifika CRUD (/certificates)
 * - Dil CRUD (/languages)
 * - Profil Tamamlanma (/profile/completion)
 * - Dashboard (/dashboard) - 3 servisi birleştirir
 * 
 * Middleware'ler:
 * - authMiddleware: Kimlik doğrulama
 * - requireRole(['doctor']): Sadece doktor rolü
 * - validate(): Input validasyonu
 * 
 * Endpoint'ler:
 * - GET /api/doctor/profile - Temel profil bilgileri
 * - PUT /api/doctor/profile - Profil güncelleme
 * - GET /api/doctor/profile/complete - Tam profil bilgileri
 * - PATCH /api/doctor/profile/personal - Kişisel bilgi güncelleme
 * - GET/POST/PATCH/DELETE /api/doctor/educations - Eğitim CRUD
 * - GET/POST/PATCH/DELETE /api/doctor/experiences - Deneyim CRUD
 * - GET/POST/PATCH/DELETE /api/doctor/certificates - Sertifika CRUD
 * - GET/POST/PATCH/DELETE /api/doctor/languages - Dil CRUD
 * - GET /api/doctor/profile/completion - Profil tamamlanma oranı
 * - GET /api/doctor/dashboard - Dashboard verileri (3 servisi birleştirir)
 * 
 * Not: Başvuru CRUD işlemleri (/api/applications/*) applicationRoutes'da yönetilir.
 * Bu route'larda sadece dashboard için applicationService çağrısı yapılır.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const express = require('express');
const doctorController = require('../controllers/doctorController');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard'); // ✅ requireApproval kaldırıldı

// Schemas
const {
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
  // Profil detay ID parametreleri
  educationIdParamSchema,
  experienceIdParamSchema,
  certificateIdParamSchema,
  languageIdParamSchema
} = require('../validators/doctorSchemas');

const router = express.Router();

// ============================================================================
// MIDDLEWARE KURULUMU
// ============================================================================

// ✅ Sadece kimlik doğrulama + rol kontrolü
router.use(authMiddleware);
router.use(requireRole(['doctor']));

// ============================================================================
// PROFİL YÖNETİMİ ROUTE'LARI
// ============================================================================

/**
 * @route   GET /api/doctor/profile
 * @desc    Doktor profilini getir (temel bilgiler) - doctorService.getProfile()
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Object} Doktor profil bilgileri
 * @example
 * GET /api/doctor/profile
 * Authorization: Bearer <token>
 */
router.get('/profile', doctorController.getProfile);

/**
 * @route   PUT /api/doctor/profile
 * @desc    Doktor profilini güncelle (temel bilgiler) - doctorService.updateProfile()
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorPersonalInfoSchema)
 * @param {Object} req.body - Güncellenecek profil verileri
 * @returns {Object} Güncellenmiş profil bilgileri
 * @example
 * PUT /api/doctor/profile
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "first_name": "Ahmet",
 *   "last_name": "Yılmaz",
 *   "dob": "1990-01-01",
 *   "phone": "+905551234567"
 * }
 */
router.put('/profile',
  validate(doctorPersonalInfoSchema, 'body'),
  doctorController.updateProfile
);

/**
 * @route   GET /api/doctor/profile/full
 * @desc    Doktorun tam profilini getir (eğitim, deneyim, sertifika, dil bilgileri dahil)
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Object} Tam doktor profil bilgileri
 * @example
 * GET /api/doctor/profile/full
 * Authorization: Bearer <token>
 */
router.get('/profile/full', doctorController.getCompleteProfile);

/**
 * @route   GET /api/doctor/profile/complete
 * @desc    Doktorun tam profilini getir (legacy endpoint - backward compatibility)
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Object} Tam doktor profil bilgileri
 * @example
 * GET /api/doctor/profile/complete
 * Authorization: Bearer <token>
 * @deprecated Use /api/doctor/profile/full instead
 */
router.get('/profile/complete', doctorController.getCompleteProfile);

/**
 * @route   GET /api/doctor/
 * @desc    Doktorun tam profilini getir (frontend uyumluluğu için)
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Object} Doktor profil bilgileri
 * @example
 * GET /api/doctor/
 * Authorization: Bearer <token>
 */
router.get('/', doctorController.getCompleteProfile);

/**
 * @route   PATCH /api/doctor/profile/personal
 * @desc    Doktorun kişisel bilgilerini güncelle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorPersonalInfoSchema)
 * @param {Object} req.body - Güncellenecek kişisel bilgiler
 * @returns {Object} Güncellenmiş profil bilgileri
 * @example
 * PATCH /api/doctor/profile/personal
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "first_name": "Ahmet",
 *   "last_name": "Yılmaz",
 *   "phone": "+905551234567"
 * }
 */
router.patch(
  '/profile/personal',
  validate(doctorPersonalInfoSchema, 'body'),
  doctorController.updatePersonalInfo
);

// ============================================================================
// EĞİTİM BİLGİLERİ ROUTE'LARI
// ============================================================================

/**
 * @route   GET /api/doctor/educations
 * @desc    Doktorun eğitimlerini getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Array} Eğitim kayıtları listesi
 * @example
 * GET /api/doctor/educations
 * Authorization: Bearer <token>
 */
router.get('/educations', doctorController.getEducations);

/**
 * @route   POST /api/doctor/educations
 * @desc    Eğitim kaydı ekle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorEducationSchema)
 * @param {Object} req.body - Eğitim bilgileri
 * @returns {Object} Eklenen eğitim kaydı
 * @example
 * POST /api/doctor/educations
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "degree_type": "Tıp Fakültesi",
 *   "institution_name": "İstanbul Üniversitesi",
 *   "field": "Tıp",
 *   "graduation_year": 2015
 * }
 */
router.post(
  '/educations',
  validate(doctorEducationSchema, 'body'),
  doctorController.addEducation
 );

/**
 * @route   PATCH /api/doctor/educations/:id
 * @desc    Eğitim kaydını güncelle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorEducationSchema)
 * @param {string} req.params.id - Güncellenecek eğitim kaydının ID'si
 * @param {Object} req.body - Güncellenecek eğitim bilgileri
 * @returns {Object} Güncellenmiş eğitim kaydı
 * @example
 * PATCH /api/doctor/educations/123
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "degree_type": "Uzmanlık",
 *   "institution_name": "Ankara Üniversitesi"
 * }
 */
router.patch(
  '/educations/:id',
  validate(educationIdParamSchema, 'params'),
  validate(doctorEducationSchema, 'body'),
  doctorController.updateEducation
);

/**
 * @route   DELETE /api/doctor/educations/:id
 * @desc    Eğitim kaydını sil
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @param {string} req.params.id - Silinecek eğitim kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @example
 * DELETE /api/doctor/educations/123
 * Authorization: Bearer <token>
 */
router.delete('/educations/:id', 
  validate(educationIdParamSchema, 'params'),
  doctorController.deleteEducation
);

// ============================================================================
// DENEYİM BİLGİLERİ ROUTE'LARI
// ============================================================================

/**
 * @route   GET /api/doctor/experiences
 * @desc    Doktorun deneyimlerini getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Array} Deneyim kayıtları listesi
 * @example
 * GET /api/doctor/experiences
 * Authorization: Bearer <token>
 */
router.get('/experiences', doctorController.getExperiences);

/**
 * @route   POST /api/doctor/experiences
 * @desc    Deneyim kaydı ekle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorExperienceSchema)
 * @param {Object} req.body - Deneyim bilgileri
 * @returns {Object} Eklenen deneyim kaydı
 * @example
 * POST /api/doctor/experiences
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "organization": "Acıbadem Hastanesi",
 *   "role_title": "Uzman Doktor",
 *   "department": "Kardiyoloji",
 *   "start_date": "2020-01-01",
 *   "is_current": true
 * }
 */
router.post(
  '/experiences',
  validate(doctorExperienceSchema, 'body'),
  doctorController.addExperience
);

/**
 * @route   PATCH /api/doctor/experiences/:id
 * @desc    Deneyim kaydını güncelle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorExperienceSchema)
 * @param {string} req.params.id - Güncellenecek deneyim kaydının ID'si
 * @param {Object} req.body - Güncellenecek deneyim bilgileri
 * @returns {Object} Güncellenmiş deneyim kaydı
 * @example
 * PATCH /api/doctor/experiences/123
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "organization": "Memorial Hastanesi",
 *   "role_title": "Başhekim"
 * }
 */
router.patch(
  '/experiences/:id',
  validate(experienceIdParamSchema, 'params'),
  validate(doctorExperienceSchema, 'body'),
  doctorController.updateExperience
);

/**
 * @route   DELETE /api/doctor/experiences/:id
 * @desc    Deneyim kaydını sil
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @param {string} req.params.id - Silinecek deneyim kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @example
 * DELETE /api/doctor/experiences/123
 * Authorization: Bearer <token>
 */
router.delete('/experiences/:id',
  validate(experienceIdParamSchema, 'params'),
  doctorController.deleteExperience
);

// ============================================================================
// SERTİFİKA BİLGİLERİ ROUTE'LARI
// ============================================================================

/**
 * @route   GET /api/doctor/certificates
 * @desc    Doktorun sertifikalarını getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Array} Sertifika kayıtları listesi
 * @example
 * GET /api/doctor/certificates
 * Authorization: Bearer <token>
 */
router.get('/certificates', doctorController.getCertificates);

/**
 * @route   POST /api/doctor/certificates
 * @desc    Sertifika kaydı ekle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorCertificateSchema)
 * @param {Object} req.body - Sertifika bilgileri
 * @param {string} [req.body.file_url] - Sertifika dosyası URL'si
 * @returns {Object} Eklenen sertifika kaydı
 * @example
 * POST /api/doctor/certificates
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "title": "ACLS Sertifikası",
 *   "issuer": "Amerikan Kalp Derneği",
 *   "issue_date": "2023-01-01",
 *   "expiry_date": "2025-01-01",
 *   "file_url": "https://example.com/certificate.pdf"
 * }
 */
router.post(
  '/certificates',
  validate(doctorCertificateSchema, 'body'),
  doctorController.addCertificate
);

/**
 * @route   PATCH /api/doctor/certificates/:id
 * @desc    Sertifika kaydını güncelle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorCertificateSchema)
 * @param {string} req.params.id - Güncellenecek sertifika kaydının ID'si
 * @param {Object} req.body - Güncellenecek sertifika bilgileri
 * @param {string} [req.body.file_url] - Yeni sertifika dosyası URL'si
 * @returns {Object} Güncellenmiş sertifika kaydı
 * @example
 * PATCH /api/doctor/certificates/123
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "title": "BLS Sertifikası",
 *   "issuer": "Türk Kardiyoloji Derneği",
 *   "file_url": "https://example.com/new-certificate.pdf"
 * }
 */
router.patch(
  '/certificates/:id',
  validate(certificateIdParamSchema, 'params'),
  validate(doctorCertificateSchema, 'body'),
  doctorController.updateCertificate
);

/**
 * @route   DELETE /api/doctor/certificates/:id
 * @desc    Sertifika kaydını sil
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @param {string} req.params.id - Silinecek sertifika kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @example
 * DELETE /api/doctor/certificates/123
 * Authorization: Bearer <token>
 */
router.delete(
  '/certificates/:id',
  validate(certificateIdParamSchema, 'params'),
  doctorController.deleteCertificate
);

// ============================================================================
// DİL BİLGİLERİ ROUTE'LARI
// ============================================================================

/**
 * @route   GET /api/doctor/languages
 * @desc    Doktorun dillerini getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Array} Dil kayıtları listesi
 * @example
 * GET /api/doctor/languages
 * Authorization: Bearer <token>
 */
router.get('/languages', doctorController.getLanguages);

/**
 * @route   POST /api/doctor/languages
 * @desc    Dil bilgisi ekle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorLanguageSchema)
 * @param {Object} req.body - Dil bilgileri
 * @returns {Object} Eklenen dil kaydı
 * @example
 * POST /api/doctor/languages
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "language_name": "İngilizce",
 *   "proficiency": "Advanced"
 * }
 */
router.post(
  '/languages',
  validate(doctorLanguageSchema, 'body'),
  doctorController.addLanguage
);

/**
 * @route   PATCH /api/doctor/languages/:id
 * @desc    Dil bilgisi güncelle
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(doctorLanguageSchema)
 * @param {string} req.params.id - Güncellenecek dil kaydının ID'si
 * @param {Object} req.body - Güncellenecek dil bilgileri
 * @returns {Object} Güncellenmiş dil kaydı
 * @example
 * PATCH /api/doctor/languages/123
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "language_name": "Almanca",
 *   "proficiency": "Intermediate"
 * }
 */
router.patch(
  '/languages/:id',
  validate(languageIdParamSchema, 'params'),
  validate(doctorLanguageSchema, 'body'),
  doctorController.updateLanguage
);

/**
 * @route   DELETE /api/doctor/languages/:id
 * @desc    Dil bilgisi sil
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @param {string} req.params.id - Silinecek dil kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @example
 * DELETE /api/doctor/languages/123
 * Authorization: Bearer <token>
 */
router.delete('/languages/:id',
  validate(languageIdParamSchema, 'params'),
  doctorController.deleteLanguage
);

// ============================================================================
// PROFİL TAMAMLANMA VE DASHBOARD ROUTE'LARI
// ============================================================================

/**
 * @route   GET /api/doctor/profile/completion
 * @desc    Doktorun profil tamamlanma oranını getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Object} Profil tamamlanma bilgileri (yüzde, eksik alanlar, sayılar)
 * @example
 * GET /api/doctor/profile/completion
 * Authorization: Bearer <token>
 */
router.get('/profile/completion', doctorController.getProfileCompletion);

// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ ROUTE'LARI
// ============================================================================

/**
 * @route   POST /api/doctor/profile/photo
 * @desc    Profil fotoğrafı değişiklik talebi oluştur
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 */
router.post('/profile/photo', doctorController.requestPhotoChange);

/**
 * @route   GET /api/doctor/profile/photo/status
 * @desc    Fotoğraf talep durumunu getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 */
router.get('/profile/photo/status', doctorController.getPhotoRequestStatus);

/**
 * @route   GET /api/doctor/profile/photo/history
 * @desc    Fotoğraf talep geçmişini getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 */
router.get('/profile/photo/history', doctorController.getPhotoRequestHistory);

/**
 * @route   DELETE /api/doctor/profile/photo/request
 * @desc    Fotoğraf talebini iptal et
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 */
router.delete('/profile/photo/request', doctorController.cancelPhotoRequest);

router.post('/account/deactivate', doctorController.deactivateAccount);

/**
 * @route   GET /api/doctor/dashboard
 * @desc    Doktorun dashboard verilerini getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor'])
 * @returns {Object} Dashboard verileri (profil tamamlanma, başvuru istatistikleri, son başvurular, bildirimler)
 * @example
 * GET /api/doctor/dashboard
 * Authorization: Bearer <token>
 */
router.get('/dashboard', doctorController.getDashboard);
/**
 * @route   POST /api/doctor/profile/notify-update
 * @desc    Doktor için profil güncelleme bildirimi gönder
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(profileUpdateNotificationSchema, 'body')
 * @param   {Object} req.body - Bildirim verileri
 * @param   {string} req.body.updateType - Güncelleme türü (personal_info, education, experience, certificate, language)
 * @param   {string} req.body.updateDescription - Güncelleme açıklaması
 * @returns {Object} Gönderilen bildirim bilgisi
 * @example
 * POST /api/doctor/profile/notify-update
 * Body: { updateType: "education", updateDescription: "Yeni eğitim bilgisi eklendi" }
 * Response: { notification: {...} }
 */
router.post('/profile/notify-update',
  validate(profileUpdateNotificationSchema, 'body'),
  doctorController.sendProfileUpdateNotification
);

// ============================================================================
// BAŞVURU ROUTE'LARI (applicationRoutes'den taşındı)
// ============================================================================

/**
 * @route   POST /api/doctor/applications
 * @desc    Doktorlar için yeni başvuru oluştur
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(createApplicationSchema, 'body')
 * @param   {Object} req.body - Başvuru verileri
 * @param   {number} req.body.jobId - İş ilanı kimliği
 * @param   {string} [req.body.coverLetter] - Ön yazı
 * @returns {Object} Oluşturulan başvuru
 * @example
 * POST /api/doctor/applications
 * Body: { jobId: 123, coverLetter: "Bu pozisyon için çok uygun olduğumu düşünüyorum..." }
 */
router.post('/applications',
  validate(createApplicationSchema, 'body'),
  doctorController.createApplication
);

/**
 * @route   GET /api/doctor/applications/me
 * @desc    Doktorun kendi başvurularını getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(applicationFilterSchema, 'query')
 * @param   {Object} req.query - Filtreleme parametreleri
 * @param   {string} [req.query.status] - Başvuru durumu
 * @param   {number} [req.query.page=1] - Sayfa numarası
 * @param   {number} [req.query.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Object} Başvurular ve sayfalama bilgileri
 * @example
 * GET /api/doctor/applications/me?status=pending&page=1&limit=10
 */
router.get('/applications/me',
  validate(applicationFilterSchema, 'query'),
  doctorController.getMyApplications
);

/**
 * @route   GET /api/doctor/applications/:id
 * @desc    Doktorlar için tek başvuru detayını getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(applicationIdParamSchema, 'params')
 * @param   {number} req.params.id - Başvuru kimliği
 * @returns {Object} Başvuru detayları
 * @example
 * GET /api/doctor/applications/123
 */
router.get('/applications/:id',
  validate(applicationIdParamSchema, 'params'),
  doctorController.getApplicationById
);

/**
 * @route   PATCH /api/doctor/applications/:id/withdraw
 * @desc    Doktorlar için başvuruyu geri çek
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(applicationIdParamSchema, 'params'), validate(withdrawApplicationSchema, 'body')
 * @param   {number} req.params.id - Başvuru kimliği
 * @param   {Object} req.body - Geri çekme verileri
 * @param   {string} [req.body.reason] - Geri çekme sebebi
 * @returns {Object} Güncellenmiş başvuru
 * @example
 * PATCH /api/doctor/applications/123/withdraw
 * Body: { reason: "Başka bir pozisyon buldum" }
 */
router.patch('/applications/:id/withdraw',
  validate(applicationIdParamSchema, 'params'),
  validate(withdrawApplicationSchema, 'body'),
  doctorController.withdrawApplication
);

/**
 * @route   DELETE /api/doctor/applications/:id
 * @desc    [DEPRECATED] Doktorlar başvuruyu silemez, sadece geri çekebilir
 * @access  Özel (Doktor)
 * @deprecated Doktorlar başvuruyu silemez. Sadece "Başvuruldu" durumundaki başvuruları geri çekebilir (PATCH /api/doctor/applications/:id/withdraw)
 * @returns {Object} Hata mesajı
 */
router.delete('/applications/:id',
  validate(applicationIdParamSchema, 'params'),
  doctorController.deleteApplication
);

// ============================================================================
// İŞ İLANI ROUTE'LARI (jobService'den taşındı)
// ============================================================================

/**
 * @route   GET /api/doctor/jobs
 * @desc    Doktorlar için iş ilanlarını getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(jobSearchSchema, 'query')
 * @param   {Object} req.query - Filtreleme parametreleri
 * @param   {string} [req.query.specialty] - Uzmanlık alanı
 * @param   {string} [req.query.city] - Şehir
 * @param   {string} [req.query.hospital] - Hastane adı
 * @param   {string} [req.query.search] - Arama terimi
 * @param   {number} [req.query.page=1] - Sayfa numarası
 * @param   {number} [req.query.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Object} İş ilanları ve sayfalama bilgileri
 * @example
 * GET /api/doctor/jobs?specialty=Kardiyoloji&city=İstanbul&page=1&limit=10
 */
router.get('/jobs',
  validate(jobSearchSchema, 'query'),
  doctorController.getJobs
);

/**
 * @route   GET /api/doctor/jobs/:id
 * @desc    Doktorlar için tek iş ilanı detayını getir
 * @access  Özel (Doktor)
 * @middleware authMiddleware, requireRole(['doctor']), validate(jobIdParamSchema, 'params')
 * @param   {number} req.params.id - İş ilanı kimliği
 * @returns {Object} İş ilanı detayları
 * @example
 * GET /api/doctor/jobs/123
 */
router.get('/jobs/:id',
  validate(jobIdParamSchema, 'params'),
  doctorController.getJobById
);

module.exports = router;
