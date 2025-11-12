/**
 * Doctors Management Page - Admin doktor yönetimi sayfası
 * Sadece doktorları görüntüleme, düzenleme, onaylama işlemleri
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUsers, useUpdateUserStatus, useUpdateUserApproval } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { useLookup } from '@/hooks/useLookup';
import { 
  Stethoscope, 
  Eye,
  Search
} from 'lucide-react';

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    role: 'doctor', // Sabit: sadece doktorlar
    isApproved: '',
    isActive: '',
    doctor_search: '',
    specialty_id: '',
    subspecialty_id: '',
    city_id: '',
    page: 1,
    limit: 10
  });

  // Local search input state (anında güncellenir)
  const [searchInput, setSearchInput] = useState('');
  
  // Refs for cursor and scroll position management
  const searchInputRef = useRef(null);
  const cursorPositionRef = useRef(null);
  const scrollPositionRef = useRef(null);
  const shouldRestoreFocusRef = useRef(false);

  // Onay bekleyenler için özel görünüm
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Lookup verileri
  const { data: lookupData, loading: lookupLoading } = useLookup();
  const specialties = lookupData?.specialties || [];
  const subspecialties = lookupData?.subspecialties || [];
  const cities = lookupData?.cities || [];

  // Seçili ana dal'a göre yan dalları filtrele
  const filteredSubspecialties = filters.specialty_id 
    ? subspecialties.filter(sub => sub.specialty_id === parseInt(filters.specialty_id))
    : [];

  // URL parametrelerini kontrol et ve filtreleri ayarla
  useEffect(() => {
    const isApprovedParam = searchParams.get('isApproved');
    if (isApprovedParam === 'false') {
      setFilters(prev => ({
        ...prev,
        isApproved: 'false'
      }));
      setShowPendingOnly(true);
    }
  }, [searchParams]);

  // Scroll pozisyonunu kaydet
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: usersData, isLoading, error, refetch } = useUsers(filters);
  const updateUserStatus = useUpdateUserStatus();
  const updateUserApproval = useUpdateUserApproval();

  // Loading state'i mutation'lardan al
  const isProcessing = updateUserStatus.isPending || updateUserApproval.isPending;


  const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : 
                Array.isArray(usersData?.data) ? usersData.data : 
                Array.isArray(usersData) ? usersData : [];
  const pagination = usersData?.data?.pagination || usersData?.pagination || {};

  // Backend endpoint'lerine uygun status change handler
  const handleStatusChange = (userId, field, value) => {
    // Çok hızlı tıklamaları engelle
    if (isProcessing) {
      showToast.warning(toastMessages.general.loading);
      return;
    }
    
    // Backend endpoint'lerine göre doğru mutation'ı kullan
    if (field === 'is_approved') {
      updateUserApproval.mutate(
        { userId, approved: value, reason: 'Admin tarafından güncellendi' },
        {
          onSuccess: () => {
            showToast.success(value ? toastMessages.user.doctorApproveSuccess : toastMessages.user.doctorApproveRemoved);
            refetch(); // Manuel refetch ekle
          },
          onError: (error) => {
            showToast.error(error, { defaultMessage: toastMessages.user.approveError });
          }
        }
      );
    } else {
      updateUserStatus.mutate(
        { userId, field, value, reason: 'Admin tarafından güncellendi' },
        {
          onSuccess: () => {
            showToast.success(value ? toastMessages.user.doctorActivateSuccess : toastMessages.user.doctorDeactivateSuccess);
            refetch(); // Manuel refetch ekle
          },
          onError: (error) => {
            showToast.error(error, { defaultMessage: toastMessages.user.statusUpdateError });
          }
        }
      );
    }
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
  const commitSearchToUrl = useCallback((cursorPosBeforeCommit = null) => {
    if (searchInputRef.current === document.activeElement) {
      const originalQuery = searchInput || '';
      const value = originalQuery.trim().replace(/\s+/g, ' ').slice(0, 100);

      // Cursor pozisyonunu kaydet (trim öncesi - en önemli adım!)
      const cursorPosition = cursorPosBeforeCommit ?? searchInputRef.current?.selectionStart ?? cursorPositionRef.current ?? originalQuery.length;
      
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
        doctor_search: value,
        page: 1 // Arama yapıldığında ilk sayfaya dön
      }));

      // State'i güncelle (URL'den gelecek değer yerine doğrudan burada güncelle)
      setSearchInput(value);

      // Hemen focus'u koru (hemen bir kez dene)
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          if (cursorPositionRef.current !== null) {
            searchInputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
          }
        }
      });
    }
  }, [searchInput]);

  // Filter güncellemesinden sonra cursor pozisyonunu ve focus'u koru
  useEffect(() => {
    // Enter'a basıldıktan sonra focus'u restore et
    if (shouldRestoreFocusRef.current && searchInputRef.current) {
      // Render döngüsünü bekle ve focus'u restore et (birden fazla kez dene)
      const restoreFocus = () => {
        if (searchInputRef.current) {
          // Input'un value'sunu ayarla
          searchInputRef.current.value = searchInput;
          
          // Focus'u restore et
          searchInputRef.current.focus();

          // Cursor pozisyonunu restore et
          if (cursorPositionRef.current !== null) {
            const pos = Math.min(cursorPositionRef.current, searchInput.length);
            searchInputRef.current.setSelectionRange(pos, pos);
          }
          
          // Scroll pozisyonunu geri yükle
          if (scrollPositionRef.current !== null) {
            window.scrollTo(0, scrollPositionRef.current);
          }
        }
      };

      // İlk deneme (hemen)
      requestAnimationFrame(() => {
        restoreFocus();
        
        // İkinci deneme (bir sonraki frame)
        requestAnimationFrame(() => {
          restoreFocus();
          
          // Üçüncü deneme (React Query'nin refetch'i bitmesi için biraz bekle)
          setTimeout(() => {
            if (shouldRestoreFocusRef.current && searchInputRef.current) {
              restoreFocus();
              shouldRestoreFocusRef.current = false;
            }
          }, 50);
        });
      });
    }
  }, [filters.doctor_search, searchInput]);

  const handleShowPendingOnly = () => {
    setShowPendingOnly(!showPendingOnly);
    if (!showPendingOnly) {
      // Onay bekleyenleri göster
      setFilters(prev => ({
        ...prev,
        isApproved: 'false',
        isActive: 'true',
        page: 1
      }));
    } else {
      // Tüm filtreleri temizle (role hariç)
      setFilters(prev => ({
        ...prev,
        isApproved: '',
        isActive: '',
        page: 1
      }));
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getApprovalBadge = (isApproved) => {
    if (isApproved) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Onaylı</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Onay Bekliyor</span>;
  };

  const getActivityBadge = (isActive) => {
    if (isActive) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Aktif</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Pasif</span>;
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md shadow-lg">
        <p className="text-red-700 font-medium">Hata oluştu: {error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="h-8 w-8 mr-3 text-blue-600" />
              Doktorlar
            </h1>
            <p className="text-gray-600 mt-2">
              {showPendingOnly 
                ? 'Onay bekleyen doktorları görüntüleyin ve onaylayın'
                : 'Tüm doktorları görüntüleyin, düzenleyin ve onaylayın'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl p-4 mb-6 border border-slate-600/30 hover:shadow-xl transition-all duration-300">
        {/* Onay Bekleyenler Toggle */}
        <div className="mb-4">
          <button
            onClick={handleShowPendingOnly}
            className={`admin-btn transition-all duration-300 ${
              showPendingOnly
                ? 'admin-btn-warning'
                : 'admin-btn-outline'
            }`}
          >
            {showPendingOnly ? 'Tüm Doktorları Göster' : 'Sadece Onay Bekleyenleri Göster'}
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Doktor adı veya soyadı ile ara..."
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                const cursorPos = e.target.selectionStart || value.length;

                // Cursor pozisyonunu kaydet
                cursorPositionRef.current = cursorPos;

                setSearchInput(value);

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
                  e.stopPropagation();
                  
                  const cursorPos = e.target.selectionStart ?? searchInputRef.current?.selectionStart ?? cursorPositionRef.current ?? searchInput.length;
                  commitSearchToUrl(cursorPos);
                  
                  return false;
                }
              }}
              className="admin-form-input w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-text"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

          {/* Approval Filter */}
          <select
            value={filters.isApproved}
            onChange={(e) => handleFilterChange('isApproved', e.target.value)}
            className="admin-form-select"
          >
            <option value="">Onay Durumu</option>
            <option value="true">Onaylı</option>
            <option value="false">Onay Bekleyen</option>
          </select>

          {/* Active Filter */}
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="admin-form-select"
          >
            <option value="">Aktiflik Durumu</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Doktor</th>
                <th>Onay Durumu</th>
                <th>Aktivite Durumu</th>
                <th>Kayıt Tarihi</th>
                <th>Son Giriş</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.profile?.first_name && user.profile?.last_name 
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : 'Doktor'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td>
                    {getApprovalBadge(user.is_approved)}
                  </td>
                  <td>
                    {getActivityBadge(user.is_active)}
                  </td>
                  <td>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('tr-TR') : 'Hiç giriş yapmamış'}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      {/* Detay Butonu - Her zaman göster */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${user.id}`);
                        }}
                        className="admin-btn admin-btn-sm admin-btn-primary"
                        title="Doktor Detaylarını Görüntüle"
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

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-t border-slate-600/30 sm:px-6">
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
                  Toplam <span className="font-medium">{pagination.total}</span> doktordan{' '}
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
    </div>
  );
};

export default UsersPage;
