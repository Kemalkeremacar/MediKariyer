/**
 * @file mobileCongressRoutes.js
 * @description Mobile congress route'ları - Mobil uygulama için kongre endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile congress ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - GET /api/mobile/congresses - Kongre listesi (pagination, filters)
 * - GET /api/mobile/congresses/:congressId - Kongre detayı
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
  mobileCongressesQuerySchema,
  mobileCongressDetailParamsSchema
} = require('../../validators/mobileSchemas');
const mobileCongressController = require('../../controllers/mobile/mobileCongressController');

const router = express.Router();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @route   GET /api/mobile/congresses
 * @desc    Kongre listesi getir (pagination, filters)
 * @access  Private (Doctor only)
 */
router.get('/', validateQuery(mobileCongressesQuerySchema), mobileCongressController.listCongresses);

/**
 * @route   GET /api/mobile/congresses/:congressId
 * @desc    Kongre detayı getir
 * @access  Private (Doctor only)
 */
router.get('/:congressId', validateParams(mobileCongressDetailParamsSchema), mobileCongressController.getCongressDetail);

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;
