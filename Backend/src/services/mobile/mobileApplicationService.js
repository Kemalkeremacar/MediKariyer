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

const listApplications = async (userId, { page = 1, limit = 20, status } = {}) => {
  const profile = await getDoctorProfile(userId);
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const offset = (currentPage - 1) * perPage;

  const baseQuery = db('applications as a')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'hp.id', 'j.hospital_id')
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .where('a.doctor_profile_id', profile.id)
    .whereNull('a.deleted_at');

  if (status) {
    baseQuery.andWhere('st.name', status);
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

  // SQL Server için OFFSET ... ROWS FETCH NEXT ... ROWS ONLY syntax'ını manuel ekle
  // Knex'in limit() çağrısı yapmadan SQL'i oluştur, sonra manuel OFFSET/FETCH ekle
  const queryBuilder = dataQuery.toSQL();
  let sql = queryBuilder.sql;
  
  // SQL boşsa veya undefined ise hata fırlat
  if (!sql || sql.trim() === '') {
    logger.error('⚠️ [mobileApplicationService] SQL is empty! Query builder:', JSON.stringify(queryBuilder, null, 2));
    throw new Error('SQL query is empty');
  }
  
  // Debug: Orijinal SQL'i logla
  logger.error('🔍 [mobileApplicationService] Original SQL:', sql);
  logger.error('🔍 [mobileApplicationService] Bindings:', queryBuilder.bindings);
  
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
    logger.error('🔍 [mobileApplicationService] After TOP removal:', sql);
  } else {
    logger.error('⚠️ [mobileApplicationService] TOP removal failed! Original:', beforeReplace);
  }
  
  // ORDER BY sonrasına OFFSET/FETCH ekle
  // SQL Server için: ORDER BY ... OFFSET @pX ROWS FETCH NEXT @pY ROWS ONLY
  let orderByPattern = /(order\s+by\s+\[a\]\.\[applied_at\]\s+desc,\s+\[a\]\.\[id\]\s+desc)\s*$/i;
  if (!orderByPattern.test(sql)) {
    // Farklı formatları dene
    orderByPattern = /(order\s+by\s+\[applications\]\.\[applied_at\]\s+desc,\s+\[applications\]\.\[id\]\s+desc)\s*$/i;
  }
  if (!orderByPattern.test(sql)) {
    // Daha basit pattern dene
    orderByPattern = /(order\s+by\s+applied_at\s+desc,\s+id\s+desc)\s*$/i;
  }
  
  if (orderByPattern.test(sql)) {
    // SQL Server'da db.raw() için ? placeholder kullan
    sql = sql.replace(
      orderByPattern,
      `$1 OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`
    );
    logger.error('🔍 [mobileApplicationService] After OFFSET/FETCH:', sql);
  } else {
    // ORDER BY pattern bulunamazsa, SQL'i logla ve hata fırlat
    logger.error('⚠️ [mobileApplicationService] ORDER BY pattern not found! SQL:', sql);
    throw new Error(`ORDER BY pattern not found in SQL: ${sql}`);
  }
  
  // Bindings'e offset ve perPage ekle
  const bindings = [...queryBuilder.bindings, offset, perPage];
  logger.error('🔍 [mobileApplicationService] Final bindings:', bindings);

  const [countResult, rowsResult] = await Promise.all([
    countQuery,
    db.raw(sql, bindings)
  ]);
  
  // SQL Server raw query sonucu array döner, ilk elemanı al
  const rows = rowsResult.recordset || rowsResult;
  const total = Number(countResult?.count ?? countResult?.[''] ?? 0) || 0;

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

  const application = await db('applications as a')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'hp.id', 'j.hospital_id')
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .select(
      'a.id',
      'a.job_id',
      'a.doctor_profile_id',
      'a.status_id',
      'a.applied_at as created_at', // SQL'de applied_at var, created_at yok
      'a.updated_at',
      'a.cover_letter',
      'a.notes',
      'a.deleted_at',
      'j.title as job_title',
      'hp.institution_name as hospital_name',
      'st.name as status_label'
    )
    .where('a.id', applicationId)
    .where('a.doctor_profile_id', profile.id)
    .whereNull('a.deleted_at')
    .first();

  if (!application) {
    throw new AppError('Başvuru bulunamadı', 404);
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

