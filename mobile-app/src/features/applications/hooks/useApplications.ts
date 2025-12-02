import { useInfiniteQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import type { ApplicationsListResponse } from '@/api/services/application.service';

export interface ApplicationFilters {
  status?: string;
}

export const useApplications = (filters: ApplicationFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['applications', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return applicationService.listApplications({
        page,
        limit: 10,
        status: filters.status || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.meta;
      if (!pagination) {
        return undefined;
      }
      if (pagination.has_next) {
        return (pagination.current_page ?? 1) + 1;
      }
      return undefined;
    },
  });
};
