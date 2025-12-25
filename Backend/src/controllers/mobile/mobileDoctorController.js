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

const getProfileCompletion = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getProfileCompletion(req.user.id);
  return sendSuccess(res, 'Profil tamamlanma bilgileri', data);
});

const updatePersonalInfo = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.updatePersonalInfo(req.user.id, req.body);
  return sendSuccess(res, 'Profil güncellendi', data);
});

// ============================================================================
// EDUCATION CRUD ENDPOINTS
// ============================================================================

const addEducation = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.addEducation(req.user.id, req.body);
  return sendSuccess(res, 'Eğitim bilgisi eklendi', data, 201);
});

const getEducations = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getEducations(req.user.id);
  return sendSuccess(res, 'Eğitim bilgileri', data);
});

const updateEducation = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.updateEducation(req.user.id, parseInt(req.params.id), req.body);
  return sendSuccess(res, 'Eğitim bilgisi güncellendi', data);
});

const deleteEducation = catchAsync(async (req, res) => {
  await mobileDoctorService.deleteEducation(req.user.id, parseInt(req.params.id));
  return sendSuccess(res, 'Eğitim bilgisi silindi', null);
});

// ============================================================================
// EXPERIENCE CRUD ENDPOINTS
// ============================================================================

const addExperience = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.addExperience(req.user.id, req.body);
  return sendSuccess(res, 'Deneyim bilgisi eklendi', data, 201);
});

const getExperiences = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getExperiences(req.user.id);
  return sendSuccess(res, 'Deneyim bilgileri', data);
});

const updateExperience = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.updateExperience(req.user.id, parseInt(req.params.id), req.body);
  return sendSuccess(res, 'Deneyim bilgisi güncellendi', data);
});

const deleteExperience = catchAsync(async (req, res) => {
  await mobileDoctorService.deleteExperience(req.user.id, parseInt(req.params.id));
  return sendSuccess(res, 'Deneyim bilgisi silindi', null);
});

// ============================================================================
// CERTIFICATE CRUD ENDPOINTS
// ============================================================================

const addCertificate = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.addCertificate(req.user.id, req.body);
  return sendSuccess(res, 'Sertifika bilgisi eklendi', data, 201);
});

const getCertificates = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getCertificates(req.user.id);
  return sendSuccess(res, 'Sertifika bilgileri', data);
});

const updateCertificate = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.updateCertificate(req.user.id, parseInt(req.params.id), req.body);
  return sendSuccess(res, 'Sertifika bilgisi güncellendi', data);
});

const deleteCertificate = catchAsync(async (req, res) => {
  await mobileDoctorService.deleteCertificate(req.user.id, parseInt(req.params.id));
  return sendSuccess(res, 'Sertifika bilgisi silindi', null);
});

// ============================================================================
// LANGUAGE CRUD ENDPOINTS
// ============================================================================

const addLanguage = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.addLanguage(req.user.id, req.body);
  return sendSuccess(res, 'Dil bilgisi eklendi', data, 201);
});

const getLanguages = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getLanguages(req.user.id);
  return sendSuccess(res, 'Dil bilgileri', data);
});

const updateLanguage = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.updateLanguage(req.user.id, parseInt(req.params.id), req.body);
  return sendSuccess(res, 'Dil bilgisi güncellendi', data);
});

const deleteLanguage = catchAsync(async (req, res) => {
  await mobileDoctorService.deleteLanguage(req.user.id, parseInt(req.params.id));
  return sendSuccess(res, 'Dil bilgisi silindi', null);
});

// ============================================================================
// PHOTO REQUEST ENDPOINTS
// ============================================================================

const requestProfilePhotoChange = catchAsync(async (req, res) => {
  const { file_url } = req.body;
  const data = await mobileDoctorService.requestProfilePhotoChange(req.user.id, file_url);
  return sendSuccess(res, 'Fotoğraf değişiklik talebi oluşturuldu', data, 201);
});

const getPhotoRequestStatus = catchAsync(async (req, res) => {
  const data = await mobileDoctorService.getMyPhotoRequestStatus(req.user.id);
  return sendSuccess(res, 'Fotoğraf talep durumu', data);
});

const getPhotoRequestHistory = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  const data = await mobileDoctorService.getMyPhotoRequestHistory(req.user.id, limit);
  return sendSuccess(res, 'Fotoğraf talep geçmişi', data);
});

const cancelPhotoRequest = catchAsync(async (req, res) => {
  const success = await mobileDoctorService.cancelPhotoRequest(req.user.id);
  return sendSuccess(res, success ? 'Fotoğraf talebi iptal edildi' : 'İptal edilecek talep bulunamadı', { success });
});

// ============================================================================
// ACCOUNT MANAGEMENT ENDPOINTS
// ============================================================================

const deactivateAccount = catchAsync(async (req, res) => {
  await mobileDoctorService.deactivateAccount(req.user.id);
  return sendSuccess(res, 'Hesabınız başarıyla kapatıldı', null);
});

/**
 * Profil güncelleme bildirimi gönder
 * @description Doktor profil güncellemesi yapıldığında bildirim gönderir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const sendProfileUpdateNotification = catchAsync(async (req, res) => {
  const { updateType, updateDescription } = req.body;
  const doctorService = require('../../services/doctorService');
  const notification = await doctorService.sendProfileUpdateNotification(
    req.user.id,
    updateType,
    updateDescription
  );
  return sendSuccess(res, 'Profil güncelleme bildirimi gönderildi', { notification });
});

module.exports = {
  getDashboard,
  getProfile,
  getProfileCompletion,
  updatePersonalInfo,
  
  // Education CRUD
  addEducation,
  getEducations,
  updateEducation,
  deleteEducation,
  
  // Experience CRUD
  addExperience,
  getExperiences,
  updateExperience,
  deleteExperience,
  
  // Certificate CRUD
  addCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate,
  
  // Language CRUD
  addLanguage,
  getLanguages,
  updateLanguage,
  deleteLanguage,
  
  // Photo Request
  requestProfilePhotoChange,
  getPhotoRequestStatus,
  getPhotoRequestHistory,
  cancelPhotoRequest,
  
  // Account Management
  deactivateAccount,
  
  // Profile Update Notification
  sendProfileUpdateNotification
};

