/**
 * Experience Service
 * ARCH-002: Profile servisinden ayrılan deneyim CRUD işlemleri
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateExperiencePayload,
  UpdateExperiencePayload,
  DoctorExperience,
} from '@/types/profile';

export const experienceService = {
  /**
   * Deneyim listesini getirir
   */
  async getExperiences(): Promise<DoctorExperience[]> {
    const response = await apiClient.get<ApiResponse<DoctorExperience[]>>(
      endpoints.doctor.experiences,
    );
    return response.data.data;
  },

  /**
   * Yeni deneyim kaydı oluşturur
   */
  async createExperience(
    payload: CreateExperiencePayload,
  ): Promise<DoctorExperience> {
    const response = await apiClient.post<ApiResponse<DoctorExperience>>(
      endpoints.doctor.experiences,
      payload,
    );
    return response.data.data;
  },

  /**
   * Deneyim kaydını günceller
   */
  async updateExperience(
    id: number,
    payload: UpdateExperiencePayload,
  ): Promise<DoctorExperience> {
    const response = await apiClient.patch<ApiResponse<DoctorExperience>>(
      endpoints.doctor.experience(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Deneyim kaydını siler
   */
  async deleteExperience(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.experience(id),
    );
  },
};
