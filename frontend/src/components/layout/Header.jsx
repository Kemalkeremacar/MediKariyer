import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Settings, LogOut, Bell, UserCheck, Briefcase, BarChart3, FileText, Shield, Building2, ClipboardList, Camera, Mail } from 'lucide-react';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import NavbarNotificationBell from '../../features/notifications/components/NavbarNotificationBell';
import useAuthStore from '../../store/authStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();


  // Role bazlı menüler
  const navLinksByRole = {
    guest: [
      { to: ROUTE_CONFIG.PUBLIC.HOME, text: 'Ana Sayfa' },
      { to: ROUTE_CONFIG.PUBLIC.ABOUT, text: 'Hakkımızda' },
      { to: ROUTE_CONFIG.PUBLIC.CONTACT, text: 'İletişim' },
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

  // Admin dropdown menü öğeleri - AdminSidebar ile tutarlı
  const adminMenuItems = [
    { to: ROUTE_CONFIG.ADMIN.DASHBOARD, text: 'Dashboard', icon: BarChart3 },
    { to: ROUTE_CONFIG.ADMIN.USERS, text: 'Kullanıcı Yönetimi', icon: UserCheck },
    { to: ROUTE_CONFIG.ADMIN.PHOTO_APPROVALS, text: 'Fotoğraf Onayları', icon: Camera },
    { to: ROUTE_CONFIG.ADMIN.JOBS, text: 'İş İlanı Yönetimi', icon: Briefcase },
    { to: ROUTE_CONFIG.ADMIN.APPLICATIONS, text: 'Başvurular', icon: ClipboardList },
    { to: ROUTE_CONFIG.ADMIN.NOTIFICATIONS, text: 'Bildirimler', icon: Bell },
    { to: ROUTE_CONFIG.ADMIN.CONTACT_MESSAGES, text: 'İletişim Mesajları', icon: Mail },
  ];


  const navLinks = navLinksByRole[user?.role || 'guest'];

  // Logo tıklama handler - kullanıcının rolüne göre yönlendirme
  const handleLogoClick = () => {
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

  // Logout handler
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // React Router ile anasayfaya yönlendir
    navigate('/', { replace: true });
  };

  const NavLinkItem = ({ to, text, exact = false, ...props }) => (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          isActive 
            ? 'text-blue-300 bg-white/10 shadow-sm' 
            : 'text-white/80 hover:text-blue-300 hover:bg-white/10'
        }`
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          {text}
          {isActive && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full"></div>
          )}
        </>
      )}
    </NavLink>
  );

  // Tüm roller için aynı header renkleri (doktor renk şeması)
  const getHeaderColors = () => {
    return 'bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-blue-700/95';
  };

  return (
    <header className={`${getHeaderColors()} backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-white/10`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - 4 Parametre Planına Göre */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              {/* Logo Icon - 4 Parametre Planına Göre */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              {/* Logo Text - 4 Parametre Planına Göre */}
              <span className="text-2xl font-bold text-white">
                {APP_CONFIG.APP_NAME}
              </span>
            </button>
          </div>

          {/* Desktop Navigation - 4 Parametre Planına Göre (Sadece md+ ekranlarda görünür) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <NavLinkItem 
                key={`${link.to}-${index}`} 
                {...link} 
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
                  <>
                    <div className="relative">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <User size={18} />
                        <span className="text-sm font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.title || 'Dr.'} ${user.first_name} ${user.last_name}` 
                            : user.email
                          }
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
                                <span className="text-sm font-medium">{item.text}</span>
                              </Link>
                            );
                          })}
                          <hr className="my-2 border-gray-200" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Çıkış Yap</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : user.role === 'hospital' ? (
                  // Hastane için dropdown menü
                  <>
                    {/* Bildirimler */}
                    <NavbarNotificationBell />

                    {/* Hastane Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <Building2 size={18} />
                        <span className="text-sm font-medium">
                          {user.institution_name || user.email}
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.DASHBOARD}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <BarChart3 size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Ana Sayfa</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.PROFILE}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Building2 size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Profilim</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.JOBS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Briefcase size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">İlan Yönetimi</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.HOSPITAL.APPLICATIONS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <ClipboardList size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Başvurular</span>
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
                            <span className="text-sm font-medium">Çıkış Yap</span>
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
                    <div className="relative">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <User size={18} />
                        <span className="text-sm font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.title || 'Dr.'} ${user.first_name} ${user.last_name}` 
                            : user.email
                          }
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.DASHBOARD}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <BarChart3 size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Ana Sayfa</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.PROFILE}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <User size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Profilim</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.JOBS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Briefcase size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">İş İlanları</span>
                          </Link>
                          <Link
                            to={ROUTE_CONFIG.DOCTOR.APPLICATIONS}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <FileText size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Başvurularım</span>
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
                            <span className="text-sm font-medium">Çıkış Yap</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <NavLinkItem to={ROUTE_CONFIG.PUBLIC.LOGIN} text="Giriş Yap" />
                <Link
                  to={ROUTE_CONFIG.PUBLIC.REGISTER}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-white/80 hover:text-blue-300 focus:outline-none p-2"
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
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto mobile-dropdown" style={{ zIndex: 9999 }}>
                  {/* User Info Section */}
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
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
                    {navLinks.map((link, index) => (
                      <Link
                        key={`mobile-dropdown-nav-${link.to}-${index}`}
                        to={link.to}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium">{link.text}</span>
                      </Link>
                    ))}
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
                            <span className="text-sm font-medium">{item.text}</span>
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
                        <span className="text-sm font-medium">Giriş Yap</span>
                      </Link>
                      <Link
                        to={ROUTE_CONFIG.PUBLIC.REGISTER}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <User size={18} className="text-gray-500" />
                        <span className="text-sm font-medium">Kayıt Ol</span>
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
                        className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-left"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Çıkış Yap</span>
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
