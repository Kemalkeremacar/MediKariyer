/**
 * @file profile.service.ts
 * @description Profile service - Doktor profil işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - Get profile (profil bilgisi)
 * - Get complete profile (tam profil - eğitim, deneyim, sertifika, dil dahil)
 * - Get profile completion (profil tamamlanma oranı)
 * - Update personal info (kişisel bilgi güncelleme)
 * - Education CRUD (eğitim bilgileri)
 * - Experience CRUD (deneyim bilgileri)
 * - Certificate CRUD (sertifika bilgileri)
 * - Language CRUD (dil bilgileri)
 * - Photo management (fotoğraf yönetimi)
 * 
 * Endpoint'ler:
 * - Mobile API: /api/mobile/doctor/* (TÜM işlemler artık mobile API'de!)
 * - Web API: /api/doctor/* (sadece photo management için)
 * 
 * Not: Backend mobile service'leri güncellendi, artık tüm CRUD işlemleri mobile API'de!
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import apiClient from '@/api/client';
import { rootApiClient } from '@/api/client';
import { endpoints, rootEndpoints } from '@/api/endpoints';
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

export const profileService = {
  /**
   * Profil bilgisini getirir (temel bilgiler)
   * @returns {Promise<DoctorProfile>} Doktor profil bilgileri
   */
  async getProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      endpoints.doctor.profile,
    );
    return response.data.data;
  },

  /**
   * Tam profil bilgisini getirir (eğitim, deneyim, sertifika, dil dahil)
   * @returns {Promise<CompleteProfile>} Tam profil bilgileri
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
   * @returns {Promise<ProfileCompletion>} Profil tamamlanma bilgileri
   */
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await apiClient.get<ApiResponse<any>>(
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
   * @param {UpdatePersonalInfoPayload} payload - Güncellenecek bilgiler
   * @returns {Promise<DoctorProfile>} Güncellenmiş profil
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

  /**
   * Eğitim listesini getirir
   * @returns {Promise<DoctorEducation[]>} Eğitim listesi
   */
  async getEducations(): Promise<DoctorEducation[]> {
    const response = await apiClient.get<ApiResponse<DoctorEducation[]>>(
      endpoints.doctor.educations,
    );
    return response.data.data;
  },

  /**
   * Yeni eğitim kaydı oluşturur
   * @param {CreateEducationPayload} payload - Eğitim bilgileri
   * @returns {Promise<DoctorEducation>} Oluşturulan eğitim kaydı
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
   * @param {number} id - Eğitim ID'si
   * @param {UpdateEducationPayload} payload - Güncellenecek bilgiler
   * @returns {Promise<DoctorEducation>} Güncellenmiş eğitim kaydı
   */
  async updateEducation(
    id: number,
    payload: UpdateEducationPayload,
  ): Promise<DoctorEducation> {
    const response = await apiClient.put<ApiResponse<DoctorEducation>>(
      endpoints.doctor.education(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Eğitim kaydını siler
   * @param {number} id - Eğitim ID'si
   * @returns {Promise<void>}
   */
  async deleteEducation(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(endpoints.doctor.education(id));
  },

  /**
   * Deneyim listesini getirir
   * @returns {Promise<DoctorExperience[]>} Deneyim listesi
   */
  async getExperiences(): Promise<DoctorExperience[]> {
    const response = await apiClient.get<ApiResponse<DoctorExperience[]>>(
      endpoints.doctor.experiences,
    );
    return response.data.data;
  },

  /**
   * Yeni deneyim kaydı oluşturur
   * @param {CreateExperiencePayload} payload - Deneyim bilgileri
   * @returns {Promise<DoctorExperience>} Oluşturulan deneyim kaydı
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
   * @param {number} id - Deneyim ID'si
   * @param {UpdateExperiencePayload} payload - Güncellenecek bilgiler
   * @returns {Promise<DoctorExperience>} Güncellenmiş deneyim kaydı
   */
  async updateExperience(
    id: number,
    payload: UpdateExperiencePayload,
  ): Promise<DoctorExperience> {
    const response = await apiClient.put<ApiResponse<DoctorExperience>>(
      endpoints.doctor.experience(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Deneyim kaydını siler
   * @param {number} id - Deneyim ID'si
   * @returns {Promise<void>}
   */
  async deleteExperience(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.experience(id),
    );
  },

  /**
   * Sertifika listesini getirir
   * @returns {Promise<DoctorCertificate[]>} Sertifika listesi
   */
  async getCertificates(): Promise<DoctorCertificate[]> {
    const response = await apiClient.get<ApiResponse<DoctorCertificate[]>>(
      endpoints.doctor.certificates,
    );
    return response.data.data;
  },

  /**
   * Yeni sertifika kaydı oluşturur
   * @param {CreateCertificatePayload} payload - Sertifika bilgileri
   * @returns {Promise<DoctorCertificate>} Oluşturulan sertifika kaydı
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
   * @param {number} id - Sertifika ID'si
   * @param {UpdateCertificatePayload} payload - Güncellenecek bilgiler
   * @returns {Promise<DoctorCertificate>} Güncellenmiş sertifika kaydı
   */
  async updateCertificate(
    id: number,
    payload: UpdateCertificatePayload,
  ): Promise<DoctorCertificate> {
    const response = await apiClient.put<ApiResponse<DoctorCertificate>>(
      endpoints.doctor.certificate(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Sertifika kaydını siler
   * @param {number} id - Sertifika ID'si
   * @returns {Promise<void>}
   */
  async deleteCertificate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      endpoints.doctor.certificate(id),
    );
  },

  /**
   * Dil listesini getirir
   * @returns {Promise<DoctorLanguage[]>} Dil listesi
   */
  async getLanguages(): Promise<DoctorLanguage[]> {
    const response = await apiClient.get<ApiResponse<DoctorLanguage[]>>(
      endpoints.doctor.languages,
    );
    return response.data.data;
  },

  /**
   * Yeni dil kaydı oluşturur
   * @param {CreateLanguagePayload} payload - Dil bilgileri
   * @returns {Promise<DoctorLanguage>} Oluşturulan dil kaydı
   */
  async createLanguage(
    payload: CreateLanguagePayload,
  ): Promise<DoctorLanguage> {
    const response = await apiClient.post<ApiResponse<DoctorLanguage>>(
      endpoints.doctor.languages,
      payload,
    );
    return response.data.data;
  },

  /**
   * Dil kaydını günceller
   * @param {number} id - Dil ID'si
   * @param {UpdateLanguagePayload} payload - Güncellenecek bilgiler
   * @returns {Promise<DoctorLanguage>} Güncellenmiş dil kaydı
   */
  async updateLanguage(
    id: number,
    payload: UpdateLanguagePayload,
  ): Promise<DoctorLanguage> {
    const response = await apiClient.put<ApiResponse<DoctorLanguage>>(
      endpoints.doctor.language(id),
      payload,
    );
    return response.data.data;
  },

  /**
   * Dil kaydını siler
   * @param {number} id - Dil ID'si
   * @returns {Promise<void>}
   */
  async deleteLanguage(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(endpoints.doctor.language(id));
  },

  /**
   * Profil fotoğrafı yükler (Web API - admin onayı gerekir)
   * @param {UploadPhotoPayload} payload - Fotoğraf bilgileri
   * @returns {Promise<PhotoRequest>} Fotoğraf yükleme isteği
   */
  async uploadPhoto(payload: UploadPhotoPayload): Promise<PhotoRequest> {
    const response = await rootApiClient.post<ApiResponse<any>>(
      rootEndpoints.doctor.profile.photo,
      payload,
    );

    // Backend may wrap the created request as { request }
    const data = response.data.data as any;
    return (data?.request ?? data) as PhotoRequest;
  },

  /**
   * Fotoğraf yükleme isteği durumunu getirir
   * @returns {Promise<PhotoRequest | null>} Fotoğraf yükleme isteği durumu
   */
  async getPhotoRequestStatus(): Promise<PhotoRequest | null> {
    const response = await rootApiClient.get<ApiResponse<any>>(
      rootEndpoints.doctor.profile.photoStatus,
    );

    // Backend returns: { status, history }
    const data = response.data.data as any;
    return (data?.status ?? data ?? null) as PhotoRequest | null;
  },

  /**
   * Fotoğraf yükleme geçmişini getirir
   * @returns {Promise<PhotoRequest[]>} Fotoğraf yükleme geçmişi
   */
  async getPhotoRequestHistory(): Promise<PhotoRequest[]> {
    const response = await rootApiClient.get<ApiResponse<any>>(
      rootEndpoints.doctor.profile.photoHistory,
    );

    // Backend returns: { history }
    const data = response.data.data as any;
    return (data?.history ?? data ?? []) as PhotoRequest[];
  },

  /**
   * Fotoğraf yükleme isteğini iptal eder
   * @returns {Promise<void>}
   */
  async cancelPhotoRequest(): Promise<void> {
    await rootApiClient.delete<ApiResponse<null>>(
      rootEndpoints.doctor.profile.photoRequest,
    );
  },
};

