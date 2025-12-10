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

/**
 * Education transformer - Mobile için minimal education data
 */
const toMobileEducation = (education = {}) => {
  return {
    id: education.id,
    education_type_id: education.education_type_id || null,
    education_type_name: education.education_type_name || null,
    education_type: education.education_type || null,
    education_institution: education.education_institution || null,
    field: education.field || null,
    graduation_year: education.graduation_year || null,
    created_at: education.created_at || null,
    updated_at: education.updated_at || null
  };
};

/**
 * Experience transformer - Mobile için minimal experience data
 */
const toMobileExperience = (experience = {}) => {
  return {
    id: experience.id,
    organization: experience.organization || null,
    role_title: experience.role_title || null,
    specialty_id: experience.specialty_id || null,
    specialty_name: experience.specialty_name || null,
    subspecialty_id: experience.subspecialty_id || null,
    subspecialty_name: experience.subspecialty_name || null,
    start_date: experience.start_date || null,
    end_date: experience.end_date || null,
    is_current: experience.is_current ?? false,
    description: experience.description || null,
    created_at: experience.created_at || null,
    updated_at: experience.updated_at || null
  };
};

/**
 * Certificate transformer - Mobile için minimal certificate data
 */
const toMobileCertificate = (certificate = {}) => {
  return {
    id: certificate.id,
    certificate_name: certificate.certificate_name || null,
    institution: certificate.institution || null,
    certificate_year: certificate.certificate_year || null,
    created_at: certificate.created_at || null,
    updated_at: certificate.updated_at || null
  };
};

/**
 * Language transformer - Mobile için minimal language data
 */
const toMobileLanguage = (language = {}) => {
  return {
    id: language.id,
    language_id: language.language_id || null,
    language: language.language || null,
    level_id: language.level_id || null,
    level: language.level || null,
    created_at: language.created_at || null,
    updated_at: language.updated_at || null
  };
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  toMobileProfile,
  toMobileEducation,
  toMobileExperience,
  toMobileCertificate,
  toMobileLanguage
};

