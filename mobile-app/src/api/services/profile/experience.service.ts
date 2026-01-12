/**
 * @file experience.service.ts
 * @description Experience Service - Deneyim CRUD işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Profile servisinden ayrılan deneyim CRUD işlemleri
 * 
 * **Endpoint'ler:**
 * - GET /api/mobile/doctor/experiences - Deneyim listesi
 * - POST /api/mobile/doctor/experiences - Yeni deneyim
 * - PATCH /api/mobile/doctor/experiences/:id - Deneyim güncelleme
 * - DELETE /api/mobile/doctor/experiences/:id - Deneyim silme
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateExperiencePayload,
  UpdateExperiencePayload,
  DoctorExperience,
} from '@/types/profile';

// ============================================================================
// EXPERIENCE SERVICE
// ============================================================================

export const experienceService = {
  /**
   * Deneyim listesini getirir
   * 
   * @returns Deneyim bilgileri listesi
   * 
   * **Endpoint:** GET /api/mobile/doctor/experiences
   */
  async getExperiences(): Promise<DoctorExperience[]> {
    const response = await apiClient.get<ApiResponse<DoctorExperience[]>>(
      endpoints.doctor.experiences,
    );
    return response.data.data;
  },

  /**
   * Yeni deneyim kaydı oluşturur
   * 
   * @param payload - Deneyim bilgileri
   * @returns Oluşturulan deneyim kaydı
   * 
   * **Endpoint:** POST /api/mobile/doctor/experiences
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
   * 
   * @param id - Deneyim ID
   * @param payload - Güncellenecek deneyim bilgileri
   * @returns Güncellenmiş deneyim kaydı
   * 
   * **Endpoint:** PATCH /api/mobile/doctor/experiences/:id
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
   * 
   * @param id - Deneyim ID
   * 
   * **Endpoint:** DELETE /api/mobile/doctor/experiences/:id
   */
  async deleteExperience(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.experience(id),
    );
  },
};
