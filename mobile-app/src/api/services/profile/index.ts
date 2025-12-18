/**
 * Profile Services Index
 * ARCH-002: Modüler profile servisleri
 * 
 * Re-exports all profile-related services and maintains backward compatibility
 * with the legacy profileService export.
 */

// Individual service exports
export { profileCoreService } from './profile.core.service';
export { educationService } from './education.service';
export { experienceService } from './experience.service';
export { certificateService } from './certificate.service';
export { languageService } from './language.service';
export { photoService } from './photo.service';

// Import for combined service
import { profileCoreService } from './profile.core.service';
import { educationService } from './education.service';
import { experienceService } from './experience.service';
import { certificateService } from './certificate.service';
import { languageService } from './language.service';
import { photoService } from './photo.service';

/**
 * Legacy combined profileService
 * Backward compatible export that combines all profile services
 * 
 * @deprecated Use individual services (educationService, experienceService, etc.) instead
 */
export const profileService = {
  // Core profile operations
  getProfile: profileCoreService.getProfile,
  getCompleteProfile: profileCoreService.getCompleteProfile,
  getProfileCompletion: profileCoreService.getProfileCompletion,
  updatePersonalInfo: profileCoreService.updatePersonalInfo,

  // Education CRUD
  getEducations: educationService.getEducations,
  createEducation: educationService.createEducation,
  updateEducation: educationService.updateEducation,
  deleteEducation: educationService.deleteEducation,

  // Experience CRUD
  getExperiences: experienceService.getExperiences,
  createExperience: experienceService.createExperience,
  updateExperience: experienceService.updateExperience,
  deleteExperience: experienceService.deleteExperience,

  // Certificate CRUD
  getCertificates: certificateService.getCertificates,
  createCertificate: certificateService.createCertificate,
  updateCertificate: certificateService.updateCertificate,
  deleteCertificate: certificateService.deleteCertificate,

  // Language CRUD
  getLanguages: languageService.getLanguages,
  createLanguage: languageService.createLanguage,
  updateLanguage: languageService.updateLanguage,
  deleteLanguage: languageService.deleteLanguage,

  // Photo operations
  uploadPhoto: photoService.uploadPhoto,
  getPhotoRequestStatus: photoService.getPhotoRequestStatus,
  getPhotoRequestHistory: photoService.getPhotoRequestHistory,
  cancelPhotoRequest: photoService.cancelPhotoRequest,
};
