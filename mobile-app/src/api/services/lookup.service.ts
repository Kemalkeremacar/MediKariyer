/**
 * @file lookup.service.ts
 * @description Lookup service - Dropdown ve select için lookup data'ları getirir
 * 
 * Not: Lookup endpoint'leri web API'den gelir (/api/lookup/*)
 * Mobile API'de ayrı lookup endpoint'leri yok çünkü:
 * - Lookup data zaten minimal (ID + name)
 * - Transformer'a gerek yok
 * - Cache web tarafında yapılıyor
 * - Tüm client'lar aynı lookup data'yı kullanır
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { rootApiClient } from '@/api/client';
import { rootEndpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import {
  Specialty,
  Subspecialty,
  City,
  ApplicationStatus,
  EducationType,
  Language,
  LanguageLevel,
} from '@/types/lookup';

export const lookupService = {
  /**
   * Branş listesini getirir
   * @returns {Promise<Specialty[]>} Branş listesi
   */
  async getSpecialties(): Promise<Specialty[]> {
    const response = await rootApiClient.get<ApiResponse<Specialty[]>>(
      rootEndpoints.lookup.specialties,
    );
    return response.data.data;
  },

  /**
   * Yan dal listesini getirir (branşa göre filtrelenebilir)
   * @param {number} [specialtyId] - Branş ID'si (opsiyonel)
   * @returns {Promise<Subspecialty[]>} Yan dal listesi
   */
  async getSubspecialties(specialtyId?: number): Promise<Subspecialty[]> {
    const response = await rootApiClient.get<ApiResponse<Subspecialty[]>>(
      rootEndpoints.lookup.subspecialties(specialtyId),
    );
    return response.data.data;
  },

  /**
   * Şehir listesini getirir
   * @returns {Promise<City[]>} Şehir listesi
   */
  async getCities(): Promise<City[]> {
    const response = await rootApiClient.get<ApiResponse<City[]>>(
      rootEndpoints.lookup.cities,
    );
    return response.data.data;
  },

  /**
   * Başvuru durumları listesini getirir
   * @returns {Promise<ApplicationStatus[]>} Başvuru durumları listesi
   */
  async getApplicationStatuses(): Promise<ApplicationStatus[]> {
    const response = await rootApiClient.get<ApiResponse<ApplicationStatus[]>>(
      rootEndpoints.lookup.applicationStatuses,
    );
    return response.data.data;
  },

  /**
   * Eğitim türleri listesini getirir
   * @returns {Promise<EducationType[]>} Eğitim türleri listesi
   */
  async getEducationTypes(): Promise<EducationType[]> {
    const response = await rootApiClient.get<ApiResponse<EducationType[]>>(
      rootEndpoints.lookup.educationTypes,
    );
    return response.data.data;
  },

  /**
   * Dil listesini getirir
   * @returns {Promise<Language[]>} Dil listesi
   */
  async getLanguages(): Promise<Language[]> {
    const response = await rootApiClient.get<ApiResponse<Language[]>>(
      rootEndpoints.lookup.languages,
    );
    return response.data.data;
  },

  /**
   * Dil seviyeleri listesini getirir
   * @returns {Promise<LanguageLevel[]>} Dil seviyeleri listesi
   */
  async getLanguageLevels(): Promise<LanguageLevel[]> {
    const response = await rootApiClient.get<ApiResponse<LanguageLevel[]>>(
      rootEndpoints.lookup.languageLevels,
    );
    return response.data.data;
  },
};

