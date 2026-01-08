/**
 * Lookup Service
 * Sistem lookup verilerini getiren servis
 * 
 * Not: Mobile kendi backend'ini kullanıyor (/api/mobile/lookup/...)
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
}

export interface Subspecialty {
  id: number;
  name: string;
  specialty_id: number;
  description?: string;
}

export interface City {
  id: number;
  name: string;
  country?: string;
}

export interface EducationType {
  id: number;
  name: string;
  description?: string;
  is_required?: boolean;
}

export interface Language {
  id: number;
  name: string;
  code?: string;
}

export interface LanguageLevel {
  id: number;
  name: string;
  description?: string;
}

export interface CertificateType {
  id: number;
  name: string;
  description?: string;
  is_required?: boolean;
}

export interface ApplicationStatus {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const lookupService = {
  /**
   * Uzmanlık alanlarını getir
   */
  getSpecialties: async (): Promise<Specialty[]> => {
    const response = await apiClient.get<ApiResponse<Specialty[]>>(endpoints.lookup.specialties);
    return response.data.data;
  },

  /**
   * Yan dal alanlarını getir
   */
  getSubspecialties: async (specialtyId?: number): Promise<Subspecialty[]> => {
    const url = endpoints.lookup.subspecialties(specialtyId);
    const response = await apiClient.get<ApiResponse<Subspecialty[]>>(url);
    return response.data.data;
  },

  /**
   * Şehirleri getir
   */
  getCities: async (): Promise<City[]> => {
    const response = await apiClient.get<ApiResponse<City[]>>(endpoints.lookup.cities);
    return response.data.data;
  },

  /**
   * Doktor eğitim türlerini getir
   */
  getEducationTypes: async (): Promise<EducationType[]> => {
    const response = await apiClient.get<ApiResponse<EducationType[]>>(endpoints.lookup.educationTypes);
    return response.data.data;
  },

  /**
   * Dilleri getir
   */
  getLanguages: async (): Promise<Language[]> => {
    const response = await apiClient.get<ApiResponse<Language[]>>(endpoints.lookup.languages);
    return response.data.data;
  },

  /**
   * Dil seviyelerini getir
   */
  getLanguageLevels: async (): Promise<LanguageLevel[]> => {
    const response = await apiClient.get<ApiResponse<LanguageLevel[]>>(endpoints.lookup.languageLevels);
    return response.data.data;
  },

  /**
   * Sertifika türlerini getir (deprecated - artık kullanılmıyor)
   */
  getCertificateTypes: async (): Promise<CertificateType[]> => {
    // Certificate types tablosu kaldırıldı, boş array döndür
    return [];
  },

  /**
   * Başvuru durumlarını getir
   */
  getApplicationStatuses: async (): Promise<ApplicationStatus[]> => {
    const response = await apiClient.get<ApiResponse<ApplicationStatus[]>>(endpoints.lookup.applicationStatuses);
    return response.data.data;
  },
};
