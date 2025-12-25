/**
 * Notification Data Structure
 * Backend'den gelen bildirim data objesi yapısı
 * In-App State Update için action ve entity_id kritik alanlar
 */
export interface NotificationData {
  // In-App State Update için kritik alanlar (Backend'den geliyor)
  action?: 'application_created' | 'application_status_changed' | 'application_withdrawn' | 'profile_updated' | 'job_status_changed' | string;
  entity_type?: 'application' | 'profile' | 'job' | string;
  entity_id?: number | string;
  
  // Mevcut veriler (geriye dönük uyumluluk için)
  application_id?: number;
  job_id?: number;
  job_title?: string;
  hospital_name?: string;
  doctor_name?: string;
  doctor_profile_id?: number;
  status?: string;
  status_id?: number;
  notes?: string;
  update_type?: string;
  update_description?: string;
  timestamp?: string;
  old_status?: string;
  new_status?: string;
  changed_by?: string;
  admin_id?: number;
  
  // Diğer alanlar
  [key: string]: unknown;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  isRead: boolean; // camelCase format (backend'den geliyor)
  createdAt: string | null; // camelCase format (backend'den geliyor)
  // Geriye dönük uyumluluk için eski field'lar da destekleniyor
  is_read?: boolean;
  created_at?: string | null;
  // Backend'den gelen ek alanlar
  user_id?: number | null;
  read_at?: string | null;
  data: NotificationData | null;
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

