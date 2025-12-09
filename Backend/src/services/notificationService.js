/**
 * @file notificationService.js
 * @description Bildirim servisi - Tüm kullanıcılar (doktor, hastane, admin) için bildirim yönetimi.
 * Bu servis, iş ilanı başvuruları ve durum değişiklikleri için ortak bildirim sistemi sağlar.
 * 
 * Ana İşlevler:
 * - Bildirim alma ve listeleme (tüm kullanıcılar için)
 * - Bildirim durumu yönetimi (okundu/okunmadı)
 * - Bildirim gönderme (sadece admin)
 * - Role-based bildirim gönderme (doktor/hastane için otomatik)
 * - Bildirim istatistikleri ve raporlama
 * - Filtreleme ve sayfalama
 * 
 * Servis Ayrımı Mantığı:
 * - Bu servis TÜM kullanıcılar için ortak bildirim işlemleri yapar
 * - Doktorlar: Bildirimleri alır (başvuru durumu, ilan güncellemeleri)
 * - Hastaneler: Bildirimleri alır (yeni başvuru, başvuru geri çekme)
 * - Adminler: Bildirimleri hem alır hem gönderir (sistem duyuruları)
 * 
 * Bildirim Türleri:
 * - application_status_update: Başvuru durumu değişikliği
 * - new_application: Yeni başvuru bildirimi
 * - job_status_update: İlan durumu değişikliği
 * - system_announcement: Sistem duyurusu
 * - application_withdrawal: Başvuru geri çekme
 * 
 * Veritabanı Tabloları:
 * - notifications: Bildirim bilgileri
 * - users: Kullanıcı bilgileri (foreign key)
 * - applications: Başvuru bilgileri
 * - jobs: İş ilanı bilgileri
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../config/dbConfig').db;
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { PAGINATION } = require('../config/appConstants');
const sseManager = require('../utils/sseManager');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * @typedef {object} Notification
 * @property {number} id - Bildirim benzersiz kimliği
 * @property {number} user_id - Hedef kullanıcı kimliği
 * @property {string} type - Bildirim türü (info, warning, success, error)
 * @property {string} title - Bildirim başlığı
 * @property {string} body - Bildirim içeriği
 * @property {string} [data_json] - JSON formatında ek veriler
 * @property {string} [channel] - Bildirim kanalı (inapp, email, push)
 * @property {Date} [read_at] - Okunma tarihi (null = okunmamış)
 * @property {Date} created_at - Oluşturulma tarihi
 * @property {object} [data] - Parse edilmiş JSON verisi (sanal alan)
 */

/**
 * @typedef {object} NotificationFilters
 * @property {boolean} [isRead] - Okunma durumu filtresi
 * @property {string} [type] - Bildirim türü filtresi
 * @property {number} [page=1] - Sayfa numarası
 * @property {number} [limit=PAGINATION.DEFAULT_LIMIT] - Sayfa başına kayıt sayısı
 */

/**
 * @typedef {object} NotificationStats
 * @property {number} total - Toplam bildirim sayısı
 * @property {number} unread - Okunmamış bildirim sayısı
 * @property {Array<{type: string, count: number}>} by_type - Tür bazında sayılar
 */

/**
 * Kullanıcının okunmamış bildirimlerini getirir
 * @description Kullanıcının okunmamış bildirimlerini limit ile getirir
 * @param {number} userId - Kullanıcının ID'si
 * @param {number} [limit=10] - Getirilecek bildirim sayısı
 * @returns {Promise<Array>} Okunmamış bildirimler listesi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const unreadNotifications = await getUnreadNotifications(123, 5);
 * console.log(`${unreadNotifications.length} okunmamış bildirim var`);
 */
const getUnreadNotifications = async (userId, limit = 10) => {
  const notifications = await db('notifications')
    .where({ user_id: userId })
    .whereNull('read_at')
    .whereNull('deleted_at')
    .select('id', 'title', 'body', 'created_at', 'type', 'data_json')
    .orderBy('created_at', 'desc')
    .limit(limit);

  // data_json alanlarını parse et
  return notifications.map(notification => {
    if (notification.data_json) {
      try {
        notification.data = JSON.parse(notification.data_json);
      } catch (error) {
        logger.warn('Notification data_json parse error:', error);
        notification.data = null;
      }
    }
    return notification;
  });
};

// ============================================================================
// BİLDİRİM GETİRME FONKSİYONLARI
// ============================================================================

/**
 * Kullanıcının bildirimlerini getirir (filtreleme ve sayfalama ile)
 * @description Kullanıcının tüm bildirimlerini filtreleme seçenekleri ile birlikte getirir
 * @param {number} userId - Kullanıcının ID'si
 * @param {NotificationFilters} [options] - Filtreleme ve sayfalama seçenekleri
 * @returns {Promise<Object>} Bildirimler ve sayfalama bilgisi
 * @returns {Promise<Object.data>} Bildirim dizisi
 * @returns {Promise<Object.pagination>} Sayfalama bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const result = await getNotificationsByUser(123, { 
 *   isRead: false, 
 *   type: 'info', 
 *   page: 1, 
 *   limit: 10 
 * });
 * console.log(`${result.data.length} bildirim bulundu`);
 */
const getNotificationsByUser = async (userId, options = {}) => {
  const { isRead, type, page = 1, limit = PAGINATION.DEFAULT_LIMIT } = options;
  
  let query = db('notifications')
    .where('user_id', userId)
    .whereNull('deleted_at')
    .orderBy('created_at', 'desc');

  if (isRead !== undefined) {
    if (isRead) {
      query = query.whereNotNull('read_at');
    } else {
      query = query.whereNull('read_at');
    }
  }

  if (type) {
    query = query.where('type', type);
  }

  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('notifications')
    .where('user_id', userId)
    .whereNull('deleted_at');
  
  if (isRead !== undefined) {
    if (isRead) {
      countQuery.whereNotNull('read_at');
    } else {
      countQuery.whereNull('read_at');
    }
  }
  
  if (type) countQuery.where('type', type);
  
  const [{ count }] = await countQuery.count('* as count');
  const notifications = await query.limit(limit).offset(offset);
  
  // data_json alanlarını parse et
  const processedNotifications = notifications.map(notification => {
    if (notification.data_json) {
      try {
        notification.data = JSON.parse(notification.data_json);
      } catch (error) {
        logger.warn('Notification data_json parse error:', error);
        notification.data = null;
      }
    }
    return notification;
  });
  
  return {
    data: processedNotifications,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: parseInt(count),
      total_pages: Math.ceil(count / limit)
    }
  };
};

/**
 * Okunmamış bildirim sayısını getirir
 * @description Kullanıcının okunmamış bildirim sayısını döndürür
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<number>} Okunmamış bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const unreadCount = await getUnreadCount(123);
 * console.log(`${unreadCount} okunmamış bildirim var`);
 */
const getUnreadCount = async (userId) => {
  const [{ count }] = await db('notifications')
    .where('user_id', userId)
    .whereNull('read_at')
    .whereNull('deleted_at')
    .count('* as count');
  
  return parseInt(count);
};

/**
 * Tek bir bildirimi getirir
 * @description Belirtilen ID'ye sahip bildirimi getirir ve JSON verisini parse eder
 * @param {number} id - Bildirim ID'si
 * @returns {Promise<Notification|null>} Bildirim bilgileri veya null
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const notification = await getNotificationById(456);
 * if (notification) {
 *   console.log(`Bildirim: ${notification.title}`);
 * }
 */
const getNotificationById = async (id) => {
  const notification = await db('notifications')
    .where('id', id)
    .whereNull('deleted_at')
    .first();
  
  if (!notification) return null;
  
  // data_json'u parse et
  if (notification.data_json) {
    try {
      notification.data = JSON.parse(notification.data_json);
    } catch (error) {
      logger.warn('Notification data_json parse error:', error);
      notification.data = null;
    }
  }
  
  return notification;
};

// ============================================================================
// BİLDİRİM DURUMU YÖNETİMİ
// ============================================================================

/**
 * Bildirimi okundu olarak işaretler
 * @description Belirtilen bildirimi kullanıcı için okundu olarak işaretler
 * @param {number} notificationId - Bildirim ID'si
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<Notification|null>} Güncellenmiş bildirim veya null
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const updatedNotification = await markAsRead(456, 123);
 * if (updatedNotification) {
 *   console.log('Bildirim okundu olarak işaretlendi');
 * }
 */
const markAsRead = async (notificationId, userId) => {
  const updated = await db('notifications')
    .where('id', notificationId)
    .where('user_id', userId)
    .whereNull('deleted_at')
    .update({
      read_at: db.fn.now()
    });
  
  if (updated === 0) return null;
  
  return await getNotificationById(notificationId);
};

/**
 * Birden fazla bildirimi okundu olarak işaretler
 * @description Belirtilen ID'lerdeki bildirimleri toplu olarak okundu işaretler
 * @param {Array<number>} notificationIds - Bildirim ID'leri dizisi
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<Object>} Güncellenen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const result = await markMultipleAsRead([456, 789, 101], 123);
 * console.log(`${result.count} bildirim okundu olarak işaretlendi`);
 */
const markMultipleAsRead = async (notificationIds, userId) => {
  if (!notificationIds || notificationIds.length === 0) {
    return { count: 0 };
  }

  const updated = await db('notifications')
    .whereIn('id', notificationIds)
    .where('user_id', userId)
    .whereNull('deleted_at')
    .update({
      read_at: db.fn.now()
    });
  
  return { count: updated };
};

/**
 * Tüm bildirimleri okundu olarak işaretler
 * @description Kullanıcının tüm okunmamış bildirimlerini okundu olarak işaretler
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<Object>} Güncellenen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const result = await markAllAsRead(123);
 * console.log(`${result.count} bildirim okundu olarak işaretlendi`);
 */
const markAllAsRead = async (userId) => {
  const updated = await db('notifications')
    .where('user_id', userId)
    .whereNull('read_at')
    .whereNull('deleted_at')
    .update({
      read_at: db.fn.now()
    });
  
  return { count: updated };
};

// ============================================================================
// BİLDİRİM SİLME İŞLEMLERİ
// ============================================================================

/**
 * Bildirimi siler
 * @description Kullanıcının belirtilen bildirimini siler
 * @param {number} notificationId - Bildirim ID'si
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const deleted = await deleteNotification(456, 123);
 * if (deleted) {
 *   console.log('Bildirim başarıyla silindi');
 * }
 */
const deleteNotification = async (notificationId, userId) => {
  const updated = await db('notifications')
    .where('id', notificationId)
    .where('user_id', userId)
    .whereNull('deleted_at')
    .update({
      deleted_at: db.raw('GETDATE()')
    });
  
  return updated > 0;
};

/**
 * Okunmuş bildirimleri temizler
 * @description Kullanıcının tüm okunmuş bildirimlerini siler
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<Object>} Silinen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const result = await clearReadNotifications(123);
 * console.log(`${result.count} okunmuş bildirim temizlendi`);
 */
const clearReadNotifications = async (userId) => {
  const updated = await db('notifications')
    .where('user_id', userId)
    .whereNotNull('read_at')
    .whereNull('deleted_at')
    .update({
      deleted_at: db.raw('GETDATE()')
    });
  
  return { count: updated };
};

// ============================================================================
// BİLDİRİM GÖNDERME İŞLEMLERİ
// ============================================================================

/**
 * Yeni bildirim gönderir
 * @description Belirtilen kullanıcıya yeni bildirim gönderir
 * @param {Object} notificationData - Bildirim verileri
 * @param {number} notificationData.user_id - Hedef kullanıcı ID'si
 * @param {string} notificationData.type - Bildirim türü (info, warning, success, error)
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.body - Bildirim içeriği
 * @param {Object} [notificationData.data] - Ek JSON verisi
 * @param {string} [notificationData.channel='inapp'] - Bildirim kanalı
 * @returns {Promise<Notification>} Oluşturulan bildirim bilgileri
 * @throws {AppError} Kullanıcı bulunamazsa veya veritabanı hatası durumunda
 * 
 * @example
 * const notification = await sendNotification({
 *   user_id: 123,
 *   type: 'success',
 *   title: 'Başvurunuz Onaylandı',
 *   body: 'İş başvurunuz başarıyla onaylandı.',
 *   data: { application_id: 456 }
 * });
 */
const sendNotification = async (notificationData) => {
  const { user_id, type, title, body, data, channel = 'inapp' } = notificationData;
  
  // Kullanıcının varlığını kontrol et
  const user = await db('users').where('id', user_id).first();
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı', 404);
  }
  
  // SQL Server için INSERT sonrası ID'yi almak için raw query kullan
  const result = await db.raw(
    `INSERT INTO notifications (user_id, type, title, body, data_json, channel, read_at, created_at)
     OUTPUT inserted.id, inserted.*
     VALUES (?, ?, ?, ?, ?, ?, NULL, GETDATE())`,
    [
      user_id,
      type || 'info',
      title,
      body,
      data ? JSON.stringify(data) : null,
      channel
    ]
  );
  
  // SQL Server'dan dönen sonucu al (result üç boyutlu array dönüyor)
  const records = result[0];
  const notification = Array.isArray(records) ? records[0] : records;
  
  // data_json'u parse et
  if (notification && notification.data_json) {
    try {
      notification.data = JSON.parse(notification.data_json);
    } catch (error) {
      logger.warn('Notification data_json parse error:', error);
      notification.data = null;
    }
  }
  
  // SSE ile real-time bildirim gönder
  try {
    const normalizedNotification = {
      id: notification.id,
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read_at: notification.read_at,
      created_at: notification.created_at,
      isRead: notification.read_at !== null && notification.read_at !== undefined,
      createdAt: notification.created_at,
      message: notification.body
    };
    
    logger.info(`[Notification Service] SSE bildirim gönderiliyor - User ID: ${user_id}, Title: ${notification.title}`);
    const sent = sseManager.sendToUser(user_id, normalizedNotification);
    
    if (sent) {
      logger.info(`[Notification Service] ✅ SSE bildirim gönderildi - User ID: ${user_id}`);
    } else {
      logger.warn(`[Notification Service] ⚠️ SSE bildirim gönderilemedi - User ID: ${user_id} bağlı değil`);
    }
  } catch (sseError) {
    // SSE hatası bildirim gönderimini engellemez
    logger.error('[Notification Service] ❌ SSE bildirim gönderme hatası:', sseError);
  }
  
  return notification;
};

/**
 * Toplu bildirim gönderir (admin için)
 * @description Birden fazla kullanıcıya aynı bildirimi gönderir
 * @param {Array<number>} userIds - Hedef kullanıcı ID'leri dizisi
 * @param {Object} notificationData - Bildirim verileri
 * @param {string} notificationData.type - Bildirim türü
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.body - Bildirim içeriği
 * @param {Object} [notificationData.data] - Ek JSON verisi
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const result = await sendBulkNotification([123, 456, 789], {
 *   type: 'info',
 *   title: 'Sistem Bakımı',
 *   body: 'Sistem bakımı nedeniyle hizmet kesintisi olacaktır.'
 * });
 * console.log(`${result.sent_count} kullanıcıya bildirim gönderildi`);
 */
const sendBulkNotification = async (userIds, notificationData) => {
  if (!userIds || userIds.length === 0) {
    return { sent_count: 0 };
  }

  const { type, title, body, data, channel = 'inapp' } = notificationData;
  
  // SQL Server için bulk insert yap
  const dataJson = data ? JSON.stringify(data) : null;
  const notificationType = type || 'info';
  
  // Her bir userId için notification insert et
  for (const userId of userIds) {
    await db.raw(
      `INSERT INTO notifications (user_id, type, title, body, data_json, channel, read_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, GETDATE())`,
      [userId, notificationType, title, body, dataJson, channel]
    );
  }
  
  return { sent_count: userIds.length };
};

/**
 * Sistem genelinde bildirim gönderir
 * @description Belirtilen role sahip tüm kullanıcılara bildirim gönderir
 * @param {Object} notificationData - Bildirim verileri
 * @param {string} notificationData.type - Bildirim türü
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.body - Bildirim içeriği
 * @param {string} [notificationData.targetRole] - Hedef rol (doctor, hospital, admin, all)
 * @param {Object} [notificationData.data] - Ek JSON verisi
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const result = await sendSystemNotification({
 *   type: 'info',
 *   title: 'Sistem Güncellemesi',
 *   body: 'Sistem güncellemesi yapılmıştır.',
 *   targetRole: 'doctor'
 * });
 */
const sendSystemNotification = async (notificationData) => {
  const { type, title, body, targetRole, data, channel = 'inapp' } = notificationData;

  let query = db('users').select('id').where({ is_approved: true, is_active: true });

  if (targetRole && targetRole !== 'all') {
    query.where('role', targetRole);
  }

  const users = await query;
  const userIds = users.map(u => u.id);

  if (userIds.length === 0) return { sent_count: 0 };

  return await sendBulkNotification(userIds, { type, title, body, data, channel });
};

// ============================================================================
// DOKTOR VE HASTANE BİLDİRİMLERİ
// ============================================================================

/**
 * Doktor için başvuru durumu bildirimi gönderir
 * @description Doktorun başvurusu onaylandığında, reddedildiğinde veya durumu değiştiğinde bildirim gönderir
 * @param {number} doctorUserId - Doktorun user ID'si
 * @param {string} status - Başvuru durumu (accepted, rejected, pending)
 * @param {Object} applicationData - Başvuru bilgileri
 * @param {number} applicationData.application_id - Başvuru ID'si
 * @param {string} applicationData.job_title - İş ilanı başlığı
 * @param {string} applicationData.hospital_name - Hastane adı
 * @returns {Promise<Object>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendDoctorNotification(123, 'accepted', {
 *   application_id: 456,
 *   job_title: 'Kardiyoloji Uzmanı',
 *   hospital_name: 'Ankara Hastanesi'
 * });
 */
const sendDoctorNotification = async (doctorUserId, status, applicationData) => {
  let notificationTitle = '';
  let notificationBody = '';
  let notificationType = 'info';

  switch (status) {
    case 'accepted':
    case 3: // Status ID 3 = Kabul Edildi
      notificationTitle = 'Başvurunuz Onaylandı';
      notificationBody = `${applicationData.hospital_name} hastanesindeki ${applicationData.job_title} pozisyonu için başvurunuz onaylandı.${applicationData.notes ? ` Not: ${applicationData.notes}` : ''}`;
      notificationType = 'success';
      break;
    case 'rejected':
    case 4: // Status ID 4 = Reddedildi
      notificationTitle = 'Başvurunuz Reddedildi';
      notificationBody = `${applicationData.hospital_name} hastanesindeki ${applicationData.job_title} pozisyonu için başvurunuz reddedildi.${applicationData.notes ? ` Not: ${applicationData.notes}` : ''}`;
      notificationType = 'error';
      break;
    case 'pending':
    case 1: // Status ID 1 = Beklemede
    case 2: // Status ID 2 = İnceleniyor
      notificationTitle = 'Başvuru Durumu Güncellendi';
      notificationBody = `${applicationData.hospital_name} hastanesindeki ${applicationData.job_title} pozisyonu için başvurunuz inceleme aşamasına alındı.${applicationData.notes ? ` Not: ${applicationData.notes}` : ''}`;
      notificationType = 'info';
      break;
    case 'withdrawn':
    case 5: // Status ID 5 = Geri Çekildi
      notificationTitle = 'Başvuru Geri Çekildi';
      notificationBody = `${applicationData.hospital_name} hastanesindeki ${applicationData.job_title} pozisyonu için başvurunuz geri çekildi.`;
      notificationType = 'warning';
      break;
    default:
      notificationTitle = 'Başvuru Durumu Değişti';
      notificationBody = `${applicationData.hospital_name} hastanesindeki ${applicationData.job_title} pozisyonu için başvuru durumunuz güncellendi.${applicationData.notes ? ` Not: ${applicationData.notes}` : ''}`;
      notificationType = 'info';
  }

  return await sendNotification({
    user_id: doctorUserId,
    type: notificationType,
    title: notificationTitle,
    body: notificationBody,
    data: {
      application_id: applicationData.application_id,
      job_title: applicationData.job_title,
      hospital_name: applicationData.hospital_name,
      status: status
    }
  });
};

/**
 * Doktor için iş ilanı durumu bildirimi gönderir
 * @description Doktorun başvurduğu iş ilanının durumu değiştiğinde bildirim gönderir
 * @param {number} doctorUserId - Doktorun user ID'si
 * @param {string} jobStatus - İş ilanı durumu (closed, archived, active)
 * @param {Object} jobData - İş ilanı bilgileri
 * @param {number} jobData.job_id - İş ilanı ID'si
 * @param {string} jobData.job_title - İş ilanı başlığı
 * @param {string} jobData.hospital_name - Hastane adı
 * @returns {Promise<Object>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendDoctorJobStatusNotification(123, 'Pasif', {
 *   job_id: 789,
 *   job_title: 'Kardiyoloji Uzmanı',
 *   hospital_name: 'Ankara Hastanesi'
 * });
 */
const sendDoctorJobStatusNotification = async (doctorUserId, jobStatus, jobData) => {
  let notificationTitle = '';
  let notificationBody = '';
  let notificationType = 'info';

  switch (jobStatus) {
    case 'Pasif':
      notificationTitle = 'İlan Kapatıldı';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan kapatıldı.`;
      notificationType = 'warning';
      break;
    case 'archived':
      notificationTitle = 'İlan Arşivlendi';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan arşivlendi.`;
      notificationType = 'warning';
      break;
    case 'Onaylandı':
      notificationTitle = 'İlan Aktifleştirildi';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan tekrar aktifleştirildi.`;
      notificationType = 'info';
      break;
    case 'Onay Bekliyor':
      notificationTitle = 'İlan Onay Bekliyor';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan onay bekliyor.`;
      notificationType = 'info';
      break;
    case 'Revizyon Gerekli':
      notificationTitle = 'İlan Revizyon Gerekiyor';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan revizyon gerekiyor.`;
      notificationType = 'warning';
      break;
    case 'Reddedildi':
      notificationTitle = 'İlan Reddedildi';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan reddedildi.`;
      notificationType = 'error';
      break;
    default:
      notificationTitle = 'İlan Durumu Değişti';
      notificationBody = `${jobData.hospital_name} hastanesindeki ${jobData.job_title} pozisyonu için ilan durumu güncellendi.`;
      notificationType = 'info';
  }

  return await sendNotification({
    user_id: doctorUserId,
    type: notificationType,
    title: notificationTitle,
    body: notificationBody,
    data: {
      job_id: jobData.job_id,
      job_title: jobData.job_title,
      hospital_name: jobData.hospital_name,
      status: jobStatus
    }
  });
};

/**
 * Hastane için yeni başvuru bildirimi gönderir
 * @description Hastaneye yeni bir başvuru geldiğinde bildirim gönderir
 * @param {number} hospitalUserId - Hastanenin user ID'si
 * @param {Object} applicationData - Başvuru bilgileri
 * @param {number} applicationData.application_id - Başvuru ID'si
 * @param {string} applicationData.job_title - İş ilanı başlığı
 * @param {string} applicationData.doctor_name - Doktor adı
 * @returns {Promise<Object>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendHospitalNotification(456, {
 *   application_id: 789,
 *   job_title: 'Kardiyoloji Uzmanı',
 *   doctor_name: 'Dr. Ahmet Yılmaz'
 * });
 */
const sendHospitalNotification = async (hospitalUserId, applicationData) => {
  return await sendNotification({
    user_id: hospitalUserId,
    type: 'info',
    title: 'Yeni Başvuru Aldınız',
    body: `${applicationData.job_title} pozisyonu için ${applicationData.doctor_name} doktorundan yeni bir başvuru aldınız.`,
    data: {
      application_id: applicationData.application_id,
      job_title: applicationData.job_title,
      doctor_name: applicationData.doctor_name
    }
  });
};

/**
 * Hastane için başvuru geri çekme bildirimi gönderir
 * @description Doktor başvurusunu geri çektiğinde hastaneye bildirim gönderir
 * @param {number} hospitalUserId - Hastanenin user ID'si
 * @param {Object} applicationData - Başvuru bilgileri
 * @param {number} applicationData.application_id - Başvuru ID'si
 * @param {string} applicationData.job_title - İş ilanı başlığı
 * @param {string} applicationData.doctor_name - Doktor adı
 * @param {string} [applicationData.reason] - Geri çekme sebebi
 * @returns {Promise<Object>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendHospitalWithdrawalNotification(456, {
 *   application_id: 789,
 *   job_title: 'Kardiyoloji Uzmanı',
 *   doctor_name: 'Dr. Ahmet Yılmaz',
 *   reason: 'Başka bir iş buldum'
 * });
 */
const sendHospitalWithdrawalNotification = async (hospitalUserId, applicationData) => {
  return await sendNotification({
    user_id: hospitalUserId,
    type: 'warning',
    title: 'Başvuru Geri Çekildi',
    body: `${applicationData.doctor_name} doktoru ${applicationData.job_title} pozisyonu için başvurusunu geri çekti.`,
    data: {
      application_id: applicationData.application_id,
      job_title: applicationData.job_title,
      doctor_name: applicationData.doctor_name,
      reason: applicationData.reason || 'Belirtilmedi'
    }
  });
};

/**
 * Admin için bildirim gönderir
 * @description Admin tüm kullanıcılara veya belirli role sahip kullanıcılara bildirim gönderir
 * @param {Object} notificationData - Bildirim verileri
 * @param {string} notificationData.type - Bildirim türü (info, warning, success, error)
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.body - Bildirim içeriği
 * @param {string} [notificationData.targetRole] - Hedef rol (doctor, hospital, all)
 * @param {Object} [notificationData.data] - Ek veriler
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendAdminNotification({
 *   type: 'info',
 *   title: 'Sistem Bakımı',
 *   body: 'Sistem bakımı yapılacaktır.',
 *   targetRole: 'all'
 * });
 */
const sendAdminNotification = async (notificationData) => {
  return await sendSystemNotification(notificationData);
};

/**
 * Admin için toplu bildirim gönderir (user_ids veya role ile)
 * @description Admin belirli kullanıcılara veya role sahip kullanıcılara bildirim gönderir
 * @param {Object} notificationData - Bildirim verileri
 * @param {string} notificationData.type - Bildirim türü (info, warning, success, error)
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.body - Bildirim içeriği
 * @param {Array<number>} [notificationData.user_ids] - Hedef kullanıcı ID'leri
 * @param {string} [notificationData.role] - Hedef rol (doctor, hospital, admin, all)
 * @param {Object} [notificationData.data] - Ek veriler
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendAdminBulkNotification({
 *   type: 'info',
 *   title: 'Sistem Bakımı',
 *   body: 'Sistem bakımı yapılacaktır.',
 *   user_ids: [1, 2, 3]
 * });
 * 
 * await sendAdminBulkNotification({
 *   type: 'info',
 *   title: 'Sistem Bakımı',
 *   body: 'Sistem bakımı yapılacaktır.',
 *   role: 'doctor'
 * });
 */
const sendAdminBulkNotification = async (notificationData) => {
  const { type, title, body, user_ids, role, data, channel = 'inapp' } = notificationData;
  
  let userIds = [];
  
  // Eğer user_ids belirtilmişse, direkt kullan
  if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
    // Kullanıcıların varlığını kontrol et
    const users = await db('users')
      .whereIn('id', user_ids)
      .where({ is_approved: true, is_active: true })
      .select('id');
    
    userIds = users.map(u => u.id);
  } 
  // Eğer role belirtilmişse, o role sahip kullanıcıları bul
  else if (role) {
    let query = db('users')
      .select('id')
      .where({ is_approved: true, is_active: true });
    
    if (role !== 'all') {
      query = query.where('role', role);
    }
    
    const users = await query;
    userIds = users.map(u => u.id);
  }
  
  if (userIds.length === 0) {
    return { sent_count: 0, message: 'Hedef kullanıcı bulunamadı' };
  }
  
  return await sendBulkNotification(userIds, { type, title, body, data, channel });
};

/**
 * Admin'lere sistem olayı bildirimi gönderir
 * @description Yeni kayıt, yeni ilan, yeni fotoğraf talebi gibi sistem olaylarında admin'lere bildirim gönderir
 * @param {Object} notificationData - Bildirim verileri
 * @param {string} notificationData.type - Bildirim türü (info, warning, success, error)
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.body - Bildirim içeriği
 * @param {Object} [notificationData.data] - Ek JSON verisi
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendAdminSystemNotification({
 *   type: 'info',
 *   title: 'Yeni Doktor Kaydı',
 *   body: 'Dr. Ahmet Yılmaz sisteme kayıt oldu.',
 *   data: { user_id: 123, role: 'doctor' }
 * });
 */
const sendAdminSystemNotification = async (notificationData) => {
  try {
    // Tüm aktif ve onaylı admin kullanıcılarını bul
    const adminUsers = await db('users')
      .where({ role: 'admin', is_approved: true, is_active: true })
      .select('id');
    
    if (adminUsers.length === 0) {
      logger.warn('No active admin users found for system notification');
      return { sent_count: 0 };
    }
    
    const adminUserIds = adminUsers.map(u => u.id);
    
    // Tüm admin'lere bildirim gönder
    return await sendBulkNotification(adminUserIds, notificationData);
  } catch (error) {
    logger.error('Admin system notification failed:', error);
    // Bildirim hatası ana işlemi engellemez
    return { sent_count: 0 };
  }
};

/**
 * Kullanıcı durumu değişikliği bildirimi gönderir
 * @description Admin tarafından kullanıcı onay/aktif/pasif durumu değiştiğinde bildirim gönderir
 * @param {number} userId - Kullanıcı ID'si
 * @param {string} action - İşlem türü (approved, approval_removed, activated, deactivated)
 * @param {string} [reason=null] - Durum değişiklik sebebi
 * @returns {Promise<Object>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendUserStatusNotification(123, 'approved');
 * await sendUserStatusNotification(123, 'deactivated', 'Kurallara uyulmadı');
 */
const sendUserStatusNotification = async (userId, action, reason = null) => {
  try {
    // Kullanıcı bilgilerini al
    const user = await db('users').where('id', userId).first();
    if (!user) {
      logger.warn(`User ${userId} not found for status notification`);
      return null;
    }

    // Kullanıcı adını al (role'e göre)
    let userName = '';
    if (user.role === 'doctor') {
      const doctorProfile = await db('doctor_profiles').where('user_id', userId).first();
      if (doctorProfile) {
        userName = `${doctorProfile.first_name || ''} ${doctorProfile.last_name || ''}`.trim();
      }
    } else if (user.role === 'hospital') {
      const hospitalProfile = await db('hospital_profiles').where('user_id', userId).first();
      if (hospitalProfile) {
        userName = hospitalProfile.institution_name || '';
      }
    }

    let notificationTitle = '';
    let notificationBody = '';
    let notificationType = 'info';

    switch (action) {
      case 'approved':
        notificationTitle = 'Hesabınız Onaylandı';
        notificationBody = `Hesabınız admin tarafından onaylandı. Artık platformu kullanmaya başlayabilirsiniz.`;
        notificationType = 'success';
        break;
      case 'approval_removed':
        notificationTitle = 'Hesap Onayı Kaldırıldı';
        notificationBody = `Hesabınızın onayı admin tarafından kaldırıldı.${reason ? ` Sebep: ${reason}` : ''}`;
        notificationType = 'warning';
        break;
      case 'activated':
        notificationTitle = 'Hesabınız Aktifleştirildi';
        notificationBody = `Hesabınız admin tarafından aktifleştirildi. Artık platforma giriş yapabilirsiniz.`;
        notificationType = 'success';
        break;
      case 'deactivated':
        notificationTitle = 'Hesabınız Pasifleştirildi';
        notificationBody = `Hesabınız admin tarafından pasifleştirildi. Platforma giriş yapamazsınız.${reason ? ` Sebep: ${reason}` : ''}`;
        notificationType = 'error';
        break;
      default:
        notificationTitle = 'Hesap Durumu Değişti';
        notificationBody = `Hesap durumunuz değiştirildi.${reason ? ` Sebep: ${reason}` : ''}`;
        notificationType = 'info';
    }

    return await sendNotification({
      user_id: userId,
      type: notificationType,
      title: notificationTitle,
      body: notificationBody,
      data: {
        action: action,
        reason: reason,
        user_role: user.role,
        user_name: userName,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('User status notification failed:', error);
    // Bildirim hatası ana işlemi engellemez
    return null;
  }
};


// ============================================================================
// İSTATİSTİK VE RAPORLAMA
// ============================================================================

/**
 * Bildirim istatistiklerini getirir
 * @description Sistem geneli bildirim istatistiklerini döndürür
 * @returns {Promise<NotificationStats>} Bildirim istatistikleri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const stats = await getNotificationStats();
 * console.log(`Toplam: ${stats.total}, Okunmamış: ${stats.unread}`);
 */
const getNotificationStats = async () => {
  const [total, unread, byType] = await Promise.all([
    db('notifications').whereNull('deleted_at').count('* as count').first(),
    db('notifications').whereNull('read_at').whereNull('deleted_at').count('* as count').first(),
    db('notifications').whereNull('deleted_at').select('type').count('* as count').groupBy('type')
  ]);
  
  return {
    total: parseInt(total.count),
    unread: parseInt(unread.count),
    by_type: byType.map(item => ({
      type: item.type,
      count: parseInt(item.count)
    }))
  };
};

/**
 * Kullanıcı bazında bildirim istatistiklerini getirir
 * @description Belirtilen kullanıcının bildirim istatistiklerini döndürür
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<Object>} Kullanıcı bildirim istatistikleri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const userStats = await getUserNotificationStats(123);
 * console.log(`Kullanıcının ${userStats.total} bildirimi var`);
 */
const getUserNotificationStats = async (userId) => {
  const [total, unread, byType] = await Promise.all([
    db('notifications').where('user_id', userId).whereNull('deleted_at').count('* as count').first(),
    db('notifications').where('user_id', userId).whereNull('read_at').whereNull('deleted_at').count('* as count').first(),
    db('notifications').where('user_id', userId).whereNull('deleted_at').select('type').count('* as count').groupBy('type')
  ]);
  
  return {
    total: parseInt(total.count),
    unread: parseInt(unread.count),
    by_type: byType.map(item => ({
      type: item.type,
      count: parseInt(item.count)
    }))
  };
};

// ============================================================================
// ADMIN FONKSİYONLARI
// ============================================================================

/**
 * Admin için bildirimleri getirir
 * @description Sadece admin kullanıcısına gelen bildirimleri filtreleme ve sayfalama seçenekleriyle getirir
 * @param {Object} [filters] - Filtreleme seçenekleri
 * @param {string} [filters.type] - Bildirim türü filtresi
 * @param {boolean} [filters.is_read] - Okunma durumu filtresi
 * @param {Date} [filters.startDate] - Başlangıç tarihi filtresi
 * @param {Date} [filters.endDate] - Bitiş tarihi filtresi
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=PAGINATION.DEFAULT_LIMIT] - Sayfa başına kayıt sayısı
 * @returns {Promise<Object>} Bildirimler ve sayfalama bilgisi
 * @throws {AppError} Admin kullanıcısı bulunamazsa veya veritabanı hatası durumunda
 * 
 * @example
 * const result = await getAllNotificationsForAdmin({
 *   type: 'warning',
 *   is_read: false,
 *   page: 1,
 *   limit: 20
 * });
 */
const getAllNotificationsForAdmin = async (filters = {}) => {
  const { type, is_read, page = 1, limit = PAGINATION.DEFAULT_LIMIT, startDate, endDate } = filters;

  // Admin kullanıcısını bul (role = 'admin' olan kullanıcı)
  const adminUser = await db('users').where('role', 'admin').first();
  if (!adminUser) {
    throw new AppError('Admin kullanıcısı bulunamadı', 404);
  }

  let query = db('notifications')
    .join('users', 'notifications.user_id', 'users.id')
    .select(
      'notifications.*',
      'users.email as user_email',
      'users.role as user_role'
    )
    .where('notifications.user_id', adminUser.id) // Sadece admin'e gelen bildirimler
    .whereNull('notifications.deleted_at')
    .orderBy('notifications.created_at', 'desc');

  if (type) query.where('notifications.type', type);
  if (is_read !== undefined) {
    if (is_read) {
      query.whereNotNull('notifications.read_at');
    } else {
      query.whereNull('notifications.read_at');
    }
  }
  if (startDate) query.where('notifications.created_at', '>=', startDate);
  if (endDate) query.where('notifications.created_at', '<=', endDate);

  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('notifications')
    .join('users', 'notifications.user_id', 'users.id')
    .where('notifications.user_id', adminUser.id) // Sadece admin'e gelen bildirimler
    .whereNull('notifications.deleted_at');
    
  if (type) countQuery.where('notifications.type', type);
  if (is_read !== undefined) {
    if (is_read) {
      countQuery.whereNotNull('notifications.read_at');
    } else {
      countQuery.whereNull('notifications.read_at');
    }
  }
  if (startDate) countQuery.where('notifications.created_at', '>=', startDate);
  if (endDate) countQuery.where('notifications.created_at', '<=', endDate);

  const [{ count }] = await countQuery.count('* as count');
  const notifications = await query.limit(limit).offset(offset);

  // data_json alanlarını parse et ve is_read field'ını ekle
  const processedNotifications = notifications.map(notification => {
    if (notification.data_json) {
      try {
        notification.data = JSON.parse(notification.data_json);
      } catch (error) {
        logger.warn('Notification data_json parse error:', error);
        notification.data = null;
      }
    }
    
    // is_read field'ını ekle (read_at null değilse true)
    notification.is_read = notification.read_at !== null;
    
    return notification;
  });

  return {
    data: processedNotifications,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: parseInt(count),
      total_pages: Math.ceil(count / limit)
    }
  };
};

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================


// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * NotificationService modülü
 * Tüm bildirim işlemleri için gerekli fonksiyonları export eder
 */
module.exports = {
  // Bildirim getirme fonksiyonları
  getNotificationsByUser,
  getUnreadCount,
  getUnreadNotifications,
  getNotificationById,
  
  // Bildirim durumu yönetimi
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  
  // Bildirim silme işlemleri
  deleteNotification,
  clearReadNotifications,
  
  // Bildirim gönderme işlemleri
  sendNotification,
  sendBulkNotification,
  sendSystemNotification,
  
  // Role-based bildirim gönderme
  sendDoctorNotification,
  sendHospitalNotification,
  sendAdminNotification,
  sendAdminBulkNotification,
  sendAdminSystemNotification,
  sendUserStatusNotification,
  
  // İstatistik ve raporlama
  getNotificationStats,
  getUserNotificationStats,
  
  // Admin fonksiyonları
  getAllNotificationsForAdmin
};