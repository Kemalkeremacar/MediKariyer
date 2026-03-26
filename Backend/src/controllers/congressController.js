'use strict';

const congressService = require('../services/congressService');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Kongre listesi getir
 * GET /api/congresses
 */
async function getCongressList(req, res) {
  try {
    // Joi validation sonrası is_active boolean gelir (convert: true sayesinde).
    // Eğer query'de is_active hiç yoksa undefined gelir → default true.
    const rawIsActive = req.query.is_active;
    const isActive = rawIsActive === false || rawIsActive === 'false' ? false : true;

    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search || '',
      specialty_id: req.query.specialty_id ? parseInt(req.query.specialty_id) : null,
      subspecialty_id: req.query.subspecialty_id ? parseInt(req.query.subspecialty_id) : null,
      country: req.query.country || '',
      city: req.query.city || '',
      start_date_from: req.query.start_date_from || null,
      start_date_to: req.query.start_date_to || null,
      is_active: isActive,
      sort_by: req.query.sort_by || 'start_date',
      sort_order: req.query.sort_order || 'asc'
    };

    const result = await congressService.getCongressList(filters);

    return sendSuccess(res, 'Kongreler başarıyla getirildi', result);
  } catch (error) {
    logger.error('Kongre listesi getirme hatası:', error);
    if (error?.statusCode) {
      return sendError(res, error.message, error.details || null, error.statusCode);
    }
    return sendError(res, 'Kongreler getirilirken bir hata oluştu', null, 500);
  }
}

/**
 * Kongre detayı getir
 * GET /api/congresses/:id
 */
async function getCongressById(req, res) {
  try {
    const { id } = req.params;

    const congress = await congressService.getCongressById(id);

    if (!congress) {
      return sendNotFound(res, 'Kongre bulunamadı');
    }

    return sendSuccess(res, 'Kongre detayı başarıyla getirildi', congress);
  } catch (error) {
    logger.error('Kongre detayı getirme hatası:', error);
    if (error?.statusCode) {
      return sendError(res, error.message, error.details || null, error.statusCode);
    }
    return sendError(res, 'Kongre detayı getirilirken bir hata oluştu', null, 500);
  }
}

/**
 * Yeni kongre oluştur (Admin)
 * POST /api/admin/congresses
 */
async function createCongress(req, res) {
  try {
    const congressData = req.body;
    const adminId = req.user.id;

    const newCongress = await congressService.createCongress(congressData, adminId);

    logger.info(`Yeni kongre oluşturuldu: ${newCongress.id} - ${newCongress.title}`);

    return sendCreated(res, 'Kongre başarıyla oluşturuldu', newCongress);
  } catch (error) {
    logger.error('Kongre oluşturma hatası:', error);
    if (error?.statusCode) {
      return sendError(res, error.message, error.details || null, error.statusCode);
    }
    return sendError(res, 'Kongre oluşturulurken bir hata oluştu', null, 500);
  }
}

/**
 * Kongre güncelle (Admin)
 * PUT /api/admin/congresses/:id
 */
async function updateCongress(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user.id;

    const congress = await congressService.getCongressById(id);
    if (!congress) {
      return sendNotFound(res, 'Kongre bulunamadı');
    }

    const updatedCongress = await congressService.updateCongress(id, updateData, adminId);

    logger.info(`Kongre güncellendi: ${id} - ${updatedCongress.title}`);

    return sendSuccess(res, 'Kongre başarıyla güncellendi', updatedCongress);
  } catch (error) {
    logger.error('Kongre güncelleme hatası:', error);
    if (error?.statusCode) {
      return sendError(res, error.message, error.details || null, error.statusCode);
    }
    return sendError(res, 'Kongre güncellenirken bir hata oluştu', null, 500);
  }
}

/**
 * Kongre sil (Admin)
 * DELETE /api/admin/congresses/:id
 */
async function deleteCongress(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const congress = await congressService.getCongressById(id);
    if (!congress) {
      return sendNotFound(res, 'Kongre bulunamadı');
    }

    await congressService.deleteCongress(id, adminId);

    logger.info(`Kongre silindi: ${id} - ${congress.title}`);

    return sendSuccess(res, 'Kongre başarıyla silindi');
  } catch (error) {
    logger.error('Kongre silme hatası:', error);
    if (error?.statusCode) {
      return sendError(res, error.message, error.details || null, error.statusCode);
    }
    return sendError(res, 'Kongre silinirken bir hata oluştu', null, 500);
  }
}

/**
 * Yaklaşan kongreler (Doktorlar için)
 * GET /api/doctor/congresses/upcoming
 */
async function getUpcomingCongresses(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const congresses = await congressService.getUpcomingCongresses(limit);

    return sendSuccess(res, 'Yaklaşan kongreler başarıyla getirildi', congresses);
  } catch (error) {
    logger.error('Yaklaşan kongreler getirme hatası:', error);
    if (error?.statusCode) {
      return sendError(res, error.message, error.details || null, error.statusCode);
    }
    return sendError(res, 'Yaklaşan kongreler getirilirken bir hata oluştu', null, 500);
  }
}

module.exports = {
  getCongressList,
  getCongressById,
  createCongress,
  updateCongress,
  deleteCongress,
  getUpcomingCongresses
};
