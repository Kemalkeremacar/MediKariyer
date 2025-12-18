/**
 * API Endpoints - Mobile API için endpoint tanımları
 * 
 * Not: Base URL zaten `/api/mobile` içeriyor (config.ts'de tanımlı)
 * Bu yüzden burada sadece kaynak yollarını tanımlıyoruz
 * 
 * Örnek: `/doctor/profile` -> `/api/mobile/doctor/profile`
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    registerDoctor: '/auth/registerDoctor',
    refreshToken: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
  },
  doctor: {
    profile: '/doctor/profile',
    profileCompletion: '/doctor/profile/completion',
    updatePersonalInfo: '/doctor/profile/personal',
    // Education CRUD
    educations: '/doctor/education',
    education: (id: number) => `/doctor/education/${id}`,
    // Experience CRUD
    experiences: '/doctor/experience',
    experience: (id: number) => `/doctor/experience/${id}`,
    // Certificate CRUD
    certificates: '/doctor/certificate',
    certificate: (id: number) => `/doctor/certificate/${id}`,
    // Language CRUD
    languages: '/doctor/language',
    language: (id: number) => `/doctor/language/${id}`,
  },
  jobs: {
    list: '/jobs',
    detail: (id: number) => `/jobs/${id}`,
  },
  applications: {
    list: '/applications',
    detail: (id: number) => `/applications/${id}`,
    create: '/applications',
    withdraw: (id: number) => `/applications/${id}/withdraw`,
  },
  notifications: {
    list: '/notifications',
    markAsRead: (id: number) => `/notifications/${id}/read`,
    delete: (id: number) => `/notifications/${id}`,
    deleteMany: '/notifications/delete-many',
    unreadCount: '/notifications/unread-count',
  },
  deviceToken: '/device-token',
  upload: {
    profilePhoto: '/upload/profile-photo',
    registerPhoto: '/upload/register-photo',
  },
} as const;

/**
 * Root API Endpoints - Ana API için endpoint tanımları
 * 
 * Not: Bu endpoint'ler rootApiClient ile kullanılır (PRIMARY_API_BASE_URL)
 * Base URL: `/api` (mobile değil)
 */
export const rootEndpoints = {
  lookup: {
    specialties: '/lookup/specialties',
    subspecialties: (specialtyId?: number) =>
      specialtyId ? `/lookup/subspecialties/${specialtyId}` : '/lookup/subspecialties',
    cities: '/lookup/cities',
    applicationStatuses: '/lookup/application-statuses',
    educationTypes: '/lookup/doctor-education-types',
    languages: '/lookup/languages',
    languageLevels: '/lookup/language-levels',
  },
  doctor: {
    profile: {
      personal: '/doctor/profile/personal',
      photo: '/doctor/profile/photo',
      photoStatus: '/doctor/profile/photo/status',
      photoHistory: '/doctor/profile/photo/history',
      photoRequest: '/doctor/profile/photo/request',
    },
    educations: '/doctor/educations',
    education: (id: number) => `/doctor/educations/${id}`,
    experiences: '/doctor/experiences',
    experience: (id: number) => `/doctor/experiences/${id}`,
    certificates: '/doctor/certificates',
    certificate: (id: number) => `/doctor/certificates/${id}`,
    languages: '/doctor/languages',
    language: (id: number) => `/doctor/languages/${id}`,
  },
} as const;

