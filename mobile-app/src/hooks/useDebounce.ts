/**
 * @file useDebounce.ts
 * @description Debounce hook - Performans optimizasyonu
 * 
 * Kullanım Alanları:
 * - Arama inputları (her tuş vuruşunda API çağrısı yapmamak için)
 * - Form validasyonu (kullanıcı yazmayı bitirene kadar beklemek için)
 * - Scroll event'leri (performans için)
 * 
 * Nasıl Çalışır:
 * - Değer değiştiğinde hemen güncelleme yapmaz
 * - Belirtilen süre kadar bekler
 * - Süre içinde yeni değişiklik gelirse timer sıfırlanır
 * - Süre dolduğunda son değeri döndürür
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // API çağrısı sadece kullanıcı 500ms yazmayı bıraktığında yapılır
 *   searchAPI(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useState } from 'react';

/**
 * Debounce hook - Değer değişikliklerini geciktirir
 * @template T - Debounce edilecek değerin tipi
 * @param value - Debounce edilecek değer
 * @param delay - Gecikme süresi (ms) - varsayılan 500ms
 * @returns Debounce edilmiş değer
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Değer değiştiğinde timer başlat
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Yeni değer gelirse veya component unmount olursa timer'ı temizle
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
