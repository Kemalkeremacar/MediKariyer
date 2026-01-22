/**
 * @file notification.service.ts
 * @description Notification service - Bildirim işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - List notifications (bildirim listesi)
 * - Mark as read (okundu işaretle)
 * - Get unread count (okunmamış sayısı)
 * - Register device token (push notification için)
 * 
 * Endpoint'ler: /api/mobile/notifications/*
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse, PaginationMeta } from '@/types/api';
import type {
  NotificationItem,
  NotificationsResponse,
  RegisterDeviceTokenPayload,
} from '@/types/notification';
import { validatePaginatedResponse, validateSingleItemResponse, validateApiResponse, validateResponseData } from '@/utils/apiValidator';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: string;
}

export const notificationService = {
  /**
   * Device token kaydı - Push notification için
   */
  async registerDeviceToken(payload: RegisterDeviceTokenPayload): Promise<{ device_token_id: number }> {
    const response = await apiClient.post<ApiResponse<{ device_token_id: number }>>(
      endpoints.deviceToken,
      payload,
    );
    
    // FIXED: Validate response structure
    return validateSingleItemResponse<{ device_token_id: number }>(response.data, endpoints.deviceToken);
  },

  /**
   * Bildirim listesini getirir (pagination ile)
   * @param {NotificationListParams} params - Filtreleme ve pagination parametreleri
   * @returns {Promise<NotificationsResponse>} Bildirim listesi ve pagination bilgisi
   */
  async listNotifications(params: NotificationListParams = {}): Promise<NotificationsResponse> {
    const response = await apiClient.get<
      ApiResponse<NotificationItem[]> & { pagination?: PaginationMeta }
    >(endpoints.notifications.list, {
      params,
    });
    
    const responseData = response.data;
    
    // Backend'den gelen response iki farklı formatta olabilir:
    // 1. sendSuccess kullanıyorsa: { data: { data: [...], pagination: {...} } }
    // 2. sendPaginated kullanıyorsa: { data: [...], pagination: {...} }
    
    let notificationData: NotificationItem[];
    let pagination: PaginationMeta | undefined;
    
    // Nested data yapısını kontrol et
    const isNestedData = responseData.data && 
                         typeof responseData.data === 'object' && 
                         !Array.isArray(responseData.data) &&
                         'data' in responseData.data;
    
    if (isNestedData) {
      // Nested yapı (sendSuccess ile)
      notificationData = (responseData.data as any).data || [];
      pagination = (responseData.data as any).pagination;
    } else {
      // Düz yapı (sendPaginated ile)
      notificationData = responseData.data || [];
      pagination = responseData.pagination;
    }
    
    // FIXED: Validate pagination structure
    if (!pagination) {
      throw new Error('Pagination bilgisi alınamadı');
    }
    
    return {
      data: notificationData,
      pagination,
    };
  },

  /**
   * Bildirimi okundu olarak işaretler
   * @param {number} notificationId - Bildirim ID'si
   * @returns {Promise<{ success: boolean }>} İşlem sonucu
   */
  async markAsRead(notificationId: number): Promise<{ success: boolean }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      endpoints.notifications.markAsRead(notificationId),
    );
    
    // FIXED: Validate response structure
    validateApiResponse<{ success: boolean }>(response.data, endpoints.notifications.markAsRead(notificationId));
    validateResponseData(response.data, endpoints.notifications.markAsRead(notificationId));
    
    return response.data.data;
  },

  /**
   * Okunmamış bildirim sayısını getirir (toplam sayı ile birlikte)
   * @returns {Promise<{ count: number, unreadCount: number, totalCount: number }>}
   */
  async getUnreadCount(): Promise<{ count: number; unreadCount: number; totalCount: number }> {
    const response = await apiClient.get<ApiResponse<{ count: number; unreadCount: number; totalCount: number }>>(
      endpoints.notifications.unreadCount,
    );
    
    // FIXED: Validate response structure
    return validateSingleItemResponse<{ count: number; unreadCount: number; totalCount: number }>(
      response.data, 
      endpoints.notifications.unreadCount
    );
  },

  /**
   * Bildirimi siler
   * @param {number} notificationId - Bildirim ID'si
   * @returns {Promise<{ success: boolean }>} İşlem sonucu
   */
  async deleteNotification(notificationId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      endpoints.notifications.delete(notificationId),
    );
    
    // FIXED: Validate response structure
    validateApiResponse<{ success: boolean }>(response.data, endpoints.notifications.delete(notificationId));
    validateResponseData(response.data, endpoints.notifications.delete(notificationId));
    
    return response.data.data;
  },

  /**
   * Birden fazla bildirimi siler
   * @param {number[]} notificationIds - Bildirim ID'leri
   * @returns {Promise<{ success: boolean; deleted_count: number }>} İşlem sonucu
   */
  async deleteNotifications(notificationIds: number[]): Promise<{ success: boolean; deleted_count: number }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; deleted_count: number }>>(
      endpoints.notifications.deleteMany,
      { notification_ids: notificationIds },
    );
    
    // FIXED: Validate response structure
    return validateSingleItemResponse<{ success: boolean; deleted_count: number }>(
      response.data,
      endpoints.notifications.deleteMany
    );
  },

  /**
   * Okunmuş bildirimleri temizler
   * @returns {Promise<{ count: number }>} Silinen bildirim sayısı
   */
  async clearReadNotifications(): Promise<{ count: number }> {
    const response = await apiClient.delete<ApiResponse<{ count: number }>>(
      endpoints.notifications.clearRead,
    );
    
    // FIXED: Validate response structure
    return validateSingleItemResponse<{ count: number }>(
      response.data,
      endpoints.notifications.clearRead
    );
  },
};

