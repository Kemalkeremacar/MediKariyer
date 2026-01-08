/**
 * Language Service
 * ARCH-002: Profile servisinden ayrılan dil CRUD işlemleri
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateLanguagePayload,
  UpdateLanguagePayload,
  DoctorLanguage,
} from '@/types/profile';

export const languageService = {
  /**
   * Dil listesini getirir
   */
  async getLanguages(): Promise<DoctorLanguage[]> {
    const response = await apiClient.get<ApiResponse<DoctorLanguage[]>>(
      endpoints.doctor.languages,
    );
    return response.data.data;
  },

  /**
   * Yeni dil kaydı oluşturur
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
   */
  async deleteLanguage(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(endpoints.doctor.language(id));
  },
};
