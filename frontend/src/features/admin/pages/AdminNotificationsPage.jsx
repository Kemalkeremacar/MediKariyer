/**
 * @file AdminNotificationsPage.jsx
 * @description Admin Bildirimler Sayfası - Admin'in tüm bildirimlerini görüntüleme ve yönetme
 * 
 * Özellikler:
 * - Bildirim listesi ve filtreleme
 * - Bildirim okundu/okunmadı durumu yönetimi
 * - Bildirim silme ve toplu silme
 * - Modern admin teması
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
  UserPlus, Building2, Briefcase, Camera, Mail, Users, Send
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ROUTE_CONFIG } from '@config/routes.js';
import apiRequest from '@/services/http/client';

/**
 * Notification Card Component
 * Tek bir bildirimi render eder
 */
const NotificationCard = ({ notification, onMarkAsRead, onDelete, onViewDetail, isSelected, onToggleSelect }) => {
  const getIcon = (type, title) => {
    // Başlığa göre özel ikonlar
    if (title?.includes('Doktor Kaydı')) return <UserPlus className="w-5 h-5 text-blue-500" />;
    if (title?.includes('Hastane Kaydı')) return <Building2 className="w-5 h-5 text-green-500" />;
    if (title?.includes('İş İlanı')) return <Briefcase className="w-5 h-5 text-purple-500" />;
    if (title?.includes('Fotoğraf')) return <Camera className="w-5 h-5 text-orange-500" />;
    if (title?.includes('İletişim')) return <Mail className="w-5 h-5 text-indigo-500" />;
    
    // Tür'e göre genel ikonlar
    const icons = {
      info: <Bell className="w-5 h-5 text-blue-500" />,
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      warning: <Trash2 className="w-5 h-5 text-yellow-500" />,
      error: <X className="w-5 h-5 text-red-500" />,
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
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
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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
      className={`group relative rounded-lg border ${
        isRead 
          ? 'border-gray-200 bg-white' 
          : 'border-blue-400 bg-blue-50'
      } p-4 transition-all duration-200 hover:shadow-md cursor-pointer`}
      onClick={handleClick}
    >
      {/* Selection Checkbox */}
      <div 
        className="absolute top-3 right-3 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(notification.id);
        }}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-indigo-500 border-indigo-500' 
            : 'border-gray-300 bg-white hover:border-indigo-400'
        }`}>
          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>

      <div className="flex items-start gap-3 pr-8">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          {getIcon(notification.type, notification.title)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h4 className={`font-semibold text-base ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            {!isRead && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
            )}
          </div>
          
          <p className={`text-sm mb-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
            {message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatDate(createdAt)}
            </span>
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
              className="p-1.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
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
            className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    isRead: undefined, // undefined = tüm bildirimler, true = okunmuş, false = okunmamış
  });
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filtreleri hook'a göndermeden önce temizle (undefined değerleri kaldır)
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

  const {
    data: notificationsData,
    isLoading,
    error,
  } = useNotifications(cleanFilters);

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const { data: unreadCountData } = useUnreadNotificationCount();

  // Bildirimleri güvenli bir şekilde al
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
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

    const data = notification.data || {};
    
    // Kullanıcı yönlendirmeleri (genelde silinmez)
    if (data.user_id && data.role === 'doctor') {
      navigate(`/admin/users/${data.user_id}`);
      return;
    } else if (data.user_id && data.role === 'hospital') {
      navigate(`/admin/users/${data.user_id}`);
      return;
    }
    
    // İş ilanı için önce kontrol et
    if (data.job_id) {
      try {
        await apiRequest.get(`/admin/jobs/${data.job_id}`);
        navigate(`/admin/jobs/${data.job_id}`);
      } catch (error) {
        if (error?.response?.status === 404) {
          showToast.warning('Bu iş ilanı artık mevcut değil.');
        } else {
          // Başka bir hata - yine de yönlendir
          navigate(`/admin/jobs/${data.job_id}`);
        }
      }
      return;
    }
    
    // Fotoğraf onay talebi (hem yeni talep hem de onay/red sonucu)
    if (data.request_id || (data.action && ['approve', 'reject'].includes(data.action))) {
      navigate(`/admin/photo-approvals`);
      return;
    }
    
    // İletişim mesajı
    if (data.contact_message_id) {
      navigate(`/admin/contact-messages/${data.contact_message_id}`);
      return;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
            <h2 className="text-gray-900 font-bold text-xl mb-4">Hata Oluştu</h2>
            <p className="text-gray-600 mb-6">Bildirimler yüklenirken bir hata oluştu.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
                {totalUnreadCount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200 mt-2">
                    {totalUnreadCount} okunmamış bildirim
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/notifications/send')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Bildirim Gönder
              </button>
              {totalUnreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{markAllAsReadMutation.isLoading ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedNotifications.size > 0 && (
          <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-medium">
                {selectedNotifications.size} bildirim seçildi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Okundu İşaretle
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                <Trash className="w-4 h-4" />
                Sil
              </button>
              <button
                onClick={() => {
                  setSelectedNotifications(new Set());
                  setShowBulkActions(false);
                }}
                className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={filters.isRead === undefined ? '' : String(filters.isRead)}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => {
                    const newFilters = { ...prev, page: 1 };
                    if (value === '') {
                      newFilters.isRead = undefined;
                    } else {
                      newFilters.isRead = value === 'true';
                    }
                    return newFilters;
                  });
                }}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tüm Bildirimler</option>
                <option value="false">Okunmamış</option>
                <option value="true">Okunmuş</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
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
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-medium transition-colors"
              >
                {selectedNotifications.size === notifications.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <SkeletonLoader key={i} className="h-24 rounded-lg bg-gray-100" />
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bildirim bulunmuyor</h3>
              <p className="text-gray-600">
                {filters.isRead === false
                  ? 'Okunmamış bildiriminiz yok.'
                  : filters.isRead === true
                  ? 'Okunmuş bildiriminiz yok.'
                  : 'Henüz bildiriminiz bulunmuyor.'}
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 space-y-3">
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
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={filters.page === 1}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>

                  <div className="text-sm text-gray-600">
                    Sayfa {filters.page} / {pagination.total_pages}{' '}
                    <span className="ml-2">
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
                    className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminNotificationsPage;
