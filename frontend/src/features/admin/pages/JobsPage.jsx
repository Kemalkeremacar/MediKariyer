/**
 * Admin Jobs Page - İş İlanları Yönetimi
 * Basit, temiz liste - Sadece önemli bilgiler
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminJobs } from '../api/useAdmin';
import { useLookup } from '../../../hooks/useLookup';
import { 
  Briefcase, Eye, MapPin, Target, Calendar, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const AdminJobsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    title_search: '',
    hospital_search: '',
    specialty_id: '',
    subspecialty_id: '',
    city_id: '',
    page: 1,
    limit: 10
  });

  // Local search input states
  const [searchInputs, setSearchInputs] = useState({
    title_search: '',
    hospital_search: ''
  });

  // Refs for cursor and scroll position management
  const titleSearchRef = useRef(null);
  const hospitalSearchRef = useRef(null);
  const titleCursorPositionRef = useRef(null);
  const hospitalCursorPositionRef = useRef(null);
  const titleScrollPositionRef = useRef(null);
  const hospitalScrollPositionRef = useRef(null);
  const shouldRestoreTitleFocusRef = useRef(false);
  const shouldRestoreHospitalFocusRef = useRef(false);

  // Lookup verileri
  const { data: lookupData, loading: lookupLoading } = useLookup();
  const specialties = lookupData?.specialties || [];
  const subspecialties = lookupData?.subspecialties || [];
  const cities = lookupData?.cities || [];

  // Seçili ana dal'a göre yan dalları filtrele
  const filteredSubspecialties = filters.specialty_id 
    ? subspecialties.filter(sub => sub.specialty_id === parseInt(filters.specialty_id))
    : [];

  // Scroll pozisyonunu kaydet
  useEffect(() => {
    const handleScroll = () => {
      titleScrollPositionRef.current = window.scrollY;
      hospitalScrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data, isLoading, error } = useAdminJobs(filters);

  const jobs = data?.data?.data?.data || data?.data?.data || [];
  const rawPagination = data?.data?.data?.pagination || data?.data?.pagination || {};
  
  // Normalize pagination format to match other pages (UsersPage, HospitalsPage, ApplicationsPage)
  const pagination = {
    current_page: rawPagination.page || rawPagination.current_page || 1,
    per_page: rawPagination.limit || rawPagination.per_page || 10,
    total: rawPagination.total || 0,
    total_pages: rawPagination.pages || rawPagination.total_pages || Math.ceil((rawPagination.total || 0) / (rawPagination.limit || rawPagination.per_page || 10)) || 1
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value,
        page: 1
      };
      
      // Ana dal değiştiğinde yan dal'ı sıfırla
      if (key === 'specialty_id') {
        newFilters.subspecialty_id = '';
      }
      
      return newFilters;
    });
  };

  // Search input için commit fonksiyonu (Enter tuşu için)
  const commitSearchToFilters = useCallback((field, cursorPosBeforeCommit = null) => {
    const searchRef = field === 'title_search' ? titleSearchRef : hospitalSearchRef;
    const cursorPositionRef = field === 'title_search' ? titleCursorPositionRef : hospitalCursorPositionRef;
    const scrollPositionRef = field === 'title_search' ? titleScrollPositionRef : hospitalScrollPositionRef;
    const shouldRestoreFocusRef = field === 'title_search' ? shouldRestoreTitleFocusRef : shouldRestoreHospitalFocusRef;

    if (searchRef.current === document.activeElement) {
      const originalQuery = searchInputs[field] || '';
      const value = originalQuery.trim().replace(/\s+/g, ' ').slice(0, 100);

      // Cursor pozisyonunu kaydet (trim öncesi)
      const cursorPosition = cursorPosBeforeCommit ?? searchRef.current?.selectionStart ?? cursorPositionRef.current ?? originalQuery.length;
      
      // Trim işlemi nedeniyle cursor pozisyonunu hesapla
      const trimmedStart = originalQuery.length - (originalQuery.trimStart() || '').length;
      const trimmedLength = value.length;
      
      let newPos = cursorPosition;
      if (cursorPosition > trimmedStart) {
        newPos = Math.min(cursorPosition - trimmedStart, trimmedLength);
      } else {
        newPos = Math.min(cursorPosition, trimmedLength);
      }
      newPos = Math.min(newPos, value.length);
      
      cursorPositionRef.current = newPos;

      // Scroll pozisyonunu kaydet
      scrollPositionRef.current = window.scrollY;

      // Focus'u restore etmek için flag set et
      shouldRestoreFocusRef.current = true;

      // Filtreleri güncelle (sadece Enter'a basıldığında)
      setFilters(prev => ({
        ...prev,
        [field]: value,
        page: 1
      }));

      // State'i güncelle
      setSearchInputs(prev => ({
        ...prev,
        [field]: value
      }));

      // Hemen focus'u koru
      requestAnimationFrame(() => {
        if (searchRef.current) {
          searchRef.current.focus();
          if (cursorPositionRef.current !== null) {
            searchRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
          }
        }
      });
    }
  }, [searchInputs]);

  // Filter güncellemesinden sonra cursor pozisyonunu ve focus'u koru
  useEffect(() => {
    // Title search için
    if (shouldRestoreTitleFocusRef.current && titleSearchRef.current) {
      const restoreFocus = () => {
        if (titleSearchRef.current) {
          titleSearchRef.current.value = searchInputs.title_search;
          titleSearchRef.current.focus();
          if (titleCursorPositionRef.current !== null) {
            const pos = Math.min(titleCursorPositionRef.current, searchInputs.title_search.length);
            titleSearchRef.current.setSelectionRange(pos, pos);
          }
          if (titleScrollPositionRef.current !== null) {
            window.scrollTo(0, titleScrollPositionRef.current);
          }
        }
      };

      requestAnimationFrame(() => {
        restoreFocus();
        requestAnimationFrame(() => {
          restoreFocus();
          setTimeout(() => {
            if (shouldRestoreTitleFocusRef.current && titleSearchRef.current) {
              restoreFocus();
              shouldRestoreTitleFocusRef.current = false;
            }
          }, 50);
        });
      });
    }
  }, [filters.title_search, searchInputs.title_search]);

  useEffect(() => {
    // Hospital search için
    if (shouldRestoreHospitalFocusRef.current && hospitalSearchRef.current) {
      const restoreFocus = () => {
        if (hospitalSearchRef.current) {
          hospitalSearchRef.current.value = searchInputs.hospital_search;
          hospitalSearchRef.current.focus();
          if (hospitalCursorPositionRef.current !== null) {
            const pos = Math.min(hospitalCursorPositionRef.current, searchInputs.hospital_search.length);
            hospitalSearchRef.current.setSelectionRange(pos, pos);
          }
          if (hospitalScrollPositionRef.current !== null) {
            window.scrollTo(0, hospitalScrollPositionRef.current);
          }
        }
      };

      requestAnimationFrame(() => {
        restoreFocus();
        requestAnimationFrame(() => {
          restoreFocus();
          setTimeout(() => {
            if (shouldRestoreHospitalFocusRef.current && hospitalSearchRef.current) {
              restoreFocus();
              shouldRestoreHospitalFocusRef.current = false;
            }
          }, 50);
        });
      });
    }
  }, [filters.hospital_search, searchInputs.hospital_search]);

  const handleSearchInputChange = (field, value) => {
    const searchRef = field === 'title_search' ? titleSearchRef : hospitalSearchRef;
    const cursorPositionRef = field === 'title_search' ? titleCursorPositionRef : hospitalCursorPositionRef;

    const cursorPos = searchRef.current?.selectionStart || value.length;
    cursorPositionRef.current = cursorPos;

    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));

    // Cursor pozisyonunu geri yükle
    requestAnimationFrame(() => {
      if (searchRef.current && document.activeElement === searchRef.current) {
        const newPos = Math.min(cursorPos, value.length);
        searchRef.current.setSelectionRange(newPos, newPos);
        cursorPositionRef.current = newPos;
      }
    });
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Aktif': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Pasif': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];
    const IconComponent = config.icon;

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-lg mb-6" />
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} className="h-24 bg-gray-200 rounded-xl mb-4" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
              <p className="text-gray-600">{error.message || 'İş ilanları yüklenemedi'}</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Briefcase className="h-8 w-8 mr-3 text-indigo-600" />
                İş İlanları Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">Tüm hastanelerin iş ilanlarını görüntüleyin ve yönetin</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl p-4 mb-6 border border-slate-600/30 hover:shadow-xl transition-all duration-300">
          {/* Search Inputs */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                ref={titleSearchRef}
                type="text"
                placeholder="İş ilanı başlığı ile ara..."
                value={searchInputs.title_search}
                onChange={(e) => handleSearchInputChange('title_search', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const cursorPos = e.target.selectionStart ?? titleSearchRef.current?.selectionStart ?? titleCursorPositionRef.current ?? searchInputs.title_search.length;
                    commitSearchToFilters('title_search', cursorPos);
                    return false;
                  }
                }}
                className="admin-form-input w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-text"
                autoComplete="off"
              />
            </div>
            <div className="relative">
              <input
                ref={hospitalSearchRef}
                type="text"
                placeholder="Hastane adı ile ara..."
                value={searchInputs.hospital_search}
                onChange={(e) => handleSearchInputChange('hospital_search', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const cursorPos = e.target.selectionStart ?? hospitalSearchRef.current?.selectionStart ?? hospitalCursorPositionRef.current ?? searchInputs.hospital_search.length;
                    commitSearchToFilters('hospital_search', cursorPos);
                    return false;
                  }
                }}
                className="admin-form-input w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-text"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Specialty Filter */}
            <select
              value={filters.specialty_id}
              onChange={(e) => handleFilterChange('specialty_id', e.target.value)}
              className="admin-form-select"
              disabled={lookupLoading?.isLoading}
            >
              <option value="">Tüm Ana Dallar</option>
              {specialties.map(specialty => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>

            {/* Subspecialty Filter */}
            <select
              value={filters.subspecialty_id}
              onChange={(e) => handleFilterChange('subspecialty_id', e.target.value)}
              className="admin-form-select"
              disabled={lookupLoading?.isLoading || !filters.specialty_id}
            >
              <option value="">Tüm Yan Dallar</option>
              {filteredSubspecialties.map(subspecialty => (
                <option key={subspecialty.value} value={subspecialty.value}>
                  {subspecialty.label}
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={filters.city_id}
              onChange={(e) => handleFilterChange('city_id', e.target.value)}
              className="admin-form-select"
              disabled={lookupLoading?.isLoading}
            >
              <option value="">Tüm Şehirler</option>
              {cities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* İlan Başlığı ve Durum - 4 kolon */}
                  <div className="lg:col-span-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-gray-500">
                        {job.application_count || 0} Başvuru
                      </span>
                    </div>
                  </div>

                  {/* Hastane - 2 kolon */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="truncate">{job.institution_name || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Uzmanlık - 2 kolon */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{job.specialty || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Şehir - 2 kolon */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{job.city || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Tarih ve Buton - 2 kolon */}
                  <div className="lg:col-span-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/jobs/${job.id}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">İş İlanı Bulunamadı</h3>
            <p className="text-gray-500">Henüz hiç iş ilanı oluşturulmamış.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-t border-slate-600/30 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{pagination.total}</span> ilandan{' '}
                  <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> -{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  arası gösteriliyor
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current_page
                          ? 'z-10 bg-indigo-500 border-indigo-400 text-white'
                          : 'bg-slate-700 border-slate-500 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;
