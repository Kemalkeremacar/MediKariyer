/**
 * @file logService.js
 * @description Log yönetimi için servis katmanı
 * 
 * Bu servis:
 * - Application, audit ve security loglarını yönetir
 * - Log sorgulama ve filtreleme işlemlerini yapar
 * - Audit trail oluşturur
 * - Log istatistiklerini sağlar
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

'use strict';

const logger = require('../utils/logger');

// Lazy load db to avoid circular dependency
let _db = null;
const getDb = () => {
  if (!_db) {
    const { db } = require('../config/dbConfig');
    _db = db;
  }
  return _db;
};

/**
 * LogService - Log yönetim servisi
 */
class LogService {
  /**
   * Application log kaydet
   * 
   * @param {Object} logData - Log verisi
   * @param {string} logData.level - Log seviyesi (error, warn, info, http, debug)
   * @param {string} logData.category - Log kategorisi (auth, api, database, security, business)
   * @param {string} logData.message - Log mesajı
   * @param {number} [logData.userId] - Kullanıcı ID
   * @param {string} [logData.requestId] - Request correlation ID
   * @param {string} [logData.ipAddress] - IP adresi
   * @param {string} [logData.userAgent] - User agent
   * @param {string} [logData.url] - Request URL
   * @param {string} [logData.method] - HTTP method
   * @param {number} [logData.statusCode] - HTTP status code
   * @param {number} [logData.durationMs] - Request duration
   * @param {Object} [logData.metadata] - Ek metadata
   * @param {string} [logData.stackTrace] - Error stack trace
   * @returns {Promise<Object>} - Oluşturulan log kaydı
   */
  static async createApplicationLog(logData) {
    try {
      const [log] = await getDb()('logs.application_logs')
        .insert({
          level: logData.level,
          category: logData.category,
          message: logData.message,
          user_id: logData.userId || null,
          request_id: logData.requestId || null,
          ip_address: logData.ipAddress || null,
          user_agent: logData.userAgent || null,
          url: logData.url || null,
          method: logData.method || null,
          status_code: logData.statusCode || null,
          duration_ms: logData.durationMs || null,
          metadata: logData.metadata ? JSON.stringify(logData.metadata) : null,
          stack_trace: logData.stackTrace || null
        })
        .returning('*');
      
      return log;
    } catch (error) {
      // Database'e yazamadıysak en azından console'a yaz
      console.error('❌ Application log kayıt hatası:', error.message);
      throw error;
    }
  }

  /**
   * Audit log kaydet (Kullanıcı aksiyonları)
   * 
   * @param {Object} auditData - Audit verisi
   * @param {number} auditData.actorId - İşlemi yapan kullanıcı ID
   * @param {string} auditData.actorRole - İşlemi yapan kullanıcı rolü
   * @param {string} auditData.action - Yapılan aksiyon (örn: 'user.approve', 'job.create')
   * @param {string} [auditData.resourceType] - Etkilenen kaynak tipi (örn: 'user', 'job')
   * @param {number} [auditData.resourceId] - Etkilenen kaynak ID
   * @param {Object} [auditData.oldValues] - Değişiklik öncesi değerler
   * @param {Object} [auditData.newValues] - Değişiklik sonrası değerler
   * @param {string} [auditData.ipAddress] - IP adresi
   * @param {string} [auditData.userAgent] - User agent
   * @param {Object} [auditData.metadata] - Ek metadata
   * @returns {Promise<Object>} - Oluşturulan audit log kaydı
   */
  static async createAuditLog(auditData) {
    try {
      const [log] = await getDb()('logs.audit_logs')
        .insert({
          actor_id: auditData.actorId,
          actor_role: auditData.actorRole,
          actor_name: auditData.actorName || null,
          actor_email: auditData.actorEmail || null,
          action: auditData.action,
          resource_type: auditData.resourceType || null,
          resource_id: auditData.resourceId || null,
          old_values: auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
          new_values: auditData.newValues ? JSON.stringify(auditData.newValues) : null,
          ip_address: auditData.ipAddress || null,
          user_agent: auditData.userAgent || null,
          metadata: auditData.metadata ? JSON.stringify(auditData.metadata) : null
        })
        .returning('*');
      
      logger.debug('Audit log kaydedildi', { action: auditData.action, actor: auditData.actorId });
      return log;
    } catch (error) {
      console.error('❌ Audit log kayıt hatası:', error.message);
      throw error;
    }
  }

  /**
   * Security log kaydet (Güvenlik olayları)
   * 
   * @param {Object} securityData - Security log verisi
   * @param {string} securityData.eventType - Olay tipi (örn: 'login_failed', 'unauthorized_access')
   * @param {string} securityData.severity - Önem derecesi (low, medium, high, critical)
   * @param {string} securityData.message - Log mesajı
   * @param {number} [securityData.userId] - Kullanıcı ID
   * @param {string} [securityData.email] - Email (login denemesi için)
   * @param {string} [securityData.ipAddress] - IP adresi
   * @param {string} [securityData.userAgent] - User agent
   * @param {string} [securityData.url] - Request URL
   * @param {string} [securityData.method] - HTTP method
   * @param {Object} [securityData.metadata] - Ek metadata
   * @returns {Promise<Object>} - Oluşturulan security log kaydı
   */
  static async createSecurityLog(securityData) {
    try {
      const [log] = await getDb()('logs.security_logs')
        .insert({
          event_type: securityData.eventType,
          severity: securityData.severity,
          message: securityData.message,
          user_id: securityData.userId || null,
          email: securityData.email || null,
          ip_address: securityData.ipAddress || null,
          user_agent: securityData.userAgent || null,
          url: securityData.url || null,
          method: securityData.method || null,
          metadata: securityData.metadata ? JSON.stringify(securityData.metadata) : null
        })
        .returning('*');
      
      logger.warn('Security log kaydedildi', { 
        eventType: securityData.eventType, 
        severity: securityData.severity 
      });
      
      return log;
    } catch (error) {
      console.error('❌ Security log kayıt hatası:', error.message);
      throw error;
    }
  }

  /**
   * Application loglarını getir (Filtrelenebilir)
   * 
   * @param {Object} filters - Filtre parametreleri
   * @param {string} [filters.level] - Log seviyesi
   * @param {string} [filters.category] - Log kategorisi
   * @param {number} [filters.userId] - Kullanıcı ID
   * @param {string} [filters.requestId] - Request correlation ID
   * @param {Date} [filters.startDate] - Başlangıç tarihi
   * @param {Date} [filters.endDate] - Bitiş tarihi
   * @param {number} [filters.page=1] - Sayfa numarası
   * @param {number} [filters.limit=50] - Sayfa başına kayıt
   * @returns {Promise<Object>} - { logs, total, page, totalPages }
   */
  static async getApplicationLogs(filters = {}) {
    try {
      const {
        level,
        category,
        userId,
        requestId,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const offset = (page - 1) * limit;

      const db = getDb();
      
      let query = db('logs.application_logs as al')
        .select('al.*')
        .orderBy('al.timestamp', 'desc');

      // Filters
      if (level) query = query.where('al.level', level);
      if (category) query = query.where('al.category', category);
      if (userId) query = query.where('al.user_id', userId);
      if (requestId) query = query.where('al.request_id', requestId);
      if (startDate) query = query.where('al.timestamp', '>=', startDate);
      if (endDate) query = query.where('al.timestamp', '<=', endDate);

      // Count query
      const countQuery = query.clone().clearSelect().clearOrder().count('* as total');
      const [{ total }] = await countQuery;

      // Data query with pagination
      const logs = await query.limit(limit).offset(offset);

      return {
        logs,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Application log sorgulama hatası', { 
        error: error.message, 
        stack: error.stack,
        code: error.code,
        sqlState: error.sqlState 
      });
      throw error;
    }
  }

  /**
   * Audit loglarını getir (Filtrelenebilir)
   * 
   * @param {Object} filters - Filtre parametreleri
   * @param {number} [filters.actorId] - İşlemi yapan kullanıcı ID
   * @param {string} [filters.action] - Aksiyon tipi
   * @param {string} [filters.resourceType] - Kaynak tipi
   * @param {number} [filters.resourceId] - Kaynak ID
   * @param {Date} [filters.startDate] - Başlangıç tarihi
   * @param {Date} [filters.endDate] - Bitiş tarihi
   * @param {number} [filters.page=1] - Sayfa numarası
   * @param {number} [filters.limit=50] - Sayfa başına kayıt
   * @returns {Promise<Object>} - { logs, total, page, totalPages }
   */
  static async getAuditLogs(filters = {}) {
    try {
      const {
        actorId,
        action,
        resourceType,
        resourceId,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const offset = (page - 1) * limit;

      const db = getDb();
      let query = db('logs.audit_logs as al')
        .select('al.*')
        .orderBy('al.timestamp', 'desc');

      // Filters
      if (actorId) query = query.where('al.actor_id', actorId);
      if (action) query = query.where('al.action', 'like', `%${action}%`);
      if (resourceType) query = query.where('al.resource_type', resourceType);
      if (resourceId) query = query.where('al.resource_id', resourceId);
      if (startDate) query = query.where('al.timestamp', '>=', startDate);
      if (endDate) query = query.where('al.timestamp', '<=', endDate);

      // Count query
      const countQuery = query.clone().clearSelect().clearOrder().count('* as total');
      const [{ total }] = await countQuery;

      // Data query with pagination
      const logs = await query.limit(limit).offset(offset);

      return {
        logs,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Audit log sorgulama hatası', { 
        error: error.message, 
        stack: error.stack,
        code: error.code,
        sqlState: error.sqlState 
      });
      throw error;
    }
  }

  /**
   * Security loglarını getir (Filtrelenebilir)
   * 
   * @param {Object} filters - Filtre parametreleri
   * @param {string} [filters.eventType] - Olay tipi
   * @param {string} [filters.severity] - Önem derecesi
   * @param {string} [filters.ipAddress] - IP adresi
   * @param {Date} [filters.startDate] - Başlangıç tarihi
   * @param {Date} [filters.endDate] - Bitiş tarihi
   * @param {number} [filters.page=1] - Sayfa numarası
   * @param {number} [filters.limit=50] - Sayfa başına kayıt
   * @returns {Promise<Object>} - { logs, total, page, totalPages }
   */
  static async getSecurityLogs(filters = {}) {
    try {
      const {
        eventType,
        severity,
        ipAddress,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const offset = (page - 1) * limit;

      const db = getDb();
      let query = db('logs.security_logs as sl')
        .select('sl.*')
        .orderBy('sl.timestamp', 'desc');

      // Filters
      if (eventType) query = query.where('sl.event_type', eventType);
      if (severity) query = query.where('sl.severity', severity);
      if (ipAddress) query = query.where('sl.ip_address', ipAddress);
      if (startDate) query = query.where('sl.timestamp', '>=', startDate);
      if (endDate) query = query.where('sl.timestamp', '<=', endDate);

      // Count query
      const countQuery = query.clone().clearSelect().clearOrder().count('* as total');
      const [{ total }] = await countQuery;

      // Data query with pagination
      const logs = await query.limit(limit).offset(offset);

      return {
        logs,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Security log sorgulama hatası', { 
        error: error.message, 
        stack: error.stack,
        code: error.code,
        sqlState: error.sqlState 
      });
      throw error;
    }
  }

  /**
   * Log istatistiklerini getir
   * 
   * @param {Object} options - Seçenekler
   * @param {Date} [options.startDate] - Başlangıç tarihi (default: 7 gün önce)
   * @param {Date} [options.endDate] - Bitiş tarihi (default: şimdi)
   * @returns {Promise<Object>} - İstatistik verileri
   */
  static async getLogStatistics(options = {}) {
    try {
      const startDate = options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = options.endDate || new Date();

      // Application logs by level
      const appLogsByLevel = await getDb()('logs.application_logs')
        .select('level')
        .count('* as count')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .groupBy('level');

      // Application logs by category
      const appLogsByCategory = await getDb()('logs.application_logs')
        .select('category')
        .count('* as count')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .groupBy('category')
        .orderBy('count', 'desc')
        .limit(10);

      // Security logs by severity
      const securityLogsBySeverity = await getDb()('logs.security_logs')
        .select('severity')
        .count('* as count')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .groupBy('severity');

      // Top audit actions
      const topAuditActions = await getDb()('logs.audit_logs')
        .select('action')
        .count('* as count')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .groupBy('action')
        .orderBy('count', 'desc')
        .limit(10);

      // Total counts
      const [appLogsTotal] = await getDb()('logs.application_logs')
        .count('* as total')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate);

      const [auditLogsTotal] = await getDb()('logs.audit_logs')
        .count('* as total')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate);

      const [securityLogsTotal] = await getDb()('logs.security_logs')
        .count('* as total')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate);

      return {
        period: {
          startDate,
          endDate
        },
        totals: {
          applicationLogs: parseInt(appLogsTotal.total),
          auditLogs: parseInt(auditLogsTotal.total),
          securityLogs: parseInt(securityLogsTotal.total)
        },
        applicationLogs: {
          byLevel: appLogsByLevel,
          byCategory: appLogsByCategory
        },
        securityLogs: {
          bySeverity: securityLogsBySeverity
        },
        auditLogs: {
          topActions: topAuditActions
        }
      };
    } catch (error) {
      logger.error('Log istatistik hatası', { error: error.message });
      throw error;
    }
  }

  /**
   * Kullanıcı bilgilerini al (audit log için)
   * @param {number} userId - Kullanıcı ID
   * @param {string} role - Kullanıcı rolü
   * @returns {Promise<Object>} - { name, email }
   */
  static async getUserInfoForAudit(userId, role) {
    try {
      const db = getDb();
      const [user] = await db('users').select('email').where('id', userId);
      
      if (!user) {
        return { name: null, email: null };
      }
      
      let name = null;
      
      // Role'e göre profile bilgisini al
      if (role === 'doctor') {
        const profile = await db('doctor_profiles')
          .select('first_name', 'last_name')
          .where('user_id', userId)
          .first();
        if (profile) {
          name = `${profile.first_name} ${profile.last_name}`;
        }
      } else if (role === 'hospital') {
        const profile = await db('hospital_profiles')
          .select('institution_name')
          .where('user_id', userId)
          .first();
        if (profile) {
          name = profile.institution_name;
        }
      } else if (role === 'admin') {
        name = 'Admin';
      }
      
      return { name, email: user.email };
    } catch (error) {
      logger.error('Kullanıcı bilgisi alma hatası', { error: error.message });
      return { name: null, email: null };
    }
  }

  /**
   * Tek bir log kaydını getir (detay için)
   * 
   * @param {string} logType - Log tipi ('application', 'audit', 'security')
   * @param {number} logId - Log ID
   * @returns {Promise<Object>} - Log kaydı
   */
  static async getLogById(logType, logId) {
    try {
      const db = getDb();
      let log = null;
      
      switch (logType) {
        case 'application':
          log = await db('logs.application_logs')
            .select('*')
            .where('id', logId)
            .first();
          break;
        case 'audit':
          log = await db('logs.audit_logs')
            .select('*')
            .where('id', logId)
            .first();
          break;
        case 'security':
          log = await db('logs.security_logs')
            .select('*')
            .where('id', logId)
            .first();
          break;
        default:
          throw new Error(`Geçersiz log tipi: ${logType}`);
      }
      
      if (!log) {
        throw new Error('Log kaydı bulunamadı');
      }
      
      return log;
    } catch (error) {
      logger.error('Log detay getirme hatası', { 
        error: error.message, 
        logType, 
        logId 
      });
      throw error;
    }
  }

  /**
   * Eski logları temizle
   * Stored procedure çağrısı yapar
   * 
   * @param {number} [retentionDays=90] - Kaç günden eski loglar silinecek
   * @returns {Promise<void>}
   */
  static async cleanupOldLogs(retentionDays = 90) {
    try {
      await getDb().raw('EXEC logs.sp_cleanup_old_logs @retention_days = ?', [retentionDays]);
      logger.info('Eski loglar temizlendi', { retentionDays });
    } catch (error) {
      logger.error('Log temizleme hatası', { error: error.message });
      throw error;
    }
  }
}

module.exports = LogService;

