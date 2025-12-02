import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { applicationService } from '@/api/services/application.service';

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) =>
      applicationService.withdraw(applicationId),
    onSuccess: () => {
      Alert.alert('Başarılı', 'Başvuru geri çekildi');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application'] });
    },
    onError: () => {
      Alert.alert('Hata', 'Başvuru geri çekilemedi');
    },
  });
};
