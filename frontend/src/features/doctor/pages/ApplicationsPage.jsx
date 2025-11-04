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
  X, Trash2, Filter, XCircle as XIcon
} from 'lucide-react';
import { useMyApplications, useWithdrawApplication, useDeleteApplication } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
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
  const deleteMutation = useDeleteApplication();

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
    const confirmed = await showToast.confirm({
      title: "Başvuruyu Geri Çek",
      message: "Bu başvuruyu geri çekmek istediğinizden emin misiniz?",
      type: "warning",
      confirmText: "Geri Çek",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;

    try {
      await withdrawMutation.mutateAsync({ applicationId, reason: '' });
      showToast.success('Başvuru geri çekildi');
      refetchApplications();
    } catch (error) {
      console.error('Withdraw error:', error);
      showToast.error('Başvuru geri çekilemedi');
    }
  }, [withdrawMutation, refetchApplications]);

  const handleDelete = useCallback(async (applicationId) => {
    const confirmed = await showToast.confirm({
      title: "Başvuruyu Sil",
      message: "Bu başvuruyu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!",
      type: "danger",
      destructive: true,
      confirmText: "Sil",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(applicationId);
      showToast.success('Başvuru kalıcı olarak silindi');
      refetchApplications();
    } catch (error) {
      console.error('Delete error:', error);
      showToast.error('Başvuru silinemedi');
    }
  }, [deleteMutation, refetchApplications]);

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
      case 1: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 2: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 3: return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 4: return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 5: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="space-y-8 p-6">
          <SkeletonLoader className="h-12 w-80 bg-white/10" />
          <SkeletonLoader className="h-48 bg-white/10 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonLoader className="h-32 bg-white/10 rounded-2xl" />
            <SkeletonLoader className="h-32 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-8 mb-8">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                  Başvurularım
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-1">
                    Başvuru Takibi
                  </span>
                </h1>
                <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                  Yaptığınız başvuruları takip edin ve yönetin.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 w-32 h-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-300 mb-1">Toplam Başvuru</div>
                  <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filtreleme Paneli */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Filtrele</h2>
              {activeFiltersCount > 0 && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                  {activeFiltersCount} Aktif
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
              >
                <XIcon className="w-4 h-4" />
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Durum Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Şehir Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Şehir
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
                disabled={lookupLoading}
              >
                <option value="" className="bg-slate-800">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name} className="bg-slate-800">
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aktif Filtreler (Chip'ler) */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {statusFilter && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                    Durum: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                    <button
                      onClick={() => setStatusFilter('')}
                      className="hover:bg-blue-500/30 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {cityFilter && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30">
                    Şehir: {cityFilter}
                    <button
                      onClick={() => setCityFilter('')}
                      className="hover:bg-purple-500/30 rounded p-0.5 transition-colors"
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
        <div className="space-y-6">
          {applicationsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : applications?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-2">
                {activeFiltersCount > 0 ? 'Filtreye uygun başvuru bulunamadı' : 'Başvuru bulunamadı'}
              </h3>
              <p className="text-gray-400 text-sm md:text-base px-4">
                {activeFiltersCount > 0 
                  ? 'Filtreleri değiştirip tekrar deneyin.' 
                  : 'Henüz hiç başvuru yapmadınız.'}
              </p>
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
    onViewClick(application, e);
  };

  const handleWithdraw = () => {
    onWithdrawClick(application.id);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{application.job_title}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{application.hospital_name || 'Hastane adı yok'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{application.job_city || 'Şehir belirtilmemiş'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getStatusColor(application.status_id)}`}>
                {getStatusText(application.status_id)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Başvuru: {new Date(application.created_at || application.applied_at).toLocaleDateString('tr-TR')}</span>
            </div>
            {application.updated_at !== application.created_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Güncelleme: {new Date(application.updated_at).toLocaleDateString('tr-TR')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={handleView}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Eye className="w-4 h-4" />
            Başvuru Detayı
          </button>
          
          {/* Geri çekme: yalnızca Başvuruldu (id=1) için */}
          {(application.status_id === 1) && (
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
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
        className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all"
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
            className={`px-4 py-2 text-sm font-medium rounded-xl backdrop-blur-sm transition-all ${
              isCurrentPage
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all"
      >
        Sonraki
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default DoctorApplicationsPage;