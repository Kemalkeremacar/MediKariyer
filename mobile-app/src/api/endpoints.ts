/**
 * @file endpoints.ts
 * @description Mobile API için endpoint tanımları
 * 
 * Not: Base URL zaten `/api/mobile` içeriyor (env.ts'de tanımlı)
 * Bu yüzden burada sadece kaynak yollarını tanımlıyoruz
 * 
 * Örnek Kullanım:
 * - endpoints.doctor.profile -> `/doctor/profile`
 * - Tam URL: `${API_BASE_URL}/doctor/profile` -> `/api/mobile/doctor/profile`
 * 
 * Endpoint Kategorileri:
 * - auth: Kimlik doğrulama işlemleri
 * - doctor: Doktor profil ve CRUD işlemleri
 * - lookup: Referans veri listeleri
 * - jobs: İlan listeleme ve detay
 * - applications: Başvuru yönetimi
 * - notifications: Bildirim yönetimi
 * - upload: Dosya yükleme işlemleri
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */
export const endpoints = {
  // Kimlik Doğrulama Endpoint'leri
  auth: {
    login: '/auth/login', // Kullanıcı girişi
    registerDoctor: '/auth/registerDoctor', // Doktor kaydı
    refreshToken: '/auth/refresh', // Token yenileme
    logout: '/auth/logout', // Çıkış
    me: '/auth/me', // Kullanıcı bilgilerini getir
    changePassword: '/auth/change-password', // Şifre değiştir
    forgotPassword: '/auth/forgot-password', // Şifre sıfırlama talebi
    resetPassword: '/auth/reset-password', // Şifre sıfırlama
    markOnboardingCompleted: '/auth/mark-onboarding-completed', // Onboarding tamamlandı
  },
  // Doktor Profil Endpoint'leri
  doctor: {
    profile: '/doctor/profile', // Profil bilgileri
    profileCompletion: '/doctor/profile/completion', // Profil tamamlanma yüzdesi
    updatePersonalInfo: '/doctor/profile/personal', // Kişisel bilgileri güncelle
    // Eğitim CRUD
    educations: '/doctor/educations', // Eğitim listesi
    education: (id: number) => `/doctor/educations/${id}`, // Tek eğitim
    // Deneyim CRUD
    experiences: '/doctor/experiences', // Deneyim listesi
    experience: (id: number) => `/doctor/experiences/${id}`, // Tek deneyim
    // Sertifika CRUD
    certificates: '/doctor/certificates', // Sertifika listesi
    certificate: (id: number) => `/doctor/certificates/${id}`, // Tek sertifika
    // Dil CRUD
    languages: '/doctor/languages', // Dil listesi
    language: (id: number) => `/doctor/languages/${id}`, // Tek dil
    // Fotoğraf İşlemleri (Mobile Backend)
    profilePhoto: '/doctor/profile/photo', // Profil fotoğrafı
    photoStatus: '/doctor/profile/photo/status', // Fotoğraf onay durumu
    photoHistory: '/doctor/profile/photo/history', // Fotoğraf geçmişi
    photoRequest: '/doctor/profile/photo/request', // Fotoğraf değişiklik talebi
    // Hesap Yönetimi (Mobile Backend)
    deactivateAccount: '/doctor/account/deactivate', // Hesabı pasifleştir
  },
  // Referans Veri Endpoint'leri
  lookup: {
    cities: '/lookup/cities', // Şehir listesi
    specialties: '/lookup/specialties', // Branş listesi
    subspecialties: (specialtyId?: number) =>
      specialtyId ? `/lookup/subspecialties/${specialtyId}` : '/lookup/subspecialties', // Yan dal listesi
    educationTypes: '/lookup/education-types', // Eğitim tipleri
    languages: '/lookup/languages', // Dil listesi
    languageLevels: '/lookup/language-levels', // Dil seviyeleri
    applicationStatuses: '/lookup/application-statuses', // Başvuru durumları
  },
  // İlan Endpoint'leri
  jobs: {
    list: '/jobs', // İlan listesi
    detail: (id: number) => `/jobs/${id}`, // İlan detayı
  },
  // Başvuru Endpoint'leri
  applications: {
    list: '/applications', // Başvuru listesi
    detail: (id: number) => `/applications/${id}`, // Başvuru detayı
    create: '/applications', // Başvuru oluştur
    withdraw: (id: number) => `/applications/${id}/withdraw`, // Başvuruyu geri çek
  },
  // Bildirim Endpoint'leri
  notifications: {
    list: '/notifications', // Bildirim listesi
    markAsRead: (id: number) => `/notifications/${id}/read`, // Okundu olarak işaretle
    markAllAsRead: '/notifications/mark-all-read', // Tümünü okundu işaretle
    clearRead: '/notifications/clear-read', // Okunmuşları temizle
    delete: (id: number) => `/notifications/${id}`, // Bildirimi sil
    deleteMany: '/notifications/delete-many', // Çoklu silme
    unreadCount: '/notifications/unread-count', // Okunmamış sayısı
  },
  // Cihaz Token Endpoint'i (Push Notification için)
  deviceToken: '/device-token',
  // Dosya Yükleme Endpoint'leri
  upload: {
    profilePhoto: '/upload/profile-photo', // Profil fotoğrafı yükle
    registerPhoto: '/upload/register-photo', // Kayıt fotoğrafı yükle
  },
} as const;

