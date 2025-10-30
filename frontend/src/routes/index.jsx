/**
 * Ana Route Dosyası - MediKariyer Uygulaması
 * 
 * Bu dosya tüm uygulama rotalarını tek bir yerde toplar ve yönetir.
 * Backend authMiddleware/roleGuard yapısı ile tam uyumlu çalışır.
 * 
 * Güvenlik Katmanları:
 * - AuthGuard: JWT token doğrulaması
 * - RoleGuard: Rol bazlı erişim kontrolü (admin, doctor, hospital)
 * - ApprovalGuard: Admin onay durumu kontrolü
 * 
 * Route Yapısı:
 * - Public Routes: Herkesin erişebileceği sayfalar
 * - Auth Routes: Giriş/kayıt sayfaları (misafir kullanıcılar için)
 * - Admin Routes: Admin paneli sayfaları
 * - Doctor Routes: Doktor paneli sayfaları
 * - Hospital Routes: Hastane paneli sayfaları
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// LAYOUT VE MİDDLEWARE COMPONENTS
// ============================================================================

// Ana layout bileşeni
import MainLayout from '@/components/layout/MainLayout';
import ErrorBoundary from '@/middleware/ErrorBoundary';

// Güvenlik middleware bileşenleri
import AuthGuard, { GuestGuard } from '@/middleware/AuthGuard';
import RoleGuard from '@/middleware/RoleGuard';
import ApprovalGuard from '@/middleware/ApprovalGuard';

// ============================================================================
// PUBLIC PAGES - Herkese açık sayfalar
// ============================================================================

import HomePage from '../features/public/pages/HomePage';
import AboutPage from '../features/public/pages/AboutPage';
import ContactPage from '../features/public/pages/ContactPage';
import NotFound from '@/features/public/pages/NotFound';


// ============================================================================
// AUTH PAGES - Kimlik doğrulama sayfaları (Lazy loaded)
// ============================================================================

import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import PendingApprovalPage from '@/features/auth/pages/PendingApprovalPage';

// ============================================================================
// ADMIN PAGES - Admin paneli sayfaları (Lazy loaded)
// ============================================================================

import AdminDashboard from '@/features/admin/pages/DashboardPage';
import AdminUsersPage from '@/features/admin/pages/UsersPage';
import AdminUserDetailPage from '@/features/admin/pages/UserDetailPage';
import AdminJobsPage from '@/features/admin/pages/JobsPage';
import AdminJobDetailPage from '@/features/admin/pages/JobDetailPage';
import AdminApplicationsPage from '@/features/admin/pages/ApplicationsPage';
import AdminApplicationDetailPage from '@/features/admin/pages/ApplicationDetailPage';
import AdminNotificationsPage from '@/features/admin/pages/AdminNotificationsPage';
import AdminContactMessagesPage from '@/features/admin/pages/ContactMessagesPage';
import PhotoApprovalsPage from '@/features/admin/pages/PhotoApprovalsPage';
import AdminLogsPage from '@/features/admin/pages/LogsPage';

// ============================================================================
// DOCTOR PAGES - Doktor paneli sayfaları (Lazy loaded)
// ============================================================================

import DoctorDashboard from '@/features/doctor/pages/DashboardPage';
import DoctorProfile from '@/features/doctor/pages/ProfilePage';
import DoctorJobsPage from '@/features/doctor/pages/JobsPage';
import DoctorApplicationsPage from '@/features/doctor/pages/ApplicationsPage';
import PhotoManagementPage from '@/features/doctor/pages/PhotoManagementPage';

// ============================================================================
// HOSPITAL PAGES - Hastane paneli sayfaları
// ============================================================================

import HospitalDashboard from '@/features/hospital/pages/DashboardPage';
import HospitalProfile from '@/features/hospital/pages/ProfilePage';
import HospitalJobs from '@/features/hospital/pages/JobsPage';
import HospitalJobCreate from '@/features/hospital/pages/JobCreatePage';
import HospitalJobDetail from '@/features/hospital/pages/JobDetailPage';
import HospitalJobEdit from '@/features/hospital/pages/JobEditPage';
import HospitalApplications from '@/features/hospital/pages/ApplicationsPage';
import HospitalDoctors from '@/features/hospital/pages/DoctorsPage';
import HospitalDepartments from '@/features/hospital/pages/DepartmentsPage';
import HospitalContacts from '@/features/hospital/pages/ContactsPage';

// ============================================================================
// SHARED PAGES - Ortak kullanılan sayfalar
// ============================================================================

import NotificationsPage from '@/features/notifications/pages/NotificationsPage';


// ============================================================================
// HELPER FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

// Not: SmartHomeRedirect ve RoleBasedRedirect fonksiyonları kaldırıldı
// Çünkü hiçbir yerde kullanılmıyordu ve gereksizdi.

// ============================================================================
// ANA ROUTE YAPISI
// ============================================================================

/**
 * Uygulama Route Yapısı
 * Tüm rotaları ve güvenlik katmanlarını tanımlar
 */
const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Ana Layout - Tüm sayfalar bu layout içinde render edilir */}
        <Route path="/" element={<MainLayout />}>
          
          {/* ================================================================ */}
          {/* PUBLIC ROUTES - Herkese açık sayfalar */}
          {/* ================================================================ */}
          
          {/* Ana sayfa */}
          <Route index element={<HomePage />} />
          
          {/* Hakkımızda */}
          <Route path="about" element={<AboutPage />} />
          
          {/* İletişim */}
          <Route path="contact" element={<ContactPage />} />

          {/* ================================================================ */}
          {/* AUTH ROUTES - Kimlik doğrulama sayfaları (misafir kullanıcılar için) */}
          {/* ================================================================ */}
          
          {/* Giriş */}
          <Route
            path="login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />
          
          {/* Kayıt */}
          <Route
            path="register"
            element={
              <GuestGuard>
                <RegisterPage />
              </GuestGuard>
            }
          />
          
          
          {/* Onay bekleme */}
          <Route
            path="pending-approval"
            element={
              <AuthGuard>
                <PendingApprovalPage />
              </AuthGuard>
            }
          />

          {/* ================================================================ */}
          {/* DOCTOR ROUTES - Doktor paneli sayfaları */}
          {/* ================================================================ */}
          
          {/* Doktor Dashboard */}
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
          
          {/* Doktor Profil */}
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
          
          {/* Doktor İş İlanları */}
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
          
          {/* Doktor Başvurular */}
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

          {/* Doktor Fotoğraf Yönetimi */}
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

          {/* ================================================================ */}
          {/* HOSPITAL ROUTES - Hastane paneli sayfaları */}
          {/* ================================================================ */}
          
          {/* Hastane Dashboard */}
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
          
          {/* Hastane Profil */}
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

          {/* Hastane İş İlanları */}
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

          {/* Hastane Yeni İş İlanı */}
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

          {/* Hastane İş İlanı Detayı */}
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

          {/* Hastane İş İlanı Düzenleme */}
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

          {/* Hastane Başvurular */}
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

          {/* Hastane Doktor Profilleri */}
          <Route
            path="hospital/doctors"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalDoctors />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* Hastane Departmanlar */}
          <Route
            path="hospital/departments"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalDepartments />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* Hastane İletişim Bilgileri */}
          <Route
            path="hospital/contacts"
            element={
              <ErrorBoundary>
                <AuthGuard>
                  <RoleGuard allowedRoles={['hospital']}>
                    <ApprovalGuard>
                      <HospitalContacts />
                    </ApprovalGuard>
                  </RoleGuard>
                </AuthGuard>
              </ErrorBoundary>
            }
          />

          {/* ================================================================ */}
          {/* SHARED ROUTES - Ortak kullanılan sayfalar */}
          {/* ================================================================ */}
          
          {/* Bildirimler (tüm kullanıcılar için) */}
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

          {/* ================================================================ */}
          {/* ADMIN ROUTES - Admin paneli sayfaları */}
          {/* ================================================================ */}
          
          {/* Admin Dashboard */}
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
          
          {/* Admin Kullanıcı Yönetimi */}
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
          
          {/* Admin İş İlanı Yönetimi */}
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
          
          {/* Admin Başvuru Yönetimi */}
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
          
          {/* Admin Bildirim Yönetimi */}
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
          
          {/* Admin İletişim Mesajları */}
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
          
          {/* Admin Fotoğraf Onayları */}
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
          
          {/* Admin Log Görüntüleme */}
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

          {/* ================================================================ */}
          {/* ERROR ROUTES - Hata sayfaları */}
          {/* ================================================================ */}
          
          {/* 404 - Sayfa bulunamadı */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};


export default AppRoutes;
