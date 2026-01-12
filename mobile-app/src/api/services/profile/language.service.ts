/**
 * @file language.service.ts
 * @description Language Service - Dil CRUD işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Profile servisinden ayrılan dil CRUD işlemleri
 * 
 * **Endpoint'ler:**
 * - GET /api/mobile/doctor/languages - Dil listesi
 * - POST /api/mobile/doctor/languages - Yeni dil
 * - PATCH /api/mobile/doctor/languages/:id - Dil güncelleme
 * - DELETE /api/mobile/doctor/languages/:id - Dil silme
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateLanguagePayload,
  UpdateLanguagePayload,
  DoctorLanguage,
} from '@/types/profile';

// ============================================================================
// LANGUAGE SERVICE
// ============================================================================

export const languageService = {
  /**
   * Dil listesini getirir
   * 
   * @returns Dil bilgileri listesi
   * 
   * **Endpoint:** GET /api/mobile/doctor/languages
   */
  async getLanguages(): Promise<DoctorLanguage[]> {
    const response = await apiClient.get<ApiResponse<DoctorLanguage[]>>(
      endpoints.doctor.languages,
    );
    return response.data.data;
  },

  /**
   * Yeni dil kaydı oluşturur
   * 
   * @param payload - Dil bilgileri
   * @returns Oluşturulan dil kaydı
   * 
   * **Endpoint:** POST /api/mobile/doctor/languages
   */
  async createLanguage(
    payload: CreateLanguagePayload,
  ): Promise<DoctorLanguage> {
    const response = await apiClient.post<ApiResponse<DoctorLanguage>>(
      endpoints.doctor.languages,
      payload,
    );
    return response.data.data;
  },

  /**
   * Dil kaydını günceller
   * 
   * @param id - Dil ID
   * @param payload - Güncellenecek dil bilgileri
   * @returns Güncellenmiş dil kaydı
   * 
   * **Endpoint:** PATCH /api/mobile/doctor/languages/:id
   */
  async updateLanguage(
    id: number,
    payload: UpdateLanguagePayload,
  ): Promise<DoctorLanguage> {
    const response = await apiClient.patch<ApiResponse<DoctorLanguage>>(
      endpoints.doctor.language(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Dil kaydını siler
   * 
   * @param id - Dil ID
   * 
   * **Endpoint:** DELETE /api/mobile/doctor/languages/:id
   */
  async deleteLanguage(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(endpoints.doctor.language(id));
  },
};
