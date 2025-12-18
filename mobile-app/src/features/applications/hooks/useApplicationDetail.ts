import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { queryKeys } from '@/api/queryKeys';

export const useApplicationDetail = (applicationId: number | null, enabled: boolean = true) => {
  return useQuery({
    enabled: enabled && Boolean(applicationId),
    queryKey: queryKeys.applications.detail(applicationId as number),
    queryFn: () => applicationService.getApplicationDetail(applicationId as number),
  });
};
