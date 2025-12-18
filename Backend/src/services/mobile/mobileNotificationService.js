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
const logger = require('../../utils/logger');
const notificationTransformer = require('../../mobile/transformers/notificationTransformer');
const { normalizeCountResult } = require('../../utils/queryHelper');

const listNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const countQuery = db('notifications')
    .where('user_id', userId)
    .count({ count: '*' })
    .first();

  // Explicit column selection - is_read computed field olarak hesaplanacak
  const notificationsQuery = db('notifications')
    .where('user_id', userId)
    .select(
      'id',
      'user_id',
      'title',
      'body',
      'type',
      'read_at',
      'created_at',
      'data_json'
    )
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc')
    .limit(perPage)
    .offset((currentPage - 1) * perPage);

  const [countResult, notifications] = await Promise.all([
    countQuery,
    notificationsQuery
  ]);
  
  const total = normalizeCountResult(countResult);

  // data_json field'ını parse et ve data olarak ekle
  const processedNotifications = notifications.map(notification => {
    let parsedData = null;
    if (notification.data_json) {
      try {
        parsedData = JSON.parse(notification.data_json);
      } catch (error) {
        logger.warn('Notification data_json parse error:', error);
      }
    }
    return {
      ...notification,
      data: parsedData
    };
  });

  return {
    data: processedNotifications.map(notificationTransformer.toListItem),
    pagination: {
      current_page: currentPage,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage) || 0,
      has_next: currentPage * perPage < total,
      has_prev: currentPage > 1
    }
  };
};

const markAsRead = async (userId, notificationId) => {
  const updated = await db('notifications')
    .where('id', notificationId)
    .where('user_id', userId)
    .update({
      read_at: db.fn.now()
    });

  if (!updated) {
    throw new AppError('Bildirim bulunamadı', 404);
  }

  return { success: true };
};

/**
 * Device token kaydı - Expo Push Notification için cihaz token'ını kaydeder
 * @param {number} userId - Kullanıcı ID'si
 * @param {string} expoPushToken - Expo Push Token (ExponentPushToken[...] formatında)
 * @param {string} deviceId - Cihaz unique ID'si
 * @param {string} platform - Platform ('ios' veya 'android')
 * @param {string|null} appVersion - Uygulama versiyonu (opsiyonel)
 * @returns {Promise<object>} Kayıt sonucu
 */
const registerDeviceToken = async (userId, expoPushToken, deviceId, platform, appVersion = null) => {
  // Önce aynı user_id ve device_id ile kayıt var mı kontrol et
  const existing = await db('device_tokens')
    .where('user_id', userId)
    .where('device_id', deviceId)
    .where('platform', platform)
    .first();

  if (existing) {
    // Mevcut kaydı güncelle
    await db('device_tokens')
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
  await db('device_tokens')
    .where('expo_push_token', expoPushToken)
    .where('device_id', deviceId)
    .where('user_id', '!=', userId) // Sadece farklı kullanıcıların token'larını deaktif et
    .update({
      is_active: false,
      updated_at: new Date()
    });

  // Yeni kayıt oluştur
  const [newToken] = await db('device_tokens')
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
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

const getUnreadCount = async (userId) => {
  const result = await db('notifications')
    .where('user_id', userId)
    .whereNull('read_at')
    .count({ count: '*' })
    .first();

  return parseInt(result.count) || 0;
};

/**
 * Tek bildirimi sil
 * @param {number} userId - Kullanıcı ID'si
 * @param {number} notificationId - Bildirim ID'si
 * @returns {Promise<boolean>} Silme başarılı mı
 */
const deleteNotification = async (userId, notificationId) => {
  const deleted = await db('notifications')
    .where('id', notificationId)
    .where('user_id', userId)
    .del();

  if (!deleted) {
    throw new AppError('Bildirim bulunamadı', 404);
  }

  return true;
};

/**
 * Çoklu bildirim sil
 * @param {number} userId - Kullanıcı ID'si
 * @param {number[]} ids - Silinecek bildirim ID'leri
 * @returns {Promise<number>} Silinen bildirim sayısı
 */
const deleteNotifications = async (userId, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return 0;
  }

  const deleted = await db('notifications')
    .whereIn('id', ids)
    .where('user_id', userId)
    .del();

  return deleted;
};

module.exports = {
  listNotifications,
  markAsRead,
  registerDeviceToken,
  getUnreadCount,
  deleteNotification,
  deleteNotifications
};

