/**
 * @file mobileNotificationRoutes.js
 * @description Mobile notification route'ları - Mobil uygulama için bildirim endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile notification ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - GET /api/mobile/notifications - Bildirim listesi (pagination, filters)
 * - POST /api/mobile/notifications/:notificationId/read - Bildirimi okundu işaretle
 * 
 * Not: Device token endpoint'i ayrı route olarak eklendi (/api/mobile/device-token)
 * 
 * Middleware'ler:
 * - mobileErrorHandler: JSON-only error handling
 * - authMiddleware: JWT token doğrulama
 * - requireDoctor: Doktor rolü kontrolü
 * - validateQuery: Query parametreleri validasyonu
 * - validateParams: Path parametreleri validasyonu
 * - validateBody: Request body validasyonu
 * - mobileErrorBoundary: Error boundary (tüm hataları JSON döndürür)
 * 
 * Güvenlik Özellikleri:
 * - JWT token authentication (zorunlu)
 * - Role-based access control (sadece doktor)
 * - Input validation (Joi schemas)
 * - JSON-only error responses
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
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireDoctor } = require('../../middleware/roleGuard');
const { mobileErrorHandler, mobileErrorBoundary } = require('../../middleware/mobileErrorHandler');
const { validateQuery, validateParams } = require('../../middleware/validationMiddleware');
const {
  mobileNotificationsQuerySchema
} = require('../../validators/mobileSchemas');
const Joi = require('joi');
const mobileNotificationController = require('../../controllers/mobile/mobileNotificationController');

const router = express.Router();

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

// Notification ID params schema
const notificationIdParamsSchema = Joi.object({
  notificationId: Joi.number().integer().positive().required().messages({
    'number.base': 'Notification ID sayı olmalıdır',
    'number.integer': 'Notification ID tam sayı olmalıdır',
    'number.positive': 'Notification ID pozitif bir sayı olmalıdır',
    'any.required': 'Notification ID zorunludur'
  })
});

router.get('/', validateQuery(mobileNotificationsQuerySchema), mobileNotificationController.listNotifications);
router.post('/:notificationId/read', validateParams(notificationIdParamsSchema), mobileNotificationController.markAsRead);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

