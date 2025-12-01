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
const { buildPaginationSQL, normalizeRawResult, normalizeCountResult } = require('../../utils/queryHelper');

const listNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const countQuery = db('notifications')
    .where('user_id', userId)
    .count({ count: '*' })
    .first();

  // Explicit column selection kullan (select('*') ORDER BY pattern matching'de sorun çıkarabilir)
  // is_read computed field: read_at IS NOT NULL kontrolü yapılacak
  const notificationsQuery = db('notifications')
    .where('user_id', userId)
    .select(
      'id',
      'title',
      'body',
      'type',
      'read_at', // is_read computed field olarak hesaplanacak (read_at IS NOT NULL)
      'created_at',
      'data_json as data' // Database'de data_json field'ı var, data olarak alias veriyoruz
    )
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc');

  // SQL Server için pagination SQL'i oluştur
  const { sql, bindings } = buildPaginationSQL(notificationsQuery, currentPage, perPage);

  const [countResult, notificationsResult] = await Promise.all([
    countQuery,
    db.raw(sql, bindings)
  ]);
  
  // Sonuçları normalize et
  const notifications = normalizeRawResult(notificationsResult);
  const total = normalizeCountResult(countResult);

  return {
    data: notifications.map(notificationTransformer.toListItem),
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

module.exports = {
  listNotifications,
  markAsRead,
  registerDeviceToken
};

