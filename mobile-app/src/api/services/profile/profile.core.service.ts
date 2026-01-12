/**
 * @file profile.core.service.ts
 * @description Profile Core Service - Temel profil işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ARCH-002:** Profile servisinden ayrılan core profil işlemleri
 * 
 * **Endpoint'ler:**
 * - GET /api/mobile/doctor/profile - Profil bilgisi
 * - GET /api/mobile/doctor/profile/completion - Tamamlanma oranı
 * - PATCH /api/mobile/doctor/profile - Kişisel bilgi güncelleme
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

// ============================================================================
// PROFILE CORE SERVICE
// ============================================================================

export const profileCoreService = {
  /**
   * Profil bilgisini getirir (temel bilgiler)
   * 
   * @returns Doktor profil bilgileri
   * 
   * **Endpoint:** GET /api/mobile/doctor/profile
   */
  async getProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      endpoints.doctor.profile,
    );
    return response.data.data;
  },

  /**
   * Tam profil bilgisini getirir (eğitim, deneyim, sertifika, dil dahil)
   * 
   * @returns Tam profil bilgileri
   * 
   * **NOT:** Şu anda sadece temel profil bilgisi döner.
   * İlişkili veriler (educations, experiences, vb.) ayrı endpoint'lerden çekilir.
   * 
   * **Endpoint:** GET /api/mobile/doctor/profile
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
   * Profil tamamlanma oranını getirir
   * 
   * @returns Profil tamamlanma bilgileri
   * 
   * **Backend Response:**
   * ```json
   * {
   *   "completion_percentage": number,
   *   "details": {
   *     "personal": { "completed": number, "total": number }
   *   },
   *   "missing_fields": string[]
   * }
   * ```
   * 
   * **Frontend Type:**
   * ```typescript
   * {
   *   completion_percent: number,
   *   filled_fields: number,
   *   total_fields: number,
   *   missing_fields: string[]
   * }
   * ```
   * 
   * **Endpoint:** GET /api/mobile/doctor/profile/completion
   */
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await apiClient.get<ApiResponse<ProfileCompletionResponse>>(
      endpoints.doctor.profileCompletion
    );
    
    // Yanıt yapısını doğrula
    if (!response.data?.data) {
      throw new Error('Invalid profile completion response structure');
    }
    
    const data = response.data.data;
    
    // Backend yanıtını frontend tipine normalize et
    return {
      completion_percent: data.completion_percentage ?? 0,
      filled_fields: data.details?.personal?.completed ?? 0,
      total_fields: data.details?.personal?.total ?? 0,
      missing_fields: data.missing_fields ?? [],
    };
  },

  /**
   * Kişisel bilgileri günceller
   * 
   * @param payload - Güncellenecek kişisel bilgiler
   * @returns Güncellenmiş profil bilgileri
   * 
   * **Endpoint:** PATCH /api/mobile/doctor/profile
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
