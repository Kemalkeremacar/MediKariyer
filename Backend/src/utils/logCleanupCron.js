/**
 * @file logCleanupCron.js
 * @description Eski logları otomatik temizleyen cron job
 * 
 * Her gün gece 02:00'de çalışır ve 90 günden eski logları siler.
 * Bu sayede veritabanı boyutu kontrol altında tutulur.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

'use strict';

const cron = require('node-cron');
const LogService = require('../services/logService');
const logger = require('./logger');

/**
 * Log temizleme cron job'ı başlat
 * Her gün gece 02:00'de çalışır
 */
const startLogCleanupCron = () => {
  // Cron expression: "0 2 * * *" = Her gün saat 02:00 (Türkiye saati)
  // Dakika Saat Gün Ay Haftanın_Günü
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('🧹 [Log Cleanup Cron] Otomatik log temizleme başlatıldı');
      
      const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 90;
      const result = await LogService.cleanupOldLogs(retentionDays);
      
      logger.info('✅ [Log Cleanup Cron] Log temizleme tamamlandı', {
        retentionDays,
        deletedApp: result.deletedApp,
        deletedAudit: result.deletedAudit,
        deletedSecurity: result.deletedSecurity,
        totalDeleted: result.deletedApp + result.deletedAudit + result.deletedSecurity,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ [Log Cleanup Cron] Log temizleme hatası', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }, {
    scheduled: true,
    timezone: "Europe/Istanbul"  // Türkiye saati
  });
  
  logger.info('[Log Cleanup Cron] Cron job başlatıldı - Her gün saat 02:00 (TR) çalışacak');
};

module.exports = { startLogCleanupCron };
