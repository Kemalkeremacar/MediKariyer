/**
 * @file upload.service.ts
 * @description Upload service - Dosya yükleme işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - Upload profile photo (profil fotoğrafı yükleme - Base64 format)
 * 
 * Endpoint'ler: /api/mobile/upload/*
 * 
 * Not: Base64 format kullanılıyor (multipart/form-data değil)
 * Maksimum dosya boyutu: 5MB
 * Desteklenen formatlar: JPEG, PNG
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import apiClient from '../client';
import { endpoints } from '../endpoints';
import { ApiResponse } from '@/types/api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadService = {
  /**
   * Profil fotoğrafı yükle (Base64 format)
   * @param {string} uri - Fotoğraf URI'si (local file path)
   * @param {string} base64 - Base64 encoded fotoğraf
   * @returns {Promise<UploadResponse>} Upload sonucu (URL, filename, size)
   */
  async uploadProfilePhoto(uri: string, base64: string): Promise<UploadResponse> {
    const base64String = `data:image/jpeg;base64,${base64}`;
    
    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      endpoints.upload.profilePhoto,
      {
        photo: base64String,
      }
    );

    return response.data.data;
  },

  /**
   * Kayıt sırasında profil fotoğrafı yükle (Base64 format) - Auth gerektirmez
   * @param {string} uri - Fotoğraf URI'si (local file path)
   * @param {string} base64 - Base64 encoded fotoğraf
   * @returns {Promise<UploadResponse>} Upload sonucu (URL, filename, size)
   */
  async uploadRegisterPhoto(uri: string, base64: string): Promise<UploadResponse> {
    const base64String = `data:image/jpeg;base64,${base64}`;
    
    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      endpoints.upload.registerPhoto,
      {
        photo: base64String,
      }
    );

    return response.data.data;
  },
};
