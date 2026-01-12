/**
 * @file mobileAuthRoutes.js
 * @description Mobile authentication route'ları - Mobil uygulama için API endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile authentication ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - POST /api/mobile/auth/login - Mobil login (email + password)
 * - POST /api/mobile/auth/refresh - Token yenileme (refresh token)
 * - POST /api/mobile/auth/logout - Çıkış (refresh token iptal)
 * - POST /api/mobile/auth/forgot-password - Şifre sıfırlama talebi (web ile aynı mantık)
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
const { authLimiter } = require('../../middleware/rateLimitMiddleware');
const {
  mobileLoginSchema,
  mobileRefreshTokenSchema,
  mobileLogoutSchema,
  mobileRegisterDoctorSchema,
  mobileChangePasswordSchema,
  mobileResetPasswordSchema
} = require('../../validators/mobileSchemas');
const { forgotPasswordSchema } = require('../../validators/authSchemas');

const router = express.Router();

router.use(mobileErrorHandler);

// Rate limiting: Brute force saldırılarına karşı koruma
router.post('/registerDoctor', authLimiter, validateBody(mobileRegisterDoctorSchema), mobileAuthController.registerDoctor);
router.post('/login', authLimiter, validateBody(mobileLoginSchema), mobileAuthController.login);
router.post('/refresh', validateBody(mobileRefreshTokenSchema), mobileAuthController.refreshToken);
router.post('/logout', validateBody(mobileLogoutSchema), mobileAuthController.logout);
// Forgot password - Web ile aynı mantık, aynı mail gönderilir
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), mobileAuthController.forgotPassword);
// Reset password - Requirement 10.1
router.post('/reset-password', authLimiter, validateBody(mobileResetPasswordSchema), mobileAuthController.resetPassword);

// Protected routes (require authentication)
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireDoctor } = require('../../middleware/roleGuard');
router.get('/me', authMiddleware, requireDoctor, mobileAuthController.getMe);
router.post('/change-password', authMiddleware, requireDoctor, validateBody(mobileChangePasswordSchema), mobileAuthController.changePassword);
// Logout all - Requirement 11.1
router.post('/logout-all', authMiddleware, requireDoctor, mobileAuthController.logoutAll);
// Mark onboarding as completed - Onboarding flow
router.post('/mark-onboarding-completed', authMiddleware, requireDoctor, mobileAuthController.markOnboardingCompleted);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

