/**
 * @file notificationRoutes.js
 * @description Bildirim route'ları - Tüm kullanıcılar (doktor, hastane, admin) için bildirim HTTP endpoint'lerini tanımlar.
 * Bu dosya, notificationController fonksiyonlarını HTTP route'larına bağlar.
 * 
 * Ana İşlevler:
 * - Bildirim listeleme ve filtreleme (tüm kullanıcılar için)
 * - Bildirim okundu/okunmadı durumu yönetimi
 * - Bildirim silme ve temizleme işlemleri
 * - Admin bildirim gönderme (sadece admin)
 * - Rol bazlı erişim kontrolü
 * - Request validation
 * 
 * Servis Ayrımı Mantığı:
 * - Bu routes TÜM kullanıcılar için ortak bildirim işlemleri yapar
 * - Doktorlar: Bildirimleri alır ve yönetir
 * - Hastaneler: Bildirimleri alır ve yönetir
 * - Adminler: Bildirimleri hem alır hem gönderir
 * 
 * HTTP Endpoint'leri:
 * - GET /api/notifications - Bildirim listesi (tüm kullanıcılar)
 * - GET /api/notifications/unread-count - Okunmamış sayısı (tüm kullanıcılar)
 * - PATCH /api/notifications/mark-all-read - Tümünü okundu işaretle (tüm kullanıcılar)
 * - POST /api/notifications/send - Bildirim gönder (sadece admin)
 * 
 * Middleware Zinciri:
 * - authMiddleware: Kimlik doğrulama
 * - requireRole: Rol kontrolü (admin için özel endpoint'ler)
 * - validate: Request validation
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');
const { validateBody, validateQuery, validateParams } = require('../middleware/validationMiddleware');
const { 
  notificationFilterSchema,
  markMultipleAsReadSchema,
  sendNotificationSchema,
  notificationIdParamSchema
} = require('../validators/notificationSchemas');

// ============================================================================
// BİLDİRİM LİSTELEME VE GETİRME ROUTES
// ============================================================================

/**
 * @route GET /api/notifications
 * @description Kullanıcının bildirimlerini listele
 * @access Private - Doctor, Hospital, Admin
 */
router.get('/',
  authMiddleware,
  validateQuery(notificationFilterSchema),
  notificationController.getNotifications
);

/**
 * @route GET /api/notifications/unread-count
 * @description Okunmamış bildirim sayısını getir
 * @access Private - Doctor, Hospital, Admin
 */
router.get('/unread-count',
  authMiddleware,
  notificationController.getUnreadCount
);

/**
 * @route GET /api/notifications/:id
 * @description Tek bir bildirimi getir
 * @access Private - Doctor, Hospital, Admin
 */
router.get('/:id',
  authMiddleware,
  validateParams(notificationIdParamSchema),
  notificationController.getNotificationById
);

// ============================================================================
// BİLDİRİM DURUMU YÖNETİMİ ROUTES
// ============================================================================

/**
 * @route PATCH /api/notifications/:id/read
 * @description Bildirimi okundu olarak işaretle
 * @access Private - Doctor, Hospital, Admin
 */
router.patch('/:id/read',
  authMiddleware,
  validateParams(notificationIdParamSchema),
  notificationController.markAsRead
);

/**
 * @route PATCH /api/notifications/mark-multiple-read
 * @description Birden fazla bildirimi okundu olarak işaretle
 * @access Private - Doctor, Hospital, Admin
 */
router.patch('/mark-multiple-read',
  authMiddleware,
  validateBody(markMultipleAsReadSchema),
  notificationController.markMultipleAsRead
);

/**
 * @route PATCH /api/notifications/mark-all-read
 * @description Tüm bildirimleri okundu olarak işaretle
 * @access Private - Doctor, Hospital, Admin
 */
router.patch('/mark-all-read',
  authMiddleware,
  notificationController.markAllAsRead
);

// ============================================================================
// BİLDİRİM SİLME VE TEMİZLEME ROUTES
// ============================================================================

/**
 * @route DELETE /api/notifications/:id
 * @description Bildirimi sil
 * @access Private - Doctor, Hospital, Admin
 */
router.delete('/:id',
  authMiddleware,
  validateParams(notificationIdParamSchema),
  notificationController.deleteNotification
);

/**
 * @route DELETE /api/notifications/clear-read
 * @description Okunmuş bildirimleri temizle
 * @access Private - Doctor, Hospital, Admin
 */
router.delete('/clear-read',
  authMiddleware,
  notificationController.clearReadNotifications
);

// ============================================================================
// ADMIN BİLDİRİM İŞLEMLERİ ROUTES
// ============================================================================

/**
 * @route POST /api/notifications/send
 * @description Admin bildirim gönder
 * @access Private - Sadece Admin
 */
router.post('/send',
  authMiddleware,
  requireRole(['admin']),
  validateBody(sendNotificationSchema),
  notificationController.sendNotification
);

/**
 * @route GET /api/notifications/admin/all
 * @description Admin tüm bildirimleri listele
 * @access Private - Sadece Admin
 */
router.get('/admin/all',
  authMiddleware,
  requireRole(['admin']),
  validateQuery(notificationFilterSchema),
  notificationController.getAllNotificationsForAdmin
);

/**
 * @route GET /api/notifications/admin/stats
 * @description Admin bildirim istatistikleri
 * @access Private - Sadece Admin
 */
router.get('/admin/stats',
  authMiddleware,
  requireRole(['admin']),
  notificationController.getNotificationStats
);


module.exports = router;