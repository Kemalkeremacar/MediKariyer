/**
 * @file mobileJobRoutes.js
 * @description Mobile job route'ları - Mobil uygulama için iş ilanı endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile job ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - GET /api/mobile/jobs - İş ilanları listesi (pagination, filters)
 * - GET /api/mobile/jobs/:jobId - İş ilanı detayı
 * 
 * Middleware'ler:
 * - mobileErrorHandler: JSON-only error handling
 * - authMiddleware: JWT token doğrulama
 * - requireDoctor: Doktor rolü kontrolü
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
const { validateQuery, validateParams } = require('../../middleware/validationMiddleware');
const {
  mobileJobsQuerySchema,
  mobileJobDetailParamsSchema
} = require('../../validators/mobileSchemas');
const mobileJobController = require('../../controllers/mobile/mobileJobController');

const router = express.Router();

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

router.get('/', validateQuery(mobileJobsQuerySchema), mobileJobController.listJobs);
router.get('/:jobId', validateParams(mobileJobDetailParamsSchema), mobileJobController.getJobDetail);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

