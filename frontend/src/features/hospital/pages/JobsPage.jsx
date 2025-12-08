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

import React, { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, Plus, Edit3, Eye, 
  MapPin, Calendar, Users, Clock, CheckCircle, X, 
  AlertCircle, Target, Building, ArrowRight, RefreshCw, Filter,
  Hourglass, XCircle
} from 'lucide-react';
import { useHospitalJobs, useCreateHospitalJob, useUpdateHospitalJob, useHospitalProfile } from '../api/useHospital';
import { useJobStatuses, useSpecialties, useSubspecialties } from '@/hooks/useLookup';
import { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { formatDate } from '@/utils/dateUtils';

const hospitalPageWrapper = 'hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8';

const HospitalJobs = () => {
  const location = useLocation();
  // State management
  const [statusFilter, setStatusFilter] = useState(''); // Status filtresi
  const [specialtyId, setSpecialtyId] = useState(''); // Uzmanlık filtresi
  const [subspecialtyId, setSubspecialtyId] = useState(''); // Yan dal uzmanlığı filtresi
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20
  });

  const restoringRef = useRef(false);
  const pendingScrollRef = useRef(null);
  const modalScrollRef = useRef(null);

  // UI Store kaldırıldı: onaylar showToast.confirm ile yönetilecek

  const captureListScroll = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const current = window.scrollY || window.pageYOffset || 0;
    modalScrollRef.current = current;
    return current;
  }, []);

  const restoreListScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (modalScrollRef.current === null || modalScrollRef.current === undefined) return;
    const target = Number(modalScrollRef.current) || 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'auto' });
      setTimeout(() => {
        window.scrollTo({ top: target, behavior: 'auto' });
      }, 50);
      setTimeout(() => {
        window.scrollTo({ top: target, behavior: 'auto' });
      }, 120);
    });
  }, []);

  const storeListState = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const stateToSave = {
      scrollY,
      page: pagination.page,
      statusFilter,
      specialtyId,
      subspecialtyId,
    };
    try {
      sessionStorage.setItem('hospital_jobs_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('HospitalJobs: liste durumu kaydedilemedi', error);
    }
  }, [pagination.page, specialtyId, statusFilter, subspecialtyId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedRaw = sessionStorage.getItem('hospital_jobs_state');
    if (!savedRaw) return;
    try {
      const saved = JSON.parse(savedRaw);
      restoringRef.current = true;
      if (saved.statusFilter !== undefined) {
        setStatusFilter(saved.statusFilter);
      }
      if (saved.specialtyId !== undefined) {
        setSpecialtyId(saved.specialtyId);
      }
      if (saved.subspecialtyId !== undefined) {
        setSubspecialtyId(saved.subspecialtyId);
      }
      if (saved.page !== undefined) {
        setPagination(prev => ({ ...prev, page: Number(saved.page) || 1 }));
      }
      if (saved.scrollY !== undefined) {
        pendingScrollRef.current = Number(saved.scrollY) || 0;
      }
    } catch (error) {
      console.error('HospitalJobs: kayıtlı görünüm yüklenemedi', error);
    } finally {
      sessionStorage.removeItem('hospital_jobs_state');
      setTimeout(() => {
        restoringRef.current = false;
      }, 0);
    }
  }, []);

  // Lookup data hooks
  const { data: profileData } = useHospitalProfile();
  const { data: jobStatuses, isLoading: jobStatusesLoading } = useJobStatuses();
  const { data: specialties } = useSpecialties();
  const { data: subspecialties } = useSubspecialties(specialtyId ? parseInt(specialtyId, 10) : null);

  // Fallback: Eğer jobStatuses lookup'tan gelmezse manuel tanımla
  const statusOptions = useMemo(() => {
    return jobStatuses?.length > 0 ? jobStatuses.map(status => ({
      ...status,
      label: status.name // Artık backend'den Türkçe geliyor
    })) : [
      { value: 1, label: 'Onay Bekliyor', name: 'Onay Bekliyor' },
      { value: 2, label: 'Revizyon Gerekli', name: 'Revizyon Gerekli' },
      { value: 3, label: 'Onaylandı', name: 'Onaylandı' },
      { value: 4, label: 'Pasif', name: 'Pasif' },
      { value: 5, label: 'Reddedildi', name: 'Reddedildi' }
    ];
  }, [jobStatuses]);

  // Status filtresini status name'e çevir (backend status name bekliyor)
  const statusNameForApi = useMemo(() => {
    if (!statusFilter) return undefined;
    const statusOption = statusOptions.find(s => s.value.toString() === statusFilter.toString());
    return statusOption?.name || undefined;
  }, [statusFilter, statusOptions]);

  // API hook'ları
  const { 
    data: jobsData, 
    isLoading: jobsLoading, 
    error: jobsError,
    refetch: refetchJobs
  } = useHospitalJobs({ 
    ...pagination, 
    status: statusNameForApi,
    specialty_id: specialtyId ? parseInt(specialtyId, 10) : undefined,
    subspecialty_id: subspecialtyId ? parseInt(subspecialtyId, 10) : undefined
  });
  
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
    if (restoringRef.current) return;
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
  
  const createJobMutation = useCreateHospitalJob();
  const updateJobMutation = useUpdateHospitalJob();
  // Veri parsing
  const jobs = jobsData?.data?.jobs || [];
  const paginationData = jobsData?.data?.pagination || {};

  useEffect(() => {
    if (jobsLoading) return;
    if (pendingScrollRef.current === null || pendingScrollRef.current === undefined) return;
    const target = Number(pendingScrollRef.current) || 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'auto' });
      setTimeout(() => {
        window.scrollTo({ top: target, behavior: 'auto' });
      }, 50);
      setTimeout(() => {
        window.scrollTo({ top: target, behavior: 'auto' });
      }, 120);
    });
    pendingScrollRef.current = null;
  }, [jobsLoading, jobs.length]);

  // Status badge component - pastel renk paleti
  const StatusBadge = ({ status }) => {
    const normalized = status?.toString().trim().toLowerCase();
    const statusConfig = {
      'onay bekliyor': { classes: 'border border-amber-200 bg-amber-100 text-amber-800', icon: '⏳' },
      'pending approval': { classes: 'border border-amber-200 bg-amber-100 text-amber-800', icon: '⏳' },
      'revizyon gerekli': { classes: 'border border-orange-200 bg-orange-100 text-orange-800', icon: '🔄' },
      'needs revision': { classes: 'border border-orange-200 bg-orange-100 text-orange-800', icon: '🔄' },
      'onaylandı': { classes: 'border border-emerald-200 bg-emerald-100 text-emerald-800', icon: '✓' },
      'approved': { classes: 'border border-emerald-200 bg-emerald-100 text-emerald-800', icon: '✓' },
      'pasif': { classes: 'border border-gray-200 bg-gray-100 text-gray-700', icon: '⏸' },
      'passive': { classes: 'border border-gray-200 bg-gray-100 text-gray-700', icon: '⏸' },
      'reddedildi': { classes: 'border border-rose-200 bg-rose-100 text-rose-800', icon: '✗' },
      'rejected': { classes: 'border border-rose-200 bg-rose-100 text-rose-800', icon: '✗' },
      'taslak': { classes: 'border border-slate-200 bg-slate-100 text-slate-700', icon: '📝' },
      'draft': { classes: 'border border-slate-200 bg-slate-100 text-slate-700', icon: '📝' },
    };

    const config = statusConfig[normalized] || { classes: 'border border-gray-200 bg-gray-100 text-gray-700', icon: 'ℹ️' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.classes} inline-flex items-center justify-center gap-1 w-[140px]`}>
        <span className="flex-shrink-0">{config.icon}</span>
        <span className="text-center truncate">{status}</span>
      </span>
    );
  };

  // Loading state
  if (jobsLoading) {
    return (
      <div className={hospitalPageWrapper}>
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader className="h-12 w-80 bg-blue-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} className="h-64 bg-blue-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (jobsError) {
    return (
      <div className={hospitalPageWrapper}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-3xl p-8 border border-red-100 shadow-xl max-w-lg">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">İş İlanları Yüklenemedi</h2>
            <p className="text-gray-600 mb-6">{jobsError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => refetchJobs()} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hospital-keep-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
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
    <div className={hospitalPageWrapper}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 p-8 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex flex-1 flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">İş İlanları</h1>
                  <h2 className="mb-4 text-xl font-semibold text-cyan-700 md:text-2xl">
                    İlan Yönetimi ve Yayınlama
                  </h2>
                  <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                    İş ilanlarınızı oluşturun, yönetin ve nitelikli doktorlara ulaşın.
                  </p>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                  <Link
                    to="/hospital/jobs/new"
                    onClick={storeListState}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hospital-keep-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
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
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filtreler
            </h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                İlan Durumu
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Tüm İlanlar</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label || status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Ana Dal
              </label>
              <select
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Tüm Ana Dallar</option>
                {specialties?.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Yan Dal
              </label>
              <select
                value={subspecialtyId}
                onChange={(e) => setSubspecialtyId(e.target.value)}
                disabled={!specialtyId}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Tüm Yan Dallar</option>
                {filteredSubspecialties.map((subspecialty) => (
                  <option key={subspecialty.id} value={subspecialty.id}>
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
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border border-green-200 bg-green-50 text-green-700">
                  <span>Durum: {statusOptions.find(s => s.value.toString() === statusFilter.toString())?.label || statusFilter}</span>
                  <button
                    onClick={() => setStatusFilter('')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {specialtyId && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border border-purple-200 bg-purple-50 text-purple-700">
                  <span>Ana Dal: {specialties?.find(s => s.id === parseInt(specialtyId, 10))?.name}</span>
                  <button
                    onClick={() => setSpecialtyId('')}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {subspecialtyId && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border border-pink-200 bg-pink-50 text-pink-700">
                  <span>Yan Dal: {filteredSubspecialties.find(s => s.id === parseInt(subspecialtyId, 10))?.name}</span>
                  <button
                    onClick={() => setSubspecialtyId('')}
                    className="text-pink-600 hover:text-pink-800"
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
          <p className="text-gray-600">
            {paginationData.total || 0} iş ilanı bulundu
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sayfa:</span>
            <span className="text-gray-900 font-semibold">
              {paginationData.page || 1} / {paginationData.pages || 1}
            </span>
          </div>
        </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="flex flex-col gap-6">
            {jobs.map((job, index) => (
              <StaggeredAnimation key={job.id} delay={index * 50}>
                <div className="bg-white rounded-3xl border border-blue-100 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-6 group flex flex-row items-stretch gap-6">
                  {/* Left Section */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <StatusBadge status={job.status} statusId={job.status_id} />
                          <span className="text-sm text-gray-500">
                            {job.application_count || 0} başvuru
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-2 text-gray-600">
                        <Target className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm break-words block">{job.specialty}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-gray-600">
                        <Target className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-gray-700 break-words block">
                            {job.subspecialty_name || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">
                          İlan Tarihi: {formatDate(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-4 flex-shrink-0 border-l border-gray-100 pl-6">
                    <div className="flex gap-2">
                      <Link
                        to={`/hospital/jobs/${job.id}`}
                        onClick={storeListState}
                        state={{ from: location.pathname }}
                        className="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {job.status_id === 2 && (
                        <Link
                          to={`/hospital/jobs/${job.id}/edit`}
                          onClick={storeListState}
                          state={{ from: location.pathname }}
                          className="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 border-amber-200 text-amber-600 hover:bg-amber-50"
                          title="Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    <Link
                      to={`/hospital/applications?jobIds=${job.id}`}
                      onClick={storeListState}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 group flex-shrink-0 whitespace-nowrap"
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
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Briefcase className="w-12 h-12 text-white hospital-keep-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Henüz İş İlanı Yok
            </h3>
            <p className="text-gray-600 mb-8">
              İlk iş ilanınızı oluşturarak başlayın ve nitelikli doktorlara ulaşın.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/hospital/jobs/new"
                onClick={storeListState}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hospital-keep-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
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
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={paginationData.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Sayfalama Component (Memoized)
const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  const handlePrev = useCallback(() => {
    onPageChange(Math.max(1, currentPage - 1));
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages, onPageChange]);

  const handlePage = useCallback((page) => {
    onPageChange(page);
  }, [onPageChange]);

  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Önceki
      </button>
      
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        const isCurrentPage = page === currentPage;
        const shouldShow = 
          page === 1 || 
          page === totalPages || 
          Math.abs(page - currentPage) <= 2;

        if (!shouldShow) {
          if (page === 2 && currentPage > 4) {
            return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
          }
          if (page === totalPages - 1 && currentPage < totalPages - 3) {
            return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
          }
          return null;
        }

        return (
          <button
            key={page}
            onClick={() => handlePage(page)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              isCurrentPage
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hospital-keep-white shadow-md'
                : 'text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sonraki
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default HospitalJobs;


