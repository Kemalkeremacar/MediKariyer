/**
 * @file AdminSidebar.jsx
 * @description Admin Sidebar Bileşeni - Admin sayfaları için yan menü
 * 
 * Bu bileşen, admin sayfalarında kullanılan yan menü (sidebar) bileşenidir.
 * Admin kullanıcılarının tüm yönetim sayfalarına hızlı erişim sağlar.
 * 
 * Ana Özellikler:
 * - Sabit genişlik: 256px (w-64) sabit sidebar genişliği
 * - Aktif sayfa vurgulama: Mevcut sayfa için özel stil
 * - Icon desteği: Her menü öğesi için özel ikon
 * - Gradient efektler: Aktif menü öğesi için gradient arka plan
 * - Hover efektleri: Menü öğeleri için hover animasyonları
 * - Responsive: Mobil için collapse özelliği (gelecekte eklenecek)
 * - Glassmorphism: Modern blur efekti
 * 
 * Menü Öğeleri:
 * 1. Dashboard: Genel istatistikler ve özet bilgiler
 * 2. Doktorlar: Doktor kullanıcılarının yönetimi
 * 3. Hastaneler: Hastane kullanıcılarının yönetimi
 * 4. İş İlanı Yönetimi: Tüm iş ilanlarının yönetimi
 * 5. Başvurular: Tüm başvuruların görüntülenmesi
 * 6. Fotoğraf Onayları: Doktor profil fotoğrafı onayları
 * 7. Bildirimler: Sistem bildirimlerinin yönetimi
 * 8. İletişim Mesajları: Gelen iletişim mesajlarının yönetimi
 * 9. Sistem Logları: Sistem loglarının görüntülenmesi
 * 
 * Renk Şemaları:
 * - Dashboard: Mavi gradient (blue-500 to blue-600)
 * - Doktorlar: Yeşil gradient (green-500 to green-600)
 * - Hastaneler: Yeşil gradient (green-500 to green-600)
 * - İş İlanı Yönetimi: Mor gradient (purple-500 to purple-600)
 * - Başvurular: Zümrüt gradient (emerald-500 to emerald-600)
 * - Fotoğraf Onayları: Mor gradient (purple-500 to purple-600)
 * - Bildirimler: Amber gradient (amber-500 to amber-600)
 * - İletişim Mesajları: Teal gradient (teal-500 to teal-600)
 * - Sistem Logları: Kırmızı gradient (red-500 to red-600)
 * 
 * Aktif Menü Öğesi Stilleri:
 * - Gradient arka plan: from-blue-500/20 to-purple-500/20
 * - Border: border-blue-500/30
 * - Shadow: shadow-md shadow-blue-500/10
 * - Icon background: Menü tipine göre gradient
 * 
 * Teknik Detaylar:
 * - useLocation ile aktif sayfa takibi
 * - React Router Link ile sayfa yönlendirme
 * - Lucide React icons kullanımı
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiBell, 
  FiBarChart2, 
  FiSettings, 
  FiMail,
  FiFileText,
  FiCheckCircle,
  FiChevronRight,
  FiActivity,
  FiCamera
} from 'react-icons/fi';
import { Building2 } from 'lucide-react';

/**
 * ============================================================================
 * ADMIN SIDEBAR COMPONENT - Mobile Responsive
 * ============================================================================
 * 
 * Desktop: Sabit sidebar (lg+ ekranlar)
 * Mobile: Overlay sidebar (hamburger butonuyla açılır/kapanır)
 */

/** Menü öğeleri konfigürasyonu */
const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: FiHome, color: 'from-blue-500 to-blue-600' },
  { name: 'Doktorlar', href: '/admin/users', icon: FiUsers, color: 'from-green-500 to-green-600' },
  { name: 'Hastaneler', href: '/admin/hospitals', icon: Building2, color: 'from-green-500 to-green-600' },
  { name: 'İş İlanı Yönetimi', href: '/admin/jobs', icon: FiBriefcase, color: 'from-purple-500 to-purple-600' },
  { name: 'Başvurular', href: '/admin/applications', icon: FiCheckCircle, color: 'from-emerald-500 to-emerald-600' },
  { name: 'Fotoğraf Onayları', href: '/admin/photo-approvals', icon: FiCamera, color: 'from-purple-500 to-purple-600' },
  { name: 'Bildirimler', href: '/admin/notifications', icon: FiBell, color: 'from-amber-500 to-amber-600' },
  { name: 'İletişim Mesajları', href: '/admin/contact-messages', icon: FiMail, color: 'from-teal-500 to-teal-600' },
  { name: 'Kongre Yönetimi', href: '/admin/congresses', icon: FiFileText, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Sistem Logları', href: '/admin/logs', icon: FiActivity, color: 'from-red-500 to-red-600' },
];

/** Ortak menü listesi render'ı */
const SidebarNav = ({ items, currentPath, onItemClick }) => (
  <nav className="py-6 px-4 space-y-2 flex-1 overflow-y-auto">
    {items.map((item) => {
      const Icon = item.icon;
      const isCurrent = currentPath === item.href;
      return (
        <Link
          key={item.name}
          to={item.href}
          replace={false}
          onClick={onItemClick}
          className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 transform hover:scale-[1.01] active:scale-[0.99] ${
            isCurrent
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-md shadow-blue-500/10'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-sm'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 transition-all duration-150 ${
            isCurrent
              ? `bg-gradient-to-r ${item.color} shadow-md`
              : 'bg-slate-700/50 group-hover:bg-slate-600/50'
          }`}>
            <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
          </div>
          <span className="flex-1">{item.name}</span>
          {isCurrent && (
            <FiChevronRight className="w-4 h-4 text-blue-400" />
          )}
        </Link>
      );
    })}
  </nav>
);

const AdminSidebar = ({ isMobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  // Route değiştiğinde mobil sidebar'ı kapat
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobil sidebar açıkken body scroll'u engelle
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  // Mobil sidebar açıkken Escape ile kapat, desktop'a geçince otomatik kapat
  useEffect(() => {
    if (!isMobileOpen || !onMobileClose) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onMobileClose();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        onMobileClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileOpen, onMobileClose]);

  return (
    <>
      {/* ============================================================
          DESKTOP SIDEBAR - Sadece xl+ (1280px+) ekranlarda görünür
          ============================================================ */}
      <div
        className="hidden xl:flex flex-col h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl flex-shrink-0"
        style={{ minWidth: '256px', maxWidth: '256px' }}
      >
        <SidebarNav items={MENU_ITEMS} currentPath={currentPath} onItemClick={() => {}} />
      </div>

      {/* ============================================================
          MOBILE SIDEBAR OVERLAY - Sadece xl altı ekranlarda, açıkken görünür
          ============================================================ */}
      {isMobileOpen && (
        <div 
          id="admin-mobile-sidebar"
          className="xl:hidden fixed inset-0 z-[9998]"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Arka plan overlay - tıklanınca sidebar kapanır */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onMobileClose();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onMobileClose();
            }}
          />
          {/* Sidebar paneli - soldan kayarak gelir */}
          <div className="absolute top-0 left-0 bottom-0 z-10 flex flex-col w-72 max-w-[85vw] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl animate-slide-in-left">
            {/* Kapatma butonu */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
              <span className="text-white font-bold text-base">Admin Menü</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMobileClose();
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
                aria-label="Menüyü kapat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav items={MENU_ITEMS} currentPath={currentPath} onItemClick={onMobileClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
