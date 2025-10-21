/**
 * @file logRoutes.js
 * @description Log yönetimi route tanımları
 * 
 * Bu route sadece admin kullanıcılar tarafından erişilebilir.
 * Logları görüntüleme, istatistik görme ve temizleme işlemleri için endpoint'ler içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

'use strict';

const express = require('express');
const router = express.Router();

// Middleware
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Controller
const LogController = require('../controllers/logController');

// Validation Schemas
const {
  applicationLogsQuerySchema,
  auditLogsQuerySchema,
  securityLogsQuerySchema,
  logStatisticsQuerySchema,
  logCleanupSchema
} = require('../validators/logSchemas');

// ============================================================
// MIDDLEWARE: Tüm log route'ları sadece admin erişebilir
// ============================================================
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin yetkisi gerekli' });
  }
});

// ============================================================
// LOG ROUTES
// ============================================================

/**
 * GET /api/logs/application
 * Application loglarını getir (filtrelenebilir)
 * 
 * Query params:
 * - level: error, warn, info, http, debug
 * - category: auth, api, database, security, business
 * - userId: integer
 * - requestId: string
 * - startDate: ISO date
 * - endDate: ISO date
 * - page: integer (default: 1)
 * - limit: integer (default: 50, max: 100)
 */
router.get(
  '/application',
  validate(applicationLogsQuerySchema, 'query'),
  LogController.getApplicationLogs
);

/**
 * GET /api/logs/audit
 * Audit loglarını getir (kullanıcı aksiyonları)
 * 
 * Query params:
 * - actorId: integer
 * - action: string
 * - resourceType: string
 * - resourceId: integer
 * - startDate: ISO date
 * - endDate: ISO date
 * - page: integer (default: 1)
 * - limit: integer (default: 50, max: 100)
 */
router.get(
  '/audit',
  validate(auditLogsQuerySchema, 'query'),
  LogController.getAuditLogs
);

/**
 * GET /api/logs/security
 * Security loglarını getir (güvenlik olayları)
 * 
 * Query params:
 * - eventType: string
 * - severity: low, medium, high, critical
 * - ipAddress: string
 * - startDate: ISO date
 * - endDate: ISO date
 * - page: integer (default: 1)
 * - limit: integer (default: 50, max: 100)
 */
router.get(
  '/security',
  validate(securityLogsQuerySchema, 'query'),
  LogController.getSecurityLogs
);

/**
 * GET /api/logs/statistics
 * Log istatistiklerini getir
 * 
 * Query params:
 * - startDate: ISO date (default: 7 gün önce)
 * - endDate: ISO date (default: şimdi)
 */
router.get(
  '/statistics',
  validate(logStatisticsQuerySchema, 'query'),
  LogController.getLogStatistics
);

/**
 * POST /api/logs/cleanup
 * Eski logları temizle
 * 
 * Body:
 * - retentionDays: integer (default: 90)
 */
router.post(
  '/cleanup',
  validate(logCleanupSchema),
  LogController.cleanupLogs
);

module.exports = router;

