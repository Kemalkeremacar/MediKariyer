/**
 * @file education.service.ts
 * @description Education Service - Eğitim CRUD işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Profile servisinden ayrılan eğitim CRUD işlemleri
 * 
 * **Endpoint'ler:**
 * - GET /api/mobile/doctor/educations - Eğitim listesi
 * - POST /api/mobile/doctor/educations - Yeni eğitim
 * - PATCH /api/mobile/doctor/educations/:id - Eğitim güncelleme
 * - DELETE /api/mobile/doctor/educations/:id - Eğitim silme
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateEducationPayload,
  UpdateEducationPayload,
  DoctorEducation,
} from '@/types/profile';

// ============================================================================
// EDUCATION SERVICE
// ============================================================================

export const educationService = {
  /**
   * Eğitim listesini getirir
   * 
   * @returns Eğitim bilgileri listesi
   * 
   * **Endpoint:** GET /api/mobile/doctor/educations
   */
  async getEducations(): Promise<DoctorEducation[]> {
    const response = await apiClient.get<ApiResponse<DoctorEducation[]>>(
      endpoints.doctor.educations,
    );
    return response.data.data;
  },

  /**
   * Yeni eğitim kaydı oluşturur
   * 
   * @param payload - Eğitim bilgileri
   * @returns Oluşturulan eğitim kaydı
   * 
   * **Endpoint:** POST /api/mobile/doctor/educations
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
   * 
   * @param id - Eğitim ID
   * @param payload - Güncellenecek eğitim bilgileri
   * @returns Güncellenmiş eğitim kaydı
   * 
   * **Endpoint:** PATCH /api/mobile/doctor/educations/:id
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
   * 
   * @param id - Eğitim ID
   * 
   * **Endpoint:** DELETE /api/mobile/doctor/educations/:id
   */
  async deleteEducation(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(endpoints.doctor.education(id));
  },
};
