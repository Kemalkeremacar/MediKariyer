/**
 * @file profileTransformer.js
 * @description Profile transformer - Doktor profil verilerini mobil uygulama için minimal formata dönüştürür.
 * Bu transformer, web API'den gelen detaylı profil verilerini mobile-optimized minimal payload'a çevirir.
 * 
 * Ana Fonksiyonlar:
 * - toMobileProfile: Minimal profil bilgisi (mobile için)
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

const toMobileProfile = (profile = {}) => {
  return {
    id: profile.id,
    user_id: profile.user_id,
    first_name: profile.first_name || null,
    last_name: profile.last_name || null,
    title: profile.title || null,
    specialty_id: profile.specialty_id || null,
    specialty_name: profile.specialty_name || null,
    subspecialty_id: profile.subspecialty_id || null,
    subspecialty_name: profile.subspecialty_name || null,
    dob: profile.dob || null,
    phone: profile.phone || null,
    profile_photo: profile.profile_photo || null,
    birth_place_id: profile.birth_place_id || null,
    birth_place_name: profile.birth_place_name || null,
    residence_city_id: profile.residence_city_id || null,
    residence_city_name: profile.residence_city_name || null,
    completion_percent: profile.completion_percent ?? null,
    created_at: profile.created_at || null,
    updated_at: profile.updated_at || null
  };
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  toMobileProfile
};

