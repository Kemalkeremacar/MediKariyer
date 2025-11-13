/**
 * @file index.jsx
 * @description Routes Configuration - Uygulama route tanımları ve yönetimi
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm route'ları tek bir yerde toplar
 * ve yönetir. React Router ile route yapısını tanımlar ve güvenlik middleware'leri
 * ile korumalı route'lar oluşturur.
 * 
 * Ana Özellikler:
 * - Merkezi route yönetimi: Tüm route'lar tek dosyada tanımlanır
 * - Güvenlik katmanları: AuthGuard, RoleGuard, ApprovalGuard ile korumalı route'lar
 * - Layout yönetimi: MainLayout ile tüm sayfalar için ortak layout
 * - Error handling: ErrorBoundary ile hata yakalama
 * - Lazy loading: Sayfa component'leri lazy load edilebilir (gelecekte)
 * - Route kategorileri: Public, Auth, Admin, Doctor, Hospital, Shared route'ları
 * 
 * Güvenlik Katmanları (Sıralama):
 * 1. ErrorBoundary: Component hatalarını yakalar (en dışta)
 * 2. AuthGuard: Kimlik doğrulama ve hesap durumu kontrolü
 * 3. RoleGuard: Rol bazlı erişim kontrolü
 * 4. ApprovalGuard: Admin onay durumu kontrolü (en içte)
 * 
 * Route Yapısı:
 * - Public Routes: Herkese açık sayfalar (Home, About, Contact)
 * - Auth Routes: Kimlik doğrulama sayfaları (Login, Register, Pending Approval)
 * - Admin Routes: Admin paneli sayfaları (Dashboard, Users, Jobs, Applications vb.)
 * - Doctor Routes: Doktor paneli sayfaları (Dashboard, Profile, Jobs, Applications vb.)
 * - Hospital Routes: Hastane paneli sayfaları (Dashboard, Profile, Jobs, Applications vb.)
 * - Shared Routes: Tüm kullanıcılar için ortak sayfalar (Notifications)
 * - Error Routes: Hata sayfaları (404 Not Found)
 * 
 * Backend Uyumluluk:
 * - Backend authMiddleware.js ile aynı mantık (AuthGuard)
 * - Backend roleGuard.js ile aynı mantık (RoleGuard)
 * - Backend authMiddleware.js onay kontrolü ile aynı (ApprovalGuard)
 * 
 * Guard Kullanım Mantığı:
 * - Public routes: Guard yok, herkes erişebilir
 * - Auth routes: GuestGuard (sadece misafir kullanıcılar)
 * - Protected routes: AuthGuard + RoleGuard + ApprovalGuard
 * - Admin routes: AuthGuard + RoleGuard (admin için ApprovalGuard yok)
 * 
 * Layout Yapısı:
 * - Tüm route'lar MainLayout içinde render edilir
 * - MainLayout Header, Footer ve ana içerik alanını sağlar
 * - Her sayfa kendi içeriğini MainLayout içinde gösterir
 * 
 * Kullanım:
 * ```jsx
 * import AppRoutes from '@/routes';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <AppRoutes />
 *     </BrowserRouter>
 *   );
 * }
 * ```
 * 
 * Route Parametreleri:
 * - :jobId: İş ilanı ID'si
 * - :applicationId: Başvuru ID'si
 * - :id: Genel ID parametresi (user, job, application için)
 * 
 * Not: Route tanımları @config/routes.js dosyasındaki ROUTE_CONFIG ile
 * eşleşmelidir. Route değişikliklerinde her iki dosya da güncellenmelidir.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/ui/LoadingSpinner';

// ============================================================================
// IMPORTS - Component ve middleware import'ları
// ============================================================================

/**
 * ============================================================================
 * LAYOUT VE MİDDLEWARE COMPONENTS - Layout ve güvenlik bileşenleri
 * ============================================================================
 */

/**
 * Ana layout bileşeni
 * Tüm sayfalar bu layout içinde render edilir
 */
import MainLayout from '@/components/layout/MainLayout';

/**
 * Error Boundary bileşeni
 * Component hatalarını yakalar ve fallback UI gösterir
 */
import ErrorBoundary from '@/middleware/ErrorBoundary';

/**
 * Güvenlik middleware bileşenleri
 * - AuthGuard: Kimlik doğrulama ve hesap durumu kontrolü
 * - GuestGuard: Misafir kullanıcılar için guard (login/register sayfaları)
 * - RoleGuard: Rol bazlı erişim kontrolü
 * - ApprovalGuard: Admin onay durumu kontrolü
 */
import AuthGuard, { GuestGuard } from '@/middleware/AuthGuard';
import RoleGuard from '@/middleware/RoleGuard';
import ApprovalGuard from '@/middleware/ApprovalGuard';

/**
 * ============================================================================
 * PUBLIC PAGES - Herkese açık sayfalar
 * ============================================================================
 * 
 * Bu sayfalar herhangi bir kimlik doğrulama veya yetkilendirme gerektirmez
 * Tüm kullanıcılar (authenticate olanlar ve misafirler) erişebilir
 */
import HomePage from '../features/public/pages/HomePage';
import AboutPage from '../features/public/pages/AboutPage';
import ContactPage from '../features/public/pages/ContactPage';
import NotFound from '@/features/public/pages/NotFound';


/**
 * ============================================================================
 * AUTH PAGES - Kimlik doğrulama sayfaları
 * ============================================================================
 * 
 * Bu sayfalar kimlik doğrulama işlemleri için kullanılır
 * GuestGuard ile korunur (sadece misafir kullanıcılar erişebilir)
 * Authenticate kullanıcılar dashboard'a yönlendirilir
 */
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import PendingApprovalPage from '@/features/auth/pages/PendingApprovalPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

/**
 * ============================================================================
 * ADMIN PAGES - Admin paneli sayfaları (Lazy Loaded)
 * ============================================================================
 * 
 * Bu sayfalar admin rolüne sahip kullanıcılar için tanımlanmıştır
 * AuthGuard + RoleGuard ile korunur (ApprovalGuard yok, admin için gerekmez)
 * Lazy loading ile performans optimizasyonu
 */
const AdminDashboard = lazy(() => import('@/features/admin/pages/DashboardPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/UsersPage'));
const AdminHospitalsPage = lazy(() => import('@/features/admin/pages/HospitalsPage'));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/UserDetailPage'));
const AdminJobsPage = lazy(() => import('@/features/admin/pages/JobsPage'));
const AdminJobDetailPage = lazy(() => import('@/features/admin/pages/JobDetailPage'));
const AdminApplicationsPage = lazy(() => import('@/features/admin/pages/ApplicationsPage'));
const AdminApplicationDetailPage = lazy(() => import('@/features/admin/pages/ApplicationDetailPage'));
const AdminNotificationsPage = lazy(() => import('@/features/admin/pages/AdminNotificationsPage'));
const NotificationSendPage = lazy(() => import('@/features/admin/pages/NotificationSendPage'));
const AdminContactMessagesPage = lazy(() => import('@/features/admin/pages/ContactMessagesPage'));
const PhotoApprovalsPage = lazy(() => import('@/features/admin/pages/PhotoApprovalsPage'));
const AdminLogsPage = lazy(() => import('@/features/admin/pages/LogsPage'));
const AdminLogDetailPage = lazy(() => import('@/features/admin/pages/LogDetailPage'));

/**
 * ============================================================================
 * DOCTOR PAGES - Doktor paneli sayfaları (Lazy Loaded)
 * ============================================================================
 * 
 * Bu sayfalar doctor rolüne sahip kullanıcılar için tanımlanmıştır
 * AuthGuard + RoleGuard + ApprovalGuard ile korunur
 * Kullanıcının authenticate, doctor rolünde ve onaylı olması gerekir
 * Lazy loading ile performans optimizasyonu
 */
const DoctorDashboard = lazy(() => import('@/features/doctor/pages/DashboardPage'));
const DoctorProfile = lazy(() => import('@/features/doctor/pages/ProfilePage'));
const DoctorJobsPage = lazy(() => import('@/features/doctor/pages/JobsPage'));
const DoctorJobDetailPage = lazy(() => import('@/features/doctor/pages/JobDetailPage'));
const DoctorApplicationsPage = lazy(() => import('@/features/doctor/pages/ApplicationsPage'));
const DoctorApplicationDetailPage = lazy(() => import('@/features/doctor/pages/ApplicationDetailPage'));
const PhotoManagementPage = lazy(() => import('@/features/doctor/pages/PhotoManagementPage'));
const DoctorSettingsPage = lazy(() => import('@/features/doctor/pages/SettingsPage'));
const DoctorNotificationsPage = lazy(() => import('@/features/doctor/pages/NotificationsPage'));

/**
 * ============================================================================
 * HOSPITAL PAGES - Hastane paneli sayfaları (Lazy Loaded)
 * ============================================================================
 * 
 * Bu sayfalar hospital rolüne sahip kullanıcılar için tanımlanmıştır
 * AuthGuard + RoleGuard + ApprovalGuard ile korunur
 * Kullanıcının authenticate, hospital rolünde ve onaylı olması gerekir
 * Lazy loading ile performans optimizasyonu
 */
const HospitalDashboard = lazy(() => import('@/features/hospital/pages/DashboardPage'));
const HospitalProfile = lazy(() => import('@/features/hospital/pages/ProfilePage'));
const HospitalJobs = lazy(() => import('@/features/hospital/pages/JobsPage'));
const HospitalJobCreate = lazy(() => import('@/features/hospital/pages/JobCreatePage'));
const HospitalJobDetail = lazy(() => import('@/features/hospital/pages/JobDetailPage'));
const HospitalJobEdit = lazy(() => import('@/features/hospital/pages/JobEditPage'));
const HospitalApplications = lazy(() => import('@/features/hospital/pages/ApplicationsPage'));
const HospitalApplicationDetail = lazy(() => import('@/features/hospital/pages/ApplicationDetailPage'));
const HospitalDoctors = lazy(() => import('@/features/hospital/pages/DoctorsPage'));
const HospitalNotificationsPage = lazy(() => import('@/features/hospital/pages/NotificationsPage'));
const HospitalSettingsPage = lazy(() => import('@/features/hospital/pages/SettingsPage'));

/**
 * ============================================================================
 * SHARED PAGES - Ortak kullanılan sayfalar (Lazy Loaded)
 * ============================================================================
 * 
 * Bu sayfalar tüm authenticate ve onaylı kullanıcılar için ortaktır
 * AuthGuard + ApprovalGuard ile korunur (RoleGuard yok, tüm roller erişebilir)
 * Lazy loading ile performans optimizasyonu
 */
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));

// ============================================================================
// ANA ROUTE YAPISI - Uygulama route tanımları
// ============================================================================

/**
 * ============================================================================
 * APP ROUTES COMPONENT - Ana route yapısı
 * ============================================================================
 * 
 * Uygulamanın tüm route'larını tanımlayan ana component
 * React Router'ın Routes ve Route component'lerini kullanarak
 * route yapısını oluşturur
 * 
 * Yapı:
 * - En dışta ErrorBoundary (tüm route'lar için hata yakalama)
 * - Routes içinde MainLayout (tüm sayfalar için ortak layout)
 * - Route kategorilerine göre organize edilmiş route'lar
 * - Her protected route için güvenlik middleware'leri
 * 
 * Dönüş:
 * @returns {JSX.Element} Route yapısını içeren React component
 * 
 * Not: Route'lar React Router'ın Route component'i ile tanımlanır.
 * Nested route'lar (children) desteklenir.
 */
const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* 
          ======================================================================
          ANA LAYOUT - Tüm sayfalar bu layout içinde render edilir
          ======================================================================
          
          MainLayout tüm route'lar için ortak layout sağlar:
          - Header (üst navigasyon)
          - Footer (alt bilgi)
          - Ana içerik alanı (children)
        */}
        <Route path="/" element={<MainLayout />}>
          
          {/* 
            ====================================================================
            PUBLIC ROUTES - Herkese açık sayfalar
            ====================================================================
            
            Bu route'lar herhangi bir kimlik doğrulama gerektirmez
            Tüm kullanıcılar (authenticate olanlar ve misafirler) erişebilir
            Guard kullanılmaz
          */}
          
          {/* Ana sayfa - Index route (/ path'inde gösterilir) */}
          <Route index element={<HomePage />} />
          
          {/* Hakkımızda sayfası - /about */}
          <Route path="about" element={<AboutPage />} />
          
          {/* İletişim sayfası - /contact */}
          <Route path="contact" element={<ContactPage />} />

          {/* 
            ====================================================================
            AUTH ROUTES - Kimlik doğrulama sayfaları (misafir kullanıcılar için)
            ====================================================================
            
            Bu route'lar sadece misafir kullanıcılar (authenticate olmayanlar) için
            GuestGuard ile korunur. Authenticate kullanıcılar dashboard'a yönlendirilir
          */}
          
          {/* 
            Giriş sayfası - /login
            GuestGuard: Sadece misafir kullanıcılar erişebilir
            Authenticate kullanıcılar dashboard'a yönlendirilir
          */}
          <Route
            path="login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />
          
          {/* 
            Kayıt sayfası - /register
            GuestGuard: Sadece misafir kullanıcılar erişebilir
            Authenticate kullanıcılar dashboard'a yönlendirilir
          */}
          <Route
            path="register"
            element={
              <GuestGuard>
                <RegisterPage />
              </GuestGuard>
            }
          />

          {/* 
            Şifre sıfırlama isteği sayfası - /forgot-password
            GuestGuard: Sadece misafir kullanıcılar erişebilir
          */}
          <Route
            path="forgot-password"
            element={
              <GuestGuard>
                <ForgotPasswordPage />
              </GuestGuard>
            }
          />

          <Route
            path="reset-password"
            element={
              <GuestGuard>
                <ResetPasswordPage />
              </GuestGuard>
            }
          />
          
          {/* 
            Onay bekleme sayfası - /pending-approval
            AuthGuard: Authenticate kullanıcılar için
            Onay bekleyen kullanıcılar için bilgilendirme sayfası
          */}
          <Route
            path="pending-approval"
            element={
              <AuthGuard>
                <PendingApprovalPage />
              </AuthGuard>
            }
          />

          {/* 
            ====================================================================
            DOCTOR ROUTES - Doktor paneli sayfaları
            ====================================================================
            
            Bu route'lar doctor rolüne sahip ve onaylı kullanıcılar için tanımlanmıştır
            Guard sırası: ErrorBoundary → AuthGuard → RoleGuard → ApprovalGuard
            
            Her route için:
            - AuthGuard: Kimlik doğrulama ve hesap durumu kontrolü
            - RoleGuard: Doctor rolü kontrolü
            - ApprovalGuard: Admin onay durumu kontrolü
          */}
          
          {/* 
            Doktor Dashboard - /doctor
            Ana sayfa: Son başvurular, önerilen iş ilanları
          */}
          <Route
            path="doctor"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorDashboard />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Doktor Profil Sayfası - /doctor/profile
            Kişisel bilgiler, eğitim, deneyim, sertifika, dil yönetimi
          */}
          <Route
            path="doctor/profile"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorProfile />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          <Route
            path="doctor/settings"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorSettingsPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Doktor İş İlanları Sayfası - /doctor/jobs
            Aktif iş ilanlarını listeler, filtreleme ve arama yapılabilir
          */}
          <Route
            path="doctor/jobs"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorJobsPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Doktor İş İlanı Detay Sayfası - /doctor/jobs/:jobId
            İş ilanının detaylı bilgilerini gösterir, başvuru yapılabilir
            Parametre: jobId (route parametresi)
          */}
          <Route
            path="doctor/jobs/:jobId"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorJobDetailPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Doktor Başvurular Sayfası - /doctor/applications
            Doktorun yaptığı tüm başvuruları listeler, filtreleme yapılabilir
          */}
          <Route
            path="doctor/applications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorApplicationsPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Doktor Başvuru Detay Sayfası - /doctor/applications/:applicationId
            Başvurunun detaylı bilgilerini gösterir, geri çekme yapılabilir
            Parametre: applicationId (route parametresi)
          */}
          <Route
            path="doctor/applications/:applicationId"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorApplicationDetailPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Doktor Fotoğraf Yönetimi Sayfası - /doctor/photo-management
            Profil fotoğrafı değiştirme talepleri ve onay bekleyen fotoğraflar
          */}
          <Route
            path="doctor/photo-management"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <PhotoManagementPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Doktor Bildirimler Sayfası - /doctor/notifications
            Doktorun tüm bildirimlerini görüntüleme ve yönetme
          */}
          <Route
            path="doctor/notifications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['doctor']}>
                    <ApprovalGuard>
                      <DoctorNotificationsPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            ====================================================================
            HOSPITAL ROUTES - Hastane paneli sayfaları
            ====================================================================
            
            Bu route'lar hospital rolüne sahip ve onaylı kullanıcılar için tanımlanmıştır
            Guard sırası: ErrorBoundary → AuthGuard → RoleGuard → ApprovalGuard
            
            Her route için:
            - AuthGuard: Kimlik doğrulama ve hesap durumu kontrolü
            - RoleGuard: Hospital rolü kontrolü
            - ApprovalGuard: Admin onay durumu kontrolü
          */}
          
          {/* 
            Hastane Dashboard - /hospital
            Ana sayfa: İstatistikler, son başvurular, aktif iş ilanları
          */}
          <Route
            path="hospital"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalDashboard />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Hastane Profil Sayfası - /hospital/profile
            Kurum bilgileri, iletişim bilgileri yönetimi
          */}
          <Route
            path="hospital/profile"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalProfile />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Hastane İş İlanları Sayfası - /hospital/jobs
            Hastanenin oluşturduğu tüm iş ilanlarını listeler
          */}
          <Route
            path="hospital/jobs"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalJobs />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Hastane Yeni İş İlanı Sayfası - /hospital/jobs/new
            Yeni iş ilanı oluşturma formu
          */}
          <Route
            path="hospital/jobs/new"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalJobCreate />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Hastane İş İlanı Detay Sayfası - /hospital/jobs/:jobId
            İş ilanının detaylı bilgilerini gösterir, düzenleme yapılabilir
            Parametre: jobId (route parametresi)
          */}
          <Route
            path="hospital/jobs/:jobId"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalJobDetail />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Hastane İş İlanı Düzenleme Sayfası - /hospital/jobs/:jobId/edit
            Mevcut iş ilanını düzenleme formu
            Parametre: jobId (route parametresi)
          */}
          <Route
            path="hospital/jobs/:jobId/edit"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalJobEdit />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Hastane Başvurular Sayfası - /hospital/applications
            Hastanenin iş ilanlarına yapılan başvuruları listeler
          */}
          <Route
            path="hospital/applications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalApplications />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            Hastane Başvuru Detay Sayfası - /hospital/applications/:applicationId
            Başvuru detaylarını gösterir, durum yönetimi yapılabilir
          */}
          <Route
            path="hospital/applications/:applicationId"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalApplicationDetail />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          <Route
            path="hospital/notifications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalNotificationsPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          <Route
            path="hospital/settings"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalSettingsPage />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            ====================================================================
            SHARED ROUTES - Ortak kullanılan sayfalar
            ====================================================================
            
            Bu route'lar tüm authenticate ve onaylı kullanıcılar için ortaktır
            Guard sırası: ErrorBoundary → AuthGuard → ApprovalGuard
            RoleGuard yok: Tüm roller (admin, doctor, hospital) erişebilir
          */}
          
          {/* 
            Bildirimler Sayfası - /notifications
            Tüm kullanıcılar için bildirim görüntüleme ve yönetimi
            Guard: AuthGuard + ApprovalGuard (RoleGuard yok, tüm roller erişebilir)
          */}
          <Route
            path="notifications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <ApprovalGuard>
                    <NotificationsPage />
                  </ApprovalGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            ====================================================================
            ADMIN ROUTES - Admin paneli sayfaları
            ====================================================================
            
            Bu route'lar sadece admin rolüne sahip kullanıcılar için tanımlanmıştır
            Guard sırası: ErrorBoundary → AuthGuard → RoleGuard
            ApprovalGuard yok: Admin için onay kontrolü yapılmaz (admin otomatik onaylı)
            
            Not: Admin route'larında ApprovalGuard kullanılmaz çünkü admin rolü
            için onay kontrolü gereksizdir (backend ile aynı mantık).
          */}
          
          {/* 
            Admin Dashboard - /admin
            Ana sayfa: Sistem istatistikleri, genel bakış
          */}
          <Route
            path="admin"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Doktor Yönetimi Sayfası - /admin/users
            Sadece doktorları listeler, filtreleme ve arama yapılabilir
          */}
          <Route
            path="admin/users"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Hastane Yönetimi Sayfası - /admin/hospitals
            Sadece hastaneleri listeler, filtreleme ve arama yapılabilir
          */}
          <Route
            path="admin/hospitals"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminHospitalsPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Kullanıcı Detay Sayfası - /admin/users/:id
            Kullanıcının detaylı bilgilerini gösterir, onay/aktiflik durumu değiştirilebilir
            Parametre: id (route parametresi - kullanıcı ID'si)
          */}
          <Route
            path="admin/users/:id"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminUserDetailPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin İş İlanı Yönetimi Sayfası - /admin/jobs
            Tüm iş ilanlarını listeler, filtreleme ve arama yapılabilir
          */}
          <Route
            path="admin/jobs"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminJobsPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin İş İlanı Detay Sayfası - /admin/jobs/:id
            İş ilanının detaylı bilgilerini gösterir, durum değiştirilebilir
            Parametre: id (route parametresi - iş ilanı ID'si)
          */}
          <Route
            path="admin/jobs/:id"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminJobDetailPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Başvuru Yönetimi Sayfası - /admin/applications
            Tüm başvuruları listeler, filtreleme ve arama yapılabilir
          */}
          <Route
            path="admin/applications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminApplicationsPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Başvuru Detay Sayfası - /admin/applications/:id
            Başvurunun detaylı bilgilerini gösterir, durum değiştirilebilir
            Parametre: id (route parametresi - başvuru ID'si)
          */}
          <Route
            path="admin/applications/:id"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminApplicationDetailPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Bildirim Yönetimi Sayfası - /admin/notifications
            Sistem genelinde tüm bildirimleri yönetir
          */}
          <Route
            path="admin/notifications"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminNotificationsPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Bildirim Gönderme Sayfası - /admin/notifications/send
            Kullanıcılara toplu bildirim gönderme
          */}
          <Route
            path="admin/notifications/send"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <NotificationSendPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin İletişim Mesajları Sayfası - /admin/contact-messages
            Kullanıcılardan gelen iletişim mesajlarını yönetir
          */}
          <Route
            path="admin/contact-messages"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminContactMessagesPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Fotoğraf Onayları Sayfası - /admin/photo-approvals
            Doktorların gönderdiği profil fotoğrafı değiştirme taleplerini yönetir
          */}
          <Route
            path="admin/photo-approvals"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <PhotoApprovalsPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Log Görüntüleme Sayfası - /admin/logs
            Sistem log'larını görüntüler, filtreleme yapılabilir
          */}
          <Route
            path="admin/logs"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminLogsPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />
          
          {/* 
            Admin Log Detay Sayfası - /admin/logs/:type/:id
            Log detaylarını görüntüler
            Parametre: type (application, audit, security), id (log ID)
          */}
          <Route
            path="admin/logs/:type/:id"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminLogDetailPage />
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* 
            ====================================================================
            ERROR ROUTES - Hata sayfaları
            ====================================================================
            
            Tanımlı olmayan route'lar için fallback sayfa
            Herhangi bir guard kullanılmaz, tüm kullanıcılar görebilir
          */}
          
          {/* 
            404 Not Found Sayfası - * (wildcard route)
            Tanımlı olmayan tüm route'lar için gösterilir
            Guard yok: Tüm kullanıcılar görebilir
          */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};


export default AppRoutes;
