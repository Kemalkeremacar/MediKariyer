import { useInfiniteQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { queryKeys } from '@/api/queryKeys';

export interface ApplicationFilters {
  status_id?: number;
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
