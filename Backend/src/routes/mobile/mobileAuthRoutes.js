/**
 * @file mobileAuthRoutes.js
 * @description Mobile authentication route'ları - Mobil uygulama için API endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile authentication ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - POST /api/mobile/auth/login - Mobil login (email + password)
 * - POST /api/mobile/auth/refresh - Token yenileme (refresh token)
 * - POST /api/mobile/auth/logout - Çıkış (refresh token iptal)
 * 
 * Middleware'ler:
 * - mobileErrorHandler: JSON-only error handling
 * - validateBody: Request body validasyonu (Joi schemas)
 * 
 * Güvenlik Özellikleri:
 * - Input validation (Joi schemas)
 * - JWT token authentication (login sonrası)
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
const mobileAuthController = require('../../controllers/mobile/mobileAuthController');
const { mobileErrorHandler, mobileErrorBoundary } = require('../../middleware/mobileErrorHandler');
const { validateBody } = require('../../middleware/validationMiddleware');
const {
  mobileLoginSchema,
  mobileRefreshTokenSchema,
  mobileLogoutSchema
} = require('../../validators/mobileSchemas');

const router = express.Router();

router.use(mobileErrorHandler);

router.post('/login', validateBody(mobileLoginSchema), mobileAuthController.login);
router.post('/refresh', validateBody(mobileRefreshTokenSchema), mobileAuthController.refreshToken);
router.post('/logout', validateBody(mobileLogoutSchema), mobileAuthController.logout);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

