/**
 * @file adminRoutes.js
 * @description Admin paneli için HTTP route'larını tanımlar
 * Tüm admin işlemleri için endpoint'leri içerir
 * 
 * Backend Uyumluluğu:
 * - adminService.js'deki tüm fonksiyonlarla eşleşir
 * - adminController.js'deki tüm fonksiyonlarla uyumlu
 * - adminSchemas.js'deki validation kurallarına uygun
 * 
 * Dashboard ve İstatistikler:
 * - Dashboard verileri adminService'den alınır
 * - Tüm istatistikler adminService fonksiyonlarından çekilir
 * - Admin paneli adminService'i kullanır
 * 
 * İletişim Mesaj Yönetimi:
 * - Contact mesajları için ContactController ve ContactSchemas kullanılır
 * - Anasayfadan public olarak mesaj gönderilebilir
 * - Admin bunu görüntüleyebilir (yanıtlama yok)
 * 
 * @author MediKariyer Development Team
 * @version 4.0.0
 * @since 2024
 */
'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const express = require('express');
const adminController = require('../controllers/adminController');
const contactController = require('../controllers/contactController');
const adminSchemas = require('../validators/adminSchemas');
const contactSchemas = require('../validators/contactSchemas');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// MIDDLEWARE KURULUMU
// ============================================================================

// Tüm rotalara kimlik doğrulama ve admin rolü gereksinimi uygula
router.use(authMiddleware);
router.use(requireRole(['admin']));


// ============================================================================
// İŞ İLANLARI YÖNETİMİ
// ============================================================================

/**
 * @route   GET /api/admin/jobs
 * @desc    İş ilanları listesini getir
 * @access  Özel (Admin)
 */
router.get('/jobs', adminController.getAllJobs);

/**
 * @route   GET /api/admin/jobs/:id
 * @desc    İş ilanı detaylarını getir
 * @access  Özel (Admin)
 */
router.get('/jobs/:id', adminController.getJobById);

/**
 * @route   PUT /api/admin/jobs/:id
 * @desc    İş ilanını güncelle
 * @access  Özel (Admin)
 */
router.put('/jobs/:id', validate(adminSchemas.jobIdParamSchema, 'params'), validate(adminSchemas.jobUpdateSchema, 'body'), adminController.updateJob);

/**
 * @route   PATCH /api/admin/jobs/:id/status
 * @desc    İş ilanı durumunu güncelle
 * @access  Özel (Admin)
 */
router.patch('/jobs/:id/status', validate(adminSchemas.jobIdParamSchema, 'params'), validate(adminSchemas.jobStatusUpdateSchema, 'body'), adminController.updateJobStatus);

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    İş ilanını sil
 * @access  Özel (Admin)
 */
router.delete('/jobs/:id', validate(adminSchemas.jobIdParamSchema, 'params'), adminController.deleteJob);

// ============================================================================
// KULLANICI YÖNETİMİ
// ============================================================================

/**
 * @route   GET /api/admin/users
 * @desc    Kullanıcı listesini getir
 * @access  Özel (Admin)
 */
router.get('/users', validate(adminSchemas.getUsersQuerySchema, 'query'), adminController.getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Kullanıcı detaylarını getir
 * @access  Özel (Admin)
 */
router.get('/users/:id', validate(adminSchemas.userIdParamSchema, 'params'), adminController.getUserDetails);


/**
 * @route   PATCH /api/admin/users/:id/approval
 * @desc    Kullanıcı onay durumunu güncelle
 * @access  Özel (Admin)
 */
router.patch('/users/:id/approval', validate(adminSchemas.userIdParamSchema, 'params'), validate(adminSchemas.approveUserSchema, 'body'), adminController.updateUserApproval);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Kullanıcı durumunu güncelle
 * @access  Özel (Admin)
 */
router.patch('/users/:id/status', validate(adminSchemas.userIdParamSchema, 'params'), validate(adminSchemas.userStatusUpdateSchema, 'body'), adminController.updateUserStatus);

/**
 * @route   PATCH /api/admin/users/:id/deactivate
 * @desc    Kullanıcıyı pasifleştir (Soft delete)
 * @access  Özel (Admin)
 */
router.patch('/users/:id/deactivate', validate(adminSchemas.userIdParamSchema, 'params'), adminController.deactivateUser);

/**
 * @route   PATCH /api/admin/users/:id/activate
 * @desc    Kullanıcıyı aktifleştir
 * @access  Özel (Admin)
 */
router.patch('/users/:id/activate', validate(adminSchemas.userIdParamSchema, 'params'), adminController.activateUser);


// ============================================================================
// BAŞVURU YÖNETİMİ
// ============================================================================

/**
 * @route   GET /api/admin/applications
 * @desc    Başvuru listesini getir
 * @access  Özel (Admin)
 */
router.get('/applications', adminController.getAllApplications);

/**
 * @route   GET /api/admin/applications/:id
 * @desc    Başvuru detaylarını getir
 * @access  Özel (Admin)
 */
router.get('/applications/:id', adminController.getApplicationById);

/**
 * @route   PUT /api/admin/applications/:id/status
 * @desc    Başvuru durumunu güncelle
 * @access  Özel (Admin)
 */
router.put('/applications/:id/status', validate(adminSchemas.applicationIdParamSchema, 'params'), validate(adminSchemas.applicationStatusUpdateSchema, 'body'), adminController.updateApplicationStatus);

/**
 * @route   DELETE /api/admin/applications/:id
 * @desc    Başvuruyu sil
 * @access  Özel (Admin)
 */
router.delete('/applications/:id', validate(adminSchemas.applicationIdParamSchema, 'params'), adminController.deleteApplication);

// ============================================================================
// BİLDİRİM YÖNETİMİ
// ============================================================================

/**
 * @route   GET /api/admin/notifications
 * @desc    Bildirim listesini getir
 * @access  Özel (Admin)
 */
router.get('/notifications', validate(adminSchemas.notificationsQuerySchema, 'query'), adminController.getAllNotifications);

/**
 * @route   PATCH /api/admin/notifications/mark-all-read
 * @desc    Tüm bildirimleri okundu olarak işaretle
 * @access  Özel (Admin)
 */
router.patch('/notifications/mark-all-read', adminController.markAllNotificationsAsRead);

/**
 * @route   DELETE /api/admin/notifications/clear-read
 * @desc    Okunmuş bildirimleri sil
 * @access  Özel (Admin)
 */
router.delete('/notifications/clear-read', adminController.clearReadNotifications);

/**
 * @route   GET /api/admin/notifications/:id
 * @desc    Bildirim detaylarını getir
 * @access  Özel (Admin)
 */
router.get('/notifications/:id', validate(adminSchemas.notificationIdParamSchema, 'params'), adminController.getNotificationById);

/**
 * @route   PATCH /api/admin/notifications/:id
 * @desc    Bildirim güncelle
 * @access  Özel (Admin)
 */
router.patch('/notifications/:id', validate(adminSchemas.notificationIdParamSchema, 'params'), validate(adminSchemas.updateNotificationSchema, 'body'), adminController.updateNotification);

/**
 * @route   DELETE /api/admin/notifications/:id
 * @desc    Bildirim sil
 * @access  Özel (Admin)
 */
router.delete('/notifications/:id', validate(adminSchemas.notificationIdParamSchema, 'params'), adminController.deleteNotification);




// ============================================================================
// İLETİŞİM MESAJLARI YÖNETİMİ
// ============================================================================

/**
 * @route   GET /api/admin/contact-messages
 * @desc    İletişim mesajları listesini getir
 * @access  Özel (Admin)
 */
router.get('/contact-messages', contactController.getContactMessages);

/**
 * @route   GET /api/admin/contact-messages/:id
 * @desc    İletişim mesajı detaylarını getir
 * @access  Özel (Admin)
 */
router.get('/contact-messages/:id', validate(contactSchemas.contactIdParamSchema, 'params'), contactController.getContactMessageById);


/**
 * @route   DELETE /api/admin/contact-messages/:id
 * @desc    İletişim mesajını sil
 * @access  Özel (Admin)
 */
router.delete('/contact-messages/:id', validate(contactSchemas.contactIdParamSchema, 'params'), contactController.deleteContactMessage);

// ============================================================================
// ESKİ FOTOĞRAF ONAY SİSTEMİ KALDIRILDI
// ============================================================================
// Artık doctor_profile_photo_requests tablosu kullanılıyor

// ============================================================================
// ANALYTICS & DASHBOARD
// ============================================================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Admin dashboard verilerini getir
 * @access  Özel (Admin)
 */
router.get('/dashboard', validate(adminSchemas.dashboardQuerySchema, 'query'), adminController.getDashboard);


// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ
// ============================================================================

/**
 * @route   GET /api/admin/photo-requests
 * @desc    Fotoğraf onay taleplerini getir
 * @access  Özel (Admin)
 */
router.get('/photo-requests', validate(adminSchemas.photoRequestQuerySchema, 'query'), adminController.getPhotoRequests);

/**
 * @route   PATCH /api/admin/photo-requests/:id
 * @desc    Fotoğraf talebini onayla veya reddet
 * @access  Özel (Admin)
 */
router.patch('/photo-requests/:id', validate(adminSchemas.photoRequestIdParamSchema, 'params'), validate(adminSchemas.photoRequestReviewSchema, 'body'), adminController.reviewPhotoRequest);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;
