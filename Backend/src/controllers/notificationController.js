/**
 * @file notificationController.js
 * @description Bildirim controller'ı - Tüm kullanıcılar (doktor, hastane, admin) için bildirim HTTP isteklerini yönetir.
 * Bu controller, notificationRoutes tarafından kullanılan bildirim endpoint'lerini içerir.
 * 
 * Ana İşlevler:
 * - Bildirim listeleme ve filtreleme (tüm kullanıcılar için)
 * - Bildirim okundu/okunmadı durumu yönetimi
 * - Bildirim silme ve temizleme işlemleri
 * - Admin bildirim gönderme (sadece admin)
 * - Bildirim istatistikleri ve raporlama
 * - Error handling ve logging
 * 
 * Servis Ayrımı Mantığı:
 * - Bu controller TÜM kullanıcılar için ortak bildirim işlemleri yapar
 * - Doktorlar: Bildirimleri alır ve yönetir
 * - Hastaneler: Bildirimleri alır ve yönetir
 * - Adminler: Bildirimleri hem alır hem gönderir
 * 
 * HTTP Endpoint'leri:
 * - GET /api/notifications - Bildirim listesi (tüm kullanıcılar)
 * - GET /api/notifications/unread-count - Okunmamış sayısı (tüm kullanıcılar)
 * - PATCH /api/notifications/mark-all-read - Tümünü okundu işaretle (tüm kullanıcılar)
 * - POST /api/notifications/send - Bildirim gönder (sadece admin)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/response');
const { AppError, catchAsync } = require('../utils/errorHandler');
const logger = require('../utils/logger');

// ============================================================================
// BİLDİRİM LİSTELEME VE GETİRME
// ============================================================================

/**
 * Kullanıcının bildirimlerini listele
 * @description Kullanıcının kendi bildirimlerini filtreleme ve sayfalama seçenekleriyle getirir
 * @param {Object} req - Express request nesnesi
 * @param {Object} req.user - Authenticated user bilgileri
 * @param {number} req.user.id - Kullanıcı kimliği
 * @param {Object} req.query - Query parametreleri (filtreleme için)
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Bildirim listesi ve sayfalama bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * GET /api/notifications?page=1&limit=10&isRead=false
 * Response: { data: [...], pagination: { current_page: 1, per_page: 10, total: 25, total_pages: 3 } }
 */
const getNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.getNotificationsByUser(req.user.id, req.query);
  logger.info(`Notifications retrieved for user ${req.user.id}`);
  return sendSuccess(res, 'Bildirimler başarıyla getirildi', notifications);
});

/**
 * Okunmamış bildirim sayısını getir
 * @description Kullanıcının okunmamış bildirim sayısını döndürür
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Okunmamış bildirim sayısı
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  logger.info(`Unread count retrieved for user ${req.user.id}: ${count}`);
  return sendSuccess(res, 'Okunmamış bildirim sayısı getirildi', { unread_count: count });
});

/**
 * Tek bir bildirimi getir
 * @description Bildirim sahibi veya admin tarafından tek bir bildirimi getirir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Bildirim detayı
 */
const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);
    
    // Bildirim sahibi kontrolü
    if (notification && notification.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Bu bildirimi görüntüleme yetkiniz yok', 403);
    }
    
    return sendSuccess(res, 'Bildirim başarıyla getirildi', notification, 200);
  } catch (error) {
    logger.error('Bildirim getirme hatası:', error);
    next(error);
  }
};

// ============================================================================
// BİLDİRİM DURUMU YÖNETİMİ
// ============================================================================

/**
 * Bildirimi okundu olarak işaretle
 * @description Kullanıcının belirli bir bildirimini okundu olarak işaretler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} İşlem sonucu
 */
const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    
    logger.info(`Kullanıcı ${req.user.id} bildirim ${req.params.id} okundu işaretledi`);
    return sendSuccess(res, 'Bildirim okundu olarak işaretlendi', null, 200);
  } catch (error) {
    logger.error('Bildirim okundu işaretleme hatası:', error);
    next(error);
  }
};

/**
 * Birden fazla bildirimi okundu olarak işaretle
 * @description Kullanıcının belirli bildirimlerini okundu olarak işaretler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} İşlem sonucu
 */
const markMultipleAsRead = async (req, res, next) => {
  try {
    const { notification_ids } = req.body;
    await notificationService.markMultipleAsRead(notification_ids, req.user.id);
    
    logger.info(`Kullanıcı ${req.user.id} ${notification_ids.length} bildirimi okundu işaretledi`);
    return sendSuccess(res, 'Bildirimler okundu olarak işaretlendi', null, 200);
  } catch (error) {
    logger.error('Çoklu bildirim okundu işaretleme hatası:', error);
    next(error);
  }
};

/**
 * Tüm bildirimleri okundu olarak işaretle
 * @description Kullanıcının tüm bildirimlerini okundu olarak işaretler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} İşlem sonucu
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    
    logger.info(`Kullanıcı ${req.user.id} tüm bildirimleri okundu işaretledi`);
    return sendSuccess(res, 'Tüm bildirimler okundu olarak işaretlendi', null, 200);
  } catch (error) {
    logger.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    next(error);
  }
};

// ============================================================================
// BİLDİRİM SİLME VE TEMİZLEME
// ============================================================================

/**
 * Bildirimi sil
 * @description Kullanıcının belirli bir bildirimini siler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} İşlem sonucu
 */
const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    
    logger.info(`Kullanıcı ${req.user.id} bildirim ${req.params.id} sildi`);
    return sendSuccess(res, 'Bildirim başarıyla silindi', null, 200);
  } catch (error) {
    logger.error('Bildirim silme hatası:', error);
    next(error);
  }
};

/**
 * Okunmuş bildirimleri temizle
 * @description Kullanıcının okunmuş bildirimlerini temizler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} İşlem sonucu
 */
const clearReadNotifications = async (req, res, next) => {
  try {
    await notificationService.clearReadNotifications(req.user.id);
    
    logger.info(`Kullanıcı ${req.user.id} okunmuş bildirimleri temizledi`);
    return sendSuccess(res, 'Okunmuş bildirimler temizlendi', null, 200);
  } catch (error) {
    logger.error('Okunmuş bildirim temizleme hatası:', error);
    next(error);
  }
};

// ============================================================================
// ADMIN BİLDİRİM İŞLEMLERİ
// ============================================================================

/**
 * Admin tarafından bildirim gönder
 * @description Admin tarafından belirli kullanıcılara veya rollere bildirim gönderir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Gönderim sonucu
 */
const sendNotification = async (req, res, next) => {
  try {
    const { title, message, type, user_ids, role, data } = req.body;
    
    const result = await notificationService.sendAdminBulkNotification({
      title,
      body: message,
      type,
      user_ids,
      role,
      data
    });

    logger.info(`Admin ${req.user.id} bildirim gönderdi: ${title}`);
    return sendSuccess(res, 'Bildirim başarıyla gönderildi', result, 201);
  } catch (error) {
    logger.error('Bildirim gönderme hatası:', error);
    next(error);
  }
};

/**
 * Admin tarafından tüm bildirimleri listele
 * @description Admin tarafından tüm kullanıcıların bildirimlerini filtreleme ve sayfalama seçenekleriyle getirir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Bildirim listesi
 */
const getAllNotificationsForAdmin = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await notificationService.getAllNotificationsForAdmin(filters);

    logger.info(`Admin ${req.user.id} tüm bildirimleri listeledi`);
    return sendSuccess(res, 'Bildirimler başarıyla getirildi', result.data, 200, result.pagination);
  } catch (error) {
    logger.error('Admin bildirim listesi getirme hatası:', error);
    next(error);
  }
};

/**
 * Admin tarafından bildirim istatistiklerini getir
 * @description Admin tarafından sistem geneli bildirim istatistiklerini getirir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Bildirim istatistikleri
 */
const getNotificationStats = async (req, res, next) => {
  try {
    const stats = await notificationService.getNotificationStats();

    logger.info(`Admin ${req.user.id} bildirim istatistiklerini getirdi`);
    return sendSuccess(res, 'Bildirim istatistikleri başarıyla getirildi', stats, 200);
  } catch (error) {
    logger.error('Bildirim istatistikleri getirme hatası:', error);
    next(error);
  }
};


// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Bildirim listeleme ve getirme
  getNotifications,
  getUnreadCount,
  getNotificationById,
  
  // Bildirim durumu yönetimi
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  
  // Bildirim silme ve temizleme
  deleteNotification,
  clearReadNotifications,
  
  // Admin bildirim işlemleri
  sendNotification,
  getAllNotificationsForAdmin,
  getNotificationStats
};