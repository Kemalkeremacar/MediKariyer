/**
 * @file routes.js
 * @description Route Configuration - Uygulama route tanımları
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm route path'lerini merkezi olarak tanımlar.
 * Route'lar rol bazında organize edilmiştir ve React Router ile kullanılır.
 * 
 * Ana Özellikler:
 * - Rol bazlı route organizasyonu: Public, Admin, Doctor, Hospital, Shared
 * - Merkezi yönetim: Tüm route'lar tek yerden yönetilir
 * - Type safety: Sabit string değerleri ile tip güvenliği
 * - Backend uyumluluk: Backend route'larla uyumlu path yapısı
 * - Parametreli route'lar: Dinamik parametreler (örn: :id, :jobId)
 * 
 * Route Kategorileri:
 * 1. PUBLIC: Ziyaretçiler için genel sayfalar
 * 2. ADMIN: Yönetici paneli sayfaları
 * 3. DOCTOR: Doktor paneli sayfaları
 * 4. HOSPITAL: Hastane paneli sayfaları
 * 5. SHARED: Tüm roller için ortak sayfalar
 * 
 * Kullanım:
 * ```jsx
 * import { ROUTE_CONFIG } from '@config/routes';
 * 
 * <Link to={ROUTE_CONFIG.DOCTOR.DASHBOARD}>Ana Sayfa</Link>
 * <Navigate to={ROUTE_CONFIG.HOSPITAL.JOBS} />
 * ```
 * 
 * Not: Route tanımları src/routes/index.jsx dosyasındaki gerçek route yapısıyla
 * eşleşmelidir. Route değişikliklerinde hem bu dosya hem de routes/index.jsx
 * güncellenmelidir.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

// ============================================================================
// PUBLIC ROUTES - Ziyaretçiler için genel sayfalar
// ============================================================================
export const ROUTE_CONFIG = {
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
    LOGIN: '/login',
    REGISTER: '/register',
    PENDING_APPROVAL: '/pending-approval',
  },
  
  // ============================================================================
  // ADMIN ROUTES - Yönetici paneli sayfaları
  // ============================================================================
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    JOBS: '/admin/jobs',
    JOB_DETAIL: '/admin/jobs/:id',
    APPLICATIONS: '/admin/applications',
    APPLICATION_DETAIL: '/admin/applications/:id',
    NOTIFICATIONS: '/admin/notifications',
    CONTACT_MESSAGES: '/admin/contact-messages',
    PHOTO_APPROVALS: '/admin/photo-approvals',
  },
  
  // ============================================================================
  // DOCTOR ROUTES - Doktor paneli sayfaları
  // ============================================================================
  DOCTOR: {
    DASHBOARD: '/doctor',
    PROFILE: '/doctor/profile',
    JOBS: '/doctor/jobs',
    JOB_DETAIL: '/doctor/jobs/:jobId',
    APPLICATIONS: '/doctor/applications',
    APPLICATION_DETAIL: '/doctor/applications/:applicationId',
  },
  
  // ============================================================================
  // HOSPITAL ROUTES - Hastane paneli sayfaları
  // ============================================================================
  HOSPITAL: {
    DASHBOARD: '/hospital',
    PROFILE: '/hospital/profile',
    JOBS: '/hospital/jobs',
    JOB_CREATE: '/hospital/jobs/new',
    APPLICATIONS: '/hospital/applications',
    DOCTORS: '/hospital/doctors',
    DEPARTMENTS: '/hospital/departments',
    CONTACTS: '/hospital/contacts',
  },
  
  // ============================================================================
  // SHARED ROUTES - Tüm roller için ortak sayfalar
  // ============================================================================
  SHARED: {
    NOTIFICATIONS: '/notifications',
  },
};
