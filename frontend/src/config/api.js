/**
 * @file api.js
 * @description API Configuration - Backend API endpoint tanımları ve utility fonksiyonlar
 * 
 * Bu dosya, tüm backend API endpoint'lerinin merkezi tanımını içerir. Backend route'larla
 * birebir uyumlu olacak şekilde tasarlanmıştır. Endpoint'ler rol bazında organize edilmiştir
 * ve parametreli URL'ler için utility fonksiyonlar sağlar.
 * 
 * Ana Özellikler:
 * - Backend uyumluluk: Backend route'larla birebir eşleşme
 * - Rol bazlı organizasyon: Auth, Doctor, Hospital, Admin, Lookup, Notifications, Contact
 * - Parametreli endpoint'ler: :id, :jobId gibi dinamik parametreler
 * - Utility fonksiyonlar: buildEndpoint, buildQueryString, buildUrl, buildApiUrl
 * - Tip güvenliği: Sabit string değerleri ile tip güvenliği
 * - Merkezi yönetim: Tüm endpoint'ler tek yerden yönetilir
 * 
 * Backend Uyumluluk:
 * - adminService.js, doctorService.js, hospitalService.js ile eşleşir
 * - adminController.js, doctorController.js, hospitalController.js ile uyumlu
 * - adminRoutes.js, doctorRoutes.js, hospitalRoutes.js ile uyumlu
 * 
 * Endpoint Kategorileri:
 * 1. AUTH: Kimlik doğrulama ve yetkilendirme endpoint'leri
 * 2. DOCTOR: Doktor profil, eğitim, deneyim, başvuru yönetimi
 * 3. HOSPITAL: Hastane profil, departman, iş ilanı, başvuru yönetimi
 * 4. ADMIN: Admin paneli endpoint'leri (kullanıcı, ilan, başvuru yönetimi)
 * 5. LOOKUP: Lookup tabloları (şehir, uzmanlık, dil, sertifika vb.)
 * 6. NOTIFICATIONS: Bildirim yönetimi endpoint'leri
 * 7. CONTACT: İletişim mesajları endpoint'leri
 * 8. SYSTEM: Sistem sağlık kontrolü ve istatistikleri
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * import { ENDPOINTS, buildEndpoint, buildApiUrl } from '@config/api';
 * 
 * // Basit endpoint
 * const url = ENDPOINTS.DOCTOR.PROFILE;
 * 
 * // Parametreli endpoint
 * const url = buildEndpoint(ENDPOINTS.DOCTOR.EDUCATION_DETAIL, { id: 123 });
 * 
 * // Query parametreli endpoint
 * const url = buildApiUrl(ENDPOINTS.DOCTOR.JOBS, {}, { page: 1, limit: 10 });
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 4.0.0
 * @since 2024
 */

import { APP_CONFIG } from './app.js';

// ============================================================================
// API BASE CONFIGURATION
// ============================================================================

/**
 * API Base URL - Environment variable'dan veya varsayılan değerden alınır
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'http://192.168.1.198:3000/api');

/**
 * API Request Timeout - 30 saniye
 */
export const API_TIMEOUT = 30000;

/**
 * Default HTTP Headers - Tüm API istekleri için varsayılan header'lar
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ============================================================================
// API ENDPOINT DEFINITIONS
// ============================================================================

/**
 * Tüm API endpoint tanımları
 * Backend route'larla birebir uyumlu olacak şekilde organize edilmiştir
 */
export const ENDPOINTS = {
  // ==================== AUTH ENDPOINTS - Backend authRoutes.js ile tam uyumlu ====================
  AUTH: {
    LOGIN: '/auth/login', // POST /auth/login - authController.loginUnified
    REGISTER_DOCTOR: '/auth/registerDoctor', // POST /auth/registerDoctor - authController.registerDoctor
    REGISTER_HOSPITAL: '/auth/registerHospital', // POST /auth/registerHospital - authController.registerHospital
    REFRESH: '/auth/refresh', // POST /auth/refresh - authController.refreshToken
    LOGOUT: '/auth/logout', // POST /auth/logout - authController.logout
    LOGOUT_ALL: '/auth/logout-all', // POST /auth/logout-all - authController.logoutAll
    CHANGE_PASSWORD: '/auth/change-password', // POST /auth/change-password - authController.changePassword
    VERIFY_TOKEN: '/auth/verify-token', // POST /auth/verify-token - authController.verifyToken
    ME: '/auth/me', // GET /auth/me - authController.getMe
    FORGOT_PASSWORD: '/auth/forgot-password', // POST /auth/forgot-password - authController.forgotPassword
    RESET_PASSWORD: '/auth/reset-password', // POST /auth/reset-password - authController.resetPassword
  },

  // ==================== DOCTOR ENDPOINTS (Backend: /api/doctor/*) ====================
  /**
   * Doktor profil, eğitim, deneyim, başvuru ve dashboard endpoint'leri
   * Backend doctorService.js ve doctorController.js ile uyumlu
   */
  DOCTOR: {
    // Profil yönetimi
    PROFILE: '/doctor/profile', // GET/PUT - Temel profil bilgileri
    PROFILE_FULL: '/doctor/profile/full', // GET - Tam profil bilgileri
    PROFILE_COMPLETE: '/doctor/profile/complete', // GET - Tam profil bilgileri (alias)
    PROFILE_COMPLETION: '/doctor/profile/completion', // GET - Profil tamamlanma oranı
    PROFILE_PERSONAL: '/doctor/profile/personal', // PATCH - Kişisel bilgi güncelleme
    
    // Eğitim CRUD
    EDUCATIONS: '/doctor/educations', // GET/POST - Eğitim listesi/oluşturma
    EDUCATION_DETAIL: '/doctor/educations/:id', // PATCH/DELETE - Eğitim güncelleme/silme
    
    // Deneyim CRUD
    EXPERIENCES: '/doctor/experiences', // GET/POST - Deneyim listesi/oluşturma
    EXPERIENCE_DETAIL: '/doctor/experiences/:id', // PATCH/DELETE - Deneyim güncelleme/silme
    
    // Sertifika CRUD
    CERTIFICATES: '/doctor/certificates', // GET/POST - Sertifika listesi/oluşturma
    CERTIFICATE_DETAIL: '/doctor/certificates/:id', // PATCH/DELETE - Sertifika güncelleme/silme
    
    // Dil CRUD
    LANGUAGES: '/doctor/languages', // GET/POST - Dil listesi/oluşturma
    LANGUAGE_DETAIL: '/doctor/languages/:id', // PATCH/DELETE - Dil güncelleme/silme
    
    // İş ilanları ve başvurular
    JOBS: '/doctor/jobs', // GET - Doktor için iş ilanları
    JOB_DETAIL: '/doctor/jobs/:id', // GET - İş ilanı detayı
    APPLICATIONS: '/doctor/applications', // POST - Başvuru oluşturma
    APPLICATIONS_ME: '/doctor/applications/me', // GET - Doktorun başvuruları
    APPLICATION_DETAIL: '/doctor/applications/:id', // GET/PATCH/DELETE - Başvuru detayı/güncelleme/silme
    APPLICATION_WITHDRAW: '/doctor/applications/:id/withdraw', // POST - Başvuru geri çekme
    APPLICATION_DELETE: '/doctor/applications/:id', // DELETE - Başvuru silme
    
    // Dashboard ve istatistikler
    DASHBOARD: '/doctor/dashboard', // GET - Doktor dashboard verileri
    RECENT_JOBS: '/doctor/recent-jobs', // GET - Son iş ilanları
    APPLICATION_STATS: '/doctor/application-stats', // GET - Başvuru istatistikleri
    
    // Doktor profil görüntüleme (hastane için)
    PROFILE_VIEW: '/doctor/profile/view', // GET - Profil görüntüleme
    PROFILE_SEARCH: '/doctor/profile/search', // GET - Doktor arama
  },

  // ==================== HOSPITAL ENDPOINTS (Backend: /api/hospital/*) ====================
  /**
   * Hastane profil, departman, iş ilanı, başvuru ve dashboard endpoint'leri
   * Backend hospitalService.js ve hospitalController.js ile uyumlu
   */
  HOSPITAL: {
    // Profil yönetimi
    PROFILE: '/hospital', // GET/PUT - Temel profil bilgileri
    PROFILE_FULL: '/hospital', // GET - Tam profil bilgileri (aynı endpoint)
    PROFILE_COMPLETION: '/hospital/profile/completion', // GET - Profil tamamlanma oranı
    
    // İş ilanları CRUD
    JOBS: '/hospital/jobs', // GET/POST - İş ilanı listesi/oluşturma
    JOB_DETAIL: '/hospital/jobs/:id', // GET/PATCH/DELETE - İş ilanı detayı/güncelleme/silme
    JOB_RESUBMIT: '/hospital/jobs/:id/resubmit', // POST - İş ilanı tekrar gönder (resubmit)
    JOB_APPLICATIONS: '/hospital/jobs/:id/applications', // GET - İş ilanı başvuruları
    
    // Başvuru yönetimi
    APPLICATIONS: '/hospital/applications', // GET - Tüm başvurular
    APPLICATION_DETAIL: '/hospital/applications/:id', // GET/PATCH - Başvuru detayı/durum güncelleme
    APPLICATION_STATUS: '/hospital/applications/:id/status', // PATCH - Başvuru durumu güncelleme
    
    // Dashboard ve istatistikler
    DASHBOARD: '/hospital/dashboard', // GET - Hastane dashboard verileri
    JOB_STATS: '/hospital/job-stats', // GET - İş ilanı istatistikleri
    APPLICATION_STATS: '/hospital/application-stats', // GET - Başvuru istatistikleri
    
    // Doktor profil görüntüleme
    DOCTORS: '/hospital/doctors', // GET - Doktor profilleri listesi
    DOCTOR_DETAIL: '/hospital/doctors/:doctorId', // GET - Doktor profil detayı
    DOCTOR_PROFILES: '/hospital/doctor-profiles', // GET - Doktor profilleri listesi (alias)
    DOCTOR_PROFILE_DETAIL: '/hospital/doctor-profiles/:id', // GET - Doktor profil detayı (alias)
    DOCTOR_SEARCH: '/hospital/doctor-search', // GET - Doktor arama
  },

  // ==================== ADMIN ENDPOINTS (Backend: /api/admin/*) ====================
  /**
   * Admin paneli endpoint'leri: Kullanıcı, ilan, başvuru, bildirim yönetimi
   * Backend adminService.js ve adminController.js ile uyumlu
   */
  ADMIN: {
    // Kullanıcı yönetimi
    USERS: '/admin/users', // GET/POST - Kullanıcı listesi/oluşturma
    USER_DETAIL: '/admin/users/:id', // GET/PATCH/DELETE - Kullanıcı detayı/güncelleme/silme
    USER_DELETE: '/admin/users/:id', // DELETE - Kullanıcı silme
    USER_APPROVAL: '/admin/users/:id/approval', // PATCH - Kullanıcı onay durumu
    USER_STATUS: '/admin/users/:id/status', // PATCH - Kullanıcı aktif/pasif durumu
    
    // İş ilanı yönetimi
    JOBS: '/admin/jobs', // GET/PATCH/DELETE - İş ilanı listesi/güncelleme/silme
    JOB_DETAIL: '/admin/jobs/:id', // GET - İş ilanı detayı
    JOB_STATUS: '/admin/jobs/:id/status', // PATCH - İş ilanı durumu
    JOB_APPROVE: '/admin/jobs/:id/approve', // POST - İş ilanı onayla
    JOB_REVISION: '/admin/jobs/:id/revision', // POST - İş ilanı revizyon talep et
    JOB_REJECT: '/admin/jobs/:id/reject', // POST - İş ilanı reddet
    JOB_HISTORY: '/admin/jobs/:id/history', // GET - İş ilanı statü geçmişi
    JOB_UPDATE: '/admin/jobs/:id', // PUT - İş ilanı güncelleme
    JOB_DELETE: '/admin/jobs/:id', // DELETE - İş ilanı silme
    
    // Başvuru yönetimi
    APPLICATIONS: '/admin/applications', // GET - Tüm başvurular
    APPLICATION_DETAIL: '/admin/applications/:id', // GET - Başvuru detayı
    APPLICATION_STATUS: '/admin/applications/:id/status', // PATCH - Başvuru durumu
    
    // Dashboard ve istatistikler
    DASHBOARD: '/admin/dashboard', // GET - Admin dashboard verileri
    USER_STATS: '/admin/user-stats', // GET - Kullanıcı istatistikleri
    JOB_STATS: '/admin/job-stats', // GET - İş ilanı istatistikleri
    APPLICATION_STATS: '/admin/application-stats', // GET - Başvuru istatistikleri
    SYSTEM_STATS: '/admin/system-stats', // GET - Sistem istatistikleri
    
    // Bildirim yönetimi
    NOTIFICATIONS: '/admin/notifications', // GET - Tüm bildirimler
    NOTIFICATION_DETAIL: '/admin/notifications/:id', // GET - Bildirim detayı
    NOTIFICATION_UPDATE: '/admin/notifications/:id', // PATCH - Bildirim güncelleme
    NOTIFICATION_DELETE: '/admin/notifications/:id', // DELETE - Bildirim silme
    
    // İletişim mesajları
    CONTACT_MESSAGES: '/admin/contact-messages', // GET - İletişim mesajları
    CONTACT_MESSAGE_DETAIL: '/admin/contact-messages/:id', // GET - Mesaj detayı
    CONTACT_MESSAGE_REPLY: '/admin/contact-messages/:id/reply', // POST - Mesaj yanıtla
    CONTACT_MESSAGE_DELETE: '/admin/contact-messages/:id', // DELETE - Mesaj silme
    CONTACT_STATISTICS: '/admin/contact-messages/stats', // GET - İletişim istatistikleri
  },

  // ==================== LOOKUP ENDPOINTS (Backend: /api/lookup/*) ====================
  /**
   * Lookup tabloları endpoint'leri: Şehir, uzmanlık, dil, sertifika türleri vb.
   * Backend lookupService.js ve lookupController.js ile uyumlu
   */
  LOOKUP: {
    SPECIALTIES: '/lookup/specialties', // GET - Uzmanlık alanları
    SUBSPECIALTIES: '/lookup/subspecialties', // GET - Yan dal alanları
    SUBSPECIALTIES_BY_SPECIALTY: '/lookup/subspecialties/:specialtyId', // GET - Branşa göre yan dallar
    CITIES: '/lookup/cities', // GET - Şehirler
    DOCTOR_EDUCATION_TYPES: '/lookup/doctor-education-types', // GET - Doktor eğitim türleri
    LANGUAGE_LEVELS: '/lookup/language-levels', // GET - Dil seviyeleri
    LANGUAGES: '/lookup/languages', // GET - Diller
    CERTIFICATE_TYPES: '/lookup/certificate-types', // GET - Sertifika türleri
    JOB_STATUSES: '/lookup/job-statuses', // GET - İş durumları
    APPLICATION_STATUSES: '/lookup/application-statuses', // GET - Başvuru durumları
    ALL: '/lookup/all', // GET - Tüm lookup verileri
  },

  // ==================== NOTIFICATION ENDPOINTS (Backend: /api/notifications/*) ====================
  /**
   * Bildirim yönetimi endpoint'leri
   * Backend notificationService.js ve notificationController.js ile uyumlu
   */
  NOTIFICATIONS: {
    LIST: '/notifications', // GET - Bildirim listesi
    DETAIL: '/notifications/:id', // GET - Bildirim detayı
    MARK_READ: '/notifications/:id/read', // PATCH - Bildirim okundu işaretle
    MARK_ALL_READ: '/notifications/read-all', // PATCH - Tüm bildirimleri okundu işaretle
    DELETE: '/notifications/:id', // DELETE - Bildirim sil
    SETTINGS: '/notifications/settings', // GET/PATCH - Bildirim ayarları
    UNREAD_COUNT: '/notifications/unread-count', // GET - Okunmamış bildirim sayısı
  },

  // ==================== CONTACT ENDPOINTS (Backend: /api/contact/*) ====================
  /**
   * İletişim mesajları endpoint'leri
   * Backend contactService.js ve contactController.js ile uyumlu
   */
  CONTACT: {
    SEND_MESSAGE: '/contact', // POST - İletişim mesajı gönder (public)
    MESSAGES: '/contact', // POST - İletişim mesajı gönder (public - alias)
  },

  // ==================== SYSTEM ENDPOINTS ====================
  /**
   * Sistem sağlık kontrolü ve istatistik endpoint'leri
   */
  SYSTEM: {
    HEALTH: '/health', // GET - Sistem sağlık kontrolü
    // System endpoints kaldırıldı
    STATS: '/system/stats', // GET - Sistem istatistikleri
  },
};

// ============================================================================
// UTILITY FUNCTIONS - Endpoint ve URL oluşturma yardımcı fonksiyonları
// ============================================================================

/**
 * Endpoint'teki parametreleri değerlerle değiştirir
 * @param {string} endpoint - Parametreli endpoint (örn: '/users/:id')
 * @param {Object} params - Parametre değerleri (örn: { id: 123 })
 * @returns {string} Parametreleri değiştirilmiş endpoint
 * 
 * @example
 * buildEndpoint('/users/:id', { id: 123 }) // '/users/123'
 * buildEndpoint('/jobs/:id/applications/:appId', { id: 456, appId: 789 }) // '/jobs/456/applications/789'
 */
export const buildEndpoint = (endpoint, params = {}) => {
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Endpoint must be a valid string');
  }
  
  let builtEndpoint = endpoint;
  
  // Parametreleri değiştir
  Object.keys(params).forEach(key => {
    const placeholder = `:${key}`;
    const value = params[key];
    
    if (value !== undefined && value !== null) {
      builtEndpoint = builtEndpoint.replace(new RegExp(placeholder, 'g'), encodeURIComponent(value));
    } else {
      throw new Error(`Parameter '${key}' is required but not provided`);
    }
  });
  
  // Kalan parametreleri kontrol et
  const remainingParams = builtEndpoint.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g);
  if (remainingParams && remainingParams.length > 0) {
    throw new Error(`Missing required parameters: ${remainingParams.join(', ')}`);
  }
  
  return builtEndpoint;
};

/**
 * Query parametrelerini URL string'ine dönüştürür
 * @param {Object} params - Query parametreleri
 * @returns {string} Query string (örn: '?page=1&limit=10&search=test')
 * 
 * @example
 * buildQueryString({ page: 1, limit: 10, search: 'test' }) // '?page=1&limit=10&search=test'
 * buildQueryString({}) // ''
 * buildQueryString({ status: 'active', category: null }) // '?status=active'
 */
export const buildQueryString = (params = {}) => {
  if (!params || typeof params !== 'object') {
    return '';
  }
  
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    
    // null, undefined, boş string'leri atla
    if (value !== null && value !== undefined && value !== '') {
      // Array'leri virgülle ayırarak ekle
      if (Array.isArray(value)) {
        if (value.length > 0) {
          queryParams.append(key, value.join(','));
        }
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Tam URL oluşturur (endpoint + query string)
 * @param {string} endpoint - Base endpoint
 * @param {Object} params - Endpoint parametreleri
 * @param {Object} queryParams - Query parametreleri
 * @returns {string} Tam URL
 * 
 * @example
 * buildUrl('/users/:id', { id: 123 }, { page: 1, limit: 10 }) // '/users/123?page=1&limit=10'
 */
export const buildUrl = (endpoint, params = {}, queryParams = {}) => {
  const builtEndpoint = buildEndpoint(endpoint, params);
  const queryString = buildQueryString(queryParams);
  return `${builtEndpoint}${queryString}`;
};

/**
 * API endpoint'ini tam URL'e dönüştürür
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Endpoint parametreleri
 * @param {Object} queryParams - Query parametreleri
 * @returns {string} Tam API URL'i
 * 
 * @example
 * buildApiUrl('/users/:id', { id: 123 }, { page: 1 }) // 'http://localhost:5000/api/users/123?page=1'
 */
export const buildApiUrl = (endpoint, params = {}, queryParams = {}) => {
  const url = buildUrl(endpoint, params, queryParams);
  return `${API_BASE_URL}${url}`;
};

export default ENDPOINTS;
