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
 * - Filtreleme desteği (branş, şehir, çalışma tipi)
 * - Her zaman fresh data (staleTime: 0)
 * - 30 saniye cache
 * - Focus/reconnect'te otomatik yenileme
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
    staleTime: 0, // Her zaman fresh (dinamik proje - yeni ilanlar eklenebilir)
    gcTime: 1000 * 30, // 30 saniye cache (loading sırasında boş görünmesin)
    refetchOnMount: true, // Stale data varsa refetch yap (cache'deki veriyi göster, arka planda yenile)
    refetchOnWindowFocus: true, // Ekran focus olduğunda yenile
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
  });
};
