/**
 * @file mobileDoctorRoutes.js
 * @description Mobile doctor route'ları - Mobil uygulama için doktor endpoint'lerini tanımlar ve middleware'leri yapılandırır.
 * Bu dosya, mobile doctor ile ilgili tüm HTTP endpoint'lerini içerir.
 * 
 * Ana Endpoint'ler:
 * - GET /api/mobile/doctor/dashboard - Dashboard verileri (özet bilgiler)
 * - GET /api/mobile/doctor/profile - Doktor profil bilgileri (minimal)
 * 
 * Middleware'ler:
 * - mobileErrorHandler: JSON-only error handling
 * - authMiddleware: JWT token doğrulama
 * - requireDoctor: Doktor rolü kontrolü
 * - mobileErrorBoundary: Error boundary (tüm hataları JSON döndürür)
 * 
 * Güvenlik Özellikleri:
 * - JWT token authentication (zorunlu)
 * - Role-based access control (sadece doktor)
 * - JSON-only error responses
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const express = require('express');
const Joi = require('joi');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireDoctor } = require('../../middleware/roleGuard');
const { mobileErrorHandler, mobileErrorBoundary } = require('../../middleware/mobileErrorHandler');
const { validateBody, validateParams } = require('../../middleware/validationMiddleware');
const { 
  mobileUpdatePersonalInfoSchema,
  mobileEducationSchema,
  mobileExperienceSchema,
  mobileCertificateSchema,
  mobileLanguageSchema,
  mobileEducationParamsSchema,
  mobileExperienceParamsSchema,
  mobileCertificateParamsSchema,
  mobileLanguageParamsSchema
} = require('../../validators/mobileSchemas');
const mobileDoctorController = require('../../controllers/mobile/mobileDoctorController');

const router = express.Router();

// ============================================================================
// DEPRECATION WARNING MIDDLEWARE (Requirement 9.5)
// ============================================================================

/**
 * Deprecation warning middleware for old endpoints
 * Adds deprecation headers to responses for backward compatibility
 * @param {string} oldPath - Old endpoint path
 * @param {string} newPath - New endpoint path
 * @returns {Function} Express middleware
 */
const deprecationWarning = (oldPath, newPath) => (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Deprecated-Message', `Use ${newPath} instead of ${oldPath}`);
  res.setHeader('X-API-Deprecated-Sunset', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 days from now
  next();
};

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

// Profile endpoints
router.get('/dashboard', mobileDoctorController.getDashboard);
router.get('/profile', mobileDoctorController.getProfile);
router.get('/profile/completion', mobileDoctorController.getProfileCompletion);
router.patch('/profile/personal', validateBody(mobileUpdatePersonalInfoSchema), mobileDoctorController.updatePersonalInfo);

// ============================================================================
// EDUCATION CRUD ENDPOINTS
// ============================================================================

// NEW: Plural endpoints with PATCH (Requirements 8.1, 9.1)
router.post('/educations', validateBody(mobileEducationSchema), mobileDoctorController.addEducation);
router.get('/educations', mobileDoctorController.getEducations);
router.patch('/educations/:id', validateParams(mobileEducationParamsSchema), validateBody(mobileEducationSchema), mobileDoctorController.updateEducation);
router.delete('/educations/:id', validateParams(mobileEducationParamsSchema), mobileDoctorController.deleteEducation);

// OLD: Singular endpoints (DEPRECATED - Requirement 9.5: Backward compatibility for 30 days)
router.post('/education', deprecationWarning('/education', '/educations'), validateBody(mobileEducationSchema), mobileDoctorController.addEducation);
router.get('/education', deprecationWarning('/education', '/educations'), mobileDoctorController.getEducations);
router.put('/education/:id', deprecationWarning('/education/:id', '/educations/:id'), validateParams(mobileEducationParamsSchema), validateBody(mobileEducationSchema), mobileDoctorController.updateEducation);
router.delete('/education/:id', deprecationWarning('/education/:id', '/educations/:id'), validateParams(mobileEducationParamsSchema), mobileDoctorController.deleteEducation);

// ============================================================================
// EXPERIENCE CRUD ENDPOINTS
// ============================================================================

// NEW: Plural endpoints with PATCH (Requirements 8.2, 9.2)
router.post('/experiences', validateBody(mobileExperienceSchema), mobileDoctorController.addExperience);
router.get('/experiences', mobileDoctorController.getExperiences);
router.patch('/experiences/:id', validateParams(mobileExperienceParamsSchema), validateBody(mobileExperienceSchema), mobileDoctorController.updateExperience);
router.delete('/experiences/:id', validateParams(mobileExperienceParamsSchema), mobileDoctorController.deleteExperience);

// OLD: Singular endpoints (DEPRECATED - Requirement 9.5: Backward compatibility for 30 days)
router.post('/experience', deprecationWarning('/experience', '/experiences'), validateBody(mobileExperienceSchema), mobileDoctorController.addExperience);
router.get('/experience', deprecationWarning('/experience', '/experiences'), mobileDoctorController.getExperiences);
router.put('/experience/:id', deprecationWarning('/experience/:id', '/experiences/:id'), validateParams(mobileExperienceParamsSchema), validateBody(mobileExperienceSchema), mobileDoctorController.updateExperience);
router.delete('/experience/:id', deprecationWarning('/experience/:id', '/experiences/:id'), validateParams(mobileExperienceParamsSchema), mobileDoctorController.deleteExperience);

// ============================================================================
// CERTIFICATE CRUD ENDPOINTS
// ============================================================================

// NEW: Plural endpoints with PATCH (Requirements 8.3, 9.3)
router.post('/certificates', validateBody(mobileCertificateSchema), mobileDoctorController.addCertificate);
router.get('/certificates', mobileDoctorController.getCertificates);
router.patch('/certificates/:id', validateParams(mobileCertificateParamsSchema), validateBody(mobileCertificateSchema), mobileDoctorController.updateCertificate);
router.delete('/certificates/:id', validateParams(mobileCertificateParamsSchema), mobileDoctorController.deleteCertificate);

// OLD: Singular endpoints (DEPRECATED - Requirement 9.5: Backward compatibility for 30 days)
router.post('/certificate', deprecationWarning('/certificate', '/certificates'), validateBody(mobileCertificateSchema), mobileDoctorController.addCertificate);
router.get('/certificate', deprecationWarning('/certificate', '/certificates'), mobileDoctorController.getCertificates);
router.put('/certificate/:id', deprecationWarning('/certificate/:id', '/certificates/:id'), validateParams(mobileCertificateParamsSchema), validateBody(mobileCertificateSchema), mobileDoctorController.updateCertificate);
router.delete('/certificate/:id', deprecationWarning('/certificate/:id', '/certificates/:id'), validateParams(mobileCertificateParamsSchema), mobileDoctorController.deleteCertificate);

// ============================================================================
// LANGUAGE CRUD ENDPOINTS
// ============================================================================

// NEW: Plural endpoints with PATCH (Requirements 8.4, 9.4)
router.post('/languages', validateBody(mobileLanguageSchema), mobileDoctorController.addLanguage);
router.get('/languages', mobileDoctorController.getLanguages);
router.patch('/languages/:id', validateParams(mobileLanguageParamsSchema), validateBody(mobileLanguageSchema), mobileDoctorController.updateLanguage);
router.delete('/languages/:id', validateParams(mobileLanguageParamsSchema), mobileDoctorController.deleteLanguage);

// OLD: Singular endpoints (DEPRECATED - Requirement 9.5: Backward compatibility for 30 days)
router.post('/language', deprecationWarning('/language', '/languages'), validateBody(mobileLanguageSchema), mobileDoctorController.addLanguage);
router.get('/language', deprecationWarning('/language', '/languages'), mobileDoctorController.getLanguages);
router.put('/language/:id', deprecationWarning('/language/:id', '/languages/:id'), validateParams(mobileLanguageParamsSchema), validateBody(mobileLanguageSchema), mobileDoctorController.updateLanguage);
router.delete('/language/:id', deprecationWarning('/language/:id', '/languages/:id'), validateParams(mobileLanguageParamsSchema), mobileDoctorController.deleteLanguage);

// Photo Request endpoints
router.post('/profile/photo', mobileDoctorController.requestProfilePhotoChange);
router.get('/profile/photo/status', mobileDoctorController.getPhotoRequestStatus);
router.get('/profile/photo/history', mobileDoctorController.getPhotoRequestHistory);
router.delete('/profile/photo/request', mobileDoctorController.cancelPhotoRequest);

// Account Management endpoints
router.post('/account/deactivate', mobileDoctorController.deactivateAccount);

// Profile Update Notification endpoint
const mobileProfileNotifyUpdateSchema = Joi.object({
  updateType: Joi.string().valid('personal_info', 'education', 'experience', 'certificate', 'language').required().messages({
    'any.only': 'updateType personal_info, education, experience, certificate veya language olmalıdır',
    'any.required': 'updateType zorunludur'
  }),
  updateDescription: Joi.string().min(1).max(500).required().messages({
    'string.min': 'updateDescription en az 1 karakter olmalıdır',
    'string.max': 'updateDescription en fazla 500 karakter olabilir',
    'any.required': 'updateDescription zorunludur'
  })
});
router.post('/profile/notify-update', validateBody(mobileProfileNotifyUpdateSchema), mobileDoctorController.sendProfileUpdateNotification);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

