/**
 * Education Service
 * ARCH-002: Profile servisinden ayrılan eğitim CRUD işlemleri
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateEducationPayload,
  UpdateEducationPayload,
  DoctorEducation,
} from '@/types/profile';

export const educationService = {
  /**
   * Eğitim listesini getirir
   */
  async getEducations(): Promise<DoctorEducation[]> {
    const response = await apiClient.get<ApiResponse<DoctorEducation[]>>(
      endpoints.doctor.educations,
    );
    return response.data.data;
  },

  /**
   * Yeni eğitim kaydı oluşturur
   */
  async createEducation(
    payload: CreateEducationPayload,
  ): Promise<DoctorEducation> {
    const response = await apiClient.post<ApiResponse<DoctorEducation>>(
      endpoints.doctor.educations,
      payload,
    );
    return response.data.data;
  },

  /**
   * Eğitim kaydını günceller
   */
  async updateEducation(
    id: number,
    payload: UpdateEducationPayload,
  ): Promise<DoctorEducation> {
    const response = await apiClient.patch<ApiResponse<DoctorEducation>>(
      endpoints.doctor.education(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Eğitim kaydını siler
   */
  async deleteEducation(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(endpoints.doctor.education(id));
  },
};
