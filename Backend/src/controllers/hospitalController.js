/**
 * @file hospitalController.js
 * @description Hastane controller - Hastane profil yönetimi için HTTP request/response işlemlerini yönetir.
 * Bu controller, hospitalRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Hastane profil yönetimi (GET, PUT)
 * - İş ilanı yönetimi (CRUD) - hospitalService içinde
 * - Başvuru yönetimi (gelen başvurular, durum güncelleme) - hospitalService içinde
 * - Dashboard verileri (hospitalService içinde)
 * - Profil tamamlanma oranı
 * 
 * Servis Ayrımı Mantığı:
 * - Bu controller HASTANE için HER ŞEYİ hospitalService'den alır (tek servis yaklaşımı)
 * - Doktor controller → çoklu servis yaklaşımı (doctorService + applicationService + notificationService)
 * - Hastane controller → tek servis yaklaşımı (sadece hospitalService)
 * 
 * Endpoint'ler:
 * - GET /api/hospital/profile - Temel profil bilgileri
 * - PUT /api/hospital/profile - Profil güncelleme
 * - GET /api/hospital/profile/completion - Profil tamamlanma oranı
 * - GET/POST/PUT/DELETE /api/hospital/jobs - İş ilanı CRUD
 * - GET/PUT /api/hospital/applications - Başvuru yönetimi
 * - GET /api/hospital/dashboard - Dashboard verileri
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const hospitalService = require('../services/hospitalService');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

// ============================================================================
// PROFİL YÖNETİMİ CONTROLLER'LARI
// ============================================================================

/**
 * Hastane profilini getirir
 * @description Hastane kullanıcısının profil bilgilerini getirir
 * @route GET /api/hospital/profile
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Hastane profil bilgileri
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/profile
 * Authorization: Bearer <jwt_token>
 * 
 * @since 1.0.0
 */
const getProfile = catchAsync(async (req, res, next) => {
  const profile = await hospitalService.getProfile(req.user.id);
  logger.info(`Hospital profile retrieved for user ${req.user.id}`);
  sendSuccess(res, 'Hastane profili başarıyla getirildi', { profile }, 200);
});

/**
 * Hastane profilini günceller
 * @description Hastane kullanıcısının profil bilgilerini günceller
 * @route PUT /api/hospital/profile
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital'), validate(hospitalProfileSchema, 'body')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Profil güncelleme verileri
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Güncellenmiş hastane profil bilgileri
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * PUT /api/hospital/profile
 * Authorization: Bearer <jwt_token>
 * {
 *   "institution_name": "Yeni Hastane Adı",
 *   "city": "Ankara",
 *   "address": "Yeni Adres"
 * }
 * 
 * @since 1.0.0
 */
const updateProfile = catchAsync(async (req, res, next) => {
  const profile = await hospitalService.updateProfile(req.user.id, req.body);
  logger.info(`Hospital profile updated for user ${req.user.id}`);
  sendSuccess(res, 'Hastane profili başarıyla güncellendi', { profile }, 200);
});

/**
 * Hastane profil tamamlanma oranını getirir
 * @description Hastane profilinin ne kadarının doldurulduğunu hesaplar
 * @route GET /api/hospital/profile/completion
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Profil tamamlanma bilgileri
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/profile/completion
 * Authorization: Bearer <jwt_token>
 * 
 * @since 1.0.0
 */
const getProfileCompletion = catchAsync(async (req, res, next) => {
  const completion = await hospitalService.getProfileCompletion(req.user.id);
  logger.info(`Hospital profile completion retrieved for user ${req.user.id}`);
    sendSuccess(res, 'Profil tamamlanma oranı getirildi', { completion }, 200);
});

// ============================================================================
// DEPARTMAN VE İLETİŞİM YÖNETİMİ KALDIRILDI
// ============================================================================
// Bu fonksiyonlar artık hospital_profiles tablosunda tek satırda tutuluyor
// Departmanlar ve iletişim bilgileri ayrı tablolarda değil, ana profil içinde

// ============================================================================
// İŞ İLANI YÖNETİMİ CONTROLLER'LARI (hospitalService içinde)
// ============================================================================

/**
 * Hastane iş ilanlarını listeler
 * @description Hastanenin tüm iş ilanlarını filtreleme ve sayfalama ile getirir
 * @route GET /api/hospital/jobs
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital'), validate(jobsQuerySchema, 'query')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Sayfa numarası
 * @param {number} [req.query.limit=20] - Sayfa başına kayıt sayısı
 * @param {string} [req.query.status] - İlan durumu
 * @param {string} [req.query.search] - Arama terimi
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - İş ilanları ve sayfalama bilgisi
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/jobs?page=1&limit=10&status=active&search=doktor
 * Authorization: Bearer <jwt_token>
 * 
 * @since 2.0.0
 */
const getJobs = catchAsync(async (req, res, next) => {
  const result = await hospitalService.getJobs(req.user.id, req.query);
  logger.info(`Hospital jobs retrieved for user ${req.user.id}`);
  sendSuccess(res, 'İş ilanları başarıyla getirildi', result, 200);
});

/**
 * Hastane iş ilanı oluşturur
 * @description Hastane için yeni iş ilanı oluşturur
 * @route POST /api/hospital/jobs
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital'), validate(jobSchema, 'body')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - İş ilanı verileri
 * @param {string} req.body.title - İş ilanı başlığı
 * @param {number} req.body.specialty_id - Uzmanlık ID'si
 * @param {number} [req.body.subspecialty_id] - Yan dal uzmanlığı ID'si
 * @param {string} req.body.employment_type - İstihdam türü ("Tam Zamanlı", "Yarı Zamanlı", "Nöbet Usulü")
 * @param {string} req.body.description - İş ilanı açıklaması
 * @param {number} [req.body.min_experience_years] - Minimum deneyim yılı
 * @param {number} [req.body.city_id] - Şehir ID'si
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 201 - Oluşturulan iş ilanı
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * POST /api/hospital/jobs
 * Authorization: Bearer <jwt_token>
 * {
 *   "title": "Kardiyoloji Uzmanı",
 *   "specialty_id": 1,
 *   "subspecialty_id": 5,
 *   "employment_type": "Tam Zamanlı",
 *   "description": "Deneyimli kardiyoloji uzmanı aranıyor",
 *   "min_experience_years": 3,
 *   "city_id": 1
 * }
 * 
 * @since 2.0.0
 */
const createJob = catchAsync(async (req, res, next) => {
  const job = await hospitalService.createJob(req.user.id, req.body);
  logger.info(`Hospital job created for user ${req.user.id}`);
  sendSuccess(res, 'İş ilanı başarıyla oluşturuldu', { job }, 201);
});

/**
 * Hastane iş ilanını günceller
 * @description Mevcut iş ilanını günceller
 * @route PUT /api/hospital/jobs/:jobId
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital'), validate(jobSchema, 'body')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.jobId - İş ilanı ID'si
 * @param {Object} req.body - Güncellenecek veriler
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Güncellenmiş iş ilanı
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - İş ilanı bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * PUT /api/hospital/jobs/123
 * Authorization: Bearer <jwt_token>
 * {
 *   "title": "Güncellenmiş İş İlanı",
 *   "description": "Yeni açıklama"
 * }
 * 
 * @since 2.0.0
 */
const updateJob = catchAsync(async (req, res, next) => {
  const job = await hospitalService.updateJob(req.user.id, req.params.jobId, req.body);
  logger.info(`Hospital job updated for user ${req.user.id}`);
  sendSuccess(res, 'İş ilanı başarıyla güncellendi', { job }, 200);
});

/**
 * Hastane iş ilanı durumunu günceller
 * @description İş ilanının durumunu (Aktif/Pasif) günceller
 * @route PATCH /api/hospital/jobs/:jobId/status
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.jobId - İş ilanı ID'si
 * @param {Object} req.body.status_id - Yeni durum ID'si (1: Aktif, 2: Pasif)
 * @param {Object} req.body.reason - Durum değişikliği nedeni
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Durum başarıyla güncellendi
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - İş ilanı bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/hospital/jobs/123/status
 * Authorization: Bearer <jwt_token>
 * {
 *   "status_id": 2,
 *   "reason": "İlan geçici olarak durduruldu"
 * }
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */
const updateJobStatus = catchAsync(async (req, res, next) => {
  const result = await hospitalService.updateJobStatus(req.user.id, req.params.jobId, req.body.status_id, req.body.reason);
  logger.info(`Hospital job status updated for user ${req.user.id}, job ${req.params.jobId}, status: ${req.body.status_id}`);
  sendSuccess(res, 'İş ilanı durumu başarıyla güncellendi', { job: result }, 200);
});

/**
 * Hastane iş ilanını getirir (tek ilan)
 * @description Belirli bir iş ilanının detaylarını getirir
 * @route GET /api/hospital/jobs/:jobId
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.jobId - İş ilanı ID'si
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - İş ilanı detayları
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - İş ilanı bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/jobs/123
 * Authorization: Bearer <jwt_token>
 * 
 * @since 2.0.0
 */
const getJobById = catchAsync(async (req, res, next) => {
  const job = await hospitalService.getJobById(req.user.id, req.params.jobId);
  logger.info(`Hospital job retrieved for user ${req.user.id}`);
  sendSuccess(res, 'İş ilanı başarıyla getirildi', { job }, 200);
});

/**
 * Hastane iş ilanını tekrar gönderir (resubmit)
 * @description Needs Revision durumundaki ilanı tekrar Pending Approval durumuna getirir
 * @route POST /api/hospital/jobs/:jobId/resubmit
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.jobId - İş ilanı ID'si
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Güncellenmiş iş ilanı
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - İş ilanı bulunamadı
 * @returns {Object} 400 - İlan revizyon durumunda değil
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * POST /api/hospital/jobs/123/resubmit
 * Authorization: Bearer <jwt_token>
 * 
 * @since 2.0.0
 */
const resubmitJob = catchAsync(async (req, res, next) => {
  const job = await hospitalService.resubmitJob(req.user.id, req.params.jobId);
  logger.info(`Hospital job resubmitted for user ${req.user.id}, job ${req.params.jobId}`);
  sendSuccess(res, 'İş ilanı başarıyla tekrar gönderildi', { job }, 200);
});

// ============================================================================
// BAŞVURU YÖNETİMİ CONTROLLER'LARI (hospitalService içinde)
// ============================================================================

/**
 * Hastane iş ilanı başvurularını getirir
 * @description Belirli bir iş ilanına gelen başvuruları getirir
 * @route GET /api/hospital/jobs/:jobId/applications
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital'), validate(applicationsQuerySchema, 'query')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.jobId - İş ilanı ID'si
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Sayfa numarası
 * @param {number} [req.query.limit=10] - Sayfa başına kayıt sayısı
 * @param {string} [req.query.status] - Başvuru durumu
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Başvurular ve sayfalama bilgisi
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/jobs/123/applications?page=1&limit=10&status=pending
 * Authorization: Bearer <jwt_token>
 * 
 * @since 2.0.0
 */
const getJobApplications = catchAsync(async (req, res, next) => {
  const result = await hospitalService.getApplications(req.user.id, req.params.jobId, req.query);
  logger.info(`Job applications retrieved for user ${req.user.id}`);
  sendSuccess(res, 'Başvurular başarıyla getirildi', result, 200);
});

/**
 * Hastanenin tüm ilanlarına gelen başvuruları getir
 * @description Hastanenin tüm iş ilanlarına gelen başvuruları filtreleme ve sayfalama ile getirir
 * @route GET /api/hospital/applications
 * @access Private (Hospital role required)
 * @middleware authMiddleware, requireRole('hospital'), validate(applicationsQuerySchema, 'query')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Sayfa numarası
 * @param {number} [req.query.limit=20] - Sayfa başına kayıt sayısı
 * @param {string} [req.query.status] - Başvuru durumu
 * @param {string} [req.query.search] - Arama terimi
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Başvurular ve sayfalama bilgisi
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/applications?page=1&limit=10&status=pending&search=doktor
 * Authorization: Bearer <jwt_token>
 * 
 * @since 2.0.0
 */
const getAllApplications = catchAsync(async (req, res, next) => {
  // jobIds parametresini normalize et (Express query string'den array'e çevir)
  const normalizedQuery = { ...req.query };
  if (req.query.jobIds && typeof req.query.jobIds === 'string') {
    // String ise virgülle ayır ve array'e çevir
    normalizedQuery.jobIds = req.query.jobIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
  } else if (Array.isArray(req.query.jobIds)) {
    // Zaten array ise direkt kullan
    normalizedQuery.jobIds = req.query.jobIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  }
  
  const result = await hospitalService.getAllApplications(req.user.id, normalizedQuery);
  logger.info(`All applications retrieved by hospital user ${req.user.id}`);
  sendSuccess(res, 'Tüm başvurular başarıyla getirildi', result, 200);
});

/**
 * Başvuru durumunu günceller
 * @description Başvuru durumunu günceller ve bildirim gönderir
 * @route PUT /api/hospital/applications/:applicationId/status
 * @access Private (Hospital)
 * @middleware authMiddleware, requireRole('hospital'), validate(applicationStatusSchema, 'body')
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.applicationId - Başvuru ID'si
 * @param {Object} req.body - Durum verileri
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Güncellenmiş başvuru
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 404 - Başvuru bulunamadı
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * PUT /api/hospital/applications/123/status
 * Authorization: Bearer <jwt_token>
 * {
 *   "status_id": 2,
 *   "notes": "Profil uygun, mülakat için çağrılacak"
 * }
 * 
 * @since 2.0.0
 */
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { status_id, notes } = req.body;
  const application = await hospitalService.updateApplicationStatus(req.user.id, req.params.applicationId, status_id, notes);
  logger.info(`Application status_id updated to ${status_id} for user ${req.user.id}`);
  sendSuccess(res, 'Başvuru durumu başarıyla güncellendi', { application }, 200);
});

/**
 * Hastane dashboard verilerini getir
 * @description Hastane için dashboard verilerini getirir (son başvurular ve iş ilanları)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} 200 - Dashboard verileri
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (role check failed)
 * @returns {Object} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/hospital/dashboard
 * Authorization: Bearer <jwt_token>
 * 
 * @since 2.0.0
 */
const getDashboard = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Paralel olarak verileri al
  // Limit artırıldı: 5 → 100 (tüm başvurular ve ilanlar için)
  const [recentApplications, recentJobs] = await Promise.all([
    hospitalService.getRecentApplications(userId, 100),
    hospitalService.getRecentJobs(userId, 100)
  ]);
  
  const dashboardData = {
    recent_applications: recentApplications,
    recent_jobs: recentJobs
  };
  
  logger.info(`Hospital dashboard retrieved for user ${userId}`);
  sendSuccess(res, 'Dashboard verileri başarıyla getirildi', dashboardData, 200);
});

// ============================================================================
// ADMIN BİLDİRİM İŞLEMLERİ (jobService'den taşındı)
// ============================================================================

/**
 * Admin için ilan durumu değişikliği bildirimi gönder
 * @description Admin için ilan durumu değiştiğinde başvuru yapan doktorlara bildirim gönderir.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * POST /api/hospital/jobs/123/notify-status-change
 * Body: { newStatus: "closed", oldStatus: "open" }
 */
const sendJobStatusChangeNotification = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { newStatus, oldStatus } = req.body;

  const result = await hospitalService.sendJobStatusChangeNotification(jobId, newStatus, oldStatus);
  
  logger.info(`Job status change notification sent for job ${jobId} by admin ${req.user.id}`);
  return sendSuccess(res, 'İlan durumu değişikliği bildirimi gönderildi', result);
});

// ============================================================================
// DOKTOR PROFİL GÖRÜNTÜLEME CONTROLLER'LARI
// ============================================================================

/**
 * Hastane tarafından doktor profillerini listeleme
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Doktor profilleri listesi
 * @throws {AppError} Hastane profili bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * GET /api/hospital/doctors?page=1&limit=10&search=Ahmet&specialty=Kardiyoloji&city=İstanbul
 */
const getDoctorProfiles = catchAsync(async (req, res) => {
  const hospitalUserId = req.user.id;
  const params = req.query;

  const result = await hospitalService.getDoctorProfiles(hospitalUserId, params);
  
  logger.info(`Doctor profiles retrieved by hospital ${hospitalUserId}`, { 
    params, 
    count: result.doctors.length 
  });
  
  return sendSuccess(res, 'Doktor profilleri getirildi', result);
});

/**
 * Hastane tarafından tek doktor profilini detaylı görüntüleme
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Doktor profil detayları
 * @throws {AppError} Hastane profili veya doktor profili bulunamadığında
 * 
 * @example
 * GET /api/hospital/doctors/123
 */
const getDoctorProfileDetail = catchAsync(async (req, res) => {
  const hospitalUserId = req.user.id;
  const { doctorId } = req.params;

  const result = await hospitalService.getDoctorProfileDetail(hospitalUserId, doctorId);
  
  logger.info(`Doctor profile detail retrieved by hospital ${hospitalUserId}`, { 
    doctorId 
  });
  
  return sendSuccess(res, 'Doktor profil detayı getirildi', result);
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Profil yönetimi
  getProfile,
  updateProfile,
  getProfileCompletion,
  
  // İş ilanı yönetimi (hospitalService içinde)
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  resubmitJob,
  
  // Başvuru yönetimi (hospitalService içinde)
  getJobApplications,
  getAllApplications,
  updateApplicationStatus,
  
  // Dashboard yönetimi
  getDashboard,
  
  // Admin bildirim işlemleri (jobService'den taşındı)
  sendJobStatusChangeNotification,
  
  // Doktor profil görüntüleme
  getDoctorProfiles,
  getDoctorProfileDetail
};