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
  const { page, limit } = req.query;
  const data = await mobileNotificationService.listNotifications(req.user.id, { page, limit });
  return sendSuccess(res, 'Bildirimler listelendi', data);
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

module.exports = {
  listNotifications,
  markAsRead,
  registerDeviceToken
};

