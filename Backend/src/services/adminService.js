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
 * @param {string} [filters.search] - Genel arama terimi (email için)
 * @param {string} [filters.email_search] - E-posta arama terimi
 * @param {string} [filters.doctor_search] - Doktor arama terimi (ad, soyad)
 * @param {string} [filters.hospital_search] - Hastane arama terimi (kurum adı)
 * @param {number} [filters.specialty_id] - Uzmanlık alanı ID'si (doktorlar için)
 * @param {number} [filters.subspecialty_id] - Yan dal uzmanlık ID'si (doktorlar için)
 * @param {number} [filters.city_id] - Şehir ID'si
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Object} Kullanıcı listesi ve sayfalama bilgileri
 */
const getUsers = async (filters = {}) => {
  const { 
    role, 
    isApproved, 
    isActive, 
    search, 
    email_search, 
    doctor_search,
    hospital_search,
    specialty_id,
    subspecialty_id,
    city_id,
    page = 1, 
    limit = 10 
  } = filters;
  
  // Debug logs removed
  
  let query = db('users')
    .leftJoin('doctor_profiles', 'users.id', 'doctor_profiles.user_id')
    .leftJoin('hospital_profiles', 'users.id', 'hospital_profiles.user_id');
  
  // Doktorlar için specialty ve subspecialty join'leri
  if (role === 'doctor' || specialty_id || subspecialty_id) {
    query = query.leftJoin('specialties as s', 'doctor_profiles.specialty_id', 's.id')
                 .leftJoin('subspecialties as ss', 'doctor_profiles.subspecialty_id', 'ss.id')
                 .leftJoin('cities as dc', 'doctor_profiles.residence_city_id', 'dc.id');
  }
  
  // Hastaneler için city join
  if (role === 'hospital' || (city_id && role !== 'doctor')) {
    query = query.leftJoin('cities as hc', 'hospital_profiles.city_id', 'hc.id');
  }
  
  query = query.select(
    'users.*',
    'doctor_profiles.first_name',
    'doctor_profiles.last_name',
    'doctor_profiles.specialty_id',
    'doctor_profiles.subspecialty_id',
    'doctor_profiles.residence_city_id',
    'hospital_profiles.institution_name',
    'hospital_profiles.city_id as hospital_city_id'
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
  
  // Doktor filtreleri
  if (role === 'doctor' || doctor_search || specialty_id || subspecialty_id || (city_id && role !== 'hospital')) {
    if (specialty_id) {
      query.where('doctor_profiles.specialty_id', specialty_id);
    }
    if (subspecialty_id) {
      query.where('doctor_profiles.subspecialty_id', subspecialty_id);
    }
    if (city_id && role !== 'hospital') {
      query.where('doctor_profiles.residence_city_id', city_id);
    }
    if (doctor_search) {
      query.where(function() {
        const searchTerm = doctor_search.trim();
        const searchParts = searchTerm.split(/\s+/).filter(part => part.length > 0);
        
        if (searchParts.length > 1) {
          // Birden fazla kelime varsa: "Ad Soyad" şeklinde
          // Hem birleşik arama (CONCAT) hem de ayrı ayrı arama yap
          this.where(function() {
            // Birleşik arama: "Ad Soyad" tam eşleşmesi
            this.whereRaw(`CONCAT(doctor_profiles.first_name, ' ', doctor_profiles.last_name) LIKE ?`, [`%${searchTerm}%`])
                // Veya: Ad kısmında ilk kelime, Soyad kısmında ikinci kelime
                .orWhere(function() {
                  this.where('doctor_profiles.first_name', 'like', `%${searchParts[0]}%`)
                      .where('doctor_profiles.last_name', 'like', `%${searchParts[searchParts.length - 1]}%`);
                });
          })
          // Veya: Sadece ad veya sadece soyad içinde arama
          .orWhere('doctor_profiles.first_name', 'like', `%${searchTerm}%`)
          .orWhere('doctor_profiles.last_name', 'like', `%${searchTerm}%`);
        } else {
          // Tek kelime varsa: Ad veya soyad içinde ara
          this.where('doctor_profiles.first_name', 'like', `%${searchTerm}%`)
              .orWhere('doctor_profiles.last_name', 'like', `%${searchTerm}%`);
        }
      });
    }
  }
  
  // Hastane filtreleri
  if (role === 'hospital' || hospital_search || (city_id && role !== 'doctor')) {
    if (hospital_search) {
      query.where('hospital_profiles.institution_name', 'like', `%${hospital_search}%`);
    }
    if (city_id && role !== 'doctor') {
      query.where('hospital_profiles.city_id', city_id);
    }
  }
  
  // Genel arama sorgusu (email)
  if (search) query.where('users.email', 'like', `%${search}%`);
  
  // E-posta arama - sadece e-posta alanında
  if (email_search) query.where('users.email', 'like', `%${email_search}%`);
  
  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  let countQuery = db('users')
    .leftJoin('doctor_profiles', 'users.id', 'doctor_profiles.user_id')
    .leftJoin('hospital_profiles', 'users.id', 'hospital_profiles.user_id');
  
  // Doktorlar için specialty ve subspecialty join'leri
  if (role === 'doctor' || specialty_id || subspecialty_id) {
    countQuery = countQuery.leftJoin('specialties as s', 'doctor_profiles.specialty_id', 's.id')
                          .leftJoin('subspecialties as ss', 'doctor_profiles.subspecialty_id', 'ss.id')
                          .leftJoin('cities as dc', 'doctor_profiles.residence_city_id', 'dc.id');
  }
  
  // Hastaneler için city join
  if (role === 'hospital' || (city_id && role !== 'doctor')) {
    countQuery = countQuery.leftJoin('cities as hc', 'hospital_profiles.city_id', 'hc.id');
  }
  
  // Admin kullanıcılarını filtrele (admin kendi kendini yönetmesin)
  countQuery.where('users.role', '!=', 'admin');
  
  if (role) countQuery.where('users.role', role);
  if (isApproved !== undefined && isApproved !== '') {
    const approvedValue = isApproved === 'true' || isApproved === true ? 1 : 0;
    countQuery.where('users.is_approved', approvedValue);
  }
  if (isActive !== undefined && isActive !== '') {
    const activeValue = isActive === 'true' || isActive === true ? 1 : 0;
    countQuery.where('users.is_active', activeValue);
  }
  
  // Doktor filtreleri
  if (role === 'doctor' || doctor_search || specialty_id || subspecialty_id || (city_id && role !== 'hospital')) {
    if (specialty_id) {
      countQuery.where('doctor_profiles.specialty_id', specialty_id);
    }
    if (subspecialty_id) {
      countQuery.where('doctor_profiles.subspecialty_id', subspecialty_id);
    }
    if (city_id && role !== 'hospital') {
      countQuery.where('doctor_profiles.residence_city_id', city_id);
    }
    if (doctor_search) {
      countQuery.where(function() {
        const searchTerm = doctor_search.trim();
        const searchParts = searchTerm.split(/\s+/).filter(part => part.length > 0);
        
        if (searchParts.length > 1) {
          // Birden fazla kelime varsa: "Ad Soyad" şeklinde
          // Hem birleşik arama (CONCAT) hem de ayrı ayrı arama yap
          this.where(function() {
            // Birleşik arama: "Ad Soyad" tam eşleşmesi
            this.whereRaw(`CONCAT(doctor_profiles.first_name, ' ', doctor_profiles.last_name) LIKE ?`, [`%${searchTerm}%`])
                // Veya: Ad kısmında ilk kelime, Soyad kısmında ikinci kelime
                .orWhere(function() {
                  this.where('doctor_profiles.first_name', 'like', `%${searchParts[0]}%`)
                      .where('doctor_profiles.last_name', 'like', `%${searchParts[searchParts.length - 1]}%`);
                });
          })
          // Veya: Sadece ad veya sadece soyad içinde arama
          .orWhere('doctor_profiles.first_name', 'like', `%${searchTerm}%`)
          .orWhere('doctor_profiles.last_name', 'like', `%${searchTerm}%`);
        } else {
          // Tek kelime varsa: Ad veya soyad içinde ara
          this.where('doctor_profiles.first_name', 'like', `%${searchTerm}%`)
              .orWhere('doctor_profiles.last_name', 'like', `%${searchTerm}%`);
        }
      });
    }
  }
  
  // Hastane filtreleri
  if (role === 'hospital' || hospital_search || (city_id && role !== 'doctor')) {
    if (hospital_search) {
      countQuery.where('hospital_profiles.institution_name', 'like', `%${hospital_search}%`);
    }
    if (city_id && role !== 'doctor') {
      countQuery.where('hospital_profiles.city_id', city_id);
    }
  }
  
  // Genel arama sorgusu (email)
  if (search) countQuery.where('users.email', 'like', `%${search}%`);
  
  // E-posta arama - sadece e-posta alanında
  if (email_search) countQuery.where('users.email', 'like', `%${email_search}%`);
  
  const [{ count }] = await countQuery.count('* as count');
  const users = await query
    .orderBy('users.created_at', 'desc')
    .limit(limit)
    .offset(offset);
  
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
  // MSSQL uyumluluğu için .first() yerine array indexing kullanıyoruz
  const userResult = await db('users').where('id', id);
  const user = Array.isArray(userResult) && userResult.length > 0 ? userResult[0] : (userResult || null);
  if (!user) return null;
  
  // Role'e göre profil bilgilerini getir
  if (user.role === 'doctor') {
    // Profil bilgilerini şehir isimleriyle birlikte getir
    const profileResult = await db('doctor_profiles as dp')
      .leftJoin('cities as bp', 'dp.birth_place_id', 'bp.id')
      .leftJoin('cities as rc', 'dp.residence_city_id', 'rc.id')
      .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
      .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
      .where('dp.user_id', id)
      .select(
        'dp.*',
        'bp.name as birth_place_name',
        'rc.name as residence_city_name',
        's.name as specialty_name',
        'ss.name as subspecialty_name'
      );
    
    // Array döndüğü için [0] ile alıyoruz
    const profile = Array.isArray(profileResult) && profileResult.length > 0 ? profileResult[0] : (profileResult || null);
    
    let specialty_name = profile?.specialty_name;
    let subspecialty_name = profile?.subspecialty_name;
    
    // Doktor için ek bilgileri getir - lookup tablolarıyla JOIN (Soft delete kontrolü ile)
    const [educations, experiences, certificates, languages] = await Promise.all([
      // Eğitim bilgileri - education_type lookup
      db('doctor_educations as de')
        .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
        .where('de.doctor_profile_id', profile?.id || 0)
        .whereNull('de.deleted_at')
        .select('de.*', 'det.name as education_type_name'),
      
      // Deneyim bilgileri - specialty ve subspecialty lookup
      db('doctor_experiences as dex')
        .leftJoin('specialties as s', 'dex.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'dex.subspecialty_id', 'ss.id')
        .where('dex.doctor_profile_id', profile?.id || 0)
        .whereNull('dex.deleted_at')
        .select('dex.*', 's.name as specialty_name', 'ss.name as subspecialty_name'),
      
      // Sertifika bilgileri
      db('doctor_certificates as dc')
        .where('dc.doctor_profile_id', profile?.id || 0)
        .whereNull('dc.deleted_at')
        .select('dc.*'),
      
      // Dil bilgileri - language ve level lookup
      db('doctor_languages as dl')
        .leftJoin('languages as l', 'dl.language_id', 'l.id')
        .leftJoin('language_levels as ll', 'dl.level_id', 'll.id')
        .where('dl.doctor_profile_id', profile?.id || 0)
        .whereNull('dl.deleted_at')
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
    // Profil verilerini users ve cities ile zenginleştir
    const profileResult = await db('hospital_profiles as hp')
      .leftJoin('users as u', 'hp.user_id', 'u.id')
      .leftJoin('cities as c', 'hp.city_id', 'c.id')
      .where('hp.user_id', id)
      .select(
        'hp.*',
        'u.email',
        db.raw('ISNULL(c.name, \'\') as city')
      );
    
    // Array döndüğü için [0] ile alıyoruz
    const profile = Array.isArray(profileResult) && profileResult.length > 0 ? profileResult[0] : (profileResult || null);

    // Departman/İletişim tabloları bu şemada yok; boş dizi döndür
    const departments = [];
    const contacts = [];

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
  const { search, title_search, hospital_search, status, hospital_id, specialty_id, subspecialty_id, city_id, page = 1, limit = 10 } = filters;

  let query = db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .join('job_statuses as js', 'j.status_id', 'js.id')
    .join('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarını gösterme
    .where('hospital_users.is_active', true) // Pasifleştirilmiş hastanelerin iş ilanlarını gösterme
    .select(
      'j.*', 
      'hp.institution_name', 
      'js.name as status',
      's.name as specialty',
      'ss.name as subspecialty',
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
  if (specialty_id) query.where('j.specialty_id', specialty_id);
  if (subspecialty_id) query.where('j.subspecialty_id', subspecialty_id);
  if (city_id) query.where('j.city_id', city_id);

  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarını sayma
    .where('hospital_users.is_active', true); // Pasifleştirilmiş hastanelerin iş ilanlarını sayma
  
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
  if (specialty_id) countQuery.where('j.specialty_id', specialty_id);
  if (subspecialty_id) countQuery.where('j.subspecialty_id', subspecialty_id);
  if (city_id) countQuery.where('j.city_id', city_id);
  
  const [{ count }] = await countQuery.count('* as count');
  const jobs = await query
    .orderBy('j.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  // Başvuru sayılarını ekle (liste için - silinmiş ve geri çekilen başvurular hariç)
  if (jobs.length > 0) {
    const jobIds = jobs.map(job => job.id);
    const applicationCounts = await db('applications')
      .whereIn('job_id', jobIds)
      .where('status_id', '!=', 5) // Geri çekilen başvuruları sayma
      .whereNull('deleted_at') // Soft delete: Silinmiş başvuruları sayma
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
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .where('j.id', jobId)
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanını gösterme
    .select(
      'j.*',
      'hp.institution_name',
      'hp.phone',
      'js.name as status',
      's.name as specialty',
      'c.name as city',
      'ss.name as subspecialty_name'
    )
    .first();

  if (!job) return null;
  
  const [{ admin_revision_count }] = await db('job_history as jh')
    .join('users as u', 'jh.changed_by', 'u.id')
    .where('jh.job_id', jobId)
    .where('jh.new_status_id', 2) // Revizyon Gerekli durumuna geçişler
    .where('u.role', 'admin')
    .count({ admin_revision_count: '*' });

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
  
  // Başvuru sayısını al (Geri çekilenler ve silinmişler hariç)
  const [{ count }] = await db('applications')
    .where('job_id', jobId)
    .where('status_id', '!=', 5) // Geri çekilen başvuruları sayma
    .whereNull('deleted_at') // Soft delete: Silinmiş başvuruları sayma
    .count('* as count');
    
  const revisionCount = parseInt(admin_revision_count, 10) || 0;
    
  return { ...job, revision_count: revisionCount, application_count: parseInt(count) || 0 };
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
  let query = db('applications as a')
    .join('jobs as j', 'a.job_id', 'j.id')
    .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('users as doctor_users', 'dp.user_id', 'doctor_users.id')
    .join('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .join('application_statuses as ast', 'a.status_id', 'ast.id')
    .leftJoin('cities as residence_city', 'dp.residence_city_id', 'residence_city.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme
    .where('hospital_users.is_active', true) // Pasifleştirilmiş hastanelerin iş ilanlarını gösterme
    .select(
      'a.*',
      'j.title as job_title',
      'j.status_id as job_status_id',
      'js.name as job_status',
      's.name as job_specialty',
      'dp.first_name',
      'dp.last_name',
      'dp.specialty_id as doctor_specialty_id',
      'doctor_users.is_active as doctor_is_active',
      'residence_city.name as residence_city_name',
      'hp.institution_name',
      'ast.name as status'
    );

  if (search) {
    query.where(function () {
      this.where('j.title', 'like', `%${search}%`)
        .orWhere('dp.first_name', 'like', `%${search}%`)
        .orWhere('dp.last_name', 'like', `%${search}%`)
        .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }
  
  // Doktor arama - sadece doktor bilgilerinde
  if (doctor_search) {
    query.where(function () {
      const searchTerm = doctor_search.trim();
      const searchParts = searchTerm.split(/\s+/).filter(part => part.length > 0);
      
      if (searchParts.length > 1) {
        // Birden fazla kelime varsa: "Ad Soyad" şeklinde
        // Hem birleşik arama (CONCAT) hem de ayrı ayrı arama yap
        this.where(function() {
          // Birleşik arama: "Ad Soyad" tam eşleşmesi
          this.whereRaw(`CONCAT(dp.first_name, ' ', dp.last_name) LIKE ?`, [`%${searchTerm}%`])
              // Veya: Ad kısmında ilk kelime, Soyad kısmında ikinci kelime
              .orWhere(function() {
                this.where('dp.first_name', 'like', `%${searchParts[0]}%`)
                    .where('dp.last_name', 'like', `%${searchParts[searchParts.length - 1]}%`);
              });
        })
        // Veya: Sadece ad veya sadece soyad içinde arama
        .orWhere('dp.first_name', 'like', `%${searchTerm}%`)
        .orWhere('dp.last_name', 'like', `%${searchTerm}%`);
      } else {
        // Tek kelime varsa: Ad veya soyad içinde ara
        this.where('dp.first_name', 'like', `%${searchTerm}%`)
            .orWhere('dp.last_name', 'like', `%${searchTerm}%`);
      }
    });
  }
  
  // Hastane arama - sadece hastane bilgilerinde
  if (hospital_search) {
    query.where('hp.institution_name', 'like', `%${hospital_search}%`);
  }
  if (status) query.where('a.status_id', status);
  if (job_id) query.where('a.job_id', job_id);
  if (doctor_profile_id) query.where('a.doctor_profile_id', doctor_profile_id);
  if (hospital_id) query.where('j.hospital_id', hospital_id);

  const offset = (page - 1) * limit;
  
  // Count sorgusunu ayrı yap
  const countQuery = db('applications as a')
    .join('jobs as j', 'a.job_id', 'j.id')
    .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .join('users as doctor_users', 'dp.user_id', 'doctor_users.id')
    .join('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .join('application_statuses as ast', 'a.status_id', 'ast.id')
    .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları sayma
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları sayma
    .where('hospital_users.is_active', true) // Pasifleştirilmiş doktorların başvurularını sayma
    .where('hospital_users.is_active', true); // Pasifleştirilmiş hastanelerin iş ilanlarını sayma

  if (search) {
    countQuery.where(function () {
      this.where('j.title', 'like', `%${search}%`)
        .orWhere('dp.first_name', 'like', `%${search}%`)
        .orWhere('dp.last_name', 'like', `%${search}%`)
        .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }
  
  // Doktor arama - sadece doktor bilgilerinde
  if (doctor_search) {
    countQuery.where(function () {
      const searchTerm = doctor_search.trim();
      const searchParts = searchTerm.split(/\s+/).filter(part => part.length > 0);
      
      if (searchParts.length > 1) {
        // Birden fazla kelime varsa: "Ad Soyad" şeklinde
        // Hem birleşik arama (CONCAT) hem de ayrı ayrı arama yap
        this.where(function() {
          // Birleşik arama: "Ad Soyad" tam eşleşmesi
          this.whereRaw(`CONCAT(dp.first_name, ' ', dp.last_name) LIKE ?`, [`%${searchTerm}%`])
              // Veya: Ad kısmında ilk kelime, Soyad kısmında ikinci kelime
              .orWhere(function() {
                this.where('dp.first_name', 'like', `%${searchParts[0]}%`)
                    .where('dp.last_name', 'like', `%${searchParts[searchParts.length - 1]}%`);
              });
        })
        // Veya: Sadece ad veya sadece soyad içinde arama
        .orWhere('dp.first_name', 'like', `%${searchTerm}%`)
        .orWhere('dp.last_name', 'like', `%${searchTerm}%`);
      } else {
        // Tek kelime varsa: Ad veya soyad içinde ara
        this.where('dp.first_name', 'like', `%${searchTerm}%`)
            .orWhere('dp.last_name', 'like', `%${searchTerm}%`);
      }
    });
  }
  
  // Hastane arama - sadece hastane bilgilerinde
  if (hospital_search) {
    countQuery.where('hp.institution_name', 'like', `%${hospital_search}%`);
  }
  if (status) countQuery.where('a.status_id', status);
  if (job_id) countQuery.where('a.job_id', job_id);
  if (doctor_profile_id) countQuery.where('a.doctor_profile_id', doctor_profile_id);
  if (hospital_id) countQuery.where('j.hospital_id', hospital_id);

  const [{ count }] = await countQuery.count('* as count');
  // MSSQL OFFSET/FETCH için ORDER BY zorunlu
  query.orderBy([{ column: 'a.applied_at', order: 'desc' }, { column: 'a.id', order: 'desc' }]);
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
 * Kullanıcıyı pasifleştirir (Soft delete)
 * Kullanıcı giriş yapamaz, verileri görünmez ama silinmez
 * 
 * @param {number} userId - Pasifleştirilecek kullanıcı ID'si
 * @returns {boolean} İşlem başarılıysa true
 * @throws {AppError} Kullanıcı bulunamazsa
 */
const deactivateUser = async (userId) => {
  try {
    // Önce kullanıcının profilini kontrol et
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    // Admin hesabını koru
    if (user.role === 'admin') {
      throw new AppError('Admin hesabı pasifleştirilemez', 403);
    }

    // Kullanıcıyı pasifleştir
    await db('users').where('id', userId).update({
      is_active: false,
      updated_at: db.fn.now()
    });

    // Refresh token'ları temizle (güvenlik için)
    await db('refresh_tokens').where('user_id', userId).del();

    return true;
  } catch (error) {
    logger.error('Deactivate user error:', error);
    throw error;
  }
};

/**
 * Kullanıcıyı yeniden aktifleştirir
 * 
 * @param {number} userId - Aktifleştirilecek kullanıcı ID'si
 * @returns {boolean} İşlem başarılıysa true
 * @throws {AppError} Kullanıcı bulunamazsa
 */
const activateUser = async (userId) => {
  try {
    // Önce kullanıcının profilini kontrol et
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    // Kullanıcıyı aktifleştir
    await db('users').where('id', userId).update({
      is_active: true,
      updated_at: db.fn.now()
    });

    return true;
  } catch (error) {
    logger.error('Activate user error:', error);
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

  // Not: applied_at güncellenmez - bu ilk başvuru tarihi olarak kalır
  // Sadece status_id ve updated_at güncellenir
  await db('applications').where('id', applicationId).update({
    status_id: statusId,
    updated_at: db.fn.now()
    // applied_at değiştirilmez - ilk başvuru tarihi korunur
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
 * @param {number} adminId - Admin kullanıcı ID'si
 * @param {string} [reason=null] - Durum değişiklik sebebi
 * @returns {Promise<Object|null>} Güncellenmiş iş ilanı, bulunamazsa null
 */
const updateJobStatus = async (jobId, statusId, adminId, reason = null) => {
  const job = await db('jobs').where('id', jobId).first();
  if (!job) return null;

  const oldStatusId = job.status_id;

  // Durumu güncelle
  await db('jobs').where('id', jobId).update({
    status_id: statusId,
    updated_at: db.fn.now()
  });

  // Job history kaydı oluştur
  await db('job_history').insert({
    job_id: jobId,
    old_status_id: oldStatusId,
    new_status_id: statusId,
    changed_by: adminId,
    note: reason || `Durum manuel olarak değiştirildi: ${oldStatusId} → ${statusId}`,
    changed_at: db.fn.now()
  });

  return await getJobDetails(jobId);
};

/**
 * İş ilanını onaylar
 * 
 * @param {number} jobId - İş ilanı ID'si
 * @param {number} adminId - Admin kullanıcı ID'si
 * @returns {Promise<Object|null>} Güncellenmiş iş ilanı, bulunamazsa null
 */
const approveJob = async (jobId, adminId) => {
  try {
    const job = await db('jobs').where('id', jobId).first();
    if (!job) return null;

    const oldStatusId = job.status_id;

    // İlanı Onaylandı durumuna getir
    await db('jobs').where('id', jobId).update({
      status_id: 3, // Onaylandı
      approved_at: db.fn.now(),
      published_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    // Job history kaydı oluştur
    await db('job_history').insert({
      job_id: jobId,
      old_status_id: oldStatusId,
      new_status_id: 3,
      changed_by: adminId,
      note: 'İlan admin tarafından onaylandı',
      changed_at: db.fn.now()
    });

    // Hastaneye bildirim gönder
    try {
      const hospitalProfile = await db('jobs as j')
        .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .where('j.id', jobId)
        .select('hp.user_id', 'hp.institution_name', 'j.title')
        .first();

      if (hospitalProfile) {
        await notificationService.sendNotification({
          user_id: hospitalProfile.user_id,
          type: 'success',
          title: 'İlan Onaylandı',
          body: `${hospitalProfile.institution_name} hastanesindeki "${hospitalProfile.title}" ilanı onaylandı ve yayına alındı.`,
          data: {
            job_id: jobId,
            job_title: hospitalProfile.title,
            status: 'approved'
          }
        });
      }
    } catch (notificationError) {
      logger.warn('Job approval notification failed:', notificationError);
    }

    return await getJobDetails(jobId);
  } catch (error) {
    logger.error('Approve job error:', error);
    throw error;
  }
};

/**
 * İş ilanı için revizyon talep eder
 * 
 * @param {number} jobId - İş ilanı ID'si
 * @param {number} adminId - Admin kullanıcı ID'si
 * @param {string} revisionNote - Revizyon notu
 * @returns {Promise<Object|null>} Güncellenmiş iş ilanı, bulunamazsa null
 */
const requestRevision = async (jobId, adminId, revisionNote) => {
  try {
    const job = await db('jobs').where('id', jobId).first();
    if (!job) return null;

    if (!revisionNote || revisionNote.trim() === '') {
      throw new AppError('Revizyon notu zorunludur', 400);
    }

    const oldStatusId = job.status_id;

    // İlanı Revizyon Gerekli durumuna getir
    await db('jobs').where('id', jobId).update({
      status_id: 2, // Revizyon Gerekli
      revision_note: revisionNote,
      revision_count: db.raw('revision_count + 1'),
      updated_at: db.fn.now()
    });

    // Job history kaydı oluştur
    await db('job_history').insert({
      job_id: jobId,
      old_status_id: oldStatusId,
      new_status_id: 2,
      changed_by: adminId,
      note: revisionNote,
      changed_at: db.fn.now()
    });

    // Hastaneye bildirim gönder
    try {
      const hospitalProfile = await db('jobs as j')
        .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .where('j.id', jobId)
        .select('hp.user_id', 'hp.institution_name', 'j.title')
        .first();

      if (hospitalProfile) {
        await notificationService.sendNotification({
          user_id: hospitalProfile.user_id,
          type: 'warning',
          title: 'İlan Revizyon Gerektiriyor',
          body: `${hospitalProfile.institution_name} hastanesindeki "${hospitalProfile.title}" ilanı için revizyon talebi var.`,
          data: {
            job_id: jobId,
            job_title: hospitalProfile.title,
            revision_note: revisionNote,
            status: 'needs_revision'
          }
        });
      }
    } catch (notificationError) {
      logger.warn('Job revision notification failed:', notificationError);
    }

    return await getJobDetails(jobId);
  } catch (error) {
    logger.error('Request revision error:', error);
    throw error;
  }
};

/**
 * İş ilanını reddeder
 * 
 * @param {number} jobId - İş ilanı ID'si
 * @param {number} adminId - Admin kullanıcı ID'si
 * @param {string} [rejectionReason=null] - Red sebebi
 * @returns {Promise<Object|null>} Güncellenmiş iş ilanı, bulunamazsa null
 */
const rejectJob = async (jobId, adminId, rejectionReason = null) => {
  try {
    const job = await db('jobs').where('id', jobId).first();
    if (!job) return null;

    const oldStatusId = job.status_id;

    // İlanı Reddedildi durumuna getir
    await db('jobs').where('id', jobId).update({
      status_id: 5, // Reddedildi
      updated_at: db.fn.now()
    });

    // Job history kaydı oluştur
    await db('job_history').insert({
      job_id: jobId,
      old_status_id: oldStatusId,
      new_status_id: 5,
      changed_by: adminId,
      note: rejectionReason || 'İlan admin tarafından reddedildi',
      changed_at: db.fn.now()
    });

    // Hastaneye bildirim gönder
    try {
      const hospitalProfile = await db('jobs as j')
        .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .where('j.id', jobId)
        .select('hp.user_id', 'hp.institution_name', 'j.title')
        .first();

      if (hospitalProfile) {
        await notificationService.sendNotification({
          user_id: hospitalProfile.user_id,
          type: 'error',
          title: 'İlan Reddedildi',
          body: `${hospitalProfile.institution_name} hastanesindeki "${hospitalProfile.title}" ilanı reddedildi.${rejectionReason ? ` Sebep: ${rejectionReason}` : ''}`,
          data: {
            job_id: jobId,
            job_title: hospitalProfile.title,
            rejection_reason: rejectionReason,
            status: 'rejected'
          }
        });
      }
    } catch (notificationError) {
      logger.warn('Job rejection notification failed:', notificationError);
    }

    return await getJobDetails(jobId);
  } catch (error) {
    logger.error('Reject job error:', error);
    throw error;
  }
};

/**
 * İş ilanı statü geçmişini getirir
 * 
 * @param {number} jobId - İş ilanı ID'si
 * @returns {Promise<Array>} Statü geçmişi listesi
 */
const getJobHistory = async (jobId) => {
  try {
    const history = await db('job_history as jh')
      .join('users as u', 'jh.changed_by', 'u.id')
      .leftJoin('job_statuses as old_js', 'jh.old_status_id', 'old_js.id')
      .leftJoin('job_statuses as new_js', 'jh.new_status_id', 'new_js.id')
      .where('jh.job_id', jobId)
      .select(
        'jh.*',
        'u.email as changed_by_email',
        'u.role as changed_by_role',
        'old_js.name as old_status_name',
        'new_js.name as new_status_name'
      )
      .orderBy('jh.changed_at', 'desc');

    return history;
  } catch (error) {
    logger.error('Get job history error:', error);
    throw error;
  }
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
  console.log('🔍 Admin getApplicationDetails - Application ID:', applicationId);
  
  // MSSQL'de .first() ve .limit() parametrik top (@p0) ürettiği için
  // getAllApplications fonksiyonunu kullanıp memory'de filtreliyoruz
  // Bu yaklaşım verimsiz görünebilir ama MSSQL uyumluluğu için gerekli
  const result = await getAllApplications({ 
    page: 1, 
    limit: 10000 // Tüm uygulamaları al (pratikte bu sayı yeterli olmalı)
  });
  
  // Sonuçlardan applicationId'ye göre filtreleme yapıyoruz
  const application = result.data.find(app => app.id === parseInt(applicationId));
  
  // Eğer getAllApplications'da bulunamazsa veya eksik bilgiler varsa,
  // daha detaylı bir sorgu yapıyoruz (ama limit/offset olmadan)
  if (!application) {
    console.log('❌ Application not found in getAllApplications, trying direct query');
    
    // Basit bir sorgu yapıyoruz - sadece temel bilgileri alıyoruz
    const simpleQuery = await db('applications as a')
      .join('jobs as j', 'a.job_id', 'j.id')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .join('users as doctor_users', 'dp.user_id', 'doctor_users.id')
      .join('users as hospital_users', 'hp.user_id', 'hospital_users.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .leftJoin('cities as residence_city', 'dp.residence_city_id', 'residence_city.id')
      .where('a.id', applicationId)
      .whereNull('a.deleted_at')
      .whereNull('j.deleted_at')
      .where('hospital_users.is_active', true)
      .select(
        'a.*',
        'j.title as job_title',
        'j.status_id as job_status_id',
        'dp.first_name',
        'dp.last_name',
        'dp.specialty_id as doctor_specialty_id',
        'doctor_users.is_active as doctor_is_active',
        'residence_city.name as residence_city_name',
        'hp.institution_name',
        'ast.name as status'
      );
    
    // Array döndüğü için [0] ile alıyoruz
    const simpleResult = Array.isArray(simpleQuery) ? simpleQuery[0] : simpleQuery;
    
    if (!simpleResult) {
      console.log('❌ Application not found - Possible reasons:');
      console.log('   - Application ID does not exist');
      console.log('   - Application is soft deleted');
      console.log('   - Doctor is deactivated (is_active = false)');
      console.log('   - Hospital is deactivated (is_active = false)');
      return null;
    }
    
    console.log('📋 Admin getApplicationDetails - Found via simple query');
    return simpleResult;
  }
  
  // getAllApplications'dan gelen veri temel bilgileri içeriyor
  // Eksik bilgileri (doctor phone, profile_photo, birth_place, hospital email/phone/city) için
  // ayrı sorgular yapıyoruz - bunlar tek kayıt döndüreceği için MSSQL'de sorun yaratmaz
  let doctorDetails = null;
  let hospitalDetails = null;
  let jobDetails = null;
  
  try {
    // Doctor detaylarını alıyoruz - hastane modülündeki getDoctorProfileDetail'e benzer şekilde
    console.log('🔍 Fetching doctor details for doctor_profile_id:', application.doctor_profile_id);
    const doctorQueryResult = await db('doctor_profiles as dp')
      .join('users as doctor_users', 'dp.user_id', 'doctor_users.id')
      .leftJoin('specialties as doctor_specialty', 'dp.specialty_id', 'doctor_specialty.id')
      .leftJoin('subspecialties as doctor_subspecialty', 'dp.subspecialty_id', 'doctor_subspecialty.id')
      .leftJoin('cities as residence_city', 'dp.residence_city_id', 'residence_city.id')
      .leftJoin('cities as birth_place', 'dp.birth_place_id', 'birth_place.id')
      .where('dp.id', application.doctor_profile_id)
      .select(
        'dp.first_name',
        'dp.last_name',
        'dp.title',
        'dp.phone',
        'dp.profile_photo',
        'dp.specialty_id',
        'dp.subspecialty_id',
        'doctor_specialty.name as specialty_name',
        'doctor_subspecialty.name as subspecialty_name',
        'residence_city.name as residence_city_name',
        'birth_place.name as birth_place_name',
        'doctor_users.id as user_id',
        'doctor_users.email'
      );
    
    // Array döndüğü için [0] ile alıyoruz
    doctorDetails = Array.isArray(doctorQueryResult) && doctorQueryResult.length > 0 ? doctorQueryResult[0] : (doctorQueryResult || null);
    console.log('✅ Doctor details fetched:', {
      user_id: doctorDetails?.user_id,
      first_name: doctorDetails?.first_name,
      last_name: doctorDetails?.last_name
    });
  } catch (error) {
    console.log('⚠️ Error fetching doctor details:', error.message);
    console.log('⚠️ Error stack:', error.stack);
  }
  
  try {
    // Hospital detaylarını alıyoruz - önce job'tan hospital_id'yi alıyoruz
    const jobQuery = await db('jobs').where('id', application.job_id).select('hospital_id');
    const job = Array.isArray(jobQuery) && jobQuery.length > 0 ? jobQuery[0] : (jobQuery || null);
    
    if (job && job.hospital_id) {
      const hospitalQuery = await db('hospital_profiles as hp')
        .join('users as hospital_users', 'hp.user_id', 'hospital_users.id')
        .leftJoin('cities as hospital_city', 'hp.city_id', 'hospital_city.id')
        .where('hp.id', job.hospital_id)
        .select(
          'hp.phone as hospital_phone',
          'hospital_city.name as hospital_city_name',
          'hospital_users.id as hospital_user_id',
          'hospital_users.email as hospital_email'
        );
      
      hospitalDetails = Array.isArray(hospitalQuery) && hospitalQuery.length > 0 ? hospitalQuery[0] : (hospitalQuery || null);
    }
  } catch (error) {
    console.log('⚠️ Error fetching hospital details:', error.message);
  }
  
  try {
    // Job detaylarını alıyoruz - getAllJobs pattern'ini kullanıyoruz (MSSQL uyumlu)
    console.log('🔍 Fetching job details for job_id:', application.job_id);
    const jobQueryResult = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as job_specialty', 'j.specialty_id', 'job_specialty.id')
      .leftJoin('subspecialties as job_subspecialty', 'j.subspecialty_id', 'job_subspecialty.id')
      .leftJoin('cities as job_city', 'j.city_id', 'job_city.id')
      .where('j.id', application.job_id)
      .whereNull('j.deleted_at')
      .select(
        'j.description as job_description',
        'j.employment_type',
        'j.min_experience_years',
        // Not: max_experience_years, salary_min, salary_max kolonları jobs tablosunda yok
        'js.name as job_status',
        'job_specialty.name as job_specialty_name',
        'job_subspecialty.name as job_subspecialty_name',
        'job_city.name as job_city_name'
      );
    
    // Array döndüğü için [0] ile alıyoruz
    jobDetails = Array.isArray(jobQueryResult) && jobQueryResult.length > 0 ? jobQueryResult[0] : (jobQueryResult || null);
    
    if (jobDetails) {
      console.log('✅ Job details fetched successfully');
    } else {
      console.log('⚠️ Job details not found for job_id:', application.job_id);
    }
  } catch (error) {
    console.log('⚠️ Error fetching job details:', error.message);
    console.log('⚠️ Error details:', error);
    // Job details olmadan da devam edebiliriz, sadece job bilgileri eksik olur
    jobDetails = null;
  }
  
  // Tüm bilgileri birleştiriyoruz
  const enrichedApplication = {
    ...application,
    ...(jobDetails || {}),
    ...(hospitalDetails || {}),
    // Doktor bilgilerini düzgün birleştiriyoruz
    // getAllApplications'dan gelen doktor bilgilerini koruyoruz, eksikleri doctorDetails'ten ekliyoruz
    first_name: doctorDetails?.first_name || application.first_name || null,
    last_name: doctorDetails?.last_name || application.last_name || null,
    phone: doctorDetails?.phone || application.phone || null,
    profile_photo: doctorDetails?.profile_photo || null,
    birth_place_name: doctorDetails?.birth_place_name || null,
    user_id: doctorDetails?.user_id || null, // Frontend'de useUserById için kritik
    email: doctorDetails?.email || application.email || null,
    // Doktor specialty bilgileri
    title: doctorDetails?.title || null,
    specialty_name: doctorDetails?.specialty_name || null,
    subspecialty_name: doctorDetails?.subspecialty_name || null,
    residence_city_name: doctorDetails?.residence_city_name || application.residence_city_name || null,
    // Job bilgileri
    job_specialty_name: jobDetails?.job_specialty_name || application.job_specialty || null,
    // Hospital bilgileri
    hospital_user_id: hospitalDetails?.hospital_user_id || null,
    hospital_city_name: hospitalDetails?.hospital_city_name || null,
    hospital_email: hospitalDetails?.hospital_email || null,
    hospital_phone: hospitalDetails?.hospital_phone || null
  };
  
  console.log('📋 Admin getApplicationDetails - Result: Found and enriched');
  console.log('📋 Final user_id:', enrichedApplication.user_id);
  return enrichedApplication;
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
          type: newStatus === 'Pasif' ? 'warning' : 
                newStatus === 'Reddedildi' ? 'error' :
                newStatus === 'Revizyon Gerekli' ? 'warning' : 'info',
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
    
    // Temel istatistikler (soft delete hariç)
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
      db.raw('SELECT COUNT(*) as count FROM jobs WHERE deleted_at IS NULL'),
      db.raw('SELECT COUNT(*) as count FROM applications WHERE deleted_at IS NULL'),
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
  deactivateUser,
  activateUser,
  getAllJobs,
  getJobDetails,
  updateJob,
  updateJobStatus,
  approveJob,
  requestRevision,
  rejectJob,
  getJobHistory,
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
