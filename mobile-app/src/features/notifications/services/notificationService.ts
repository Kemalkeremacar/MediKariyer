import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  NotificationItem,
  NotificationsResponse,
  RegisterDeviceTokenPayload,
  NotificationListParams,
} from '../types';

const unwrap = <T>(response: ApiResponse<T> | T): T =>
  (response as ApiResponse<T>).data ?? (response as T);

export const notificationService = {
  async registerDeviceToken(payload: RegisterDeviceTokenPayload) {
    const response = await apiClient.post<ApiResponse<{ device_token_id: number }>>(
      endpoints.deviceToken,
      payload
    );
    return unwrap(response.data);
  },

  async listNotifications(params: NotificationListParams = {}) {
    const response = await apiClient.get<ApiResponse<NotificationsResponse>>(
      endpoints.notifications.list,
      {
        params,
      }
    );
    return unwrap(response.data);
  },

  async markAsRead(notificationId: number) {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      endpoints.notifications.markAsRead(notificationId)
    );
    return unwrap(response.data);
  },
};
