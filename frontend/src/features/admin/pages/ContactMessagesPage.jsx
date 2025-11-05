/**
 * @file ContactMessagesPage.jsx
 * @description İletişim Mesajları Yönetimi - Kullanıcılardan gelen iletişim formlarını görüntüleme
 */

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
// import { ModalContainer } from '@/components/ui/ModalContainer';

/**
 * ContactMessagesPage - İletişim mesajları yönetimi sayfası
 * Kullanıcılardan gelen iletişim formlarını görüntüleme
 */
const ContactMessagesPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAnchorY, setDetailAnchorY] = useState(null);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Backend hook'ları - sayfalama etkin
  const { data: messagesData, isLoading, refetch } = useContactMessages({
    page: currentPage,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const deleteMessage = useDeleteContactMessage();

  const messages = messagesData?.data?.data || messagesData?.data || [];
  // Backend returns: { data: messages, pagination: {...} }
  // So pagination is at messagesData?.data?.pagination
  const rawPagination = messagesData?.data?.pagination || messagesData?.pagination || {};
  
  // Normalize pagination format to match other pages
  const perPage = rawPagination.per_page || rawPagination.limit || 10;
  const total = rawPagination.total !== undefined && rawPagination.total !== null ? parseInt(rawPagination.total) : 0;
  const calculatedTotalPages = total > 0 ? Math.ceil(total / perPage) : 1;
  
  const pagination = {
    current_page: rawPagination.current_page || rawPagination.page || currentPage || 1,
    per_page: perPage,
    total: total,
    total_pages: (rawPagination.total_pages !== undefined && rawPagination.total_pages !== null) 
      ? parseInt(rawPagination.total_pages) 
      : calculatedTotalPages
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewMessage = (message, e) => {
    // Kartı ortala ve inline detay kutusunu aç/kapat
    if (e && e.currentTarget && e.currentTarget.scrollIntoView) {
      try {
        e.currentTarget.scrollIntoView({ block: 'center', behavior: 'auto' });
      } catch (_) {}
    }
    setSelectedMessage(message);
    setExpandedMessageId(prev => prev === message.id ? null : message.id);
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
              Gelen Mesajlar {typeof pagination.total === 'number' ? `(${pagination.total})` : `(${messages.length})`}
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
                    <div className="admin-card-body relative overflow-hidden">
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
                      {expandedMessageId === message.id && (
                        <div className="mt-3 md:mt-0 md:absolute md:right-64 md:top-4 md:w-[42%] lg:w-[38%] z-10">
                          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 md:max-h-[60vh] overflow-auto">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {formatDate(message.created_at)}
                              </div>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); setExpandedMessageId(null); }}
                                className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                              >
                                Kapat
                              </button>
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                              {message.message}
                            </div>
                          </div>
                        </div>
                      )}
                          </div>
                          
                          <div className="ml-14">
                            <h5 className="font-medium text-gray-900 mb-1">
                              Konu: {message.subject}
                            </h5>
                            {/* Mesaj özeti ve tarih gizlendi; sadece konu gösterilir */}
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

        {/* Pagination */}
        {pagination.total > 0 && pagination.total_pages > 0 && (
          <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-t border-slate-600/30 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{pagination.total}</span> mesajdan{' '}
                  <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> -{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  arası gösteriliyor
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {pagination.total_pages > 0 && Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current_page
                          ? 'z-10 bg-indigo-500 border-indigo-400 text-white'
                          : 'bg-slate-700 border-slate-500 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
        {/* Mesaj detayları artık inline açılıyor; modal kaldırıldı */}
      </div>
    </div>
  );
};

export default ContactMessagesPage;
