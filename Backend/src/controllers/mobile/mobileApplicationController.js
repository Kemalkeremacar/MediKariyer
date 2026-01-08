/**
 * @file mobileApplicationController.js
 * @description Mobile application controller - Mobil uygulama için başvuru endpoint'lerini yönetir.
 * Bu controller, mobileApplicationRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Başvuru listesi (pagination, status filter)
 * - Başvuru detayı
 * - Başvuru oluşturma
 * - Başvuru geri çekme
 * 
 * Endpoint'ler:
 * - GET /api/mobile/applications - Başvuru listesi
 * - GET /api/mobile/applications/:applicationId - Başvuru detayı
 * - POST /api/mobile/applications - Başvuru oluştur
 * - PATCH /api/mobile/applications/:applicationId/withdraw - Başvuruyu geri çek (web backend ile uyumlu)
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
const mobileApplicationService = require('../../services/mobile/mobileApplicationService');

const listApplications = catchAsync(async (req, res) => {
  const { page, limit, status_id, keyword, search } = req.query;
  const result = await mobileApplicationService.listApplications(req.user.id, { 
    page, 
    limit, 
    status_id,  // Use status_id instead of status (Requirement 1.2)
    keyword: keyword || search 
  });
  
  // sendPaginated kullanarak standart pagination response formatı
  // Response: { success, message, data: [...], pagination: {...}, timestamp }
  return sendPaginated(
    res,
    'Başvurular listelendi',
    result.data,
    result.pagination
  );
});

const getApplicationDetail = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const data = await mobileApplicationService.getApplicationDetail(req.user.id, applicationId);
  return sendSuccess(res, 'Başvuru detayı', data);
});

const createApplication = catchAsync(async (req, res) => {
  const data = await mobileApplicationService.createApplication(req.user.id, req.body);
  return sendSuccess(res, 'Başvuru oluşturuldu', data);
});

const withdrawApplication = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const { reason } = req.body;  // Extract reason from request body (Requirement 3.1)
  await mobileApplicationService.withdrawApplication(req.user.id, applicationId, reason);
  return sendSuccess(res, 'Başvuru geri çekildi', { success: true });
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  listApplications,
  getApplicationDetail,
  createApplication,
  withdrawApplication
};

