/**
 * @file mobileDoctorService.js
 * @description Mobile doctor servisi - Mobil uygulama için doktor profil ve dashboard işlemlerini yönetir.
 * Bu servis, mobileDoctorController tarafından kullanılan temel doktor işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Dashboard verileri (özet bilgiler, istatistikler)
 * - Doktor profil bilgileri (minimal)
 * 
 * Veritabanı Tabloları:
 * - doctor_profiles: Doktor profil bilgileri
 * - notifications: Bildirimler
 * - applications: Başvurular
 * - jobs: İş ilanları
 * - specialties: Branşlar
 * - subspecialties: Yan dallar
 * - cities: Şehirler
 * 
 * Özellikler:
 * - Minimal payload (mobile optimized)
 * - Transformer kullanımı
 * - Profil tamamlanma yüzdesi hesaplama
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../../config/dbConfig').db;
const { AppError } = require('../../utils/errorHandler');
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const applicationTransformer = require('../../mobile/transformers/applicationTransformer');
const profileTransformer = require('../../mobile/transformers/profileTransformer');

const parseCount = (row) => {
  if (!row) return 0;
  const value = row.count ?? row[''] ?? Object.values(row)[0];
  return Number(value) || 0;
};

const calculateCompletion = (profile) => {
  if (!profile) return 0;

  const fields = [
    profile.first_name,
    profile.last_name,
    profile.title,
    profile.specialty_id,
    profile.phone,
    profile.profile_photo,
    profile.residence_city_id
  ];

  const filled = fields.filter((field) => field !== null && field !== undefined && `${field}`.trim() !== '').length;
  const percentage = Math.round((filled / fields.length) * 100);

  return Number.isNaN(percentage) ? 0 : percentage;
};

const getDoctorProfile = async (userId) => {
  const profile = await db('doctor_profiles as dp')
    .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
    .leftJoin('cities as c', 'dp.residence_city_id', 'c.id')
    .select(
      'dp.*',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'c.name as residence_city_name'
    )
    .where('dp.user_id', userId)
    .first();

  if (!profile) {
    throw new AppError('Doktor profili bulunamadı', 404);
  }

  profile.completion_percent = calculateCompletion(profile);

  return profile;
};

const getDashboard = async (userId) => {
  const profile = await getDoctorProfile(userId);

  const unreadQuery = await db('notifications')
    .where({ user_id: userId })
    .whereNull('read_at')
    .count({ count: '*' })
    .first();

  const applications = await db('applications as a')
    .distinct('a.id', 'a.job_id', 'a.applied_at')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .select(
      'a.id',
      'a.job_id',
      'a.applied_at',
      'j.title as job_title',
      'hp.institution_name as hospital_name',
      'st.name as status_label'
    )
    .where('a.doctor_profile_id', profile.id)
    .whereNull('a.deleted_at')
    .orderBy('a.applied_at', 'desc')
    .orderBy('a.id', 'desc')
    .limit(5);

  // Not: status_id = 5 (Geri Çekildi) olan başvurular hariç tutulur
  // Bu sayede kullanıcı geri çektikten sonra tekrar başvurabilir
  // Pasif hastanelerin ilanları gösterilmez (web ile uyumlu)
  const recommendedJobs = await db('jobs as j')
    .distinct('j.id', 'j.title', 'j.employment_type')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id') // Hastane kullanıcı bilgisi
    .leftJoin('applications as a', function joinApplications() {
      this.on('a.job_id', '=', 'j.id')
        .andOn('a.doctor_profile_id', '=', db.raw('?', [profile.id]))
        .andOnNull('a.deleted_at')
        .andOn('a.status_id', '!=', db.raw('?', [5])); // 5 = Geri Çekildi (withdrawn)
    })
    .select(
      'j.id',
      'j.title',
      'j.employment_type',
      'c.name as city_name',
      's.name as specialty_name',
      'hp.institution_name as hospital_name',
      'a.id as application_id'
    )
    .whereNull('j.deleted_at')
    .where('j.status_id', 3) // Sadece onaylanmış ilanlar (web ile uyumlu)
    .where('hospital_users.is_active', true) // Pasif hastanelerin ilanlarını gösterme (web ile uyumlu)
    .orderBy('j.id', 'desc')
    .limit(5);

  return {
    stats: {
      unread_notifications_count: parseCount(unreadQuery),
      active_applications_count: applications.length,
      recommended_jobs_count: recommendedJobs.length,
      profile_completion_percent: profile.completion_percent
    },
    recent_applications: applications.map(applicationTransformer.toListItem),
    recommended_jobs: recommendedJobs.map((job) => jobTransformer.toListItem({
      ...job,
      is_applied: Boolean(job.application_id)
    }))
  };
};

const getProfile = async (userId) => {
  const profile = await getDoctorProfile(userId);
  return profileTransformer.toMobileProfile(profile);
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Profile update fonksiyonu (web doctorService'i wrap ediyor)
const updatePersonalInfo = async (userId, personalInfo) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.updatePersonalInfo(userId, personalInfo);
  return profileTransformer.toMobileProfile(result);
};

// Profile completion fonksiyonu
const getProfileCompletion = async (userId) => {
  const doctorService = require('../doctorService');
  return await doctorService.getProfileCompletion(userId);
};

// ============================================================================
// EDUCATION CRUD (Web Service Wrappers)
// ============================================================================

const addEducation = async (userId, educationData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.addEducation(userId, educationData);
  return profileTransformer.toMobileEducation(result);
};

const getEducations = async (userId) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.getEducations(userId);
  return result.map(profileTransformer.toMobileEducation);
};

const updateEducation = async (userId, educationId, educationData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.updateEducation(userId, educationId, educationData);
  return profileTransformer.toMobileEducation(result);
};

const deleteEducation = async (userId, educationId) => {
  const doctorService = require('../doctorService');
  return await doctorService.deleteEducation(userId, educationId);
};

// ============================================================================
// EXPERIENCE CRUD (Web Service Wrappers)
// ============================================================================

const addExperience = async (userId, experienceData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.addExperience(userId, experienceData);
  return profileTransformer.toMobileExperience(result);
};

const getExperiences = async (userId) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.getExperiences(userId);
  return result.map(profileTransformer.toMobileExperience);
};

const updateExperience = async (userId, experienceId, experienceData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.updateExperience(userId, experienceId, experienceData);
  return profileTransformer.toMobileExperience(result);
};

const deleteExperience = async (userId, experienceId) => {
  const doctorService = require('../doctorService');
  return await doctorService.deleteExperience(userId, experienceId);
};

// ============================================================================
// CERTIFICATE CRUD (Web Service Wrappers)
// ============================================================================

const addCertificate = async (userId, certificateData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.addCertificate(userId, certificateData);
  return profileTransformer.toMobileCertificate(result);
};

const getCertificates = async (userId) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.getCertificates(userId);
  return result.map(profileTransformer.toMobileCertificate);
};

const updateCertificate = async (userId, certificateId, certificateData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.updateCertificate(userId, certificateId, certificateData);
  return profileTransformer.toMobileCertificate(result);
};

const deleteCertificate = async (userId, certificateId) => {
  const doctorService = require('../doctorService');
  return await doctorService.deleteCertificate(userId, certificateId);
};

// ============================================================================
// LANGUAGE CRUD (Web Service Wrappers)
// ============================================================================

const addLanguage = async (userId, languageData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.addLanguage(userId, languageData);
  return profileTransformer.toMobileLanguage(result);
};

const getLanguages = async (userId) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.getLanguages(userId);
  return result.map(profileTransformer.toMobileLanguage);
};

const updateLanguage = async (userId, languageId, languageData) => {
  const doctorService = require('../doctorService');
  const result = await doctorService.updateLanguage(userId, languageId, languageData);
  return profileTransformer.toMobileLanguage(result);
};

const deleteLanguage = async (userId, languageId) => {
  const doctorService = require('../doctorService');
  return await doctorService.deleteLanguage(userId, languageId);
};

// ============================================================================
// PHOTO REQUEST (Web Service Wrappers)
// ============================================================================

const requestProfilePhotoChange = async (userId, fileUrl) => {
  const doctorService = require('../doctorService');
  return await doctorService.requestProfilePhotoChange(userId, fileUrl);
};

const getMyPhotoRequestStatus = async (userId) => {
  const doctorService = require('../doctorService');
  return await doctorService.getMyPhotoRequestStatus(userId);
};

const getMyPhotoRequestHistory = async (userId, limit = 50) => {
  const doctorService = require('../doctorService');
  return await doctorService.getMyPhotoRequestHistory(userId, limit);
};

const cancelPhotoRequest = async (userId) => {
  const doctorService = require('../doctorService');
  return await doctorService.cancelPhotoRequest(userId);
};

// ============================================================================
// ACCOUNT MANAGEMENT (Web Service Wrappers)
// ============================================================================

const deactivateAccount = async (userId) => {
  const doctorService = require('../doctorService');
  return await doctorService.deactivateAccount(userId);
};

module.exports = {
  getDashboard,
  getProfile,
  getDoctorProfile,
  updatePersonalInfo,
  getProfileCompletion,
  
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
  getMyPhotoRequestStatus,
  getMyPhotoRequestHistory,
  cancelPhotoRequest,
  
  // Account Management
  deactivateAccount
};

