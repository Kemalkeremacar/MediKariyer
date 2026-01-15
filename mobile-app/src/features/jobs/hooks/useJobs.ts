/**
 * @file useJobs.ts
 * @description İş ilanları listesi hook'u
 * 
 * Bu dosya iş ilanları listesini infinite scroll ile getirme işlemini yönetir.
 * Filtreleme ve pagination desteği sağlar.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { jobService, JobListParams } from '@/api/services/job.service';
import { PAGINATION } from '@/config/constants';
import { queryKeys } from '@/api/queryKeys';

/**
 * İş ilanları listesi hook'u (infinite scroll destekli)
 * 
 * **Özellikler:**
 * - Infinite scroll pagination
 * - Filtreleme desteği (branş, şehir, çalışma tipi, arama)
 * - Optimize edilmiş cache stratejisi
 * - Akıllı refetch davranışı
 * 
 * **Cache Stratejisi:**
 * - staleTime: 5 dakika (ilanlar sık değişmez, gereksiz istek önleme)
 * - gcTime: 10 dakika (daha uzun cache = daha az network)
 * - refetchOnMount: true (stale data varsa yenile, fresh ise cache'den)
 * - refetchOnWindowFocus: false (mobilde gereksiz)
 * 
 * @param params - Filtreleme parametreleri
 * @param enabled - Query'nin aktif olup olmadığı
 * @returns İş ilanları listesi ve pagination durumu
 */
export const useJobs = (params: JobListParams = {}, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: ({ pageParam = 1 }) =>
      jobService.listJobs({
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
    staleTime: 1000 * 60 * 5, // 5 dakika - global config ile uyumlu, gereksiz istek önleme
    gcTime: 1000 * 60 * 10, // 10 dakika
    refetchOnMount: true, // Stale ise refetch, fresh ise cache'den
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
