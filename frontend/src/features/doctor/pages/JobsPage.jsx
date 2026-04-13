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
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, MapPin, Building, 
  Clock, X, Send,
  Briefcase, DollarSign, CheckCircle, ArrowRight, FileText, Filter, XCircle as XIcon, Target
} from 'lucide-react';
import { useDoctorJobs } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useLookup } from '@/hooks/useLookup';
import { formatDate } from '@/utils/dateUtils';
import { normalizePagination } from '@/utils/paginationUtils';

const DoctorJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Filtre state'leri (URL'den okunacak)
  const [cityId, setCityId] = useState(() => searchParams.get('city_id') || '');
  const [specialtyId, setSpecialtyId] = useState(() => searchParams.get('specialty_id') || '');
  const [subspecialtyId, setSubspecialtyId] = useState(() => searchParams.get('subspecialty_id') || '');
  const [employmentType, setEmploymentType] = useState(() => searchParams.get('employment_type') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const searchInputRef = useRef(null);
  const cursorPositionRef = useRef(null); // Cursor pozisyonunu korumak için
  const scrollPositionRef = useRef(null); // Scroll pozisyonunu korumak için
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
    
    // Scroll pozisyonunu kaydet (URL güncellemesinden önce)
    scrollPositionRef.current = window.scrollY;
    
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
        
    // Scroll pozisyonunu geri yükle (URL güncellemesinden sonra)
    requestAnimationFrame(() => {
      if (scrollPositionRef.current !== null) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    });
  }, [debouncedSearch, setSearchParams]);

  // 🔹 Tüm filtreler → URL'e yazılır (state değiştiğinde - debounced, agresif değil)
  // Debounce ile URL güncellemesi (300ms) - gereksiz render'ları önler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Scroll pozisyonunu kaydet (filtre değişikliğinden önce)
      scrollPositionRef.current = window.scrollY;
      
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
      
      // Scroll pozisyonunu geri yükle (filtre değişikliğinden sonra)
      requestAnimationFrame(() => {
        if (scrollPositionRef.current !== null) {
          window.scrollTo(0, scrollPositionRef.current);
        }
      });
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [cityId, specialtyId, subspecialtyId, employmentType, currentPage, setSearchParams]);

  // Search input için commit fonksiyonu (onBlur veya Enter tuşu için)
  // Cursor pozisyonu korunur - focus kalkmaz - yazmaya devam edilebilir
  // Sayfa refresh olmaz - form submit engellenir
  const commitSearchToUrl = useCallback((cursorPosBeforeCommit = null) => {
    if (searchInputRef.current === document.activeElement) {
      const originalQuery = searchQuery || '';
      const value = originalQuery.trim().replace(/\s+/g, ' ').slice(0, 100);

      // Cursor pozisyonunu kaydet (trim öncesi)
      const cursorPosition = cursorPosBeforeCommit ?? searchInputRef.current?.selectionStart ?? cursorPositionRef.current ?? originalQuery.length;
      cursorPositionRef.current = cursorPosition;

      // Trim işlemi nedeniyle cursor pozisyonunu hesapla
      const trimmedStart = originalQuery.length - (originalQuery.trimStart() || '').length;
      const trimmedLength = value.length;

      // URL'e yaz
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (value && value.length >= 2) {
          newParams.set('search', value);
          // Recent searches'i localStorage'a kaydet
          const key = 'doctor_jobs_recent_searches';
          const raw = localStorage.getItem(key);
          const list = Array.isArray(JSON.parse(raw || '[]')) ? JSON.parse(raw || '[]') : [];
          const next = [value, ...list.filter((q) => q !== value)].slice(0, 5);
          localStorage.setItem(key, JSON.stringify(next));
        } else {
          newParams.delete('search');
        }
        return newParams;
      });

      // State'i güncelle (URL'den gelecek değer yerine doğrudan burada güncelle)
      setSearchQuery(value);

      // Scroll pozisyonunu kaydet ve koru
      scrollPositionRef.current = window.scrollY;

      // Input'un value'sunu doğrudan ayarla ve cursor pozisyonunu hemen restore et
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (searchInputRef.current) {
            searchInputRef.current.value = value;
            searchInputRef.current.focus();

            let newPos = cursorPosition;
            if (cursorPosition > trimmedStart) {
              newPos = Math.min(cursorPosition - trimmedStart, trimmedLength);
            } else {
              newPos = Math.min(cursorPosition, trimmedLength);
            }

            newPos = Math.min(newPos, value.length);

            searchInputRef.current.setSelectionRange(newPos, newPos);
            cursorPositionRef.current = newPos;
            
            // Scroll pozisyonunu geri yükle
            if (scrollPositionRef.current !== null) {
              window.scrollTo(0, scrollPositionRef.current);
            }
          }
        });
      });
    }
  }, [searchQuery, setSearchParams]);

  // Search input'un değeri boşaldığında input'u temizle
  useEffect(() => {
    if (!searchQuery && searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, [searchQuery]);

  // Render'dan sonra cursor pozisyonunu geri yükle (eğer kaydedilmişse ve kullanıcı input'ta ise)
  useEffect(() => {
    // Sadece kullanıcı input'ta yazıyorsa cursor pozisyonunu geri yükle
    if (cursorPositionRef.current !== null &&
        searchInputRef.current &&
        document.activeElement === searchInputRef.current &&
        searchQuery.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (searchInputRef.current && document.activeElement === searchInputRef.current) {
            const pos = Math.min(cursorPositionRef.current, searchQuery.length);
            searchInputRef.current.setSelectionRange(pos, pos);
          }
        });
      });
    }
  }, [searchQuery]);

  // Scroll pozisyonunu kaydet
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const rawPagination = jobsData?.pagination || {};
  const pagination = normalizePagination(rawPagination);

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
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, []);


  const handleJobClick = useCallback((job) => {
    // Scroll pozisyonunu ve sayfa numarasını kaydet
    const scrollY = window.scrollY || window.pageYOffset;
    sessionStorage.setItem('jobsPageScrollPosition', scrollY.toString());
    sessionStorage.setItem('jobsPageCurrentPage', currentPage.toString());
    const fromUrl = `${location.pathname}${location.search}`;
    sessionStorage.setItem('jobsLastVisitedUrl', fromUrl);
    // İlan detay sayfasına yönlendir
    navigate(`/doctor/jobs/${job.id}`, { state: { from: fromUrl } });
  }, [navigate, currentPage, location.pathname, location.search]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-6 md:mb-8 border border-cyan-200/30 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    İş İlanları
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mt-1">
                      Kariyer Fırsatları
                    </span>
                  </h1>
                  <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
                  Size uygun iş ilanlarını keşfedin ve başvurun.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md p-3 min-w-[100px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500 mb-0.5">Toplam İlan</div>
                    <div className="text-xl font-bold text-blue-600">{pagination.total || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Filtre Paneli */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
              </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
          {/* Filtre Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Şehir */}
                <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                    Şehir
                  </label>
                  <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-500"
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                    ))}
                  </select>
                </div>

            {/* Ana Dal */}
                <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Ana Dal
                  </label>
                  <select
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-500"
              >
                <option value="">Tüm Ana Dallar</option>
                    {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Yan Dal */}
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

            {/* Çalışma Türü */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Çalışma Türü
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-500"
              >
                <option value="">Tüm Çalışma Türleri</option>
                {employmentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                    ))}
                  </select>
                </div>
              </div>

          {/* Arama */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Arama (İlan Başlığı, Hastane Adı)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  const cursorPos = e.target.selectionStart || value.length;

                  // Cursor pozisyonunu kaydet
                  cursorPositionRef.current = cursorPos;

                  setSearchQuery(value);

                  // Cursor pozisyonunu geri yükle (render'dan sonra)
                  requestAnimationFrame(() => {
                    if (searchInputRef.current && document.activeElement === searchInputRef.current) {
                      const newPos = Math.min(cursorPos, value.length);
                      searchInputRef.current.setSelectionRange(newPos, newPos);
                      cursorPositionRef.current = newPos;
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation(); // Event'in yayılmasını önle

                    // Cursor pozisyonunu kaydet (trim öncesi - en önemli adım!)
                    const cursorPos = e.target.selectionStart ?? searchInputRef.current?.selectionStart ?? cursorPositionRef.current ?? searchQuery.length;

                    // commitSearchToUrl'a cursor pozisyonunu parametre olarak geçir
                    commitSearchToUrl(cursorPos);

                    // Form submit'i engelle
                    return false;
                  }
                }}
                placeholder="İlan başlığı veya hastane adı ara..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Aktif Filtreler (Chips) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {cityId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm">
                  <span>Şehir: {cities.find(c => c.id === parseInt(cityId, 10))?.name}</span>
                  <button
                    type="button"
                    onClick={() => setCityId('')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {specialtyId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-sm">
                  <span>Ana Dal: {specialties.find(s => s.id === parseInt(specialtyId, 10))?.name}</span>
                  <button
                    type="button"
                    onClick={() => setSpecialtyId('')}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {subspecialtyId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-pink-700 text-sm">
                  <span>Yan Dal: {filteredSubspecialties.find(s => s.id === parseInt(subspecialtyId, 10))?.name}</span>
                  <button
                    type="button"
                    onClick={() => setSubspecialtyId('')}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {employmentType && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm">
                  <span>Çalışma Türü: {employmentType}</span>
                  <button
                    type="button"
                    onClick={() => setEmploymentType('')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-sm">
                  <span>Arama: {searchQuery}</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
          </form>
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
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">İlan Bulunamadı</h3>
        <p className="text-gray-500 mb-6">Aradığınız kriterlere uygun iş ilanı bulunamadı.</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-dark)] text-white rounded-xl hover:from-[var(--primary-dark)] hover:to-[#1e3a8a] transition-all duration-300 font-medium shadow-md"
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
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
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
    prevProps.pagination?.totalPages === nextProps.pagination?.totalPages &&
    prevProps.pagination?.page === nextProps.pagination?.page;
  
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
    <div>
      {/* Mobile: compact */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed">Önceki</button>
        <span className="text-sm font-semibold text-gray-700">{currentPage} / {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed">Sonraki</button>
      </div>

      {/* Desktop: numbered */}
      <div className="hidden md:flex justify-center items-center space-x-2">
        <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed">Önceki</button>
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          const isCurrentPage = page === currentPage;
          const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
          if (!shouldShow) {
            if (page === 2 && currentPage > 4) return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
            if (page === totalPages - 1 && currentPage < totalPages - 3) return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
            return null;
          }
          return (
            <button key={page} onClick={() => handlePage(page)} className={`px-4 py-2 text-sm font-medium rounded-xl ${isCurrentPage ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-dark)] text-white shadow-md' : 'text-gray-600 bg-white border border-gray-200 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]'}`}>{page}</button>
          );
        })}
        <button onClick={handleNext} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed">Sonraki</button>
      </div>
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
      className="bg-white rounded-2xl border border-blue-100 p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group min-h-[200px] flex flex-col"
    >
      {/* Başlık */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {job.title}
          </h3>

      {/* Uzmanlık / Yan Dal */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <Target className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate font-medium">{job.specialty_name}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Target className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
          <span className="truncate">{job.subspecialty_name || '-'}</span>
        </div>
      </div>

      {/* Şehir ve Hastane */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate">{job.city}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Building className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate">{job.hospital_name}</span>
        </div>
      </div>

      {/* Alt Bilgi - Çalışma Türü */}
      <div className="mt-auto pt-2 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
            {job.employment_type}
          </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatDate(job.created_at)}
        </div>
      </div>
    </div>
  );
});

JobCard.displayName = 'JobCard';

export default DoctorJobsPage;