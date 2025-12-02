import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      Alert.alert(
        'İşlem başarısız',
        'Bildirim okundu olarak işaretlenemedi. Lütfen tekrar deneyin.'
      );
    },
  });
};
