export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  is_read: boolean;
  created_at: string | null;
  data: Record<string, unknown> | null;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  pagination: import('./api').PaginationMeta;
}

export interface RegisterDeviceTokenPayload {
  expo_push_token: string;
  device_id: string;
  platform: 'ios' | 'android';
  app_version?: string | null;
}

