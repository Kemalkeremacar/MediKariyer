import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { showAlert } from '@/utils/alert';
import { handleApiError } from '@/utils/errorHandler';
import { queryKeys } from '@/api/queryKeys';

/**
 * Başvuru geri çekme hook'u
 * 
 * Web frontend ile uyumlu şekilde çalışır:
 * - PATCH /applications/:id/withdraw endpoint'ini kullanır
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
    onSuccess: () => {
      showAlert.success('Başvuru başarıyla geri çekildi');
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
    onError: (error: Error) => {
      const errorMessage = handleApiError(error, '/applications/withdraw');
      showAlert.error(errorMessage);
    },
  });
};
