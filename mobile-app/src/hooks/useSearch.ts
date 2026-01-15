/**
 * @file useSearch.ts
 * @description Arama Hook'u - Modern, kullanıcı dostu arama deneyimi
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **Özellikler:**
 * - Yazarken sonuçlar kaybolmaz (client-side filtreleme)
 * - Backend'e sadece minimum karakter geçildiğinde istek
 * - Debounce ile performans optimizasyonu
 * - React Native docs tarzında UX
 * 
 * **Kullanım Stratejisi:**
 * 1. clientQuery: Her zaman mevcut, liste filtreleme için
 * 2. debouncedQuery: Backend isteği için (minimum karakter geçildiyse)
 * 3. shouldFetch: Backend isteği yapılmalı mı kontrolü
 * 4. isSearching: Kullanıcıya loading göstergesi için
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

  // Arama yapılıyor mu? (sadece debounce sırasında)
  // minLength altı durumlar UI warning ile gösterilir, loading gösterilmez
  const isSearching = useMemo(() => {
    // Kullanıcı yazıyor ama henüz debounce tamamlanmadı
    return trimmedQuery !== debouncedQuery && trimmedQuery.length >= minLength;
  }, [trimmedQuery, debouncedQuery, minLength]);

  return {
    debouncedQuery, // Backend'e gönderilecek sorgu (shouldFetch ile birlikte kullanılmalı)
    clientQuery, // Client-side filtreleme için her zaman mevcut
    shouldFetch, // Backend isteği yapılmalı mı?
    isSearching, // Arama yapılıyor mu?
  };
}

