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

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

// Profile endpoints
router.get('/dashboard', mobileDoctorController.getDashboard);
router.get('/profile', mobileDoctorController.getProfile);
router.get('/profile/completion', mobileDoctorController.getProfileCompletion);
router.patch('/profile/personal', validateBody(mobileUpdatePersonalInfoSchema), mobileDoctorController.updatePersonalInfo);

// Education CRUD endpoints
router.post('/education', validateBody(mobileEducationSchema), mobileDoctorController.addEducation);
router.get('/education', mobileDoctorController.getEducations);
router.put('/education/:id', validateParams(mobileEducationParamsSchema), validateBody(mobileEducationSchema), mobileDoctorController.updateEducation);
router.delete('/education/:id', validateParams(mobileEducationParamsSchema), mobileDoctorController.deleteEducation);

// Experience CRUD endpoints
router.post('/experience', validateBody(mobileExperienceSchema), mobileDoctorController.addExperience);
router.get('/experience', mobileDoctorController.getExperiences);
router.put('/experience/:id', validateParams(mobileExperienceParamsSchema), validateBody(mobileExperienceSchema), mobileDoctorController.updateExperience);
router.delete('/experience/:id', validateParams(mobileExperienceParamsSchema), mobileDoctorController.deleteExperience);

// Certificate CRUD endpoints
router.post('/certificate', validateBody(mobileCertificateSchema), mobileDoctorController.addCertificate);
router.get('/certificate', mobileDoctorController.getCertificates);
router.put('/certificate/:id', validateParams(mobileCertificateParamsSchema), validateBody(mobileCertificateSchema), mobileDoctorController.updateCertificate);
router.delete('/certificate/:id', validateParams(mobileCertificateParamsSchema), mobileDoctorController.deleteCertificate);

// Language CRUD endpoints
router.post('/language', validateBody(mobileLanguageSchema), mobileDoctorController.addLanguage);
router.get('/language', mobileDoctorController.getLanguages);
router.put('/language/:id', validateParams(mobileLanguageParamsSchema), validateBody(mobileLanguageSchema), mobileDoctorController.updateLanguage);
router.delete('/language/:id', validateParams(mobileLanguageParamsSchema), mobileDoctorController.deleteLanguage);

// Photo Request endpoints
router.post('/profile/photo', mobileDoctorController.requestProfilePhotoChange);
router.get('/profile/photo/status', mobileDoctorController.getPhotoRequestStatus);
router.get('/profile/photo/history', mobileDoctorController.getPhotoRequestHistory);
router.delete('/profile/photo/request', mobileDoctorController.cancelPhotoRequest);

// Account Management endpoints
router.post('/account/deactivate', mobileDoctorController.deactivateAccount);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

