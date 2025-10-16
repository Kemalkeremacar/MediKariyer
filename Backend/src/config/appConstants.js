/**
 * @file appConstants.js
 * @description Uygulama sabitleri ve varsayılan değerler
 * Schema.sql'deki system_settings tablosu ile uyumlu
 * Frontend appConfig.js ile eşleşen yapı
 */

'use strict';

/**
 * Sistem ayarları için varsayılan değerler
 * Bu değerler system_settings tablosunda yoksa kullanılır
 */
const DEFAULT_SYSTEM_SETTINGS = {
  // Genel Ayarlar
  site_name: 'MediKariyer',
  maintenance_mode: '0', // '0' = kapalı, '1' = açık
  default_language: 'tr',
  items_per_page: '20',
  theme: 'light', // 'light' | 'dark'
  allow_registration: '1', // '0' = kapalı, '1' = açık
  
  // Güvenlik Ayarları
  bcrypt_rounds: '12',
  jwt_expiry: '15m', // 15 dakika
  refresh_token_expiry: '7d', // 7 gün
  max_login_attempts: '5',
  lockout_duration: '900', // 15 dakika (saniye)
  
  // İletişim Ayarları
  support_email: 'support@medikariyer.com',
  contact_phone: '+90 212 555 55 55',
  
  // Sistem Ayarları
  log_level: 'info', // 'error' | 'warn' | 'info' | 'debug'
  api_rate_limit_window: '900000', // 15 dakika (millisaniye)
  api_rate_limit_max: '100', // İstek limiti
  
  // Dosya Yükleme
  max_file_size: '5242880', // 5MB (bytes)
  allowed_file_types: 'jpg,jpeg,png,pdf,doc,docx',
  
  // Email Ayarları
  email_verification_required: '1',
  email_notifications_enabled: '1',
  
  // Bildirim Ayarları
  push_notifications_enabled: '1',
  sms_notifications_enabled: '0',
  
  // İş İlanı Ayarları
  job_auto_expire_days: '30',
  max_applications_per_job: '100',
  
  // Profil Ayarları
  profile_photo_required: '0',
  cv_required_for_doctors: '1',
  
  // Analitik Ayarları
  data_retention_days: '365'
};

/**
 * Sistem istatistikleri için varsayılan anahtarlar
 * Bu anahtarlar system_stats tablosunda takip edilir
 */
const SYSTEM_STATS_KEYS = {
  // Temel Sayılar
  TOTAL_USERS: 'total_users',
  TOTAL_DOCTORS: 'total_doctors',
  TOTAL_HOSPITALS: 'total_hospitals',
  TOTAL_JOBS: 'total_jobs',
  TOTAL_APPLICATIONS: 'total_applications',
  
  // Aktif Sayılar
  ACTIVE_USERS: 'active_users',
  ACTIVE_JOBS: 'active_jobs',
  PENDING_APPROVALS: 'pending_approvals',
  
  // Günlük İstatistikler
  TODAY_REGISTRATIONS: 'today_registrations',
  TODAY_JOBS: 'today_jobs',
  TODAY_APPLICATIONS: 'today_applications',
  
  // Aylık İstatistikler
  MONTHLY_USERS: 'monthly_users',
  MONTHLY_JOBS: 'monthly_jobs',
  MONTHLY_APPLICATIONS: 'monthly_applications'
};

/**
 * Schema validation kuralları
 * Joi validation ile kullanılır
 */
const VALIDATION_RULES = {
  SYSTEM_SETTINGS: {
    KEY_MAX_LENGTH: 100,
    VALUE_MAX_LENGTH: 500,
    DESCRIPTION_MAX_LENGTH: 255
  },
  
  SYSTEM_STATS: {
    KEY_MAX_LENGTH: 100,
    VALUE_MIN: 0,
    VALUE_MAX: 9223372036854775807 // BIGINT max
  },
  
  // Özel validation kuralları
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+90|0)?[5][0-9]{9}$/,
  TIME_DURATION_REGEX: /^(\d+[smhd]?)$/,
  NUMERIC_STRING_REGEX: /^\d+$/,
  
  // Enum değerleri
  THEMES: ['light', 'dark'],
  LANGUAGES: ['tr', 'en'],
  LOG_LEVELS: ['error', 'warn', 'info', 'debug'],
  BOOLEAN_STRINGS: ['0', '1']
};

/**
 * Auth validation kuralları (authSchemas.js için)
 */
const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  PHONE_REGEX: /^(\+90|0)?[5][0-9]{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

/**
 * Kullanıcı rolleri (roleGuard.js için)
 */
const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital'
};

/**
 * API endpoint sabitleri
 */
const API_ENDPOINTS = {
  ADMIN: {
    SETTINGS: '/api/admin/settings'
  },
  
};



/**
 * Hata mesajları
 */
const ERROR_MESSAGES = {
  SETTINGS: {
    NOT_FOUND: 'Sistem ayarı bulunamadı',
    INVALID_KEY: 'Geçersiz ayar anahtarı',
    INVALID_VALUE: 'Geçersiz ayar değeri',
    UPDATE_FAILED: 'Ayar güncellenemedi',
    FETCH_FAILED: 'Ayarlar getirilemedi'
  },
  
  STATS: {
    NOT_FOUND: 'İstatistik bulunamadı',
    INVALID_KEY: 'Geçersiz istatistik anahtarı',
    INVALID_VALUE: 'Geçersiz istatistik değeri',
    UPDATE_FAILED: 'İstatistik güncellenemedi',
    FETCH_FAILED: 'İstatistikler getirilemedi'
  },
  
  DATABASE: {
    CONNECTION_FAILED: 'Veritabanı bağlantısı başarısız',
    TRANSACTION_FAILED: 'Veritabanı işlemi başarısız',
    CONSTRAINT_VIOLATION: 'Veritabanı kısıtlama ihlali'
  },
  
};




module.exports = {
  DEFAULT_SYSTEM_SETTINGS,
  SYSTEM_STATS_KEYS,
  VALIDATION_RULES,
  VALIDATION,
  USER_ROLES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
 
 
};