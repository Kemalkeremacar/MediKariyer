/**
 * @file notificationTransformer.js
 * @description Notification transformer - Bildirim verilerini mobil uygulama için minimal formata dönüştürür.
 * Bu transformer, web API'den gelen detaylı bildirim verilerini mobile-optimized minimal payload'a çevirir.
 * 
 * Ana Fonksiyonlar:
 * - toListItem: Liste görünümü için minimal bildirim bilgisi
 * 
 * Özellikler:
 * - Flat JSON structure
 * - Sadece gerekli alanlar
 * - Boolean type conversion
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// TRANSFORMER FONKSİYONLARI
// ============================================================================

const toListItem = (notification = {}) => ({
  id: notification.id,
  user_id: notification.user_id || null,
  title: notification.title || '',
  body: notification.body || '',
  type: notification.type || 'info',
  // is_read: read_at IS NOT NULL kontrolü (database'de is_read field'ı yok, read_at var)
  is_read: Boolean(notification.read_at),
  read_at: notification.read_at || null,
  created_at: notification.created_at,
  data: notification.data || null
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  toListItem
};

