/**
 * @file queryKeys.ts
 * @description Query Key Factory - Merkezi, type-safe query key yönetimi
 * 
 * Mimari: ARCH-003
 * 
 * Faydaları:
 * - Tutarlı query key yapısı (hiyerarşik)
 * - Type-safe invalidation (tip güvenli)
 * - Autocomplete desteği (IDE yardımı)
 * - Kolay refactoring (değişiklikler tek yerden)
 * 
 * Kullanım Örnekleri:
 * - useQuery({ queryKey: queryKeys.jobs.list(filters) })
 * - queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
 * - queryClient.invalidateQueries({ queryKey: queryKeys.profile.educations() })
 * 
 * Hiyerarşik Yapı:
 * - jobs.all -> Tüm job query'lerini invalidate eder
 * - jobs.list(filters) -> Sadece belirli filtreye sahip listeyi invalidate eder
 * - jobs.detail(id) -> Sadece belirli ID'ye sahip detayı invalidate eder
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import type { JobListParams } from './services/job.service';

// ============================================================================
// FİLTRE TİPLERİ
// ============================================================================

// Başvuru filtreleri
export interface ApplicationFilters {
  status_id?: number; // Durum ID'si
  keyword?: string; // Arama kelimesi
}

// Bildirim filtreleri
export interface NotificationFilters {
  showUnreadOnly?: boolean; // Sadece okunmamışları göster
  limit?: number; // Limit
}

// ============================================================================
// MERKEZİ QUERY KEY'LER
// ============================================================================

/**
 * Merkezi Query Key'ler
 * @description Hiyerarşik yapı, granüler veya geniş invalidation'a izin verir
 * 
 * Örnek Kullanım:
 * - queryKeys.jobs.all -> ['jobs']
 * - queryKeys.jobs.list({ city_id: 1 }) -> ['jobs', 'list', { city_id: 1 }]
 * - queryKeys.jobs.detail(5) -> ['jobs', 'detail', 5]
 */
export const queryKeys = {
  // İş İlanları
  jobs: {
    all: ['jobs'] as const, // Tüm job query'leri
    list: (filters?: JobListParams) => [...queryKeys.jobs.all, 'list', filters] as const, // İlan listesi
    detail: (id: number) => [...queryKeys.jobs.all, 'detail', id] as const, // İlan detayı
  },

  // Profil
  profile: {
    all: ['profile'] as const, // Tüm profil query'leri
    complete: () => [...queryKeys.profile.all, 'complete'] as const, // Tam profil
    completion: () => [...queryKeys.profile.all, 'completion'] as const, // Tamamlanma yüzdesi
    educations: () => [...queryKeys.profile.all, 'educations'] as const, // Eğitimler
    experiences: () => [...queryKeys.profile.all, 'experiences'] as const, // Deneyimler
    certificates: () => [...queryKeys.profile.all, 'certificates'] as const, // Sertifikalar
    languages: () => [...queryKeys.profile.all, 'languages'] as const, // Diller
  },

  // Başvurular
  applications: {
    all: ['applications'] as const, // Tüm başvuru query'leri
    list: (filters?: ApplicationFilters) => [...queryKeys.applications.all, 'list', filters] as const, // Başvuru listesi
    detail: (id: number) => [...queryKeys.applications.all, 'detail', id] as const, // Başvuru detayı
  },

  // Bildirimler
  notifications: {
    all: ['notifications'] as const, // Tüm bildirim query'leri
    list: (filters?: NotificationFilters) => [...queryKeys.notifications.all, 'list', filters] as const, // Bildirim listesi
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const, // Okunmamış sayısı
  },

  // Lookup (statik veri)
  lookup: {
    all: ['lookup'] as const, // Tüm lookup query'leri
    specialties: () => [...queryKeys.lookup.all, 'specialties'] as const, // Branşlar
    subspecialties: (specialtyId?: number) => [...queryKeys.lookup.all, 'subspecialties', specialtyId] as const, // Yan dallar
    cities: () => [...queryKeys.lookup.all, 'cities'] as const, // Şehirler
    educationTypes: () => [...queryKeys.lookup.all, 'educationTypes'] as const, // Eğitim tipleri
    languages: () => [...queryKeys.lookup.all, 'languages'] as const, // Diller
    languageLevels: () => [...queryKeys.lookup.all, 'languageLevels'] as const, // Dil seviyeleri
    certificateTypes: () => [...queryKeys.lookup.all, 'certificateTypes'] as const, // Sertifika tipleri
    applicationStatuses: () => [...queryKeys.lookup.all, 'applicationStatuses'] as const, // Başvuru durumları
  },

  // Fotoğraf yönetimi
  photo: {
    all: ['photo'] as const, // Tüm fotoğraf query'leri
    status: () => [...queryKeys.photo.all, 'status'] as const, // Fotoğraf durumu
    history: () => [...queryKeys.photo.all, 'history'] as const, // Fotoğraf geçmişi
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const, // Tüm dashboard query'leri
  },
} as const;

// ============================================================================
// TİP EXPORT'LARI
// ============================================================================

// Dış kullanım için tip export'u
export type QueryKeys = typeof queryKeys;
