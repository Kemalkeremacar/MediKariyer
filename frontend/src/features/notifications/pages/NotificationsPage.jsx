/**
 * @file NotificationsPage.jsx
 * @description Bildirimler Sayfası - Kullanıcı bildirimlerini görüntüleme ve yönetme
 */

import React, { useState } from 'react';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification
} from '../api/useNotifications';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { Bell, CheckCircle, Filter, Search, Trash2 } from 'lucide-react';
import TransitionWrapper from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { formatRelativeTime } from '@/utils/dateUtils';

/**
 * Notification Card Component
 * Tek bir bildirimi render eder
 */
const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  // Backend'den gelen type'ı frontend icon mapping'e uyarla
  const getIcon = (type) => {
    // Backend type'ları: 'info', 'success', 'warning', 'error'
    // Frontend type mapping'i için
    const typeMapping = {
      'info': 'application_status',
      'success': 'application_status',
      'warning': 'application_status',
      'error': 'application_status'
    };
    
    const mappedType = typeMapping[type] || type;
    
    const icons = {
      application_status: '📋',
      interview_scheduled: '📅',
      job_match: '💼',
      message: '💬',
      system: '⚙️',
      reminder: '⏰',
    };
    return icons[mappedType] || '📢';
  };

  // formatDate artık dateUtils'den geliyor (formatRelativeTime olarak)

  // Backend'den gelen field'ları kullan (normalize edilmiş)
  const isRead = notification.isRead !== undefined 
    ? notification.isRead 
    : (notification.read_at === null || notification.read_at === undefined);
  const createdAt = notification.createdAt || notification.created_at;
  const message = notification.message || notification.body;

  return (
    <div
      className={`notification-card ${
        !isRead ? 'unread' : ''
      } flex items-start gap-3 p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-50`}
      onClick={() => !isRead && onMarkAsRead(notification.id)}
    >
      <div className="text-2xl">{getIcon(notification.type)}</div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{notification.title}</h4>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="text-blue-600 text-sm mt-1 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.actionText || 'Görüntüle'}
          </a>
        )}
      </div>

      {!isRead && (
        <div className="unread-indicator">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        </div>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="text-red-500 hover:text-red-700 p-1"
          title="Bildirimi sil"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

const NotificationsPage = () => {
  const [filters, setFilters] = useState({
    isRead: '',
    type: '',
    page: 1,
    limit: 20,
  });

  const {
    data: notificationsData,
    isLoading,
    error,
  } = useNotifications(filters);

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data?.data || notificationsData?.data?.notifications || [];
  const pagination = notificationsData?.data?.pagination || {};
  const unreadCount = notifications.filter((n) => {
    // Backend'den normalize edilmiş isRead field'ını veya read_at field'ını kullan
    return n.isRead === false || (n.isRead === undefined && (n.read_at === null || n.read_at === undefined));
  }).length;

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
    } catch (error) {
      showToast.error(toastMessages.notification.markAllReadErrorGeneric);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      showToast.success(toastMessages.notification.deleteSuccess);
    } catch (error) {
      showToast.error(error, { defaultMessage: toastMessages.notification.deleteError });
    }
  };

  if (error) {
    return (
      <TransitionWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-700 font-medium text-lg mb-2">Hata Oluştu</h2>
            <p className="text-red-600 text-sm mb-4">Bildirimler yüklenirken bir hata oluştu.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </TransitionWrapper>
    );
  }

  return (
    <TransitionWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 mt-1">
                    {unreadCount} okunmamış bildirim
                  </span>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
                className="admin-btn admin-btn-primary"
              >
                <CheckCircle size={18} />
                <span>
                  {markAllAsReadMutation.isLoading ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}
                </span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="admin-card p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={filters.isRead}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, isRead: e.target.value, page: 1 }))
                  }
                  className="admin-form-select"
                >
                  <option value="">Tüm Bildirimler</option>
                  <option value="false">Okunmamış</option>
                  <option value="true">Okunmuş</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))
                  }
                  className="admin-form-select"
                >
                  <option value="">Tüm Türler</option>
                  <option value="application_status">Başvuru Durumu</option>
                  <option value="interview_scheduled">Mülakat</option>
                  <option value="job_match">İş Eşleşmesi</option>
                  <option value="message">Mesaj</option>
                  <option value="system">Sistem</option>
                  <option value="reminder">Hatırlatma</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="admin-card">
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <SkeletonLoader key={i} card />
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirim bulunmuyor</h3>
                <p className="text-gray-500">
                  {filters.isRead === 'false'
                    ? 'Okunmamış bildiriminiz yok.'
                    : 'Henüz bildiriminiz bulunmuyor.'}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={filters.page === 1}
                      className="admin-btn admin-btn-outline"
                    >
                      Önceki
                    </button>

                    <div className="text-sm text-gray-600">
                      Sayfa {filters.page} / {pagination.totalPages}{' '}
                      <span className="ml-2">
                        (Toplam {pagination.totalCount} bildirim)
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.min(pagination.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={filters.page === pagination.totalPages}
                      className="admin-btn admin-btn-outline"
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
    </TransitionWrapper>
  );
};

export default NotificationsPage;
