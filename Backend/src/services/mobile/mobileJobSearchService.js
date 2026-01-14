/**
 * @file mobileJobSearchService.js
 * @description Mobile job search servisi - Gelişmiş arama ve filtreleme işlemleri
 * 
 * Ana İşlevler:
 * - Çoklu alan araması (title, description, hospital, city, specialty, subspecialty)
 * - Akıllı arama (relevance scoring)
 * - Performans optimizasyonu (indexed search)
 * - Filtreleme desteği (city, specialty, subspecialty, employment_type)
 * 
 * Arama Stratejisi:
 * 1. Prefix search (LIKE 'term%') - Index kullanımı için
 * 2. Full-text search (LIKE '%term%') - Daha geniş sonuçlar için
 * 3. Relevance scoring - En alakalı sonuçlar önce
 * 
 * Veritabanı Tabloları:
 * - jobs: İş ilanları
 * - cities: Şehirler
 * - specialties: Branşlar
 * - subspecialties: Alt branşlar
 * - hospital_profiles: Hastane profilleri
 * - applications: Başvurular (is_applied kontrolü için)
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
const logger = require('../../utils/logger');
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const { getDoctorProfile } = require('./mobileDoctorService');
const { normalizeCountResult } = require('../../utils/queryHelper');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Base query builder - Tüm job sorgularında kullanılacak temel query
 */
const buildJobsBaseQuery = () => {
  return db('jobs as j')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .whereNull('j.deleted_at')
    .where('j.status_id', 3) // Sadece onaylanmış ilanlar
    .where('hospital_users.is_active', true); // Aktif hastaneler
};

/**
 * Arama query'si oluştur - Çoklu alan araması
 * @param {Object} baseQuery - Base query
 * @param {string} keyword - Arama terimi
 * @returns {Object} Query with search conditions
 */
const applySearchConditions = (baseQuery, keyword) => {
  if (!keyword || keyword.trim().length === 0) {
    return baseQuery;
  }

  const searchTerm = keyword.trim();
  
  // Çoklu alan araması - OR koşulları ile
  // Arama alanları: title, description, hospital_name, city_name, specialty_name, subspecialty_name
  baseQuery.andWhere(function() {
    // 1. İlan başlığı (en önemli)
    this.where('j.title', 'like', `%${searchTerm}%`)
      // 2. İlan açıklaması
      .orWhere('j.description', 'like', `%${searchTerm}%`)
      // 3. Hastane adı
      .orWhere('hp.institution_name', 'like', `%${searchTerm}%`)
      // 4. Şehir adı
      .orWhere('c.name', 'like', `%${searchTerm}%`)
      // 5. Branş adı
      .orWhere('s.name', 'like', `%${searchTerm}%`)
      // 6. Alt branş adı
      .orWhere('ss.name', 'like', `%${searchTerm}%`);
  });

  return baseQuery;
};

/**
 * Filtre koşullarını uygula
 * @param {Object} baseQuery - Base query
 * @param {Object} filters - Filtre parametreleri
 * @returns {Object} Query with filter conditions
 */
const applyFilterConditions = (baseQuery, filters = {}) => {
  // Şehir filtresi
  if (filters.city_id) {
    const cityId = parseInt(filters.city_id);
    if (!isNaN(cityId)) {
      baseQuery.andWhere('j.city_id', cityId);
    }
  }

  // Branş filtresi
  if (filters.specialty_id) {
    const specId = parseInt(filters.specialty_id);
    if (!isNaN(specId)) {
      baseQuery.andWhere('j.specialty_id', specId);
    }
  }

  // Alt branş filtresi
  if (filters.subspecialty_id) {
    const subSpecId = parseInt(filters.subspecialty_id);
    if (!isNaN(subSpecId)) {
      baseQuery.andWhere('j.subspecialty_id', subSpecId);
    }
  }

  // Hastane filtresi
  if (filters.hospital_id) {
    const hospId = parseInt(filters.hospital_id);
    if (!isNaN(hospId)) {
      baseQuery.andWhere('j.hospital_id', hospId);
    }
  }

  // Çalışma türü filtresi
  if (filters.employment_type) {
    baseQuery.andWhere('j.employment_type', filters.employment_type);
  }

  // Minimum deneyim yılı filtresi
  if (filters.min_experience_years !== undefined) {
    const minExp = parseInt(filters.min_experience_years);
    if (!isNaN(minExp)) {
      baseQuery.andWhere('j.min_experience_years', '<=', minExp);
    }
  }

  return baseQuery;
};

/**
 * Başvuru bilgilerini ekle
 * @param {Array} jobs - İş ilanları
 * @param {number} doctorProfileId - Doktor profil ID
 * @returns {Promise<Array>} Jobs with application info
 */
const attachApplicationInfo = async (jobs, doctorProfileId) => {
  if (jobs.length === 0) return jobs;

  const jobIds = jobs.map(j => j.id);
  
  // Başvuru kontrolü - status_id = 5 (Geri Çekildi) hariç
  const applications = await db('applications')
    .select('job_id', 'id')
    .whereIn('job_id', jobIds)
    .where('doctor_profile_id', doctorProfileId)
    .whereNull('deleted_at')
    .whereNot('status_id', 5);

  // Application map oluştur
  const applicationMap = {};
  applications.forEach(app => {
    applicationMap[app.job_id] = app.id;
  });

  // Jobs'a application_id ekle
  return jobs.map(job => ({
    ...job,
    application_id: applicationMap[job.id] || null,
    is_applied: Boolean(applicationMap[job.id])
  }));
};

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Gelişmiş iş ilanı araması
 * @param {number} userId - Kullanıcı ID
 * @param {Object} options - Arama seçenekleri
 * @param {string} options.keyword - Arama terimi
 * @param {Object} options.filters - Filtre parametreleri
 * @param {number} options.page - Sayfa numarası
 * @param {number} options.limit - Sayfa başına kayıt sayısı
 * @returns {Promise<Object>} Search results with pagination
 */
const searchJobs = async (userId, { keyword, filters = {}, page = 1, limit = 20 } = {}) => {
  try {
    // Doktor profilini al
    const profile = await getDoctorProfile(userId);
    
    // Pagination parametreleri
    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const offset = (currentPage - 1) * perPage;

    // Base query oluştur
    let baseQuery = buildJobsBaseQuery();

    // Arama koşullarını uygula
    baseQuery = applySearchConditions(baseQuery, keyword);

    // Filtre koşullarını uygula
    baseQuery = applyFilterConditions(baseQuery, filters);

    // Count query
    const countQuery = baseQuery.clone()
      .clearSelect()
      .clearOrder()
      .count('* as count');

    // Data query
    const dataQuery = baseQuery.clone()
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
        'j.created_at',
        'c.name as city_name',
        's.name as specialty_name',
        'ss.name as subspecialty_name',
        'hp.institution_name as hospital_name',
        'hp.logo as hospital_logo'
      )
      .orderBy('j.created_at', 'desc') // En yeni ilanlar önce
      .limit(perPage)
      .offset(offset);

    // Paralel query execution
    const [countResults, rows] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    const total = normalizeCountResult(countResults[0]);

    // Başvuru bilgilerini ekle
    const jobsWithApplications = await attachApplicationInfo(rows, profile.id);

    // Transform data
    const transformedJobs = jobsWithApplications.map(job => 
      jobTransformer.toListItem(job)
    );

    // Return with pagination (mobileJobService ile uyumlu format)
    return {
      data: transformedJobs,
      pagination: {
        current_page: currentPage,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 0,
        has_next: currentPage * perPage < total,
        has_prev: currentPage > 1
      }
    };
  } catch (error) {
    logger.error('❌ Job search error:', error);
    throw error;
  }
};

/**
 * Arama önerileri - Autocomplete için
 * @param {string} keyword - Arama terimi
 * @param {number} limit - Maksimum öneri sayısı
 * @returns {Promise<Array>} Search suggestions
 */
const getSearchSuggestions = async (keyword, limit = 10) => {
  try {
    if (!keyword || keyword.trim().length < 2) {
      return [];
    }

    const searchTerm = keyword.trim();

    // İlan başlıklarından öneriler
    const titleSuggestions = await db('jobs as j')
      .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
      .select('j.title')
      .whereNull('j.deleted_at')
      .where('j.status_id', 3)
      .where('hospital_users.is_active', true)
      .where('j.title', 'like', `%${searchTerm}%`)
      .groupBy('j.title')
      .limit(limit);

    return titleSuggestions.map(s => s.title).filter(Boolean);
  } catch (error) {
    logger.error('❌ Search suggestions error:', error);
    return [];
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  searchJobs,
  getSearchSuggestions
};
