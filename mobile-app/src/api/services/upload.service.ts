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
import { UPLOAD_TIMEOUT_MS, MAX_RETRY_ATTEMPTS } from '@/config/constants';
import { devLog } from '@/utils/devLogger';

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
  async uploadProfilePhoto(_uri: string, base64: string): Promise<UploadResponse> {
    const base64String = `data:image/jpeg;base64,${base64}`;
    
    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      endpoints.upload.profilePhoto,
      {
        photo: base64String,
      },
      {
        timeout: UPLOAD_TIMEOUT_MS, // 2 dakika timeout
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
  async uploadRegisterPhoto(_uri: string, base64: string): Promise<UploadResponse> {
    const base64String = `data:image/jpeg;base64,${base64}`;
    
    let lastError: Error;
    
    // Retry mekanizması - fotoğraf yükleme için
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        devLog.log(`📤 Upload attempt ${attempt}/${MAX_RETRY_ATTEMPTS}`);
        
        const response = await apiClient.post<ApiResponse<UploadResponse>>(
          endpoints.upload.registerPhoto,
          {
            photo: base64String,
          },
          {
            timeout: UPLOAD_TIMEOUT_MS, // 2 dakika timeout
          }
        );

        devLog.log('✅ Upload successful');
        return response.data.data;
        
      } catch (error: any) {
        lastError = error;
        devLog.log(`❌ Upload attempt ${attempt} failed:`, error.message);
        
        // Timeout veya network hatası değilse retry yapma
        const isRetryableError = 
          error.name === 'NetworkError' ||
          error.message?.includes('Network') ||
          error.message?.includes('timeout') ||
          error.code === 'ECONNABORTED';
          
        if (!isRetryableError) {
          devLog.log('🚫 Non-retryable error, not retrying');
          throw error;
        }
        
        // Son deneme ise hata fırlat
        if (attempt === MAX_RETRY_ATTEMPTS) {
          devLog.log('🚫 Max upload retry attempts reached');
          throw error;
        }
        
        // Retry öncesi bekleme (upload için daha uzun)
        const delay = attempt * 2000; // 2s, 4s, 6s...
        devLog.log(`⏳ Waiting ${delay}ms before upload retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  },
};
