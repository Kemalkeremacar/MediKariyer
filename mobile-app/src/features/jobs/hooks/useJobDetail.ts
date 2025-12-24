import { useQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { jobService, ApplyJobPayload } from '@/api/services/job.service';
import { queryKeys } from '@/api/queryKeys';
import { JobDetail, JobsResponse } from '@/types/job';

export const useJobDetail = (jobId: number) => {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => jobService.getJobDetail(jobId),
    enabled: !!jobId,
    staleTime: 0, // Her zaman fresh (dinamik proje - başvuru durumu değişebilir)
    gcTime: 1000 * 30, // 30 saniye cache (loading sırasında boş görünmesin)
    refetchOnMount: true, // Stale data varsa refetch yap (cache'deki veriyi göster, arka planda yenile)
    refetchOnWindowFocus: true, // Ekran focus olduğunda yenile
    refetchOnReconnect: true, // Bağlantı yenilendiğinde yenile
  });
};

/**
 * İş ilanına başvuru hook'u
 * 
 * Optimistic Update desteği:
 * - Kullanıcı başvur butonuna bastığında UI anında güncellenir
 * - Sunucu hatası durumunda rollback yapılır
 * - Başarılı durumda cache invalidate edilir
 */
export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplyJobPayload) => jobService.applyToJob(payload),

    // Optimistic Update: UI'ı sunucu yanıtı beklemeden güncelle
    onMutate: async (payload: ApplyJobPayload) => {
      const { jobId } = payload;

      // İlgili query'leri iptal et
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });

      // Mevcut job detail verisini snapshot olarak al
      const previousJobDetail = queryClient.getQueryData<JobDetail>(
        queryKeys.jobs.detail(jobId)
      );

      // Mevcut jobs list verisini snapshot olarak al
      const previousJobsList = queryClient.getQueriesData<InfiniteData<JobsResponse>>({
        queryKey: queryKeys.jobs.all,
      });

      // Job detail'i optimistic olarak güncelle
      queryClient.setQueryData<JobDetail>(
        queryKeys.jobs.detail(jobId),
        (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, is_applied: true };
        }
      );

      // Jobs list'i optimistic olarak güncelle (infinite query)
      queryClient.setQueriesData<InfiniteData<JobsResponse>>(
        { queryKey: queryKeys.jobs.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((job) =>
                job.id === jobId
                  ? { ...job, is_applied: true }
                  : job
              ),
            })),
          };
        }
      );

      // Rollback için önceki verileri döndür
      return { previousJobDetail, previousJobsList, jobId };
    },

    // Hata durumunda rollback
    onError: (_error, _payload, context) => {
      if (context?.previousJobDetail) {
        queryClient.setQueryData(
          queryKeys.jobs.detail(context.jobId),
          context.previousJobDetail
        );
      }

      if (context?.previousJobsList) {
        context.previousJobsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Her durumda (başarılı/başarısız) çalışır
    onSettled: (_, __, payload) => {
      // Sunucudan güncel veriyi al
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(payload.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      // Başvurular listesini de güncelle (yeni başvuru eklendi)
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
};
