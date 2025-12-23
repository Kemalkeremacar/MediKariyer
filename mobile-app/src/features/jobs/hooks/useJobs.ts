import { useInfiniteQuery } from '@tanstack/react-query';
import { jobService, JobListParams } from '@/api/services/job.service';
import { CACHE_STALE_TIME, CACHE_TIME, PAGINATION } from '@/config/constants';
import { queryKeys } from '@/api/queryKeys';

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
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_TIME,
    // Debounce için: queryKey değiştiğinde hemen tetikleme, biraz bekle
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
