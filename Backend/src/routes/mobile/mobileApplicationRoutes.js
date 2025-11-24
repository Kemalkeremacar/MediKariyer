/**
 * @file mobileApplicationRoutes.js
 * @description Mobile application route'ları - Mobil uygulama için başvuru endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile application ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - GET /api/mobile/applications - Başvuru listesi (pagination, status filter)
 * - GET /api/mobile/applications/:applicationId - Başvuru detayı
 * - POST /api/mobile/applications - Başvuru oluştur
 * - POST /api/mobile/applications/:applicationId/withdraw - Başvuruyu geri çek
 * 
 * Middleware'ler:
 * - mobileErrorHandler: JSON-only error handling
 * - authMiddleware: JWT token doğrulama
 * - requireDoctor: Doktor rolü kontrolü
 * - validateBody: Request body validasyonu
 * - validateQuery: Query parametreleri validasyonu
 * - validateParams: Path parametreleri validasyonu
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
const { validateBody, validateQuery, validateParams } = require('../../middleware/validationMiddleware');
const {
  mobileCreateApplicationSchema,
  mobileApplicationsQuerySchema,
  mobileApplicationDetailParamsSchema
} = require('../../validators/mobileSchemas');
const mobileApplicationController = require('../../controllers/mobile/mobileApplicationController');

const router = express.Router();

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

router.get('/', validateQuery(mobileApplicationsQuerySchema), mobileApplicationController.listApplications);
router.get('/:applicationId', validateParams(mobileApplicationDetailParamsSchema), mobileApplicationController.getApplicationDetail);
router.post('/', validateBody(mobileCreateApplicationSchema), mobileApplicationController.createApplication);
router.post('/:applicationId/withdraw', validateParams(mobileApplicationDetailParamsSchema), mobileApplicationController.withdrawApplication);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

