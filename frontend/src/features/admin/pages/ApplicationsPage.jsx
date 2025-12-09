/**
 * ApplicationsPage - Admin başvuru yönetimi sayfası
 * Tüm başvuruları görüntüleme ve yönetme
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApplications } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Building
} from 'lucide-react';
import { useLookup } from '../../../hooks/useLookup';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: '',
    doctor_search: '',
    hospital_search: '',
    page: 1,
    limit: 10
  });

  const [searchInputs, setSearchInputs] = useState({
    doctor_search: '',
    hospital_search: ''
  });

  // Refs to maintain focus and cursor position
  const doctorSearchRef = useRef(null);
  const hospitalSearchRef = useRef(null);
  const doctorCursorPositionRef = useRef(null);
  const hospitalCursorPositionRef = useRef(null);
  const doctorScrollPositionRef = useRef(null);
  const hospitalScrollPositionRef = useRef(null);
  const shouldRestoreDoctorFocusRef = useRef(false);
  const shouldRestoreHospitalFocusRef = useRef(false);

  // URL parametrelerini kontrol et ve filtreleri ayarla
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilters(prev => ({
        ...prev,
        status: statusParam
      }));
    }
  }, [searchParams]);

  // Scroll pozisyonunu kaydet
  useEffect(() => {
    const handleScroll = () => {
      doctorScrollPositionRef.current = window.scrollY;
      hospitalScrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lookup Data Hook
  const { 
    isLoading: lookupLoading 
  } = useLookup();

  // Application statuses - hardcoded for now (can be moved to lookup later)
  const applicationStatuses = [
    { id: 1, name: 'Başvuruldu' },
    { id: 2, name: 'İnceleniyor' },
    { id: 3, name: 'Kabul Edildi' },
    { id: 4, name: 'Reddedildi' },
    { id: 5, name: 'Geri Çekildi' }
  ];

  const { data: applicationsData, isLoading, error, refetch } = useApplications(filters);

  const applications = Array.isArray(applicationsData?.data?.data) ? applicationsData.data.data : 
                     Array.isArray(applicationsData?.data) ? applicationsData.data : 
                     Array.isArray(applicationsData) ? applicationsData : [];
  const pagination = applicationsData?.data?.pagination || applicationsData?.pagination || {};

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  // Search input için commit fonksiyonu (Enter tuşu için)
  const commitSearchToFilters = useCallback((field, cursorPosBeforeCommit = null) => {
    const searchRef = field === 'doctor_search' ? doctorSearchRef : hospitalSearchRef;
    const cursorPositionRef = field === 'doctor_search' ? doctorCursorPositionRef : hospitalCursorPositionRef;
    const scrollPositionRef = field === 'doctor_search' ? doctorScrollPositionRef : hospitalScrollPositionRef;
    const shouldRestoreFocusRef = field === 'doctor_search' ? shouldRestoreDoctorFocusRef : shouldRestoreHospitalFocusRef;

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
    // Doctor search için
    if (shouldRestoreDoctorFocusRef.current && doctorSearchRef.current) {
      const restoreFocus = () => {
        if (doctorSearchRef.current) {
          doctorSearchRef.current.value = searchInputs.doctor_search;
          doctorSearchRef.current.focus();
          if (doctorCursorPositionRef.current !== null) {
            const pos = Math.min(doctorCursorPositionRef.current, searchInputs.doctor_search.length);
            doctorSearchRef.current.setSelectionRange(pos, pos);
          }
          if (doctorScrollPositionRef.current !== null) {
            window.scrollTo(0, doctorScrollPositionRef.current);
          }
        }
      };

      requestAnimationFrame(() => {
        restoreFocus();
        requestAnimationFrame(() => {
          restoreFocus();
          setTimeout(() => {
            if (shouldRestoreDoctorFocusRef.current && doctorSearchRef.current) {
              restoreFocus();
              shouldRestoreDoctorFocusRef.current = false;
            }
          }, 50);
        });
      });
    }
  }, [filters.doctor_search, searchInputs.doctor_search]);

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
    const searchRef = field === 'doctor_search' ? doctorSearchRef : hospitalSearchRef;
    const cursorPositionRef = field === 'doctor_search' ? doctorCursorPositionRef : hospitalCursorPositionRef;

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

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };


  const handleViewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`);
  };


  const getStatusBadge = (statusId, statusName) => {
    // Status ID'ye göre config (database tablosuna göre)
    const statusConfig = {
      1: { // Beklemede
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        icon: Clock,
        text: 'Beklemede'
      },
      2: { // İnceleniyor
        color: 'bg-blue-100 text-blue-800 border-blue-300', 
        icon: Eye,
        text: 'İnceleniyor'
      },
      3: { // Kabul Edildi
        color: 'bg-green-100 text-green-800 border-green-300', 
        icon: CheckCircle,
        text: 'Kabul Edildi'
      },
      4: { // Reddedildi
        color: 'bg-red-100 text-red-800 border-red-300', 
        icon: XCircle,
        text: 'Reddedildi'
      },
      5: { // Geri Çekildi
        color: 'bg-gray-100 text-gray-800 border-gray-300', 
        icon: ArrowLeft,
        text: 'Geri Çekildi'
      }
    };

    const config = statusConfig[statusId] || statusConfig[1]; // Default to 'Beklemede'
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusName || config.text}
      </span>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Hata oluştu: {error.message}</div>;

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-indigo-600" />
                Başvuru Yönetimi
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Tüm başvuruları görüntüleyin ve takip edin
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-600/30 hover:shadow-xl transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div className="md:col-span-1">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="admin-form-select"
              >
                <option value="">Tüm Durumlar</option>
                {applicationStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Inputs */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="relative">
                <input
                  ref={doctorSearchRef}
                  type="text"
                  placeholder="Doktor adı/soyadı..."
                  value={searchInputs.doctor_search}
                  onChange={(e) => handleSearchInputChange('doctor_search', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      const cursorPos = e.target.selectionStart ?? doctorSearchRef.current?.selectionStart ?? doctorCursorPositionRef.current ?? searchInputs.doctor_search.length;
                      commitSearchToFilters('doctor_search', cursorPos);
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
                  placeholder="Hastane adı..."
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
          </div>
        </div>

        {/* Applications Table */}
        <div className="admin-table">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Doktor</th>
                  <th>İş İlanı</th>
                  <th>Hastane</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr 
                    key={application.id} 
                    onClick={() => handleViewApplication(application.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {application.first_name} {application.last_name}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900">{application.job_title}</div>
                        {/* Pasif ilan veya pasif hastane kontrolü */}
                        {((application.job_status_id === 4) || (application.hospital_is_active === false || application.hospital_is_active === 0)) && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                            {application.job_status_id === 4 ? 'İlan Pasif' : application.hospital_is_active === false || application.hospital_is_active === 0 ? 'Hastane Pasif' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{application.institution_name}</div>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(application.status_id, application.status)}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(application.applied_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewApplication(application.id);
                          }}
                          className="admin-btn admin-btn-sm admin-btn-primary"
                          title="Detayları görüntüle"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Detay
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                onClick={() => handleViewApplication(application.id)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {application.first_name} {application.last_name}
                    </h3>
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-sm text-gray-600">{application.job_title}</p>
                      {/* Pasif ilan veya pasif hastane kontrolü */}
                      {((application.job_status_id === 4) || (application.hospital_is_active === false || application.hospital_is_active === 0)) && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300 w-fit">
                          {application.job_status_id === 4 ? 'İlan Pasif' : application.hospital_is_active === false || application.hospital_is_active === 0 ? 'Hastane Pasif' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Building className="h-4 w-4 mr-1" />
                      {application.institution_name}
                    </div>
                  </div>
                  {getStatusBadge(application.status_id, application.status)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    {new Date(application.applied_at).toLocaleDateString('tr-TR')}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewApplication(application.id);
                    }}
                    className="admin-btn admin-btn-sm admin-btn-primary"
                    title="Detayları görüntüle"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Detay
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-slate-800/90 px-3 sm:px-4 py-3 flex items-center justify-between border-t border-slate-600/30 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-slate-500 text-xs sm:text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                >
                  Önceki
                </button>
                <div className="flex items-center text-xs text-slate-300">
                  Sayfa {pagination.current_page} / {pagination.total_pages}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.total_pages}
                  className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-slate-500 text-xs sm:text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Toplam <span className="font-medium">{pagination.total}</span> başvurudan{' '}
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
                        className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium ${
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
    </div>
  );
};

export default ApplicationsPage;
