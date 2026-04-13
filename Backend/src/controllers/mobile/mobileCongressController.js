/**
 * @file mobileCongressController.js
 * @description Mobile congress controller - Mobil uygulama için kongre endpoint'lerini yönetir.
 * Bu controller, mobileCongressRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Kongre listesi (pagination, filters)
 * - Kongre detayı
 * 
 * Endpoint'ler:
 * - GET /api/mobile/congresses - Kongre listesi
 * - GET /api/mobile/congresses/:congressId - Kongre detayı
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
const congressService = require('../../services/congressService');
const { AppError } = require('../../utils/errorHandler');

// ============================================================================
// CONTROLLER FONKSİYONLARI
// ============================================================================

/**
 * Kongre listesi getir (Mobile)
 * GET /api/mobile/congresses
 */
const listCongresses = catchAsync(async (req, res) => {
  const { 
    page, 
    limit, 
    search,
    specialty_id, 
    subspecialty_id,
    country,
    city,
    start_date_from,
    start_date_to,
    sort_by,
    sort_order
  } = req.query;

  // Mobile için güvenli filtreleme (sadece doktor kullanır)
  const filters = {
    page,
    limit,
    search,
    specialty_id,
    subspecialty_id,
    country,
    city,
    start_date_from,
    start_date_to,
    sort_by: sort_by || 'start_date',
    sort_order: sort_order || 'asc'
  };

  // Mobile: ZORUNLU güvenlik filtreleri (bypass edilemez)
  const today = new Date();
  
  // Sadece tarih kısmını al (timezone sorununu önle)
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayDateOnly = `${year}-${month}-${day}`;
  
  filters.is_active = true; // Sadece aktif kongreler
  filters.end_date_from = todayDateOnly; // Bugün dahil (>=)

  const result = await congressService.getCongressList(filters);

  // sendPaginated kullanarak standart pagination response formatı
  // Response: { success, message, data: [...], pagination: {...}, timestamp }
  return sendPaginated(
    res,
    'Kongreler listelendi',
    result.data,
    result.pagination
  );
});

/**
 * Kongre detayı getir (Mobile)
 * GET /api/mobile/congresses/:congressId
 */
const getCongressDetail = catchAsync(async (req, res) => {
  const congressId = req.params.congressId;
  
  const congress = await congressService.getCongressById(congressId);

  if (!congress) {
    throw new AppError('Kongre bulunamadı', 404);
  }

  // Mobile için sadece aktif kongreleri göster
  const isActive = congress.is_active === true || congress.is_active === 1 || congress.is_active === '1';
  if (!isActive) {
    throw new AppError('Kongre bulunamadı', 404);
  }

  return sendSuccess(res, 'Kongre detayı', congress);
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  listCongresses,
  getCongressDetail
};
