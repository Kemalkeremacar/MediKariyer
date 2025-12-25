/**
 * @file mobileLookupRoutes.js
 * @description Mobile lookup route'ları - Mobil uygulama için lookup endpoint'lerini tanımlar.
 * 
 * Ana Endpoint'ler:
 * - GET /api/mobile/lookup/cities - Şehirler
 * - GET /api/mobile/lookup/specialties - Uzmanlık alanları
 * - GET /api/mobile/lookup/subspecialties/:specialtyId? - Yan dallar
 * - GET /api/mobile/lookup/education-types - Doktor eğitim türleri
 * - GET /api/mobile/lookup/languages - Diller
 * - GET /api/mobile/lookup/language-levels - Dil seviyeleri
 * - GET /api/mobile/lookup/application-statuses - Başvuru durumları
 * 
 * Güvenlik:
 * - Auth gerektirmez (public endpoints)
 * - JSON-only responses
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const express = require('express');
const { mobileErrorHandler, mobileErrorBoundary } = require('../../middleware/mobileErrorHandler');
const mobileLookupController = require('../../controllers/mobile/mobileLookupController');

const router = express.Router();

router.use(mobileErrorHandler);

// Public endpoints - Auth gerektirmez
router.get('/cities', mobileLookupController.getCities);
router.get('/specialties', mobileLookupController.getSpecialties);
router.get('/subspecialties/:specialtyId?', mobileLookupController.getSubspecialties);
router.get('/education-types', mobileLookupController.getDoctorEducationTypes);
router.get('/languages', mobileLookupController.getLanguages);
router.get('/language-levels', mobileLookupController.getLanguageLevels);
router.get('/application-statuses', mobileLookupController.getApplicationStatuses);
router.get('/certificate-types', mobileLookupController.getCertificateTypes);
router.get('/job-statuses', mobileLookupController.getJobStatuses);

router.use(mobileErrorBoundary);

module.exports = router;
