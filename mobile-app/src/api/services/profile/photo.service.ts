/**
 * @file photo.service.ts
 * @description Photo Service - Fotoğraf işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Profile servisinden ayrılan fotoğraf işlemleri
 * 
 * **NOT:** Mobile kendi backend'ini kullanıyor (/api/mobile/doctor/profile/photo/...)
 * Fotoğraf değişiklikleri admin onayı gerektirir.
 * 
 * **Endpoint'ler:**
 * - POST /api/mobile/doctor/profile/photo - Fotoğraf yükleme
 * - GET /api/mobile/doctor/profile/photo/status - Talep durumu
 * - GET /api/mobile/doctor/profile/photo/history - Talep geçmişi
 * - DELETE /api/mobile/doctor/profile/photo/request - Talep iptali
 */

import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  UploadPhotoPayload,
  PhotoRequest,
  PhotoUploadResponse,
  PhotoStatusResponse,
} from '@/types/profile';

// ============================================================================
// PHOTO SERVICE
// ============================================================================

export const photoService = {
  /**
   * Profil fotoğrafı yükler (Mobile API - admin onayı gerekir)
   * 
   * @param payload - Fotoğraf URL'i
   * @returns Oluşturulan fotoğraf değişiklik talebi
   * 
   * **İşlem Akışı:**
   * 1. Fotoğraf yükleme talebi oluşturulur
   * 2. Talep "pending" durumunda bekler
   * 3. Admin talebi onaylar/reddeder
   * 4. Onaylanırsa fotoğraf güncellenir
   * 
   * **Endpoint:** POST /api/mobile/doctor/profile/photo
   */
  async uploadPhoto(payload: UploadPhotoPayload): Promise<PhotoRequest> {
    const response = await apiClient.post<ApiResponse<PhotoUploadResponse | PhotoRequest>>(
      endpoints.doctor.profilePhoto,
      payload,
    );

    // Backend talebi { request } olarak wrap edebilir
    const data = response.data.data;
    if ('request' in data && data.request) {
      return data.request;
    }
    return data as PhotoRequest;
  },

  /**
   * Fotoğraf yükleme isteği durumunu getirir
   * 
   * @returns Mevcut talep durumu veya null
   * 
   * **Durum Değerleri:**
   * - pending: Onay bekliyor
   * - approved: Onaylandı
   * - rejected: Reddedildi
   * - cancelled: İptal edildi
   * 
   * **Endpoint:** GET /api/mobile/doctor/profile/photo/status
   */
  async getPhotoRequestStatus(): Promise<PhotoRequest | null> {
    const response = await apiClient.get<ApiResponse<PhotoStatusResponse | PhotoRequest | null>>(
      endpoints.doctor.photoStatus,
    );

    // Backend: { status, history } veya direkt PhotoRequest döner
    const data = response.data.data;
    if (!data) {
      return null;
    }
    // Status property'si olan wrapper objesi mi kontrol et
    if (typeof data === 'object' && 'status' in data && !('id' in data)) {
      const statusData = data as PhotoStatusResponse;
      return statusData.status ?? null;
    }
    // Direkt PhotoRequest objesi
    return data as PhotoRequest;
  },

  /**
   * Fotoğraf yükleme geçmişini getirir
   * 
   * @returns Geçmiş talepler listesi
   * 
   * **Endpoint:** GET /api/mobile/doctor/profile/photo/history
   */
  async getPhotoRequestHistory(): Promise<PhotoRequest[]> {
    const response = await apiClient.get<ApiResponse<PhotoStatusResponse | PhotoRequest[]>>(
      endpoints.doctor.photoHistory,
    );

    // Backend: { history } veya direkt array döner
    const data = response.data.data;
    if (data && 'history' in data) {
      return data.history ?? [];
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Fotoğraf yükleme isteğini iptal eder
   * 
   * @returns İşlem sonucu
   * 
   * **NOT:** Sadece "pending" durumundaki talepler iptal edilebilir
   * 
   * **Endpoint:** DELETE /api/mobile/doctor/profile/photo/request
   */
  async cancelPhotoRequest(): Promise<{ success: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      endpoints.doctor.photoRequest,
    );
    
    // Backend data içinde { success: boolean } döner
    return response.data.data || { success: true };
  },
};
