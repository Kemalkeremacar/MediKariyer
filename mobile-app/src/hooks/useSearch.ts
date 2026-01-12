/**
 * @file useSearch.ts
 * @description Arama Hook'u - Modern, kullanıcı dostu arama deneyimi
 * 
 * Özellikler:
 * - Yazarken sonuçlar kaybolmaz (client-side filtreleme)
 * - Backend'e sadece minimum karakter geçildiğinde istek atılır
 * - Debounce ile performans optimizasyonu
 * - React Native docs tarzında UX
 * 
 * Kullanım Stratejisi:
 * 1. clientQuery: Her zaman mevcut, liste filtreleme için kullanılır
 * 2. debouncedQuery: Backend isteği için kullanılır (minimum karakter geçildiyse)
 * 3. shouldFetch: Backend isteği yapılmalı mı kontrolü
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const { debouncedQuery, clientQuery, shouldFetch } = useSearch(searchQuery);
 * 
 * // Backend isteği - sadece shouldFetch true ise
 * const query = useJobs({ keyword: shouldFetch ? debouncedQuery : undefined });
 * 
 * // Client-side filtreleme - her zaman çalışır
 * const filteredJobs = jobs.filter(job => 
 *   job.title.toLowerCase().includes(clientQuery.toLowerCase())
 * );
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_DELAY } from '@/config/constants';

// ============================================================================
// TİPLER
// ============================================================================

// Hook seçenekleri
export interface UseSearchOptions {
  /**
   * Minimum karakter sayısı - Backend'e istek atmak için
   * Client-side filtreleme için kullanılmaz, sadece backend isteği için
   * @default 2
   */
  minLength?: number;
  /**
   * Debounce delay (ms) - Backend isteği için
   * @default SEARCH_DEBOUNCE_DELAY (800ms)
   */
  delay?: number;
  /**
   * Trim yapılsın mı?
   * @default true
   */
  trim?: boolean;
}

// Hook dönüş tipi
export interface UseSearchReturn {
  /**
   * Backend'e gönderilecek arama sorgusu (minimum karakter geçildiyse)
   * API çağrısı için kullanılır
   */
  debouncedQuery: string;
  /**
   * Client-side filtreleme için arama sorgusu (her zaman mevcut)
   * Liste filtreleme için kullanılır, sonuçlar kaybolmaz
   */
  clientQuery: string;
  /**
   * Backend isteği yapılmalı mı? (minimum karakter geçildi mi?)
   */
  shouldFetch: boolean;
  /**
   * Arama yapılıyor mu? (debounce sırasında veya minimum karakter altında)
   */
  isSearching: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Global arama hook'u - Modern, kullanıcı dostu arama
 * 
 * Özellikler:
 * - Yazarken sonuçlar kaybolmaz (client-side filtreleme)
 * - Backend'e sadece minimum karakter geçildiğinde istek atılır
 * - Debounce ile performans optimizasyonu
 * 
 * @param searchQuery - Arama sorgusu
 * @param options - Hook seçenekleri
 * @returns Arama durumu ve sorgular
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const { debouncedQuery, clientQuery, shouldFetch, isSearching } = useSearch(searchQuery);
 * 
 * // Backend isteği - sadece shouldFetch true ise
 * const query = useJobs({ keyword: shouldFetch ? debouncedQuery : undefined });
 * 
 * // Client-side filtreleme - her zaman çalışır
 * const filteredJobs = jobs.filter(job => 
 *   job.title.toLowerCase().includes(clientQuery.toLowerCase())
 * );
 */
export function useSearch(
  searchQuery: string,
  options: UseSearchOptions = {}
): UseSearchReturn {
  const {
    minLength = 2,
    delay = SEARCH_DEBOUNCE_DELAY,
    trim = true,
  } = options;

  // Trim yap
  const trimmedQuery = trim ? searchQuery.trim() : searchQuery;

  // Debounce uygula (backend isteği için)
  const debouncedQuery = useDebounce(trimmedQuery, delay);

  // Client-side filtreleme için sorgu (her zaman mevcut, kaybolmaz)
  const clientQuery = trimmedQuery;

  // Backend isteği yapılmalı mı? (minimum karakter geçildi mi?)
  const shouldFetch = useMemo(() => {
    return debouncedQuery.length >= minLength;
  }, [debouncedQuery, minLength]);

  // Backend'e gönderilecek sorgu (sadece minimum karakter geçildiyse)
  const backendQuery = useMemo(() => {
    if (!shouldFetch) return '';
    return debouncedQuery;
  }, [debouncedQuery, shouldFetch]);

  // Arama yapılıyor mu? (debounce sırasında veya minimum karakter altında yazılıyorsa)
  const isSearching = useMemo(() => {
    // Kullanıcı yazıyor ama henüz debounce tamamlanmadı
    if (trimmedQuery !== debouncedQuery) return true;
    // Minimum karakter altında yazılıyor
    if (trimmedQuery.length > 0 && trimmedQuery.length < minLength) return true;
    return false;
  }, [trimmedQuery, debouncedQuery, minLength]);

  return {
    debouncedQuery: backendQuery,
    clientQuery,
    shouldFetch,
    isSearching,
  };
}

