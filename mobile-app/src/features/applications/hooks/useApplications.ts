import { useInfiniteQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';

export interface ApplicationFilters {
  status?: string;
  limit?: number;
}

export const useApplications = (filters: ApplicationFilters = {}, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: ['applications', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return applicationService.listApplications({
        page,
        limit: filters.limit || 10,
        status: filters.status || undefined,
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
    staleTime: 1000 * 60 * 3, // 3 dakika cache (başvurular daha dinamik)
    gcTime: 1000 * 60 * 10, // 10 dakika garbage collection
  });
};
