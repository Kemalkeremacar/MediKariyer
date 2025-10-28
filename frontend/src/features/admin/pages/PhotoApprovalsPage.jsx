/**
 * @file PhotoApprovalsPage.jsx
 * @description Admin fotoğraf onay sayfası
 * Doktorların fotoğraf değişiklik taleplerini onaylar/reddeder
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
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
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const PhotoApprovalsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // API hooks
  const { data: photoRequestsData, isLoading, refetch } = usePhotoRequests({ 
    status: selectedStatus,
    page: 1,
    limit: 50
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
  const pagination = photoRequestsData?.data?.pagination;
  
  // Bekleyen taleplerin sayısı
  const pendingCount = pendingRequestsData?.data?.pagination?.total || 0;

  // Fotoğraf talebini onayla
  const handleApprove = async (requestId) => {
    try {
      await reviewPhotoRequestMutation.mutateAsync({
        requestId,
        action: 'approve'
      });
      setShowModal(false);
      setSelectedRequest(null);
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
      setShowModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  // Modal aç
  const openModal = (request) => {
    setSelectedRequest(request);
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

        {/* Modal */}
        {showModal && selectedRequest && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
            onClick={closeModal}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Sabit */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-2xl font-bold text-gray-900">Fotoğraf Talebi Detayı</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-6">
                {/* Doctor Info */}
                <div className="admin-card">
                  <div className="admin-card-body">
                    <h3 className="font-semibold text-gray-900 mb-2">Doktor Bilgileri</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ad Soyad:</span>
                        <p className="text-gray-900">{selectedRequest.title} {selectedRequest.first_name} {selectedRequest.last_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">E-posta:</span>
                        <p className="text-gray-900">{selectedRequest.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Talep Tarihi:</span>
                        <p className="text-gray-900">{new Date(selectedRequest.created_at).toLocaleString('tr-TR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Durum:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(selectedRequest.status)}`}>
                          {getStatusText(selectedRequest.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos Comparison */}
                <div className="admin-card">
                  <div className="admin-card-body">
                    <h3 className="font-semibold text-gray-900 mb-4">Fotoğraf Karşılaştırması</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Eski Fotoğraf (Talep Anındaki)</h4>
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                          {selectedRequest.old_photo ? (
                            <img
                              src={selectedRequest.old_photo}
                              alt="Talep anındaki fotoğraf"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Yeni Fotoğraf</h4>
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                          <img
                            src={selectedRequest.file_url}
                            alt="Yeni fotoğraf"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reject Reason Input */}
                {selectedRequest.status === 'pending' && (
                  <div className="admin-card">
                    <div className="admin-card-body">
                      <label className="admin-form-label">
                        Red Nedeni (Reddetmek için)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Red nedeni yazın..."
                        className="admin-form-textarea"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {rejectReason.length > 0 ? `${rejectReason.length} karakter` : 'Reddetmek için neden yazın'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejection Reason Display */}
                {selectedRequest.status === 'rejected' && selectedRequest.reason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Red Nedeni</h4>
                        <p className="text-red-700 text-sm">{selectedRequest.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Sabit (eğer pending ise) */}
              {selectedRequest.status === 'pending' && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={reviewPhotoRequestMutation.isPending || !rejectReason.trim()}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      Reddet
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={reviewPhotoRequestMutation.isPending}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Onayla
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoApprovalsPage;
