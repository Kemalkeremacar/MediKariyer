/**
 * Photo Service
 * ARCH-002: Profile servisinden ayrılan fotoğraf işlemleri
 * 
 * Not: Mobile kendi backend'ini kullanıyor (/api/mobile/doctor/profile/photo/...)
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

export const photoService = {
  /**
   * Profil fotoğrafı yükler (Mobile API - admin onayı gerekir)
   */
  async uploadPhoto(payload: UploadPhotoPayload): Promise<PhotoRequest> {
    const response = await apiClient.post<ApiResponse<PhotoUploadResponse | PhotoRequest>>(
      endpoints.doctor.profilePhoto,
      payload,
    );

    // Backend may wrap the created request as { request }
    const data = response.data.data;
    if ('request' in data && data.request) {
      return data.request;
    }
    return data as PhotoRequest;
  },

  /**
   * Fotoğraf yükleme isteği durumunu getirir
   */
  async getPhotoRequestStatus(): Promise<PhotoRequest | null> {
    const response = await apiClient.get<ApiResponse<PhotoStatusResponse | PhotoRequest | null>>(
      endpoints.doctor.photoStatus,
    );

    // Backend returns: { status, history } or direct PhotoRequest
    const data = response.data.data;
    if (!data) {
      return null;
    }
    // Check if it's a wrapper object with status property
    if (typeof data === 'object' && 'status' in data && !('id' in data)) {
      const statusData = data as PhotoStatusResponse;
      return statusData.status ?? null;
    }
    // Direct PhotoRequest object
    return data as PhotoRequest;
  },

  /**
   * Fotoğraf yükleme geçmişini getirir
   */
  async getPhotoRequestHistory(): Promise<PhotoRequest[]> {
    const response = await apiClient.get<ApiResponse<PhotoStatusResponse | PhotoRequest[]>>(
      endpoints.doctor.photoHistory,
    );

    // Backend returns: { history } or direct array
    const data = response.data.data;
    if (data && 'history' in data) {
      return data.history ?? [];
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Fotoğraf yükleme isteğini iptal eder
   */
  async cancelPhotoRequest(): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.photoRequest,
    );
  },
};
