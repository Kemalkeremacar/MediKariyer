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
  },
  doctor: {
    dashboard: '/doctor/dashboard',
    profile: '/doctor/profile',
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
    unreadCount: '/notifications/unread-count',
  },
  deviceToken: '/device-token',
  lookup: {
    specialties: '/lookup/specialties',
    subspecialties: (specialtyId?: number) =>
      specialtyId ? `/lookup/subspecialties/${specialtyId}` : '/lookup/subspecialties',
    cities: '/lookup/cities',
  },
} as const;

