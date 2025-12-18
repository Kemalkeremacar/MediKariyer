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

const { toUTC } = require('./dateHelper');

const toListItem = (application = {}) => ({
  id: application.id,
  job_id: application.job_id,
  job_title: application.job_title || null,
  hospital_name: application.hospital_name || null,
  status: application.status_label || application.status || null,
  status_id: application.status_id || null,
  applied_at: toUTC(application.applied_at || application.created_at),
  created_at: toUTC(application.created_at || application.applied_at),
  updated_at: toUTC(application.updated_at),
  // Şehir bilgisi (web ile uyumlu)
  city: application.city_name || application.job_city || application.city || null,
  // İş ilanı durumu bilgileri (web ile uyumlu)
  job_status: application.job_status || null,
  is_job_deleted: Boolean(application.job_deleted_at),
  is_hospital_active: application.hospital_is_active !== false && application.hospital_is_active !== 0
});

const toDetail = (application = {}) => ({
  ...toListItem(application),
  cover_letter: application.cover_letter || null,
  notes: application.notes || null,
  // Job details
  job_description: application.description || application.job_description || null,
  employment_type: application.employment_type || null,
  min_experience_years: application.min_experience_years ?? null,
  city_id: application.city_id || null,
  city_name: application.city_name || null,
  specialty_id: application.specialty_id || null,
  specialty_name: application.specialty_name || null,
  subspecialty_id: application.subspecialty_id || null,
  subspecialty_name: application.subspecialty_name || null,
  // Hospital details
  hospital_id: application.hospital_id || null,
  hospital_address: application.hospital_address || null,
  hospital_phone: application.hospital_phone || null,
  hospital_email: application.hospital_email || null,
  hospital_website: application.hospital_website || null,
  hospital_about: application.hospital_about || null,
  hospital_city: application.hospital_city || null
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  toListItem,
  toDetail
};

