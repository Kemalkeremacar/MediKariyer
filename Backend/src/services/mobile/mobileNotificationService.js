/**
 * @file mobileNotificationService.js
 * @description Mobile notification servisi - Mobil uygulama için bildirim işlemlerini yönetir.
 * Bu servis, mobileNotificationController tarafından kullanılan temel notification işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Bildirim listesi (pagination)
 * - Bildirim okundu işaretleme
 * - Device token kaydı (push notification için)
 * 
 * Veritabanı Tabloları:
 * - notifications: Bildirimler
 * - device_tokens: Cihaz token'ları (push notification için)
 * 
 * Özellikler:
 * - Minimal payload (mobile optimized)
 * - Transformer kullanımı
 * - Pagination support
 * - Device token yönetimi (Expo Push)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../../config/dbConfig').db;
const { AppError } = require('../../utils/errorHandler');
const notificationTransformer = require('../../mobile/transformers/notificationTransformer');
const notificationService = require('../notificationService');

const listNotifications = async (userId, { page = 1, limit = 20, is_read } = {}) => {
  // Map mobile params to web service params
  // Convert snake_case is_read to camelCase isRead for web service
  const webOptions = {
    isRead: is_read,
    page: page,
    limit: limit
  };

  // Call web service (includes deleted_at check)
  const result = await notificationService.getNotificationsByUser(userId, webOptions);

  // Transform response for mobile format
  return {
    data: result.data.map(notificationTransformer.toListItem),
    pagination: {
      current_page: result.pagination.current_page,
      per_page: result.pagination.per_page,
      total: result.pagination.total,
      total_pages: result.pagination.total_pages,
      has_next: result.pagination.current_page < result.pagination.total_pages,
      has_prev: result.pagination.current_page > 1
    }
  };
};

const markAsRead = async (userId, notificationId) => {
  // Call web service (includes deleted_at check)
  // Note: web service takes (notificationId, userId) but mobile signature is (userId, notificationId)
  const result = await notificationService.markAsRead(notificationId, userId);

  // Web service returns null if notification not found or deleted
  if (!result) {
    throw new AppError('Bildirim bulunamadı', 404);
  }

  return { success: true };
};

/**
 * Device token kaydı - Expo Push Notification için cihaz token'ını kaydeder
 * Requirements: 18.1, 18.4, 18.5
 * @param {number} userId - Kullanıcı ID'si
 * @param {string} expoPushToken - Expo Push Token (ExponentPushToken[...] formatında)
 * @param {string} deviceId - Cihaz unique ID'si
 * @param {string} platform - Platform ('ios' veya 'android')
 * @param {string|null} appVersion - Uygulama versiyonu (opsiyonel)
 * @returns {Promise<object>} Kayıt sonucu
 */
const registerDeviceToken = async (userId, expoPushToken, deviceId, platform, appVersion = null) => {
  // Validate Expo Push Token format (Requirement 18.1)
  const expoTokenPattern = /^ExponentPushToken\[.+\]$/;
  if (!expoTokenPattern.test(expoPushToken)) {
    throw new AppError('Geçersiz Expo Push Token formatı', 400);
  }

  // Transaction içinde upsert mantığını güvenli hale getir
  // Aynı cihaz için eşzamanlı token kayıtları çakışmasını önler
  return await db.transaction(async (trx) => {
    // Önce aynı user_id ve device_id ile kayıt var mı kontrol et
    const existing = await trx('device_tokens')
      .where('user_id', userId)
      .where('device_id', deviceId)
      .where('platform', platform)
      .first();

    if (existing) {
      // Mevcut kaydı güncelle (Requirement 18.5)
      await trx('device_tokens')
        .where('id', existing.id)
        .update({
          expo_push_token: expoPushToken,
          app_version: appVersion,
          is_active: true,
          updated_at: new Date()
        });

      return {
        success: true,
        message: 'Device token güncellendi',
        device_token_id: existing.id
      };
    }

    // Aynı token'a sahip başka cihazlar varsa onları deaktif et (aynı cihaz, farklı kullanıcı)
    // Bu işlem transaction içinde yapılarak tutarlılık sağlanır
    await trx('device_tokens')
      .where('expo_push_token', expoPushToken)
      .where('device_id', deviceId)
      .where('user_id', '!=', userId) // Sadece farklı kullanıcıların token'larını deaktif et
      .update({
        is_active: false,
        updated_at: new Date()
      });

    // Yeni kayıt oluştur
    const [newToken] = await trx('device_tokens')
      .insert({
        user_id: userId,
        expo_push_token: expoPushToken,
        device_id: deviceId,
        platform: platform,
        app_version: appVersion,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');

    return {
      success: true,
      message: 'Device token kaydedildi',
      device_token_id: newToken.id
    };
  });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

const getUnreadCount = async (userId) => {
  const result = await db('notifications')
    .where('user_id', userId)
    .whereNull('read_at')
    .whereNull('deleted_at')
    .count({ count: '*' })
    .first();

  return parseInt(result.count) || 0;
};

/**
 * Bildirim sayılarını getir (toplam ve okunmamış)
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<{totalCount: number, unreadCount: number}>} Bildirim sayıları
 */
const getNotificationCounts = async (userId) => {
  // Toplam bildirim sayısı
  const totalResult = await db('notifications')
    .where('user_id', userId)
    .whereNull('deleted_at')
    .count({ count: '*' })
    .first();

  // Okunmamış bildirim sayısı
  const unreadResult = await db('notifications')
    .where('user_id', userId)
    .whereNull('read_at')
    .whereNull('deleted_at')
    .count({ count: '*' })
    .first();

  return {
    totalCount: parseInt(totalResult.count) || 0,
    unreadCount: parseInt(unreadResult.count) || 0,
  };
};

/**
 * Tek bildirimi sil (soft delete)
 * Requirements: 2.1, 2.4
 * @param {number} userId - Kullanıcı ID'si
 * @param {number} notificationId - Bildirim ID'si
 * @returns {Promise<boolean>} Silme başarılı mı
 */
const deleteNotification = async (userId, notificationId) => {
  const updated = await db('notifications')
    .where('id', notificationId)
    .where('user_id', userId)
    .whereNull('deleted_at')  // Don't update already soft-deleted records
    .update({ deleted_at: new Date() });

  if (!updated) {
    throw new AppError('Bildirim bulunamadı', 404);
  }

  return true;
};

/**
 * Çoklu bildirim sil (soft delete with transaction)
 * Requirements: 2.3, 12.3
 * @param {number} userId - Kullanıcı ID'si
 * @param {number[]} ids - Silinecek bildirim ID'leri
 * @returns {Promise<number>} Silinen bildirim sayısı
 */
const deleteNotifications = async (userId, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return 0;
  }

  // Use transaction for atomicity (Requirement 12.3)
  return await db.transaction(async (trx) => {
    const updated = await trx('notifications')
      .whereIn('id', ids)
      .where('user_id', userId)
      .whereNull('deleted_at')  // Don't update already soft-deleted records
      .update({ deleted_at: new Date() });

    return updated;
  });
};

/**
 * Tüm bildirimleri okundu olarak işaretle
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} Güncellenen bildirim sayısı
 */
const markAllAsRead = async (userId) => {
  return await notificationService.markAllAsRead(userId);
};

/**
 * Okunmuş bildirimleri temizle (soft delete with transaction)
 * Requirements: 2.5, 12.3
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} Silinen bildirim sayısı
 */
const clearReadNotifications = async (userId) => {
  // Use transaction for atomicity (Requirement 12.3)
  return await db.transaction(async (trx) => {
    const updated = await trx('notifications')
      .where('user_id', userId)
      .whereNotNull('read_at')  // Only read notifications
      .whereNull('deleted_at')  // Don't update already soft-deleted records
      .update({ deleted_at: new Date() });

    return { success: true, deleted_count: updated };
  });
};

module.exports = {
  listNotifications,
  markAsRead,
  registerDeviceToken,
  getUnreadCount,
  getNotificationCounts,
  deleteNotification,
  deleteNotifications,
  markAllAsRead,
  clearReadNotifications
};

