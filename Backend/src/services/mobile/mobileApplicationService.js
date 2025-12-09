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
const { buildPaginationSQL, normalizeRawResult, normalizeCountResult } = require('../../utils/queryHelper');

const listApplications = async (userId, { page = 1, limit = 20, status } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  // İngilizce status değerlerini Türkçe'ye çevir (veritabanındaki değerlerle eşleşmeli)
  // Hem İngilizce hem Türkçe değerleri kabul et
  const statusMapping = {
    'pending': 'Başvuruldu',
    'reviewing': 'İnceleniyor',
    'approved': 'Kabul Edildi',
    'rejected': 'Reddedildi',
    'withdrawn': 'Geri Çekildi',
    'başvuruldu': 'Başvuruldu',
    'inceleniyor': 'İnceleniyor',
    'kabul edildi': 'Kabul Edildi',
    'red edildi': 'Reddedildi',
    'geri çekildi': 'Geri Çekildi'
  };

  const baseQuery = db('applications as a')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'hp.id', 'j.hospital_id')
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .where('a.doctor_profile_id', profile.id)
    .whereNull('a.deleted_at');

  if (status) {
    // Hem İngilizce hem Türkçe değerleri kabul et
    const turkishStatus = statusMapping[status.toLowerCase()] || status;
    baseQuery.andWhere('st.name', turkishStatus);
  }

  const countQuery = baseQuery.clone().clearSelect().clearOrder().count({ count: '*' }).first();

  // SQL Server için OFFSET ... ROWS FETCH NEXT ... ROWS ONLY syntax'ı kullan
  // Knex'in SQL Server dialect'i offset+limit birlikte kullanıldığında TOP kullanıyor,
  // bu yüzden raw SQL ile doğru SQL'i oluşturuyoruz (parametreli sorgu ile güvenli)
  const dataQuery = baseQuery
    .clone()
    .select(
      'a.id',
      'a.job_id',
      'a.applied_at as created_at', // SQL'de applied_at var, created_at yok
      'a.updated_at',
      'a.cover_letter',
      'a.notes',
      'j.title as job_title',
      'hp.institution_name as hospital_name',
      'st.name as status_label'
    )
    .orderBy('a.applied_at', 'desc') // SQL'de applied_at var, created_at yok
    .orderBy('a.id', 'desc');

  // SQL Server için pagination SQL'i oluştur
  const { sql, bindings } = buildPaginationSQL(dataQuery, currentPage, perPage);

  const [countResult, rowsResult] = await Promise.all([
    countQuery,
    db.raw(sql, bindings)
  ]);
  
  // Sonuçları normalize et
  const rows = normalizeRawResult(rowsResult);
  const total = normalizeCountResult(countResult);

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

  // Web backend'deki gibi ayrı ayrı sorgular - Knex SQL Server bug'ını bypass et
  // Önce applications tablosundan temel veriyi al
  const applications = await db('applications')
    .select('*')
    .where('id', applicationId)
    .where('doctor_profile_id', profile.id)
    .whereNull('deleted_at');

  if (!applications || applications.length === 0) {
    throw new AppError('Başvuru bulunamadı', 404);
  }

  const application = applications[0];

  // Job bilgilerini al - .first() yerine array döndür
  if (application.job_id) {
    const jobs = await db('jobs as j')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
      .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .select(
        'j.title as job_title',
        'j.description',
        'j.employment_type',
        'j.min_experience_years',
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

  // Status bilgisini al - .first() yerine array döndür
  if (application.status_id) {
    const statuses = await db('application_statuses')
      .select('name as status_label')
      .where('id', application.status_id);

    const status = statuses[0];
    if (status) {
      application.status_label = status.status_label;
      application.status = status.status_label;
    }
  }

  // created_at için applied_at kullan
  application.created_at = application.applied_at;

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

