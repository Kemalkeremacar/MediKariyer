import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { applicationService, ApplicationsListResponse } from '@/api/services/application.service';
import { showAlert } from '@/utils/alert';
import { handleApiError } from '@/utils/errorHandler';
import { queryKeys } from '@/api/queryKeys';

/**
 * Başvuru geri çekme hook'u
 * 
 * Web frontend ile uyumlu şekilde çalışır:
 * - PATCH /applications/:id/withdraw endpoint'ini kullanır
 * - Optimistic Update: UI'ı hemen günceller, hata durumunda rollback yapar
 * - Başarılı işlemde ilgili cache'leri invalidate eder
 * - Alert helper kullanır (proje standardı)
 * 
 * @returns Mutation hook
 */
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) =>
      applicationService.withdraw(applicationId),

    // Optimistic Update: UI'ı sunucu yanıtı beklemeden güncelle
    onMutate: async (applicationId: number) => {
      // İlgili query'leri iptal et (race condition önleme)
      await queryClient.cancelQueries({ queryKey: queryKeys.applications.all });

      // Mevcut veriyi snapshot olarak al (rollback için)
      const previousApplications = queryClient.getQueriesData<InfiniteData<ApplicationsListResponse>>({
        queryKey: queryKeys.applications.all,
      });

      // Tüm applications query'lerini optimistic olarak güncelle
      queryClient.setQueriesData<InfiniteData<ApplicationsListResponse>>(
        { queryKey: queryKeys.applications.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((app) =>
                app.id === applicationId
                  ? { ...app, status: 'withdrawn' }
                  : app
              ),
            })),
          };
        }
      );

      // Detail query'sini de güncelle (eğer açıksa)
      queryClient.setQueryData(
        queryKeys.applications.detail(applicationId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, status: 'withdrawn' };
        }
      );

      // Rollback için önceki veriyi döndür
      return { previousApplications };
    },

    // Hata durumunda rollback
    onError: (error: Error, _applicationId, context) => {
      // Önceki veriyi geri yükle
      if (context?.previousApplications) {
        context.previousApplications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleApiError(error, '/applications/withdraw');
      showAlert.error(errorMessage);
    },

    // Her durumda (başarılı/başarısız) çalışır
    onSettled: () => {
      // Sunucudan güncel veriyi al
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },

    onSuccess: () => {
      showAlert.success('Başvuru başarıyla geri çekildi');
    },
  });
};
