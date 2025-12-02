import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, ApplyJobPayload } from '@/api/services/job.service';

export const useJobDetail = (jobId: number) => {
  return useQuery({
    queryKey: ['jobDetail', jobId],
    queryFn: () => jobService.getJobDetail(jobId),
    enabled: !!jobId,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplyJobPayload) => jobService.applyToJob(payload),
    onSuccess: (_, variables) => {
      // Invalidate job detail to update is_applied status
      queryClient.invalidateQueries({ queryKey: ['jobDetail', variables.jobId] });
      // Invalidate jobs list to update is_applied status in list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
