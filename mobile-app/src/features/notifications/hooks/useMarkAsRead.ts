import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/utils/alert';
import { notificationService } from '@/api/services/notification.service';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      showAlert.error('Bildirim okundu olarak işaretlenemedi. Lütfen tekrar deneyin.');
    },
  });
};
