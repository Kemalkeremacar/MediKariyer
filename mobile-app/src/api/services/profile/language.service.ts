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
    try {
      console.log('🌐 Fetching languages from:', endpoints.doctor.languages);
      const response = await apiClient.get<ApiResponse<DoctorLanguage[]>>(
        endpoints.doctor.languages,
      );
      console.log('✅ Languages fetched successfully:', response.data.data?.length || 0, 'items');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch languages:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      throw error;
    }
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
    const response = await apiClient.put<ApiResponse<DoctorLanguage>>(
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
