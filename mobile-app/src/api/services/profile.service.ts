import apiClient from '@/api/client';
import { rootApiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  CompleteProfile,
  DoctorProfile,
  ProfileCompletion,
  UpdatePersonalInfoPayload,
  CreateEducationPayload,
  UpdateEducationPayload,
  DoctorEducation,
  CreateExperiencePayload,
  UpdateExperiencePayload,
  DoctorExperience,
  CreateCertificatePayload,
  UpdateCertificatePayload,
  DoctorCertificate,
  CreateLanguagePayload,
  UpdateLanguagePayload,
  DoctorLanguage,
  UploadPhotoPayload,
  PhotoRequest,
} from '@/types/profile';

// Web backend için ayrı axios instance (detaylı profil işlemleri için)
// Not: Eğitim, deneyim, sertifika gibi detaylı işlemler henüz mobile API'de yok
// Bu yüzden web API kullanıyoruz. İleride mobile API'ye taşınabilir.
const WEB_BASE_URL = process.env.EXPO_PUBLIC_PRIMARY_API_BASE_URL || 'https://mk.monassist.com';
const webApiClient = rootApiClient; // rootApiClient zaten PRIMARY_API_BASE_URL kullanıyor

export const profileService = {
  // Profil GET işlemleri - Mobile API kullanıyor
  async getProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      endpoints.doctor.profile,
    );
    return response.data.data;
  },

  async getCompleteProfile(): Promise<CompleteProfile> {
    const response = await webApiClient.get<ApiResponse<{ profile: CompleteProfile }>>(
      '/api/doctor/profile/full',
    );
    // Backend response formatı: { success, message, data: { profile: {...} } }
    return response.data.data.profile || response.data.data;
  },

  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await webApiClient.get<
      ApiResponse<{
        completion_percentage: number;
        missing_fields: string[];
        sections?: any;
        details?: any;
      }>
    >('/api/doctor/profile/completion');
    // Backend response formatı: { success, message, data: { completion_percentage, ... } }
    const data = response.data.data;
    // Backend'den completion_percentage geliyor, frontend completion_percent bekliyor
    return {
      completion_percent: data.completion_percentage,
      filled_fields: 0, // Backend'den gelmiyor, hesaplanabilir
      total_fields: 0, // Backend'den gelmiyor, hesaplanabilir
      missing_fields: data.missing_fields || [],
    };
  },

  // Profil güncelleme
  async updatePersonalInfo(
    payload: UpdatePersonalInfoPayload,
  ): Promise<DoctorProfile> {
    const response = await webApiClient.patch<ApiResponse<DoctorProfile>>(
      '/api/doctor/profile/personal',
      payload,
    );
    return response.data.data;
  },

  // Eğitim CRUD
  async getEducations(): Promise<DoctorEducation[]> {
    const response = await webApiClient.get<ApiResponse<DoctorEducation[]>>(
      '/api/doctor/educations',
    );
    return response.data.data;
  },

  async createEducation(
    payload: CreateEducationPayload,
  ): Promise<DoctorEducation> {
    const response = await webApiClient.post<ApiResponse<DoctorEducation>>(
      '/api/doctor/educations',
      payload,
    );
    return response.data.data;
  },

  async updateEducation(
    id: number,
    payload: UpdateEducationPayload,
  ): Promise<DoctorEducation> {
    const response = await webApiClient.patch<ApiResponse<DoctorEducation>>(
      `/api/doctor/educations/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteEducation(id: number): Promise<void> {
    await webApiClient.delete<ApiResponse<null>>(`/api/doctor/educations/${id}`);
  },

  // Deneyim CRUD
  async getExperiences(): Promise<DoctorExperience[]> {
    const response = await webApiClient.get<ApiResponse<DoctorExperience[]>>(
      '/api/doctor/experiences',
    );
    return response.data.data;
  },

  async createExperience(
    payload: CreateExperiencePayload,
  ): Promise<DoctorExperience> {
    const response = await webApiClient.post<ApiResponse<DoctorExperience>>(
      '/api/doctor/experiences',
      payload,
    );
    return response.data.data;
  },

  async updateExperience(
    id: number,
    payload: UpdateExperiencePayload,
  ): Promise<DoctorExperience> {
    const response = await webApiClient.patch<ApiResponse<DoctorExperience>>(
      `/api/doctor/experiences/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteExperience(id: number): Promise<void> {
    await webApiClient.delete<ApiResponse<null>>(
      `/api/doctor/experiences/${id}`,
    );
  },

  // Sertifika CRUD
  async getCertificates(): Promise<DoctorCertificate[]> {
    const response = await webApiClient.get<ApiResponse<DoctorCertificate[]>>(
      '/api/doctor/certificates',
    );
    return response.data.data;
  },

  async createCertificate(
    payload: CreateCertificatePayload,
  ): Promise<DoctorCertificate> {
    const response = await webApiClient.post<ApiResponse<DoctorCertificate>>(
      '/api/doctor/certificates',
      payload,
    );
    return response.data.data;
  },

  async updateCertificate(
    id: number,
    payload: UpdateCertificatePayload,
  ): Promise<DoctorCertificate> {
    const response = await webApiClient.patch<ApiResponse<DoctorCertificate>>(
      `/api/doctor/certificates/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteCertificate(id: number): Promise<void> {
    await webApiClient.delete<ApiResponse<null>>(
      `/api/doctor/certificates/${id}`,
    );
  },

  // Dil CRUD
  async getLanguages(): Promise<DoctorLanguage[]> {
    const response = await webApiClient.get<ApiResponse<DoctorLanguage[]>>(
      '/api/doctor/languages',
    );
    return response.data.data;
  },

  async createLanguage(
    payload: CreateLanguagePayload,
  ): Promise<DoctorLanguage> {
    const response = await webApiClient.post<ApiResponse<DoctorLanguage>>(
      '/api/doctor/languages',
      payload,
    );
    return response.data.data;
  },

  async updateLanguage(
    id: number,
    payload: UpdateLanguagePayload,
  ): Promise<DoctorLanguage> {
    const response = await webApiClient.patch<ApiResponse<DoctorLanguage>>(
      `/api/doctor/languages/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteLanguage(id: number): Promise<void> {
    await webApiClient.delete<ApiResponse<null>>(`/api/doctor/languages/${id}`);
  },

  // Fotoğraf yönetimi
  async uploadPhoto(payload: UploadPhotoPayload): Promise<PhotoRequest> {
    const response = await webApiClient.post<ApiResponse<PhotoRequest>>(
      '/api/doctor/profile/photo',
      payload,
    );
    return response.data.data;
  },

  async getPhotoRequestStatus(): Promise<PhotoRequest | null> {
    const response = await webApiClient.get<ApiResponse<PhotoRequest | null>>(
      '/api/doctor/profile/photo/status',
    );
    return response.data.data;
  },

  async getPhotoRequestHistory(): Promise<PhotoRequest[]> {
    const response = await webApiClient.get<ApiResponse<PhotoRequest[]>>(
      '/api/doctor/profile/photo/history',
    );
    return response.data.data;
  },

  async cancelPhotoRequest(): Promise<void> {
    await webApiClient.delete<ApiResponse<null>>(
      '/api/doctor/profile/photo/request',
    );
  },
};

