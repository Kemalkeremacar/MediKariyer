'use strict';

const { db } = require('../config/dbConfig');
const { PAGINATION } = require('../config/appConstants');
const { AppError } = require('../utils/errorHandler');

async function assertSubspecialtyMatchesSpecialty({ specialty_id, subspecialty_id }) {
  if (!subspecialty_id) return;
  if (!specialty_id) {
    throw new AppError('Yan dal seçildiğinde uzmanlık alanı da seçilmelidir', 400);
  }

  const match = await db('subspecialties')
    .select('id')
    .where({ id: subspecialty_id, specialty_id })
    .first();

  if (!match) {
    throw new AppError('Seçilen yan dal, seçilen uzmanlık alanına ait değil', 400);
  }
}

/**
 * Kongre listesi getir (filtreleme ve sayfalama ile)
 */
async function getCongressList(filters = {}) {
  const {
    page = 1,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = '',
    specialty_id = null,
    subspecialty_id = null,
    country = '',
    city = '',
    start_date_from = null,
    start_date_to = null,
    is_active = true,
    sort_by = 'start_date',
    sort_order = 'asc'
  } = filters;

  const offset = (page - 1) * limit;

  let query = db('congresses as c')
    .leftJoin('specialties as s', 'c.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'c.subspecialty_id', 'ss.id')
    .select(
      'c.id',
      'c.title',
      'c.description',
      'c.location',
      'c.city',
      'c.country',
      'c.start_date',
      'c.end_date',
      'c.website_url',
      'c.registration_url',
      'c.organizer',
      'c.is_active',
      'c.created_at',
      'c.updated_at',
      'c.specialty_id',
      'c.subspecialty_id',
      's.name as specialty_name',
      'ss.name as subspecialty_name'
    )
    .where('c.is_active', is_active);

  // Arama filtresi
  if (search) {
    query = query.where(function() {
      this.where('c.title', 'like', `%${search}%`)
        .orWhere('c.description', 'like', `%${search}%`)
        .orWhere('c.location', 'like', `%${search}%`)
        .orWhere('c.organizer', 'like', `%${search}%`);
    });
  }

  // Uzmanlık ID filtresi
  if (specialty_id) {
    query = query.where('c.specialty_id', specialty_id);
  }

  // Yan dal ID filtresi
  if (subspecialty_id) {
    query = query.where('c.subspecialty_id', subspecialty_id);
  }

  // Ülke filtresi (kısmi eşleşme)
  if (country) {
    query = query.where('c.country', 'like', `%${country}%`);
  }

  // Şehir filtresi (kısmi eşleşme)
  if (city) {
    query = query.where('c.city', 'like', `%${city}%`);
  }

  // Tarih aralığı filtresi
  if (start_date_from) {
    query = query.where('c.start_date', '>=', start_date_from);
  }
  if (start_date_to) {
    query = query.where('c.start_date', '<=', start_date_to);
  }

  // Toplam kayıt sayısı - Yeni bir query oluştur (clone yerine)
  let countQuery = db('congresses as c').where('c.is_active', is_active);
  
  // Aynı filtreleri uygula
  if (search) {
    countQuery = countQuery.where(function() {
      this.where('c.title', 'like', `%${search}%`)
        .orWhere('c.description', 'like', `%${search}%`)
        .orWhere('c.location', 'like', `%${search}%`)
        .orWhere('c.organizer', 'like', `%${search}%`);
    });
  }
  if (specialty_id) {
    countQuery = countQuery.where('c.specialty_id', specialty_id);
  }
  if (subspecialty_id) {
    countQuery = countQuery.where('c.subspecialty_id', subspecialty_id);
  }
  if (country) {
    countQuery = countQuery.where('c.country', 'like', `%${country}%`);
  }
  if (city) {
    countQuery = countQuery.where('c.city', 'like', `%${city}%`);
  }
  if (start_date_from) {
    countQuery = countQuery.where('c.start_date', '>=', start_date_from);
  }
  if (start_date_to) {
    countQuery = countQuery.where('c.start_date', '<=', start_date_to);
  }
  
  const countResult = await countQuery.count('* as total');
  const total = countResult[0].total;

  // Sıralama ve sayfalama
  const congresses = await query
    .orderBy(sort_by, sort_order)
    .limit(limit)
    .offset(offset);

  return {
    data: congresses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Kongre detayı getir
 */
async function getCongressById(congressId) {
  const congress = await db('congresses as c')
    .leftJoin('specialties as s', 'c.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'c.subspecialty_id', 'ss.id')
    .select(
      'c.*',
      's.name as specialty_name',
      'ss.name as subspecialty_name'
    )
    .where({ 'c.id': congressId })
    .first();

  return congress;
}

/**
 * Yeni kongre oluştur (Admin)
 */
async function createCongress(congressData, adminId) {
  await assertSubspecialtyMatchesSpecialty({
    specialty_id: congressData.specialty_id ?? null,
    subspecialty_id: congressData.subspecialty_id ?? null,
  });

  const [congressId] = await db('congresses').insert({
    ...congressData,
    created_by: adminId,
    created_at: new Date(),
    updated_at: new Date()
  });

  return await getCongressById(congressId);
}

/**
 * Kongre güncelle (Admin)
 */
async function updateCongress(congressId, updateData, adminId) {
  // Partial update: if one side is missing, read current values
  const needsRead = (updateData.subspecialty_id !== undefined) || (updateData.specialty_id !== undefined);
  if (needsRead) {
    const current = await db('congresses')
      .select('specialty_id', 'subspecialty_id')
      .where({ id: congressId })
      .first();

    await assertSubspecialtyMatchesSpecialty({
      specialty_id: (updateData.specialty_id !== undefined ? updateData.specialty_id : current?.specialty_id) ?? null,
      subspecialty_id: (updateData.subspecialty_id !== undefined ? updateData.subspecialty_id : current?.subspecialty_id) ?? null,
    });
  }

  await db('congresses')
    .where({ id: congressId })
    .update({
      ...updateData,
      updated_by: adminId,
      updated_at: new Date()
    });

  return await getCongressById(congressId);
}

/**
 * Kongre sil (Soft delete)
 */
async function deleteCongress(congressId, adminId) {
  await db('congresses')
    .where({ id: congressId })
    .update({
      is_active: false,
      deleted_by: adminId,
      deleted_at: new Date()
    });

  return { success: true };
}

/**
 * Yaklaşan kongreler (Doktorlar için)
 */
async function getUpcomingCongresses(limit = 10) {
  const congresses = await db('congresses as c')
    .leftJoin('specialties as s', 'c.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'c.subspecialty_id', 'ss.id')
    .select(
      'c.id',
      'c.title',
      'c.location',
      'c.city',
      'c.country',
      'c.start_date',
      'c.end_date',
      'c.specialty_id',
      'c.subspecialty_id',
      's.name as specialty_name',
      'ss.name as subspecialty_name'
    )
    .where('c.is_active', true)
    .where('c.start_date', '>=', new Date())
    .orderBy('c.start_date', 'asc')
    .limit(limit);

  return congresses;
}

/**
 * Uzmanlık alanlarına göre kongreler
 */
async function getCongressesBySpecialty(specialty_id) {
  if (!specialty_id) return [];

  const congresses = await db('congresses as c')
    .leftJoin('specialties as s', 'c.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'c.subspecialty_id', 'ss.id')
    .select(
      'c.id', 'c.title', 'c.description', 'c.location', 'c.city', 'c.country',
      'c.start_date', 'c.end_date', 'c.website_url', 'c.registration_url',
      'c.organizer', 'c.is_active', 'c.created_at', 'c.updated_at',
      'c.specialty_id', 'c.subspecialty_id',
      's.name as specialty_name', 'ss.name as subspecialty_name'
    )
    .where('c.is_active', true)
    .where('c.specialty_id', specialty_id)
    .where('c.start_date', '>=', new Date())
    .orderBy('c.start_date', 'asc');

  return congresses;
}

module.exports = {
  getCongressList,
  getCongressById,
  createCongress,
  updateCongress,
  deleteCongress,
  getUpcomingCongresses,
  getCongressesBySpecialty
};
