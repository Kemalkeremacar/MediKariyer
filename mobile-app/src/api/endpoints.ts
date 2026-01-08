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
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  doctor: {
    profile: '/doctor/profile',
    profileCompletion: '/doctor/profile/completion',
    updatePersonalInfo: '/doctor/profile/personal',
    // Education CRUD
    educations: '/doctor/educations',
    education: (id: number) => `/doctor/educations/${id}`,
    // Experience CRUD
    experiences: '/doctor/experiences',
    experience: (id: number) => `/doctor/experiences/${id}`,
    // Certificate CRUD
    certificates: '/doctor/certificates',
    certificate: (id: number) => `/doctor/certificates/${id}`,
    // Language CRUD
    languages: '/doctor/languages',
    language: (id: number) => `/doctor/languages/${id}`,
    // Photo Request (Mobile Backend)
    profilePhoto: '/doctor/profile/photo',
    photoStatus: '/doctor/profile/photo/status',
    photoHistory: '/doctor/profile/photo/history',
    photoRequest: '/doctor/profile/photo/request',
    // Account Management (Mobile Backend)
    deactivateAccount: '/doctor/account/deactivate',
  },
  lookup: {
    cities: '/lookup/cities',
    specialties: '/lookup/specialties',
    subspecialties: (specialtyId?: number) =>
      specialtyId ? `/lookup/subspecialties/${specialtyId}` : '/lookup/subspecialties',
    educationTypes: '/lookup/education-types',
    languages: '/lookup/languages',
    languageLevels: '/lookup/language-levels',
    applicationStatuses: '/lookup/application-statuses',
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
    markAllAsRead: '/notifications/mark-all-read',
    clearRead: '/notifications/clear-read',
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

