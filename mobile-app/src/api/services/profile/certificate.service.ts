/**
 * Certificate Service
 * ARCH-002: Profile servisinden ayrılan sertifika CRUD işlemleri
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateCertificatePayload,
  UpdateCertificatePayload,
  DoctorCertificate,
} from '@/types/profile';

export const certificateService = {
  /**
   * Sertifika listesini getirir
   */
  async getCertificates(): Promise<DoctorCertificate[]> {
    const response = await apiClient.get<ApiResponse<DoctorCertificate[]>>(
      endpoints.doctor.certificates,
    );
    return response.data.data;
  },

  /**
   * Yeni sertifika kaydı oluşturur
   */
  async createCertificate(
    payload: CreateCertificatePayload,
  ): Promise<DoctorCertificate> {
    const response = await apiClient.post<ApiResponse<DoctorCertificate>>(
      endpoints.doctor.certificates,
      payload,
    );
    return response.data.data;
  },

  /**
   * Sertifika kaydını günceller
   */
  async updateCertificate(
    id: number,
    payload: UpdateCertificatePayload,
  ): Promise<DoctorCertificate> {
    const response = await apiClient.patch<ApiResponse<DoctorCertificate>>(
      endpoints.doctor.certificate(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Sertifika kaydını siler
   */
  async deleteCertificate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.certificate(id),
    );
  },
};
