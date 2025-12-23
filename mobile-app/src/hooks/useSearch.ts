/**
 * @file useSearch.ts
 * @description Global search hook - Modern, kullanıcı dostu arama hook'u
 * React Native docs tarzında: Yazarken sonuçlar kaybolmaz, client-side filtreleme yapılır
 */

import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_DELAY } from '@/config/constants';

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

/**
 * Global search hook - Modern, kullanıcı dostu arama
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

