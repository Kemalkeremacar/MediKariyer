/**
 * Hospital Jobs Sayfası
 * 
 * Doctor Jobs pattern'ini takip eden modern hastane iş ilanı yönetimi
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - İş ilanları listesi ve filtreleme
 * - Yeni iş ilanı oluşturma
 * - İş ilanı düzenleme ve silme
 * - İş ilanı durumu yönetimi
 * - Başvuru sayıları gösterimi
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0
 * @since 2024
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Plus, Edit3, Trash2, Eye, 
  MapPin, Calendar, Users, Clock, CheckCircle, X, 
  AlertCircle, Target, Building, ArrowRight, RefreshCw, Filter
} from 'lucide-react';
import { useHospitalJobs, useCreateHospitalJob, useUpdateHospitalJob, useDeleteHospitalJob, useHospitalProfile } from '../api/useHospital';
import { useJobStatuses, useSpecialties, useSubspecialties } from '@/hooks/useLookup';
import { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';

const HospitalJobs = () => {
  // State management
  const [statusFilter, setStatusFilter] = useState(''); // Status filtresi
  const [specialtyId, setSpecialtyId] = useState(''); // Uzmanlık filtresi
  const [subspecialtyId, setSubspecialtyId] = useState(''); // Yan dal uzmanlığı filtresi
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20
  });

  // UI Store kaldırıldı: onaylar showToast.confirm ile yönetilecek

  // API hook'ları
  const { 
    data: jobsData, 
    isLoading: jobsLoading, 
    error: jobsError,
    refetch: refetchJobs
  } = useHospitalJobs({ 
    ...pagination, 
    status: statusFilter,
    specialty_id: specialtyId ? parseInt(specialtyId, 10) : undefined,
    subspecialty_id: subspecialtyId ? parseInt(subspecialtyId, 10) : undefined
  });
  
  const { data: profileData } = useHospitalProfile();
  
  const { data: jobStatuses, isLoading: jobStatusesLoading } = useJobStatuses();
  const { data: specialties } = useSpecialties();
  const { data: subspecialties } = useSubspecialties(specialtyId ? parseInt(specialtyId, 10) : null);
  
  // Ana dal değiştiğinde yan dal'ı sıfırla
  useEffect(() => {
    if (specialtyId && subspecialtyId) {
      // Yan dal'ın seçili ana dala ait olup olmadığını kontrol et
      const isValidSubspecialty = subspecialties?.some(sub => sub.id === parseInt(subspecialtyId, 10));
      if (!isValidSubspecialty) {
        setSubspecialtyId('');
      }
    } else if (!specialtyId) {
      setSubspecialtyId('');
    }
  }, [specialtyId, subspecialtyId, subspecialties]);
  
  // Filtre değiştiğinde sayfa 1'e dön
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter, specialtyId, subspecialtyId]);
  
  // Filtrelenmiş yan dallar
  const filteredSubspecialties = useMemo(() => {
    if (!specialtyId || !subspecialties?.length) return [];
    return subspecialties.filter(sub => sub.specialty_id === parseInt(specialtyId, 10));
  }, [specialtyId, subspecialties]);
  
  // Aktif filtre sayısı
  const activeFiltersCount = [statusFilter, specialtyId, subspecialtyId].filter(Boolean).length;
  
  // Filtreleri temizle
  const clearFilters = () => {
    setStatusFilter('');
    setSpecialtyId('');
    setSubspecialtyId('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Fallback: Eğer jobStatuses lookup'tan gelmezse manuel tanımla (Taslak kaldırıldı)
  const statusOptions = jobStatuses?.length > 0 ? jobStatuses : [
    { value: 1, label: 'Aktif', name: 'Aktif' },
    { value: 2, label: 'Pasif', name: 'Pasif' }
  ];

  const createJobMutation = useCreateHospitalJob();
  const updateJobMutation = useUpdateHospitalJob();
  const deleteJobMutation = useDeleteHospitalJob();

  // Veri parsing
  const jobs = jobsData?.data?.jobs || [];
  const paginationData = jobsData?.data?.pagination || {};

  // Job actions
  const handleDeleteJob = async (jobId, jobTitle) => {
    const ok = await showToast.confirm({
      title: 'İş İlanını Sil',
      message: `"${jobTitle}" iş ilanını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ilanla ilgili tüm başvurular da silinecektir.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
      destructive: true
    });
    if (ok) {
      await confirmDeleteJob(jobId);
    }
  };

  const confirmDeleteJob = async (jobId) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      showToast.success('İş ilanı başarıyla silindi');
    } catch (error) {
      console.error('İş ilanı silme hatası:', error);
      showToast.error('İş ilanı silinirken hata oluştu');
    }
  };


  // Status badge component
  const StatusBadge = ({ status }) => {
    // Database'deki status name'lere göre mapping (Taslak kaldırıldı)
    const statusConfig = {
      'Aktif': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: '✓' },
      'Pasif': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: '⏸' }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1`}>
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  // Loading state
  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} className="h-64 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (jobsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">İş İlanları Yüklenemedi</h2>
            <p className="text-gray-300 mb-6">{jobsError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => refetchJobs()} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profil verilerini al
  const profile = profileData?.data?.profile;
  const institutionName = profile?.institution_name || 'Hastaneniz';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Metin ve Buton */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">İş İlanları</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-blue-400 mb-4">
                      İlan Yönetimi ve Yayınlama
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      İş ilanlarınızı oluşturun, yönetin ve nitelikli doktorlara ulaşın.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/hospital/jobs/new"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
                    >
                      <Plus className="w-5 h-5" />
                      Yeni İlan Oluştur
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtreler
              </h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  İlan Durumu
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <option value="" className="bg-slate-800">Tüm İlanlar</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.label} className="bg-slate-800">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ana Dal
                </label>
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <option value="" className="bg-slate-800">Tüm Ana Dallar</option>
                  {specialties?.map((specialty) => (
                    <option key={specialty.id} value={specialty.id} className="bg-slate-800">
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subspecialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Yan Dal
                </label>
                <select
                  value={subspecialtyId}
                  onChange={(e) => setSubspecialtyId(e.target.value)}
                  disabled={!specialtyId}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-slate-800">Tüm Yan Dallar</option>
                  {filteredSubspecialties.map((subspecialty) => (
                    <option key={subspecialty.id} value={subspecialty.id} className="bg-slate-800">
                      {subspecialty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {statusFilter && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
                    <span>Durum: {statusFilter}</span>
                    <button
                      onClick={() => setStatusFilter('')}
                      className="hover:text-green-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {specialtyId && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                    <span>Ana Dal: {specialties?.find(s => s.id === parseInt(specialtyId, 10))?.name}</span>
                    <button
                      onClick={() => setSpecialtyId('')}
                      className="hover:text-purple-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {subspecialtyId && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-sm">
                    <span>Yan Dal: {filteredSubspecialties.find(s => s.id === parseInt(subspecialtyId, 10))?.name}</span>
                    <button
                      onClick={() => setSubspecialtyId('')}
                      className="hover:text-pink-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              {paginationData.total || 0} iş ilanı bulundu
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sayfa:</span>
              <span className="text-white font-medium">
                {paginationData.page || 1} / {paginationData.pages || 1}
              </span>
            </div>
          </div>

          {/* Jobs Grid */}
          {jobs.length > 0 ? (
            <div className="flex flex-col gap-6">
              {jobs.map((job, index) => (
                <StaggeredAnimation key={job.id} delay={index * 50}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 p-6 group flex flex-row items-stretch gap-6">
                    {/* Left Section - Job Info */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <StatusBadge status={job.status} />
                            <span className="text-sm text-gray-400">
                              {job.application_count || 0} başvuru
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-2 text-gray-300">
                          <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm break-words block">{job.specialty}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2 text-gray-300">
                          <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-blue-200 break-words block">
                              {job.subspecialty_name || '-'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-sm">
                            İlan Tarihi: {new Date(job.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0 border-l border-white/10 pl-6">
                      <div className="flex gap-2">
                        <Link
                          to={`/hospital/jobs/${job.id}`}
                          className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300 flex-shrink-0"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <Link
                          to={`/hospital/jobs/${job.id}/edit`}
                          className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-2 rounded-lg hover:bg-yellow-500/30 transition-all duration-300 flex-shrink-0"
                          title="Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex-shrink-0"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        to={`/hospital/applications?jobId=${job.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 group flex-shrink-0 whitespace-nowrap"
                      >
                        Başvurular
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </StaggeredAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Henüz İş İlanı Yok
              </h3>
              <p className="text-gray-300 mb-8">
                İlk iş ilanınızı oluşturarak başlayın ve nitelikli doktorlara ulaşın.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/hospital/jobs/new"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <Plus className="w-5 h-5" />
                  İlk İş İlanını Oluştur
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {paginationData.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                Önceki
              </button>
              
              {Array.from({ length: paginationData.pages }, (_, i) => {
                const page = i + 1;
                const isCurrentPage = page === pagination.page;
                const shouldShow = 
                  page === 1 || 
                  page === paginationData.pages || 
                  Math.abs(page - pagination.page) <= 2;

                if (!shouldShow) {
                  if (page === 2 && pagination.page > 4) {
                    return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                  }
                  if (page === paginationData.pages - 1 && pagination.page < paginationData.pages - 3) {
                    return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-4 py-2 text-sm font-medium rounded-xl backdrop-blur-sm ${
                      isCurrentPage
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-gray-300 bg-white/10 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= paginationData.pages}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>

        {/* ConfirmationModal global olarak App.jsx içinde render ediliyor */}
    </div>
  );
};

export default HospitalJobs;
