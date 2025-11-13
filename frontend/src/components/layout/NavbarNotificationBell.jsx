/**
 * Navbar Notification Bell
 * 🔔 simgesi + unread count badge
 * Global layout component - Header'da kullanılır
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUnreadNotificationCount, useNotifications } from '@/features/notifications/api/useNotifications';
import { Bell, Settings, Users, MessageSquare, FileText, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_CONFIG } from '@config/routes.js';
import useAuthStore from '@/store/authStore';

const NavbarNotificationBell = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useUnreadNotificationCount();
  const navigate = useNavigate();
  const unreadCount = data?.data?.data?.count ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dropdown dışında tıklanınca veya Escape ile kapanmasını sağla
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Dropdown açıkken son 5 bildirimi getir
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(
    isOpen ? { limit: 5, page: 1 } : { limit: 0, page: 1 },
    { enabled: isOpen }
  );

  // Bildirimleri güvenli bir şekilde al
  const notifications = Array.isArray(notificationsData?.data?.data?.data) 
    ? notificationsData.data.data.data 
    : Array.isArray(notificationsData?.data?.data) 
    ? notificationsData.data.data 
    : [];

  const notificationsRoute =
    user?.role === 'admin'
      ? ROUTE_CONFIG.ADMIN.NOTIFICATIONS
      : user?.role === 'doctor'
      ? ROUTE_CONFIG.DOCTOR.NOTIFICATIONS
      : user?.role === 'hospital'
      ? ROUTE_CONFIG.HOSPITAL.NOTIFICATIONS
      : ROUTE_CONFIG.SHARED.NOTIFICATIONS;

  const buildDynamicRoute = (template, replacements = {}) => {
    if (!template) return null;
    let result = template;
    Object.entries(replacements).forEach(([key, value]) => {
      result = result.replace(`:${key}`, value);
    });
    return result;
  };

  const resolveApplicationRoute = (applicationId) => {
    if (!applicationId) return null;
    if (user?.role === 'admin') {
      return buildDynamicRoute(ROUTE_CONFIG.ADMIN.APPLICATION_DETAIL, { id: applicationId });
    }
    if (user?.role === 'doctor') {
      return buildDynamicRoute(ROUTE_CONFIG.DOCTOR.APPLICATION_DETAIL, { applicationId });
    }
    if (user?.role === 'hospital') {
      return buildDynamicRoute(ROUTE_CONFIG.HOSPITAL.APPLICATION_DETAIL, { applicationId });
    }
    return null;
  };

  const resolveJobRoute = (jobId) => {
    if (!jobId) return null;
    if (user?.role === 'admin') {
      return buildDynamicRoute(ROUTE_CONFIG.ADMIN.JOB_DETAIL, { id: jobId });
    }
    if (user?.role === 'doctor') {
      return buildDynamicRoute(ROUTE_CONFIG.DOCTOR.JOB_DETAIL, { jobId });
    }
    if (user?.role === 'hospital') {
      return buildDynamicRoute(ROUTE_CONFIG.HOSPITAL.JOB_DETAIL || '/hospital/jobs/:jobId', { jobId });
    }
    return null;
  };

  const resolveNotificationNavigation = (notification) => {
    if (!notification) return notificationsRoute;

    if (notification.data?.redirect_url) {
      return notification.data.redirect_url;
    }

    const applicationRoute = resolveApplicationRoute(notification.data?.application_id);
    if (applicationRoute) {
      return applicationRoute;
    }

    const jobRoute = resolveJobRoute(notification.data?.job_id);
    if (jobRoute) {
      // If hospital job route returns list, append anchor? fallback to notifications
      return jobRoute;
    }

    return notificationsRoute;
  };

  const isDropdownLoading = isLoading || notificationsLoading;

  // Admin için hızlı erişim menü öğeleri
  const adminQuickAccess = [
    { to: ROUTE_CONFIG.ADMIN.NOTIFICATIONS, text: 'Tüm Bildirimler', icon: Bell },
    { to: ROUTE_CONFIG.ADMIN.USERS, text: 'Kullanıcı Yönetimi', icon: Users },
    { to: ROUTE_CONFIG.ADMIN.MESSAGES, text: 'Mesajlar', icon: MessageSquare },
    { to: ROUTE_CONFIG.ADMIN.APPLICATIONS, text: 'Başvurular', icon: FileText },
    { to: ROUTE_CONFIG.ADMIN.ANALYTICS, text: 'Analitikler', icon: BarChart3 },
    { to: ROUTE_CONFIG.ADMIN.SETTINGS, text: 'Sistem Ayarları', icon: Settings },
  ];

  // Eğer notification sistemi henüz aktif değilse gösterme
  if (error) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
      >
        <Bell className="w-6 h-6 text-white/90" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[22px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 px-1.5 text-[11px] font-semibold text-white shadow-[0_6px_14px_rgba(244,63,94,0.45)] ring-2 ring-white/80">
            <span className="leading-none">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-xl border border-gray-200 py-2 z-50 notification-dropdown">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex flex-col items-center text-center gap-1">
              <h3 className="font-semibold text-gray-900">Bildirimler</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} yeni bildirim</p>
              )}
            </div>
          </div>
          
          {isDropdownLoading ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">Yükleniyor...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">Bildiriminiz yok</p>
            </div>
          ) : (
            <>
              {/* Bildirim Listesi */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => {
                  const isRead = notification.isRead !== undefined 
                    ? notification.isRead 
                    : (notification.read_at !== null && notification.read_at !== undefined);
                  
                  const getIcon = (type) => {
                    const icons = {
                      info: '📋',
                      warning: '⚠️',
                      success: '✅',
                      error: '❌',
                    };
                    return icons[type] || '📢';
                  };

                  const formatDate = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    const now = new Date();
                    const diff = now - date;
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);

                    if (minutes < 1) return 'Az önce';
                    if (minutes < 60) return `${minutes} dk önce`;
                    if (hours < 24) return `${hours} saat önce`;
                    if (days < 7) return `${days} gün önce`;
                    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                  };

                  const handleClick = () => {
                    setIsOpen(false);
                    const targetRoute = resolveNotificationNavigation(notification);
                    if (targetRoute) {
                      navigate(targetRoute);
                    }
                  };

                  return (
                    <div
                      key={notification.id}
                      onClick={handleClick}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            {!isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message || notification.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.createdAt || notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tümünü Gör Linki */}
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  to={user?.role === 'admin' 
                    ? ROUTE_CONFIG.ADMIN.NOTIFICATIONS 
                    : user?.role === 'doctor'
                    ? ROUTE_CONFIG.DOCTOR.NOTIFICATIONS
                    : user?.role === 'hospital'
                    ? ROUTE_CONFIG.HOSPITAL.NOTIFICATIONS
                    : ROUTE_CONFIG.SHARED.NOTIFICATIONS}
                  className="text-blue-600 text-sm hover:underline font-medium flex items-center justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  Tümünü Gör →
                </Link>
              </div>
            </>
          )}

          {/* Admin için hızlı erişim */}
          {user?.role === 'admin' && (
            <>
              <div className="border-t border-gray-100 my-2"></div>
              <div className="px-4 py-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hızlı Erişim</h4>
                <div className="space-y-1">
                  {adminQuickAccess.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <IconComponent size={16} className="text-gray-500" />
                        <span className="text-sm font-medium">{item.text}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarNotificationBell;

