/**
 * @file app.js
 * @description Application Configuration - Uygulama geneli sabitler ve ayarlar
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm sabitler, konfigürasyonlar ve
 * ayarları merkezi olarak tanımlar. Uygulama adı, API URL'leri, dosya yükleme
 * limitleri, validasyon kuralları, renk şemaları ve diğer genel ayarlar burada
 * toplanmıştır.
 * 
 * Ana Özellikler:
 * - Uygulama metadata: Ad, versiyon, açıklama, slogan
 * - API konfigürasyonu: Base URL, timeout, pagination
 * - Dosya yükleme: Max boyut, izin verilen türler
 * - UI ayarları: Toast süresi, debounce delay, animasyon süresi
 * - Güvenlik: Session timeout, login attempt limit, şifre kuralları
 * - Rol tanımları: Admin, Doctor, Hospital, Guest
 * - Durum tanımları: Job status, application status, notification types
 * - Özellik bayrakları: Feature flags ile özellik açma/kapama
 * - Tema: Renk paleti ve breakpoint'ler
 * - Local storage key'leri: Storage key tanımları
 * - Validasyon kuralları: Regex pattern'ler, uzunluk limitleri
 * - Tarih formatları: Display, API, datetime, time formatları
 * - Hata mesajları: Kullanıcı dostu hata mesajları
 * - Başarı mesajları: Kullanıcı dostu başarı mesajları
 * 
 * Kullanım:
 * ```jsx
 * import { APP_CONFIG } from '@config/app';
 * 
 * console.log(APP_CONFIG.APP_NAME);
 * const maxSize = APP_CONFIG.MAX_FILE_SIZE;
 * ```
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: API base URL'i (varsayılan: localhost:3100/api)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

// ============================================================================
// APPLICATION CONFIGURATION OBJECT
// ============================================================================

export const APP_CONFIG = {
  // ==================== UYGULAMA METADATA ====================
  /**
   * Uygulama adı, versiyon, açıklama ve slogan bilgileri
   */
  APP_NAME: 'MediKariyer.Net',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Türkiye\'nin en güvenilir sağlık kariyer platformu',
  APP_TAGLINE: 'Doktorlar ve sağlık kurumlarını bir araya getiriyoruz',
  
  // ==================== İLETİŞİM BİLGİLERİ ====================
  /**
   * Şirket iletişim bilgileri
   */
  CONTACT_INFO: {
    ADDRESS: 'Atatürk Mah. Turgut Özal Bulv. Gardenya 1 Plaza İş Merkezi, D:42/B Kat:5 Ataşehir-İstanbul',
    PHONE: '+90 212 227 80 20',
    PHONE_DISPLAY: '+90 212 227 80 20',
    EMAIL: 'info@medikariyer.net',
    WEBSITE: 'https://medikariyer.com'
  },
  
  // ==================== SOSYAL MEDYA LİNKLERİ ====================
  /**
   * Sosyal medya hesap linkleri
   */
  SOCIAL_LINKS: {
    FACEBOOK: 'https://facebook.com/medikariyer',
    TWITTER: 'https://twitter.com/medikariyer',
    INSTAGRAM: 'https://instagram.com/medikariyer',
    LINKEDIN: 'https://linkedin.com/company/medikariyer',
    YOUTUBE: 'https://youtube.com/@medikariyer'
  },
  
  // ==================== API KONFIGÜRASYONU ====================
  /**
   * API base URL ve timeout ayarları
   */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3100/api' : 'https://mkapi.monassist.com/api'),
  API_TIMEOUT: 30000, // 30 saniye
  
  // ==================== SAYFALAMA AYARLARI ====================
  /**
   * Pagination için varsayılan ve maksimum sayfa boyutu
   */
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // ==================== DOSYA YÜKLEME AYARLARI ====================
  /**
   * Dosya yükleme limitleri ve izin verilen dosya türleri
   */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB (resimler için)
  
  // ==================== UI KONFIGÜRASYONU ====================
  /**
   * Kullanıcı arayüzü ayarları: Toast süresi, debounce, animasyon
   */
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  
  // ==================== GÜVENLİK AYARLARI ====================
  /**
   * Güvenlik ile ilgili ayarlar: Session timeout, login limit, şifre kuralları
   */
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  
  // ==================== KULLANICI ROLLERİ ====================
  /**
   * Sistem kullanıcı rol tanımları
   */
  USER_ROLES: {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    HOSPITAL: 'hospital',
    GUEST: 'guest'
  },
  
  // ==================== İŞ İLANI DURUMLARI ====================
  /**
   * İş ilanı durum tanımları
   */
  JOB_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PAUSED: 'paused',
    CLOSED: 'closed',
    EXPIRED: 'expired'
  },
  
  // ==================== BAŞVURU DURUMLARI ====================
  /**
   * Başvuru durum tanımları
   */
  APPLICATION_STATUS: {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn'
  },
  
  // ==================== BİLDİRİM TİPLERİ ====================
  /**
   * Bildirim tip tanımları
   */
  NOTIFICATION_TYPES: {
    JOB_APPLICATION: 'job_application',
    JOB_UPDATE: 'job_update',
    PROFILE_UPDATE: 'profile_update',
    SYSTEM: 'system',
    CONTACT: 'contact'
  },
  
  // ==================== ÖZELLİK BAYRAKLARI ====================
  /**
   * Feature flags ile özellik açma/kapama kontrolü
   */
  FEATURES: {
    NOTIFICATIONS: true,
    ANALYTICS: true,
    FILE_UPLOAD: true,
    REAL_TIME_UPDATES: true,
    DARK_MODE: true,
    MOBILE_OPTIMIZATION: true,
    SEARCH_FILTERS: true,
    EXPORT_DATA: true,
    BULK_OPERATIONS: true,
    ADVANCED_REPORTING: true
  },
  
  // ==================== TEMA KONFIGÜRASYONU ====================
  /**
   * Tema renk paleti ve breakpoint tanımları
   */
  THEME: {
    PRIMARY_COLOR: '#3B82F6', // Blue
    SECONDARY_COLOR: '#06B6D4', // Cyan
    SUCCESS_COLOR: '#10B981', // Green
    WARNING_COLOR: '#F59E0B', // Yellow
    ERROR_COLOR: '#EF4444', // Red
    INFO_COLOR: '#6366F1' // Indigo
  },
  
  // Mobile breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  },
  
  // ==================== LOCAL STORAGE KEY'LERİ ====================
  /**
   * Local Storage ve Session Storage için key tanımları
   */
  STORAGE_KEYS: {
    AUTH_TOKEN: 'medikariyer_auth_token',
    REFRESH_TOKEN: 'medikariyer_refresh_token',
    USER_DATA: 'medikariyer_user_data',
    THEME: 'medikariyer_theme',
    LANGUAGE: 'medikariyer_language',
    NOTIFICATIONS: 'medikariyer_notifications'
  },
  
  // ==================== VALİDASYON KURALLARI ====================
  /**
   * Form validasyonu için regex pattern'ler ve uzunluk limitleri
   */
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(\+90|0)?[5][0-9]{9}$/,
    TURKISH_ID_REGEX: /^[1-9][0-9]{10}$/,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_COMPANY_NAME_LENGTH: 3,
    MAX_COMPANY_NAME_LENGTH: 100
  },
  
  // ==================== TARİH FORMATLARI ====================
  /**
   * Tarih gösterimi ve API formatları
   */
  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
    TIME: 'HH:mm'
  },
  
  // ==================== HATA MESAJLARI ====================
  /**
   * Kullanıcı dostu hata mesajları
   */
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
    UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır.',
    FORBIDDEN: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
    NOT_FOUND: 'Aradığınız sayfa bulunamadı.',
    SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    VALIDATION_ERROR: 'Lütfen tüm alanları doğru şekilde doldurun.',
    FILE_TOO_LARGE: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.',
    INVALID_FILE_TYPE: 'Geçersiz dosya türü. Lütfen desteklenen formatları kullanın.'
  },
  
  // ==================== BAŞARI MESAJLARI ====================
  /**
   * Kullanıcı dostu başarı mesajları
   */
  SUCCESS_MESSAGES: {
    PROFILE_UPDATED: 'Profiliniz başarıyla güncellendi.',
    JOB_CREATED: 'İş ilanı başarıyla oluşturuldu.',
    APPLICATION_SUBMITTED: 'Başvurunuz başarıyla gönderildi.',
    PASSWORD_CHANGED: 'Şifreniz başarıyla değiştirildi.',
    ACCOUNT_CREATED: 'Hesabınız başarıyla oluşturuldu.',
    LOGIN_SUCCESS: 'Giriş başarılı. Hoş geldiniz!',
    LOGOUT_SUCCESS: 'Başarıyla çıkış yaptınız.'
  }
};