/**
 * Lookup Service
 * Sistem lookup verilerini getiren servis
 * 
 * Not: Mobile kendi backend'ini kullanıyor (/api/mobile/lookup/...)
 */

import { apiClient } from '../client';

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
    const response = await apiClient.get<ApiResponse<Specialty[]>>('/lookup/specialties');
    return response.data.data;
  },

  /**
   * Yan dal alanlarını getir
   */
  getSubspecialties: async (specialtyId?: number): Promise<Subspecialty[]> => {
    const url = specialtyId 
      ? `/lookup/subspecialties/${specialtyId}`
      : '/lookup/subspecialties';
    const response = await apiClient.get<ApiResponse<Subspecialty[]>>(url);
    return response.data.data;
  },

  /**
   * Şehirleri getir
   */
  getCities: async (): Promise<City[]> => {
    const response = await apiClient.get<ApiResponse<City[]>>('/lookup/cities');
    return response.data.data;
  },

  /**
   * Doktor eğitim türlerini getir
   */
  getEducationTypes: async (): Promise<EducationType[]> => {
    const response = await apiClient.get<ApiResponse<EducationType[]>>('/lookup/education-types');
    return response.data.data;
  },

  /**
   * Dilleri getir
   */
  getLanguages: async (): Promise<Language[]> => {
    const response = await apiClient.get<ApiResponse<Language[]>>('/lookup/languages');
    return response.data.data;
  },

  /**
   * Dil seviyelerini getir
   */
  getLanguageLevels: async (): Promise<LanguageLevel[]> => {
    const response = await apiClient.get<ApiResponse<LanguageLevel[]>>('/lookup/language-levels');
    return response.data.data;
  },

  /**
   * Sertifika türlerini getir (deprecated - artık kullanılmıyor)
   */
  getCertificateTypes: async (): Promise<CertificateType[]> => {
    // Certificate types tablosu kaldırıldı, boş array döndür
    return [];
  },
};
