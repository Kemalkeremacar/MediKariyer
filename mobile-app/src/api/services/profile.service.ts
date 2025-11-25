import axios from 'axios';
import { PRIMARY_API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/constants/config';
import { tokenManager } from '@/utils/tokenManager';
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

// Web backend için ayrı axios instance (PRIMARY_API_BASE_URL)
const webApiClient = axios.create({
  baseURL: PRIMARY_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor
webApiClient.interceptors.request.use(async (config) => {
  const token = await tokenManager.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const profileService = {
  // Profil GET işlemleri
  async getProfile(): Promise<DoctorProfile> {
    const response = await webApiClient.get<ApiResponse<DoctorProfile>>(
      '/api/doctor/profile',
    );
    return response.data.data;
  },

  async getCompleteProfile(): Promise<CompleteProfile> {
    const response = await webApiClient.get<ApiResponse<CompleteProfile>>(
      '/api/doctor/profile/full',
    );
    return response.data.data;
  },

  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await webApiClient.get<ApiResponse<ProfileCompletion>>(
      '/api/doctor/profile/completion',
    );
    return response.data.data;
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

