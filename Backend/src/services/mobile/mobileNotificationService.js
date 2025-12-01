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

const listNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const offset = (currentPage - 1) * perPage;

  const countQuery = db('notifications')
    .where('user_id', userId)
    .count({ count: '*' })
    .first();

  const notificationsQuery = db('notifications')
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc');

  // SQL Server için OFFSET ... ROWS FETCH NEXT ... ROWS ONLY syntax'ını manuel ekle
  // Knex'in limit() çağrısı yapmadan SQL'i oluştur, sonra manuel OFFSET/FETCH ekle
  const queryBuilder = notificationsQuery.toSQL();
  let sql = queryBuilder.sql;
  
  // Debug: Orijinal SQL'i logla
  logger.error('🔍 [mobileNotificationService] Original SQL:', sql);
  logger.error('🔍 [mobileNotificationService] Bindings:', queryBuilder.bindings);
  
  // SELECT TOP (@p0) veya SELECT TOP(@p0) veya SELECT TOP @p0 formatlarını kaldır
  // SQL Server'da limit() çağrısı yapılmışsa Knex SELECT TOP üretir, bunu kaldırıyoruz
  const beforeReplace = sql;
  // Daha agresif regex: tüm SELECT TOP varyasyonlarını yakala (case-insensitive, whitespace-tolerant)
  sql = sql.replace(/select\s+top\s*\(?\s*@p\d+\s*\)?\s*/gi, 'SELECT ');
  // Eğer hala SELECT TOP varsa, daha basit bir regex dene
  if (sql.includes('top') || sql.includes('TOP')) {
    sql = sql.replace(/SELECT\s+TOP\s*\(?\s*@p\d+\s*\)?\s*/i, 'SELECT ');
    sql = sql.replace(/select\s+top\s*\(?\s*@p\d+\s*\)?\s*/i, 'SELECT ');
  }
  
  if (beforeReplace !== sql) {
    logger.error('🔍 [mobileNotificationService] After TOP removal:', sql);
  } else {
    logger.error('⚠️ [mobileNotificationService] TOP removal failed! Original:', beforeReplace);
  }
  
  // ORDER BY sonrasına OFFSET/FETCH ekle
  // SQL Server için: ORDER BY ... OFFSET @pX ROWS FETCH NEXT @pY ROWS ONLY
  // select * kullanıldığında ORDER BY pattern'i farklı olabilir (prefix olmayabilir)
  let orderByPattern = /(order\s+by\s+\[notifications\]\.\[created_at\]\s+desc,\s+\[notifications\]\.\[id\]\s+desc)\s*$/i;
  if (!orderByPattern.test(sql)) {
    // Prefix olmadan dene (select * kullanıldığında)
    orderByPattern = /(order\s+by\s+\[created_at\]\s+desc,\s+\[id\]\s+desc)\s*$/i;
  }
  if (!orderByPattern.test(sql)) {
    // Daha basit pattern dene (prefix olmadan, bracket olmadan)
    orderByPattern = /(order\s+by\s+created_at\s+desc,\s+id\s+desc)\s*$/i;
  }
  
  if (orderByPattern.test(sql)) {
    // SQL Server'da db.raw() için ? placeholder kullan
    // @p0, @p1 gibi parametreleri ? ile değiştir
    const offsetParamIndex = queryBuilder.bindings.length;
    const limitParamIndex = queryBuilder.bindings.length + 1;
    sql = sql.replace(
      orderByPattern,
      `$1 OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`
    );
    logger.error('🔍 [mobileNotificationService] After OFFSET/FETCH:', sql);
  } else {
    // ORDER BY pattern bulunamazsa, SQL'i logla ve hata fırlat
    logger.error('⚠️ [mobileNotificationService] ORDER BY pattern not found! SQL:', sql);
    throw new Error(`ORDER BY pattern not found in SQL: ${sql}`);
  }
  
  // Bindings'e offset ve perPage ekle
  const bindings = [...queryBuilder.bindings, offset, perPage];
  logger.error('🔍 [mobileNotificationService] Final bindings:', bindings);

  const [countResult, notificationsResult] = await Promise.all([
    countQuery,
    db.raw(sql, bindings)
  ]);
  
  // SQL Server raw query sonucu array döner, ilk elemanı al
  const notifications = notificationsResult.recordset || notificationsResult;
  const total = Number(countResult?.count ?? countResult?.[''] ?? 0) || 0;

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

