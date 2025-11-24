/**
 * @file mobileDoctorController.js
 * @description Mobile doctor controller - Mobil uygulama için doktor endpoint'lerini yönetir.
 * Bu controller, mobileDoctorRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Dashboard verileri (özet bilgiler)
 * - Doktor profil bilgileri (minimal)
 * 
 * Endpoint'ler:
 * - GET /api/mobile/doctor/dashboard - Dashboard verileri
 * - GET /api/mobile/doctor/profile - Profil bilgileri
 * 
 * Özellikler:
 * - Minimal response payload (mobile optimized)
 * - JSON-only error handling
 * - catchAsync error handling
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const { sendSuccess } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');
const mobileDoctorService = require('../../services/mobile/mobileDoctorService');

const getDashboard = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getDashboard(req.user.id);
  return sendSuccess(res, 'Dashboard verileri', data);
});

const getProfile = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getProfile(req.user.id);
  return sendSuccess(res, 'Profil bilgileri', data);
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  getDashboard,
  getProfile
};

