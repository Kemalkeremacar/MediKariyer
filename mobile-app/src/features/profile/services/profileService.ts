/**
 * Profile Service
 * 
 * This service provides a feature-specific wrapper around the API profile service.
 * It can be used to add feature-specific business logic, data transformations,
 * or caching strategies if needed in the future.
 * 
 * For now, it re-exports the API service methods directly.
 */

import { profileService as apiProfileService } from '@/api/services/profile.service';

export const profileService = {
  // Profile queries
  getProfile: apiProfileService.getProfile,
  getCompleteProfile: apiProfileService.getCompleteProfile,
  getProfileCompletion: apiProfileService.getProfileCompletion,

  // Profile updates
  updatePersonalInfo: apiProfileService.updatePersonalInfo,

  // Education CRUD
  getEducations: apiProfileService.getEducations,
  createEducation: apiProfileService.createEducation,
  updateEducation: apiProfileService.updateEducation,
  deleteEducation: apiProfileService.deleteEducation,

  // Experience CRUD
  getExperiences: apiProfileService.getExperiences,
  createExperience: apiProfileService.createExperience,
  updateExperience: apiProfileService.updateExperience,
  deleteExperience: apiProfileService.deleteExperience,

  // Certificate CRUD
  getCertificates: apiProfileService.getCertificates,
  createCertificate: apiProfileService.createCertificate,
  updateCertificate: apiProfileService.updateCertificate,
  deleteCertificate: apiProfileService.deleteCertificate,

  // Language CRUD
  getLanguages: apiProfileService.getLanguages,
  createLanguage: apiProfileService.createLanguage,
  updateLanguage: apiProfileService.updateLanguage,
  deleteLanguage: apiProfileService.deleteLanguage,

  // Photo management
  uploadPhoto: apiProfileService.uploadPhoto,
  getPhotoRequestStatus: apiProfileService.getPhotoRequestStatus,
  getPhotoRequestHistory: apiProfileService.getPhotoRequestHistory,
  cancelPhotoRequest: apiProfileService.cancelPhotoRequest,
};
