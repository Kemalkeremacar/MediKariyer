import { useInfiniteQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { queryKeys } from '@/api/queryKeys';

export interface ApplicationFilters {
  status?: string;
  keyword?: string;
  limit?: number;
}

export const useApplications = (filters: ApplicationFilters = {}, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.applications.list(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return applicationService.listApplications({
        page,
        limit: filters.limit || 10,
        status: filters.status || undefined,
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
    staleTime: 0, // Her zaman fresh (dinamik proje - başvuru durumları değişebilir)
    gcTime: 1000 * 30, // 30 saniye cache (loading sırasında boş görünmesin)
    refetchOnMount: true, // Stale data varsa refetch yap (cache'deki veriyi göster, arka planda yenile)
    refetchOnWindowFocus: true, // Ekran focus olduğunda yenile
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
  });
};
