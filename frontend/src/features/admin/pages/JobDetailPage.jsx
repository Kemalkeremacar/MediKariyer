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

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Edit3, Trash2, Users, MapPin, Calendar, 
  Clock, Target, AlertCircle, ArrowLeft, CheckCircle, Building, X
} from 'lucide-react';
import { useJobById, useDeleteJob, useUpdateJobStatus } from '../api/useAdmin';
import TransitionWrapper from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
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
  
  // Debug: Gelen veriyi kontrol et
  console.log('🔍 Admin Job Detail - Raw Data:', jobData);
  console.log('📋 Parsed Job:', job);
  console.log('🎯 Specialty:', job?.specialty);
  console.log('🏙️ City:', job?.city);
  console.log('🏢 Institution:', job?.institution_name);

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
    const statusNames = { 1: 'Aktif', 2: 'Pasif', 3: 'Silinmiş' };
    
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
      'Aktif': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: CheckCircle },
      'Pasif': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: Clock },
      'Silinmiş': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];
    const IconComponent = config.icon;

    return (
      <span className={`px-4 py-2 rounded-xl text-sm font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-2`}>
        <IconComponent className="w-4 h-4" />
        {status}
      </span>
    );
  };

  // Edit Modal Component
  const EditModal = () => {
    if (!showEditModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">İş İlanı Durumunu Değiştir</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-gray-300 mb-6">İş ilanının durumunu seçin:</p>
            
            <button
              onClick={() => {
                handleStatusChange(1);
                setShowEditModal(false);
              }}
              className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Aktif Yap</span>
            </button>

            <button
              onClick={() => {
                handleStatusChange(2);
                setShowEditModal(false);
              }}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Pasif Yap</span>
            </button>

            <button
              onClick={() => {
                handleStatusChange(3);
                setShowEditModal(false);
              }}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Silinmiş Yap</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
            <SkeletonLoader className="h-96 bg-white/10 rounded-3xl" />
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  // Error state
  if (jobError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Yüklenemedi</h2>
              <p className="text-gray-300 mb-6">{jobError.message || 'Bir hata oluştu'}</p>
              <Link
                to="/admin/jobs"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </Link>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Bulunamadı</h2>
              <p className="text-gray-300 mb-6">Aradığınız iş ilanı bulunamadı veya silinmiş olabilir.</p>
              <Link
                to="/admin/jobs"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
          İş İlanlarına Dön
              </Link>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <TransitionWrapper>
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/jobs"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
                <div>
                <h1 className="text-3xl font-bold text-white">İş İlanı Detayı</h1>
                <p className="text-gray-300 mt-1">İş ilanı bilgilerini görüntüleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                onClick={() => setShowEditModal(true)}
                className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-4 py-3 rounded-xl hover:bg-yellow-500/30 transition-all duration-300 inline-flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Durum Değiştir
                      </button>
                      <button
                onClick={handleDeleteJob}
                className="bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-3 rounded-xl hover:bg-red-500/30 transition-all duration-300 inline-flex items-center gap-2"
                disabled={deleteJobMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Sil
                      </button>
            </div>
          </div>

          {/* Job Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 space-y-8">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">{job.title}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <StatusBadge status={job.status} />
                  <span className="text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {job.application_count || 0} Başvuru
                  </span>
              </div>
            </div>
          </div>

            {/* Job Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hastane Adı - Admin için ek bilgi */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Building className="w-5 h-5 text-purple-300" />
            </div>
                  <span className="text-gray-400 text-sm">Hastane</span>
          </div>
                <p className="text-white font-medium text-lg">{job.institution_name || 'Belirtilmemiş'}</p>
        </div>

              {/* Uzmanlık */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-gray-400 text-sm">Uzmanlık Alanı</span>
                          </div>
                <p className="text-white font-medium text-lg">{job.specialty || 'Belirtilmemiş'}</p>
                        </div>
                        
              {/* Şehir */}
              {job.city && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-300" />
                    </div>
                    <span className="text-gray-400 text-sm">Şehir</span>
                  </div>
                  <p className="text-white font-medium text-lg">{job.city}</p>
                </div>
              )}

              {/* İstihdam Türü */}
              {job.employment_type && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-300" />
                  </div>
                    <span className="text-gray-400 text-sm">İstihdam Türü</span>
                  </div>
                  <p className="text-white font-medium text-lg">{job.employment_type}</p>
                </div>
              )}

              {/* Minimum Deneyim */}
              {job.min_experience_years !== null && job.min_experience_years !== undefined && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-300" />
                    </div>
                    <span className="text-gray-400 text-sm">Minimum Deneyim</span>
                  </div>
                  <p className="text-white font-medium text-lg">{job.min_experience_years} Yıl</p>
            </div>
          )}

              {/* Oluşturulma Tarihi */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-300" />
              </div>
                  <span className="text-gray-400 text-sm">Oluşturulma Tarihi</span>
                </div>
                <p className="text-white font-medium text-lg">
                  {new Date(job.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* İş Tanımı */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                İş Tanımı
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description || 'İş tanımı belirtilmemiş.'}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Link
                to={`/admin/applications?jobId=${id}`}
                className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-6 py-3 rounded-xl hover:bg-blue-500/30 transition-all duration-300 inline-flex items-center gap-2 font-medium"
              >
                <Users className="w-5 h-5" />
                Başvuruları Görüntüle ({job.application_count || 0})
              </Link>
              <Link
                to="/admin/jobs"
                className="text-gray-300 hover:text-white transition-colors"
              >
                İş İlanlarına Dön
              </Link>
            </div>
          </div>
        </div>
      </TransitionWrapper>

      {/* Edit Modal */}
      <EditModal />
    </div>
  );
};

export default AdminJobDetailPage;
