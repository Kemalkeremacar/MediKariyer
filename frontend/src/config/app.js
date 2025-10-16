/**
 * @fileoverview Application configuration for MediKariyer
 * @description Defines application-wide constants and settings
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

export const APP_CONFIG = {
  // Application metadata
  APP_NAME: 'MediKariyer',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Medical Career Platform - Doktor ve Hastane Buluşma Platformu',
  APP_TAGLINE: 'Sağlık sektöründe kariyerinizi şekillendirin',
  
  // API configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'http://192.168.1.198:3000/api'),
  API_TIMEOUT: 30000, // 30 seconds
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB for images
  
  // UI configuration
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  
  // Security
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    HOSPITAL: 'hospital',
    GUEST: 'guest'
  },
  
  // Job status
  JOB_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PAUSED: 'paused',
    CLOSED: 'closed',
    EXPIRED: 'expired'
  },
  
  // Application status
  APPLICATION_STATUS: {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn'
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    JOB_APPLICATION: 'job_application',
    JOB_UPDATE: 'job_update',
    PROFILE_UPDATE: 'profile_update',
    SYSTEM: 'system',
    CONTACT: 'contact'
  },
  
  // Feature flags
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
  
  // Theme configuration
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
  
  // Local storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'medikariyer_auth_token',
    REFRESH_TOKEN: 'medikariyer_refresh_token',
    USER_DATA: 'medikariyer_user_data',
    THEME: 'medikariyer_theme',
    LANGUAGE: 'medikariyer_language',
    NOTIFICATIONS: 'medikariyer_notifications'
  },
  
  // Validation rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(\+90|0)?[5][0-9]{9}$/,
    TURKISH_ID_REGEX: /^[1-9][0-9]{10}$/,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_COMPANY_NAME_LENGTH: 3,
    MAX_COMPANY_NAME_LENGTH: 100
  },
  
  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
    TIME: 'HH:mm'
  },
  
  // Error messages
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
  
  // Success messages
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