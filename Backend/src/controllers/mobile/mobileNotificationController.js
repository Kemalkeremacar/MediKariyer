/**
 * @file mobileNotificationController.js
 * @description Mobile notification controller - Mobil uygulama için bildirim endpoint'lerini yönetir.
 * Bu controller, mobileNotificationRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Bildirim listesi (pagination)
 * - Bildirim okundu işaretleme
 * - Device token kaydı (push notification için)
 * 
 * Endpoint'ler:
 * - GET /api/mobile/notifications - Bildirim listesi
 * - POST /api/mobile/notifications/:notificationId/read - Bildirimi okundu işaretle
 * - POST /api/mobile/device-token - Device token kaydı (push notification için)
 * 
 * Özellikler:
 * - Minimal response payload (mobile optimized)
 * - JSON-only error handling
 * - catchAsync error handling
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const { sendSuccess } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');
const mobileNotificationService = require('../../services/mobile/mobileNotificationService');

const listNotifications = catchAsync(async (req, res) => {
  const { page, limit, is_read } = req.query;
  
  // is_read parametresini boolean'a çevir (query string'den gelen 'true'/'false' string'lerini handle et)
  let isReadFilter = undefined;
  if (is_read !== undefined && is_read !== null) {
    isReadFilter = is_read === 'true' || is_read === true;
  }
  
  const result = await mobileNotificationService.listNotifications(req.user.id, { 
    page, 
    limit, 
    is_read: isReadFilter 
  });
  
  // sendPaginated kullanarak düz response döndür
  const { sendPaginated } = require('../../utils/response');
  return sendPaginated(res, 'Bildirimler listelendi', result.data, result.pagination);
});

const markAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  await mobileNotificationService.markAsRead(req.user.id, notificationId);
  return sendSuccess(res, 'Bildirim okundu olarak işaretlendi', { success: true });
});

/**
 * Device token kaydı - Expo Push Notification için cihaz token'ını backend'e kaydeder
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const registerDeviceToken = catchAsync(async (req, res) => {
  const { expo_push_token, device_id, platform, app_version } = req.body;
  const userId = req.user.id;

  const result = await mobileNotificationService.registerDeviceToken(
    userId,
    expo_push_token,
    device_id,
    platform,
    app_version || null
  );

  return sendSuccess(res, result.message, {
    device_token_id: result.device_token_id
  });
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

const getUnreadCount = catchAsync(async (req, res) => {
  // Hem toplam hem okunmamış sayısını döndür (tek API çağrısı ile)
  const counts = await mobileNotificationService.getNotificationCounts(req.user.id);
  return sendSuccess(res, 'Bildirim sayıları', { 
    count: counts.unreadCount, // Geriye dönük uyumluluk için
    unreadCount: counts.unreadCount,
    totalCount: counts.totalCount
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  await mobileNotificationService.deleteNotification(req.user.id, parseInt(notificationId));
  return sendSuccess(res, 'Bildirim silindi', { success: true });
});

const deleteNotifications = catchAsync(async (req, res) => {
  const { notification_ids } = req.body;
  const deleted = await mobileNotificationService.deleteNotifications(req.user.id, notification_ids);
  return sendSuccess(res, `${deleted} bildirim silindi`, { deleted_count: deleted });
});

/**
 * Tüm bildirimleri okundu olarak işaretle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const result = await mobileNotificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, 'Tüm bildirimler okundu olarak işaretlendi', { count: result.count });
});

/**
 * Okunmuş bildirimleri temizle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const clearReadNotifications = catchAsync(async (req, res) => {
  const result = await mobileNotificationService.clearReadNotifications(req.user.id);
  return sendSuccess(res, 'Okunmuş bildirimler temizlendi', { count: result.count });
});

module.exports = {
  listNotifications,
  markAsRead,
  registerDeviceToken,
  getUnreadCount,
  deleteNotification,
  deleteNotifications,
  markAllAsRead,
  clearReadNotifications
};

