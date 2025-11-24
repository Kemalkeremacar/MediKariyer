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
const mobileDoctorController = require('../../controllers/mobile/mobileDoctorController');

const router = express.Router();

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

router.get('/dashboard', mobileDoctorController.getDashboard);
router.get('/profile', mobileDoctorController.getProfile);

router.use(mobileErrorBoundary);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = router;

