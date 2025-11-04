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

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, Search, Filter, User, MapPin, Calendar, 
  CheckCircle, X, Clock, Eye, AlertCircle, ArrowRight, 
  RefreshCw, Phone, Mail, Briefcase, Target, Building,
  UserCheck, GraduationCap, Award, Languages, ExternalLink, Settings,
  ArrowLeft, ChevronDown, ChevronUp
} from 'lucide-react';
import { useFloating, autoUpdate, offset, flip, shift, useDismiss, useInteractions, FloatingPortal } from '@floating-ui/react';
import { useHospitalApplications, useUpdateApplicationStatus, useHospitalDoctorProfileDetail, useHospitalJobs } from '../api/useHospital';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';

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

  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null); // Buton referansı için

  // Scroll pozisyonunu kaydet
  const scrollPositionRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dışarı tıklanınca dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobFilterRef.current && !jobFilterRef.current.contains(event.target)) {
        setIsJobFilterOpen(false);
      }
    };

    if (isJobFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isJobFilterOpen]);

  // Sayfa yüklendiğinde scroll pozisyonunu geri yükle
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('hospital_applications_scroll');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('hospital_applications_scroll');
      }, 100);
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

  // URL'den gelen değerleri state'e senkronize et (sadece farklıysa)
  // Doctor Jobs pattern'i - urlStatus, urlSearch, urlPage değerlerini dependency olarak kullan
  useEffect(() => {
    if (urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStatus]); // Doctor Jobs pattern'i
  
  useEffect(() => {
    // Sadece URL'den gelen değer farklıysa ve kullanıcı input'ta değilse güncelle
    // (Cursor pozisyonunu korumak için)
    if (urlSearch !== searchQuery) {
      // Eğer kullanıcı input'ta yazıyorsa, URL'den gelen değeri ignore et
      // Çünkü kullanıcı henüz yazmaya devam ediyor olabilir
      if (document.activeElement === searchInputRef.current) {
        return;
      }
      
      // URL'den gelen değer trim edilmiş olabilir, ama input'ta trim edilmemiş değer olabilir
      // Bu durumda sadece URL değerini state'e yaz ama input'un value'sunu değiştirme
      setSearchQuery(urlSearch);
      
      // Input'un value'sunu sadece kullanıcı input'ta değilse güncelle
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        searchInputRef.current.value = urlSearch;
        // Cursor pozisyonunu sona al (kullanıcı yazmıyorsa sorun değil)
        requestAnimationFrame(() => {
          if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
            searchInputRef.current.setSelectionRange(urlSearch.length, urlSearch.length);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]); // Doctor Jobs pattern'i
  
  useEffect(() => {
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage]); // Doctor Jobs pattern'i

  // URL'den jobIds'i state'e senkronize et
  useEffect(() => {
    if (urlJobIds) {
      const jobIdsArray = urlJobIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      setSelectedJobIds(jobIdsArray);
    } else {
      setSelectedJobIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlJobIds]);

  // 🔹 Adım 4: URL parametrelerini API parametrelerine dönüştür
  const applicationsParams = useMemo(() => {
    const params = {
      page: urlPage || 1,
      limit: 20,
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
  
  // Doktor profil detayı için hook
  const { 
    data: doctorProfileData, 
    isLoading: doctorProfileLoading 
  } = useHospitalDoctorProfileDetail(selectedDoctorId);

  const updateStatusMutation = useUpdateApplicationStatus();

  // Veri parsing
  const applications = applicationsData?.data?.applications || [];
  const pagination = applicationsData?.data?.pagination || {};

  // Fallback status options (Tüm durumlar dahil)
  const statusOptions = applicationStatuses?.length > 0 
    ? applicationStatuses
    : [
        { value: 1, label: 'Başvuruldu', name: 'Başvuruldu' },
        { value: 2, label: 'İnceleniyor', name: 'İnceleniyor' },
        { value: 3, label: 'Kabul Edildi', name: 'Kabul Edildi' },
        { value: 4, label: 'Reddedildi', name: 'Reddedildi' },
        { value: 5, label: 'Geri Çekildi', name: 'Geri Çekildi' }
      ];

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
  const handleStatusChange = async (applicationId, newStatusId, notes = '') => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status_id: parseInt(newStatusId),
        notes: notes || null
      });
    } catch (error) {
      console.error('Başvuru durumu güncelleme hatası:', error);
    }
  };

  // Doktor profil görüntüleme - Popover için
  const handleViewDoctorProfile = (doctorProfileId, buttonRef) => {
    setSelectedDoctorId(doctorProfileId);
    setPopoverAnchor(buttonRef);
  };

  const handleClosePopover = () => {
    setSelectedDoctorId(null);
    setPopoverAnchor(null);
  };

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
  const handleJobClick = (jobId) => {
    console.log('🔍 Job ID:', jobId, 'Type:', typeof jobId);
    
    // jobId'yi temizle - eğer virgül varsa ilk değeri al
    const cleanJobId = String(jobId).split(',')[0].trim();
    console.log('✅ Clean Job ID:', cleanJobId);
    
    if (cleanJobId) {
      navigate(`/hospital/jobs/${cleanJobId}`);
    }
  };

  // Loading state - Sadece kritik veriler yüklenene kadar skeleton göster
  // Diğer veriler (statuses, jobs) arka planda yüklenebilir
  if (applicationsLoading && !applicationsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
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
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Başvurular</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-blue-400 mb-4">
                      Başvuru Değerlendirme ve Yönetim
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      İş ilanlarınıza gelen başvuruları inceleyin ve değerlendirin.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/hospital/jobs"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
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
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4"
          >
            {/* Üst satır: Tüm Durumlar ve İlanlarım */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <option value="" className="bg-slate-800">Tüm Durumlar</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value} className="bg-slate-800">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlanlarım Filtresi */}
              <div className="relative" ref={jobFilterRef}>
                <button
                  type="button"
                  onClick={() => setIsJobFilterOpen(!isJobFilterOpen)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all flex items-center justify-between backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="text-sm font-medium">
                    {selectedJobIds.length > 0 ? `${selectedJobIds.length} İlan Seçili` : 'İlanlarım'}
                  </span>
                  {isJobFilterOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Dropdown Content */}
                {isJobFilterOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto backdrop-blur-md">
                    {jobsLoading ? (
                      <div className="p-4 text-center text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <span className="text-sm">İlanlar yükleniyor...</span>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <Briefcase className="w-5 h-5 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Henüz ilan bulunmamaktadır</span>
                      </div>
                    ) : (
                      <div className="p-2">
                        {jobs.map((job) => (
                          <label
                            key={job.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedJobIds.includes(job.id)}
                              onChange={() => handleJobToggle(job.id)}
                              className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{job.title}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {job.application_count || 0} başvuru
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
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
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all hover:bg-white/10"
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
            <p className="text-gray-300">
              {pagination.total || 0} başvuru bulundu
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sayfa:</span>
              <span className="text-white font-medium">
                {currentPage} / {pagination.pages || 1}
              </span>
            </div>
          </div>

          {/* Applications List */}
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <StaggeredAnimation key={application.id} delay={index * 50}>
                  <ApplicationCard
                    application={application}
                    statusOptions={statusOptions}
                    onStatusChange={handleStatusChange}
                    onViewProfile={handleViewDoctorProfile}
                    onJobClick={handleJobClick}
                  />
                </StaggeredAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Henüz Başvuru Yok
              </h3>
              <p className="text-gray-300 mb-8">
                İş ilanlarınıza henüz başvuru yapılmamış.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handleFilterChange('page', currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                Önceki
              </button>
              
              {Array.from({ length: pagination.pages }, (_, i) => {
                  const page = i + 1;
                const isCurrentPage = page === currentPage;
                const shouldShow = 
                  page === 1 || 
                  page === pagination.pages || 
                  Math.abs(page - currentPage) <= 2;

                if (!shouldShow) {
                  if (page === 2 && currentPage > 4) {
                    return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                  }
                  if (page === pagination.pages - 1 && currentPage < pagination.pages - 3) {
                    return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                  return (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
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
                onClick={() => handleFilterChange('page', currentPage + 1)}
                disabled={currentPage >= pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>

        {/* Doktor Profil Popover */}
        {selectedDoctorId && popoverAnchor && (
          <DoctorProfilePopover
            doctorId={selectedDoctorId}
            doctorData={doctorProfileData?.data}
            isLoading={doctorProfileLoading}
            anchorElement={popoverAnchor}
            onClose={handleClosePopover}
          />
        )}
      </div>
  );
};

// Status Badge Component (ApplicationCard'dan önce tanımlanmalı)
export const StatusBadge = ({ status_id, statusName }) => {
  const statusConfig = {
    1: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', label: 'Beklemede', icon: Clock },
    2: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', label: 'İnceleniyor', icon: Eye },
    3: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', label: 'Kabul Edildi', icon: CheckCircle },
    4: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', label: 'Red Edildi', icon: X },
    5: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', label: 'Geri Çekildi', icon: ArrowLeft }
  };

  const config = statusConfig[status_id] || statusConfig[1];
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {statusName || config.label}
    </span>
  );
};

// Application Card Component
const ApplicationCard = ({ application, statusOptions, onStatusChange, onViewProfile, onJobClick }) => {
  const navigate = useNavigate();
  const profileButtonRef = useRef(null);

  const handleViewDetails = () => {
    // Scroll pozisyonunu kaydet
    sessionStorage.setItem('hospital_applications_scroll', window.scrollY.toString());
    // Mevcut URL parametrelerini kaydet
    const currentParams = new URLSearchParams(window.location.search);
    sessionStorage.setItem('hospital_applications_params', currentParams.toString());
    // Detay sayfasına git
    navigate(`/hospital/applications/${application.id}`);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doktor Bilgileri - 4 kolon */}
        <div className="lg:col-span-4">
          <div className="flex items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                {application.first_name} {application.last_name}
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Phone className="w-3 h-3" />
                  <span className="truncate">{application.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{application.email}</span>
                </div>
              </div>
              <button
                ref={profileButtonRef}
                onClick={() => onViewProfile(application.doctor_profile_id, profileButtonRef.current)}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Profili Görüntüle
              </button>
            </div>
          </div>
        </div>

        {/* İlan Bilgileri - 3 kolon */}
        <div className="lg:col-span-3">
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-xs block mb-1">İş İlanı</span>
              <p className="text-white font-medium mb-1">{application.job_title}</p>
              
              {/* İlan Tarihi */}
              {application.job_created_at && (
                <div className="text-gray-300 text-xs mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>İlan Tarihi: {new Date(application.job_created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              )}
              
              {/* İş İlanı Durumu */}
              <div className="mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (() => {
                    const status = application.job_status || application.job_status_fallback;
                    if (status === 'Aktif') return 'bg-green-500/20 text-green-300 border border-green-500/30';
                    if (status === 'Pasif') return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
                    return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
                  })()
                }`}>
                  {(() => {
                    const status = application.job_status || application.job_status_fallback;
                    if (status === 'Aktif') return '🟢 Aktif';
                    if (status === 'Pasif') return '🟠 Pasif';
                    return `❓ ${status || 'Bilinmiyor'}`;
                  })()}
                </span>
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
        <div className="lg:col-span-5">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            {/* Başvuru Durumu */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2 text-center">
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
          </div>
        </div>
        </div>

            </div>
  );
};

// Floating UI Popover Component
const DoctorProfilePopover = ({ doctorId, doctorData, isLoading, anchorElement, onClose }) => {
  if (!doctorId || !anchorElement) return null;

  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    middleware: [
      offset(12), // Butondan 12px uzaklık
      shift({ padding: 16 }) // Viewport'tan taşmasın ama sağda kalır (flip yok)
    ],
    placement: 'right', // Butonun sağında açıl - sabit kalacak
    whileElementsMounted: autoUpdate
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  // Floating element'i anchor'a bağla
  useEffect(() => {
    if (anchorElement && refs.setReference) {
      refs.setReference(anchorElement);
    }
  }, [anchorElement, refs]);

  if (isLoading) {
    return (
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 w-[400px] max-w-[calc(100vw-32px)] bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
        <div className="flex items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        </div>
      </FloatingPortal>
    );
  }

  const profile = doctorData?.profile;
  const educations = doctorData?.educations || [];
  const experiences = doctorData?.experiences || [];
  const certificates = doctorData?.certificates || [];
  const languages = doctorData?.languages || [];

  if (!profile) {
    return (
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 w-[400px] max-w-[calc(100vw-32px)] bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Profil Bulunamadı</h3>
          <button
            onClick={onClose}
              className="mt-4 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-6 py-2 rounded-xl hover:bg-blue-500/30 transition-all"
          >
            Kapat
          </button>
        </div>
        </div>
      </FloatingPortal>
    );
  }

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className="z-50 w-[600px] max-w-[calc(100vw-32px)] max-h-[85vh] bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
      >
        {/* Header - Sticky */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={`${profile.first_name} ${profile.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                />
              ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1 truncate">
                  {profile.title} {profile.first_name} {profile.last_name}
                </h2>
              <p className="text-gray-300 font-medium text-sm truncate">{profile.specialty_name || 'Uzmanlık Belirtilmemiş'}</p>
                {profile.subspecialty_name && (
                <p className="text-gray-400 text-xs truncate">Yan Dal: {profile.subspecialty_name}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0 ml-2"
            aria-label="Kapat"
            >
            <X className="w-5 h-5" />
            </button>
          </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">

          {/* Kişisel ve İletişim Bilgileri */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Kişisel ve İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Ad Soyad</span>
                <p className="text-white font-medium">
                  {profile.title} {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Telefon</span>
                <p className="text-white">{profile.phone || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">E-posta</span>
                <p className="text-white">{profile.email || 'Belirtilmemiş'}</p>
              </div>
              {profile.dob && (
                <div>
                  <span className="text-gray-400 text-sm">Doğum Tarihi</span>
                  <p className="text-white">{new Date(profile.dob).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              {profile.birth_place_name && (
                <div>
                  <span className="text-gray-400 text-sm">Doğum Yeri</span>
                  <p className="text-white">{profile.birth_place_name}</p>
                </div>
              )}
              {profile.residence_city_name && (
                <div>
                  <span className="text-gray-400 text-sm">İkamet Şehri</span>
                  <p className="text-white">{profile.residence_city_name}</p>
                </div>
              )}
              {profile.specialty_name && (
                <div>
                  <span className="text-gray-400 text-sm">Uzmanlık Alanı</span>
                  <p className="text-white">{profile.specialty_name}</p>
                </div>
              )}
              {profile.subspecialty_name && (
                <div>
                  <span className="text-gray-400 text-sm">Yan Dal</span>
                  <p className="text-white">{profile.subspecialty_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          {educations.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-400" />
                Eğitim Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {edu.institution_name}
                        </h4>
                        <p className="text-gray-300 text-xs mb-1 line-clamp-2">
                          {edu.field}
                        </p>
                        {edu.degree_type && (
                          <p className="text-gray-400 text-xs mb-2">
                            {edu.degree_type}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                            {edu.graduation_year}
                          </span>
                      {edu.education_type_name && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                          {edu.education_type_name}
                        </span>
                      )}
                    </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deneyim Bilgileri */}
          {experiences.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                İş Deneyimi
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold text-sm line-clamp-2">
                            {exp.role_title}
                          </h4>
                      {exp.is_current && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium ml-2 flex-shrink-0">
                          Devam Ediyor
                        </span>
                      )}
                    </div>
                        <p className="text-gray-300 text-xs mb-1 line-clamp-2">
                          {exp.organization}
                        </p>
                    {exp.specialty_name && (
                          <p className="text-gray-400 text-xs mb-2">
                        Uzmanlık: {exp.specialty_name}
                        {exp.subspecialty_name && ` - ${exp.subspecialty_name}`}
                      </p>
                    )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                      {new Date(exp.start_date).toLocaleDateString('tr-TR')} - 
                      {exp.is_current ? ' Devam Ediyor' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş')}
                          </span>
                        </div>
                    {exp.description && (
                          <p className="text-gray-300 text-xs mt-2 pt-2 border-t border-white/10 line-clamp-3">
                        {exp.description}
                      </p>
                    )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sertifikalar */}
          {certificates.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Sertifikalar ve Kurslar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {cert.certificate_name || 'Sertifika'}
                        </h4>
                        <p className="text-gray-300 text-xs mb-1 flex items-center gap-1">
                          <span className="text-yellow-400">📍</span>
                          {cert.institution}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">
                            {cert.certificate_year}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dil Bilgileri */}
          {languages.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-cyan-400" />
                Dil Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Languages className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {lang.language_name}
                        </h4>
                        <p className="text-gray-300 text-xs mb-2">
                          Seviye: {lang.level_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs font-medium">
                            {lang.level_name}
                  </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>
          </div>
    </FloatingPortal>
  );
};

export default HospitalApplications;
