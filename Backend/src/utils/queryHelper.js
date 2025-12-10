/**
 * @file queryHelper.js
 * @description SQL Server için query helper fonksiyonları - Pagination ve SQL Server özel işlemler için yardımcı fonksiyonlar.
 * 
 * Ana Fonksiyonlar:
 * - buildPaginationSQL: Knex query builder'dan SQL Server uyumlu pagination SQL'i oluşturur
 * - getPaginationClause: Basit pagination clause string'i döndürür
 * 
 * SQL Server Özellikleri:
 * - OFFSET ... ROWS FETCH NEXT ... ROWS ONLY syntax'ı
 * - SELECT TOP kaldırma
 * - ORDER BY pattern matching
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const logger = require('./logger');
const { AppError } = require('./errorHandler');

/**
 * SQL Server için pagination clause string'i oluşturur
 * @param {number} page - Mevcut sayfa numarası (1'den başlar)
 * @param {number} pageSize - Sayfa başına kayıt sayısı
 * @returns {string} SQL Query parçası (OFFSET ... ROWS FETCH NEXT ... ROWS ONLY)
 * 
 * @example
 * const clause = getPaginationClause(2, 20); // "OFFSET 20 ROWS FETCH NEXT 20 ROWS ONLY"
 */
const getPaginationClause = (page = 1, pageSize = 10) => {
  // Güvenlik kontrolü: Sayı değilse varsayılanları kullan
  const p = Math.max(1, parseInt(page) || 1);
  const s = Math.max(1, parseInt(pageSize) || 10);
  const offset = (p - 1) * s;

  return `OFFSET ${offset} ROWS FETCH NEXT ${s} ROWS ONLY`;
};

/**
 * Knex query builder'dan SQL Server uyumlu pagination SQL'i oluşturur
 * @param {object} queryBuilder - Knex query builder instance
 * @param {number} page - Mevcut sayfa numarası (1'den başlar)
 * @param {number} pageSize - Sayfa başına kayıt sayısı
 * @param {string|RegExp} [orderByPattern] - ORDER BY pattern'i (opsiyonel, otomatik tespit edilir)
 * @returns {object} { sql: string, bindings: array, offset: number, perPage: number }
 * @throws {AppError} SQL oluşturulamazsa hata fırlatır
 * 
 * @example
 * const query = db('jobs').select('*').orderBy('created_at', 'desc');
 * const { sql, bindings, offset, perPage } = buildPaginationSQL(query, 2, 20);
 * const result = await db.raw(sql, bindings);
 */
const buildPaginationSQL = (queryBuilder, page = 1, pageSize = 10, orderByPattern = null) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(pageSize) || 10, 1), 100); // Max 100 kayıt
  const offset = (currentPage - 1) * perPage;

  // Knex query builder'dan SQL'i al
  const querySQL = queryBuilder.toSQL();
  let sql = querySQL.sql;

  // SQL boşsa veya undefined ise hata fırlat
  if (!sql || sql.trim() === '') {
    logger.error('⚠️ [queryHelper] SQL is empty! Query builder:', JSON.stringify(querySQL, null, 2));
    throw new AppError('Sorgu oluşturulamadı', 500);
  }

  // SELECT TOP (@p0) veya SELECT TOP(@p0) veya SELECT TOP @p0 formatlarını kaldır
  // SQL Server'da limit() çağrısı yapılmışsa Knex SELECT TOP üretir, bunu kaldırıyoruz
  const beforeReplace = sql;
  sql = sql.replace(/select\s+top\s*\(?\s*@p\d+\s*\)?\s*/gi, 'SELECT ');
  
  // Eğer hala SELECT TOP varsa, daha basit bir regex dene
  if (sql.includes('top') || sql.includes('TOP')) {
    sql = sql.replace(/SELECT\s+TOP\s*\(?\s*@p\d+\s*\)?\s*/i, 'SELECT ');
    sql = sql.replace(/select\s+top\s*\(?\s*@p\d+\s*\)?\s*/i, 'SELECT ');
  }

  // Debug log sadece development'ta
  if (process.env.NODE_ENV === 'development' && beforeReplace !== sql) {
    logger.debug('🔍 [queryHelper] After TOP removal:', sql);
  }

  // ORDER BY pattern'i bul veya kullanıcıdan gelen pattern'i kullan
  let finalOrderByPattern = orderByPattern;
  
  if (!finalOrderByPattern) {
    // Otomatik pattern tespiti - yaygın ORDER BY formatlarını dene
    // SQL Server'da farklı formatlar olabilir:
    // - ORDER BY [table].[column] DESC, [table].[id] DESC
    // - ORDER BY [column] DESC, [id] DESC  
    // - ORDER BY column DESC, id DESC
    const patterns = [
      // En spesifik: [table].[column] formatı (örn: [a].[created_at] desc, [a].[id] desc)
      /(order\s+by\s+\[[^\]]+\]\.\[[^\]]+\]\s+(?:asc|desc)(?:\s*,\s*\[[^\]]+\]\.\[[^\]]+\]\s+(?:asc|desc))*)/i,
      // Orta: [column] formatı (select * kullanıldığında veya explicit select'te)
      /(order\s+by\s+\[[^\]]+\]\s+(?:asc|desc)(?:\s*,\s*\[[^\]]+\]\s+(?:asc|desc))*)/i,
      // En basit: column formatı (bracket olmadan)
      /(order\s+by\s+\w+\s+(?:asc|desc)(?:\s*,\s*\w+\s+(?:asc|desc))*)/i,
    ];
    
    // SQL'i logla (debug için)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🔍 [queryHelper] Searching for ORDER BY pattern in SQL:', sql.substring(Math.max(0, sql.length - 200)));
    }
    
    for (const pattern of patterns) {
      if (pattern.test(sql)) {
        finalOrderByPattern = pattern;
        if (process.env.NODE_ENV === 'development') {
          logger.debug('✅ [queryHelper] ORDER BY pattern found:', pattern.toString());
        }
        break;
      }
    }
  }

  if (finalOrderByPattern) {
    // ORDER BY sonrasına OFFSET/FETCH ekle
    // SQL Server için @pN formatında parametre kullan
    const nextParamIndex = querySQL.bindings.length;
    const offsetParam = `@p${nextParamIndex}`;
    const limitParam = `@p${nextParamIndex + 1}`;
    
    if (finalOrderByPattern instanceof RegExp) {
      sql = sql.replace(
        finalOrderByPattern,
        `$1 OFFSET ${offsetParam} ROWS FETCH NEXT ${limitParam} ROWS ONLY`
      );
    } else {
      // String pattern ise direkt replace
      sql = sql.replace(
        finalOrderByPattern,
        `${finalOrderByPattern} OFFSET ${offsetParam} ROWS FETCH NEXT ${limitParam} ROWS ONLY`
      );
    }
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🔍 [queryHelper] After OFFSET/FETCH:', sql);
    }
  } else {
    // ORDER BY pattern bulunamazsa, SQL'i detaylı logla
    logger.error('⚠️ [queryHelper] ORDER BY pattern not found!');
    logger.error('SQL Query:', sql);
    logger.error('SQL Length:', sql.length);
    
    // SQL'de ORDER BY var mı kontrol et
    const hasOrderBy = /order\s+by/i.test(sql);
    if (!hasOrderBy) {
      logger.error('❌ SQL\'de ORDER BY clause yok!');
      throw new AppError('Sorgu oluşturulamadı: ORDER BY clause bulunamadı. SQL Server pagination için ORDER BY zorunludur.', 500);
    } else {
      logger.error('⚠️ ORDER BY var ama pattern eşleşmedi. SQL son 200 karakter:', sql.substring(Math.max(0, sql.length - 200)));
      throw new AppError('Sorgu oluşturulamadı: ORDER BY clause pattern eşleşmedi', 500);
    }
  }

  // Bindings'e offset ve perPage ekle
  const bindings = [...querySQL.bindings, offset, perPage];

  return {
    sql,
    bindings,
    offset,
    perPage
  };
};

/**
 * SQL Server raw query sonucunu normalize eder
 * @param {any} rawResult - db.raw() sonucu
 * @returns {Array} Normalize edilmiş array
 */
const normalizeRawResult = (rawResult) => {
  // SQL Server raw query sonucu array döner, ilk elemanı al
  // recordset property'si varsa onu kullan, yoksa direkt sonucu kullan
  if (Array.isArray(rawResult)) {
    return rawResult;
  }
  return rawResult?.recordset || rawResult || [];
};

/**
 * Count query sonucunu normalize eder
 * @param {any} countResult - Count query sonucu
 * @returns {number} Toplam kayıt sayısı
 */
const normalizeCountResult = (countResult) => {
  if (!countResult) return 0;
  
  // Farklı count formatlarını handle et
  const value = countResult.count ?? countResult[''] ?? Object.values(countResult || {})[0] ?? 0;
  return Number(value) || 0;
};

module.exports = {
  getPaginationClause,
  buildPaginationSQL,
  normalizeRawResult,
  normalizeCountResult
};

