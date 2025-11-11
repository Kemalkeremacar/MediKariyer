/**
 * @file tokenCleanup.js
 * @description Otomatik token temizleme sistemi
 * Süresi dolmuş refresh token'ları düzenli olarak temizler
 */

'use strict';

const cron = require('node-cron');
const db = require('../config/dbConfig').db;
const logger = require('./logger');

/**
 * Çalışan cron görevlerinin referanslarını tutar.
 * Graceful shutdown sırasında bu referanslar üzerinden stop/destroy çağrıları yapılır.
 * @type {import('node-cron').ScheduledTask[]}
 */
const scheduledTasks = [];

/**
 * Yeni oluşturulan cron görevini kayıt altına alır.
 * @param {import('node-cron').ScheduledTask} task
 */
const registerTask = (task) => {
  scheduledTasks.push(task);
  return task;
};

/**
 * Halihazırda çalışan görevleri durdurur ve listeden temizler.
 * Hatalar yutulmadan loglanır ki kapatma sürecinde sorunlar görülebilsin.
 */
const stopAllRegisteredTasks = () => {
  if (!scheduledTasks.length) {
    return;
  }

  scheduledTasks.forEach((task, index) => {
    try {
      task.stop();
      if (typeof task.destroy === 'function') {
        task.destroy();
      }
    } catch (error) {
      logger.error('Token cleanup task stop error:', { index, error });
    }
  });

  scheduledTasks.length = 0;
};

/**
 * Süresi dolmuş refresh token'ları temizler
 * @returns {Promise<{deleted: number, errors: number}>} Temizleme sonucu
 */
const cleanupExpiredTokens = async () => {
  const startTime = Date.now();
  
  try {
    // Süresi dolmuş token'ları bul ve sil
    const deleted = await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .del();

    const duration = Date.now() - startTime;
    
    logger.info(`Token cleanup completed: ${deleted} expired tokens deleted in ${duration}ms`);
    
    return { deleted, errors: 0 };
  } catch (error) {
    logger.error('Token cleanup error:', error);
    return { deleted: 0, errors: 1 };
  }
};

/**
 * Çok eski token'ları temizler (30 günden eski)
 * @returns {Promise<{deleted: number, errors: number}>} Temizleme sonucu
 */
const cleanupOldTokens = async () => {
  const startTime = Date.now();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const deleted = await db('refresh_tokens')
      .where('created_at', '<', thirtyDaysAgo)
      .del();

    const duration = Date.now() - startTime;
    
    logger.info(`Old token cleanup completed: ${deleted} old tokens deleted in ${duration}ms`);
    
    return { deleted, errors: 0 };
  } catch (error) {
    logger.error('Old token cleanup error:', error);
    return { deleted: 0, errors: 1 };
  }
};

/**
 * Token istatistiklerini alır
 * @returns {Promise<object>} Token istatistikleri
 */
const getTokenStats = async () => {
  try {
    const stats = await db('refresh_tokens')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN expires_at < GETDATE() THEN 1 END) as expired'),
        db.raw('COUNT(CASE WHEN expires_at >= GETDATE() THEN 1 END) as active'),
        db.raw('COUNT(CASE WHEN created_at < DATEADD(DAY, -30, GETDATE()) THEN 1 END) as old')
      )
      .first();

    return stats;
  } catch (error) {
    logger.error('Error getting token stats:', error);
    return { total: 0, expired: 0, active: 0, old: 0 };
  }
};

/**
 * Otomatik temizleme sistemi başlatır
 */
const startTokenCleanupScheduler = () => {
  if (scheduledTasks.length > 0) {
    logger.warn('Token cleanup scheduler already running. Skipping reinitialisation.');
    return;
  }

  // Her gün saat 02:00'da süresi dolmuş token'ları temizle
  registerTask(
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled token cleanup...');
      await cleanupExpiredTokens();
    })
  );

  // Her hafta pazar günü saat 03:00'da eski token'ları temizle
  registerTask(
    cron.schedule('0 3 * * 0', async () => {
      logger.info('Starting scheduled old token cleanup...');
      await cleanupOldTokens();
    })
  );

  // Her saat başı token istatistiklerini logla
  registerTask(
    cron.schedule('0 * * * *', async () => {
      const stats = await getTokenStats();
      logger.info('Token statistics:', stats);
    })
  );

  logger.info('Token cleanup scheduler started');
};

/**
 * Otomatik temizleme sistemini durdurur
 */
const stopTokenCleanupScheduler = () => {
  stopAllRegisteredTasks();
  logger.info('Token cleanup scheduler stopped');
};

module.exports = {
  cleanupExpiredTokens,
  cleanupOldTokens,
  getTokenStats,
  startTokenCleanupScheduler,
  stopTokenCleanupScheduler
};
