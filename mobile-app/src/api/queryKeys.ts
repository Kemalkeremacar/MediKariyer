/**
 * Query Key Factory
 * ARCH-003: Merkezi, type-safe query key yönetimi
 * 
 * Faydaları:
 * - Tutarlı query key yapısı
 * - Type-safe invalidation
 * - Autocomplete desteği
 * - Kolay refactoring
 * 
 * Kullanım:
 * - useQuery({ queryKey: queryKeys.jobs.list(filters) })
 * - queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
 */

import type { JobListParams } from './services/job.service';

// Filter types
export interface ApplicationFilters {
  status_id?: number;
  keyword?: string;
}

export interface NotificationFilters {
  showUnreadOnly?: boolean;
  limit?: number;
}

/**
 * Centralized Query Keys
 * Hierarchical structure allows for granular or broad invalidation
 */
export const queryKeys = {
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    list: (filters?: JobListParams) => [...queryKeys.jobs.all, 'list', filters] as const,
    detail: (id: number) => [...queryKeys.jobs.all, 'detail', id] as const,
  },

  // Profile
  profile: {
    all: ['profile'] as const,
    complete: () => [...queryKeys.profile.all, 'complete'] as const,
    completion: () => [...queryKeys.profile.all, 'completion'] as const,
    educations: () => [...queryKeys.profile.all, 'educations'] as const,
    experiences: () => [...queryKeys.profile.all, 'experiences'] as const,
    certificates: () => [...queryKeys.profile.all, 'certificates'] as const,
    languages: () => [...queryKeys.profile.all, 'languages'] as const,
  },

  // Applications
  applications: {
    all: ['applications'] as const,
    list: (filters?: ApplicationFilters) => [...queryKeys.applications.all, 'list', filters] as const,
    detail: (id: number) => [...queryKeys.applications.all, 'detail', id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: NotificationFilters) => [...queryKeys.notifications.all, 'list', filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },

  // Lookup (static data)
  lookup: {
    all: ['lookup'] as const,
    specialties: () => [...queryKeys.lookup.all, 'specialties'] as const,
    subspecialties: (specialtyId?: number) => [...queryKeys.lookup.all, 'subspecialties', specialtyId] as const,
    cities: () => [...queryKeys.lookup.all, 'cities'] as const,
    educationTypes: () => [...queryKeys.lookup.all, 'educationTypes'] as const,
    languages: () => [...queryKeys.lookup.all, 'languages'] as const,
    languageLevels: () => [...queryKeys.lookup.all, 'languageLevels'] as const,
    certificateTypes: () => [...queryKeys.lookup.all, 'certificateTypes'] as const,
    applicationStatuses: () => [...queryKeys.lookup.all, 'applicationStatuses'] as const,
  },

  // Photo management
  photo: {
    all: ['photo'] as const,
    status: () => [...queryKeys.photo.all, 'status'] as const,
    history: () => [...queryKeys.photo.all, 'history'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
  },
} as const;

// Type exports for external use
export type QueryKeys = typeof queryKeys;
