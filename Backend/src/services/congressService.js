'use strict';

const { db } = require('../config/dbConfig');
const { PAGINATION } = require('../config/appConstants');

/**
 * Kongre listesi getir (filtreleme ve sayfalama ile)
 */
async function getCongressList(filters = {}) {
  const {
    page = 1,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = '',
    specialty = '',
    country = '',
    city = '',
    start_date_from = null,
    start_date_to = null,
    is_active = true,
    sort_by = 'start_date',
    sort_order = 'asc'
  } = filters;

  const offset = (page - 1) * limit;

  let query = db('congresses')
    .select(
      'id',
      'title',
      'description',
      'location',
      'city',
      'country',
      'start_date',
      'end_date',
      'website_url',
      'registration_url',
      'organizer',
      'specialty',
      'is_active',
      'created_at',
      'updated_at'
    )
    .where('is_active', is_active);

  // Arama filtresi
  if (search) {
    query = query.where(function() {
      this.where('title', 'like', `%${search}%`)
        .orWhere('description', 'like', `%${search}%`)
        .orWhere('location', 'like', `%${search}%`)
        .orWhere('organizer', 'like', `%${search}%`);
    });
  }

  // Uzmanlık filtresi
  if (specialty) {
    query = query.where('specialty', specialty);
  }

  // Ülke filtresi
  if (country) {
    query = query.where('country', country);
  }

  // Şehir filtresi
  if (city) {
    query = query.where('city', city);
  }

  // Tarih aralığı filtresi
  if (start_date_from) {
    query = query.where('start_date', '>=', start_date_from);
  }
  if (start_date_to) {
    query = query.where('start_date', '<=', start_date_to);
  }

  // Toplam kayıt sayısı - Yeni bir query oluştur (clone yerine)
  let countQuery = db('congresses').where('is_active', is_active);
  
  // Aynı filtreleri uygula
  if (search) {
    countQuery = countQuery.where(function() {
      this.where('title', 'like', `%${search}%`)
        .orWhere('description', 'like', `%${search}%`)
        .orWhere('location', 'like', `%${search}%`)
        .orWhere('organizer', 'like', `%${search}%`);
    });
  }
  if (specialty) {
    countQuery = countQuery.where('specialty', specialty);
  }
  if (country) {
    countQuery = countQuery.where('country', country);
  }
  if (city) {
    countQuery = countQuery.where('city', city);
  }
  if (start_date_from) {
    countQuery = countQuery.where('start_date', '>=', start_date_from);
  }
  if (start_date_to) {
    countQuery = countQuery.where('start_date', '<=', start_date_to);
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
  const congress = await db('congresses')
    .where({ id: congressId })
    .first();

  return congress;
}

/**
 * Yeni kongre oluştur (Admin)
 */
async function createCongress(congressData, adminId) {
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
  const congresses = await db('congresses')
    .select(
      'id',
      'title',
      'location',
      'city',
      'country',
      'start_date',
      'end_date',
      'specialty'
    )
    .where('is_active', true)
    .where('start_date', '>=', new Date())
    .orderBy('start_date', 'asc')
    .limit(limit);

  return congresses;
}

/**
 * Uzmanlık alanlarına göre kongreler
 */
async function getCongressesBySpecialty(specialty) {
  const congresses = await db('congresses')
    .select('*')
    .where('is_active', true)
    .where('specialty', specialty)
    .where('start_date', '>=', new Date())
    .orderBy('start_date', 'asc');

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
