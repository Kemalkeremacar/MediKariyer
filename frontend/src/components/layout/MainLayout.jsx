/**
 * @file MainLayout.jsx
 * @description Ana Layout Bileşeni - Uygulama geneli layout yönetimi
 * 
 * Bu bileşen, uygulama genelinde kullanılan ana layout yapısını sağlar.
 * Rol bazlı layout farklılıklarını yönetir ve sayfa tipine göre uygun
 * layout'u render eder.
 * 
 * Ana Özellikler:
 * - Rol bazlı layout: Admin, Doktor, Hastane, Public için farklı layoutlar
 * - Sayfa tipi kontrolü: Route path'e göre layout belirleme
 * - Header yönetimi: Tüm sayfalarda header gösterimi
 * - Footer yönetimi: Sadece belirli sayfalarda footer gösterimi
 * - Sidebar yönetimi: Admin sayfalarında sidebar gösterimi
 * - Gradient arka planlar: Sayfa tipine göre farklı gradient'ler
 * - Responsive: Mobil ve desktop uyumlu
 * 
 * Layout Tipleri:
 * 1. Admin Layout: Sidebar + Header + Content (Footer yok)
 * 2. Doctor Layout: Header + Content (Footer yok)
 * 3. Hospital Layout: Header + Content (Footer yok)
 * 4. Home Layout: Header + Content + Footer
 * 5. Auth Layout: Header + Content (Footer yok)
 * 6. Public Layout: Header + Content + Footer
 * 
 * Arka Plan Renk Şemaları:
 * - Admin: Açık gradient (slate-50, blue-50, indigo-100)
 * - Doctor/Hospital: Koyu gradient (slate-900, blue-900, indigo-900)
 * - Home/Public: Açık gradient (white, gray-50, blue-50)
 * - Auth: Koyu gradient (blue-900, indigo-900, blue-800)
 * 
 * Kullanım:
 * React Router'ın Outlet bileşeni ile sayfa içeriği render edilir.
 * Layout, route path ve kullanıcı rolüne göre otomatik olarak belirlenir.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '@/store/authStore';

/**
 * ============================================================================
 * MAIN LAYOUT COMPONENT
 * ============================================================================
 */
const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Ana sayfa için özel layout
  const isHomePage = location.pathname === '/';
  
  // Admin sayfaları kontrolü
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';
  
  // Doktor sayfaları kontrolü
  const isDoctorPage = location.pathname.startsWith('/doctor');
  
  // Hastane sayfaları kontrolü
  const isHospitalPage = location.pathname.startsWith('/hospital');
  
  // Doktor sayfaları için özel layout (Footer olmadan)
  if (isDoctorPage) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Üst Navigasyon */}
        <Header />

        {/* Ana içerik - Full width for doctor pages */}
        <main role="main" className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer yok - doktor sayfalarında footer gösterilmiyor */}
      </div>
    );
  }
  
  // Hastane sayfaları için özel layout (Footer olmadan)
  if (isHospitalPage) {
    return (
      <div className="flex flex-col w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Üst Navigasyon */}
        <Header />

        {/* Ana içerik - Full width for hospital pages */}
        <main role="main" className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer yok - hastane sayfalarında footer gösterilmiyor */}
      </div>
    );
  }
  
  if (isHomePage) {
    return (
      <div className="flex flex-col w-full bg-gradient-to-br from-white via-gray-50 to-blue-50">
        {/* Üst Navigasyon */}
        <Header />

        {/* Ana içerik - Full width for homepage */}
        <main role="main" className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  // Admin sayfaları için sidebar layout
  if (isAdminPage && isAdmin) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Üst Navigasyon */}
        <Header />

        {/* Ana içerik alanı - Sidebar + Content */}
        <div className="flex flex-1 min-h-screen">
          {/* Admin Sidebar - Sabit */}
          <div className="flex-shrink-0">
            <AdminSidebar />
          </div>
          
          {/* İçerik alanı */}
          <main role="main" className="flex-1 min-h-screen" style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)'
          }}>
            <div className="relative z-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Auth sayfaları için özel layout (Footer olmadan)
  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/register') || 
                     location.pathname.startsWith('/forgot-password');
  
  if (isAuthPage) {
    return (
      <div className="flex flex-col w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800">
        {/* Üst Navigasyon */}
        <Header />

        {/* Ana içerik - Full width for auth pages */}
        <main role="main" className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer yok - auth sayfalarında footer gösterilmiyor */}
      </div>
    );
  }
  
  // Public sayfalar için özel arka plan
  const isPublicPage = ['/', '/about', '/contact', '/terms', '/privacy'].includes(location.pathname);

  // Diğer tüm sayfalar için normal layout
  return (
    <div className={`flex flex-col w-full ${
      isPublicPage 
        ? 'bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Üst Navigasyon */}
      <Header />

      {/* Ana içerik - Full width for all pages */}
      <main role="main" className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
