'use strict';

const { db } = require('../config/dbConfig');
const { PAGINATION } = require('../config/appConstants');
const { AppError } = require('../utils/errorHandler');

function uniqPositiveInts(values) {
  const out = [];
  const seen = new Set();
  (Array.isArray(values) ? values : []).forEach((v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    const i = Math.trunc(n);
    if (i <= 0) return;
    if (seen.has(i)) return;
    seen.add(i);
    out.push(i);
  });
  return out;
}

async function syncCongressSpecialties(trx, congressId, specialtyIds) {
  // overwrite strategy: delete existing, then insert desired
  await trx('congress_specialties').where({ congress_id: congressId }).del();
  if (!specialtyIds?.length) return;

  await trx('congress_specialties').insert(
    specialtyIds.map((sid) => ({
      congress_id: congressId,
      specialty_id: sid,
      created_at: new Date(),
    }))
  );
}

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
    end_date_from = null,
    is_active = true,
    sort_by = 'start_date',
    sort_order = 'asc'
  } = filters;

  const offset = (page - 1) * limit;

  // MSSQL BIT alanı için boolean → 1/0 dönüşümü
  const isActiveValue = is_active ? 1 : 0;

  // Güvenli sort_by: sadece izin verilen kolonlar, tablo prefix'i ile
  const allowedSortColumns = {
    start_date: 'c.start_date',
    end_date: 'c.end_date',
    title: 'c.title',
    created_at: 'c.created_at'
  };
  const safeSortColumn = allowedSortColumns[sort_by] || 'c.start_date';
  const safeSortOrder = sort_order === 'desc' ? 'desc' : 'asc';

  // Filtreleri uygulayan yardımcı fonksiyon (DRY)
  const applyFilters = (q) => {
    // Soft-deleted kayıtları her zaman gizle
    q = q.whereNull('c.deleted_at');

    // Admin için: is_active null ise tümünü göster, değilse filtrele
    if (is_active !== null) {
      q = q.where('c.is_active', isActiveValue);
    }

    if (search) {
      q = q.where(function() {
        this.where('c.title', 'like', `%${search}%`)
          .orWhere('c.description', 'like', `%${search}%`)
          .orWhere('c.location', 'like', `%${search}%`)
          .orWhere('c.organizer', 'like', `%${search}%`);
      });
    }
    if (specialty_id) {
      // Çoklu specialty_id desteği: "1,2,3" formatı veya tek sayı
      let specialtyIds;
      if (typeof specialty_id === 'string' && specialty_id.includes(',')) {
        // Virgülle ayrılmış string: "1,2,3"
        specialtyIds = uniqPositiveInts(specialty_id.split(','));
      } else {
        // Tek sayı
        specialtyIds = uniqPositiveInts([specialty_id]);
      }
      
      if (specialtyIds.length > 0) {
        // Any specialty link (primary included in congress_specialties by design)
        q = q.whereExists(function() {
          this.select(db.raw('1'))
            .from('congress_specialties as cs')
            .whereRaw('cs.congress_id = c.id')
            .whereIn('cs.specialty_id', specialtyIds);
        });
      }
    }
    if (subspecialty_id) {
      q = q.where('c.subspecialty_id', subspecialty_id);
    }
    if (country) {
      q = q.where('c.country', 'like', `%${country}%`);
    }
    if (city) {
      q = q.where('c.city', 'like', `%${city}%`);
    }
    if (start_date_from) {
      q = q.where('c.start_date', '>=', start_date_from);
    }
    if (start_date_to) {
      q = q.where('c.start_date', '<=', start_date_to);
    }
    if (end_date_from) {
      q = q.where('c.end_date', '>=', end_date_from);
    }
    return q;
  };

  // Ana sorgu
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
    );
  query = applyFilters(query);

  // Toplam kayıt sayısı
  let countQuery = db('congresses as c');
  countQuery = applyFilters(countQuery);

  const countResult = await countQuery.count({ total: '*' });
  const total = Number(countResult[0]?.total ?? 0);

  // Sıralama ve sayfalama
  const congresses = await query
    .orderBy(safeSortColumn, safeSortOrder)
    .limit(limit)
    .offset(offset);

  const parsedLimit = Number(limit) || PAGINATION.DEFAULT_LIMIT;

  // Attach specialties[] (many-to-many)
  const ids = congresses.map((c) => c?.id).filter(Boolean);
  if (ids.length) {
    const rows = await db('congress_specialties as cs')
      .join('specialties as s', 'cs.specialty_id', 's.id')
      .select('cs.congress_id', 's.id as id', 's.name as name')
      .whereIn('cs.congress_id', ids)
      .orderBy('s.name', 'asc');

    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.congress_id)) map.set(r.congress_id, []);
      map.get(r.congress_id).push({ id: r.id, name: r.name });
    });

    congresses.forEach((c) => {
      c.specialties = map.get(c.id) || [];
    });
  } else {
    congresses.forEach((c) => { c.specialties = []; });
  }

  const currentPage = Number(page) || 1;
  const totalPages = Math.ceil(total / parsedLimit) || 1;

  return {
    data: congresses,
    pagination: {
      current_page: currentPage,
      per_page: parsedLimit,
      total,
      total_pages: totalPages,
      has_next: currentPage * parsedLimit < total,
      has_prev: currentPage > 1
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
    .whereNull('c.deleted_at')
    .first();

  if (congress?.id) {
    const specialties = await db('congress_specialties as cs')
      .join('specialties as s', 'cs.specialty_id', 's.id')
      .select('s.id as id', 's.name as name')
      .where('cs.congress_id', congress.id)
      .orderBy('s.name', 'asc');
    congress.specialties = specialties || [];
  }

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

  const primaryId = congressData.specialty_id ?? null;
  const extraIds = uniqPositiveInts(congressData.specialty_ids);
  const allIds = uniqPositiveInts([primaryId, ...extraIds]);

  const congressId = await db.transaction(async (trx) => {
    const insertPayload = { ...congressData };
    delete insertPayload.specialty_ids;

    const [inserted] = await trx('congresses')
      .insert({
        ...insertPayload,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');

    const id = typeof inserted === 'object' ? inserted.id : inserted;

    if (allIds.length) {
      await syncCongressSpecialties(trx, id, allIds);
    }

    return id;
  });

  return await getCongressById(congressId);
}

/**
 * Kongre güncelle (Admin)
 */
async function updateCongress(congressId, updateData, adminId) {
  // Partial update: if one side is missing, read current values
  const needsRead = (updateData.subspecialty_id !== undefined) || (updateData.specialty_id !== undefined) || (updateData.specialty_ids !== undefined);
  let current = null;
  if (needsRead) {
    current = await db('congresses')
      .select('specialty_id', 'subspecialty_id')
      .where({ id: congressId })
      .first();

    await assertSubspecialtyMatchesSpecialty({
      specialty_id: (updateData.specialty_id !== undefined ? updateData.specialty_id : current?.specialty_id) ?? null,
      subspecialty_id: (updateData.subspecialty_id !== undefined ? updateData.subspecialty_id : current?.subspecialty_id) ?? null,
    });
  }

  // Determine desired specialties sync set only if specialty_id or specialty_ids provided
  const shouldSyncSpecialties = (updateData.specialty_id !== undefined) || (updateData.specialty_ids !== undefined);
  const primaryId = (updateData.specialty_id !== undefined ? updateData.specialty_id : current?.specialty_id) ?? null;
  const extraIds = updateData.specialty_ids !== undefined ? uniqPositiveInts(updateData.specialty_ids) : null;
  const desiredIds = shouldSyncSpecialties
    ? uniqPositiveInts([primaryId, ...((extraIds ?? []) )])
    : null;

  await db.transaction(async (trx) => {
    const patch = { ...updateData };
    delete patch.specialty_ids;

    await trx('congresses')
      .where({ id: congressId })
      .update({
        ...patch,
        updated_by: adminId,
        updated_at: new Date()
      });

    if (shouldSyncSpecialties) {
      await syncCongressSpecialties(trx, congressId, desiredIds);
    }
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
      is_active: 0,
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
    .where('c.is_active', 1)
    .whereNull('c.deleted_at')
    .where('c.start_date', '>=', new Date())
    .orderBy('c.start_date', 'asc')
    .limit(limit);

  const ids = congresses.map((c) => c?.id).filter(Boolean);
  if (ids.length) {
    const rows = await db('congress_specialties as cs')
      .join('specialties as sp', 'cs.specialty_id', 'sp.id')
      .select('cs.congress_id', 'sp.id as id', 'sp.name as name')
      .whereIn('cs.congress_id', ids)
      .orderBy('sp.name', 'asc');

    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.congress_id)) map.set(r.congress_id, []);
      map.get(r.congress_id).push({ id: r.id, name: r.name });
    });

    congresses.forEach((c) => {
      c.specialties = map.get(c.id) || [];
    });
  } else {
    congresses.forEach((c) => { c.specialties = []; });
  }

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
    .where('c.is_active', 1)
    .whereNull('c.deleted_at')
    .whereExists(function() {
      this.select(db.raw('1'))
        .from('congress_specialties as cs')
        .whereRaw('cs.congress_id = c.id')
        .andWhere('cs.specialty_id', specialty_id);
    })
    .where('c.start_date', '>=', new Date())
    .orderBy('c.start_date', 'asc');

  const ids = congresses.map((c) => c?.id).filter(Boolean);
  if (ids.length) {
    const rows = await db('congress_specialties as cs')
      .join('specialties as sp', 'cs.specialty_id', 'sp.id')
      .select('cs.congress_id', 'sp.id as id', 'sp.name as name')
      .whereIn('cs.congress_id', ids)
      .orderBy('sp.name', 'asc');

    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.congress_id)) map.set(r.congress_id, []);
      map.get(r.congress_id).push({ id: r.id, name: r.name });
    });

    congresses.forEach((c) => {
      c.specialties = map.get(c.id) || [];
    });
  } else {
    congresses.forEach((c) => { c.specialties = []; });
  }

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
