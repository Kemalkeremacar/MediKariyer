/**
 * @file useFilter.ts
 * @description Filtreleme Hook'u - Liste ekranları için ortak filtreleme mantığı
 * 
 * Stabilizasyon: Faz 4
 * 
 * Kullanım Alanları:
 * - JobsScreen (iş ilanı filtreleme)
 * - ApplicationsScreen (başvuru filtreleme)
 * - Diğer liste ekranları
 * 
 * Özellikler:
 * - Search query state yönetimi
 * - Generic filter state yönetimi
 * - Debounced search (useSearch hook kullanıyor)
 * - Filter sheet visibility yönetimi
 * - Reset ve remove filter fonksiyonları
 * - Active filter sayısı hesaplama
 * 
 * @example
 * const filter = useFilter<JobFilters>({}, { minLength: 2 });
 * 
 * <SearchBar
 *   value={filter.searchQuery}
 *   onChangeText={filter.handleSearchChange}
 *   onClear={filter.handleSearchClear}
 * />
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useMemo } from 'react';
import { useSearch } from './useSearch';

// ============================================================================
// TİPLER
// ============================================================================

// Hook seçenekleri
export interface UseFilterOptions {
  /**
   * Minimum karakter sayısı - Backend'e istek atmak için
   * @default 2
   */
  minLength?: number;
  /**
   * Debounce delay (ms)
   * @default 800
   */
  delay?: number;
}

// Hook dönüş tipi
export interface UseFilterReturn<TFilters> {
  // Arama durumu
  searchQuery: string; // Kullanıcının yazdığı sorgu
  debouncedQuery: string; // Backend için debounced sorgu
  clientQuery: string; // Client-side filtreleme için sorgu
  shouldFetch: boolean; // Backend isteği yapılmalı mı?
  isSearching: boolean; // Arama yapılıyor mu?
  
  // Filtre durumu
  filters: TFilters; // Aktif filtreler
  showFilterSheet: boolean; // Filtre sheet'i gösteriliyor mu?
  
  // Arama aksiyonları
  handleSearchChange: (text: string) => void; // Arama değişikliği
  handleSearchClear: () => void; // Aramayı temizle
  
  // Filtre aksiyonları
  handleFilterChange: (newFilters: TFilters) => void; // Filtreleri güncelle
  handleRemoveFilter: (key: keyof TFilters) => void; // Tek bir filtreyi kaldır
  resetFilters: () => void; // Tüm filtreleri sıfırla
  
  // Filtre sheet aksiyonları
  setShowFilterSheet: (show: boolean) => void; // Sheet görünürlüğünü değiştir
  
  // Hesaplanmış değerler
  hasActiveFilters: boolean; // Aktif filtre var mı?
  activeFilterCount: number; // Aktif filtre sayısı
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Generic filtreleme hook'u - Liste ekranları için
 * 
 * @template TFilters - Filtre objesi tipi
 * @param initialFilters - Başlangıç filtre durumu
 * @param options - Hook seçenekleri
 * @returns Filtre durumu ve aksiyonları
 * 
 * @example
 * // JobsScreen'de kullanım
 * interface JobFilters {
 *   city_id?: number;
 *   specialty_id?: number;
 *   employment_type?: string;
 * }
 * 
 * const filter = useFilter<JobFilters>({}, { minLength: 2 });
 * 
 * // Arama
 * <SearchBar
 *   value={filter.searchQuery}
 *   onChangeText={filter.handleSearchChange}
 *   onClear={filter.handleSearchClear}
 * />
 * 
 * // Filtre sheet
 * <FilterSheet
 *   visible={filter.showFilterSheet}
 *   onClose={() => filter.setShowFilterSheet(false)}
 *   filters={filter.filters}
 *   onApply={filter.handleFilterChange}
 * />
 */
export function useFilter<TFilters extends Record<string, any>>(
  initialFilters: TFilters = {} as TFilters,
  options: UseFilterOptions = {}
): UseFilterReturn<TFilters> {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TFilters>(initialFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Search hook - debounced search
  const { debouncedQuery, clientQuery, shouldFetch, isSearching } = useSearch(searchQuery, {
    minLength: options.minLength ?? 2,
    delay: options.delay,
  });

  // Arama handler'ları
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filtre handler'ları
  const handleFilterChange = useCallback((newFilters: TFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof TFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery('');
  }, [initialFilters]);

  // Hesaplanmış değerler
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0 || clientQuery.length > 0;
  }, [activeFilterCount, clientQuery]);

  return {
    // Arama durumu
    searchQuery,
    debouncedQuery,
    clientQuery,
    shouldFetch,
    isSearching,
    
    // Filtre durumu
    filters,
    showFilterSheet,
    
    // Arama aksiyonları
    handleSearchChange,
    handleSearchClear,
    
    // Filtre aksiyonları
    handleFilterChange,
    handleRemoveFilter,
    resetFilters,
    
    // Filtre sheet aksiyonları
    setShowFilterSheet,
    
    // Hesaplanmış değerler
    hasActiveFilters,
    activeFilterCount,
  };
}

