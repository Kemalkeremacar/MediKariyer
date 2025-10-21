/**
 * @file logController.js
 * @description Log yönetimi için controller katmanı
 * 
 * Bu controller:
 * - Log sorgulama endpoint'lerini yönetir
 * - Sadece admin yetkisi ile erişilebilir
 * - Log istatistiklerini sağlar
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

'use strict';

const LogService = require('../services/logService');
const { sendSuccess, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * LogController - Log endpoint'lerini yönetir
 */
class LogController {
  /**
   * Application loglarını getir
   * GET /api/logs/application
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  static async getApplicationLogs(req, res) {
    try {
      const filters = req.query;
      const result = await LogService.getApplicationLogs(filters);
      
      return sendSuccess(res, 'Application logları getirildi', result, 200);
    } catch (error) {
      logger.error('Application log getirme hatası', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Log getirme işlemi başarısız', 500);
    }
  }

  /**
   * Audit loglarını getir
   * GET /api/logs/audit
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  static async getAuditLogs(req, res) {
    try {
      const filters = req.query;
      const result = await LogService.getAuditLogs(filters);
      
      return sendSuccess(res, 'Audit logları getirildi', result, 200);
    } catch (error) {
      logger.error('Audit log getirme hatası', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Log getirme işlemi başarısız', 500);
    }
  }

  /**
   * Security loglarını getir
   * GET /api/logs/security
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  static async getSecurityLogs(req, res) {
    try {
      const filters = req.query;
      const result = await LogService.getSecurityLogs(filters);
      
      return sendSuccess(res, 'Security logları getirildi', result, 200);
    } catch (error) {
      logger.error('Security log getirme hatası', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Log getirme işlemi başarısız', 500);
    }
  }

  /**
   * Log istatistiklerini getir
   * GET /api/logs/statistics
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  static async getLogStatistics(req, res) {
    try {
      const options = req.query;
      const statistics = await LogService.getLogStatistics(options);
      
      return sendSuccess(res, 'Log istatistikleri getirildi', statistics, 200);
    } catch (error) {
      logger.error('Log istatistik hatası', { error: error.message });
      return errorResponse(res, 'İstatistik getirme işlemi başarısız', 500);
    }
  }

  /**
   * Eski logları temizle
   * POST /api/logs/cleanup
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  static async cleanupLogs(req, res) {
    try {
      const { retentionDays = 90 } = req.body;
      
      await LogService.cleanupOldLogs(retentionDays);
      
      logger.info('Log temizleme başlatıldı', { 
        retentionDays, 
        admin: req.user.id 
      });
      
      return sendSuccess(
        res, 
        'Log temizleme işlemi başlatıldı', 
        { retentionDays }, 
        200
      );
    } catch (error) {
      logger.error('Log temizleme hatası', { error: error.message });
      return errorResponse(res, 'Log temizleme işlemi başarısız', 500);
    }
  }
}

module.exports = LogController;

