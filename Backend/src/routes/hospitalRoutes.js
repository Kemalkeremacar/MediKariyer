/**
 * @file hospitalRoutes.js
 * @description Hastane routes - Hastane kullanıcıları için HTTP route tanımlarını içerir.
 * Bu modül, Express.js router kullanarak hastane endpoint'lerini tanımlar.
 * 
 * Ana İşlevler:
 * - Profil yönetimi route'ları
 * - İş ilanı yönetimi route'ları (hospitalService içinde)
 * - Başvuru yönetimi route'ları (hospitalService içinde)
 * - Dashboard orchestration route'ları
 * - Middleware entegrasyonu
 * 
 * Servis Ayrımı Mantığı:
 * - Bu routes SADECE hospitalController kullanır (tek servis yaklaşımı)
 * - Doktor routes → çoklu servis yaklaşımı (doctorController + applicationController + jobController)
 * - Hastane routes → tek servis yaklaşımı (sadece hospitalController)
 * 
 * Route Yapısı:
 * - Tüm route'lar /me/hospital prefix'i ile başlar
 * - Auth middleware ile korunur (JWT token gerekli)
 * - Role guard ile sadece 'hospital' rolü erişebilir
 * - Validation middleware ile veri doğrulaması yapılır
 * - RESTful API standartlarına uygun
 * 
 * HTTP Endpoint'leri:
 * - GET /me/hospital - Profil getir
 * - PUT /me/hospital - Profil güncelle
 * - GET /me/hospital/profile/completion - Profil tamamlanma oranı
 * - GET /me/hospital/jobs - İş ilanları getir (hospitalService)
 * - POST /me/hospital/jobs - İş ilanı oluştur (hospitalService)
 * - PUT /me/hospital/jobs/:jobId - İş ilanı güncelle (hospitalService)
 * - GET /me/hospital/jobs/:jobId/applications - Başvurular getir (hospitalService)
 * - GET /me/hospital/applications - Tüm ilanların başvuruları getir (hospitalService)
 * - PUT /me/hospital/applications/:applicationId/status - Başvuru durumu güncelle (hospitalService)
 * - GET /me/hospital/dashboard - Dashboard verileri (hospitalService içinde)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const express = require('express');
const router = express.Router();

// Import'ları en üstte tanımla
const hospitalController = require('../controllers/hospitalController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validationMiddleware');
const { 
  hospitalProfileSchema, 
  jobSchema, 
  jobStatusUpdateSchema,
  jobIdParamSchema,
  jobStatusChangeSchema,
  jobResubmitSchema,
  applicationStatusSchema,
  applicationsQuerySchema
} = require('../validators/hospitalSchemas');

// ============================================================================
// MIDDLEWARE STACK - TÜM HASTANE ROUTE'LARI İÇİN
// ============================================================================

// JWT token doğrulaması - tüm route'lar için gerekli
router.use(authMiddleware);

// Rol kontrolü - sadece 'hospital' rolü erişebilir
router.use(requireRole('hospital'));

// ========================================
// ============================================================================
// PROFİL YÖNETİMİ ROUTE'LARI
// ============================================================================
// ========================================

/**
 * Hastane profilini getir
 * 
 * @route GET /me/hospital
 * @description Hastane kullanıcısının profil bilgilerini getirir
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @example
 * GET /me/hospital
 * Authorization: Bearer <jwt_token>
 * 
 * @returns {Object} 200 - Hastane profil bilgileri
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - Hastane profili bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 */
router.get('/', hospitalController.getProfile);

/**
 * Hastane profilini güncelle
 * 
 * @route PUT /me/hospital
 * @description Hastane kullanıcısının profil bilgilerini günceller
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital'), validate(hospitalProfileSchema)
 * 
 * @example
 * PUT /me/hospital
 * Authorization: Bearer <jwt_token>
 * Content-Type: application/json
 * 
 * {
 *   "institution_name": "ABC Hastanesi",
 *   "city": "İstanbul",
 *   "phone": "+90 212 555 0123"
 * }
 * 
 * @returns {Object} 200 - Güncellenmiş hastane profil bilgileri
 * @returns {Object} 400 - Validation hatası
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - Hastane profili bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 */
router.put(
  '/', 
  validate(hospitalProfileSchema, 'body'), 
  hospitalController.updateProfile
);

/**
 * Hastane profilinin tamamlanma yüzdesini getir
 * 
 * @route GET /me/hospital/profile/completion
 * @description Hastane profil bilgilerinin ne kadarının doldurulduğunu hesaplar
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @example
 * GET /me/hospital/profile/completion
 * Authorization: Bearer <jwt_token>
 * 
 * @returns {Object} 200 - Profil tamamlanma bilgileri (yüzde, eksik alanlar, sayılar)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 */
router.get('/profile/completion', hospitalController.getProfileCompletion);

// Hesabı pasif hale getir
router.post('/account/deactivate', hospitalController.deactivateAccount);

// ============================================================================
// İŞ İLANI YÖNETİMİ ROUTE'LARI (hospitalService içinde)
// ============================================================================

// Hastane iş ilanlarını getir
// GET /me/hospital/jobs
router.get('/jobs', hospitalController.getJobs);

// Yeni iş ilanı oluştur
// POST /me/hospital/jobs
router.post(
  '/jobs', 
  validate(jobSchema, 'body'), 
  hospitalController.createJob
);

// İş ilanını getir (tek ilan)
// GET /me/hospital/jobs/:jobId
router.get('/jobs/:jobId', hospitalController.getJobById);

// İş ilanını güncelle
// PUT /me/hospital/jobs/:jobId
router.put(
  '/jobs/:jobId', 
  validate(jobSchema, 'body'), 
  hospitalController.updateJob
);

// İş ilanını tekrar gönder (resubmit)
// POST /me/hospital/jobs/:jobId/resubmit
router.post('/jobs/:jobId/resubmit', 
  validate(jobIdParamSchema, 'params'),
  validate(jobResubmitSchema, 'body'),
  hospitalController.resubmitJob
);

// İş ilanı durumunu güncelle
// PATCH /me/hospital/jobs/:jobId/status
router.patch('/jobs/:jobId/status', 
  validate(jobIdParamSchema, 'params'),
  validate(jobStatusUpdateSchema, 'body'),
  hospitalController.updateJobStatus
);

// İş ilanı başvurularını getir
// GET /me/hospital/jobs/:jobId/applications
router.get('/jobs/:jobId/applications', hospitalController.getJobApplications);

/**
 * Başvuru Yönetimi Routes
 */

// Hastanenin tüm ilanlarına gelen başvuruları getir
// GET /me/hospital/applications
router.get(
  '/applications', 
  validate(applicationsQuerySchema, 'query'), 
  hospitalController.getAllApplications
);

// Başvuru durumunu güncelle
// PUT /me/hospital/applications/:applicationId/status
router.put(
  '/applications/:applicationId/status', 
  validate(applicationStatusSchema, 'body'), 
  hospitalController.updateApplicationStatus
);

// ============================================================================
// DEPARTMAN VE İLETİŞİM YÖNETİMİ KALDIRILDI
// ============================================================================
// Department ve Contact tabloları kaldırıldı.
// İletişim bilgileri artık hospital_profiles tablosunda tutuluyor (phone, email, address).

// ============================================================================
// DASHBOARD ROUTE'LARI
// ============================================================================

/**
 * Hastane dashboard verilerini getir
 * 
 * @route GET /me/hospital/dashboard
 * @description Hastane için dashboard verilerini getirir (son başvurular ve iş ilanları)
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @example
 * GET /me/hospital/dashboard
 * Authorization: Bearer <jwt_token>
 * 
 * @returns {Object} 200 - Dashboard verileri (son başvurular ve iş ilanları)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 */
router.get('/dashboard', hospitalController.getDashboard);

// ============================================================================
// ADMIN BİLDİRİM ROUTE'LARI (jobRoutes'den taşındı)
// ============================================================================

/**
 * @route POST /api/hospital/jobs/:jobId/notify-status-change
 * @description Admin için ilan durumu değişikliği bildirimi gönder
 * İlan durumu değiştiğinde başvuru yapan doktorlara bildirim gönderir.
 * @access Özel - Sadece Admin
 * @middleware authMiddleware, requireRole(['admin']), validate(jobStatusChangeSchema, 'body')
 * 
 * @example
 * POST /api/hospital/jobs/123/notify-status-change
 * Body: { newStatus: "closed", oldStatus: "open" }
 * Response: { sent_count: 5 }
 */
router.post('/jobs/:jobId/notify-status-change',
  requireRole(['admin']),
  validate(jobIdParamSchema, 'params'),
  validate(jobStatusChangeSchema, 'body'),
  hospitalController.sendJobStatusChangeNotification
);

// ============================================================================
// DOKTOR PROFİL GÖRÜNTÜLEME ROUTE'LARI
// ============================================================================

/**
 * @route GET /api/hospital/doctors
 * @description Hastane tarafından doktor profillerini listeleme
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @query {number} [page=1] - Sayfa numarası
 * @query {number} [limit=20] - Sayfa başına kayıt sayısı
 * @query {string} [search] - Doktor adı arama terimi
 * @query {string} [specialty] - Uzmanlık alanı filtresi
 * @query {string} [city] - Şehir filtresi
 * 
 * @example
 * GET /api/hospital/doctors?page=1&limit=10&search=Ahmet&specialty=Kardiyoloji&city=İstanbul
 * Authorization: Bearer <jwt_token>
 * 
 * @returns {Object} 200 - Doktor profilleri listesi ve sayfalama bilgileri
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 */
router.get('/doctors',
  hospitalController.getDoctorProfiles
);

/**
 * @route GET /api/hospital/doctors/:doctorId
 * @description Hastane tarafından tek doktor profilini detaylı görüntüleme
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @param {number} doctorId - Doktor profil ID'si
 * 
 * @example
 * GET /api/hospital/doctors/123
 * Authorization: Bearer <jwt_token>
 * 
 * @returns {Object} 200 - Doktor profil detayları (profil, eğitim, deneyim, sertifika, dil bilgileri)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - Doktor profili bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 */
router.get('/doctors/:doctorId',
  hospitalController.getDoctorProfileDetail
);

module.exports = router;
