import { useInfiniteQuery } from '@tanstack/react-query';
import { jobService, JobListParams } from '@/api/services/job.service';

export const useJobs = (params: JobListParams = {}, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: ['jobs', params],
    queryFn: ({ pageParam = 1 }) =>
      jobService.listJobs({
        ...params,
        page: pageParam,
        limit: params.limit || 10,
      }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination?.has_next 
        ? lastPage.pagination.current_page + 1 
        : undefined,
    initialPageParam: 1,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    gcTime: 1000 * 60 * 10, // 10 dakika garbage collection
  });
};
