/**
 * @file useCongresses.ts
 * @description Kongre listesi hook'u
 * 
 * Bu dosya kongre listesini infinite scroll ile getirme işlemini yönetir.
 * Filtreleme ve pagination desteği sağlar.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { congressService, CongressListParams } from '@/api/services/congress.service';
import { PAGINATION } from '@/config/constants';
import { queryKeys } from '@/api/queryKeys';

/**
 * Kongre listesi hook'u (infinite scroll destekli)
 * 
 * **Özellikler:**
 * - Infinite scroll pagination
 * - Filtreleme desteği (branş, şehir, ülke, arama)
 * - Optimize edilmiş cache stratejisi
 * - Akıllı refetch davranışı
 * 
 * **Cache Stratejisi:**
 * - staleTime: 5 dakika (kongreler sık değişmez, gereksiz istek önleme)
 * - gcTime: 10 dakika (daha uzun cache = daha az network)
 * - refetchOnMount: true (stale data varsa yenile, fresh ise cache'den)
 * - refetchOnWindowFocus: false (mobilde gereksiz)
 * 
 * @param params - Filtreleme parametreleri
 * @param enabled - Query'nin aktif olup olmadığı
 * @returns Kongre listesi ve pagination durumu
 */
export const useCongresses = (params: CongressListParams = {}, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.congresses.list(params),
    queryFn: ({ pageParam = 1 }) =>
      congressService.listCongresses({
        ...params,
        page: pageParam,
        limit: params.limit || PAGINATION.JOBS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination?.has_next 
        ? lastPage.pagination.current_page + 1 
        : undefined,
    initialPageParam: 1,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
