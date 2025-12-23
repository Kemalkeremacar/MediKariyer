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
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id') // Hastane kullanıcı bilgisi
    .whereNull('j.deleted_at')
    .where('j.status_id', 3) // Sadece onaylanmış ilanları göster (status_id = 3 = Onaylandı)
    .where('hospital_users.is_active', true); // Pasif hastanelerin ilanlarını gösterme (web ile uyumlu)
};

const listJobs = async (userId, { page = 1, limit = 20, filters = {} } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const baseQuery = buildJobsBaseQuery();

  // ID bazlı filtreler (web ile uyumlu)
  if (filters.city_id) {
    const cityId = typeof filters.city_id === 'number' ? filters.city_id : parseInt(filters.city_id);
    if (!isNaN(cityId)) {
      baseQuery.andWhere('j.city_id', cityId);
    }
  }

  if (filters.specialty_id) {
    const specId = typeof filters.specialty_id === 'number' ? filters.specialty_id : parseInt(filters.specialty_id);
    if (!isNaN(specId)) {
      baseQuery.andWhere('j.specialty_id', specId);
    }
  }

  // Yan dal filtresi (web ile uyumlu)
  if (filters.subspecialty_id) {
    const subSpecId = typeof filters.subspecialty_id === 'number' ? filters.subspecialty_id : parseInt(filters.subspecialty_id);
    if (!isNaN(subSpecId)) {
      baseQuery.andWhere('j.subspecialty_id', subSpecId);
    }
  }

  // Hastane filtresi (web ile uyumlu)
  if (filters.hospital_id) {
    const hospId = typeof filters.hospital_id === 'number' ? filters.hospital_id : parseInt(filters.hospital_id);
    if (!isNaN(hospId)) {
      baseQuery.andWhere('j.hospital_id', hospId);
    }
  }

  if (filters.employment_type) {
    baseQuery.andWhere('j.employment_type', filters.employment_type);
  }

  if (filters.keyword) {
    const searchTerm = filters.keyword.trim();
    if (searchTerm) {
      baseQuery.andWhere(function() {
        this.where('j.title', 'like', `%${searchTerm}%`)
          .orWhere('hp.institution_name', 'like', `%${searchTerm}%`);
      });
    }
  }

  const dataQuery = baseQuery
    .clone()
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .select(
      'j.id',
      'j.title',
      'j.city_id',
      'j.specialty_id',
      'j.subspecialty_id',
      'j.hospital_id',
      'j.employment_type',
      'c.name as city_name',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'hp.institution_name as hospital_name',
      'hp.logo as hospital_logo'
    )
    .orderBy('j.id', 'desc')
    .limit(perPage)
    .offset((currentPage - 1) * perPage);

  const [countResults, rows] = await Promise.all([
    baseQuery.clone().clearSelect().clearOrder().count('* as count'),
    dataQuery
  ]);
  
  const total = normalizeCountResult(countResults[0]);

  // Başvuru kontrolü için job id'leri topla
  // Not: status_id = 5 (Geri Çekildi) olan başvurular hariç tutulur
  // Bu sayede kullanıcı geri çektikten sonra tekrar başvurabilir
  const jobIds = rows.map(r => r.id);
  const applications = jobIds.length > 0 
    ? await db('applications')
        .select('job_id', 'id')
        .whereIn('job_id', jobIds)
        .where('doctor_profile_id', profile.id)
        .whereNull('deleted_at')
        .whereNot('status_id', 5) // 5 = Geri Çekildi (withdrawn)
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
      .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id') // Hastane kullanıcı bilgisi
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
        'hp.logo as hospital_logo',
        'hp.address as hospital_address',
        'hp.phone as hospital_phone',
        'hp.email as hospital_email',
        'hp.website as hospital_website',
        'hp.about as hospital_about'
      )
      .where('j.id', jobId)
      .whereNull('j.deleted_at')
      .where('j.status_id', 3) // Sadece onaylanmış ilanları göster
      .where('hospital_users.is_active', true); // Pasif hastanelerin ilanlarını gösterme (web ile uyumlu)
  } catch (error) {
    logger.error('❌ Job detail query error:', error.message);
    logger.error('❌ Job detail query error stack:', error.stack);
    logger.error('Error details:', {
      code: error.code,
      number: error.number,
      message: error.message,
      jobId
    });
    throw error;
  }

  // TD-006: Array indexing güvenliği - tek check yeterli
  const jobData = jobQuery?.[0];
  if (!jobData) {
    throw new AppError('İlan bulunamadı', 404);
  }

  // Başvuru kontrolü ayrı query ile yap
  // Not: status_id = 5 (Geri Çekildi) olan başvurular hariç tutulur
  // Bu sayede kullanıcı geri çektikten sonra tekrar başvurabilir
  const applicationCheck = await db('applications')
    .select('id')
    .where('job_id', jobId)
    .where('doctor_profile_id', profile.id)
    .whereNull('deleted_at')
    .whereNot('status_id', 5) // 5 = Geri Çekildi (withdrawn)
    .first();

  return jobTransformer.toDetail({
    ...jobData,
    application_id: applicationCheck?.id || null,
    is_applied: Boolean(applicationCheck?.id)
  });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  listJobs,
  getJobDetail
};

