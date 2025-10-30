import React, { useState } from 'react';
import { 
  useContactMessages, 
  useDeleteContactMessage
} from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  User, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';

/**
 * ContactMessagesPage - İletişim mesajları yönetimi sayfası
 * Kullanıcılardan gelen iletişim formlarını görüntüleme
 */
const ContactMessagesPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAnchorY, setDetailAnchorY] = useState(null);

  // Backend hook'ları - basit liste, filtre yok
  const { data: messagesData, isLoading, refetch } = useContactMessages({
    page: 1,
    limit: 100,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const deleteMessage = useDeleteContactMessage();

  const messages = messagesData?.data?.data || messagesData?.data || [];

  const handleViewMessage = (message, e) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDetailAnchorY(rect.top + (window.scrollY || window.pageYOffset));
    } else {
      setDetailAnchorY(null);
    }
    setSelectedMessage(message);
    setShowDetailModal(true);
  };

  const handleDeleteMessage = async (messageId) => {
    if (deleteMessage.isPending) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }

    const confirmed = await showToast.confirm({
      title: "Mesajı Sil",
      message: "Bu mesajı silmek istediğinizden emin misiniz?",
      type: "danger",
      destructive: true,
      confirmText: "Sil",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;
    
    deleteMessage.mutate(messageId, {
      onSuccess: () => {
        showToast.success('Mesaj silindi');
        refetch();
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Mesaj silinemedi');
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <SkeletonLoader />
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
                <MessageSquare className="h-8 w-8 mr-3 text-indigo-600" />
                İletişim Mesajları
              </h1>
              <p className="text-gray-600 mt-2">
                İletişim formundan gelen mesajları görüntüleyin
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="admin-btn admin-btn-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Gelen Mesajlar ({messages.length})
            </h3>
          </div>
          
          <div className="admin-card-body">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Henüz mesaj yok
                </h3>
                <p className="text-gray-500">
                  İletişim formundan gönderilen mesajlar burada görünecek
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="admin-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={(e) => handleViewMessage(message, e)}
                  >
                    <div className="admin-card-body">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {message.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {message.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-14">
                            <h5 className="font-medium text-gray-900 mb-1">
                              Konu: {message.subject}
                            </h5>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {message.message}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(message.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(message.id);
                          }}
                          disabled={deleteMessage.isPending}
                          className="admin-btn admin-btn-sm admin-btn-danger ml-4"
                          title="Mesajı sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail Modal */}
        {showDetailModal && selectedMessage && (
          <ModalContainer
            isOpen={true}
            onClose={() => setShowDetailModal(false)}
            title="Mesaj Detayı"
            size="medium"
            maxHeight="90vh"
            closeOnBackdrop={true}
            align="auto"
            anchorY={detailAnchorY}
            fullScreenOnMobile
          >
            <div className="space-y-6">
                {/* Sender Info */}
                <div className="admin-card">
                  <div className="admin-card-body">
                    <h3 className="font-semibold text-gray-900 mb-3">Gönderen Bilgileri</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Ad Soyad:</span>
                        <span className="text-gray-900 font-medium">{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">E-posta:</span>
                        <span className="text-gray-900 font-medium">{selectedMessage.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Tarih:</span>
                        <span className="text-gray-900 font-medium">{formatDate(selectedMessage.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="admin-card">
                  <div className="admin-card-body">
                    <h3 className="font-semibold text-gray-900 mb-2">Konu</h3>
                    <p className="text-gray-900 mb-4">{selectedMessage.subject}</p>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">Mesaj</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="admin-btn admin-btn-outline flex-1"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteMessage(selectedMessage.id);
                      setShowDetailModal(false);
                    }}
                    disabled={deleteMessage.isPending}
                    className="admin-btn admin-btn-danger flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Mesajı Sil
                  </button>
                </div>
            </div>
          </ModalContainer>
        )}
      </div>
    </div>
  );
};

export default ContactMessagesPage;
