/**
 * @file adminController.js
 * @description Admin paneli için HTTP endpoint'lerini yönetir
 * Tüm admin işlemleri için controller fonksiyonlarını içerir
 * 
 * Dashboard ve İstatistikler:
 * - Dashboard verileri AdminService'den alınır
 * - Tüm istatistikler adminService dosyasından çekilir
 * - Admin paneli adminService'i kullanır
 * 
 * İletişim Mesaj Yönetimi:
 * - Contact mesajları için ContactController kullanılır
 * - Anasayfadan public olarak mesaj gönderilebilir
 * - Admin bunu görüntüleyebilir (yanıtlama yok)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */
'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const adminService = require('../services/adminService');
const notificationService = require('../services/notificationService');
const LogService = require('../services/logService');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const logger = require('../utils/logger');


// ============================================================================
// KULLANICI YÖNETİMİ
// ============================================================================

/**
 * Filtrelenmiş kullanıcı listesini getirir
 * Sayfalama ve filtreleme desteği ile
 * 
 * @route GET /api/admin/users
 * @access Private (Admin)
 * @returns {Object} Kullanıcı listesi ve sayfalama bilgileri
 */
const getUsers = catchAsync(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  return sendPaginated(res, 'Kullanıcılar getirildi', result.data, result.pagination);
});

/**
 * Belirli bir kullanıcının detaylarını getirir
 * Profil bilgileriyle birlikte döner
 * 
 * @route GET /api/admin/users/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Kullanıcı ID'si
 * @returns {Object} Kullanıcı detayları
 */
const getUserDetails = catchAsync(async (req, res) => {
  const user = await adminService.getUserDetails(req.params.id);
  if (!user) throw new AppError('Kullanıcı bulunamadı', 404);
  
  // Hospital kullanıcıları için profil bilgileri loglanıyor
  if (user.role === 'hospital') {
    logger.debug('Hospital user details retrieved:', { 
      userId: user.id,
      hasProfile: !!user.profile,
      hasLogo: !!user.profile?.logo,
      logo: user.profile?.logo ? user.profile.logo.substring(0, 50) + '...' : null
    });
  }
  
  return sendSuccess(res, 'Kullanıcı detayları getirildi', { user });
});



// ============================================================================
// KULLANICI DURUMU YÖNETİMİ
// ============================================================================

/**
 * Kullanıcı onay durumunu günceller
 * Onay/red durumuna göre bildirim gönderir
 * 
 * @route PATCH /api/admin/users/:id/approval
 * @access Private (Admin)
 * @param {number} req.params.id - Kullanıcı ID'si
 * @param {boolean} req.body.approved - Onay durumu
 * @param {string} req.body.reason - Durum değişiklik sebebi
 * @returns {Object} Başarı mesajı
 */
const updateUserApproval = catchAsync(async (req, res) => {
  const { approved, reason } = req.body;
  const result = await adminService.updateUserApproval(req.params.id, approved, reason);
  if (!result) throw new AppError('Kullanıcı bulunamadı', 404);

  logger.info(`User approval updated: ${req.params.id} - ${approved ? 'approved' : 'rejected'} by ${req.user.email}`);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: approved ? 'user.approve' : 'user.reject',
    resourceType: 'user',
    resourceId: parseInt(req.params.id),
    oldValues: { is_approved: !approved },
    newValues: { is_approved: approved, reason },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { reason }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, approved ? 'Kullanıcı onaylandı' : 'Kullanıcı reddedildi');
});

// Deprecated endpoint kaldırıldı - updateUserApproval kullanılmalı

/**
 * Kullanıcı durumunu günceller (aktiflik/onay)
 * Alan ve değere göre işlem yapar
 * 
 * @route PATCH /api/admin/users/:id/status
 * @access Private (Admin)
 * @param {number} req.params.id - Kullanıcı ID'si
 * @param {string} req.body.field - Güncellenecek alan (is_active, is_approved)
 * @param {boolean} req.body.value - Yeni değer
 * @param {string} req.body.reason - Durum değişiklik sebebi
 * @returns {Object} Başarı mesajı
 */
const updateUserStatus = catchAsync(async (req, res) => {
  const { field, value } = req.body;
  
  let result;
  if (field === 'is_active') {
    result = await adminService.updateUserStatus(req.params.id, value, null);
    logger.info(`User status updated: ${req.params.id} - ${value ? 'activated' : 'deactivated'} by ${req.user.email}`);
    return sendSuccess(res, value ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi');
  } else if (field === 'is_approved') {
    result = await adminService.updateUserApproval(req.params.id, value, null);
    logger.info(`User approval updated: ${req.params.id} - ${value ? 'approved' : 'rejected'} by ${req.user.email}`);
    return sendSuccess(res, value ? 'Kullanıcı onaylandı' : 'Kullanıcı onayı kaldırıldı');
  } else {
    throw new AppError('Geçersiz alan: ' + field, 400);
  }
  
  if (!result) throw new AppError('Kullanıcı bulunamadı', 404);
});

/**
 * Kullanıcıyı pasifleştirir (Soft delete)
 * Kullanıcı giriş yapamaz, verileri görünmez ama silinmez
 * 
 * @route PATCH /api/admin/users/:id/deactivate
 * @access Private (Admin)
 * @param {number} req.params.id - Pasifleştirilecek kullanıcı ID'si
 * @param {string} [req.body.reason] - Pasifleştirme sebebi
 * @returns {Object} Başarı mesajı
 */
const deactivateUser = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const result = await adminService.deactivateUser(req.params.id, reason);
  if (!result) throw new AppError('Kullanıcı bulunamadı', 404);

  logger.info(`User deactivated: ${req.params.id} by ${req.user.email}${reason ? `, reason: ${reason}` : ''}`);
  return sendSuccess(res, 'Kullanıcı pasifleştirildi');
});

/**
 * Kullanıcıyı yeniden aktifleştirir
 * 
 * @route PATCH /api/admin/users/:id/activate
 * @access Private (Admin)
 * @param {number} req.params.id - Aktifleştirilecek kullanıcı ID'si
 * @param {string} [req.body.reason] - Aktifleştirme sebebi
 * @returns {Object} Başarı mesajı
 */
const activateUser = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const result = await adminService.activateUser(req.params.id, reason);
  if (!result) throw new AppError('Kullanıcı bulunamadı', 404);

  logger.info(`User activated: ${req.params.id} by ${req.user.email}${reason ? `, reason: ${reason}` : ''}`);
  return sendSuccess(res, 'Kullanıcı aktifleştirildi');
});


// ============================================================================
// İŞ İLANLARI YÖNETİMİ
// ============================================================================

/**
 * Filtrelenmiş iş ilanları listesini getirir
 * 
 * @route GET /api/admin/jobs
 * @access Private (Admin)
 * @returns {Object} İş ilanları listesi ve sayfalama bilgileri
 */
const getAllJobs = catchAsync(async (req, res) => {
  const result = await adminService.getAllJobs(req.query);
  return sendPaginated(res, 'İş ilanları getirildi', result.data, result.pagination);
});

/**
 * Belirli bir iş ilanının detaylarını getirir
 * 
 * @route GET /api/admin/jobs/:id
 * @access Private (Admin)
 * @param {number} req.params.id - İş ilanı ID'si
 * @returns {Object} İş ilanı detayları
 */
const getJobById = catchAsync(async (req, res) => {
  const job = await adminService.getJobDetails(req.params.id);
  if (!job) throw new AppError('İş ilanı bulunamadı', 404);
  return sendSuccess(res, 'İş ilanı detayları getirildi', { job });
});

/**
 * İş ilanı durumunu günceller
 * 
 * @route PATCH /api/admin/jobs/:id/status
 * @access Private (Admin)
 * @param {number} req.params.id - İş ilanı ID'si
 * @param {number} req.body.status_id - Yeni durum ID'si
 * @param {string} req.body.reason - Durum değişiklik sebebi
 * @returns {Object} Başarı mesajı
 */
const updateJobStatus = catchAsync(async (req, res) => {
  const job = await adminService.updateJobStatus(req.params.id, req.body.status_id, req.user.id, req.body.reason);
  if (!job) throw new AppError('İş ilanı bulunamadı', 404);

  logger.info(`Job status updated: ${req.params.id} - status_id: ${req.body.status_id} by ${req.user.email}`);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: 'job.status_update',
    resourceType: 'job',
    resourceId: parseInt(req.params.id),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { 
      new_status_id: req.body.status_id,
      reason: req.body.reason 
    }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, 'İş ilanı durumu güncellendi');
});

/**
 * İş ilanını günceller
 * 
 * @route PUT /api/admin/jobs/:id
 * @access Private (Admin)
 * @param {number} req.params.id - İş ilanı ID'si
 * @param {Object} req.body - Güncellenecek veriler
 * @returns {Object} Güncellenmiş iş ilanı
 */
const updateJob = catchAsync(async (req, res) => {
  const job = await adminService.updateJob(req.params.id, req.body);
  if (!job) throw new AppError('İş ilanı bulunamadı', 404);

  logger.info(`Job updated: ${req.params.id} by ${req.user.email}`);
  return sendSuccess(res, 'İş ilanı güncellendi', { job });
});

/**
 * İş ilanını siler
 * 
 * @route DELETE /api/admin/jobs/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Silinecek iş ilanı ID'si
 * @returns {Object} Başarı mesajı
 */
const deleteJob = catchAsync(async (req, res) => {
  const result = await adminService.deleteJob(req.params.id);
  if (!result) throw new AppError('İş ilanı bulunamadı', 404);

  logger.info(`Job deleted: ${req.params.id} by ${req.user.email}`);
  return sendSuccess(res, 'İş ilanı silindi');
});

/**
 * İş ilanını onaylar
 * 
 * @route POST /api/admin/jobs/:id/approve
 * @access Private (Admin)
 * @param {number} req.params.id - Onaylanacak iş ilanı ID'si
 * @returns {Object} Güncellenmiş iş ilanı
 */
const approveJob = catchAsync(async (req, res) => {
  const job = await adminService.approveJob(req.params.id, req.user.id);
  if (!job) throw new AppError('İş ilanı bulunamadı', 404);

  logger.info(`Job approved: ${req.params.id} by ${req.user.email}`);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: 'job.approve',
    resourceType: 'job',
    resourceId: parseInt(req.params.id),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { job_title: job.title }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, 'İş ilanı onaylandı', { job });
});

/**
 * İş ilanı için revizyon talep eder
 * 
 * @route POST /api/admin/jobs/:id/revision
 * @access Private (Admin)
 * @param {number} req.params.id - Revizyon istenecek iş ilanı ID'si
 * @param {string} req.body.revision_note - Revizyon notu
 * @returns {Object} Güncellenmiş iş ilanı
 */
const requestRevision = catchAsync(async (req, res) => {
  const { revision_note } = req.body;
  if (!revision_note || revision_note.trim() === '') {
    throw new AppError('Revizyon notu zorunludur', 400);
  }

  const job = await adminService.requestRevision(req.params.id, req.user.id, revision_note);
  if (!job) throw new AppError('İş ilanı bulunamadı', 404);

  logger.info(`Job revision requested: ${req.params.id} by ${req.user.email}`);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: 'job.request_revision',
    resourceType: 'job',
    resourceId: parseInt(req.params.id),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { revision_note }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, 'Revizyon talebi gönderildi', { job });
});

/**
 * İş ilanını reddeder
 * 
 * @route POST /api/admin/jobs/:id/reject
 * @access Private (Admin)
 * @param {number} req.params.id - Reddedilecek iş ilanı ID'si
 * @param {string} [req.body.rejection_reason] - Red sebebi
 * @returns {Object} Güncellenmiş iş ilanı
 */
const rejectJob = catchAsync(async (req, res) => {
  const { rejection_reason } = req.body;
  const job = await adminService.rejectJob(req.params.id, req.user.id, rejection_reason);
  if (!job) throw new AppError('İş ilanı bulunamadı', 404);

  logger.info(`Job rejected: ${req.params.id} by ${req.user.email}`);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: 'job.reject',
    resourceType: 'job',
    resourceId: parseInt(req.params.id),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { rejection_reason, job_title: job.title }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, 'İş ilanı reddedildi', { job });
});

/**
 * İş ilanı statü geçmişini getirir
 * 
 * @route GET /api/admin/jobs/:id/history
 * @access Private (Admin)
 * @param {number} req.params.id - İş ilanı ID'si
 * @returns {Object} Statü geçmişi listesi
 */
const getJobHistory = catchAsync(async (req, res) => {
  const history = await adminService.getJobHistory(req.params.id);

  logger.info(`Job history retrieved: ${req.params.id} by ${req.user.email}`);
  return sendSuccess(res, 'İlan geçmişi getirildi', { history });
});

// ============================================================================
// BAŞVURU YÖNETİMİ
// ============================================================================

/**
 * Filtrelenmiş başvuru listesini getirir
 * 
 * @route GET /api/admin/applications
 * @access Private (Admin)
 * @returns {Object} Başvuru listesi ve sayfalama bilgileri
 */
const getAllApplications = catchAsync(async (req, res) => {
  const result = await adminService.getAllApplications(req.query);
  return sendPaginated(res, 'Başvurular getirildi', result.data, result.pagination);
});

/**
 * Belirli bir başvurunun detaylarını getirir
 * 
 * @route GET /api/admin/applications/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Başvuru ID'si
 * @returns {Object} Başvuru detayları
 */
const getApplicationById = catchAsync(async (req, res) => {
  const application = await adminService.getApplicationDetails(req.params.id);
  if (!application) throw new AppError('Başvuru bulunamadı', 404);
  return sendSuccess(res, 'Başvuru detayları getirildi', { application });
});

/**
 * Başvuru durumunu günceller
 * 
 * @route PUT /api/admin/applications/:id/status
 * @access Private (Admin)
 * @param {number} req.params.id - Başvuru ID'si
 * @param {number} req.body.status_id - Yeni durum ID'si (application_statuses.id)
 * @param {string} req.body.reason - Güncelleme sebebi
 * @returns {Object} Güncellenmiş başvuru bilgileri
 */
const updateApplicationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status_id, reason } = req.body;
  
  const result = await adminService.updateApplicationStatus(id, status_id, reason);
  logger.info(`Application ${id} status updated to ${status_id} by ${req.user.email}`);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: 'application.update_status',
    resourceType: 'application',
    resourceId: parseInt(id),
    oldValues: { status_id: result.oldStatusId },
    newValues: { status_id, reason },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { reason }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  return sendSuccess(res, 'Başvuru durumu güncellendi', result);
});

/**
 * Başvuruyu siler
 * 
 * @route DELETE /api/admin/applications/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Başvuru ID'si
 * @returns {Object} Silme işlemi sonucu
 */
const deleteApplication = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  await adminService.deleteApplication(id);
  logger.info(`Application ${id} deleted by ${req.user.email}`);
  return sendSuccess(res, 'Başvuru silindi');
});

// ============================================================================
// BİLDİRİM YÖNETİMİ
// ============================================================================

/**
 * Tüm bildirimleri getirir (Admin için)
 * 
 * @route GET /api/admin/notifications
 * @access Private (Admin)
 * @returns {Object} Bildirim listesi ve sayfalama bilgileri
 */
const getAllNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.getAllNotificationsForAdmin(req.query);
  return sendPaginated(res, 'Bildirimler getirildi', result.data, result.pagination);
});

/**
 * Belirli bir bildirimin detaylarını getirir
 * 
 * @route GET /api/admin/notifications/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Bildirim ID'si
 * @returns {Object} Bildirim detayları
 */
const getNotificationById = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id);
  if (!notification) throw new AppError('Bildirim bulunamadı', 404);
  return sendSuccess(res, 'Bildirim detayları getirildi', { notification });
});


/**
 * Bildirim günceller (Admin için)
 * 
 * @route PATCH /api/admin/notifications/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Bildirim ID'si
 * @param {Object} req.body - Güncellenecek veriler
 * @returns {Object} Başarı mesajı
 */
const updateNotification = catchAsync(async (req, res) => {
  // NotificationService'deki updateNotification fonksiyonunu kullan
  const result = await notificationService.updateNotification(req.params.id, req.body);
  if (!result) throw new AppError('Bildirim bulunamadı', 404);
  return sendSuccess(res, 'Bildirim güncellendi');
});

/**
 * Bildirim siler (Admin için)
 * 
 * @route DELETE /api/admin/notifications/:id
 * @access Private (Admin)
 * @param {number} req.params.id - Silinecek bildirim ID'si
 * @returns {Object} Başarı mesajı
 */
const deleteNotification = catchAsync(async (req, res) => {
  // req.user zaten authMiddleware tarafından set edilmiş
  const result = await notificationService.deleteNotification(req.params.id, req.user.id);
  if (!result) throw new AppError('Bildirim bulunamadı', 404);
  return sendSuccess(res, 'Bildirim silindi');
});

/**
 * Tüm bildirimleri okundu olarak işaretle (Admin için)
 * 
 * @route PATCH /api/admin/notifications/mark-all-read
 * @access Private (Admin)
 * @returns {Object} Başarı mesajı
 */
const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  // req.user zaten authMiddleware tarafından set edilmiş
  const result = await notificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, 'Tüm bildirimler okundu olarak işaretlendi', result);
});

/**
 * Okunmuş bildirimleri sil (Admin için)
 * 
 * @route DELETE /api/admin/notifications/clear-read
 * @access Private (Admin)
 * @returns {Object} Başarı mesajı
 */
const clearReadNotifications = catchAsync(async (req, res) => {
  // req.user zaten authMiddleware tarafından set edilmiş
  const result = await notificationService.clearReadNotifications(req.user.id);
  return sendSuccess(res, 'Okunmuş bildirimler silindi', result);
});



// ============================================================================
// ANALYTICS & DASHBOARD
// ============================================================================

/**
 * Admin dashboard verilerini getirir
 * Sistem geneli istatistikler ve trendler
 * 
 * @route GET /api/admin/dashboard
 * @access Private (Admin)
 * @returns {Object} Dashboard verileri
 */
const getDashboard = catchAsync(async (req, res) => {
  const result = await adminService.getDashboardData(req.query);
  return sendSuccess(res, 'Dashboard verileri getirildi', result);
});

// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ
// ============================================================================

/**
 * Fotoğraf onay taleplerini getir
 * @description Admin için fotoğraf onay taleplerini listeler
 * @route GET /api/admin/photo-requests
 * @access Private (Admin)
 */
const getPhotoRequests = catchAsync(async (req, res) => {
  const result = await adminService.getPhotoRequests(req.query);
  
  sendPaginated(res, 'Fotoğraf onay talepleri getirildi', result.data, result.pagination);
});

/**
 * Fotoğraf talebini onayla veya reddet
 * @description Admin fotoğraf talebini onaylar veya reddeder
 * @route PATCH /api/admin/photo-requests/:id
 * @access Private (Admin)
 */
const reviewPhotoRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body;
  
  if (!action || !['approve', 'reject'].includes(action)) {
    throw new AppError('Geçersiz işlem. approve veya reject olmalıdır', 400);
  }
  
  const result = await adminService.reviewPhotoRequest(req.user.id, parseInt(id), action, reason);
  
  // Audit log kaydet
  const userInfo = await LogService.getUserInfoForAudit(req.user.id, req.user.role).catch(() => ({ name: 'Admin', email: req.user.email }));
  await LogService.createAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: userInfo.name || 'Admin',
    actorEmail: userInfo.email,
    action: `photo_request.${action}`,
    resourceType: 'photo_request',
    resourceId: parseInt(id),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { reason, doctor_profile_id: result.doctor_profile_id }
  }).catch(err => logger.error('Audit log kayıt hatası', { error: err.message }));
  
  const message = action === 'approve' 
    ? 'Fotoğraf onaylandı ve profilde güncellendi'
    : 'Fotoğraf reddedildi';
  
  sendSuccess(res, {
    message,
    data: { request: result }
  });
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  getUsers,
  getUserDetails,
  updateUserApproval,
  updateUserStatus,
  deactivateUser,
  activateUser,
  getAllJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
  approveJob,
  requestRevision,
  rejectJob,
  getJobHistory,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markAllNotificationsAsRead,
  clearReadNotifications,
  // Fotoğraf onay sistemi (yeni sistem)
  getPhotoRequests,
  reviewPhotoRequest,
  
  // Analytics functions
  getDashboard
};
