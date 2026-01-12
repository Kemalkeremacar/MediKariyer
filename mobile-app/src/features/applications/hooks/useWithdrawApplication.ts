/**
 * @file useWithdrawApplication.ts
 * @description Başvuru geri çekme hook'u
 * 
 * Bu hook kullanıcının başvurusunu geri çekmesini sağlar.
 * Optimistic update ile kullanıcı deneyimini iyileştirir.
 * 
 * **Web frontend ile uyumlu:**
 * - PATCH /applications/:id/withdraw endpoint'ini kullanır
 * - Optimistic Update: UI'ı hemen günceller, hata durumunda rollback yapar
 * - Başarılı işlemde ilgili cache'leri invalidate eder
 * - Alert helper kullanır (proje standardı)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { applicationService, ApplicationsListResponse } from '@/api/services/application.service';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { handleApiError } from '@/utils/errorHandler';
import { queryKeys } from '@/api/queryKeys';

/**
 * Başvuru geri çekme parametreleri
 * 
 * @interface WithdrawApplicationParams
 * @property {number} applicationId - Başvuru ID'si
 * @property {string} [reason] - Geri çekme nedeni (opsiyonel)
 */
interface WithdrawApplicationParams {
  applicationId: number;
  reason?: string;
}

/**
 * Başvuru geri çekme hook'u
 * 
 * **Optimistic Update Akışı:**
 * 1. onMutate: UI'ı hemen güncelle (durum: "Geri Çekildi")
 * 2. mutationFn: Backend'e istek gönder
 * 3. onError: Hata varsa rollback yap
 * 4. onSettled: Her durumda cache'i invalidate et
 * 5. onSuccess: Başarı mesajı göster
 * 
 * **Kullanım:**
 * ```tsx
 * const withdraw = useWithdrawApplication();
 * 
 * withdraw.mutate({
 *   applicationId: 123,
 *   reason: 'Başka bir iş buldum'
 * });
 * ```
 * 
 * @returns Mutation hook
 */
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  const alert = useAlertHelpers();

  return useMutation({
    mutationFn: ({ applicationId, reason }: WithdrawApplicationParams) =>
      applicationService.withdraw(applicationId, reason),

    // Optimistic Update: UI'ı sunucu yanıtı beklemeden güncelle
    onMutate: async ({ applicationId }: WithdrawApplicationParams) => {
      // İlgili query'leri iptal et (race condition önleme)
      await queryClient.cancelQueries({ queryKey: queryKeys.applications.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });

      // Mevcut veriyi snapshot olarak al (rollback için)
      const previousApplications = queryClient.getQueriesData<InfiniteData<ApplicationsListResponse>>({
        queryKey: queryKeys.applications.all,
      });

      // Application verisinden job_id'yi bul (job detail cache'ini invalidate etmek için)
      let jobId: number | null = null;
      const applicationDetail = queryClient.getQueryData<import('@/types/application').ApplicationDetail>(
        queryKeys.applications.detail(applicationId)
      );
      
      if (applicationDetail?.job_id) {
        jobId = applicationDetail.job_id;
      } else {
        // Eğer detail cache'de yoksa, list'ten bul
        const allApplications = queryClient.getQueriesData<InfiniteData<ApplicationsListResponse>>({
          queryKey: queryKeys.applications.all,
        });
        
        for (const [, data] of allApplications) {
          if (data?.pages && Array.isArray(data.pages)) {
            for (const page of data.pages) {
              if (page?.data && Array.isArray(page.data)) {
                const app = page.data.find((a) => a?.id === applicationId);
                if (app?.job_id) {
                  jobId = app.job_id;
                  break;
                }
              }
            }
            if (jobId) break;
          }
        }
      }

      // Tüm applications query'lerini optimistic olarak güncelle
      queryClient.setQueriesData<InfiniteData<ApplicationsListResponse>>(
        { queryKey: queryKeys.applications.all },
        (oldData) => {
          if (!oldData || !oldData.pages || !Array.isArray(oldData.pages)) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              if (!page || !page.data || !Array.isArray(page.data)) {
                return page;
              }
              return {
                ...page,
                data: page.data.map((app) =>
                  app.id === applicationId
                    ? { ...app, status_id: 5, status: 'Geri Çekildi' }
                    : app
                ),
              };
            }),
          };
        }
      );

      // Detail query'sini de güncelle (eğer açıksa)
      queryClient.setQueryData(
        queryKeys.applications.detail(applicationId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, status_id: 5, status: 'Geri Çekildi' };
        }
      );

      // Rollback için önceki veriyi döndür
      return { previousApplications, jobId };
    },

    // Hata durumunda rollback
    onError: (error: Error, _params, context) => {
      // Önceki veriyi geri yükle
      if (context?.previousApplications) {
        context.previousApplications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleApiError(error, '/applications/withdraw');
      alert.error(errorMessage);
    },

    // Her durumda (başarılı/başarısız) çalışır
    onSettled: (_data, _error, _params, context) => {
      // Sunucudan güncel veriyi al
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      
      // Job detail cache'ini de invalidate et (eğer job_id bulunduysa)
      // Bu sayede geri çekilmiş başvuru sonrası job detail'de "Başvuruldu" yerine "Hemen Başvur" butonu gösterilir
      if (context?.jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(context.jobId) });
      }
    },

    onSuccess: () => {
      alert.success('Başvuru başarıyla geri çekildi');
    },
  });
};
