/**
 * @file expoPushService.js
 * @description Expo Push Notification servisi - Mobil uygulama için Expo Push API entegrasyonu.
 * Bu servis, device_tokens tablosundaki token'ları kullanarak Expo Push API üzerinden bildirim gönderir.
 * 
 * Ana İşlevler:
 * - Tek kullanıcıya bildirim gönderme
 * - Çoklu kullanıcıya bildirim gönderme
 * - Token geçerlilik kontrolü ve hata yönetimi
 * 
 * Expo Push API:
 * - Endpoint: https://exp.host/--/api/v2/push/send
 * - Method: POST
 * - Format: JSON array (birden fazla bildirim için)
 * 
 * Bildirim Formatı:
 * {
 *   "to": "ExponentPushToken[...]",
 *   "title": "Bildirim başlığı",
 *   "body": "Bildirim içeriği",
 *   "data": { ... } // Opsiyonel ek veri
 * }
 * 
 * Veritabanı Tabloları:
 * - device_tokens: Cihaz token'ları (expo_push_token, user_id, is_active)
 * 
 * Özellikler:
 * - Token geçerlilik kontrolü (is_active)
 * - Hata yönetimi (geçersiz token'ları deaktif eder)
 * - Batch bildirim desteği (çoklu kullanıcı)
 * - Platform-specific optimizasyon (iOS/Android)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const https = require('https');
const db = require('../../config/dbConfig').db;
const logger = require('../../utils/logger');

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_TIMEOUT = 10000; // 10 saniye timeout

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * HTTPS POST isteği gönderir (Expo Push API'ye)
 * @param {string} url - İstek URL'si
 * @param {Array} messages - Bildirim mesajları array'i
 * @returns {Promise<Array>} API yanıtı
 */
const sendHttpPost = (url, messages) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(messages);
    const urlObj = new URL(url);

    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json'
      },
      timeout: EXPO_PUSH_TIMEOUT
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (error) {
          logger.error('Expo Push API response parse error:', error);
          reject(new Error('Invalid JSON response from Expo Push API'));
        }
      });
    });

    req.on('error', (error) => {
      logger.error('Expo Push API request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Expo Push API request timeout'));
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Geçersiz token'ları database'den deaktif eder
 * @param {Array<string>} invalidTokens - Geçersiz token listesi
 */
const deactivateInvalidTokens = async (invalidTokens) => {
  if (!invalidTokens?.length) return;

  try {
    await db('device_tokens')
      .whereIn('expo_push_token', invalidTokens)
      .update({ is_active: false, updated_at: new Date() });
    logger.info(`Deactivated ${invalidTokens.length} invalid device tokens`);
  } catch (error) {
    logger.error('Error deactivating invalid tokens:', error);
  }
};

/**
 * Bildirim mesajı oluşturur (platform-specific ayarlarla)
 * @param {string} token - Expo push token
 * @param {string} platform - Platform ('ios' veya 'android')
 * @param {string} title - Bildirim başlığı
 * @param {string} body - Bildirim içeriği
 * @param {object} data - Ek veri
 * @returns {object} Bildirim mesajı
 */
const buildNotificationMessage = (token, platform, title, body, data) => {
  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data: { ...data, timestamp: new Date().toISOString() }
  };

  if (platform === 'ios') {
    message.priority = 'high';
    message.badge = 1;
  } else if (platform === 'android') {
    message.priority = 'high';
    message.channelId = 'medikariyer_notifications';
  }

  return message;
};

/**
 * Expo Push API yanıtını işler ve geçersiz token'ları bulur
 * @param {Array|object} response - Expo Push API yanıtı
 * @param {Array} tokens - Gönderilen token'lar
 * @returns {object} İşlenmiş sonuç { sent, failed, invalidTokens }
 */
const processExpoResponse = (response, tokens) => {
  const results = Array.isArray(response) ? response : [response];
  let sent = 0;
  let failed = 0;
  const invalidTokens = [];

  results.forEach((result, index) => {
    if (result.status === 'ok') {
      sent++;
    } else {
      failed++;
      if (result.details?.error === 'DeviceNotRegistered' || result.details?.error === 'InvalidCredentials') {
        invalidTokens.push(tokens[index].expo_push_token);
      }
    }
  });

  return { sent, failed, invalidTokens };
};

// ============================================================================
// SERVİS FONKSİYONLARI
// ============================================================================

/**
 * Tek bir kullanıcıya push notification gönderir
 * @param {number} userId - Hedef kullanıcı ID'si
 * @param {string} title - Bildirim başlığı
 * @param {string} body - Bildirim içeriği
 * @param {object} [data] - Opsiyonel ek veri (deep linking için)
 * @returns {Promise<object>} Gönderim sonucu
 * 
 * @example
 * await sendPushNotification(123, "Yeni İş İlanı", "Kardiyoloji uzmanı aranıyor", { jobId: 456 });
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const tokens = await db('device_tokens')
      .where('user_id', userId)
      .where('is_active', true)
      .whereNotNull('expo_push_token')
      .select('expo_push_token', 'platform');

    if (!tokens?.length) {
      logger.warn(`No active device tokens found for user ${userId}`);
      return { success: false, message: 'Kullanıcının aktif cihaz token\'ı bulunamadı', sent: 0, failed: 0 };
    }

    const messages = tokens.map(({ expo_push_token, platform }) => 
      buildNotificationMessage(expo_push_token, platform, title, body, { ...data, userId })
    );

    const response = await sendHttpPost(EXPO_PUSH_API_URL, messages);
    const { sent, failed, invalidTokens } = processExpoResponse(response, tokens);

    if (invalidTokens.length > 0) {
      await deactivateInvalidTokens(invalidTokens);
    }

    logger.info(`Push notification sent to user ${userId}: ${sent} sent, ${failed} failed`);

    return {
      success: sent > 0,
      message: `${sent} bildirim gönderildi, ${failed} başarısız`,
      sent,
      failed,
      invalidTokensCount: invalidTokens.length
    };
  } catch (error) {
    logger.error(`Error sending push notification to user ${userId}:`, error);
    return { success: false, message: 'Bildirim gönderilirken hata oluştu', error: error.message, sent: 0, failed: 1 };
  }
};

/**
 * Birden fazla kullanıcıya push notification gönderir
 * @param {Array<number>} userIds - Hedef kullanıcı ID'leri
 * @param {string} title - Bildirim başlığı
 * @param {string} body - Bildirim içeriği
 * @param {object} [data] - Opsiyonel ek veri
 * @returns {Promise<object>} Gönderim sonucu
 * 
 * @example
 * await sendBulkPushNotification([123, 456], "Sistem Bakımı", "30 dakika bakım yapılacak");
 */
const sendBulkPushNotification = async (userIds, title, body, data = {}) => {
  if (!userIds?.length) {
    return { success: false, message: 'Kullanıcı ID listesi boş', sent: 0, failed: 0 };
  }

  try {
    const tokens = await db('device_tokens')
      .whereIn('user_id', userIds)
      .where('is_active', true)
      .whereNotNull('expo_push_token')
      .select('expo_push_token', 'platform', 'user_id');

    if (!tokens?.length) {
      logger.warn(`No active device tokens found for users: ${userIds.join(', ')}`);
      return { success: false, message: 'Aktif cihaz token\'ı bulunamadı', sent: 0, failed: 0 };
    }

    const messages = tokens.map(({ expo_push_token, platform, user_id }) => 
      buildNotificationMessage(expo_push_token, platform, title, body, { ...data, userId: user_id })
    );

    const response = await sendHttpPost(EXPO_PUSH_API_URL, messages);
    const { sent, failed, invalidTokens } = processExpoResponse(response, tokens);

    if (invalidTokens.length > 0) {
      await deactivateInvalidTokens(invalidTokens);
    }

    logger.info(`Bulk push notification sent: ${sent} sent, ${failed} failed to ${userIds.length} users`);

    return {
      success: sent > 0,
      message: `${sent} bildirim gönderildi, ${failed} başarısız`,
      sent,
      failed,
      invalidTokensCount: invalidTokens.length,
      totalUsers: userIds.length
    };
  } catch (error) {
    logger.error(`Error sending bulk push notification:`, error);
    return { success: false, message: 'Toplu bildirim gönderilirken hata oluştu', error: error.message, sent: 0, failed: userIds.length };
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  sendPushNotification,
  sendBulkPushNotification
};

