/**
 * @file lookup.service.ts
 * @description Lookup Service - Sistem referans verilerini getiren API servisi
 * 
 * Ana İşlevler:
 * - Branşlar (specialties)
 * - Yan dallar (subspecialties)
 * - Şehirler (cities)
 * - Eğitim tipleri (education types)
 * - Diller (languages)
 * - Dil seviyeleri (language levels)
 * - Başvuru durumları (application statuses)
 * 
 * Endpoint'ler: /api/mobile/lookup/*
 * 
 * Not: Bu veriler genellikle cache'lenir ve sık değişmez
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';

// ============================================================================
// TİPLER
// ============================================================================

// Branş tipi
export interface Specialty {
  id: number; // Branş ID'si
  name: string; // Branş adı (örn: "Kardiyoloji")
  description?: string; // Açıklama (opsiyonel)
}

// Yan dal tipi
export interface Subspecialty {
  id: number; // Yan dal ID'si
  name: string; // Yan dal adı (örn: "İnvaziv Kardiyoloji")
  specialty_id: number; // Bağlı olduğu branş ID'si
  description?: string; // Açıklama (opsiyonel)
}

// Şehir tipi
export interface City {
  id: number; // Şehir ID'si
  name: string; // Şehir adı (örn: "İstanbul")
  country?: string; // Ülke (opsiyonel)
}

// Eğitim tipi
export interface EducationType {
  id: number; // Eğitim tipi ID'si
  name: string; // Eğitim tipi adı (örn: "Tıp Fakültesi")
  description?: string; // Açıklama (opsiyonel)
  is_required?: boolean; // Zorunlu mu? (opsiyonel)
}

// Dil tipi
export interface Language {
  id: number; // Dil ID'si
  name: string; // Dil adı (örn: "İngilizce")
  code?: string; // Dil kodu (örn: "en", opsiyonel)
}

// Dil seviyesi tipi
export interface LanguageLevel {
  id: number; // Seviye ID'si
  name: string; // Seviye adı (örn: "İleri Seviye")
  description?: string; // Açıklama (opsiyonel)
}

// Sertifika tipi (deprecated - artık kullanılmıyor)
export interface CertificateType {
  id: number;
  name: string;
  description?: string;
  is_required?: boolean;
}

// Başvuru durumu tipi
export interface ApplicationStatus {
  id: number; // Durum ID'si
  name: string; // Durum adı (örn: "Beklemede", "İncelendi")
}

// API yanıt tipi
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ============================================================================
// LOOKUP SERVİSİ
// ============================================================================

export const lookupService = {
  /**
   * Branşları getir
   * @returns {Promise<Specialty[]>} Branş listesi
   * @example
   * const specialties = await lookupService.getSpecialties();
   * // [{ id: 1, name: "Kardiyoloji" }, ...]
   */
  getSpecialties: async (): Promise<Specialty[]> => {
    const response = await apiClient.get<ApiResponse<Specialty[]>>(endpoints.lookup.specialties);
    return response.data.data;
  },

  /**
   * Yan dalları getir
   * @param {number} [specialtyId] - Branş ID'si (opsiyonel, belirtilirse sadece o branşın yan dalları gelir)
   * @returns {Promise<Subspecialty[]>} Yan dal listesi
   * @example
   * // Tüm yan dallar
   * const allSubspecialties = await lookupService.getSubspecialties();
   * 
   * // Sadece Kardiyoloji yan dalları
   * const cardioSubspecialties = await lookupService.getSubspecialties(1);
   */
  getSubspecialties: async (specialtyId?: number): Promise<Subspecialty[]> => {
    const url = endpoints.lookup.subspecialties(specialtyId);
    const response = await apiClient.get<ApiResponse<Subspecialty[]>>(url);
    return response.data.data;
  },

  /**
   * Şehirleri getir
   * @returns {Promise<City[]>} Şehir listesi
   * @example
   * const cities = await lookupService.getCities();
   * // [{ id: 1, name: "İstanbul" }, { id: 2, name: "Ankara" }, ...]
   */
  getCities: async (): Promise<City[]> => {
    const response = await apiClient.get<ApiResponse<City[]>>(endpoints.lookup.cities);
    return response.data.data;
  },

  /**
   * Eğitim tiplerini getir
   * @returns {Promise<EducationType[]>} Eğitim tipi listesi
   * @example
   * const educationTypes = await lookupService.getEducationTypes();
   * // [{ id: 1, name: "Tıp Fakültesi" }, { id: 2, name: "Uzmanlık" }, ...]
   */
  getEducationTypes: async (): Promise<EducationType[]> => {
    const response = await apiClient.get<ApiResponse<EducationType[]>>(endpoints.lookup.educationTypes);
    return response.data.data;
  },

  /**
   * Dilleri getir
   * @returns {Promise<Language[]>} Dil listesi
   * @example
   * const languages = await lookupService.getLanguages();
   * // [{ id: 1, name: "İngilizce", code: "en" }, ...]
   */
  getLanguages: async (): Promise<Language[]> => {
    const response = await apiClient.get<ApiResponse<Language[]>>(endpoints.lookup.languages);
    return response.data.data;
  },

  /**
   * Dil seviyelerini getir
   * @returns {Promise<LanguageLevel[]>} Dil seviyesi listesi
   * @example
   * const levels = await lookupService.getLanguageLevels();
   * // [{ id: 1, name: "Başlangıç" }, { id: 2, name: "Orta" }, ...]
   */
  getLanguageLevels: async (): Promise<LanguageLevel[]> => {
    const response = await apiClient.get<ApiResponse<LanguageLevel[]>>(endpoints.lookup.languageLevels);
    return response.data.data;
  },

  /**
   * Sertifika türlerini getir (deprecated - artık kullanılmıyor)
   * @deprecated Certificate types tablosu kaldırıldı
   * @returns {Promise<CertificateType[]>} Boş array
   */
  getCertificateTypes: async (): Promise<CertificateType[]> => {
    // Certificate types tablosu kaldırıldı, boş array döndür
    return [];
  },

  /**
   * Başvuru durumlarını getir
   * @returns {Promise<ApplicationStatus[]>} Başvuru durumu listesi
   * @example
   * const statuses = await lookupService.getApplicationStatuses();
   * // [{ id: 1, name: "Beklemede" }, { id: 2, name: "İncelendi" }, ...]
   */
  getApplicationStatuses: async (): Promise<ApplicationStatus[]> => {
    const response = await apiClient.get<ApiResponse<ApplicationStatus[]>>(endpoints.lookup.applicationStatuses);
    return response.data.data;
  },
};
