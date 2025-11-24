/**
 * @file applicationTransformer.js
 * @description Application transformer - Başvuru verilerini mobil uygulama için minimal formata dönüştürür.
 * Bu transformer, web API'den gelen detaylı başvuru verilerini mobile-optimized minimal payload'a çevirir.
 * 
 * Ana Fonksiyonlar:
 * - toListItem: Liste görünümü için minimal başvuru bilgisi
 * - toDetail: Detay görünümü için minimal başvuru bilgisi
 * 
 * Özellikler:
 * - Flat JSON structure
 * - Sadece gerekli alanlar
 * - Alternative column name support
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// TRANSFORMER FONKSİYONLARI
// ============================================================================

const toListItem = (application = {}) => ({
  id: application.id,
  job_id: application.job_id,
  job_title: application.job_title || null,
  hospital_name: application.hospital_name || null,
  status: application.status_label || application.status || null,
  created_at: application.created_at,
  updated_at: application.updated_at || null
});

const toDetail = (application = {}) => ({
  ...toListItem(application),
  cover_letter: application.cover_letter || null,
  notes: application.notes || null,
  timeline: application.timeline || [],
  attachments: application.attachments || []
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  toListItem,
  toDetail
};

