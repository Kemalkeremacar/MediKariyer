/**
 * @file constants.ts
 * @description Uygulama sabitleri
 * 
 * Uygulama genelinde kullanılan merkezi sabit değerler.
 * Kategoriler:
 * - API Yapılandırması
 * - Cache Yapılandırması
 * - Sayfalama
 * - Dosya Yükleme
 * - Validasyon
 * - UI/UX
 * - Storage Anahtarları
 * - Uygulama Durumları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// API YAPILANDIRMASI
// ============================================================================
export const REQUEST_TIMEOUT_MS = 30000; // 30 saniye
export const MAX_RETRY_ATTEMPTS = 2; // Maksimum yeniden deneme sayısı

// ============================================================================
// CACHE YAPILANDIRMASI
// ============================================================================
export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 dakika - veri eskime süresi
export const CACHE_TIME = 10 * 60 * 1000; // 10 dakika - cache'te kalma süresi

// ============================================================================
// SAYFALAMA
// ============================================================================
export const DEFAULT_PAGE_SIZE = 20; // Varsayılan sayfa boyutu
export const MAX_PAGE_SIZE = 100; // Maksimum sayfa boyutu

// TD-008: Sayfalama sabitleri (özelleştirilmiş)
export const PAGINATION = {
  JOBS_PAGE_SIZE: 10, // İlanlar için sayfa boyutu
  APPLICATIONS_PAGE_SIZE: 10, // Başvurular için sayfa boyutu
  NOTIFICATIONS_PAGE_SIZE: 20, // Bildirimler için sayfa boyutu
} as const;

// ============================================================================
// DOSYA YÜKLEME
// ============================================================================
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - maksimum dosya boyutu
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg']; // İzin verilen resim tipleri
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword']; // İzin verilen döküman tipleri

// ============================================================================
// VALİDASYON
// ============================================================================
export const MIN_PASSWORD_LENGTH = 8; // Minimum şifre uzunluğu
export const MAX_PASSWORD_LENGTH = 128; // Maksimum şifre uzunluğu
export const MIN_NAME_LENGTH = 2; // Minimum isim uzunluğu
export const MAX_NAME_LENGTH = 50; // Maksimum isim uzunluğu

// ============================================================================
// UI/UX
// ============================================================================
export const TOAST_DURATION = 3000; // 3 saniye - toast gösterim süresi
export const DEBOUNCE_DELAY = 300; // 300ms - genel debounce gecikmesi
export const SEARCH_DEBOUNCE_DELAY = 800; // 800ms - arama için debounce (kullanıcı yazmayı bitirene kadar bekle)
export const ANIMATION_DURATION = 200; // 200ms - animasyon süresi

// ============================================================================
// CACHE SÜRELERİ (milisaniye)
// ============================================================================
export const CACHE_DURATIONS = {
  JOBS: 5 * 60 * 1000, // 5 dakika - ilanlar için
  PROFILE: 10 * 60 * 1000, // 10 dakika - profil için
  NOTIFICATIONS: 2 * 60 * 1000, // 2 dakika - bildirimler için
} as const;

// ============================================================================
// STORAGE ANAHTARLARI
// ============================================================================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token', // Access token anahtarı
  REFRESH_TOKEN: 'refresh_token', // Refresh token anahtarı
  USER_DATA: 'user_data', // Kullanıcı verisi anahtarı
  THEME_MODE: 'theme_mode', // Tema modu anahtarı
  LANGUAGE: 'language', // Dil anahtarı
  ONBOARDING_COMPLETED: 'onboarding_completed', // Onboarding tamamlandı mı?
} as const;

// ============================================================================
// ONAY DURUMU
// ============================================================================
export const APPROVAL_STATUS = {
  PENDING: 'pending', // Beklemede
  APPROVED: 'approved', // Onaylandı
  REJECTED: 'rejected', // Reddedildi
  DISABLED: 'disabled', // Pasifleştirildi
} as const;

// ============================================================================
// KULLANICI ROLLERİ
// ============================================================================
export const USER_ROLES = {
  DOCTOR: 'doctor', // Doktor
  HOSPITAL: 'hospital', // Hastane
  ADMIN: 'admin', // Admin
} as const;

// ============================================================================
// BAŞVURU DURUMU
// ============================================================================
export const APPLICATION_STATUS = {
  PENDING: 'pending', // Beklemede
  REVIEWED: 'reviewed', // İncelendi
  SHORTLISTED: 'shortlisted', // Kısa listeye alındı
  REJECTED: 'rejected', // Reddedildi
  ACCEPTED: 'accepted', // Kabul edildi
} as const;

// ============================================================================
// BİLDİRİM TİPLERİ
// ============================================================================
export const NOTIFICATION_TYPES = {
  APPLICATION_STATUS: 'application_status', // Başvuru durumu değişikliği
  NEW_JOB: 'new_job', // Yeni ilan
  MESSAGE: 'message', // Mesaj
  SYSTEM: 'system', // Sistem bildirimi
} as const;
