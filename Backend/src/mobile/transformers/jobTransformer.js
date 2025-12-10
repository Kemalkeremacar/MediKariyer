/**
 * @file jobTransformer.js
 * @description Job transformer - İş ilanı verilerini mobil uygulama için minimal formata dönüştürür.
 * Bu transformer, web API'den gelen detaylı job verilerini mobile-optimized minimal payload'a çevirir.
 * 
 * Ana Fonksiyonlar:
 * - toListItem: Liste görünümü için minimal job bilgisi
 * - toDetail: Detay görünümü için minimal job bilgisi
 * 
 * Özellikler:
 * - Flat JSON structure (nested object yok)
 * - Sadece gerekli alanlar (admin metadata yok)
 * - Alternative column name support (city_name || city)
 * - Salary range formatting
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

const formatSalaryRange = (min, max, currency = 'TRY') => {
  if (!min && !max) {
    return null;
  }

  const format = (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    return Number(value).toLocaleString('tr-TR');
  };

  const minLabel = format(min);
  const maxLabel = format(max);

  if (minLabel && maxLabel) {
    return `${minLabel} - ${maxLabel} ${currency}`;
  }

  return `${minLabel || maxLabel} ${currency}`.trim();
};

const toListItem = (job = {}) => ({
  id: job.id,
  title: job.title,
  city_id: job.city_id || null,
  city_name: job.city_name || job.city || null,
  specialty_id: job.specialty_id || null,
  specialty: job.specialty_name || job.specialty || null,
  salary_range: job.salary_range || formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency),
  work_type: job.work_type || job.employment_type || null,
  created_at: job.created_at,
  updated_at: job.updated_at || null,
  is_applied: Boolean(job.is_applied),
  hospital_id: job.hospital_id || null,
  hospital_name: job.hospital_name || job.institution_name || null
});

const toDetail = (job = {}) => ({
  ...toListItem(job),
  description: job.short_description || job.description || null,
  min_experience_years: job.min_experience_years ?? null,
  subspecialty_id: job.subspecialty_id || null,
  subspecialty_name: job.subspecialty_name || null,
  salary_min: job.salary_min || null,
  salary_max: job.salary_max || null,
  salary_currency: job.salary_currency || 'TRY',
  hospital_address: job.hospital_address || null,
  hospital_city: job.hospital_city || null,
  hospital_phone: job.hospital_phone || null,
  hospital_email: job.hospital_email || null,
  hospital_website: job.hospital_website || null,
  hospital_about: job.hospital_about || null
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  toListItem,
  toDetail
};

