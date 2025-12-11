/**
 * @file mobileJobController.js
 * @description Mobile job controller - Mobil uygulama için iş ilanı endpoint'lerini yönetir.
 * Bu controller, mobileJobRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - İş ilanları listesi (pagination, filters)
 * - İş ilanı detayı
 * 
 * Endpoint'ler:
 * - GET /api/mobile/jobs - İş ilanları listesi
 * - GET /api/mobile/jobs/:jobId - İş ilanı detayı
 * 
 * Özellikler:
 * - Minimal response payload (mobile optimized)
 * - JSON-only error handling
 * - catchAsync error handling
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const { sendPaginated, sendSuccess } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');
const mobileJobService = require('../../services/mobile/mobileJobService');

const listJobs = catchAsync(async (req, res) => {
  const { page, limit, city_id, specialty_id, keyword, search, employment_type } = req.query;
  const result = await mobileJobService.listJobs(req.user.id, {
    page,
    limit,
    filters: { 
      city_id, 
      specialty_id, 
      keyword: keyword || search, // search parametresini de destekle
      employment_type 
    }
  });

  // sendPaginated kullanarak standart pagination response formatı
  // Response: { success, message, data: [...], pagination: {...}, timestamp }
  return sendPaginated(
    res,
    'İlanlar listelendi',
    result.data,
    result.pagination
  );
});

const getJobDetail = catchAsync(async (req, res) => {
  const jobId = req.params.jobId;
  const data = await mobileJobService.getJobDetail(req.user.id, jobId);
  return sendSuccess(res, 'İlan detayı', data);
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  listJobs,
  getJobDetail
};

