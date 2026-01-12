/**
 * @file notification.ts
 * @description Bildirim tip tanımları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Bildirim data yapısı (In-App State Update için)
 * - Bildirim öğesi tipleri
 * - Push notification tipleri
 * - Backend API yanıt yapıları
 */

// ============================================================================
// NOTIFICATION DATA
// ============================================================================

/**
 * Bildirim Data Yapısı
 * Backend'den gelen bildirim data objesi yapısı
 * In-App State Update için action ve entity_id kritik alanlar
 */
export interface NotificationData {
  // ============================================================================
  // IN-APP STATE UPDATE İÇİN KRİTİK ALANLAR (Backend'den geliyor)
  // ============================================================================
  
  /** 
   * Bildirim aksiyonu - In-App State Update için kullanılır
   * Bu alan hangi query'lerin invalidate edileceğini belirler
   */
  action?: 'application_created' | 'application_status_changed' | 'application_withdrawn' | 'profile_updated' | 'job_status_changed' | string;
  
  /** Entity tipi (application, profile, job, vb.) */
  entity_type?: 'application' | 'profile' | 'job' | string;
  
  /** Entity ID - Spesifik query invalidation için */
  entity_id?: number | string;
  
  // ============================================================================
  // MEVCUT VERİLER (Geriye dönük uyumluluk için)
  // ============================================================================
  
  /** Başvuru ID */
  application_id?: number;
  /** İş ilanı ID */
  job_id?: number;
  /** İş ilanı başlığı */
  job_title?: string;
  /** Hastane adı */
  hospital_name?: string;
  /** Doktor adı */
  doctor_name?: string;
  /** Doktor profil ID */
  doctor_profile_id?: number;
  /** Durum */
  status?: string;
  /** Durum ID */
  status_id?: number;
  /** Notlar */
  notes?: string;
  /** Güncelleme tipi */
  update_type?: string;
  /** Güncelleme açıklaması */
  update_description?: string;
  /** Zaman damgası */
  timestamp?: string;
  /** Eski durum */
  old_status?: string;
  /** Yeni durum */
  new_status?: string;
  /** Değiştiren kişi */
  changed_by?: string;
  /** Admin ID */
  admin_id?: number;
  
  /** Diğer alanlar */
  [key: string]: unknown;
}

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

/**
 * Bildirim öğesi
 * Bildirim listesinde gösterilen bildirim yapısı
 */
export interface NotificationItem {
  /** Bildirim ID */
  id: number;
  /** Bildirim başlığı */
  title: string;
  /** Bildirim içeriği */
  body: string;
  /** Bildirim tipi */
  type: 'info' | 'success' | 'warning' | 'error' | string;
  /** Okundu mu? (camelCase format - backend'den geliyor) */
  isRead: boolean;
  /** Oluşturulma tarihi (camelCase format - backend'den geliyor) */
  createdAt: string | null;
  
  // Geriye dönük uyumluluk için eski field'lar
  /** Okundu mu? (snake_case format) */
  is_read?: boolean;
  /** Oluşturulma tarihi (snake_case format) */
  created_at?: string | null;
  
  // Backend'den gelen ek alanlar
  /** Kullanıcı ID */
  user_id?: number | null;
  /** Okunma tarihi */
  read_at?: string | null;
  
  /** Bildirim data objesi */
  data: NotificationData | null;
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Bildirimler API yanıtı
 * GET /api/mobile/notifications
 */
export interface NotificationsResponse {
  /** Bildirim listesi */
  data: NotificationItem[];
  /** Pagination bilgisi */
  pagination: import('./api').PaginationMeta;
}

// ============================================================================
// PUSH NOTIFICATION TYPES
// ============================================================================

/**
 * Cihaz token kayıt payload'ı
 * POST /api/mobile/notifications/register-device
 */
export interface RegisterDeviceTokenPayload {
  /** Expo push token */
  expo_push_token: string;
  /** Cihaz ID */
  device_id: string;
  /** Platform (iOS veya Android) */
  platform: 'ios' | 'android';
  /** Uygulama versiyonu */
  app_version?: string | null;
}
