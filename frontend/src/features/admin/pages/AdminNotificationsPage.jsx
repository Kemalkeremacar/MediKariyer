/**
 * AdminNotificationsPage - Admin bildirimleri sayfası
 * Sadece admin'e gelen bildirimleri gösterir
 */

import React, { useState } from 'react';
import { useAdminNotifications, useDeleteNotification } from '../api/useAdmin';
import { 
  Bell, 
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { apiRequest } from '@/services/http/client';

const AdminNotificationsPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Bildirim hooks'ları - filtre yok, sadece sayfalama
  const { data: notificationsData, isLoading, refetch } = useAdminNotifications({
    page: 1,
    limit: 50
  });
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data?.data || [];

  // Tek bildirimi okundu olarak işaretle
  const handleMarkAsRead = async (notificationId) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await apiRequest.patch(`/notifications/${notificationId}/read`);
      refetch();
    } catch (error) {
      console.error('Okundu işaretleme hatası:', error);
      showToast.error('Bildirim güncellenirken hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Tümünü okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    if (isProcessing) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }
    
    setIsProcessing(true);
    const loadingToast = showToast.loading('Tüm bildirimler okundu olarak işaretleniyor...');
    
    try {
      await apiRequest.patch('/admin/notifications/mark-all-read');
      showToast.dismiss(loadingToast);
      showToast.success('Tüm bildirimler okundu olarak işaretlendi');
      refetch();
    } catch (error) {
      console.error('API hatası:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Bildirimler işaretlenirken hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Tek bildirimi sil
  const handleDeleteNotification = async (notificationId) => {
    if (deleteNotificationMutation.isPending) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }
    
    const confirmed = await showToast.confirm(
      'Bildirimi Sil',
      'Bu bildirim silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      { type: 'danger' }
    );
    
    if (!confirmed) return;
    
    deleteNotificationMutation.mutate(notificationId, {
      onSuccess: () => {
        showToast.success('Bildirim silindi');
        refetch();
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Bildirim silinirken hata oluştu');
      }
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: <Info className="h-5 w-5 text-blue-500" />,
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      error: <AlertCircle className="h-5 w-5 text-red-500" />,
      system: <Bell className="h-5 w-5 text-purple-500" />
    };
    return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bell className="h-8 w-8 mr-3 text-indigo-600" />
                  Bildirimler
                </h1>
                <p className="text-gray-600 mt-2">
                  Bildirimleri görüntüleyin. Okunmamış bildirimlerin üzerine tıklayarak okundu yapabilirsiniz.
                </p>
              </div>
              <div>
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isProcessing}
                  className="admin-btn admin-btn-success"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tümünü Okundu Yap
                </button>
              </div>
            </div>
          </div>

          {/* Bildirim Listesi */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="admin-card p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirim Bulunamadı</h3>
                <p className="text-gray-600">Henüz hiç bildirim bulunmuyor.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  className={`admin-card border-l-4 ${
                    notification.is_read 
                      ? 'border-gray-300 bg-gray-50' 
                      : 'border-blue-500 bg-white shadow-md cursor-pointer hover:shadow-xl hover:scale-[1.01]'
                  } transition-all duration-200`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-full ${
                            notification.is_read ? 'bg-gray-100' : 'bg-blue-100'
                          }`}>
                            {getTypeIcon(notification.type)}
                          </div>
                          <h3 className={`text-lg font-semibold ${
                            notification.is_read ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="px-3 py-1 text-xs rounded-full font-bold bg-blue-500 text-white animate-pulse">
                              ● Yeni
                            </span>
                          )}
                        </div>
                        <p className={`mb-4 ${
                          notification.is_read ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {notification.body}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`flex items-center ${
                            notification.is_read ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(notification.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {!notification.is_read && (
                          <p className="text-xs text-blue-600 mt-3 font-medium">
                            💡 Okundu olarak işaretlemek için tıklayın
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          disabled={isProcessing}
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          title="Bildirimi Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
};

export default AdminNotificationsPage;