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
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const { getDoctorProfile } = require('./mobileDoctorService');

const buildJobsBaseQuery = () => {
  return db('jobs as j')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .whereNull('j.deleted_at');
};

const listJobs = async (userId, { page = 1, limit = 20, filters = {} } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const offset = (currentPage - 1) * perPage;

  const baseQuery = buildJobsBaseQuery();

  if (filters.city_id) {
    baseQuery.andWhere('j.city_id', filters.city_id);
  }

  if (filters.specialty_id) {
    baseQuery.andWhere('j.specialty_id', filters.specialty_id);
  }

  if (filters.keyword) {
    baseQuery.andWhere('j.title', 'like', `%${filters.keyword}%`);
  }

  const countQuery = baseQuery.clone().clearSelect().clearOrder().count({ count: '*' }).first();

  const dataQuery = baseQuery
    .clone()
    .leftJoin('applications as a', function linkApplications() {
      this.on('a.job_id', '=', 'j.id')
        .andOn('a.doctor_profile_id', '=', db.raw('?', [profile.id]))
        .andOnNull('a.deleted_at');
    })
    .select(
      'j.id',
      'j.title',
      'j.created_at',
      'j.employment_type', // SQL'de work_type yok, employment_type var
      'c.name as city_name',
      's.name as specialty_name',
      'hp.institution_name as hospital_name',
      'a.id as application_id'
    )
    .orderBy('j.created_at', 'desc')
    .orderBy('j.id', 'desc');

  // SQL Server için OFFSET ... ROWS FETCH NEXT ... ROWS ONLY syntax'ını manuel ekle
  // Knex'in limit() çağrısı yapmadan SQL'i oluştur, sonra manuel OFFSET/FETCH ekle
  const queryBuilder = dataQuery.toSQL();
  let sql = queryBuilder.sql;
  
  // SQL boşsa veya undefined ise hata fırlat
  if (!sql || sql.trim() === '') {
    const logger = require('../../utils/logger');
    logger.error('⚠️ [mobileJobService] SQL is empty! Query builder:', JSON.stringify(queryBuilder, null, 2));
    throw new Error('SQL query is empty');
  }
  
  // Debug: Orijinal SQL'i logla
  const logger = require('../../utils/logger');
  logger.error('🔍 [mobileJobService] Original SQL:', sql);
  logger.error('🔍 [mobileJobService] Bindings:', queryBuilder.bindings);
  
  // SELECT TOP (@p0) veya SELECT TOP(@p0) veya SELECT TOP @p0 formatlarını kaldır
  // SQL Server'da limit() çağrısı yapılmışsa Knex SELECT TOP üretir, bunu kaldırıyoruz
  const beforeReplace = sql;
  // Daha agresif regex: tüm SELECT TOP varyasyonlarını yakala (case-insensitive, whitespace-tolerant)
  sql = sql.replace(/select\s+top\s*\(?\s*@p\d+\s*\)?\s*/gi, 'SELECT ');
  // Eğer hala SELECT TOP varsa, daha basit bir regex dene
  if (sql.includes('top') || sql.includes('TOP')) {
    sql = sql.replace(/SELECT\s+TOP\s*\(?\s*@p\d+\s*\)?\s*/i, 'SELECT ');
    sql = sql.replace(/select\s+top\s*\(?\s*@p\d+\s*\)?\s*/i, 'SELECT ');
  }
  
  if (beforeReplace !== sql) {
    logger.error('🔍 [mobileJobService] After TOP removal:', sql);
  } else {
    logger.error('⚠️ [mobileJobService] TOP removal failed! Original:', beforeReplace);
  }
  
  // ORDER BY sonrasına OFFSET/FETCH ekle
  // SQL Server için: ORDER BY ... OFFSET @pX ROWS FETCH NEXT @pY ROWS ONLY
  let orderByPattern = /(order\s+by\s+\[j\]\.\[created_at\]\s+desc,\s+\[j\]\.\[id\]\s+desc)\s*$/i;
  if (!orderByPattern.test(sql)) {
    // Farklı formatları dene
    orderByPattern = /(order\s+by\s+\[jobs\]\.\[created_at\]\s+desc,\s+\[jobs\]\.\[id\]\s+desc)\s*$/i;
  }
  if (!orderByPattern.test(sql)) {
    // Daha basit pattern dene
    orderByPattern = /(order\s+by\s+created_at\s+desc,\s+id\s+desc)\s*$/i;
  }
  
  if (orderByPattern.test(sql)) {
    // SQL Server'da db.raw() için ? placeholder kullan
    sql = sql.replace(
      orderByPattern,
      `$1 OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`
    );
    logger.error('🔍 [mobileJobService] After OFFSET/FETCH:', sql);
  } else {
    // ORDER BY pattern bulunamazsa, SQL'i logla ve hata fırlat
    logger.error('⚠️ [mobileJobService] ORDER BY pattern not found! SQL:', sql);
    throw new Error(`ORDER BY pattern not found in SQL: ${sql}`);
  }
  
  // Bindings'e offset ve perPage ekle
  const bindings = [...queryBuilder.bindings, offset, perPage];
  logger.error('🔍 [mobileJobService] Final bindings:', bindings);

  const [countResult, rowsResult] = await Promise.all([
    countQuery,
    db.raw(sql, bindings)
  ]);
  
  // SQL Server raw query sonucu array döner, ilk elemanı al
  const rows = rowsResult.recordset || rowsResult;
  const total = Number(countResult?.count ?? countResult?.[''] ?? 0) || 0;

  return {
    data: rows.map((row) => jobTransformer.toListItem({
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

  const job = await buildJobsBaseQuery()
    .leftJoin('applications as a', function linkApplications() {
      this.on('a.job_id', '=', 'j.id')
        .andOn('a.doctor_profile_id', '=', db.raw('?', [profile.id]))
        .andOnNull('a.deleted_at');
    })
    .select(
      'j.*',
      'c.name as city_name',
      's.name as specialty_name',
      'hp.institution_name as hospital_name',
      'a.id as application_id'
    )
    .where('j.id', jobId)
    .first();

  if (!job) {
    throw new AppError('İlan bulunamadı', 404);
  }

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

