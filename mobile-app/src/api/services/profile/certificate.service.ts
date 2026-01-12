/**
 * @file certificate.service.ts
 * @description Certificate Service - Sertifika CRUD işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Profile servisinden ayrılan sertifika CRUD işlemleri
 * 
 * **Endpoint'ler:**
 * - GET /api/mobile/doctor/certificates - Sertifika listesi
 * - POST /api/mobile/doctor/certificates - Yeni sertifika
 * - PATCH /api/mobile/doctor/certificates/:id - Sertifika güncelleme
 * - DELETE /api/mobile/doctor/certificates/:id - Sertifika silme
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CreateCertificatePayload,
  UpdateCertificatePayload,
  DoctorCertificate,
} from '@/types/profile';

// ============================================================================
// CERTIFICATE SERVICE
// ============================================================================

export const certificateService = {
  /**
   * Sertifika listesini getirir
   * 
   * @returns Sertifika bilgileri listesi
   * 
   * **Endpoint:** GET /api/mobile/doctor/certificates
   */
  async getCertificates(): Promise<DoctorCertificate[]> {
    const response = await apiClient.get<ApiResponse<DoctorCertificate[]>>(
      endpoints.doctor.certificates,
    );
    return response.data.data;
  },

  /**
   * Yeni sertifika kaydı oluşturur
   * 
   * @param payload - Sertifika bilgileri
   * @returns Oluşturulan sertifika kaydı
   * 
   * **Endpoint:** POST /api/mobile/doctor/certificates
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
   * 
   * @param id - Sertifika ID
   * @param payload - Güncellenecek sertifika bilgileri
   * @returns Güncellenmiş sertifika kaydı
   * 
   * **Endpoint:** PATCH /api/mobile/doctor/certificates/:id
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
   * 
   * @param id - Sertifika ID
   * 
   * **Endpoint:** DELETE /api/mobile/doctor/certificates/:id
   */
  async deleteCertificate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.certificate(id),
    );
  },
};
