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
  Clock, Target, AlertCircle, ArrowLeft, CheckCircle, Building, X
} from 'lucide-react';
import { useJobById, useDeleteJob, useUpdateJobStatus } from '../api/useAdmin';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';
import { showToast } from '@/utils/toastUtils';

const AdminJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  // API hooks - Admin API kullanır (tüm hastanelerin ilanlarına erişir)
  const { 
    data: jobData, 
    isLoading: jobLoading, 
    error: jobError,
    refetch: refetchJob
  } = useJobById(id);

  const deleteJobMutation = useDeleteJob();
  const updateStatusMutation = useUpdateJobStatus();

  // Veri parsing - Backend response: { data: { data: { job: {...} } } }
  const job = jobData?.data?.data?.job || jobData?.data?.job || jobData?.data || null;

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

  // Status update
  const handleStatusChange = async (statusId) => {
    const statusNames = { 1: 'Aktif', 2: 'Pasif' };
    
    try {
      await updateStatusMutation.mutateAsync({
        jobId: id,
        status_id: statusId,
        reason: 'Admin tarafından güncellendi'
      });
      showToast.success(`İş ilanı durumu "${statusNames[statusId]}" olarak güncellendi`);
      refetchJob();
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Aktif': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Pasif': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: Clock }
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

  // Edit Modal Component
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

    return (
      <ModalContainer
        isOpen={true}
        onClose={() => setShowEditModal(false)}
        title="İş İlanı Durumunu Değiştir"
        size="medium"
        maxHeight="90vh"
        closeOnBackdrop={true}
        align="auto"
        fullScreenOnMobile
      >
        <div className="space-y-6">
          <div className="text-gray-600 flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            <span>{job?.title} - {job?.hospital_name}</span>
          </div>
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Durum Seçimi
            </h3>
            <p className="text-gray-300 mb-6">İş ilanının durumunu seçin:</p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  handleStatusChange(1);
                  setShowEditModal(false);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-3 font-medium shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Aktif Yap</span>
              </button>
              <button
                onClick={() => {
                  handleStatusChange(2);
                  setShowEditModal(false);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-3 font-medium shadow-lg"
              >
                <Clock className="w-5 h-5" />
                <span>Pasif Yap</span>
              </button>
            </div>
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
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Durum Değiştir
              </button>
              <button
                onClick={handleDeleteJob}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                <StatusBadge status={job.status} />
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {job.application_count || 0} Başvuru
                </span>
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
        </div>

        {/* Edit Modal */}
        <EditModal />
      </div>
    </div>
  );
};

export default AdminJobDetailPage;
