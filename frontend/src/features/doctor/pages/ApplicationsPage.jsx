/**
 * Doktor Başvurularım Sayfası
 * 
 * Doktorların yaptığı başvuruları görüntüleyebileceği sayfa
 * Modern dark theme ile ProfilePage ile tutarlı tasarım
 * 
 * Özellikler:
 * - Başvuru listesi ve modern filtreleme
 * - Başvuru detay görüntüleme
 * - Başvuru geri çekme
 * - Durum takibi
 * - Glassmorphism dark theme
 */

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Building, MapPin, Calendar, Clock, 
  CheckCircle, XCircle, AlertCircle, Eye,
  X, Filter, XCircle as XIcon
} from 'lucide-react';
import { useMyApplications, useWithdrawApplication } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useLookup } from '../../../hooks/useLookup';

const DoctorApplicationsPage = () => {
  const navigate = useNavigate();
  
  // Filtre state'leri
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Lookup data
  const { data: lookupData, isLoading: lookupLoading } = useLookup();
  const cities = lookupData?.cities || [];

  // Filtrelenmiş başvurular için API çağrısı
  const { data: applicationsData, isLoading: applicationsLoading, refetch: refetchApplications } = useMyApplications({
    status: statusFilter || undefined,
    city: cityFilter || undefined,
    page: currentPage,
    limit: 12
  });

  const withdrawMutation = useWithdrawApplication();
  const lastScrollPositionRef = useRef(null);

  const captureScrollPosition = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const currentScroll = window.scrollY || window.pageYOffset || 0;
    lastScrollPositionRef.current = currentScroll;
    return currentScroll;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const targetScroll = lastScrollPositionRef.current;
    if (targetScroll === null || targetScroll === undefined) return;
    const scrollToTarget = () => {
      window.scrollTo({
        top: targetScroll,
        behavior: 'auto'
      });
    };
    requestAnimationFrame(() => {
      scrollToTarget();
      setTimeout(scrollToTarget, 50);
      setTimeout(scrollToTarget, 120);
    });
  }, []);

  const applications = applicationsData?.applications || [];
  const pagination = applicationsData?.pagination || {};
  
  // Sayfa numarasını ve scroll pozisyonunu geri yükle (sadece sayfa ilk yüklendiğinde veya geri gelindiğinde)
  const hasRestoredPageRef = useRef(false);
  useEffect(() => {
    // Sadece bir kez kontrol et (component mount olduğunda)
    if (hasRestoredPageRef.current) return;
    
    const savedPage = sessionStorage.getItem('applicationsPageCurrentPage');
    const savedScrollPosition = sessionStorage.getItem('applicationsPageScrollPosition');
    
    // Önce sayfa numarasını geri yükle
    if (savedPage) {
      const pageNum = parseInt(savedPage, 10);
      if (pageNum >= 1 && pageNum !== currentPage) {
        hasRestoredPageRef.current = true; // İşaretle ki tekrar çalışmasın
        setCurrentPage(pageNum);
        // Sayfa değişince veriler yeniden yüklenecek, scroll'u o zaman yapacağız
      } else {
        hasRestoredPageRef.current = true;
      }
    } else {
      hasRestoredPageRef.current = true;
    }
  }, [currentPage]);

  // Scroll pozisyonunu geri yükle (veri yüklendikten ve sayfa numarası restore edildikten sonra)
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('applicationsPageScrollPosition');
    const savedPage = sessionStorage.getItem('applicationsPageCurrentPage');
    
    // Eğer kaydedilmiş sayfa ve scroll pozisyonu varsa ve veriler yüklendiyse
    if (savedScrollPosition && savedPage && applicationsData && !applicationsLoading && applications.length > 0) {
      const timer = setTimeout(() => {
        const scrollY = parseInt(savedScrollPosition, 10);
        if (scrollY >= 0) {
          window.scrollTo(0, scrollY);
        }
        sessionStorage.removeItem('applicationsPageScrollPosition');
        sessionStorage.removeItem('applicationsPageCurrentPage');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [applicationsData, applicationsLoading, applications.length, currentPage]);

  // Filtre değiştiğinde sayfa 1'e dön (sadece restore işlemi yapılmadıysa)
  const prevFiltersRef = useRef({ statusFilter, cityFilter });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasFilterChanged = 
      prev.statusFilter !== statusFilter ||
      prev.cityFilter !== cityFilter;
    
    // Sadece filtre gerçekten değiştiyse ve restore işlemi yapılmadıysa sayfa 1'e dön
    if (hasFilterChanged && hasRestoredPageRef.current) {
      setCurrentPage(1);
    }
    
    prevFiltersRef.current = { statusFilter, cityFilter };
  }, [statusFilter, cityFilter]);


  // Aktif filtre sayısı (memoized)
  const activeFiltersCount = useMemo(() => {
    return [statusFilter, cityFilter].filter(Boolean).length;
  }, [statusFilter, cityFilter]);

  // Filtreleri temizle (memoized)
  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setCityFilter('');
  }, []);

  const handleApplicationClick = useCallback((application, e) => {
    // Scroll pozisyonunu kaydet (geri dönünce kullanılmak üzere)
    const scrollY = window.scrollY || window.pageYOffset;
    sessionStorage.setItem('applicationsPageScrollPosition', scrollY.toString());
    sessionStorage.setItem('applicationsPageCurrentPage', currentPage.toString());
    
    // Başvuru detay sayfasına yönlendir
    navigate(`/doctor/applications/${application.id}`);
  }, [navigate, currentPage]);

  const handleWithdraw = useCallback(async (applicationId) => {
    const currentScroll = captureScrollPosition();
    const confirmed = await showToast.confirm({
      title: "Başvuruyu Geri Çek",
      message: "Bu başvuruyu geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      type: "warning",
      size: "small",
      confirmText: "Geri Çek",
      cancelText: "İptal",
      destructive: true,
    });
    
    if (!confirmed) {
      restoreScrollPosition();
      return;
    }

    try {
      await withdrawMutation.mutateAsync({ applicationId, reason: '' });
      // Toast mesajı mutation'ın onSuccess'inde gösteriliyor
      if (currentScroll >= 0) {
        sessionStorage.setItem('applicationsPageScrollPosition', String(currentScroll));
        sessionStorage.setItem('applicationsPageCurrentPage', currentPage.toString());
      }
      await refetchApplications();
      restoreScrollPosition();
    } catch (error) {
      console.error('Withdraw error:', error);
      // Toast mesajı mutation'ın onError'unda gösteriliyor
      restoreScrollPosition();
    }
  }, [captureScrollPosition, restoreScrollPosition, withdrawMutation, refetchApplications, currentPage]);


  // Status helper functions (component dışına çıkar - her render'da yeniden oluşturulmasın)
  const getStatusText = useCallback((statusId) => {
    switch (statusId) {
      case 1: return 'Başvuruldu';
      case 2: return 'İnceleniyor';
      case 3: return 'Kabul Edildi';
      case 4: return 'Red Edildi';
      case 5: return 'Geri Çekildi';
      default: return 'Bilinmiyor';
    }
  }, []);

  const getStatusColor = useCallback((statusId) => {
    switch (statusId) {
      case 1: return 'border border-amber-200 bg-amber-100 text-amber-800';
      case 2: return 'border border-blue-200 bg-blue-100 text-blue-800';
      case 3: return 'border border-emerald-200 bg-emerald-100 text-emerald-800';
      case 4: return 'border border-rose-200 bg-rose-100 text-rose-800';
      case 5: return 'border border-gray-200 bg-gray-100 text-gray-700';
      default: return 'border border-gray-200 bg-gray-100 text-gray-700';
    }
  }, []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Başvuruldu', label: 'Başvuruldu', id: 1 },
    { value: 'İnceleniyor', label: 'İnceleniyor', id: 2 },
    { value: 'Kabul Edildi', label: 'Kabul Edildi', id: 3 },
    { value: 'Red Edildi', label: 'Red Edildi', id: 4 },
    { value: 'Geri Çekildi', label: 'Geri Çekildi', id: 5 },
  ], []);

  // Sayfa değiştirme handler (memoized)
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  if (applicationsLoading || lookupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-2xl" />
          <SkeletonLoader className="h-48 bg-gray-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonLoader className="h-32 bg-gray-200 rounded-2xl" />
            <SkeletonLoader className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 rounded-3xl p-8 mb-8 border border-cyan-200/30 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Başvurularım
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mt-1">
                    Başvuru Takibi
                  </span>
                </h1>
                <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
                  Yaptığınız başvuruları takip edin ve yönetin.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-4 w-32 h-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Toplam Başvuru</div>
                  <div className="text-2xl font-bold text-blue-900">{pagination.total || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filtreleme Paneli */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  {activeFiltersCount} Aktif
                </span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-700 bg-white border border-gray-200 rounded-xl transition-all hover:border-blue-400"
                >
                  <XIcon className="w-4 h-4" />
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Durum Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Şehir Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Şehir
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={lookupLoading}
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aktif Filtreler (Chip'ler) */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {statusFilter && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                    Durum: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                    <button
                      onClick={() => setStatusFilter('')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {cityFilter && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200">
                    Şehir: {cityFilter}
                    <button
                      onClick={() => setCityFilter('')}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Başvuru Listesi */}
        <div className="space-y-6 pb-16 md:pb-20">
          {applicationsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : applications?.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {activeFiltersCount > 0 ? 'Filtreye uygun başvuru bulunamadı' : 'Başvuru bulunamadı'}
                </h3>
                <p className="text-gray-500 text-sm md:text-base px-4">
                  {activeFiltersCount > 0 
                    ? 'Filtreleri değiştirip tekrar deneyin.' 
                    : 'Henüz hiç başvuru yapmadınız.'}
                </p>
              </div>
            </div>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewClick={handleApplicationClick}
                onWithdrawClick={handleWithdraw}
                isWithdrawing={withdrawMutation.isPending}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </div>

        {/* Sayfalama */}
        {pagination.total_pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        )}

      </div>
    </div>
  );
};

// Application Card Component (Memoized)
const ApplicationCard = memo(({ application, onViewClick, onWithdrawClick, isWithdrawing, getStatusText, getStatusColor }) => {
  const handleView = (e) => {
    // Pasif ilanlar için detay sayfasına gitmeyi engelle
    if (isJobPassive) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onViewClick(application, e);
  };

  const handleWithdraw = () => {
    onWithdrawClick(application.id);
  };

  // İlan durumunu kontrol et - Pasif ilan kontrolü (ilan pasif, hastane pasif veya silinmiş)
  const jobStatusId = application.job_status_id;
  const jobStatus = application.job_status || '';
  const hospitalIsActive = application.hospital_is_active !== false && application.hospital_is_active !== 0 && application.hospital_is_active !== '0';
  const jobDeletedAt = application.job_deleted_at; // İş ilanı silinme tarihi
  const isJobPassive = 
    jobStatusId === 4 ||
    jobStatusId === '4' ||
    jobStatus === 'Pasif' || 
    jobStatus === 'Passive' ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().trim() === 'pasif') ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().trim() === 'passive') ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('pasif')) ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('passive')) ||
    !hospitalIsActive || // Hastane pasifse ilan da pasif gibi görünsün
    !!jobDeletedAt; // İş ilanı silinmişse (yayından kaldırılmış) pasif gibi görünsün

  // Pasif ilan için özel görünüm
  if (isJobPassive) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{application.job_title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span>{application.hospital_name || 'Hastane adı yok'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{application.job_city || 'Şehir belirtilmemiş'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs md:text-sm font-medium border border-rose-200 bg-rose-100 text-rose-700">
                  Yayından Kaldırıldı
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Başvuru: {new Date(application.created_at || application.applied_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
              <p className="text-gray-600 text-sm text-center">
                Bu ilan yayından kaldırıldığı için başvuru detayları görüntülenemez.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{application.job_title}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>{application.hospital_name || 'Hastane adı yok'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{application.job_city || 'Şehir belirtilmemiş'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(application.status_id)}`}>
                {getStatusText(application.status_id)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Başvuru: {new Date(application.created_at || application.applied_at).toLocaleDateString('tr-TR')}</span>
            </div>
            {application.updated_at !== application.created_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Güncelleme: {new Date(application.updated_at).toLocaleDateString('tr-TR')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={handleView}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Başvuru Detayı
          </button>
          
          {/* Geri çekme: yalnızca Başvuruldu (id=1) için */}
          {(application.status_id === 1) && (
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base shadow-sm"
            >
              <X className="w-4 h-4" />
              Geri Çek
            </button>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: Sadece application verisi değiştiğinde render et
  const applicationSame = 
    prevProps.application?.id === nextProps.application?.id &&
    prevProps.application?.status_id === nextProps.application?.status_id &&
    prevProps.application?.updated_at === nextProps.application?.updated_at;
  
  const handlersSame = 
    prevProps.onViewClick === nextProps.onViewClick &&
    prevProps.onWithdrawClick === nextProps.onWithdrawClick &&
    prevProps.getStatusText === nextProps.getStatusText &&
    prevProps.getStatusColor === nextProps.getStatusColor;
  
  const loadingSame = prevProps.isWithdrawing === nextProps.isWithdrawing;
  
  // Eğer tüm değerler aynıysa render etme (true = skip render)
  return applicationSame && handlersSame && loadingSame;
});

ApplicationCard.displayName = 'ApplicationCard';

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
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              isCurrentPage
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
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
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Sonraki
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default DoctorApplicationsPage;