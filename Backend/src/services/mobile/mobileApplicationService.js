/**
 * @file mobileApplicationService.js
 * @description Mobile application servisi - Mobil uygulama için başvuru işlemlerini yönetir.
 * Bu servis, mobileApplicationController tarafından kullanılan temel application işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Başvuru listesi (pagination, status filter)
 * - Başvuru detayı
 * - Başvuru oluşturma
 * - Başvuru geri çekme
 * 
 * Veritabanı Tabloları:
 * - applications: Başvurular
 * - jobs: İş ilanları
 * - hospital_profiles: Hastane profilleri
 * - application_statuses: Başvuru durumları
 * 
 * Özellikler:
 * - Minimal payload (mobile optimized)
 * - Transformer kullanımı
 * - Status filter support
 * - Pagination support
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
const logger = require('../../utils/logger');
const applicationTransformer = require('../../mobile/transformers/applicationTransformer');
const doctorService = require('../doctorService');
const { getDoctorProfile } = require('./mobileDoctorService');
const { normalizeCountResult, buildPaginationSQL, normalizeRawResult } = require('../../utils/queryHelper');

const listApplications = async (userId, { page = 1, limit = 20, status } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  // Status mapping - Veritabanında Türkçe değerler var
  const statusMapping = {
    'pending': 'Başvuruldu',
    'reviewing': 'İnceleniyor',
    'approved': 'Kabul Edildi',
    'rejected': 'Reddedildi',
    'withdrawn': 'Geri Çekildi'
  };

  const baseQuery = db('applications as a')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'hp.id', 'j.hospital_id')
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .whereRaw(`[a].[doctor_profile_id] = ${parseInt(profile.id)}`)
    .whereNull('a.deleted_at');

  // Status filter
  if (status) {
    const turkishStatus = statusMapping[status.toLowerCase()] || status;
    baseQuery.andWhere('st.name', turkishStatus);
  }

  const dataQuery = baseQuery
    .clone()
    .select(
      'a.id',
      'a.job_id',
      'a.status_id',
      'a.applied_at',
      'a.cover_letter',
      'a.notes',
      'j.title as job_title',
      'hp.institution_name as hospital_name',
      'st.name as status_label'
    )
    .orderBy('a.applied_at', 'desc')
    .orderBy('a.id', 'desc')
    .limit(perPage)
    .offset((currentPage - 1) * perPage);

  // Önce count query'sini test et
  let countResults;
  try {
    countResults = await baseQuery.clone().clearSelect().clearOrder().count({ count: '*' });
    logger.debug('✅ Count query başarılı:', countResults);
  } catch (error) {
    logger.error('❌ Count query error:', error.message);
    throw error;
  }

  // Sonra data query'sini çalıştır
  let rows;
  try {
    rows = await dataQuery;
    logger.debug('✅ Data query başarılı, row count:', rows.length);
  } catch (error) {
    logger.error('❌ Data query error:', error.message);
    logger.error('Profile ID:', profile.id);
    throw error;
  }
  
  const total = normalizeCountResult(countResults[0]);

  return {
    data: rows.map(applicationTransformer.toListItem),
    pagination: {
      current_page: currentPage,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage) || 0,
      has_next: currentPage * perPage < total,
      has_prev: currentPage > 1
    }
  };
};

const getApplicationDetail = async (userId, applicationId) => {
  const profile = await getDoctorProfile(userId);

  // Applications tablosundan temel veriyi al
  const applications = await db('applications')
    .select(
      'id',
      'job_id',
      'doctor_profile_id',
      'status_id',
      'cover_letter',
      'notes',
      'applied_at'
    )
    .where('id', applicationId)
    .where('doctor_profile_id', profile.id)
    .whereNull('deleted_at');

  if (!applications || applications.length === 0) {
    throw new AppError('Başvuru bulunamadı', 404);
  }

  const application = applications[0];

  // Job bilgilerini al
  if (application.job_id) {
    const jobs = await db('jobs as j')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
      .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .select(
        'j.id as hospital_id',
        'j.title as job_title',
        'j.description',
        'j.employment_type',
        'j.min_experience_years',
        'j.city_id',
        'j.specialty_id',
        'j.subspecialty_id',
        'hp.institution_name as hospital_name',
        'hp.address as hospital_address',
        'hp.phone as hospital_phone',
        'hp.email as hospital_email',
        'hp.website as hospital_website',
        'hp.about as hospital_about',
        'c.name as city_name',
        's.name as specialty_name',
        'ss.name as subspecialty_name'
      )
      .where('j.id', application.job_id);

    const job = jobs[0];
    if (job) {
      Object.assign(application, job);
    }
  }

  // Status bilgisini al
  if (application.status_id) {
    const statuses = await db('application_statuses')
      .select('name as status_label')
      .where('id', application.status_id);

    const status = statuses[0];
    if (status) {
      application.status_label = status.status_label;
    }
  }

  return applicationTransformer.toDetail(application);
};

const createApplication = async (userId, { job_id: jobId, cover_letter: coverLetter }) => {
  const profile = await getDoctorProfile(userId);
  const application = await doctorService.createApplication(profile.id, {
    jobId,
    coverLetter
  });

  return applicationTransformer.toDetail(application);
};

const withdrawApplication = async (userId, applicationId) => {
  const profile = await getDoctorProfile(userId);
  await doctorService.withdrawApplication(applicationId, profile.id);
  return { success: true };
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  listApplications,
  getApplicationDetail,
  createApplication,
  withdrawApplication
};

