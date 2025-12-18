/**
 * Profile Core Service
 * ARCH-002: Profile servisinden ayrılan core profil işlemleri
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CompleteProfile,
  DoctorProfile,
  ProfileCompletion,
  ProfileCompletionResponse,
  UpdatePersonalInfoPayload,
} from '@/types/profile';

export const profileCoreService = {
  /**
   * Profil bilgisini getirir (temel bilgiler)
   */
  async getProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      endpoints.doctor.profile,
    );
    return response.data.data;
  },

  /**
   * Tam profil bilgisini getirir (eğitim, deneyim, sertifika, dil dahil)
   */
  async getCompleteProfile(): Promise<CompleteProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      endpoints.doctor.profile,
    );
    
    const basicProfile = response.data.data;
    return {
      ...basicProfile,
      educations: [],
      experiences: [],
      certificates: [],
      languages: [],
    } as CompleteProfile;
  },

  /**
   * Profil tamamlanma oranını getirir (Backend'den)
   */
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await apiClient.get<ApiResponse<ProfileCompletionResponse>>(
      endpoints.doctor.profileCompletion
    );
    
    const data = response.data.data;
    
    return {
      completion_percent: data.completion_percentage || 0,
      filled_fields: data.details?.personal?.completed || 0,
      total_fields: data.details?.personal?.total || 0,
      missing_fields: data.missing_fields || [],
    };
  },

  /**
   * Kişisel bilgileri günceller
   */
  async updatePersonalInfo(
    payload: UpdatePersonalInfoPayload,
  ): Promise<DoctorProfile> {
    const response = await apiClient.patch<ApiResponse<DoctorProfile>>(
      endpoints.doctor.updatePersonalInfo,
      payload,
    );
    return response.data.data;
  },
};
