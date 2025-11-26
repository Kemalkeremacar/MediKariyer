import { rootApiClient } from '@/api/client';
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

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if ((response as ApiResponse<T>).success !== undefined) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
};

export const lookupService = {
  async getSpecialties() {
    const response = await rootApiClient.get<ApiResponse<Specialty[]>>(
      '/lookup/specialties',
    );
    return unwrap(response.data);
  },

  async getSubspecialties() {
    const response = await rootApiClient.get<ApiResponse<Subspecialty[]>>(
      '/lookup/subspecialties',
    );
    return unwrap(response.data);
  },

  async getCities() {
    const response = await rootApiClient.get<ApiResponse<City[]>>(
      '/lookup/cities',
    );
    return unwrap(response.data);
  },

  async getApplicationStatuses() {
    const response =
      await rootApiClient.get<ApiResponse<ApplicationStatus[]>>(
        '/lookup/application-statuses',
      );
    return unwrap(response.data);
  },

  async getEducationTypes() {
    const response = await rootApiClient.get<ApiResponse<EducationType[]>>(
      '/lookup/doctor-education-types',
    );
    return unwrap(response.data);
  },

  async getLanguages() {
    const response = await rootApiClient.get<ApiResponse<Language[]>>(
      '/lookup/languages',
    );
    return unwrap(response.data);
  },

  async getLanguageLevels() {
    const response = await rootApiClient.get<ApiResponse<LanguageLevel[]>>(
      '/lookup/language-levels',
    );
    return unwrap(response.data);
  },
};

