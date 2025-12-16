/**
 * @file mobileJobService.js
 * @description Mobile job servisi - Mobil uygulama için iş ilanı işlemlerini yönetir.
 * Bu servis, mobileJobController tarafından kullanılan temel job işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - İş ilanları listesi (pagination, filters)
 * - İş ilanı detayı
 * 
 * Veritabanı Tabloları:
 * - jobs: İş ilanları
 * - cities: Şehirler
 * - specialties: Branşlar
 * - hospital_profiles: Hastane profilleri
 * - applications: Başvurular (is_applied kontrolü için)
 * 
 * Özellikler:
 * - Minimal payload (mobile optimized)
 * - Transformer kullanımı
 * - Filter support (city_id, specialty_id, keyword)
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
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const { getDoctorProfile } = require('./mobileDoctorService');
const { normalizeCountResult, buildPaginationSQL, normalizeRawResult } = require('../../utils/queryHelper');

const buildJobsBaseQuery = () => {
  return db('jobs as j')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .whereNull('j.deleted_at')
    .where('j.status_id', 3); // Sadece onaylanmış ilanları göster (status_id = 3 = Onaylandı)
};

const listJobs = async (userId, { page = 1, limit = 20, filters = {} } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const baseQuery = buildJobsBaseQuery();

  if (filters.city_id) {
    baseQuery.andWhere('j.city_id', filters.city_id);
  }

  if (filters.specialty_id) {
    baseQuery.andWhere('j.specialty_id', filters.specialty_id);
  }

  if (filters.employment_type) {
    baseQuery.andWhere('j.employment_type', filters.employment_type);
  }

  if (filters.keyword) {
    baseQuery.andWhere('j.title', 'like', `%${filters.keyword}%`);
  }

  const dataQuery = baseQuery
    .clone()
    .select(
      'j.id',
      'j.title',
      'j.city_id',
      'j.specialty_id',
      'j.hospital_id',
      'j.employment_type',
      'c.name as city_name',
      's.name as specialty_name',
      'hp.institution_name as hospital_name'
    )
    .orderBy('j.id', 'desc');

  const [countResults, allRows] = await Promise.all([
    baseQuery.clone().clearSelect().clearOrder().count({ count: '*' }),
    dataQuery
  ]);
  
  const total = normalizeCountResult(countResults[0]);
  
  // JavaScript'te pagination
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const rows = allRows.slice(startIndex, endIndex);

  // Başvuru kontrolü için job id'leri topla
  const jobIds = rows.map(r => r.id);
  const applications = jobIds.length > 0 
    ? await db('applications')
        .select('job_id', 'id')
        .whereIn('job_id', jobIds)
        .where('doctor_profile_id', profile.id)
        .whereNull('deleted_at')
    : [];

  // Application map oluştur
  const applicationMap = {};
  applications.forEach(app => {
    applicationMap[app.job_id] = app.id;
  });

  // Rows'a application_id ekle
  const rowsWithApplications = rows.map(row => ({
    ...row,
    application_id: applicationMap[row.id] || null
  }));

  return {
    data: rowsWithApplications.map((row) => jobTransformer.toListItem({
      ...row,
      is_applied: Boolean(row.application_id)
    })),
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

const getJobDetail = async (userId, jobId) => {
  const profile = await getDoctorProfile(userId);

  // İlk önce job bilgisini al
  let jobQuery;
  try {
    jobQuery = await db('jobs as j')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .select(
      'j.id',
      'j.title',
      'j.description',
      'j.city_id',
      'j.specialty_id',
      'j.subspecialty_id',
      'j.hospital_id',
      'j.employment_type',
      'j.min_experience_years',
      'c.name as city_name',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'hp.institution_name as hospital_name',
      'hp.address as hospital_address',
      'hp.phone as hospital_phone',
      'hp.email as hospital_email',
      'hp.website as hospital_website',
      'hp.about as hospital_about'
    )
    .where('j.id', jobId)
    .whereNull('j.deleted_at')
    .where('j.status_id', 3); // Sadece onaylanmış ilanları göster
  } catch (error) {
    logger.error('❌ Job detail query error:', error.message);
    logger.error('Error details:', {
      code: error.code,
      number: error.number,
      message: error.message
    });
    console.error('FULL JOB ERROR:', error);
    throw error;
  }

  if (!jobQuery || jobQuery.length === 0) {
    throw new AppError('İlan bulunamadı', 404);
  }

  const jobData = jobQuery[0];

  // Başvuru kontrolü ayrı query ile yap
  const applicationCheck = await db('applications')
    .select('id')
    .where('job_id', jobId)
    .where('doctor_profile_id', profile.id)
    .whereNull('deleted_at')
    .first();

  const jobs = [{
    ...jobData,
    application_id: applicationCheck?.id || null
  }];

  if (!jobs || jobs.length === 0) {
    throw new AppError('İlan bulunamadı', 404);
  }

  const job = jobs[0];

  return jobTransformer.toDetail({
    ...job,
    is_applied: Boolean(job.application_id)
  });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  listJobs,
  getJobDetail
};

