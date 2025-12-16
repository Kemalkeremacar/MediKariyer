import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { showAlert } from '@/utils/alert';

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
      // Invalidate all related queries to refresh data (web frontend ile aynı)
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); // Job list may show application status
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Başvuru geri çekilemedi. Lütfen tekrar deneyin.';
      showAlert.error(errorMessage);
    },
  });
};
