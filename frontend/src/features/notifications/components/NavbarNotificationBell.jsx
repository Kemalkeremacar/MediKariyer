/**
 * Navbar Notification Bell
 * 🔔 simgesi + unread count badge
 */

import React, { useState } from 'react';
import { useUnreadNotificationCount } from '../api/useNotifications';
import { Bell, Settings, AlertTriangle, Users, MessageSquare, FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_CONFIG } from '@config/routes.js';
import useAuthStore from '@/store/authStore';

const NavbarNotificationBell = () => {
  const { data, isLoading, error } = useUnreadNotificationCount();
  const { user } = useAuthStore();
  const unreadCount = data?.data?.count || 0;
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
      >
        <Bell className="w-6 h-6 text-white/90" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto notification-dropdown">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} yeni bildirim</p>
            )}
          </div>
          
          {isLoading ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">Yükleniyor...</p>
            </div>
          ) : unreadCount === 0 ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">Yeni bildiriminiz yok</p>
            </div>
          ) : (
            <div className="px-4 py-3">
              <Link
                to={user?.role === 'admin' ? ROUTE_CONFIG.ADMIN.NOTIFICATIONS : `/${user?.role}/notifications`}
                className="text-blue-600 text-sm hover:underline font-medium"
                onClick={() => setIsOpen(false)}
              >
                Tümünü Gör →
              </Link>
            </div>
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
