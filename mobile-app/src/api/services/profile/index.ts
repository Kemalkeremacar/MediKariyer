/**
 * @file index.ts
 * @description Profile Services Index - Modüler profile servisleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Modüler profile servisleri
 * 
 * **Özellikler:**
 * - Tüm profile servislerini re-export eder
 * - Legacy profileService export'u ile geriye dönük uyumluluk sağlar
 */

// ============================================================================
// INDIVIDUAL SERVICE EXPORTS
// ============================================================================

export { profileCoreService } from './profile.core.service';
export { educationService } from './education.service';
export { experienceService } from './experience.service';
export { certificateService } from './certificate.service';
export { languageService } from './language.service';
export { photoService } from './photo.service';

// ============================================================================
// IMPORTS FOR COMBINED SERVICE
// ============================================================================

import { profileCoreService } from './profile.core.service';
import { educationService } from './education.service';
import { experienceService } from './experience.service';
import { certificateService } from './certificate.service';
import { languageService } from './language.service';
import { photoService } from './photo.service';

// ============================================================================
// LEGACY COMBINED SERVICE
// ============================================================================

/**
 * Legacy combined profileService
 * Tüm profile servislerini birleştiren geriye dönük uyumlu export
 * 
 * @deprecated Bireysel servisleri kullanın (educationService, experienceService, vb.)
 * 
 * **Kullanım (Eski):**
 * ```typescript
 * import { profileService } from '@/api/services/profile';
 * const profile = await profileService.getProfile();
 * ```
 * 
 * **Kullanım (Yeni - Önerilen):**
 * ```typescript
 * import { profileCoreService, educationService } from '@/api/services/profile';
 * const profile = await profileCoreService.getProfile();
 * const educations = await educationService.getEducations();
 * ```
 */
export const profileService = {
  // Core profile operations - Temel profil işlemleri
  getProfile: profileCoreService.getProfile,
  getCompleteProfile: profileCoreService.getCompleteProfile,
  getProfileCompletion: profileCoreService.getProfileCompletion,
  updatePersonalInfo: profileCoreService.updatePersonalInfo,

  // Education CRUD - Eğitim CRUD işlemleri
  getEducations: educationService.getEducations,
  createEducation: educationService.createEducation,
  updateEducation: educationService.updateEducation,
  deleteEducation: educationService.deleteEducation,

  // Experience CRUD - Deneyim CRUD işlemleri
  getExperiences: experienceService.getExperiences,
  createExperience: experienceService.createExperience,
  updateExperience: experienceService.updateExperience,
  deleteExperience: experienceService.deleteExperience,

  // Certificate CRUD - Sertifika CRUD işlemleri
  getCertificates: certificateService.getCertificates,
  createCertificate: certificateService.createCertificate,
  updateCertificate: certificateService.updateCertificate,
  deleteCertificate: certificateService.deleteCertificate,

  // Language CRUD - Dil CRUD işlemleri
  getLanguages: languageService.getLanguages,
  createLanguage: languageService.createLanguage,
  updateLanguage: languageService.updateLanguage,
  deleteLanguage: languageService.deleteLanguage,

  // Photo operations - Fotoğraf işlemleri
  uploadPhoto: photoService.uploadPhoto,
  getPhotoRequestStatus: photoService.getPhotoRequestStatus,
  getPhotoRequestHistory: photoService.getPhotoRequestHistory,
  cancelPhotoRequest: photoService.cancelPhotoRequest,
};
