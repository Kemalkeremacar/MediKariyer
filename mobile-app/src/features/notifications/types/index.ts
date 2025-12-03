/**
 * Notification Feature Types
 */

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

export type NotificationItem = Notification;

export interface NotificationResponse {
  data: Notification[];
  meta: {
    total: number;
    unread_count: number;
  };
}

export type NotificationsResponse = NotificationResponse;

export interface RegisterDeviceTokenPayload {
  device_token: string;
  platform: 'ios' | 'android';
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
}
