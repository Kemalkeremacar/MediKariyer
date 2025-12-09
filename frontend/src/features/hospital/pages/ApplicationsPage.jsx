/**
 * Hospital Applications Sayfası
 * 
 * Hastane başvuru yönetimi - Modern ve kullanıcı dostu
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Başvuru listesi ve filtreleme
 * - Başvuru durumu yönetimi (dropdown ile)
 * - Doktor profil görüntüleme (modal ile)
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * Başvuru Durumları:
 * - Başvuruldu (1): Doktor başvurdu, henüz incelenmedi
 * - İnceleniyor (2): Hastane inceliyor
 * - Kabul Edildi (3): Başvuru kabul edildi
 * - Reddedildi (4): Başvuru reddedildi
 * - Geri Çekildi (5): Doktor geri çekti (hastane görmez)
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, Search, Filter, MapPin, Calendar, 
  CheckCircle, X, Clock, Eye, AlertCircle, ArrowRight, 
  RefreshCw, Phone, Mail, Briefcase, Target, Building,
  ExternalLink, Settings,
  ArrowLeft, ChevronDown, ChevronUp
} from 'lucide-react';
import { useFloating, autoUpdate, offset, flip, shift, useDismiss, useInteractions, FloatingPortal, size } from '@floating-ui/react';
import { useHospitalApplications, useUpdateApplicationStatus, useHospitalJobs } from '../api/useHospital';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { formatDate, formatDateShort } from '@/utils/dateUtils';

const HospitalApplications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management - URL'den oku (initial state)
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  const [selectedJobIds, setSelectedJobIds] = useState(() => {
    const urlJobIds = searchParams.get('jobIds');
    if (urlJobIds) {
      return urlJobIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    }
    return [];
  });
  const [isJobFilterOpen, setIsJobFilterOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const cursorPositionRef = useRef(null); // Cursor pozisyonunu korumak için
  const jobFilterRef = useRef(null); // İlanlarım dropdown referansı
  const jobFilterButtonRef = useRef(null); // İlanlarım buton referansı
  const isInitialMount = useRef(true); // İlk mount kontrolü için

  // Floating UI için dropdown konumlandırma
  const { refs, floatingStyles, context } = useFloating({
    open: isJobFilterOpen,
    onOpenChange: setIsJobFilterOpen,
    middleware: [
      offset(8), 
      flip(), 
      shift({ padding: 8 }),
      size({
        apply({ availableWidth, elements }) {
          // Butonun genişliğine göre dropdown genişliğini ayarla
          if (elements.reference) {
            elements.floating.style.width = `${elements.reference.offsetWidth}px`;
          }
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  // Scroll pozisyonunu kaydet
  const scrollPositionRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dışarı tıklanınca dropdown'ı kapat - Floating UI useDismiss hook'u ile yönetiliyor

  // Sayfa yüklendiğinde scroll pozisyonunu geri yükle - requestAnimationFrame ile optimize edildi
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('hospital_applications_scroll');
    if (savedScrollPosition) {
      // requestAnimationFrame kullanarak daha hızlı restore et
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
          sessionStorage.removeItem('hospital_applications_scroll');
        });
      });
    }
  }, []);

  // Search pattern'i: Sadece Enter tuşu veya onBlur ile arama
  // Otomatik arama YOK - kullanıcı kontrolü tam olarak kullanıcıda
  // Cursor pozisyonu her zaman korunur

  // 🔹 Tüm filtreler → URL'e yazılır (state değiştiğinde - debounced, agresif değil)
  // Debounce ile URL güncellemesi (300ms) - gereksiz render'ları önler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        let hasChanges = false;
        
        // Status filter
        const prevStatus = prev.get('status') || '';
        if (statusFilter !== prevStatus) {
          hasChanges = true;
          if (statusFilter) {
            newParams.set('status', statusFilter);
          } else {
            newParams.delete('status');
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
  }, [statusFilter, currentPage, setSearchParams]);

  // Search input için commit fonksiyonu (Enter tuşu için)
  // Cursor pozisyonu korunur - focus kalkmaz - yazmaya devam edilebilir
  // Sayfa refresh olmaz - form submit engellenir
  const commitSearchToUrl = useCallback((cursorPosBeforeCommit = null) => {
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
        const key = 'hospital_applications_recent_searches';
        try {
          const raw = localStorage.getItem(key);
          const list = Array.isArray(JSON.parse(raw || '[]')) ? JSON.parse(raw || '[]') : [];
          const next = [value, ...list.filter((q) => q !== value)].slice(0, 5);
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          // localStorage hatası göz ardı edilir
        }
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
    
    // State'i güncelle (URL'den gelecek değer yerine doğrudan burada güncelle)
    setSearchQuery(value);
    
    // Input'un value'sunu doğrudan ayarla ve cursor pozisyonunu hemen restore et
    // Bu şekilde useEffect'in input'u değiştirmesini beklemeden kontrolü ele alıyoruz
    // requestAnimationFrame kullanarak DOM güncellemesinden sonra cursor pozisyonunu ayarla
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          // Input'un value'sunu ayarla
          searchInputRef.current.value = value;
          
          // Focus'u koru (eğer kaybolduysa)
          if (document.activeElement !== searchInputRef.current) {
            searchInputRef.current.focus();
          }
          
          // Trim sonrası cursor pozisyonunu hesapla
          let newPos = cursorPosition;
          if (cursorPosition > trimmedStart) {
            newPos = Math.min(cursorPosition - trimmedStart, trimmedLength);
          } else {
            newPos = Math.min(cursorPosition, trimmedLength);
          }
          
          // Input'un mevcut değerine göre pozisyonu sınırla
          newPos = Math.min(newPos, value.length);
          
          // Cursor pozisyonunu ayarla
          searchInputRef.current.setSelectionRange(newPos, newPos);
          cursorPositionRef.current = newPos;
        }
      });
    });
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

  // URL'den filtre değerlerini oku (memoize edilmiş)
  const urlStatus = searchParams.get('status') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlJobIds = searchParams.get('jobIds');

  // URL'den gelen değerleri state'e senkronize et - OPTİMİZE: Tek useEffect ile birleştirildi
  useEffect(() => {
    // İlk mount'ta state'ler zaten URL'den okundu, bu yüzden senkronizasyon atlanabilir
    // Sadece URL gerçekten değiştiğinde state'i güncelle
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // İlk mount'ta state'ler zaten doğru, sadece input value'sunu set et
      if (searchInputRef.current && urlSearch) {
        searchInputRef.current.value = urlSearch;
      }
      return;
    }
    
    // Status senkronizasyonu
    if (urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
    
    // Search senkronizasyonu - sadece kullanıcı input'ta değilse
    if (urlSearch !== searchQuery && document.activeElement !== searchInputRef.current) {
      setSearchQuery(urlSearch);
      if (searchInputRef.current) {
        searchInputRef.current.value = urlSearch;
        requestAnimationFrame(() => {
          if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
            searchInputRef.current.setSelectionRange(urlSearch.length, urlSearch.length);
          }
        });
      }
    }
    
    // Page senkronizasyonu
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    
    // JobIds senkronizasyonu
    if (urlJobIds) {
      const jobIdsArray = urlJobIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      // Array karşılaştırması - JSON.stringify yerine daha hızlı yöntem
      const arraysEqual = jobIdsArray.length === selectedJobIds.length && 
        jobIdsArray.every((val, idx) => val === selectedJobIds[idx]);
      if (!arraysEqual) {
        setSelectedJobIds(jobIdsArray);
      }
    } else if (selectedJobIds.length > 0) {
      setSelectedJobIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStatus, urlSearch, urlPage, urlJobIds]); // Tüm URL parametrelerini tek seferde dinle

  // 🔹 Adım 4: URL parametrelerini API parametrelerine dönüştür
  const applicationsParams = useMemo(() => {
    const params = {
      page: urlPage || 1,
      limit: 10,
    };
    
    // Status ID olarak gönderilmeli (sayı)
    if (urlStatus) {
      // URL'den gelen değer sayı mı kontrol et, değilse sayıya çevir
      const statusId = urlStatus && !isNaN(urlStatus) ? parseInt(urlStatus, 10) : null;
      if (statusId) {
        params.status = statusId;
      }
    }
    
    if (urlSearch && urlSearch.length >= 2) {
      params.search = urlSearch;
    }

    // Job IDs filtresi - array olarak gönderilmeli
    if (urlJobIds) {
      const jobIdsArray = urlJobIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (jobIdsArray.length > 0) {
        params.jobIds = jobIdsArray; // Array olarak gönder
      }
    }
    
    return params;
  }, [urlStatus, urlSearch, urlPage, urlJobIds]);

  // API hook'ları
  const { 
    data: applicationsData, 
    isLoading: applicationsLoading, 
    error: applicationsError,
    refetch: refetchApplications
  } = useHospitalApplications(applicationsParams);

  const { data: applicationStatuses, isLoading: statusesLoading } = useApplicationStatuses();
  
  // Hastane ilanlarını getir (filtre için) - Sadece dropdown için gerekli alanlar
  // enabled: false ile başlat, dropdown açıldığında yükle (performans optimizasyonu)
  const { data: jobsData, isLoading: jobsLoading } = useHospitalJobs({ limit: 100 }, {
    enabled: isJobFilterOpen // Sadece dropdown açıldığında yükle
  });
  const jobs = jobsData?.data?.jobs || [];
  
  const updateStatusMutation = useUpdateApplicationStatus();

  // Veri parsing
  const applications = applicationsData?.data?.applications || [];
  const pagination = applicationsData?.data?.pagination || {};

  const DEFAULT_STATUS_OPTIONS = useMemo(() => ([
    { value: 1, label: 'Başvuruldu', name: 'Başvuruldu' },
    { value: 2, label: 'İnceleniyor', name: 'İnceleniyor' },
    { value: 3, label: 'Kabul Edildi', name: 'Kabul Edildi' },
    { value: 4, label: 'Reddedildi', name: 'Reddedildi' },
    { value: 5, label: 'Geri Çekildi', name: 'Geri Çekildi' }
  ]), []);

  const statusOptions = useMemo(() => (
    applicationStatuses?.length > 0 ? applicationStatuses : DEFAULT_STATUS_OPTIONS
  ), [applicationStatuses, DEFAULT_STATUS_OPTIONS]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    if (key === 'status') {
      setStatusFilter(value);
      setCurrentPage(1); // Filtre değiştiğinde sayfa 1'e dön
    } else if (key === 'page') {
      setCurrentPage(value);
    } else if (key === 'jobIds') {
      setSelectedJobIds(value);
      setCurrentPage(1);
    }
  };

  const handleJobToggle = (jobId) => {
    const newSelectedJobIds = selectedJobIds.includes(jobId)
      ? selectedJobIds.filter(id => id !== jobId)
      : [...selectedJobIds, jobId];
    
    setSelectedJobIds(newSelectedJobIds);
    setCurrentPage(1);
    
    // URL'e yaz
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (newSelectedJobIds.length > 0) {
        newParams.set('jobIds', newSelectedJobIds.join(','));
      } else {
        newParams.delete('jobIds');
      }
      return newParams;
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setSelectedJobIds([]);
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    // URL'i de temizle
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Filtre değiştiğinde sayfa 1'e dön (sadece status değiştiğinde) - Bu mantık yanlış, kaldırıyoruz
  // useEffect(() => {
  //   if (statusFilter && currentPage !== 1) {
  //     setCurrentPage(1);
  //   }
  // }, [statusFilter]);

  // Status update handler
  const handleStatusChange = useCallback(async (applicationId, newStatusId, notes = '') => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status_id: parseInt(newStatusId),
        notes: notes || null
      });
    } catch (error) {
      console.error('Başvuru durumu güncelleme hatası:', error);
    }
  }, [updateStatusMutation]);

  // Modal açma fonksiyonları (kaldırılıyor - artık detay sayfasına yönlendiriliyor)
  // const handleOpenStatusModal = (application) => {
  //   setSelectedApplication(application);
  //   setShowStatusModal(true);
  // };

  // const handleOpenCoverLetterModal = (application) => {
  //   setSelectedApplication(application);
  //   setShowCoverLetterModal(true);
  // };

  // İş ilanı detayına yönlendirme
  const handleJobClick = useCallback((jobId) => {
    console.log('🔍 Job ID:', jobId, 'Type:', typeof jobId);
    
    // jobId'yi temizle - eğer virgül varsa ilk değeri al
    const cleanJobId = String(jobId).split(',')[0].trim();
    console.log('✅ Clean Job ID:', cleanJobId);
    
    if (cleanJobId) {
      navigate(`/hospital/jobs/${cleanJobId}`);
    }
  }, [navigate]);

  // Loading state - Sadece kritik veriler yüklenene kadar skeleton göster
  // Diğer veriler (statuses, jobs) arka planda yüklenebilir
  if (applicationsLoading && !applicationsData) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-1 gap-6">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-48 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (applicationsError) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Başvurular Yüklenemedi</h2>
            <p className="text-gray-300 mb-6">{applicationsError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => refetchApplications()} 
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

  // Profil verilerini al (artık kullanılmıyor, kaldırıldı)
  // const profile = profileData?.data?.profile;
  // const institutionName = profile?.institution_name || 'Hastaneniz';

  return (
    <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 p-8 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                {/* Metin ve Buton */}
                <div className="flex flex-1 flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex-1">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Başvurular</h1>
                    <h2 className="mb-4 text-xl font-semibold text-cyan-700 md:text-2xl">
                      Başvuru Değerlendirme ve Yönetim
                    </h2>
                    <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                      İş ilanlarınıza gelen başvuruları inceleyin ve değerlendirin.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/hospital/jobs"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
                    >
                      <Briefcase className="w-5 h-5" />
                      İş İlanlarına Git
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            className="bg-white rounded-2xl border border-blue-100 shadow-lg p-4 relative z-20"
          >
            {/* Üst satır: Tüm Durumlar ve İlanlarım */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                >
                  <option value="">Tüm Durumlar</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlanlarım Filtresi */}
              <div className="relative z-[200]" ref={jobFilterRef}>
                <button
                  ref={(node) => {
                    refs.setReference(node);
                    jobFilterButtonRef.current = node;
                  }}
                  type="button"
                  onClick={() => setIsJobFilterOpen(!isJobFilterOpen)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 hover:border-blue-400 transition-all flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="text-sm font-medium">
                    {selectedJobIds.length > 0 ? `${selectedJobIds.length} İlan Seçili` : 'İlanlarım'}
                  </span>
                  {isJobFilterOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Dropdown Content - Aşağı açılır ve başvuruların üzerinde kalır */}
                {/* Max-height: 5 ilan için yaklaşık 240px (her ilan ~48px) */}
                {/* FloatingPortal kullanarak z-index sorununu çözüyoruz */}
                {isJobFilterOpen && (
                  <FloatingPortal>
                    <div 
                      ref={refs.setFloating}
                      style={floatingStyles}
                      {...getFloatingProps()}
                      className="z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[240px] overflow-y-auto"
                    >
                      {jobsLoading ? (
                        <div className="p-4 text-center text-gray-600">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                          <span className="text-sm">İlanlar yükleniyor...</span>
                        </div>
                      ) : jobs.length === 0 ? (
                        <div className="p-4 text-center text-gray-600">
                          <Briefcase className="w-5 h-5 mx-auto mb-2 opacity-50" />
                          <span className="text-sm">Henüz ilan bulunmamaktadır</span>
                        </div>
                      ) : (
                        <div className="p-2">
                          {jobs.map((job) => (
                            <label
                              key={job.id}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedJobIds.includes(job.id)}
                                onChange={() => handleJobToggle(job.id)}
                                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 font-medium truncate">{job.title}</div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {job.application_count || 0} başvuru
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </FloatingPortal>
                )}
              </div>
            </div>

            {/* Alt satır: Arama */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <div className="relative w-full">
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
                      // requestAnimationFrame kullanarak render'dan sonra cursor pozisyonunu ayarla
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
                    placeholder="Doktor adı veya iş ilanı başlığı ara..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                  />
                  {/* Minimum karakter uyarısı - sadece yazarken göster */}
                  {searchQuery && searchQuery.length > 0 && searchQuery.length < 2 && (
                    <div className="absolute -bottom-5 left-0 text-xs text-yellow-400 mt-1">
                      En az 2 karakter giriniz
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clear button */}
            {(urlSearch || urlStatus || urlJobIds) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {urlSearch && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm">
                    <span>Arama: {urlSearch}</span>
              <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        if (searchInputRef.current) {
                          searchInputRef.current.value = '';
                        }
                        setSearchParams(prev => {
                          const newParams = new URLSearchParams(prev);
                          newParams.delete('search');
                          return newParams;
                        });
                      }}
                      className="hover:text-orange-200"
              >
                <X className="w-4 h-4" />
              </button>
                  </div>
                )}
                {urlStatus && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
                    <span>Durum: {urlStatus}</span>
                    <button
                      type="button"
                      onClick={() => handleFilterChange('status', '')}
                      className="hover:text-blue-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
          </div>
                )}
                {urlJobIds && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                    <span>İlanlar: {selectedJobIds.length} seçili</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJobIds([]);
                        setSearchParams(prev => {
                          const newParams = new URLSearchParams(prev);
                          newParams.delete('jobIds');
                          return newParams;
                        });
                      }}
                      className="hover:text-purple-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              <button
                type="button"
                onClick={clearFilters}
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                  Tümünü Temizle
              </button>
              </div>
            )}
          </form>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">
              {pagination.total || 0} başvuru bulundu
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sayfa:</span>
              <span className="text-gray-900 font-semibold">
                {currentPage} / {pagination.pages || 1}
              </span>
            </div>
          </div>

          {/* Applications List */}
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  statusOptions={statusOptions}
                  onStatusChange={handleStatusChange}
                  onJobClick={handleJobClick}
                />
              ))}
            </div>
          ) : (
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-12 text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Henüz Başvuru Yok
                </h3>
                <p className="text-gray-700 mb-8">
                  İş ilanlarınıza henüz başvuru yapılmamış.
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={(page) => handleFilterChange('page', page)}
              />
            </div>
          )}
        </div>
      </div>
  );
};

// Status Badge Component (ApplicationCard'dan önce tanımlanmalı)
export const StatusBadge = ({ status_id, statusName }) => {
  const statusConfig = {
    1: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Beklemede', icon: Clock },
    2: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'İnceleniyor', icon: Eye },
    3: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Kabul Edildi', icon: CheckCircle },
    4: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Reddedildi', icon: X },
    5: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', label: 'Geri Çekildi', icon: ArrowLeft }
  };

  const config = statusConfig[status_id] || statusConfig[1];
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center justify-center gap-1 w-[140px]`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="text-center truncate">{statusName || config.label}</span>
    </span>
  );
};

// Application Card Component
const ApplicationCardComponent = ({ application, statusOptions, onStatusChange, onJobClick }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Scroll pozisyonunu kaydet
    sessionStorage.setItem('hospital_applications_scroll', window.scrollY.toString());
    // Mevcut URL parametrelerini kaydet
    const currentParams = new URLSearchParams(window.location.search);
    sessionStorage.setItem('hospital_applications_params', currentParams.toString());
    // Detay sayfasına git
    navigate(`/hospital/applications/${application.id}`);
  };

  // Doktor aktif değilse (false, 0, null, undefined) bilgileri gizle
  // Aktif edildiğinde (true, 1) bilgiler tekrar görünür olacak
  const isDoctorInactive = !application.doctor_is_active || application.doctor_is_active === false || application.doctor_is_active === 0;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 hover:shadow-lg transition-all duration-300 min-h-[180px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full">
        {/* Doktor Bilgileri - 4 kolon */}
        <div className="lg:col-span-4 flex flex-col min-w-0">
          <div className="flex items-start flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              {isDoctorInactive ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Kullanıcı Pasif</span>
                  </div>
                  <p className="text-orange-600 text-xs">
                    Bu başvuruyu yapan doktor hesabını sildiği için profil bilgilerine erişilemiyor.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {application.title && `${application.title} `}{application.first_name} {application.last_name}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{application.phone || 'Belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{application.email || 'Belirtilmemiş'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* İlan Bilgileri - 3 kolon */}
        <div className="lg:col-span-3 flex flex-col min-w-0">
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <span className="text-gray-600 text-xs block mb-1 font-medium">İş İlanı</span>
              <p className="text-gray-900 font-semibold mb-1">{application.job_title}</p>
              
              {/* İlan Tarihi */}
              {application.job_created_at && (
                <div className="text-gray-700 text-xs mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>İlan Tarihi: {formatDate(application.job_created_at)}</span>
                </div>
              )}
              
              {/* İş İlanı Durumu */}
              <div className="mb-2">
                {(() => {
                  const status = application.job_status || application.job_status_fallback;
                  
                  // Status'a göre stil belirle (artık backend'den Türkçe geliyor)
                  const getStatusStyles = (statusName) => {
                    if (statusName === 'Onay Bekliyor') {
                      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
                    }
                    if (statusName === 'Revizyon Gerekli') {
                      return 'bg-orange-100 text-orange-800 border border-orange-300';
                    }
                    if (statusName === 'Onaylandı') {
                      return 'bg-green-100 text-green-800 border border-green-300';
                    }
                    if (statusName === 'Pasif') {
                      return 'bg-gray-100 text-gray-800 border border-gray-300';
                    }
                    if (statusName === 'Reddedildi') {
                      return 'bg-red-100 text-red-800 border border-red-300';
                    }
                    // Geriye uyumluluk için eski İngilizce isimler
                    if (statusName === 'Pending Approval') {
                      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
                    }
                    if (statusName === 'Needs Revision') {
                      return 'bg-orange-100 text-orange-800 border border-orange-300';
                    }
                    if (statusName === 'Approved' || statusName === 'Aktif') {
                      return 'bg-green-100 text-green-800 border border-green-300';
                    }
                    if (statusName === 'Passive') {
                      return 'bg-gray-100 text-gray-800 border border-gray-300';
                    }
                    if (statusName === 'Rejected') {
                      return 'bg-red-100 text-red-800 border border-red-300';
                    }
                    return 'bg-gray-100 text-gray-800 border border-gray-300';
                  };
                  
                  return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
                      {status || 'Bilinmiyor'}
                    </span>
                  );
                })()}
              </div>
              
              <button
                onClick={() => onJobClick(application.job_id)}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                İlana Git
              </button>
            </div>
          </div>
        </div>

        {/* Durum Yönetimi - 5 kolon */}
        <div className="lg:col-span-5 flex flex-col min-w-0">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex-1 flex flex-col justify-between min-h-[120px] w-full">
            {isDoctorInactive ? (
              // Pasif doktor için disabled görünüm
              <>
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500 block mb-2 text-center">
                    Başvuru Durumu
                  </label>
                  <div className="flex items-center justify-center">
                    <div className="bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold w-[140px] text-center">
                      Kullanıcı Pasif
                    </div>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full bg-gray-500/10 border border-gray-500/20 text-gray-500 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2 opacity-50"
                >
                  <Eye className="w-3 h-3" />
                  Başvuru Detayları
                </button>
              </>
            ) : (
              // Aktif doktor için normal görünüm
              <>
                {/* Başvuru Durumu */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2 text-center">
                    Başvuru Durumu
                  </label>
                  <div className="flex items-center justify-center">
                    <StatusBadge status_id={application.status_id} statusName={application.status} />
                  </div>
                </div>
                
                {/* Başvuru Detayları Butonu */}
                <button
                  onClick={handleViewDetails}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Eye className="w-3 h-3" />
                  Başvuru Detayları
                </button>
              </>
            )}
          </div>
        </div>
        </div>

            </div>
  );
};

const applicationCardPropsAreEqual = (prev, next) => (
  prev.application === next.application &&
  prev.statusOptions === next.statusOptions &&
  prev.onStatusChange === next.onStatusChange &&
  prev.onJobClick === next.onJobClick
);

const ApplicationCard = memo(ApplicationCardComponent, applicationCardPropsAreEqual);

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

export default HospitalApplications;

