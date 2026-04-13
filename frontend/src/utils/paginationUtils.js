/**
 * Pagination Utilities
 * Backend'den gelen farklı pagination formatlarını normalize eder
 */

/**
 * Backend'den gelen pagination verisini normalize eder
 * @param {Object} rawPagination - Backend'den gelen ham pagination verisi
 * @returns {Object} Normalize edilmiş pagination verisi
 */
export function normalizePagination(rawPagination = {}) {
  const normalized = {
    // Sayfa numarası
    page: rawPagination.current_page || rawPagination.page || 1,
    
    // Toplam sayfa sayısı
    totalPages: rawPagination.total_pages || rawPagination.totalPages || 1,
    
    // Toplam kayıt sayısı
    total: rawPagination.total || rawPagination.total_count || 0,
    
    // Sayfa başına kayıt
    perPage: rawPagination.per_page || rawPagination.perPage || rawPagination.limit || 10,
    
    // Sonraki/önceki sayfa kontrolü
    hasNext: rawPagination.has_next || rawPagination.hasNext || false,
    hasPrev: rawPagination.has_prev || rawPagination.hasPrev || false
  };
  
  // Backward compatibility için eski field adlarını da ekle
  normalized.total_pages = normalized.totalPages;
  normalized.current_page = normalized.page;
  normalized.per_page = normalized.perPage;
  
  return normalized;
}

/**
 * Pagination verisi var mı kontrol eder
 * @param {Object} pagination - Pagination verisi
 * @returns {boolean}
 */
export function hasPagination(pagination) {
  return pagination && pagination.totalPages > 1;
}

/**
 * Sayfa değiştirme fonksiyonu oluşturur
 * @param {Function} setFilters - Filter state setter
 * @returns {Function} Page change handler
 */
export function createPageChangeHandler(setFilters) {
  return (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    // Sayfa değişiminde üste kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}