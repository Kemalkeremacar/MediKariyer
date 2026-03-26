'use strict';

const express = require('express');
const congressController = require('../controllers/congressController');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');
const {
  createCongressSchema,
  updateCongressSchema,
  listCongressQuerySchema
} = require('../validators/congressSchemas');

const router = express.Router();

// ============================================================================
// PUBLIC/DOCTOR/ADMIN ROUTES - Kongre listesi ve detay
// ============================================================================

/**
 * @route   GET /api/congresses
 * @desc    Kongre listesini getir (filtreleme ve sayfalama ile)
 * @access  Özel (Doctor, Admin)
 */
router.get(
  '/',
  authMiddleware,
  requireRole(['doctor', 'admin']),
  validate(listCongressQuerySchema, 'query'),
  congressController.getCongressList
);

/**
 * @route   GET /api/congresses/upcoming
 * @desc    Yaklaşan kongreler
 * @access  Özel (Doctor, Admin)
 */
router.get(
  '/upcoming',
  authMiddleware,
  requireRole(['doctor', 'admin']),
  congressController.getUpcomingCongresses
);

/**
 * @route   GET /api/congresses/:id
 * @desc    Kongre detayını getir
 * @access  Özel (Doctor, Admin)
 */
router.get(
  '/:id',
  authMiddleware,
  requireRole(['doctor', 'admin']),
  congressController.getCongressById
);

// ============================================================================
// ADMIN ROUTES - Kongre yönetimi
// ============================================================================

/**
 * @route   POST /api/congresses
 * @desc    Yeni kongre oluştur
 * @access  Özel (Admin)
 */
router.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validate(createCongressSchema, 'body'),
  congressController.createCongress
);

/**
 * @route   PUT /api/congresses/:id
 * @desc    Kongre güncelle
 * @access  Özel (Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validate(updateCongressSchema, 'body'),
  congressController.updateCongress
);

/**
 * @route   DELETE /api/congresses/:id
 * @desc    Kongre sil
 * @access  Özel (Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  congressController.deleteCongress
);

module.exports = router;
