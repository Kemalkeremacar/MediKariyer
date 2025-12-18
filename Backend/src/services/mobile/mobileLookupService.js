/**
 * @file mobileLookupService.js
 * @description Mobile lookup servisi - Mobil uygulama için lookup verilerini sağlar.
 * Web lookupService'i wrap ederek mobile-optimized response döner.
 * 
 * Ana İşlevler:
 * - Şehirler (cities)
 * - Uzmanlık alanları (specialties)
 * - Yan dallar (subspecialties)
 * - Doktor eğitim türleri (doctor_education_types)
 * - Diller (languages)
 * - Dil seviyeleri (language_levels)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// WEB SERVICE WRAPPER
// ============================================================================

const lookupService = require('../lookupService');

/**
 * Tüm şehirleri getir (mobile optimized)
 */
const getCities = async () => {
  return await lookupService.getCities();
};

/**
 * Tüm uzmanlık alanlarını getir (mobile optimized)
 */
const getSpecialties = async () => {
  return await lookupService.getSpecialties();
};

/**
 * Yan dal alanlarını getir (mobile optimized)
 * @param {number} specialtyId - Uzmanlık alanı ID'si (opsiyonel)
 */
const getSubspecialties = async (specialtyId = null) => {
  return await lookupService.getSubspecialties(specialtyId);
};

/**
 * Doktor eğitim türlerini getir (mobile optimized)
 */
const getDoctorEducationTypes = async () => {
  return await lookupService.getDoctorEducationTypes();
};

/**
 * Dilleri getir (mobile optimized)
 */
const getLanguages = async () => {
  return await lookupService.getLanguages();
};

/**
 * Dil seviyelerini getir (mobile optimized)
 */
const getLanguageLevels = async () => {
  return await lookupService.getLanguageLevels();
};

/**
 * Başvuru durumlarını getir (mobile optimized)
 */
const getApplicationStatuses = async () => {
  return await lookupService.getApplicationStatuses();
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  getCities,
  getSpecialties,
  getSubspecialties,
  getDoctorEducationTypes,
  getLanguages,
  getLanguageLevels,
  getApplicationStatuses
};
