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

const AdminSidebar = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  /**
   * Location değişikliklerini takip et
   * Aktif sayfa değiştiğinde currentPath state'ini güncelle
   */
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  // ============================================================================
  // MENU CONFIGURATION - Menü yapılandırması
  // ============================================================================

  /**
   * Menü öğeleri konfigürasyonu
   * Her menü öğesi için: isim, route, aktif durumu, ikon ve renk tanımlanır
   */
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      current: currentPath === '/admin',
      icon: FiHome,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Doktorlar',
      href: '/admin/users',
      current: currentPath === '/admin/users',
      icon: FiUsers,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Hastaneler',
      href: '/admin/hospitals',
      current: currentPath === '/admin/hospitals',
      icon: Building2,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'İş İlanı Yönetimi',
      href: '/admin/jobs',
      current: currentPath === '/admin/jobs',
      icon: FiBriefcase,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Başvurular',
      href: '/admin/applications',
      current: currentPath === '/admin/applications',
      icon: FiCheckCircle,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Fotoğraf Onayları',
      href: '/admin/photo-approvals',
      current: currentPath === '/admin/photo-approvals',
      icon: FiCamera,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Bildirimler',
      href: '/admin/notifications',
      current: currentPath === '/admin/notifications',
      icon: FiBell,
      color: 'from-amber-500 to-amber-600'
    },
    {
      name: 'İletişim Mesajları',
      href: '/admin/contact-messages',
      current: currentPath === '/admin/contact-messages',
      icon: FiMail,
      color: 'from-teal-500 to-teal-600'
    },
    {
      name: 'Sistem Logları',
      href: '/admin/logs',
      current: currentPath === '/admin/logs',
      icon: FiActivity,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl flex-shrink-0 flex flex-col h-full" style={{ minWidth: '256px', maxWidth: '256px' }}>
      {/* Navigation Menu */}
      <nav className="py-6 px-4 space-y-2 flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              replace={false}
              className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 transform hover:scale-[1.01] active:scale-[0.99] ${
                item.current
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-md shadow-blue-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 transition-all duration-150 ${
                item.current 
                  ? `bg-gradient-to-r ${item.color} shadow-md` 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <Icon className={`w-4 h-4 ${item.current ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
              </div>
              <span className="flex-1">{item.name}</span>
              {item.current && (
                <FiChevronRight className="w-4 h-4 text-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
