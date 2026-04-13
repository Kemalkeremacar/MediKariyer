/**
 * Pagination Helper Utilities
 * Tüm servisler için standart pagination formatı
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

/**
 * Standart pagination response oluşturur
 * @param {Array} data - Sayfalanmış veri
 * @param {number} total - Toplam kayıt sayısı
 * @param {number} page - Mevcut sayfa
 * @param {number} limit - Sayfa başına kayıt
 * @returns {Object} Standart pagination response
 */
function createPaginationResponse(data, total, page, limit) {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / perPage) || 1;

  return {
    data,
    pagination: {
      current_page: currentPage,
      per_page: perPage,
      total: parseInt(total) || 0,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_prev: currentPage > 1
    }
  };
}

/**
 * SQL OFFSET hesaplar
 * @param {number} page - Sayfa numarası
 * @param {number} limit - Sayfa başına kayıt
 * @returns {number} OFFSET değeri
 */
function calculateOffset(page, limit) {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 20;
  return (currentPage - 1) * perPage;
}

/**
 * Pagination parametrelerini validate eder
 * @param {Object} params - { page, limit }
 * @returns {Object} Validate edilmiş parametreler
 */
function validatePaginationParams(params = {}) {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
  
  return { page, limit };
}

module.exports = {
  createPaginationResponse,
  calculateOffset,
  validatePaginationParams
};