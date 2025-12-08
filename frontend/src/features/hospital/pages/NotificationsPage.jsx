/**
 * @file NotificationsPage.jsx
 * @description Hastane Bildirimler Sayfası - Hastanenin tüm bildirimlerini görüntüleme ve yönetme
 * 
 * Özellikler:
 * - Bildirim listesi ve filtreleme
 * - Bildirim okundu/okunmadı durumu yönetimi
 * - Bildirim silme ve toplu silme
 * - Bildirim detay sayfası
 * - Modern mavi tema (diğer hastane sayfaları ile tutarlı)
 * - Yönlendirme desteği (bildirime tıklayınca ilgili sayfaya git)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification
} from '@/features/notifications/api/useNotifications';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { 
  Bell, CheckCircle, Filter, Trash2, 
  X, CheckCircle2, Trash, CheckCheck,
  FileText, Calendar, Briefcase, MessageSquare,
  Settings, Clock, AlertTriangle, XCircle, Info,
  ExternalLink
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ROUTE_CONFIG } from '@config/routes.js';
import apiRequest from '@/services/http/client';
import { formatRelativeTime } from '@/utils/dateUtils';

/**
 * Notification Card Component
 * Tek bir bildirimi render eder
 */
const NotificationCard = ({ notification, onMarkAsRead, onDelete, onViewDetail, isSelected, onToggleSelect }) => {
  const getIcon = (type) => {
    const iconMap = {
      application_status: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
      interview_scheduled: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
      job_match: { icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
      message: { icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
      system: { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
      reminder: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
      success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
      warning: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
      error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
      info: { icon: Info, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    };
    return iconMap[type] || { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
  };

  // formatDate artık dateUtils'den geliyor (formatRelativeTime olarak)

  const isRead = notification.isRead !== undefined 
    ? notification.isRead 
    : (notification.read_at === null || notification.read_at === undefined);
  const createdAt = notification.createdAt || notification.created_at;
  const message = notification.message || notification.body;

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(notification.id);
    }
    onViewDetail(notification);
  };

  return (
    <div
      className={`group relative rounded-2xl border ${
        isRead 
          ? 'border-gray-100 bg-white shadow-sm' 
          : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
      } p-6 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
      onClick={handleClick}
    >
      {/* Selection Checkbox */}
      <div 
        className="absolute top-4 right-4 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(notification.id);
        }}
      >
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-gray-300 bg-white hover:border-blue-400 text-transparent'
        }`}>
          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
      </div>

      <div className="flex items-start gap-4 pr-8">
        {/* Icon */}
        {(() => {
          const iconConfig = getIcon(notification.type);
          const IconComponent = iconConfig.icon;
          return (
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconConfig.bg} border ${iconConfig.border} flex items-center justify-center shadow-sm`}>
              <IconComponent className={`w-6 h-6 ${iconConfig.color}`} />
            </div>
          );
        })()}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className={`font-semibold text-lg ${isRead ? 'text-gray-800' : 'text-blue-900'}`}>
              {notification.title}
            </h4>
            {!isRead && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
            )}
          </div>
          
          <p className={`text-sm leading-relaxed mb-3 ${isRead ? 'text-gray-600' : 'text-gray-700'}`}>
            {message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(createdAt)}
            </span>
            
            {notification.data?.redirect_url && (
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Detaylara Git</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
              title="Okundu işaretle"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const HospitalNotificationsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const {
    data: notificationsData,
    isLoading,
    error,
  } = useNotifications(filters);

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const { data: unreadCountData } = useUnreadNotificationCount();

  // Bildirimleri güvenli bir şekilde al - her zaman array olduğundan emin ol
  // Backend response yapısı:
  // axios response: { data: { success: true, message: '...', data: { data: [...], pagination: {...} } } }
  // Yani: notificationsData.data.data.data = bildirimler array'i
  //       notificationsData.data.data.pagination = pagination objesi
  const notifications = Array.isArray(notificationsData?.data?.data?.data) 
    ? notificationsData.data.data.data 
    : Array.isArray(notificationsData?.data?.data) 
    ? notificationsData.data.data 
    : Array.isArray(notificationsData?.data?.notifications)
    ? notificationsData.data.notifications
    : Array.isArray(notificationsData?.data)
    ? notificationsData.data
    : [];
  const pagination = notificationsData?.data?.data?.pagination || notificationsData?.data?.pagination || {};
  const totalUnreadCount = unreadCountData?.data?.data?.count ?? 0;

  const pageUnreadCount = Array.isArray(notifications) ? notifications.filter((n) => {
    return n.isRead === false || (n.isRead === undefined && (n.read_at === null || n.read_at === undefined));
  }).length : 0;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      // Toast mesajı kaldırıldı - sessiz işlem
    } catch (error) {
      showToast.error(toastMessages.notification.markReadError);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      showToast.success(toastMessages.notification.markAllReadSuccess || 'Tüm bildirimler okundu olarak işaretlendi');
      setSelectedNotifications(new Set());
    } catch (error) {
      showToast.error(toastMessages.notification.markAllReadErrorGeneric);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      showToast.success(toastMessages.notification.deleteSuccess);
      setSelectedNotifications(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    } catch (error) {
      showToast.error(error, { defaultMessage: toastMessages.notification.deleteError });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      const promises = Array.from(selectedNotifications).map(id => 
        deleteNotificationMutation.mutateAsync(id)
      );
      await Promise.all(promises);
      showToast.success(`${selectedNotifications.size} bildirim silindi`);
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } catch (error) {
      showToast.error('Bildirimler silinirken bir hata oluştu');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      const promises = Array.from(selectedNotifications).map(id => 
        markAsReadMutation.mutateAsync(id)
      );
      await Promise.all(promises);
      showToast.success(`${selectedNotifications.size} bildirim okundu olarak işaretlendi`);
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } catch (error) {
      showToast.error('Bildirimler güncellenirken bir hata oluştu');
    }
  };

  const handleToggleSelect = (notificationId) => {
    setSelectedNotifications(prev => {
      const next = new Set(prev);
      if (next.has(notificationId)) {
        next.delete(notificationId);
      } else {
        next.add(notificationId);
      }
      if (next.size > 0) {
        setShowBulkActions(true);
      } else {
        setShowBulkActions(false);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
      setShowBulkActions(true);
    }
  };

  const handleViewDetail = async (notification) => {
    // Bildirimi okundu işaretle
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Yönlendirme URL'i varsa oraya git
    if (notification.data?.redirect_url) {
      navigate(notification.data.redirect_url);
      return;
    }
    
    // Başvuru detayına git
    if (notification.data?.application_id) {
      navigate(`/hospital/applications/${notification.data.application_id}`);
      return;
    }
    
    // İş ilanı için önce kontrol et, sonra yönlendir
    if (notification.data?.job_id) {
      try {
        // API'ye istek at, ilan var mı kontrol et
        await apiRequest.get(`/hospital/jobs/${notification.data.job_id}`);
        // İlan var, yönlendir
        navigate(`/hospital/jobs/${notification.data.job_id}`);
      } catch (error) {
        if (error?.response?.status === 404) {
          // ✅ DEBUG: Toast çağrısını kontrol et
          console.log('🚨 404 Hatası! Toast çağrılıyor...');
          
          // İlan silinmiş, yönlendirme yapma
          showToast.warning('Bu iş ilanı artık mevcut değil.');
          
          // ✅ DEBUG: Toast çağrıldı, container'ı kontrol et
          setTimeout(() => {
            const container = document.getElementById('toast-portal-root');
            console.log('Toast Container:', container);
            console.log('Toast sayısı:', container?.children.length);
            if (container) {
              console.log('Container position:', window.getComputedStyle(container).position);
              console.log('Container bottom:', window.getComputedStyle(container).bottom);
              console.log('Container zIndex:', window.getComputedStyle(container).zIndex);
            }
          }, 100);
        } else {
          // Başka bir hata - yine de yönlendir, detay sayfası halledecek
          navigate(`/hospital/jobs/${notification.data.job_id}`);
        }
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center shadow-md">
            <h2 className="text-gray-900 font-bold text-xl mb-4">Hata Oluştu</h2>
            <p className="text-gray-600 mb-6">Bildirimler yüklenirken bir hata oluştu.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 p-8 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-cyan-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimler</h1>
                  {totalUnreadCount > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-700 border border-red-500/30">
                      {totalUnreadCount} okunmamış bildirim
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {totalUnreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{markAllAsReadMutation.isLoading ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedNotifications.size > 0 && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-medium">
                {selectedNotifications.size} bildirim seçildi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Okundu İşaretle
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors shadow-sm"
              >
                <Trash className="w-4 h-4" />
                Sil
              </button>
              <button
                onClick={() => {
                  setSelectedNotifications(new Set());
                  setShowBulkActions(false);
                }}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Durum</label>
              <select
                value={filters.isRead === undefined ? '' : String(filters.isRead)}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => {
                    const newFilters = { ...prev, page: 1 };
                    if (value === '') {
                      delete newFilters.isRead;
                    } else {
                      newFilters.isRead = value === 'true';
                    }
                    return newFilters;
                  });
                }}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Tüm Bildirimler</option>
                <option value="false">Okunmamış</option>
                <option value="true">Okunmuş</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Tür</label>
              <select
                value={filters.type || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => {
                    const newFilters = { ...prev, page: 1 };
                    if (value === '') {
                      delete newFilters.type;
                    } else {
                      newFilters.type = value;
                    }
                    return newFilters;
                  });
                }}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Tüm Türler</option>
                <option value="info">Bilgi</option>
                <option value="warning">Uyarı</option>
                <option value="success">Başarı</option>
                <option value="error">Hata</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSelectAll}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 transition-colors"
              >
                {selectedNotifications.size === notifications.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="rounded-2xl border border-blue-100 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <SkeletonLoader key={i} className="h-32 rounded-2xl bg-gray-200" />
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <Bell className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bildirim bulunmuyor</h3>
              <p className="text-gray-500">
                {filters.isRead === false
                  ? 'Okunmamış bildiriminiz yok.'
                  : filters.isRead === true
                  ? 'Okunmuş bildiriminiz yok.'
                  : 'Henüz bildiriminiz bulunmuyor.'}
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    onViewDetail={handleViewDetail}
                    isSelected={selectedNotifications.has(notification.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="bg-blue-50 px-6 py-4 flex items-center justify-between border-t border-blue-100">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={filters.page === 1}
                    className="px-4 py-2 rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-blue-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Önceki
                  </button>

                  <div className="text-sm text-gray-700 font-medium">
                    Sayfa {filters.page} / {pagination.total_pages}{' '}
                    <span className="ml-2 text-gray-600">
                      (Toplam {pagination.total || pagination.total_count || 0} bildirim)
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.min(pagination.total_pages, prev.page + 1),
                      }))
                    }
                    disabled={filters.page === pagination.total_pages}
                    className="px-4 py-2 rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-blue-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalNotificationsPage;

