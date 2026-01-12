/**
 * @file useApplications.ts
 * @description Başvurular listesi hook'u
 * 
 * Bu hook kullanıcının başvurularını infinite scroll ile getirir.
 * Durum ve anahtar kelime filtreleme desteği sağlar.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { queryKeys } from '@/api/queryKeys';

/**
 * Başvuru filtreleme parametreleri
 * 
 * @interface ApplicationFilters
 * @property {number} [status_id] - Durum ID'si (1: Beklemede, 2: Değerlendiriliyor, vb.)
 * @property {string} [keyword] - Arama kelimesi
 * @property {number} [limit] - Sayfa başına kayıt sayısı
 */
export interface ApplicationFilters {
  status_id?: number;
  keyword?: string;
  limit?: number;
}

/**
 * Başvurular listesi hook'u (infinite scroll destekli)
 * 
 * **Özellikler:**
 * - Infinite scroll pagination
 * - Durum ve anahtar kelime filtreleme
 * - Her zaman fresh data (staleTime: 0)
 * - 30 saniye cache
 * - Focus/reconnect'te otomatik yenileme
 * 
 * @param filters - Filtreleme parametreleri
 * @param enabled - Query'nin aktif olup olmadığı
 * @returns Başvurular listesi ve pagination durumu
 */
export const useApplications = (filters: ApplicationFilters = {}, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.applications.list(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return applicationService.listApplications({
        page,
        limit: filters.limit || 10,
        status_id: filters.status_id || undefined,
        keyword: filters.keyword || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) {
        return undefined;
      }
      if (pagination.has_next) {
        return pagination.current_page + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
