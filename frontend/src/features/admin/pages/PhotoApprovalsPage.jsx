/**
 * @file PhotoApprovalsPage.jsx
 * @description Admin fotoğraf onay sayfası
 * Doktorların fotoğraf değişiklik taleplerini onaylar/reddeder
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { usePhotoRequests, useReviewPhotoRequest } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';

const PhotoApprovalsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // API hooks
  const { data: photoRequestsData, isLoading, refetch } = usePhotoRequests({ 
    status: selectedStatus,
    page: currentPage,
    limit: 10
  });
  
  // Bekleyen taleplerin sayısını almak için ayrı query
  const { data: pendingRequestsData } = usePhotoRequests({ 
    status: 'pending',
    page: 1,
    limit: 1 // Sadece sayı için
  });
  
  const reviewPhotoRequestMutation = useReviewPhotoRequest();

  const photoRequests = Array.isArray(photoRequestsData?.data?.data)
    ? photoRequestsData.data.data
    : [];
  const rawPagination = photoRequestsData?.data?.pagination || {};
  
  // Normalize pagination format to match other pages
  const pagination = {
    current_page: rawPagination.current_page || rawPagination.page || currentPage || 1,
    per_page: rawPagination.per_page || rawPagination.limit || 10,
    total: rawPagination.total || 0,
    total_pages: rawPagination.total_pages || rawPagination.pages || Math.ceil((rawPagination.total || 0) / (rawPagination.per_page || rawPagination.limit || 10)) || 1
  };
  
  // Bekleyen taleplerin sayısı
  const pendingCount = pendingRequestsData?.data?.pagination?.total || 0;
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Status değiştiğinde sayfayı 1'e sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  // Fotoğraf talebini onayla
  const handleApprove = async (requestId) => {
    try {
      await reviewPhotoRequestMutation.mutateAsync({
        requestId,
        action: 'approve'
      });
      closeModal();
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  // Fotoğraf talebini reddet
  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      showToast.error('Red nedeni gereklidir');
      return;
    }

    try {
      await reviewPhotoRequestMutation.mutateAsync({
        requestId,
        action: 'reject',
        reason: rejectReason
      });
      closeModal();
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  // Modal aç
  const openModal = (request) => {
    setSelectedRequest(request || null);
    setRejectReason('');
    setShowModal(true);
  };

  // Modal kapat
  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  // Status badge rengi
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return 'Bilinmiyor';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
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
                <ImageIcon className="h-8 w-8 mr-3 text-indigo-600" />
                Fotoğraf Onayları
              </h1>
              <p className="text-gray-600 mt-2">
                Doktorların profil fotoğrafı değişiklik taleplerini yönetin
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="admin-btn admin-btn-primary"
              >
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl p-4 mb-6 border border-slate-600/30 hover:shadow-xl transition-all duration-300">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`admin-btn transition-all duration-300 ${
                  selectedStatus === status
                    ? 'admin-btn-primary'
                    : 'admin-btn-outline'
                }`}
              >
                {getStatusText(status)}
                {status === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="admin-card">
          {photoRequests.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {selectedStatus === 'pending' ? 'Bekleyen talep yok' : 'Talep bulunamadı'}
              </h3>
              <p className="text-gray-500">
                {selectedStatus === 'pending' 
                  ? 'Şu anda onay bekleyen fotoğraf talebi bulunmuyor.'
                  : 'Bu durumda fotoğraf talebi bulunmuyor.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {photoRequests.map((request) => (
                <div
                  key={request.id}
                  className="admin-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="admin-card-body">
                    <div className="flex items-start gap-4">
                      {/* Old Photo (at time of request) */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                          {request.old_photo ? (
                            <img
                              src={request.old_photo}
                              alt="Talep anındaki fotoğraf"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Eski</p>
                      </div>

                      {/* New Photo */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={request.file_url}
                            alt="Yeni fotoğraf"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Yeni</p>
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {request.title} {request.first_name} {request.last_name}
                            </h3>
                            <p className="text-gray-600 text-sm">{request.email}</p>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(request.created_at).toLocaleDateString('tr-TR')}
                              </div>
                              
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => openModal(request)}
                                  className="admin-btn admin-btn-sm admin-btn-secondary"
                                  title="Görüntüle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  disabled={reviewPhotoRequestMutation.isPending}
                                  className="admin-btn admin-btn-sm admin-btn-success"
                                  title="Onayla"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openModal(request)}
                                  className="admin-btn admin-btn-sm admin-btn-danger"
                                  title="Reddet"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-t border-slate-600/30 sm:px-6">
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
                  Toplam <span className="font-medium">{pagination.total}</span> talepten{' '}
                  <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> -{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  arası gösteriliyor
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
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

        {/* Modal */}
        <ModalContainer
          isOpen={showModal && Boolean(selectedRequest)}
          onClose={closeModal}
          title="Fotoğraf Talebi Detayı"
          size="medium"
          closeOnBackdrop={true}
          align="center"
          maxHeight="85vh"
          backdropClassName="bg-black/40 backdrop-blur-sm"
        >
          <div className="space-y-6 text-gray-200">
            {/* Doktor Bilgileri */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Doktor Bilgileri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-gray-400">Ad Soyad</span>
                  <p className="text-gray-100 text-base font-medium">{selectedRequest?.title} {selectedRequest?.first_name} {selectedRequest?.last_name}</p>
                </div>
                <div>
                  <span className="text-gray-400">E-posta</span>
                  <p className="text-gray-100 text-base font-medium">{selectedRequest?.email || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Talep Tarihi</span>
                  <p className="text-gray-100 text-base">{selectedRequest?.created_at ? new Date(selectedRequest.created_at).toLocaleString('tr-TR') : '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="block text-gray-400">Durum</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(selectedRequest?.status)}`}>
                    {getStatusText(selectedRequest?.status)}
                  </span>
                </div>
              </div>
            </section>

            {/* Fotoğraf Karşılaştırması */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Fotoğraf Karşılaştırması</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300">Mevcut Fotoğraf</h4>
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900/60 border border-white/10 flex items-center justify-center">
                    {selectedRequest?.old_photo ? (
                      <img
                        src={selectedRequest?.old_photo}
                        alt="Mevcut fotoğraf"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500 text-sm">
                        <User className="w-10 h-10 mx-auto mb-2 text-gray-500" />
                        Fotoğraf bulunamadı
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300">Yeni Fotoğraf</h4>
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900/60 border border-white/10 flex items-center justify-center">
                    <img
                      src={selectedRequest?.file_url}
                      alt="Yeni fotoğraf"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Red Nedeni (Editable) */}
            {selectedRequest?.status === 'pending' && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-100">Red Nedeni</label>
                  <span className="text-xs text-gray-400">Reddetmek için zorunlu</span>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Red nedeni yazın..."
                  className="w-full rounded-lg bg-slate-900/60 text-gray-100 placeholder-gray-500 border border-white/15 focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px] resize-none"
                  rows={4}
                />
              </section>
            )}

            {/* Kayıtlı Red Nedeni (Read-only) */}
            {selectedRequest?.status === 'rejected' && selectedRequest?.reason && (
              <section className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-200 mb-1">Kaydedilmiş Red Nedeni</h4>
                    <p className="text-red-100 text-sm whitespace-pre-wrap">{selectedRequest?.reason}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Footer */}
            {selectedRequest && selectedRequest?.status === 'pending' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
                <button
                  onClick={() => selectedRequest?.id && handleReject(selectedRequest.id)}
                  disabled={reviewPhotoRequestMutation.isPending || !rejectReason.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Reddet
                </button>
                <button
                  onClick={() => selectedRequest?.id && handleApprove(selectedRequest.id)}
                  disabled={reviewPhotoRequestMutation.isPending}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Onayla
                </button>
              </div>
            )}
          </div>
        </ModalContainer>
      </div>
    </div>
  );
};

export default PhotoApprovalsPage;
