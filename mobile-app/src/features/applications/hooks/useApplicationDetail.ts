import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';

export const useApplicationDetail = (applicationId: number | null, enabled: boolean = true) => {
  return useQuery({
    enabled: enabled && Boolean(applicationId),
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationDetail(applicationId as number),
  });
};
