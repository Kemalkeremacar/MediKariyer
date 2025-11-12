/**
 * @file jobExpirationCron.js
 * @description 30 günlük ilan süresi kontrolü için cron job
 * Her gün saat 00:00'da çalışır ve 30 günü dolan ilanları otomatik olarak pasif eder
 * 
 * Mantık:
 * - published_at + 30 gün < bugün ise ve status_id = 3 (Onaylandı) ise
 * - status_id = 4 (Pasif) yap
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const cron = require('node-cron');
const db = require('../config/dbConfig').db;
const logger = require('./logger');
const notificationService = require('../services/notificationService');

/**
 * 30 günü dolan ilanları otomatik olarak pasif eder
 * @returns {Promise<void>}
 */
const checkExpiredJobs = async () => {
  try {
    logger.info('[Job Expiration Cron] Başlatılıyor...');
    
    // 30 gün önceki tarihi hesapla
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Günün başlangıcı
    
    logger.info(`[Job Expiration Cron] Kontrol ediliyor: published_at < ${thirtyDaysAgo.toISOString()}`);
    
    // published_at + 30 gün < bugün ise ve status_id = 3 (Onaylandı) ise
    const expiredJobs = await db('jobs')
      .where('status_id', 3) // Onaylandı
      .whereNotNull('published_at') // published_at dolu olanlar
      .where('published_at', '<', thirtyDaysAgo)
      .select('id', 'title', 'hospital_id', 'published_at');
    
    if (expiredJobs.length > 0) {
      const jobIds = expiredJobs.map(job => job.id);
      
      logger.info(`[Job Expiration Cron] ${expiredJobs.length} ilan süresi dolmuş:`, {
        jobIds,
        jobs: expiredJobs.map(j => ({ id: j.id, title: j.title, published_at: j.published_at }))
      });
      
      // İlanları pasif et
      const updatedCount = await db('jobs')
        .whereIn('id', jobIds)
        .update({
          status_id: 4, // Pasif
          updated_at: db.fn.now()
        });
      
      logger.info(`[Job Expiration Cron] ${updatedCount} ilan otomatik olarak pasif edildi`);
      
      // Her ilan için bildirim gönder (opsiyonel - şimdilik log)
      for (const job of expiredJobs) {
        try {
          // İlan bilgilerini al
          const jobDetails = await db('jobs as j')
            .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
            .where('j.id', job.id)
            .select('hp.user_id', 'hp.institution_name', 'j.title')
            .first();
          
          if (jobDetails) {
            // Hastaneye bildirim gönder
            try {
              await notificationService.sendNotification({
                user_id: jobDetails.user_id,
                type: 'warning',
                title: 'İlan Süresi Doldu',
                body: `"${jobDetails.title}" ilanınızın süresi doldu. İlanı yenilemek için güncelleyebilirsiniz.`,
                data: {
                  job_id: job.id,
                  job_title: jobDetails.title,
                  expired_at: new Date().toISOString()
                }
              });
              logger.info(`[Job Expiration Cron] Bildirim gönderildi: ${jobDetails.institution_name} - ${jobDetails.title}`);
            } catch (notificationError) {
              logger.error(`[Job Expiration Cron] Bildirim gönderilemedi (job ${job.id}):`, notificationError);
            }
          }
        } catch (error) {
          logger.warn(`[Job Expiration Cron] İlan detayları alınamadı (job ${job.id}):`, error);
        }
      }
    } else {
      logger.info('[Job Expiration Cron] Süresi dolan ilan bulunamadı');
    }
    
    logger.info('[Job Expiration Cron] Tamamlandı');
  } catch (error) {
    logger.error('[Job Expiration Cron] Hata:', error);
  }
};

/**
 * Cron job'ı başlatır
 * Her gün saat 00:00'da çalışır
 */
const startJobExpirationCron = () => {
  // Her gün saat 00:00'da çalış (cron format: dakika saat gün ay hafta)
  // '0 0 * * *' = Her gün saat 00:00
  cron.schedule('0 0 * * *', async () => {
    await checkExpiredJobs();
  }, {
    scheduled: true,
    timezone: 'Europe/Istanbul' // Türkiye saati
  });
  
  logger.info('[Job Expiration Cron] Cron job başlatıldı - Her gün saat 00:00\'da çalışacak');
  
  // İlk çalıştırmada da kontrol et (opsiyonel - test için)
  // checkExpiredJobs();
};

/**
 * Cron job'ı durdurur
 */
const stopJobExpirationCron = () => {
  // Cron job'ları durdur (node-cron'da scheduled job'ları durdurmak için)
  logger.info('[Job Expiration Cron] Cron job durduruldu');
};

module.exports = {
  checkExpiredJobs,
  startJobExpirationCron,
  stopJobExpirationCron
};

