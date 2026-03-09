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
 * GET /api/logs/:type/:id
 * Tek bir log kaydının detayını getir
 * 
 * Params:
 * - type: application, audit, security
 * - id: Log ID
 */
router.get(
  '/:type/:id',
  LogController.getLogById
);

/**
 * GET /api/logs/test/connection
 * Log tablolarının varlığını ve bağlantısını test et
 */
router.get(
  '/test/connection',
  async (req, res) => {
    try {
      const { db } = require('../config/dbConfig');
      const logger = require('../utils/logger');
      
      // Her tabloyu test et
      const results = {
        application_logs: { exists: false, count: 0, error: null },
        audit_logs: { exists: false, count: 0, error: null },
        security_logs: { exists: false, count: 0, error: null }
      };
      
      // Application logs test
      try {
        const [appCount] = await db('dbo.application_logs').count('* as count');
        results.application_logs.exists = true;
        results.application_logs.count = parseInt(appCount.count);
      } catch (error) {
        results.application_logs.error = error.message;
      }
      
      // Audit logs test
      try {
        const [auditCount] = await db('dbo.audit_logs').count('* as count');
        results.audit_logs.exists = true;
        results.audit_logs.count = parseInt(auditCount.count);
      } catch (error) {
        results.audit_logs.error = error.message;
      }
      
      // Security logs test
      try {
        const [securityCount] = await db('dbo.security_logs').count('* as count');
        results.security_logs.exists = true;
        results.security_logs.count = parseInt(securityCount.count);
      } catch (error) {
        results.security_logs.error = error.message;
      }
      
      // Test log kaydet
      logger.info('🧪 Test log kaydı - Log sistemi test ediliyor', {
        category: 'test',
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      res.json({
        success: true,
        message: 'Log tabloları test edildi ve test log kaydedildi',
        data: results,
        note: 'Test log kaydı oluşturuldu. 5-10 saniye sonra application_logs tablosunu kontrol edin.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Test başarısız',
        error: error.message
      });
    }
  }
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

