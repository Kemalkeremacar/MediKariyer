/**
 * Doktor İş İlanları Sayfası
 * 
 * Doktorların iş ilanlarını görüntüleyebileceği ve başvuru yapabileceği sayfa
 * Modern dark theme ile ProfilePage ile tutarlı tasarım
 * 
 * Özellikler:
 * - İş ilanı listesi ve filtreleme
 * - İş ilanı detay görüntüleme (sayfa olarak)
 * - Arama ve filtreleme
 * - Sayfalama
 * - Glassmorphism dark theme
 */

import React, { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Building, 
  Clock, X, Send,
  Briefcase, DollarSign, CheckCircle, ArrowRight, FileText, Filter, XCircle as XIcon
} from 'lucide-react';
import { useDoctorJobs } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useLookup } from '@/hooks/useLookup';

const DoctorJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Filtre state'leri (URL'den okunacak)
  const [cityId, setCityId] = useState(() => searchParams.get('city_id') || '');
  const [specialtyId, setSpecialtyId] = useState(() => searchParams.get('specialty_id') || '');
  const [subspecialtyId, setSubspecialtyId] = useState(() => searchParams.get('subspecialty_id') || '');
  const [employmentType, setEmploymentType] = useState(() => searchParams.get('employment_type') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const searchInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));

  // Lookup Data Hook
  const { 
    data: lookupData,
    loading: lookupLoading,
    error: lookupErrorObj,
    utils
  } = useLookup();
  
  // 🔹 Adım 1: Kullanıcı input'a yazar → search state güncellenir
  // 🔹 Adım 2: 400ms sonra (debounce) → debouncedSearch güncellenir
  useEffect(() => {
    const id = setTimeout(() => {
      const normalized = (searchQuery || '').trim().replace(/\s+/g, ' ').slice(0, 100);
      setDebouncedSearch(normalized);
    }, 400); // 400ms debounce
    return () => clearTimeout(id);
  }, [searchQuery]);

  // 🔹 Adım 3: Debounced search → URL'e yazılır (useSearchParams ile)
  useEffect(() => {
    // Input aktifken URL güncelleme (caret sıçramasını önler)
    if (document.activeElement === searchInputRef.current) return;
    
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
      if (debouncedSearch && debouncedSearch.length >= 2) {
        newParams.set('search', debouncedSearch);
        // Recent searches'i localStorage'a kaydet
        const key = 'doctor_jobs_recent_searches';
        const raw = localStorage.getItem(key);
        const list = Array.isArray(JSON.parse(raw || '[]')) ? JSON.parse(raw || '[]') : [];
        const next = [debouncedSearch, ...list.filter((q) => q !== debouncedSearch)].slice(0, 5);
        localStorage.setItem(key, JSON.stringify(next));
      } else {
        newParams.delete('search');
      }
          return newParams;
        });
  }, [debouncedSearch, setSearchParams]);

  // 🔹 Tüm filtreler → URL'e yazılır (state değiştiğinde - debounced, agresif değil)
  // Debounce ile URL güncellemesi (300ms) - gereksiz render'ları önler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        let hasChanges = false;
        
        // City filter
        const prevCityId = prev.get('city_id') || '';
        if (cityId !== prevCityId) {
          hasChanges = true;
          if (cityId) {
            newParams.set('city_id', cityId);
          } else {
            newParams.delete('city_id');
          }
        }
        
        // Specialty filter
        const prevSpecialtyId = prev.get('specialty_id') || '';
        if (specialtyId !== prevSpecialtyId) {
          hasChanges = true;
          if (specialtyId) {
            newParams.set('specialty_id', specialtyId);
    } else {
            newParams.delete('specialty_id');
          }
        }
        
        // Subspecialty filter
        const prevSubspecialtyId = prev.get('subspecialty_id') || '';
        if (subspecialtyId !== prevSubspecialtyId) {
          hasChanges = true;
          if (subspecialtyId) {
            newParams.set('subspecialty_id', subspecialtyId);
          } else {
            newParams.delete('subspecialty_id');
          }
        }
        
        // Employment type filter
        const prevEmploymentType = prev.get('employment_type') || '';
        if (employmentType !== prevEmploymentType) {
          hasChanges = true;
          if (employmentType) {
            newParams.set('employment_type', employmentType);
          } else {
            newParams.delete('employment_type');
          }
        }
        
        // Page filter
        const prevPage = prev.get('page') || '1';
        if (currentPage.toString() !== prevPage) {
          hasChanges = true;
          if (currentPage > 1) {
            newParams.set('page', currentPage.toString());
        } else {
            newParams.delete('page');
          }
        }
        
        // Sadece değişiklik varsa güncelle
        return hasChanges ? newParams : prev;
      });
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [cityId, specialtyId, subspecialtyId, employmentType, currentPage, setSearchParams]);

  // Search input için commit fonksiyonu (onBlur veya Enter tuşu için)
  const commitSearchToUrl = useCallback(() => {
    if (searchInputRef.current === document.activeElement) {
      const value = (searchQuery || '').trim().replace(/\s+/g, ' ').slice(0, 100);
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
        if (value && value.length >= 2) {
          newParams.set('search', value);
        } else {
          newParams.delete('search');
        }
          return newParams;
        });
      }
  }, [searchQuery, setSearchParams]);

  // Search input'un değeri boşaldığında input'u temizle
  useEffect(() => {
    if (!searchQuery && searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, [searchQuery]);

  // URL'den filtre değerlerini oku
  const urlCityId = searchParams.get('city_id') || '';
  const urlSpecialtyId = searchParams.get('specialty_id') || '';
  const urlSubspecialtyId = searchParams.get('subspecialty_id') || '';
  const urlEmploymentType = searchParams.get('employment_type') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  // URL'den gelen değerleri state'e senkronize et (sadece farklıysa)
  useEffect(() => {
    if (urlCityId !== cityId) setCityId(urlCityId);
  }, [urlCityId]);
  
  useEffect(() => {
    if (urlSpecialtyId !== specialtyId) setSpecialtyId(urlSpecialtyId);
  }, [urlSpecialtyId]);
  
  useEffect(() => {
    if (urlSubspecialtyId !== subspecialtyId) setSubspecialtyId(urlSubspecialtyId);
  }, [urlSubspecialtyId]);
  
  useEffect(() => {
    if (urlEmploymentType !== employmentType) setEmploymentType(urlEmploymentType);
  }, [urlEmploymentType]);
  
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      if (searchInputRef.current) {
        searchInputRef.current.value = urlSearch;
      }
    }
  }, [urlSearch]);
  
  useEffect(() => {
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  }, [urlPage]);

  // 🔹 Adım 4: URL parametrelerini API parametrelerine dönüştür
  const jobsParams = useMemo(() => {
    const params = {
      page: urlPage || 1,
      limit: 12,
    };
    
    if (urlCityId) {
      params.city_id = parseInt(urlCityId, 10);
    }
    
    if (urlSpecialtyId) {
      params.specialty_id = parseInt(urlSpecialtyId, 10);
    }
    
    if (urlSubspecialtyId) {
      params.subspecialty_id = parseInt(urlSubspecialtyId, 10);
    }
    
    if (urlEmploymentType) {
      params.employment_type = urlEmploymentType;
    }
    
    if (urlSearch && urlSearch.length >= 2) {
      params.search = urlSearch;
    }
    
    return params;
  }, [urlCityId, urlSpecialtyId, urlSubspecialtyId, urlEmploymentType, urlSearch, urlPage]);

  // 🔹 Adım 5: Backend → SQL sorgusunu dinamik oluşturur
  // 🔹 Adım 6: Sonuçlar → cache'e alınır (React Query)
  // 🔹 Adım 7: Liste anında güncellenir, diğer UI'lar etkilenmez
  const { data: jobsData, isLoading: jobsLoading } = useDoctorJobs(jobsParams);

  const jobs = jobsData?.jobs || [];
  const pagination = jobsData?.pagination || {};

  // Sayfa numarasını ve scroll pozisyonunu geri yükle (sadece sayfa ilk yüklendiğinde veya geri gelindiğinde)
  const hasRestoredPageRef = useRef(false);
  useEffect(() => {
    // Sadece bir kez kontrol et (component mount olduğunda)
    if (hasRestoredPageRef.current) return;
    
    const savedPage = sessionStorage.getItem('jobsPageCurrentPage');
    const savedScrollPosition = sessionStorage.getItem('jobsPageScrollPosition');
    
    // Önce sayfa numarasını geri yükle
    if (savedPage) {
      const pageNum = parseInt(savedPage, 10);
      if (pageNum >= 1 && pageNum !== currentPage) {
        hasRestoredPageRef.current = true; // İşaretle ki tekrar çalışmasın
        setCurrentPage(pageNum);
        // URL'i de güncelle
        const newSearchParams = new URLSearchParams(searchParams);
        if (pageNum > 1) {
          newSearchParams.set('page', pageNum.toString());
        } else {
          newSearchParams.delete('page');
        }
        setSearchParams(newSearchParams, { replace: true });
        // Sayfa değişince veriler yeniden yüklenecek, scroll'u o zaman yapacağız
        } else {
        hasRestoredPageRef.current = true;
        }
      } else {
      hasRestoredPageRef.current = true;
    }
  }, [currentPage, searchParams, setSearchParams]);

  // Scroll pozisyonunu geri yükle (veri yüklendikten ve sayfa numarası restore edildikten sonra)
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('jobsPageScrollPosition');
    const savedPage = sessionStorage.getItem('jobsPageCurrentPage');
    
    // Eğer kaydedilmiş sayfa ve scroll pozisyonu varsa ve veriler yüklendiyse
    if (savedScrollPosition && savedPage && jobsData && !jobsLoading) {
      const timer = setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('jobsPageScrollPosition');
        sessionStorage.removeItem('jobsPageCurrentPage');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [jobsData, jobsLoading]);

  // Filtre değiştiğinde sayfa 1'e dön (sadece sayfa 1'den farklıysa - gereksiz render'ı önler)
  const prevFiltersRef = useRef({ cityId, specialtyId, subspecialtyId, employmentType, debouncedSearch });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasFilterChanged = 
      prev.cityId !== cityId ||
      prev.specialtyId !== specialtyId ||
      prev.subspecialtyId !== subspecialtyId ||
      prev.employmentType !== employmentType ||
      prev.debouncedSearch !== debouncedSearch;
    
    if (hasFilterChanged && currentPage !== 1) {
    setCurrentPage(1);
    }
    
    prevFiltersRef.current = { cityId, specialtyId, subspecialtyId, employmentType, debouncedSearch };
  }, [cityId, specialtyId, subspecialtyId, employmentType, debouncedSearch, currentPage]);

  // Ana Dal değiştiğinde Yan Dal'ı sıfırla (sadece gerçekten değiştiyse)
  const prevSpecialtyIdRef = useRef(specialtyId);
  useEffect(() => {
    if (prevSpecialtyIdRef.current !== specialtyId && prevSpecialtyIdRef.current !== '') {
      // Ana dal değişti ve önceki değer vardı, yan dal'ı temizle
      if (subspecialtyId) {
        setSubspecialtyId('');
      }
    }
    prevSpecialtyIdRef.current = specialtyId;
  }, [specialtyId, subspecialtyId]);

  // Aktif filtre sayısı
  const activeFiltersCount = [cityId, specialtyId, subspecialtyId, employmentType, searchQuery].filter(Boolean).length;

  // Filtreleri temizle
  const clearFilters = useCallback(() => {
    setCityId('');
    setSpecialtyId('');
    setSubspecialtyId('');
    setEmploymentType('');
    setSearchQuery('');
  }, []);


  const handleJobClick = useCallback((job) => {
    // Scroll pozisyonunu ve sayfa numarasını kaydet
    const scrollY = window.scrollY || window.pageYOffset;
    sessionStorage.setItem('jobsPageScrollPosition', scrollY.toString());
    sessionStorage.setItem('jobsPageCurrentPage', currentPage.toString());
    // İlan detay sayfasına yönlendir
    navigate(`/doctor/jobs/${job.id}`);
  }, [navigate, currentPage]);

  // Lookup verileri
  const cities = lookupData?.cities || [];
  const specialties = lookupData?.specialties || [];
  const subspecialties = lookupData?.subspecialties || [];
  const filteredSubspecialties = useMemo(() => {
    if (!specialtyId || !subspecialties.length) return [];
    return subspecialties.filter(sub => sub.specialty_id === parseInt(specialtyId, 10));
  }, [specialtyId, subspecialties]);

  // Employment type options (JobCreatePage ile uyumlu)
  const employmentTypeOptions = [
    { value: 'Tam Zamanlı', label: 'Tam Zamanlı' },
    { value: 'Yarı Zamanlı', label: 'Yarı Zamanlı' },
    { value: 'Nöbet Usulü', label: 'Nöbet Usulü' },
  ];

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
                    İş İlanları
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-1">
                      Kariyer Fırsatları
                    </span>
                  </h1>
                  <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                  Size uygun iş ilanlarını keşfedin ve başvurun.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 w-32 h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-300 mb-1">Toplam İlan</div>
                    <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Filtre Paneli */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6">
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

          {/* Filtre Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Şehir */}
                <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                    Şehir
                  </label>
                  <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
                  >
                    <option value="" className="bg-slate-800">Tüm Şehirler</option>
                    {cities.map((city) => (
                  <option key={city.id} value={city.id} className="bg-slate-800">
                    {city.name}
                  </option>
                    ))}
                  </select>
                </div>

            {/* Ana Dal */}
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
                    {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id} className="bg-slate-800">
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Yan Dal */}
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

            {/* Çalışma Türü */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Çalışma Türü
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <option value="" className="bg-slate-800">Tüm Çalışma Türleri</option>
                {employmentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                    ))}
                  </select>
                </div>
              </div>

          {/* Arama */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Arama (İlan Başlığı, Hastane Adı)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                defaultValue={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                }}
                onBlur={commitSearchToUrl}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitSearchToUrl();
                  }
                }}
                placeholder="İlan başlığı veya hastane adı ara..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Aktif Filtreler (Chips) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {cityId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
                  <span>Şehir: {cities.find(c => c.id === parseInt(cityId, 10))?.name}</span>
                  <button
                    onClick={() => setCityId('')}
                    className="hover:text-blue-200"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {specialtyId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                  <span>Ana Dal: {specialties.find(s => s.id === parseInt(specialtyId, 10))?.name}</span>
                  <button
                    onClick={() => setSpecialtyId('')}
                    className="hover:text-purple-200"
                  >
                    <XIcon className="w-4 h-4" />
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
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {employmentType && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
                  <span>Çalışma Türü: {employmentType}</span>
                  <button
                    onClick={() => setEmploymentType('')}
                    className="hover:text-green-200"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm">
                  <span>Arama: {searchQuery}</span>
                <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-orange-200"
                >
                    <XIcon className="w-4 h-4" />
                </button>
              </div>
              )}
            </div>
          )}
          </div>

        {/* İlanlar Listesi */}
        {(jobsLoading || lookupLoading?.isLoading) ? (
          <SkeletonLoader count={6} />
        ) : (
          <JobsList 
            jobs={jobs}
            pagination={pagination}
            onJobClick={handleJobClick}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onClearFilters={clearFilters}
          />
        )}

                </div>
              </div>
  );
};

// İş İlanları Listesi Component (Memoized - Sadece jobs/pagination değiştiğinde render)
const JobsList = memo(({ jobs, pagination, onJobClick, currentPage, onPageChange, onClearFilters }) => {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">İlan Bulunamadı</h3>
        <p className="text-gray-400 mb-6">Aradığınız kriterlere uygun iş ilanı bulunamadı.</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
        >
          Filtreleri Temizle
        </button>
            </div>
    );
  }

  return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onClick={onJobClick} />
                  ))}
              </div>
      {pagination.total_pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.total_pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: Sadece jobs array içeriği veya pagination değiştiğinde render et
  const jobsSame = prevProps.jobs?.length === nextProps.jobs?.length &&
    prevProps.jobs?.every((job, i) => job?.id === nextProps.jobs?.[i]?.id);
  const paginationSame = 
    prevProps.pagination?.total_pages === nextProps.pagination?.total_pages &&
    prevProps.pagination?.current_page === nextProps.pagination?.current_page;
  
  // Eğer tüm değerler aynıysa render etme (true = skip render)
  return jobsSame && paginationSame && prevProps.currentPage === nextProps.currentPage;
});

JobsList.displayName = 'JobsList';

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
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
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
        onClick={handleNext}
        disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    Sonraki
                  </button>
                </div>
  );
});

Pagination.displayName = 'Pagination';

// İş İlanı Kartı Component (Memoized)
const JobCard = memo(({ job, onClick }) => {
  const handleClick = () => {
    onClick(job);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group min-h-[200px] flex flex-col"
    >
      {/* Başlık */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
            {job.title}
          </h3>

      {/* Uzmanlık / Yan Dal */}
      <div className="text-sm text-blue-300 bg-blue-500/15 border border-blue-500/20 w-fit px-3 py-1 rounded-full mb-3">
            {job.specialty_name}
            {job.subspecialty_name && (
              <span className="ml-1 text-blue-200">({job.subspecialty_name})</span>
            )}
          </div>

      {/* Şehir ve Hastane */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">{job.city}</span>
          </div>
        <div className="flex items-center text-gray-300 text-sm">
          <Building className="w-4 h-4 mr-2" />
          <span className="truncate">{job.hospital_name}</span>
        </div>
      </div>

      {/* Alt Bilgi - Çalışma Türü */}
      <div className="mt-auto pt-2 border-t border-white/10">
        <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {job.employment_type}
          </div>
        <div className="text-xs text-gray-400 mt-1">
          {new Date(job.created_at).toLocaleDateString('tr-TR')}
        </div>
      </div>
    </div>
  );
});

JobCard.displayName = 'JobCard';

export default DoctorJobsPage;