/**
 * @file adminService.js
 * @description Yönetici (admin) rolü için gerekli olan tüm iş mantığını içerir.
 * Bu servis, kullanıcı yönetimi, ilan yönetimi, istatistikler ve sistem sağlığı gibi
 * yöneticiye özel işlemleri yönetir.
 * 
 * Dashboard ve İstatistikler:
 * - Dashboard verileri doğrudan veritabanından alınır
 * - Tüm istatistikler adminService içinde hesaplanır
 * - Admin paneli adminService'i kullanır
 * 
 * İletişim Mesaj Yönetimi:
 * - Contact mesajları için ContactService kullanılır
 * - Anasayfadan public olarak mesaj gönderilebilir
 * - Admin bunu görüntüleyebilir (yanıtlama yok)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */
'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../config/dbConfig').db;
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/errorHandler');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

// ============================================================================
// KULLANICI YÖNETİMİ
// ============================================================================

/**
 * Filtrelenmiş kullanıcı listesini getirir (sayfalama ile)
 * Admin kullanıcıları hariç tutulur
 * 
 * @param {Object} filters - Filtreleme parametreleri
 * @param {string} [filters.role] - Kullanıcı rolü (doctor, hospital)
 * @param {string|boolean} [filters.isApproved] - Onay durumu
 * @param {string|boolean} [filters.isActive] - Aktiflik durumu
 * @param {string} [filters.search] - Genel arama terimi
 * @param {string} [filters.email_search] - E-posta arama terimi
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Object} Kullanıcı listesi ve sayfalama bilgileri
 */
const getUsers = async (filters = {}) => {
  const { role, isApproved, isActive, search, email_search, page = 1, limit = 10 } = filters;
  
  // Debug logs removed
  
  let query = db('users')
    .leftJoin('doctor_profiles', 'users.id', 'doctor_profiles.user_id')
    .leftJoin('hospital_profiles', 'users.id', 'hospital_profiles.user_id')
    .select(
      'users.*',
      'doctor_profiles.first_name',
      'doctor_profiles.last_name',
      'hospital_profiles.institution_name'
    );
  
  // Admin kullanıcılarını filtrele (admin kendi kendini yönetmesin)
  query.where('users.role', '!=', 'admin');
  
  if (role) query.where('users.role', role);
  if (isApproved !== undefined && isApproved !== '') {
    // String 'true'/'false' değerlerini boolean'a çevir
    const approvedValue = isApproved === 'true' || isApproved === true ? 1 : 0;
    query.where('users.is_approved', approvedValue);
  }
  if (isActive !== undefined && isActive !== '') {
    // String 'true'/'false' değerlerini boolean'a çevir
    const activeValue = isActive === 'true' || isActive === true ? 1 : 0;
    query.where('users.is_active', activeValue);
  }
  // Genel arama sorgusu
  if (search) query.where('users.email', 'like', `%${search}%`);
  
  // E-posta arama - sadece e-posta alanında
  if (email_search) query.where('users.email', 'like', `%${email_search}%`);
  
  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('users');
  
  // Admin kullanıcılarını filtrele (admin kendi kendini yönetmesin)
  countQuery.where('role', '!=', 'admin');
  
  if (role) countQuery.where('role', role);
  if (isApproved !== undefined && isApproved !== '') {
    const approvedValue = isApproved === 'true' || isApproved === true ? 1 : 0;
    countQuery.where('is_approved', approvedValue);
  }
  if (isActive !== undefined && isActive !== '') {
    const activeValue = isActive === 'true' || isActive === true ? 1 : 0;
    countQuery.where('is_active', activeValue);
  }
  // Genel arama sorgusu
  if (search) countQuery.where('email', 'like', `%${search}%`);
  
  // E-posta arama - sadece e-posta alanında
  if (email_search) countQuery.where('email', 'like', `%${email_search}%`);
  
  const [{ count }] = await countQuery.count('* as count');
  const users = await query.limit(limit).offset(offset);
  
  // Profil bilgilerini düzenle
  const usersWithProfile = users.map(user => ({
    ...user,
    profile: {
      first_name: user.first_name,
      last_name: user.last_name,
      institution_name: user.institution_name
    }
  }));
  
  return {
    data: usersWithProfile,
    pagination: {
      current_page: page,
      per_page: limit,
      total: parseInt(count),
      total_pages: Math.ceil(count / limit)
    }
  };
};

/**
 * Belirli bir kullanıcının detaylarını getirir
 * Kullanıcının rolüne göre profil bilgilerini de dahil eder
 * 
 * @param {number} id - Kullanıcı ID'si
 * @returns {Object|null} Kullanıcı detayları ve profil bilgileri
 */
const getUserDetails = async (id) => {
  const user = await db('users').where('id', id).first();
  if (!user) return null;
  
  // Role'e göre profil bilgilerini getir
  if (user.role === 'doctor') {
    const profile = await db('doctor_profiles').where('user_id', id).first();
    
    // Profil için specialty ve subspecialty isimlerini getir
    let specialty_name = null;
    let subspecialty_name = null;
    
    if (profile?.specialty_id) {
      const specialty = await db('specialties').where('id', profile.specialty_id).first();
      specialty_name = specialty?.name;
    }
    
    if (profile?.subspecialty_id) {
      const subspecialty = await db('subspecialties').where('id', profile.subspecialty_id).first();
      subspecialty_name = subspecialty?.name;
    }
    
    // Doktor için ek bilgileri getir - lookup tablolarıyla JOIN
    const [educations, experiences, certificates, languages] = await Promise.all([
      // Eğitim bilgileri - education_type lookup
      db('doctor_educations as de')
        .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
        .where('de.doctor_profile_id', profile?.id || 0)
        .select('de.*', 'det.name as education_type_name'),
      
      // Deneyim bilgileri - specialty ve subspecialty lookup
      db('doctor_experiences as dex')
        .leftJoin('specialties as s', 'dex.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'dex.subspecialty_id', 'ss.id')
        .where('dex.doctor_profile_id', profile?.id || 0)
        .select('dex.*', 's.name as specialty_name', 'ss.name as subspecialty_name'),
      
      // Sertifika bilgileri - certificate_type lookup (custom_name öncelikli)
      db('doctor_certificates as dc')
        .leftJoin('certificate_types as ct', 'dc.certificate_type_id', 'ct.id')
        .where('dc.doctor_profile_id', profile?.id || 0)
        .select('dc.*', 'ct.name as certificate_type_name'),
      
      // Dil bilgileri - language ve level lookup
      db('doctor_languages as dl')
        .leftJoin('languages as l', 'dl.language_id', 'l.id')
        .leftJoin('language_levels as ll', 'dl.level_id', 'll.id')
        .where('dl.doctor_profile_id', profile?.id || 0)
        .select('dl.*', 'l.name as language_name', 'll.name as level_name')
    ]);
    
    return { 
      ...user, 
      profile: {
        ...profile,
        specialty_name,
        subspecialty_name,
        educations,
        experiences,
        certificates,
        languages
      }
    };
  } else if (user.role === 'hospital') {
    const profile = await db('hospital_profiles').where('user_id', id).first();
    
    // Hastane için ek bilgileri getir
    const [departments, contacts] = await Promise.all([
      db('hospital_departments').where('hospital_id', profile?.id || 0),
      db('hospital_contacts').where('hospital_id', profile?.id || 0)
    ]);
    
    return { 
      ...user, 
      profile: {
        ...profile,
        departments,
        contacts
      }
    };
  }
  
  return user;
};



// ============================================================================
// İŞ İLANLARI YÖNETİMİ
// ============================================================================

/**
 * Filtrelenmiş iş ilanları listesini getirir (sayfalama ile)
 * Hastane bilgileriyle birlikte döner
 * 
 * @param {Object} filters - Filtreleme parametreleri
 * @param {string} [filters.search] - Genel arama terimi (başlık, açıklama, hastane adı)
 * @param {string} [filters.title_search] - İş ilanı başlığı arama terimi
 * @param {string} [filters.hospital_search] - Hastane adı arama terimi
 * @param {number} [filters.status] - İlan durumu
 * @param {number} [filters.hospital_id] - Hastane ID'si
 * @param {number} [filters.specialty] - Uzmanlık alanı
 * @param {string} [filters.location_city] - Şehir
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Object} İş ilanları listesi ve sayfalama bilgileri
 */
const getAllJobs = async (filters = {}) => {
  const { search, title_search, hospital_search, status, hospital_id, specialty, location_city, page = 1, limit = 10 } = filters;

  let query = db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('job_statuses as js', 'j.status_id', 'js.id')
    .join('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .select(
      'j.*', 
      'hp.institution_name', 
      'js.name as status',
      's.name as specialty',
      'c.name as city'
    );

  // Genel arama sorgusu
  if (search) {
    query.where(function () {
      this.where('j.title', 'like', `%${search}%`)
        .orWhere('j.description', 'like', `%${search}%`)
        .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }

  // Başlık arama - sadece iş ilanı başlığında
  if (title_search) {
    query.where('j.title', 'like', `%${title_search}%`);
  }

  // Hastane arama - sadece hastane adında
  if (hospital_search) {
    query.where('hp.institution_name', 'like', `%${hospital_search}%`);
  }
  if (status) query.where('j.status_id', status);
  if (hospital_id) query.where('j.hospital_id', hospital_id);
  if (specialty) query.where('j.specialty_id', specialty);
  if (location_city) query.where('c.name', 'like', `%${location_city}%`);

  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id');
  
  // Genel arama sorgusu
  if (search) {
    countQuery.where(function () {
      this.where('j.title', 'like', `%${search}%`)
        .orWhere('j.description', 'like', `%${search}%`)
        .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }

  // Başlık arama - sadece iş ilanı başlığında
  if (title_search) {
    countQuery.where('j.title', 'like', `%${title_search}%`);
  }

  // Hastane arama - sadece hastane adında
  if (hospital_search) {
    countQuery.where('hp.institution_name', 'like', `%${hospital_search}%`);
  }
  if (status) countQuery.where('j.status_id', status);
  if (hospital_id) countQuery.where('j.hospital_id', hospital_id);
  if (specialty) countQuery.where('j.specialty_id', specialty);
  if (location_city) countQuery.where('c.name', 'like', `%${location_city}%`);
  
  const [{ count }] = await countQuery.count('* as count');
  const jobs = await query
    .orderBy('j.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  // Başvuru sayılarını ekle (liste için)
  if (jobs.length > 0) {
    const jobIds = jobs.map(job => job.id);
    const applicationCounts = await db('applications')
      .whereIn('job_id', jobIds)
      .where('status_id', '!=', 5) // Geri çekilen başvuruları sayma
      .select('job_id', db.raw('COUNT(id) as application_count'))
      .groupBy('job_id');

    jobs.forEach(job => {
      const appCount = applicationCounts.find(ac => ac.job_id === job.id);
      job.application_count = appCount ? parseInt(appCount.application_count) : 0;
    });
  }

  return { 
    data: jobs, 
    pagination: { 
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(count), 
      pages: Math.ceil(count / limit)
    } 
  };
};

/**
 * Belirli bir iş ilanının detaylarını getirir
 * Başvuru sayısını ve lookup table bilgilerini dahil eder
 * 
 * @param {number} jobId - İş ilanı ID'si
 * @returns {Object|null} İş ilanı detayları, hastane bilgileri, başvuru sayısı
 */
const getJobDetails = async (jobId) => {
  const job = await db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('job_statuses as js', 'j.status_id', 'js.id')
    .join('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .where('j.id', jobId)
    .select(
      'j.*',
      'hp.institution_name',
      'hp.phone',
      'js.name as status',
      's.name as specialty',
      'c.name as city'
    )
    .first();

  if (!job) return null;
  
  // Debug: Tüm bilgileri kontrol et
  console.log('🔍 Admin getJobDetails - Job ID:', jobId);
  console.log('📋 Raw Job Object:', {
    id: job.id,
    title: job.title,
    specialty_id: job.specialty_id,
    specialty: job.specialty,
    city_id: job.city_id,
    city: job.city,
    status_id: job.status_id,
    status: job.status,
    institution_name: job.institution_name,
    employment_type: job.employment_type,
    min_experience_years: job.min_experience_years
  });
  
  // Başvuru sayısını al (Geri çekilenler hariç)
  const [{ count }] = await db('applications')
    .where('job_id', jobId)
    .where('status_id', '!=', 5) // Geri çekilen başvuruları sayma
    .count('* as count');
    
  return { ...job, application_count: parseInt(count) || 0 };
};

// ============================================================================
// BAŞVURU YÖNETİMİ
// ============================================================================

/**
 * Filtrelenmiş başvuru listesini getirir (sayfalama ile)
 * Doktor, iş ilanı ve hastane bilgileriyle birlikte döner
 * 
 * @param {Object} filters - Filtreleme parametreleri
 * @param {string} [filters.search] - Genel arama terimi
 * @param {string} [filters.doctor_search] - Doktor arama terimi (ad, soyad)
 * @param {string} [filters.hospital_search] - Hastane arama terimi
 * @param {number} [filters.status] - Başvuru durumu
 * @param {number} [filters.job_id] - İş ilanı ID'si
 * @param {number} [filters.doctor_profile_id] - Doktor profil ID'si
 * @param {number} [filters.hospital_id] - Hastane ID'si
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Object} Başvuru listesi ve sayfalama bilgileri
 */
const getAllApplications = async ({ search, doctor_search, hospital_search, status, job_id, doctor_profile_id, hospital_id, page = 1, limit = 10 } = {}) => {
  let query = db('applications')
    .join('jobs', 'applications.job_id', 'jobs.id')
    .join('doctor_profiles', 'applications.doctor_profile_id', 'doctor_profiles.id')
    .join('hospital_profiles', 'jobs.hospital_id', 'hospital_profiles.id')
    .select(
      'applications.*',
      'jobs.title as job_title',
      'doctor_profiles.first_name',
      'doctor_profiles.last_name',
      'doctor_profiles.residence_city',
      'hospital_profiles.institution_name'
    );

  if (search) {
    query.where(function () {
      this.where('jobs.title', 'like', `%${search}%`)
        .orWhere('doctor_profiles.first_name', 'like', `%${search}%`)
        .orWhere('doctor_profiles.last_name', 'like', `%${search}%`)
        .orWhere('hospital_profiles.institution_name', 'like', `%${search}%`);
    });
  }
  
  // Doktor arama - sadece doktor bilgilerinde
  if (doctor_search) {
    query.where(function () {
      this.where('doctor_profiles.first_name', 'like', `%${doctor_search}%`)
        .orWhere('doctor_profiles.last_name', 'like', `%${doctor_search}%`);
    });
  }
  
  // Hastane arama - sadece hastane bilgilerinde
  if (hospital_search) {
    query.where('hospital_profiles.institution_name', 'like', `%${hospital_search}%`);
  }
  if (status) query.where('applications.status_id', status);
  if (job_id) query.where('applications.job_id', job_id);
  if (doctor_profile_id) query.where('applications.doctor_profile_id', doctor_profile_id);
  if (hospital_id) query.where('jobs.hospital_id', hospital_id);

  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('applications')
    .join('jobs', 'applications.job_id', 'jobs.id')
    .join('doctor_profiles', 'applications.doctor_profile_id', 'doctor_profiles.id')
    .join('hospital_profiles', 'jobs.hospital_id', 'hospital_profiles.id');

  if (search) {
    countQuery.where(function () {
      this.where('jobs.title', 'like', `%${search}%`)
        .orWhere('doctor_profiles.first_name', 'like', `%${search}%`)
        .orWhere('doctor_profiles.last_name', 'like', `%${search}%`)
        .orWhere('hospital_profiles.institution_name', 'like', `%${search}%`);
    });
  }
  
  // Doktor arama - sadece doktor bilgilerinde
  if (doctor_search) {
    countQuery.where(function () {
      this.where('doctor_profiles.first_name', 'like', `%${doctor_search}%`)
        .orWhere('doctor_profiles.last_name', 'like', `%${doctor_search}%`);
    });
  }
  
  // Hastane arama - sadece hastane bilgilerinde
  if (hospital_search) {
    countQuery.where('hospital_profiles.institution_name', 'like', `%${hospital_search}%`);
  }
  if (status) countQuery.where('applications.status_id', status);
  if (job_id) countQuery.where('applications.job_id', job_id);
  if (doctor_profile_id) countQuery.where('applications.doctor_profile_id', doctor_profile_id);
  if (hospital_id) countQuery.where('jobs.hospital_id', hospital_id);

  const [{ count }] = await countQuery.count('* as count');
  const apps = await query.limit(limit).offset(offset);

  return { 
    data: apps, 
    pagination: { 
      current_page: page,
      per_page: limit,
      total: parseInt(count), 
      total_pages: Math.ceil(count / limit)
    } 
  };
};

// ============================================================================
// KULLANICI DURUMU YÖNETİMİ
// ============================================================================

// Deprecated fonksiyon kaldırıldı - updateUserApproval kullanılmalı

/**
 * Kullanıcı onay durumunu günceller
 * Onay/red durumuna göre bildirim gönderir
 * 
 * @param {number} userId - Kullanıcı ID'si
 * @param {boolean} approved - Onay durumu
 * @param {string} [rejectionReason=null] - Red sebebi
 * @returns {boolean|null} İşlem başarılıysa true, kullanıcı bulunamazsa null
 * @throws {AppError} Admin hesabı değiştirilmeye çalışılırsa
 */
const updateUserApproval = async (userId, approved, rejectionReason = null) => {
  const user = await db('users').where('id', userId).first();
  if (!user) return null;

  // Admin hesabını koru
  if (user.role === 'admin') {
    throw new AppError('Admin hesabı değiştirilemez', 403);
  }

  await db('users').where('id', userId).update({
    is_approved: approved,
    updated_at: db.fn.now()
  });

  return true;
};

/**
 * Kullanıcı aktiflik durumunu günceller
 * Admin hesabı korunur, bildirim gönderilir
 * 
 * @param {number} userId - Kullanıcı ID'si
 * @param {boolean} isActive - Aktiflik durumu
 * @param {string} [reason=null] - Durum değişiklik sebebi
 * @returns {boolean|null} İşlem başarılıysa true, kullanıcı bulunamazsa null
 * @throws {AppError} Admin hesabı değiştirilmeye çalışılırsa
 */
const updateUserStatus = async (userId, isActive, reason = null) => {
  const user = await db('users').where('id', userId).first();
  if (!user) return null;

  // Admin hesabını koru
  if (user.role === 'admin') {
    throw new AppError('Admin hesabı değiştirilemez', 403);
  }

  const updateData = {
    is_active: isActive,
    updated_at: db.fn.now()
  };

  // Reason bilgisi şimdilik log'lanabilir, database'de alan yok

  await db('users').where('id', userId).update(updateData);

  return true;
};

// Duplicate fonksiyon kaldırıldı - updateUserApproval kullanılmalı

/**
 * Kullanıcıyı tamamen siler (Hard delete)
 * İlişkili tüm verileri (profil, token'lar) da siler
 * Transaction ile güvenli silme işlemi
 * 
 * @param {number} userId - Silinecek kullanıcı ID'si
 * @returns {boolean} İşlem başarılıysa true
 * @throws {AppError} Kullanıcı bulunamazsa
 */
const deleteUser = async (userId) => {
  const trx = await db.transaction();
  try {
    // Önce kullanıcının profilini sil
    const user = await trx('users').where('id', userId).first();
    if (!user) {
      await trx.rollback();
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    // Profil tablolarını sil
    if (user.role === 'doctor') {
      await trx('doctor_profiles').where('user_id', userId).del();
    } else if (user.role === 'hospital') {
      await trx('hospital_profiles').where('user_id', userId).del();
    }

    // Refresh token'ları sil
    await trx('refresh_tokens').where('user_id', userId).del();

    // Kullanıcıyı sil
    await trx('users').where('id', userId).del();

    await trx.commit();
    return true;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};



/**
 * Başvuru durumunu günceller
 * 
 * @param {number} applicationId - Başvuru ID'si
 * @param {number} statusId - Yeni durum ID'si (application_statuses.id)
 * @param {string} [reason=null] - Durum değişiklik sebebi
 * @returns {Object|null} Güncellenmiş başvuru bilgileri
 */
const updateApplicationStatus = async (applicationId, statusId, reason = null) => {
  const application = await db('applications').where('id', applicationId).first();
  if (!application) return null;

  await db('applications').where('id', applicationId).update({
    status_id: statusId,
    updated_at: db.fn.now()
  });

  // Güncellenmiş başvuruyu status adı ile birlikte getir
  const updatedApplication = await db('applications as a')
    .leftJoin('application_statuses as ast', 'a.status_id', 'ast.id')
    .where('a.id', applicationId)
    .select('a.*', 'ast.name as status_name')
    .first();

  return updatedApplication;
};

/**
 * Başvuruyu siler
 * 
 * @param {number} applicationId - Başvuru ID'si
 * @returns {boolean} İşlem başarılıysa true
 */
const deleteApplication = async (applicationId) => {
  const application = await db('applications').where('id', applicationId).first();
  if (!application) return false;

  await db('applications').where('id', applicationId).del();
  return true;
};

// ============================================================================
// İŞ İLANI DURUM YÖNETİMİ
// ============================================================================

/**
 * İş ilanını günceller
 * 
 * @param {number} jobId - Güncellenecek iş ilanı ID'si
 * @param {Object} jobData - Güncellenecek veriler
 * @returns {Object|null} Güncellenmiş iş ilanı, bulunamazsa null
 */
const updateJob = async (jobId, jobData) => {
  const job = await db('jobs').where('id', jobId).first();
  if (!job) return null;

  await db('jobs').where('id', jobId).update({
    ...jobData,
    updated_at: db.fn.now()
  });

  return await getJobDetails(jobId);
};

/**
 * İş ilanı durumunu günceller
 * 
 * @param {number} jobId - İş ilanı ID'si
 * @param {number} statusId - Yeni durum ID'si (job_statuses.id)
 * @param {string} [reason=null] - Durum değişiklik sebebi
 * @returns {boolean|null} İşlem başarılıysa true, ilan bulunamazsa null
 */
const updateJobStatus = async (jobId, statusId, reason = null) => {
  const job = await db('jobs').where('id', jobId).first();
  if (!job) return null;

  await db('jobs').where('id', jobId).update({
    status_id: statusId,
    updated_at: db.fn.now()
  });

  return true;
};

/**
 * İş ilanını siler (hard delete)
 * İlişkili başvuruları da CASCADE ile siler
 * 
 * @param {number} jobId - Silinecek iş ilanı ID'si
 * @returns {boolean|null} İşlem başarılıysa true, ilan bulunamazsa null
 */
const deleteJob = async (jobId) => {
  const job = await db('jobs').where('id', jobId).first();
  if (!job) return null;

  // Hard delete - CASCADE ile applications tablosundaki kayıtlar da silinir
  await db('jobs').where('id', jobId).del();

  return true;
};

/**
 * Başvuru detaylarını getirir
 * Doktor, iş ilanı, hastane bilgileri ve lookup table bilgileriyle birlikte döner
 * 
 * @param {number} applicationId - Başvuru ID'si
 * @returns {Object|null} Başvuru detayları
 */
const getApplicationDetails = async (applicationId) => {
  const application = await db('applications as a')
    .join('jobs as j', 'a.job_id', 'j.id')
    .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
    .join('users as u', 'dp.user_id', 'u.id')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('application_statuses as ast', 'a.status_id', 'ast.id')
    .where('a.id', applicationId)
    .select(
      'a.*',
      'j.id as job_id',
      'j.title as job_title',
      'j.description as job_description',
      'dp.first_name',
      'dp.last_name',
      'dp.phone',
      'dp.residence_city',
      'dp.profile_photo',
      'u.id as user_id',
      'u.email',
      'hp.institution_name',
      'ast.name as status'
    )
    .first();

  return application;
};

// ============================================================================
// BİLDİRİM İŞLEMLERİ
// ============================================================================

/**
 * İlan durumu değişikliği bildirimi gönderir
 * @description Admin tarafından ilan durumu değiştiğinde başvuru yapan doktorlara bildirim gönderir
 * @param {number} jobId - İş ilanı kimliği
 * @param {string} newStatus - Yeni ilan durumu
 * @param {string} oldStatus - Eski ilan durumu
 * @param {number} adminId - Admin kullanıcı ID'si
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendJobStatusChangeNotification(123, 'Pasif', 'Aktif', 1);
 */
const sendJobStatusChangeNotification = async (jobId, newStatus, oldStatus, adminId) => {
  try {
    // İlan bilgilerini al
    const job = await db('jobs as j')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .where('j.id', jobId)
      .select('j.title as job_title', 'hp.institution_name as hospital_name')
      .first();

    if (!job) {
      logger.warn(`Job ${jobId} not found for admin status change notification`);
      return { sent_count: 0 };
    }

    // Bu ilana başvuru yapan doktorları al
    const applications = await db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .where('a.job_id', jobId)
      .where('a.status_id', '!=', 5) // withdrawn değil
      .select('u.id as user_id', 'u.first_name', 'u.last_name');

    if (applications.length === 0) {
      logger.info(`No applications found for job ${jobId} admin status change notification`);
      return { sent_count: 0 };
    }

    // Her doktora bildirim gönder
    let sentCount = 0;
    for (const application of applications) {
      try {
        await notificationService.sendNotification({
          user_id: application.user_id,
          type: newStatus === 'Pasif' ? 'warning' : 'info',
          title: 'İlan Durumu Değişti',
          body: `${job.hospital_name} hastanesindeki ${job.job_title} pozisyonu için ilan durumu "${oldStatus}" → "${newStatus}" olarak değiştirildi.`,
          data: {
            job_id: jobId,
            job_title: job.job_title,
            hospital_name: job.hospital_name,
            old_status: oldStatus,
            new_status: newStatus,
            changed_by: 'admin',
            admin_id: adminId
          }
        });
        sentCount++;
      } catch (error) {
        logger.warn(`Failed to send admin job status notification to user ${application.user_id}:`, error);
      }
    }

    logger.info(`Admin job status change notification sent to ${sentCount} doctors for job ${jobId} by admin ${adminId}`);
    return { sent_count: sentCount };
  } catch (error) {
    logger.error('Admin job status change notification failed:', error);
    throw error;
  }
};


// ============================================================================
// ANALYTICS & DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Admin dashboard verilerini getirir
 * Sistem geneli istatistikler ve trendler
 * 
 * @param {Object} query - Query parametreleri
 * @returns {Object} Dashboard verileri
 */

const getDashboardData = async (query = {}) => {
  try {
    const { period = 'month', startDate, endDate } = query;
    
    // Temel istatistikler
    const [
      totalUsers,
      totalDoctors,
      totalHospitals,
      totalJobs,
      totalApplications,
      pendingApprovals
    ] = await Promise.all([
      db.raw('SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND role != ?', ['admin']),
      db.raw('SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1', ['doctor']),
      db.raw('SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1', ['hospital']),
      db.raw('SELECT COUNT(*) as count FROM jobs'),
      db.raw('SELECT COUNT(*) as count FROM applications'),
      db.raw('SELECT COUNT(*) as count FROM users WHERE is_approved = 0 AND is_active = 1 AND role != ?', ['admin'])
    ]);

    return {
      overview: {
        totalUsers: totalUsers[0].count,
        totalDoctors: totalDoctors[0].count,
        totalHospitals: totalHospitals[0].count,
        totalJobs: totalJobs[0].count,
        totalApplications: totalApplications[0].count,
        pendingApprovals: pendingApprovals[0].count
      },
      period,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Dashboard data fetch error:', error);
    throw new AppError('Dashboard verileri getirilemedi', 500);
  }
};





// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ
// ============================================================================

/**
 * Fotoğraf onay taleplerini getirir
 * @description Admin için bekleyen fotoğraf onay taleplerini listeler
 * @param {Object} filters - Filtreleme parametreleri
 * @param {string} [filters.status='pending'] - Talep durumu (pending, approved, rejected)
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=20] - Sayfa başına kayıt sayısı
 * @returns {Promise<Object>} Talep listesi ve sayfalama bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const requests = await getPhotoRequests({ status: 'pending', page: 1, limit: 10 });
 */
const getPhotoRequests = async (filters = {}) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    
    // Toplam kayıt sayısı için ayrı query
    let countQuery = db('doctor_profile_photo_requests as dppr');
    
    if (status) {
      countQuery = countQuery.where('dppr.status', status);
    }
    
    const totalResult = await countQuery.count('dppr.id as count').first();
    const total = totalResult.count;
  
    // Basit query - JOIN'siz test
    let dataQuery = db('doctor_profile_photo_requests as dppr')
      .select(
        'dppr.id',
        'dppr.doctor_profile_id',
        'dppr.file_url',
        'dppr.old_photo',
        'dppr.status',
        'dppr.reason',
        'dppr.created_at',
        'dppr.reviewed_at',
        'dppr.reviewed_by'
      );
    
    if (status) {
      dataQuery = dataQuery.where('dppr.status', status);
    }
    
    const requests = await dataQuery
      .orderBy('dppr.id', 'desc')
      .limit(limit);
    
    // Sonuçları zenginleştir (her kayıt için doktor bilgilerini al)
    for (const request of requests) {
      const profile = await db('doctor_profiles')
        .where('id', request.doctor_profile_id)
        .first();
      
      if (profile) {
        const user = await db('users').where('id', profile.user_id).first();
        request.first_name = profile.first_name;
        request.last_name = profile.last_name;
        request.title = profile.title;
        request.email = user?.email;
        // old_photo artık talep kaydında mevcut (talep oluşturulduğu andaki fotoğraf)
      }
      
      if (request.reviewed_by) {
        const reviewer = await db('users').where('id', request.reviewed_by).first();
        request.reviewer_first_name = reviewer?.first_name;
        request.reviewer_last_name = reviewer?.last_name;
      }
    }
    
    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('getPhotoRequests error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });
    throw new AppError('Fotoğraf talepleri getirilemedi: ' + error.message, 500);
  }
};

/**
 * Fotoğraf talebini onayla veya reddet
 * @description Admin fotoğraf talebini onaylar veya reddeder
 * @param {number} adminUserId - Admin kullanıcı ID'si
 * @param {number} requestId - Talep ID'si
 * @param {string} action - İşlem ('approve' veya 'reject')
 * @param {string} [reason] - Red nedeni (reject için zorunlu)
 * @returns {Promise<Object>} Güncellenmiş talep kaydı
 * @throws {AppError} Talep bulunamadığında veya geçersiz işlem durumunda
 * 
 * @example
 * const result = await reviewPhotoRequest(1, 5, 'approve');
 * const result = await reviewPhotoRequest(1, 5, 'reject', 'Uygunsuz içerik');
 */
const reviewPhotoRequest = async (adminUserId, requestId, action, reason = null) => {
  if (!['approve', 'reject'].includes(action)) {
    throw new AppError('Geçersiz işlem', 400);
  }
  
  if (action === 'reject' && !reason) {
    throw new AppError('Red nedeni zorunludur', 400);
  }
  
  // Talebi getir
  const request = await db('doctor_profile_photo_requests')
    .where({ id: requestId, status: 'pending' })
    .first();
  
  if (!request) {
    throw new AppError('Bekleyen talep bulunamadı', 404);
  }
  
  let updateData = {
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewed_at: db.raw('SYSUTCDATETIME()'),
    reviewed_by: adminUserId
  };
  
  if (action === 'reject') {
    updateData.reason = reason;
  }
  
  // Talebi güncelle
  await db('doctor_profile_photo_requests')
    .where('id', requestId)
    .update(updateData);
  
  logger.info(`Photo request ${requestId} updated to status: ${updateData.status}`);
  
  // Eğer onaylandıysa, doktor profilindeki fotoğrafı güncelle
  if (action === 'approve') {
    await db('doctor_profiles')
      .where('id', request.doctor_profile_id)
      .update({ 
        profile_photo: request.file_url,
        updated_at: db.raw('SYSUTCDATETIME()')
      });
    logger.info(`Doctor profile ${request.doctor_profile_id} photo updated`);
  } else {
    logger.info(`Photo request ${requestId} rejected with reason: ${reason}`);
  }
  
  // Doktora bildirim gönder
  try {
    const doctorProfile = await db('doctor_profiles')
      .where('id', request.doctor_profile_id)
      .first();
    
    if (doctorProfile) {
      const notificationTitle = action === 'approve' 
        ? 'Profil Fotoğrafı Onaylandı' 
        : 'Profil Fotoğrafı Reddedildi';
      
      const notificationBody = action === 'approve'
        ? 'Profil fotoğrafınız admin tarafından onaylandı ve profilinizde güncellendi.'
        : `Profil fotoğrafınız reddedildi. ${reason ? `Sebep: ${reason}` : ''}`;
      
      await notificationService.sendNotification({
        user_id: doctorProfile.user_id,
        type: action === 'approve' ? 'success' : 'warning',
        title: notificationTitle,
        body: notificationBody,
        data: {
          request_id: requestId,
          action: action
        }
      });
    }
  } catch (notificationError) {
    logger.warn('Photo review notification failed:', notificationError);
  }
  
  // Güncellenmiş talebi döndür
  return await db('doctor_profile_photo_requests')
    .where('id', requestId)
    .first();
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * AdminService modülü
 * Tüm admin işlemleri için gerekli fonksiyonları export eder
 */
module.exports = {
  getUsers,
  getUserDetails,
  updateUserApproval,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  getJobDetails,
  updateJob,
  updateJobStatus,
  deleteJob,
  getAllApplications,
  getApplicationDetails,
  updateApplicationStatus,
  deleteApplication,
  
  // Bildirim işlemleri
  sendJobStatusChangeNotification,
  
  // Fotoğraf onay sistemi (yeni sistem)
  getPhotoRequests,
  reviewPhotoRequest,
  
  // Analytics functions
  getDashboardData
};
