import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { queryKeys } from '@/api/queryKeys';

export const useApplicationDetail = (applicationId: number | null, enabled: boolean = true) => {
  const isEnabled = enabled && Boolean(applicationId) && applicationId !== null;
  
  return useQuery({
    enabled: isEnabled,
    queryKey: isEnabled ? queryKeys.applications.detail(applicationId as number) : ['applications', 'detail', null],
    queryFn: () => {
      if (!applicationId || applicationId === null) {
        throw new Error('Application ID is required');
      }
      return applicationService.getApplicationDetail(applicationId);
    },
    staleTime: 0, // Her zaman fresh (dinamik proje - başvuru durumu değişebilir)
    gcTime: 1000 * 30, // 30 saniye cache (loading sırasında boş görünmesin)
    refetchOnMount: true, // Stale data varsa refetch yap (cache'deki veriyi göster, arka planda yenile)
    refetchOnWindowFocus: true, // Ekran focus olduğunda yenile
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
  });
};
