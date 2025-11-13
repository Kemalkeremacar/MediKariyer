/**
 * @file NotificationSendPage.jsx
 * @description Admin Bildirim Gönderme Sayfası - Kullanıcılara toplu bildirim gönderme
 * 
 * Özellikler:
 * - Akıllı filtreleme sistemi (rol, onay durumu, aktif durumu)
 * - Kullanıcı seçimi (multi-select, arama)
 * - Bildirim içeriği oluşturma
 * - Önizleme ve gönderme
 * - Modern admin teması
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Send, ArrowLeft, Users, Search, CheckCircle2, 
  X, UserCheck, UserX, Building2, Stethoscope, Shield,
  Info, AlertCircle, CheckCircle, XCircle, Loader
} from 'lucide-react';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS } from '@config/api';
import { ROUTE_CONFIG } from '@config/routes';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

/**
 * Kullanıcıları getir (admin için)
 */
const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', 'for-notification', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      return apiRequest.get(`${ENDPOINTS.ADMIN.USERS}${queryString ? `?${queryString}` : ''}`);
    },
    staleTime: 0, // Her zaman fresh data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Bildirim gönderme mutation
 */
const useSendNotification = () => {
  return useMutation({
    mutationFn: (data) => apiRequest.post(ENDPOINTS.NOTIFICATIONS.SEND, data),
    onSuccess: (response) => {
      const sentCount = response?.data?.data?.sent_count || 0;
      showToast.success(`${sentCount} kullanıcıya bildirim gönderildi`);
    },
    onError: (error) => {
      showToast.error(error, { defaultMessage: 'Bildirim gönderilirken bir hata oluştu' });
    },
  });
};

const NotificationSendPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
  });
  
  // Filtreler
  const [filters, setFilters] = useState({
    is_approved: '',
    is_active: '',
    search: '',
  });
  
  // Seçili roller (checkbox olarak) - Başlangıçta hiçbiri seçili değil
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  
  // Seçili kullanıcılar
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState('role'); // 'role' veya 'users'
  
  // Backend'e gönderilecek filtreler (role dahil)
  const backendFilters = useMemo(() => {
    const backendFilterObj = { ...filters };
    
    // Seçili roller varsa, backend'e gönder (birden fazla rol seçiliyse her birini ayrı sorgu yapmak yerine, 
    // backend'den tüm rolleri alıp frontend'de filtreleyeceğiz - çünkü backend tek role destekliyor)
    // Ama şimdilik sadece bir rol seçiliyse backend'e gönderelim
    if (selectedRoles.size === 1) {
      backendFilterObj.role = Array.from(selectedRoles)[0];
    }
    // Birden fazla rol seçiliyse backend'e role göndermeyiz, tüm kullanıcıları alıp frontend'de filtreleriz
    
    return backendFilterObj;
  }, [filters, selectedRoles]);
  
  // Kullanıcı listesi
  const { data: usersData, isLoading: usersLoading } = useUsers({
    ...backendFilters,
    limit: 100, // Backend maksimum limit: 100
    page: 1,
  });
  
  const sendNotificationMutation = useSendNotification();
  
  // Kullanıcı listesini memoize et (sonsuz döngüyü önlemek için)
  const users = useMemo(() => {
    const userList = Array.isArray(usersData?.data?.data) ? usersData.data.data : [];
    return userList;
  }, [usersData?.data?.data]);
  
  // Backend'den gelen veriler zaten filtrelenmiş (search, is_approved, is_active, role)
  // Frontend'de sadece rol filtresi yapıyoruz (birden fazla rol seçiliyse)
  const filteredUsers = useMemo(() => {
    // Hiç rol seçili değilse boş döndür
    if (selectedRoles.size === 0) {
      return [];
    }
    
    // Backend'den gelen veriler zaten filtrelenmiş
    // Eğer birden fazla rol seçiliyse, frontend'de rol filtresi yap
    if (selectedRoles.size > 1) {
      return users.filter(user => selectedRoles.has(user.role));
    }
    
    // Tek rol seçiliyse ve backend'e role gönderildiyse, backend'den gelen veriler zaten filtrelenmiş
    // Direkt kullan
    return users;
  }, [users, selectedRoles]);
  
  // Rol checkbox toggle
  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      setSelectionMode('role');
      return next;
    });
  };
  
  // Seçili roller veya filtreler değiştiğinde kullanıcıları otomatik seç/güncelle
  useEffect(() => {
    if (selectionMode === 'role') {
      if (selectedRoles.size === 0) {
        // Hiç rol seçili değilse kullanıcı seçimini temizle
        setSelectedUserIds(new Set());
      } else {
        // Seçili rollere ve filtreleme kriterlerine uygun kullanıcıları seç
             const roleUsers = users.filter(u => {
               // Rol kontrolü
               if (!selectedRoles.has(u.role)) return false;
               
               // Arama filtresi
               if (filters.search) {
                 const searchLower = filters.search.toLowerCase().trim();
                 if (!searchLower) return true; // Boş arama, tümünü göster
                 
                 // İsim (hem direkt hem profile içinden)
                 const firstName = (u.first_name || u.profile?.first_name || '').trim();
                 const lastName = (u.last_name || u.profile?.last_name || '').trim();
                 const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
                 
                 // Email
                 const email = (u.email || '').toLowerCase();
                 
                 // Kurum adı (hem direkt hem profile içinden)
                 const institutionName = (u.institution_name || u.profile?.institution_name || '').trim().toLowerCase();
                 
                 // Arama terimini kontrol et
                 const matchesName = fullName.includes(searchLower);
                 const matchesEmail = email.includes(searchLower);
                 const matchesInstitution = institutionName.includes(searchLower);
                 
                 if (!matchesName && !matchesEmail && !matchesInstitution) {
                   return false;
                 }
               }
          
          // Onay durumu filtresi
          if (filters.is_approved !== '') {
            const isApproved = filters.is_approved === 'true';
            if (u.is_approved !== isApproved) return false;
          }
          
          // Aktif durumu filtresi
          if (filters.is_active !== '') {
            const isActive = filters.is_active === 'true';
            if (u.is_active !== isActive) return false;
          }
          
          return true;
        });
        setSelectedUserIds(new Set(roleUsers.map(u => u.id)));
      }
    }
  }, [selectedRoles, filters, users, selectionMode]);
  
  // Kullanıcı seçimi
  const handleUserToggle = (userId) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      setSelectionMode('users');
      return next;
    });
  };
  
  // Tümünü seç/seçimi kaldır
  const handleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
      setSelectionMode('users');
    }
  };
  
  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast.error('Başlık ve mesaj zorunludur');
      return;
    }
    
    if (selectedUserIds.size === 0 && selectedRoles.size === 0) {
      showToast.error('En az bir hedef seçmelisiniz');
      return;
    }
    
    const payload = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
    };
    
    // Eğer rol bazlı seçim yapıldıysa ve sadece bir rol seçiliyse, role gönder
    if (selectionMode === 'role' && selectedRoles.size === 1) {
      payload.role = Array.from(selectedRoles)[0];
    } else if (selectedUserIds.size > 0) {
      // Manuel seçim yapıldıysa user_ids gönder
      payload.user_ids = Array.from(selectedUserIds);
    } else if (selectedRoles.size > 0) {
      // Birden fazla rol seçiliyse, o rollere sahip tüm kullanıcıları bul
      const roleUserIds = filteredUsers
        .filter(u => selectedRoles.has(u.role))
        .map(u => u.id);
      payload.user_ids = roleUserIds;
    }
    
    try {
      await sendNotificationMutation.mutateAsync(payload);
      navigate(ROUTE_CONFIG.ADMIN.NOTIFICATIONS);
    } catch (error) {
      // Error handled in mutation
    }
  };
  
  const getTypeIcon = (type) => {
    const icons = {
      info: <Info className="w-5 h-5 text-blue-500" />,
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      error: <XCircle className="w-5 h-5 text-red-500" />,
    };
    return icons[type] || icons.info;
  };
  
  const getRoleIcon = (role) => {
    const icons = {
      doctor: <Stethoscope className="w-4 h-4" />,
      hospital: <Building2 className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />,
    };
    return icons[role] || <Users className="w-4 h-4" />;
  };
  
  const selectedCount = selectionMode === 'role' && selectedRoles.size > 0
    ? filteredUsers.length
    : selectedUserIds.size;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(ROUTE_CONFIG.ADMIN.NOTIFICATIONS)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Send className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bildirim Gönder</h1>
              <p className="text-gray-600 text-sm mt-1">Kullanıcılara toplu bildirim gönderin</p>
            </div>
          </div>
        </div>
        
        {/* Üst Bölüm - Hedef Seçimi */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hızlı Rol Seçimi */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Seçim</h2>
              
              <div className="space-y-3">
                {['doctor', 'hospital'].map((role) => {
                  const roleLabel = role === 'doctor' ? 'Doktorlar' : 'Hastaneler';
                  const count = users.filter(u => {
                    if (u.role !== role) return false;
                    if (!u.is_approved) return false;
                    if (!u.is_active) return false;
                    return true;
                  }).length;
                  const isSelected = selectedRoles.has(role);
                  
                  return (
                    <div
                      key={role}
                      onClick={() => handleRoleToggle(role)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          <span className="font-medium text-gray-900">{roleLabel}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Filtreler */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
                {(filters.search || filters.is_approved || filters.is_active) && (
                  <button
                    type="button"
                    onClick={() => setFilters({ search: '', is_approved: '', is_active: '' })}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Temizle
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Arama */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <Search className="w-4 h-4 inline mr-1 text-gray-700" />
                    Arama
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="İsim, email veya kurum adı..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 bg-white"
                  />
                  {filters.search && (
                    <p className="text-xs text-gray-500 mt-1">
                      {usersData?.data?.pagination?.total ?? filteredUsers.length} sonuç bulundu
                    </p>
                  )}
                </div>
                
                {/* Onay Durumu */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Onay Durumu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, is_approved: '' }))}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.is_approved === ''
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                      }`}
                    >
                      Tümü
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, is_approved: 'true' }))}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.is_approved === 'true'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      Onaylı
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, is_approved: 'false' }))}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.is_approved === 'false'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                      }`}
                    >
                      <UserX className="w-4 h-4 inline mr-1" />
                      Beklemede
                    </button>
                  </div>
                  {filters.is_approved !== '' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredUsers.filter(u => {
                        const isApproved = filters.is_approved === 'true';
                        return u.is_approved === isApproved;
                      }).length} kullanıcı
                    </p>
                  )}
                </div>
                
                {/* Aktif Durumu */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Aktif Durumu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, is_active: '' }))}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.is_active === ''
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                      }`}
                    >
                      Tümü
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, is_active: 'true' }))}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.is_active === 'true'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, is_active: 'false' }))}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.is_active === 'false'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                      }`}
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Pasif
                    </button>
                  </div>
                  {filters.is_active !== '' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredUsers.filter(u => {
                        const isActive = filters.is_active === 'true';
                        return u.is_active === isActive;
                      }).length} kullanıcı
                    </p>
                  )}
                </div>
                
                {/* Filtre Özeti */}
                {(filters.search || filters.is_approved || filters.is_active) && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Filtrelenmiş Sonuç:</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {usersData?.data?.pagination?.total ?? filteredUsers.length} kullanıcı
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Kullanıcılar - Her zaman render edilir, sabit yükseklik */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Kullanıcılar {selectedRoles.size > 0 && `(${filteredUsers.length})`}
                </h2>
                {selectedRoles.size > 0 && filteredUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {selectedUserIds.size === filteredUsers.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </button>
                )}
              </div>
              
              <div className="h-[400px] overflow-y-auto space-y-2">
                {usersLoading ? (
                  <SkeletonLoader className="h-20 w-full" />
                ) : selectedRoles.size === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Lütfen önce bir rol seçin
                  </p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Seçili kriterlere uygun kullanıcı bulunamadı
                  </p>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.has(user.id);
                    const userName = user.role === 'hospital' 
                      ? (user.institution_name || user.profile?.institution_name || user.email)
                      : `${user.first_name || user.profile?.first_name || ''} ${user.last_name || user.profile?.last_name || ''}`.trim() || user.email;
                    
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleUserToggle(user.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.is_approved && <UserCheck className="w-3 h-3 text-green-500" />}
                          {!user.is_active && <UserX className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Alt Bölüm - Bildirim İçeriği */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildirim İçeriği</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bildirim başlığı..."
                    maxLength={200}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 bg-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 karakter</p>
                </div>
                
                {/* Mesaj */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesaj <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Bildirim mesajı..."
                    rows={6}
                    maxLength={1000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-900 placeholder-gray-400 bg-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000 karakter</p>
                </div>
                
                {/* Tür */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bildirim Türü
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {['info', 'success', 'warning', 'error'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.type === type
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {getTypeIcon(type)}
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {formData.type === 'info' && (
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Bilgi:</strong> Genel bilgilendirme mesajları için kullanılır. Mavi renk ile gösterilir.
                      </p>
                    )}
                    {formData.type === 'success' && (
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Başarı:</strong> Başarılı işlemler ve onay mesajları için kullanılır. Yeşil renk ile gösterilir.
                      </p>
                    )}
                    {formData.type === 'warning' && (
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Uyarı:</strong> Dikkat gerektiren durumlar için kullanılır. Sarı renk ile gösterilir.
                      </p>
                    )}
                    {formData.type === 'error' && (
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Hata:</strong> Hata mesajları ve önemli uyarılar için kullanılır. Kırmızı renk ile gösterilir.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Gönder Butonu */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={sendNotificationMutation.isPending || selectedCount === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {sendNotificationMutation.isPending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {selectedCount > 0 ? `${selectedCount} Kullanıcıya Gönder` : 'Gönder'}
                      </>
                    )}
                  </button>
                </div>
              </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationSendPage;

