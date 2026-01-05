/**
 * useFilter Hook - Stabilizasyon Faz 4
 * 
 * JobsScreen ve ApplicationsScreen için ortak filtreleme mantığı
 * 
 * Özellikler:
 * - Search query state yönetimi
 * - Filter state yönetimi (generic)
 * - Debounced search (useSearch hook kullanıyor)
 * - Filter sheet visibility yönetimi
 * - Reset ve remove filter fonksiyonları
 */

import { useState, useCallback, useMemo } from 'react';
import { useSearch } from './useSearch';

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

export interface UseFilterReturn<TFilters> {
  // Search state
  searchQuery: string;
  debouncedQuery: string;
  clientQuery: string;
  shouldFetch: boolean;
  isSearching: boolean;
  
  // Filter state
  filters: TFilters;
  showFilterSheet: boolean;
  
  // Search actions
  handleSearchChange: (text: string) => void;
  handleSearchClear: () => void;
  
  // Filter actions
  handleFilterChange: (newFilters: TFilters) => void;
  handleRemoveFilter: (key: keyof TFilters) => void;
  resetFilters: () => void;
  
  // Filter sheet actions
  setShowFilterSheet: (show: boolean) => void;
  
  // Computed values
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

/**
 * Generic filter hook for list screens
 * 
 * @param initialFilters - Initial filter state
 * @param options - Hook options
 * @returns Filter state and actions
 * 
 * @example
 * const filter = useFilter<JobFilters>({}, { minLength: 2 });
 * 
 * // Use in component
 * <SearchBar
 *   value={filter.searchQuery}
 *   onChangeText={filter.handleSearchChange}
 *   onClear={filter.handleSearchClear}
 * />
 */
export function useFilter<TFilters extends Record<string, any>>(
  initialFilters: TFilters = {} as TFilters,
  options: UseFilterOptions = {}
): UseFilterReturn<TFilters> {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TFilters>(initialFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Search hook - debounced search
  const { debouncedQuery, clientQuery, shouldFetch, isSearching } = useSearch(searchQuery, {
    minLength: options.minLength ?? 2,
    delay: options.delay,
  });

  // Search handlers
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filter handlers
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

  // Computed values
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0 || clientQuery.length > 0;
  }, [activeFilterCount, clientQuery]);

  return {
    // Search state
    searchQuery,
    debouncedQuery,
    clientQuery,
    shouldFetch,
    isSearching,
    
    // Filter state
    filters,
    showFilterSheet,
    
    // Search actions
    handleSearchChange,
    handleSearchClear,
    
    // Filter actions
    handleFilterChange,
    handleRemoveFilter,
    resetFilters,
    
    // Filter sheet actions
    setShowFilterSheet,
    
    // Computed values
    hasActiveFilters,
    activeFilterCount,
  };
}

