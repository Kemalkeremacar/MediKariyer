/**
 * Users Management Page - Admin kullanıcı yönetimi sayfası
 * Tüm kullanıcıları görüntüleme, düzenleme, silme işlemleri
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUsers, useUpdateUserStatus, useUpdateUserApproval, useDeleteUser } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  UserX,
  Trash2,
  Filter,
  Search,
  X,
  Eye
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    role: '',
    isApproved: '',
    isActive: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Onay bekleyenler için özel görünüm
  const [showPendingOnly, setShowPendingOnly] = useState(false);

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

  const { data: usersData, isLoading, error, refetch } = useUsers(filters);
  const updateUserStatus = useUpdateUserStatus();
  const updateUserApproval = useUpdateUserApproval();
  const deleteUser = useDeleteUser();

  // Loading state'i mutation'lardan al
  const isProcessing = updateUserStatus.isPending || updateUserApproval.isPending || deleteUser.isPending;


  const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : 
                Array.isArray(usersData?.data) ? usersData.data : 
                Array.isArray(usersData) ? usersData : [];
  const pagination = usersData?.data?.pagination || usersData?.pagination || {};

  // Backend endpoint'lerine uygun status change handler
  const handleStatusChange = (userId, field, value) => {
    // Çok hızlı tıklamaları engelle
    if (isProcessing) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }
    
    // Backend endpoint'lerine göre doğru mutation'ı kullan
    if (field === 'is_approved') {
      updateUserApproval.mutate(
        { userId, approved: value, reason: 'Admin tarafından güncellendi' },
        {
          onSuccess: () => {
            showToast.success(value ? 'Kullanıcı onaylandı' : 'Kullanıcı onayı kaldırıldı');
            refetch(); // Manuel refetch ekle
          },
          onError: (error) => {
            showToast.error(error.response?.data?.message || 'Onay durumu güncellenirken hata oluştu');
          }
        }
      );
    } else {
      updateUserStatus.mutate(
        { userId, field, value, reason: 'Admin tarafından güncellendi' },
        {
          onSuccess: () => {
            showToast.success(value ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi');
            refetch(); // Manuel refetch ekle
          },
          onError: (error) => {
            showToast.error(error.response?.data?.message || 'Durum güncellenirken hata oluştu');
          }
        }
      );
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    // Çok hızlı tıklamaları engelle
    if (isProcessing) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }

    const confirmed = await showToast.confirm(
      'Kullanıcıyı Sil',
      `${userEmail} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      {
        confirmText: 'Sil',
        cancelText: 'İptal',
        type: 'danger'
      }
    );

    if (confirmed) {
      deleteUser.mutate(userId, {
        onSuccess: (data) => {
          showToast.success(`${userEmail} kullanıcısı silindi`);
          refetch();
        },
        onError: (error) => {
          console.error('Silme hatası:', error);
          showToast.error(`Kullanıcı silinirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        }
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

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
      // Tüm filtreleri temizle
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

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      doctor: 'bg-blue-100 text-blue-800',
      hospital: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role === 'admin' ? 'Admin' : role === 'doctor' ? 'Doktor' : 'Hastane'}
      </span>
    );
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
              <Users className="h-8 w-8 mr-3 text-indigo-600" />
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-600 mt-2">
              {showPendingOnly 
                ? 'Onay bekleyen kullanıcıları görüntüleyin ve onaylayın'
                : 'Tüm kullanıcıları görüntüleyin, düzenleyin ve onaylayın'
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
            {showPendingOnly ? 'Tüm Kullanıcıları Göster' : 'Sadece Onay Bekleyenleri Göster'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="admin-form-select"
          >
            <option value="">Tüm Roller</option>
            <option value="doctor">Doktor</option>
            <option value="hospital">Hastane</option>
          </select>

          {/* Approval Filter */}
          <select
            value={filters.isApproved}
            onChange={(e) => handleFilterChange('isApproved', e.target.value)}
            className="admin-form-select"
          >
            <option value="">Tüm Onay Durumları</option>
            <option value="true">Onaylı</option>
            <option value="false">Onay Bekleyen</option>
          </select>

          {/* Active Filter */}
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="admin-form-select"
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
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
                          : user.profile?.institution_name || user.profile?.name || 'Kullanıcı'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td>
                    {getRoleBadge(user.role)}
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
                        title="Kullanıcı Detaylarını Görüntüle"
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
                  Toplam <span className="font-medium">{pagination.total}</span> kullanıcıdan{' '}
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
