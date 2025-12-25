/**
 * @file mobileLookupController.js
 * @description Mobile lookup controller - Mobil uygulama için lookup endpoint'lerini yönetir.
 * 
 * Endpoint'ler:
 * - GET /api/mobile/lookup/cities - Şehirler
 * - GET /api/mobile/lookup/specialties - Uzmanlık alanları
 * - GET /api/mobile/lookup/subspecialties/:specialtyId? - Yan dallar
 * - GET /api/mobile/lookup/education-types - Doktor eğitim türleri
 * - GET /api/mobile/lookup/languages - Diller
 * - GET /api/mobile/lookup/language-levels - Dil seviyeleri
 * - GET /api/mobile/lookup/application-statuses - Başvuru durumları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const { sendSuccess } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');
const mobileLookupService = require('../../services/mobile/mobileLookupService');

const getCities = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getCities();
  return sendSuccess(res, 'Şehirler', data);
});

const getSpecialties = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getSpecialties();
  return sendSuccess(res, 'Uzmanlık alanları', data);
});

const getSubspecialties = catchAsync(async (req, res) => {
  const specialtyId = req.params.specialtyId ? parseInt(req.params.specialtyId) : null;
  const data = await mobileLookupService.getSubspecialties(specialtyId);
  return sendSuccess(res, 'Yan dal alanları', data);
});

const getDoctorEducationTypes = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getDoctorEducationTypes();
  return sendSuccess(res, 'Doktor eğitim türleri', data);
});

const getLanguages = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getLanguages();
  return sendSuccess(res, 'Diller', data);
});

const getLanguageLevels = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getLanguageLevels();
  return sendSuccess(res, 'Dil seviyeleri', data);
});

const getApplicationStatuses = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getApplicationStatuses();
  return sendSuccess(res, 'Başvuru durumları', data);
});

const getCertificateTypes = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getCertificateTypes();
  return sendSuccess(res, 'Sertifika türleri', data);
});

const getJobStatuses = catchAsync(async (req, res) => {
  const data = await mobileLookupService.getJobStatuses();
  return sendSuccess(res, 'İş durumları', data);
});

module.exports = {
  getCities,
  getSpecialties,
  getSubspecialties,
  getDoctorEducationTypes,
  getLanguages,
  getLanguageLevels,
  getApplicationStatuses,
  getCertificateTypes,
  getJobStatuses
};
