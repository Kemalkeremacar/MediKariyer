/**
 * @file Header.jsx
 * @description Header Bileşeni - Uygulama üst navigasyon çubuğu
 * 
 * Bu bileşen, uygulama genelinde kullanılan üst navigasyon çubuğunu sağlar.
 * Rol bazlı navigasyon menüleri, kullanıcı dropdown menüleri ve responsive
 * mobil menü yönetimi içerir.
 * 
 * Ana Özellikler:
 * - Rol bazlı navigasyon: Admin, Doktor, Hastane, Guest için farklı menüler
 * - Logo yönetimi: Tıklanabilir logo ile rol bazlı yönlendirme
 * - Kullanıcı dropdown: Kullanıcı bilgileri ve hızlı erişim menüsü
 * - Bildirim sistemi: NavbarNotificationBell entegrasyonu
 * - Mobil menü: Hamburger menü ile mobil navigasyon
 * - Responsive: Desktop ve mobil için optimize edilmiş
 * - Active state: Aktif sayfa vurgulama
 * - Glassmorphism: Modern blur efekti
 * 
 * Navigasyon Yapısı:
 * - Guest: Ana Sayfa, Hakkımızda, İletişim
 * - Admin: Dropdown menü (Header'da nav yok, sidebar kullanılır)
 * - Doctor: Ana Sayfa, Profilim, İş İlanları, Başvurularım
 * - Hospital: Ana Sayfa, Profilim, İlan Yönetimi, Başvurular
 * 
 * Kullanıcı Dropdown Menüleri:
 * - Admin: Dashboard, Doktorlar, Hastaneler, İş İlanı Yönetimi, Başvurular,
 *          Fotoğraf Onayları, Bildirimler, İletişim Mesajları
 * - Doctor: Ana Sayfa, Profilim, İş İlanları, Başvurularım
 * - Hospital: Ana Sayfa, Profilim, İlan Yönetimi, Başvurular
 * 
 * Mobil Menü:
 * - Tüm navigasyon linkleri
 * - Kullanıcı bilgileri
 * - Admin menü (admin ise)
 * - Çıkış butonu
 * 
 * Teknik Detaylar:
 * - useState ile menü açık/kapalı durumu
 * - useLocation ile aktif sayfa takibi
 * - useAuthStore ile kullanıcı bilgileri
 * - useNavigate ile programatik yönlendirme
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Settings, LogOut, Bell, UserCheck, Briefcase, BarChart3, FileText, Shield, Building2, ClipboardList, Camera, Mail, Stethoscope } from 'lucide-react';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import NavbarNotificationBell from './NavbarNotificationBell';
import useAuthStore from '../../store/authStore';
import logoImage from '../../assets/logo.png';

/**
 * ============================================================================
 * HEADER COMPONENT
 * ============================================================================
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Scroll event listener - Public sayfada scroll durumunu takip et
  useEffect(() => {
    const isPublicPage = location.pathname === '/';
    
    // Public sayfa değilse active section'ı sıfırla
    if (!isPublicPage) {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 100);

      // Active section detection - sadece ana sayfada
      const sections = ['home', 'about', 'contact'];
      const scrollPosition = window.scrollY + 150; // Header yüksekliği + offset

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    handleScroll(); // İlk yüklemede çalıştır
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event) => {
      // Desktop ve mobil menü ref'lerini kontrol et
      const isOutsideDesktop = desktopMenuRef.current && !desktopMenuRef.current.contains(event.target);
      const isOutsideMobile = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target);
      
      // Her ikisi de dışarıdaysa kapat
      if (isOutsideDesktop && isOutsideMobile) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isUserMenuOpen]);

  // ============================================================================
  // NAVIGATION CONFIGURATION - Rol bazlı navigasyon yapılandırması
  // ============================================================================

  /**
   * Rol bazlı navigasyon menü öğeleri
   * Her rol için farklı navigasyon linkleri tanımlanır
   */
  const navLinksByRole = {
    guest: [
      { to: '/#home', text: 'Ana Sayfa', isHash: true },
      { to: '/#about', text: 'Hakkımızda', isHash: true },
      { to: '/#contact', text: 'İletişim', isHash: true },
    ],
    admin: [], // Admin için navigation menü yok, sadece dropdown
    doctor: [
      { to: ROUTE_CONFIG.DOCTOR.DASHBOARD, text: 'Ana Sayfa' },
      { to: ROUTE_CONFIG.DOCTOR.PROFILE, text: 'Profilim' },
      { to: ROUTE_CONFIG.DOCTOR.JOBS, text: 'İş İlanları' },
      { to: ROUTE_CONFIG.DOCTOR.APPLICATIONS, text: 'Başvurularım' },
    ],
    hospital: [
      { to: ROUTE_CONFIG.HOSPITAL.DASHBOARD, text: 'Ana Sayfa' },
      { to: ROUTE_CONFIG.HOSPITAL.PROFILE, text: 'Profilim' },
      { to: ROUTE_CONFIG.HOSPITAL.JOBS, text: 'İlan Yönetimi' },
      { to: ROUTE_CONFIG.HOSPITAL.APPLICATIONS, text: 'Başvurular' },
    ],
  };

  /**
   * Admin dropdown menü öğeleri
   * AdminSidebar ile tutarlı olacak şekilde yapılandırılmıştır
   */
  const adminMenuItems = [
    { to: ROUTE_CONFIG.ADMIN.DASHBOARD, text: 'Dashboard', icon: BarChart3 },
    { to: ROUTE_CONFIG.ADMIN.USERS, text: 'Doktorlar', icon: Stethoscope },
    { to: ROUTE_CONFIG.ADMIN.HOSPITALS, text: 'Hastaneler', icon: Building2 },
    { to: ROUTE_CONFIG.ADMIN.JOBS, text: 'İş İlanı Yönetimi', icon: Briefcase },
    { to: ROUTE_CONFIG.ADMIN.APPLICATIONS, text: 'Başvurular', icon: ClipboardList },
    { to: ROUTE_CONFIG.ADMIN.PHOTO_APPROVALS, text: 'Fotoğraf Onayları', icon: Camera },
    { to: ROUTE_CONFIG.ADMIN.NOTIFICATIONS, text: 'Bildirimler', icon: Bell },
    { to: ROUTE_CONFIG.ADMIN.CONTACT_MESSAGES, text: 'İletişim Mesajları', icon: Mail },
  ];


  /**
   * Mevcut kullanıcı rolüne göre navigasyon linklerini al
   * Login/Register sayfalarında da guest navigation göster
   */
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const navLinks = (isAuthPage || !user) ? navLinksByRole.guest : navLinksByRole[user.role || 'guest'];

  // ============================================================================
  // EVENT HANDLERS - Event handler fonksiyonları
  // ============================================================================

  /**
   * Logo tıklama handler
   * Kullanıcının rolüne göre uygun dashboard'a yönlendirir
   * Login/Register sayfalarından ana sayfaya dönüş sağlar
   */
  const handleLogoClick = () => {
    // Login/Register sayfalarındaysa ana sayfaya dön
    if (isAuthPage) {
      navigate(ROUTE_CONFIG.PUBLIC.HOME);
      return;
    }
    
    if (user?.role === 'admin') {
      navigate(ROUTE_CONFIG.ADMIN.DASHBOARD);
    } else if (user?.role === 'doctor') {
      navigate(ROUTE_CONFIG.DOCTOR.DASHBOARD);
    } else if (user?.role === 'hospital') {
      navigate(ROUTE_CONFIG.HOSPITAL.DASHBOARD);
    } else {
      navigate(ROUTE_CONFIG.PUBLIC.HOME);
    }
  };

  /**
   * Çıkış yapma handler
   * Kullanıcı çıkış yapar ve ana sayfaya yönlendirilir
   */
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // React Router ile anasayfaya yönlendir
    navigate('/', { replace: true });
  };

  const NavLinkItem = ({ to, text, exact = false, isHash = false, ...props }) => {
    const location = useLocation();
    
    // Hash navigation için özel handler
    const handleHashClick = (e) => {
      if (isHash) {
        e.preventDefault();
        const hash = to.split('#')[1];
        
        // Eğer farklı bir sayfadaysak, önce ana sayfaya git
        if (location.pathname !== '/') {
          navigate(`/#${hash}`);
          // Ana sayfaya gittikten sonra scroll yapılacak (LandingPage useEffect'i ile)
          return;
        }
        
        // Aynı sayfadaysak direkt scroll yap
        const element = document.getElementById(hash);
        if (element) {
          // scrollIntoView kullan - CSS scroll-margin otomatik uygulanır
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
        // URL'i güncelle
        window.history.pushState(null, '', to);
      }
    };

    // Hash navigation için active state kontrolü
    // Sadece ana sayfada (/) active state göster
    const hash = to.split('#')[1];
    const isActive = isHash && location.pathname === '/'
      ? activeSection === hash
      : false;

    if (isHash) {
      return (
        <a
          href={to}
          onClick={handleHashClick}
          className={`group relative px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            isActive 
              ? 'bg-blue-500/10 text-blue-600' 
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          }`}
          {...props}
        >
          <span className="transition-colors">
            {text}
          </span>
          {isActive && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
          )}
        </a>
      );
    }

    return (
      <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
          `group relative px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            isActive 
              ? 'bg-blue-500/10 text-blue-600' 
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          }`
        }
        {...props}
      >
        {({ isActive }) => (
          <>
            <span className="transition-colors">
              {text}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  /**
   * Header renk şeması fonksiyonu
   * Tüm sayfalar için aynı modern beyaz header
   */
  const getHeaderColors = () => {
    // Tüm sayfalar için modern beyaz header with glassmorphism
    return 'bg-white/95 backdrop-blur-lg shadow-sm';
  };

  const getTextColor = () => {
    return 'text-gray-900';
  };

  const isPublicPage = location.pathname === '/';
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className={`${getHeaderColors()} backdrop-blur-md shadow-lg ${
      isPublicPage ? 'fixed' : isAuthRoute ? 'relative' : 'sticky'
    } ${isPublicPage || isAuthRoute ? '' : 'top-0'} ${isPublicPage ? 'left-0 right-0' : ''} z-50 border-b border-gray-200 transition-all duration-300 ${
      isPublicPage && !scrolled ? 'bg-white/80' : 'bg-white/95'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - 4 Parametre Planına Göre */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer"
            >
              {/* Logo Icon - Her zaman varsayılan logo */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden shadow-lg">
                <img 
                  src={logoImage} 
                  alt="MediKariyer Logo" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              {/* Logo Text - Tam Logo Stili */}
              <div className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
                <span className="font-bold text-[#2563a8]">Medikariyer</span>
                <span className="font-normal text-[#5ba3d0]">.net</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation - 4 Parametre Planına Göre (Sadece md+ ekranlarda görünür) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <NavLinkItem 
                key={`${link.to}-${index}`} 
                to={link.to}
                text={link.text}
                isHash={link.isHash}
                exact={link.to === ROUTE_CONFIG.DOCTOR.DASHBOARD || link.to === ROUTE_CONFIG.HOSPITAL.DASHBOARD}
              />
            ))}
          </nav>

          {/* Desktop Right side - 4 Parametre Planına Göre (Sadece md+ ekranlarda görünür) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  // Admin için özel header
                  <div className="relative" ref={desktopMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                    >
                      <User size={18} />
                      <span className="text-sm font-bold">
                        {user.first_name && user.last_name 
                          ? `${user.title || 'Dr.'} ${user.first_name} ${user.last_name}` 
                          : user.email
                        }
                      </span>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {adminMenuItems.map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={`${item.to}-${index}`}
                              to={item.to}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <IconComponent size={18} className="text-gray-500" />
                              <span className="text-sm font-bold">{item.text}</span>
                            </Link>
                          );
                        })}
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-bold">Çıkış Yap</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : user.role === 'hospital' ? (
                  // Hastane için dropdown menü
                  <>
                    {/* Bildirimler */}
                    <NavbarNotificationBell />

                    {/* Hastane Dropdown */}
                    <div className="relative" ref={desktopMenuRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                      >
                        <Building2 size={18} />
                        <span className="text-sm font-bold">
                          {user.institution_name || user.email}
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div 
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.DASHBOARD}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <BarChart3 size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Ana Sayfa</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.PROFILE}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Building2 size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Profilim</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.JOBS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Briefcase size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">İlan Yönetimi</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.APPLICATIONS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <ClipboardList size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Başvurular</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.NOTIFICATIONS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Bell size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Bildirimler</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.SETTINGS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Settings size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Ayarlar</span>
                          </Link>
                          <hr className="my-2 border-gray-200" />
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                              navigate('/', { replace: true });
                            }}
                            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-bold">Çıkış Yap</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Doktor için dropdown menü
                  <>
                    {/* Bildirimler */}
                    <NavbarNotificationBell />

                    {/* Doktor Dropdown */}
                    <div className="relative" ref={desktopMenuRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                      >
                        <User size={18} />
                        <span className="text-sm font-bold">
                          {user.first_name && user.last_name 
                            ? `${user.title || 'Dr.'} ${user.first_name} ${user.last_name}` 
                            : user.email
                          }
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div 
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.DASHBOARD}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <BarChart3 size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Ana Sayfa</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.PROFILE}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <User size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Profilim</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.JOBS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Briefcase size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">İş İlanları</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.APPLICATIONS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <FileText size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Başvurularım</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.NOTIFICATIONS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Bell size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Bildirimler</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.SETTINGS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Settings size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">Ayarlar</span>
                          </Link>
                          <hr className="my-2 border-gray-200" />
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                              navigate('/', { replace: true });
                            }}
                            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-bold">Çıkış Yap</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to={ROUTE_CONFIG.PUBLIC.LOGIN}
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-bold transition-all duration-300"
                >
                  Giriş Yap
                </Link>
                <Link
                  to={ROUTE_CONFIG.PUBLIC.REGISTER}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - 4 Parametre Planına Göre (Sadece md altı ekranlarda görünür) */}
          <div className="md:hidden">
            <div className="relative flex items-center space-x-3">
              {/* Bildirimler - Sadece giriş yapmış kullanıcılar için */}
              {user && (user.role === 'hospital' || user.role === 'doctor') && (
                <div className="flex-shrink-0">
                  <NavbarNotificationBell />
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <div className="relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none p-2"
                  aria-label="Menüyü aç"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  {user ? (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <Menu size={20} />
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Mobile All-in-One Dropdown - 4 Parametre Planına Göre */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto mobile-dropdown" 
                    style={{ zIndex: 9999 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                  {/* User Info Section */}
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.email
                        }
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role === 'admin' ? 'Yönetici' : 
                         user.role === 'doctor' ? 'Doktor' : 
                         user.role === 'hospital' ? 'Hastane' : 'Kullanıcı'}
                      </p>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="px-2 py-2">
                    {navLinks.map((link, index) => {
                      if (link.isHash) {
                        return (
                          <a
                            key={`mobile-dropdown-nav-${link.to}-${index}`}
                            href={link.to}
                            onClick={(e) => {
                              e.preventDefault();
                              const hash = link.to.split('#')[1];
                              
                              // Eğer farklı bir sayfadaysak, önce ana sayfaya git
                              if (location.pathname !== '/') {
                                navigate(`/#${hash}`);
                                setIsUserMenuOpen(false);
                                return;
                              }
                              
                              // Aynı sayfadaysak direkt scroll yap
                              const element = document.getElementById(hash);
                              if (element) {
                                element.scrollIntoView({ 
                                  behavior: 'smooth', 
                                  block: 'start'
                                });
                              }
                              window.history.pushState(null, '', link.to);
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <span className="text-sm font-bold">{link.text}</span>
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={`mobile-dropdown-nav-${link.to}-${index}`}
                          to={link.to}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          <span className="text-sm font-bold">{link.text}</span>
                        </Link>
                      );
                    })}
                  </div>


                  {/* Admin Menu */}
                  {user && user.role === 'admin' && (
                    <div className="px-2 py-2 border-t border-gray-200">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Admin Menüsü
                      </div>
                      {adminMenuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={`mobile-dropdown-admin-${item.to}-${index}`}
                            to={item.to}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <IconComponent size={18} className="text-gray-500" />
                            <span className="text-sm font-bold">{item.text}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Guest Actions */}
                  {!user && (
                    <div className="px-2 py-2 border-t border-gray-200">
                      <Link
                        to={ROUTE_CONFIG.PUBLIC.LOGIN}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <User size={18} className="text-gray-500" />
                        <span className="text-sm font-bold">Giriş Yap</span>
                      </Link>
                      <Link
                        to={ROUTE_CONFIG.PUBLIC.REGISTER}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <User size={18} className="text-gray-500" />
                        <span className="text-sm font-bold">Kayıt Ol</span>
                      </Link>
                    </div>
                  )}

                  {/* Doctor specific menu items */}
                  {user && user.role === 'doctor' && (
                    <div className="px-2 py-2 border-t border-gray-200">
                      <Link
                        to={ROUTE_CONFIG.DOCTOR.NOTIFICATIONS}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Bell size={18} className="text-gray-500" />
                        <span className="text-sm font-bold">Bildirimler</span>
                      </Link>
                      <Link
                        to={ROUTE_CONFIG.DOCTOR.SETTINGS}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Settings size={18} className="text-gray-500" />
                        <span className="text-sm font-bold">Ayarlar</span>
                      </Link>
                    </div>
                  )}

                  {/* Hospital specific menu items */}
                  {user && user.role === 'hospital' && (
                    <div className="px-2 py-2 border-t border-gray-200">
                      <Link
                        to={ROUTE_CONFIG.HOSPITAL.NOTIFICATIONS}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Bell size={18} className="text-gray-500" />
                        <span className="text-sm font-bold">Bildirimler</span>
                      </Link>
                      <Link
                        to={ROUTE_CONFIG.HOSPITAL.SETTINGS}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Settings size={18} className="text-gray-500" />
                        <span className="text-sm font-bold">Ayarlar</span>
                      </Link>
                    </div>
                  )}

                  {/* Logout for logged in users */}
                  {user && (
                    <div className="px-2 py-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/', { replace: true });
                        }}
                        className="mt-3 flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-left"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-bold">Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
