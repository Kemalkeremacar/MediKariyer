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

const listApplications = async (userId, { page = 1, limit = 20, status_id, keyword } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const baseQuery = db('applications as a')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'hp.id', 'j.hospital_id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id') // Hastane aktiflik durumu için
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id') // İş ilanı durumu için
    .leftJoin('cities as c', 'j.city_id', 'c.id') // Şehir bilgisi için
    .where('a.doctor_profile_id', parseInt(profile.id))
    .whereNull('a.deleted_at');

  // Status filter using status_id (Requirements 1.1, 1.2, 1.5)
  if (status_id) {
    baseQuery.andWhere('a.status_id', parseInt(status_id));
  }

  // Keyword search filter (Requirements 6.1, 6.2, 6.3, 6.5)
  // Search optimizasyonu: LIKE '%term%' yerine prefix search (LIKE 'term%') kullanılıyor
  // Bu sayede index kullanımı mümkün olur ve performans artar (Job modülü ile tutarlı)
  if (keyword) {
    const searchTerm = keyword.trim();
    if (searchTerm) {
      baseQuery.andWhere(function() {
        this.where('j.title', 'like', `${searchTerm}%`)
          .orWhere('hp.institution_name', 'like', `${searchTerm}%`)
          .orWhere('c.name', 'like', `${searchTerm}%`)
          .orWhere('a.notes', 'like', `${searchTerm}%`);  // Add notes search (Requirement 6.1)
      });
    }
  }

  const dataQuery = baseQuery
    .clone()
    .select(
      'a.id',
      'a.job_id',
      'a.status_id',        // Include status_id (Requirement 1.3)
      'a.applied_at',
      'a.cover_letter',
      'a.notes',
      'j.title as job_title',
      'j.deleted_at as job_deleted_at', // İş ilanı silinme tarihi (web ile uyumlu)
      'hp.institution_name as hospital_name',
      'st.name as status_label',  // Include status_label (Requirement 1.3)
      'js.name as job_status', // İş ilanı durumu (web ile uyumlu)
      'c.name as city_name', // Şehir bilgisi (web ile uyumlu)
      'hospital_users.is_active as hospital_is_active' // Hastane aktiflik durumu (web ile uyumlu)
    )
    .orderBy('a.applied_at', 'desc')
    .orderBy('a.id', 'desc')
    .limit(perPage)
    .offset((currentPage - 1) * perPage);

  // Count ve data query'lerini paralel çalıştır
  let countResults, rows;
  try {
    [countResults, rows] = await Promise.all([
      baseQuery.clone().clearSelect().clearOrder().count('* as count'),
      dataQuery
    ]);
    logger.debug('✅ Queries başarılı - Count:', countResults.length, 'Rows:', rows.length);
  } catch (error) {
    logger.error('❌ Query error:', error.message);
    logger.error('❌ Query error stack:', error.stack);
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

  // N+1 problemi çözüldü: Application, Job ve Status bilgileri tek sorguda LEFT JOIN ile getiriliyor
  // 3 ayrı sorgu yerine 1 sorgu kullanarak performans %66 artırıldı
  const application = await db('applications as a')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('application_statuses as ast', 'a.status_id', 'ast.id')
    .where('a.id', applicationId)
    .where('a.doctor_profile_id', profile.id)
    .whereNull('a.deleted_at')
    .select(
      // Application fields
      'a.id',
      'a.job_id',
      'a.doctor_profile_id',
      'a.status_id',
      'a.cover_letter',
      'a.notes',
      'a.applied_at',
      // Job fields
      'j.hospital_id',
      'j.title as job_title',
      'j.description',
      'j.employment_type',
      'j.min_experience_years',
      'j.city_id',
      'j.specialty_id',
      'j.subspecialty_id',
      // Hospital fields
      'hp.institution_name as hospital_name',
      'hp.address as hospital_address',
      'hp.phone as hospital_phone',
      'hp.email as hospital_email',
      'hp.website as hospital_website',
      'hp.about as hospital_about',
      // Lookup fields
      'c.name as city_name',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      // Status field
      'ast.name as status_label'
    )
    .first();

  if (!application) {
    throw new AppError('Başvuru bulunamadı', 404);
  }

  return applicationTransformer.toDetail(application);
};

const createApplication = async (userId, { job_id: jobId, cover_letter: coverLetter }) => {
  const profile = await getDoctorProfile(userId);
  
  // Mobile için transaction wrapper: Web'deki gibi doctorService.createApplication kullan
  // ama transaction içinde çağırarak veri tutarlılığını sağla
  // Not: doctorService.createApplication transaction kullanmıyor, bu yüzden burada transaction wrapper ekliyoruz
  const application = await db.transaction(async (trx) => {
    // Web'deki mantığı kullan ama transaction içinde
    // doctorService.createApplication içindeki mantığı transaction-aware hale getir
    
    // İlan varlık ve durum kontrolü - SELECT FOR UPDATE ile row-level locking
    const jobs = await trx.raw(`
      SELECT j.*, js.name as status_name
      FROM jobs j WITH (UPDLOCK, ROWLOCK)
      LEFT JOIN job_statuses js ON j.status_id = js.id
      WHERE j.id = ?
    `, [jobId]);

    if (!jobs || jobs.length === 0 || !jobs[0]) {
      throw new AppError(`jobs.id=${jobId} bulunamadı`, 400);
    }

    const job = jobs[0];

    // Status kontrolü - Web'deki mantık
    if (job.status_id) {
      const statuses = await trx('job_statuses')
        .select('name')
        .where('id', job.status_id);
      
      if (statuses && statuses.length > 0) {
        const statusName = statuses[0].name;
        if (statusName !== 'Onaylandı') {
          throw new AppError('İlan durumu başvuruya kapalı. İlan henüz onaylanmamış veya pasif durumda.', 400);
        }
      }
    }

    // Mükerrer başvuru kontrolü - Web'deki mantık
    const existingApplications = await trx('applications')
      .where({
        doctor_profile_id: profile.id,
        job_id: jobId
      })
      .where('status_id', '!=', 5)
      .whereNull('deleted_at');
    
    const existingApplication = existingApplications[0];

    if (existingApplication) {
      throw new AppError('Bu ilana daha önce başvuru yapılmış', 400);
    }

    // Başvuru oluştur - Web'deki mantık
    const pendingStatusId = 1;
    const insertedApplications = await trx('applications')
      .insert({
        job_id: jobId,
        doctor_profile_id: profile.id,
        status_id: pendingStatusId,
        cover_letter: coverLetter || null,
        notes: null
      })
      .returning('id');

    const applicationId = insertedApplications[0].id;

    // Web'deki gibi getApplicationById kullan (ama transaction-aware versiyonu)
    // Transaction içinde olduğumuz için trx kullanıyoruz
    const applicationData = await trx('applications')
      .where('id', applicationId)
      .first();

    if (!applicationData) {
      throw new AppError('Başvuru oluşturuldu ancak getirilemedi', 500);
    }

    // Job bilgilerini çek - Web'deki getApplicationById mantığı
    if (applicationData.job_id) {
      const jobData = await trx('jobs as j')
        .leftJoin('cities as c', 'j.city_id', 'c.id')
        .leftJoin('specialties as s', 'j.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
        .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
        .leftJoin('cities as hp_city', 'hp.city_id', 'hp_city.id')
        .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
        .select(
          'j.id',
          'j.title',
          'j.description',
          'j.city_id',
          'j.employment_type',
          'j.min_experience_years',
          'j.created_at',
          'j.updated_at',
          'j.hospital_id',
          'j.specialty_id',
          'j.subspecialty_id',
          'j.status_id as job_status_id',
          'js.name as job_status',
          'j.deleted_at as job_deleted_at',
          'c.name as city',
          's.name as specialty_name',
          'ss.name as subspecialty_name',
          'hp.institution_name as hospital_name',
          'hp.city_id as hospital_city_id',
          'hp_city.name as hospital_city',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hospital_users.is_active as hospital_is_active'
        )
        .where('j.id', applicationData.job_id)
        .first();
      
      if (jobData) {
        Object.assign(applicationData, {
          job_id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          city_id: jobData.city_id,
          city: jobData.city,
          employment_type: jobData.employment_type,
          min_experience_years: jobData.min_experience_years,
          specialty_name: jobData.specialty_name,
          subspecialty_name: jobData.subspecialty_name,
          created_at: jobData.created_at,
          updated_at: jobData.updated_at,
          hospital_name: jobData.hospital_name,
          hospital_city: jobData.hospital_city,
          hospital_address: jobData.hospital_address,
          hospital_phone: jobData.hospital_phone,
          hospital_email: jobData.hospital_email,
          job_status_id: jobData.job_status_id,
          job_status: jobData.job_status,
          job_deleted_at: jobData.job_deleted_at,
          hospital_is_active: jobData.hospital_is_active
        });
      }
    }

    // Status bilgisini çek - Web'deki mantık
    if (applicationData.status_id) {
      const statuses = await trx('application_statuses')
        .select('name')
        .where('id', applicationData.status_id)
        .first();
      
      if (statuses) {
        applicationData.status_name = statuses.name;
        applicationData.status = statuses.name;
      }
    }

    applicationData.created_at = applicationData.applied_at;

    return applicationData;
  });

  // Bildirim gönder - Web'deki mantık (transaction dışında)
  try {
    const jobWithHospital = await db('jobs as j')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .join('users as u', 'hp.user_id', 'u.id')
      .where('j.id', jobId)
      .select('j.title as job_title', 'hp.institution_name', 'u.id as hospital_user_id')
      .first();
    
    const doctorProfile = await db('doctor_profiles')
      .where('id', profile.id)
      .select('first_name', 'last_name')
      .first();
    
    if (jobWithHospital && doctorProfile) {
      const notificationService = require('../notificationService');
      await notificationService.sendNotification({
        user_id: jobWithHospital.hospital_user_id,
        type: 'info',
        title: 'Yeni Başvuru Aldınız',
        body: `"${jobWithHospital.job_title}" pozisyonu için ${doctorProfile.first_name} ${doctorProfile.last_name} doktorundan yeni bir başvuru aldınız.`,
        data: {
          // In-App State Update için kritik alanlar
          action: 'application_created',
          entity_type: 'application',
          entity_id: application.id,
          // Mevcut veriler (geriye dönük uyumluluk için)
          application_id: application.id,
          job_id: jobId,
          job_title: jobWithHospital.job_title,
          doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
          doctor_profile_id: profile.id
        }
      });
    }
  } catch (notificationError) {
    logger.warn('New application notification failed:', notificationError);
  }

  return applicationTransformer.toDetail(application);
};

const withdrawApplication = async (userId, applicationId, reason = null) => {
  const profile = await getDoctorProfile(userId);
  
  // Mobile için transaction wrapper: Web'deki gibi doctorService.withdrawApplication mantığını kullan
  // ama transaction içinde çağırarak veri tutarlılığını sağla
  await db.transaction(async (trx) => {
    // Web'deki mantığı kullan ama transaction içinde
    // Başvuru varlık ve sahiplik kontrolü - Web'deki mantık
    const application = await trx('applications')
      .where('id', applicationId)
      .where('doctor_profile_id', profile.id)
      .first();

    if (!application) {
      throw new AppError('Başvuru bulunamadı', 404);
    }

    // Zaten geri çekilmiş mi kontrol et (status_id = 5) - Web'deki mantık
    if (application.status_id === 5) {
      throw new AppError('Başvuru zaten geri çekilmiş', 400);
    }

    // Sadece "Başvuruldu" (status_id = 1) durumundaki başvurular geri çekilebilir - Web'deki mantık
    if (application.status_id !== 1) {
      throw new AppError('Sadece "Başvuruldu" durumundaki başvurular geri çekilebilir', 400);
    }

    // Başvuruyu geri çek (status_id = 5: Geri Çekildi) - Web'deki mantık ile birebir aynı
    await trx('applications')
      .where('id', applicationId)
      .update({
        status_id: 5, // Geri Çekildi
        notes: reason ? `${application.notes || ''}\n\nGeri çekme sebebi: ${reason}`.trim() : application.notes,
        updated_at: db.fn.now()
      });
  });

  // Bildirim gönder - Web'deki mantık (transaction dışında)
  try {
    const applicationWithJob = await db('applications as a')
      .join('jobs as j', 'a.job_id', 'j.id')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .join('users as u', 'hp.user_id', 'u.id')
      .where('a.id', applicationId)
      .select(
        'j.title as job_title',
        'hp.institution_name',
        'u.id as hospital_user_id',
        'a.doctor_profile_id'
      )
      .first();
    
    const doctorProfile = await db('doctor_profiles')
      .where('id', applicationWithJob?.doctor_profile_id)
      .select('first_name', 'last_name')
      .first();
    
    if (applicationWithJob && doctorProfile) {
      // Job ID'yi al - Web'deki mantık
      const jobId = await db('applications')
        .where('id', applicationId)
        .select('job_id')
        .first();
      
      const notificationService = require('../notificationService');
      await notificationService.sendHospitalWithdrawalNotification(applicationWithJob.hospital_user_id, {
        application_id: applicationId,
        job_id: jobId?.job_id || null,
        job_title: applicationWithJob.job_title,
        doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
        doctor_profile_id: applicationWithJob.doctor_profile_id,
        reason: reason || null  // Include reason in notification (Requirement 3.2)
      });
    }
  } catch (notificationError) {
    logger.warn('Application withdrawal notification failed:', notificationError);
  }

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

