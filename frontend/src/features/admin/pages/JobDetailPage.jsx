/**
 * Admin Job Detail Page
 * 
 * İş ilanı detay sayfası - Admin için tüm hastanelerin iş ilanlarını görüntüleme
 * Hospital JobDetailPage'in aynısı, tek fark: Admin tüm hastanelerin ilanlarını görebilir
 * Backend adminService.getJobDetails ile tam entegrasyon
 * 
 * Özellikler:
 * - İş ilanı detayları görüntüleme
 * - Başvuru sayısı ve listesi
 * - İlan düzenleme (modal) ve silme işlemleri
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0 - Admin Edition
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Edit3, Trash2, Users, MapPin, Calendar, 
  Clock, Target, AlertCircle, ArrowLeft, CheckCircle, Building, X,
  Hourglass, RefreshCw, XCircle, History, FileText, Settings
} from 'lucide-react';
import { useJobById, useDeleteJob, useUpdateJobStatus, useApproveJob, useRequestRevision, useRejectJob, useJobHistory } from '../api/useAdmin';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';
import { showToast } from '@/utils/toastUtils';

const AdminJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // API hooks - Admin API kullanır (tüm hastanelerin ilanlarına erişir)
  const { 
    data: jobData, 
    isLoading: jobLoading, 
    error: jobError,
    refetch: refetchJob
  } = useJobById(id);

  const deleteJobMutation = useDeleteJob();
  const updateStatusMutation = useUpdateJobStatus();
  const approveJobMutation = useApproveJob();
  const requestRevisionMutation = useRequestRevision();
  const rejectJobMutation = useRejectJob();
  const { data: historyData } = useJobHistory(id);

  // Veri parsing - Backend response: { data: { data: { job: {...} } } }
  const job = jobData?.data?.data?.job || jobData?.data?.job || jobData?.data || null;
  const history = historyData?.data?.history || [];

  // Job actions
  const handleDeleteJob = async () => {
    const confirmed = await showToast.confirm(
      'İş İlanını Sil',
      `"${job.title}" iş ilanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      {
        confirmText: 'Sil',
        cancelText: 'İptal',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        await deleteJobMutation.mutateAsync(id);
        showToast.success('İş ilanı başarıyla silindi');
          navigate('/admin/jobs');
      } catch (error) {
        console.error('İş ilanı silme hatası:', error);
      }
    }
  };

  // Approve job handler
  const handleApproveJob = async () => {
    try {
      await approveJobMutation.mutateAsync(id);
      setShowApprovalModal(false);
      refetchJob();
    } catch (error) {
      console.error('Approve job error:', error);
    }
  };

  // Request revision handler
  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      showToast.error('Revizyon notu zorunludur');
      return;
    }
    try {
      await requestRevisionMutation.mutateAsync({ jobId: id, revision_note: revisionNote });
      setShowRevisionModal(false);
      setRevisionNote('');
      refetchJob();
    } catch (error) {
      console.error('Request revision error:', error);
    }
  };

  // Reject job handler
  const handleRejectJob = async () => {
    try {
      await rejectJobMutation.mutateAsync({ jobId: id, rejection_reason: rejectionReason });
      setShowRejectModal(false);
      setRejectionReason('');
      refetchJob();
    } catch (error) {
      console.error('Reject job error:', error);
    }
  };

  // Status change handler - Direct status update
  const handleStatusChange = async (newStatusId) => {
    try {
      await updateStatusMutation.mutateAsync({ jobId: id, status_id: newStatusId });
      refetchJob();
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  // Status badge component - Türkçe status'lar için güncellendi
  const StatusBadge = ({ status, statusId }) => {
    // Artık backend'den Türkçe geliyor, çeviri gereksiz
    const statusConfig = {
      'Onay Bekliyor': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Hourglass },
      'Revizyon Gerekli': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: RefreshCw },
      'Onaylandı': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Pasif': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Clock },
      'Reddedildi': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle },
      // Geriye uyumluluk için eski İngilizce isimler
      'Pending Approval': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Hourglass },
      'Needs Revision': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: RefreshCw },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Passive': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Clock },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];
    const IconComponent = config.icon;

    return (
      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-2`}>
        <IconComponent className="w-4 h-4" />
        {status}
      </span>
    );
  };

  // Status isimlerini Türkçe'ye çevir (paylaşılan fonksiyon) - Artık backend'den Türkçe geliyor ama geriye uyumluluk için
  const getTurkishStatusName = (statusName) => {
    // Artık backend'den Türkçe geliyor, çeviri gereksiz ama eski veriler için fallback
    if (!statusName) return 'Bilinmiyor';
    // Eğer zaten Türkçe ise direkt döndür
    const turkishStatuses = ['Onay Bekliyor', 'Revizyon Gerekli', 'Onaylandı', 'Pasif', 'Reddedildi'];
    if (turkishStatuses.includes(statusName)) {
      return statusName;
    }
    // Eski İngilizce isimler için çeviri
    const statusMap = {
      'Pending Approval': 'Onay Bekliyor',
      'Needs Revision': 'Revizyon Gerekli',
      'Approved': 'Onaylandı',
      'Passive': 'Pasif',
      'Rejected': 'Reddedildi',
      // Eski status'lar için geriye uyumluluk
      'Aktif': 'Onaylandı',
      'Pasif': 'Pasif'
    };
    return statusMap[statusName] || statusName;
  };

  // Edit Modal Component - Manuel durum seçimi için
  const EditModal = () => {
    if (!showEditModal) return null;

    // Viewport pozisyonu için scroll pozisyonunu koru
    useEffect(() => {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }, []);

    const statusOptions = [
      { id: 1, name: 'Onay Bekliyor', description: 'Admin onayı bekliyor', color: 'yellow', icon: Hourglass },
      { id: 2, name: 'Revizyon Gerekli', description: 'Revizyon talebi var', color: 'orange', icon: RefreshCw },
      { id: 3, name: 'Onaylandı', description: 'Onaylandı ve yayında', color: 'green', icon: CheckCircle },
      { id: 4, name: 'Pasif', description: 'Yayından kaldırıldı', color: 'gray', icon: Clock },
      { id: 5, name: 'Reddedildi', description: 'Tamamen reddedildi', color: 'red', icon: XCircle },
    ];

    return (
      <ModalContainer
        isOpen={true}
        onClose={() => setShowEditModal(false)}
        title="İlan Durumunu Değiştir"
        size="large"
        maxHeight="90vh"
        closeOnBackdrop={true}
        align="auto"
        fullScreenOnMobile
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-900 font-medium mb-1">Mevcut Durum: {getTurkishStatusName(job?.status)}</p>
                <p className="text-blue-700 text-sm">Aşağıdan yeni durumu seçin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusOptions.map((status) => {
              if (status.id === job?.status_id) return null; // Mevcut durumu gösterme
              
              const colorClasses = {
                yellow: 'from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600',
                orange: 'from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600',
                green: 'from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
                gray: 'from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600',
                red: 'from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600',
              };

              const IconComponent = status.icon;

              return (
                <button
                  key={status.id}
                  onClick={async () => {
                    // Özel durumlar için modal aç
                    if (status.id === 3 && job?.status_id === 1) {
                      setShowEditModal(false);
                      setShowApprovalModal(true);
                      return;
                    }
                    if (status.id === 2 && job?.status_id === 1) {
                      setShowEditModal(false);
                      setShowRevisionModal(true);
                      return;
                    }
                    if (status.id === 5 && (job?.status_id === 1 || job?.status_id === 2)) {
                      setShowEditModal(false);
                      setShowRejectModal(true);
                      return;
                    }
                    // Diğer durumlar için direkt değiştir
                    await handleStatusChange(status.id);
                    setShowEditModal(false);
                  }}
                  className={`bg-gradient-to-br ${colorClasses[status.color]} text-white p-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">{status.name}</div>
                      <div className="text-sm text-white/90">{status.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ModalContainer>
    );
  };

  // Loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-lg mb-6" />
          <SkeletonLoader className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (jobError) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İş İlanı Yüklenemedi</h2>
              <p className="text-gray-600 mb-6">{jobError.message || 'Bir hata oluştu'}</p>
              <Link
                to="/admin/jobs"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İş İlanı Bulunamadı</h2>
              <p className="text-gray-600 mb-6">Aradığınız iş ilanı bulunamadı veya silinmiş olabilir.</p>
              <Link
                to="/admin/jobs"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </Link>
            </div>
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
            <div className="flex items-center gap-4">
              <Link
                to="/admin/jobs"
                className="flex items-center px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="h-8 w-8 mr-3 text-indigo-600" />
                  İş İlanı Detayı
                </h1>
                <p className="text-gray-600 mt-1">İş ilanı bilgilerini görüntüleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteJob}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                disabled={deleteJobMutation.isPending}
                title="İş ilanını kalıcı olarak siler (deleted_at set eder)"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </button>
            </div>
          </div>
        </div>

        {/* Job Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h2>
              <div className="flex items-center gap-4 mb-4">
                <StatusBadge status={job.status} statusId={job.status_id} />
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {job.application_count || 0} Başvuru
                </span>
                {job.approved_at && (
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Onaylandı: {new Date(job.approved_at).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          </div>


          {/* Job Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hastane Adı - Admin için ek bilgi */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-600 text-sm">Hastane</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">{job.institution_name || 'Belirtilmemiş'}</p>
            </div>

            {/* Uzmanlık */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-600 text-sm">Uzmanlık Alanı</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">{job.specialty || 'Belirtilmemiş'}</p>
              {job.subspecialty_name && (
                <p className="text-blue-600 text-sm mt-1">Yan Dal: {job.subspecialty_name}</p>
              )}
            </div>
            
            {/* Şehir */}
            {job.city && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Şehir</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{job.city}</p>
              </div>
            )}

            {/* İstihdam Türü */}
            {job.employment_type && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-600 text-sm">İstihdam Türü</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{job.employment_type}</p>
              </div>
            )}

            {/* Minimum Deneyim */}
            {job.min_experience_years !== null && job.min_experience_years !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Minimum Deneyim</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{job.min_experience_years} Yıl</p>
              </div>
            )}

            {/* Oluşturulma Tarihi */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-gray-600 text-sm">Oluşturulma Tarihi</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">
                {new Date(job.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* İş Tanımı */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              İş Tanımı
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description || 'İş tanımı belirtilmemiş.'}</p>
          </div>

          {/* İlan Durumu Yönetimi - Ayrı Bölüm */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  İlan Durumu Yönetimi
                </h3>
                <p className="text-gray-600 mt-2">İlanın durumunu görüntüleyin ve yönetin</p>
              </div>
            </div>

            {/* Mevcut Durum Kartı */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Mevcut Durum</label>
              <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={job.status} statusId={job.status_id} />
                    <div className="text-sm text-gray-600">
                      {job.status_id === 1 && 'İlan admin onayı bekliyor'}
                      {job.status_id === 2 && 'Revizyon yapılması gerekiyor'}
                      {job.status_id === 3 && 'İlan onaylandı ve yayında'}
                      {job.status_id === 4 && 'İlan pasif durumda'}
                      {job.status_id === 5 && 'İlan reddedildi'}
                    </div>
                  </div>
                  {job.approved_at && (
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Onay: {new Date(job.approved_at).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Durum Değiştirme Bölümü */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Durum Değiştir</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pending Approval → Approved */}
                {job.status_id === 1 && (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Onayla</div>
                        <div className="text-sm text-green-100">İlanı onayla ve yayına al</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Pending Approval → Needs Revision */}
                {job.status_id === 1 && (
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-5 rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Revizyon İste</div>
                        <div className="text-sm text-orange-100">Revizyon notu ile geri gönder</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Pending Approval → Rejected */}
                {job.status_id === 1 && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Reddet</div>
                        <div className="text-sm text-red-100">İlanı tamamen reddet</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Needs Revision → Approved */}
                {job.status_id === 2 && (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Onayla</div>
                        <div className="text-sm text-green-100">Revizyonu onayla ve yayına al</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Needs Revision → Rejected */}
                {job.status_id === 2 && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Reddet</div>
                        <div className="text-sm text-red-100">Revizyonu yetersiz bul ve reddet</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Approved → Passive */}
                {job.status_id === 3 && (
                  <button
                    onClick={() => handleStatusChange(4)}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gradient-to-br from-gray-500 to-slate-600 text-white p-5 rounded-xl hover:from-gray-600 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Pasif Yap</div>
                        <div className="text-sm text-gray-100">İlanı yayından kaldır</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Passive → Approved */}
                {job.status_id === 4 && (
                  <button
                    onClick={() => handleStatusChange(3)}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Yayına Al</div>
                        <div className="text-sm text-green-100">İlanı tekrar aktif et</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Rejected → Pending Approval (Tekrar gözden geçirme) */}
                {job.status_id === 5 && (
                  <button
                    onClick={() => handleStatusChange(1)}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Hourglass className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Tekrar İncele</div>
                        <div className="text-sm text-blue-100">İlanı yeniden onay sürecine al</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Generic Status Change Button - Manual Status Selection */}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group border-2 border-indigo-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Manuel Durum Değiştir</div>
                      <div className="text-sm text-indigo-100">Tüm durumları görüntüle</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Revizyon Notu Bilgisi */}
            {job.status_id === 2 && job.revision_note && (
              <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Revizyon Notu
                    </h4>
                    <p className="text-orange-800 whitespace-pre-wrap leading-relaxed">{job.revision_note}</p>
                    {job.revision_count > 0 && (
                      <p className="text-sm text-orange-600 mt-2 font-medium">
                        🔄 Revizyon Sayısı: {job.revision_count}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job History Timeline */}
          {history.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                İlan Geçmişi
              </h3>
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-400'}`} />
                      {index < history.length - 1 && <div className="w-0.5 h-full bg-gray-300 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getTurkishStatusName(entry.old_status_name) || 'Başlangıç'} → {getTurkishStatusName(entry.new_status_name)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.changed_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {entry.changed_by_role === 'admin' ? 'Admin' : 'Hastane'} tarafından değiştirildi
                      </p>
                      {entry.note && (
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 mt-2">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <ModalContainer
            isOpen={true}
            onClose={() => setShowApprovalModal(false)}
            title="İlanı Onayla"
            size="medium"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                "{job.title}" ilanını onaylamak istediğinizden emin misiniz? İlan onaylandıktan sonra yayına girecek ve doktorlar tarafından görülebilecek.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleApproveJob}
                  disabled={approveJobMutation.isPending}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {approveJobMutation.isPending ? 'Onaylanıyor...' : 'Onayla'}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}

        {/* Revision Modal */}
        {showRevisionModal && (
          <ModalContainer
            isOpen={true}
            onClose={() => {
              setShowRevisionModal(false);
              setRevisionNote('');
            }}
            title={job?.status_id === 2 ? 'Revizyon Notu' : 'Revizyon Talep Et'}
            size="large"
          >
            <div className="space-y-4">
              {job?.status_id === 2 ? (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-800 whitespace-pre-wrap">{job.revision_note}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    "{job.title}" ilanı için revizyon talep ediyorsunuz. Lütfen revizyon notunu girin:
                  </p>
                  <textarea
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="Revizyon notunu buraya yazın..."
                    className="w-full min-h-[150px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    required
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowRevisionModal(false);
                        setRevisionNote('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleRequestRevision}
                      disabled={requestRevisionMutation.isPending || !revisionNote.trim()}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {requestRevisionMutation.isPending ? 'Gönderiliyor...' : 'Revizyon İste'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </ModalContainer>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <ModalContainer
            isOpen={true}
            onClose={() => {
              setShowRejectModal(false);
              setRejectionReason('');
            }}
            title="İlanı Reddet"
            size="medium"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                "{job.title}" ilanını reddetmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Red Sebebi (Opsiyonel)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Red sebebini buraya yazın..."
                  className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleRejectJob}
                  disabled={rejectJobMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {rejectJobMutation.isPending ? 'Reddediliyor...' : 'Reddet'}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}

        {/* Edit Modal */}
        <EditModal />
      </div>
    </div>
  );
};

export default AdminJobDetailPage;
