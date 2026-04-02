/**
 * Admin Logs Sayfası - Profesyonel Log Yönetim Sistemi
 * 
 * Sistem loglarını görüntüleme ve yönetme sayfası
 * 
 * Log Tipleri:
 * - Application Logs: Sistem hataları, API çağrıları, performans logları
 * - Audit Logs: Kullanıcı aksiyonları, veri değişiklikleri (kim ne yaptı)
 * - Security Logs: Güvenlik olayları, başarısız giriş denemeleri, yetkisiz erişimler
 * 
 * @author MediKariyer Development Team
 * @version 6.0.0
 */

import React, { useState, useCallback } from 'react';
import { 
  FiActivity, FiRefreshCw, FiFilter,
  FiChevronDown, FiServer, FiUsers, FiLock,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  useApplicationLogs, 
  useAuditLogs, 
  useSecurityLogs
} from '../api/useLogs';
import LogList from '../components/LogList';
import SearchContainer from '../components/SearchContainer';

const LogsPage = () => {
  
  // Tab durumu - hangi log tipinin aktif olduğunu tutar
  const [activeTab, setActiveTab] = useState('application');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter state'leri - her log tipi için ayrı filtreler
  const [applicationFilters, setApplicationFilters] = useState({
    level: '', category: '', platform: '', userId: '', requestId: '',
    search: '', startDate: '', endDate: '', page: 1, limit: 20
  });
  
  const [auditFilters, setAuditFilters] = useState({
    actorId: '', action: '', resourceType: '', resourceId: '',
    search: '', startDate: '', endDate: '', page: 1, limit: 20
  });
  
  const [securityFilters, setSecurityFilters] = useState({
    eventType: '', severity: '', ipAddress: '',
    search: '', startDate: '', endDate: '', page: 1, limit: 20
  });

  // React Query API hooks - her log tipi için ayrı hook
  const { 
    data: applicationData, 
    isLoading: applicationLoading, 
    error: applicationError,
    refetch: refetchApplication 
  } = useApplicationLogs(applicationFilters, activeTab === 'application');
  
  const { 
    data: auditData, 
    isLoading: auditLoading, 
    error: auditError,
    refetch: refetchAudit 
  } = useAuditLogs(auditFilters, activeTab === 'audit');
  
  const { 
    data: securityData, 
    isLoading: securityLoading, 
    error: securityError,
    refetch: refetchSecurity 
  } = useSecurityLogs(securityFilters, activeTab === 'security');

  // Aktif tab'a göre veri ve yükleme durumunu belirle
  const currentData = activeTab === 'application' ? applicationData : 
                     activeTab === 'audit' ? auditData : securityData;
  const isLoading = activeTab === 'application' ? applicationLoading : 
                   activeTab === 'audit' ? auditLoading : securityLoading;
  const error = activeTab === 'application' ? applicationError : 
               activeTab === 'audit' ? auditError : securityError;

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'application') await refetchApplication();
      else if (activeTab === 'audit') await refetchAudit();
      else await refetchSecurity();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [activeTab, refetchApplication, refetchAudit, refetchSecurity]);

  // Tab değişim handler'ı - filtreleri temizler
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Tüm filtreleri sıfırla
    setApplicationFilters(prev => ({ ...prev, search: '', page: 1 }));
    setAuditFilters(prev => ({ ...prev, search: '', page: 1 }));
    setSecurityFilters(prev => ({ ...prev, search: '', page: 1 }));
  };

  // Filtre değişiklik handler'ları
  const handleFilterChange = (key, value) => {
    if (activeTab === 'application') {
      setApplicationFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    } else if (activeTab === 'audit') {
      setAuditFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    } else {
      setSecurityFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    }
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
  };

  const clearFilters = () => {
    setApplicationFilters({ level: '', category: '', platform: '', userId: '', requestId: '', search: '', startDate: '', endDate: '', page: 1, limit: 20 });
    setAuditFilters({ actorId: '', action: '', resourceType: '', resourceId: '', search: '', startDate: '', endDate: '', page: 1, limit: 20 });
    setSecurityFilters({ eventType: '', severity: '', ipAddress: '', search: '', startDate: '', endDate: '', page: 1, limit: 20 });
  };

  // Arama değişiklik handler'ı - debounce ile optimize edilmiş
  const handleSearchChange = useCallback((value) => {
    // Aktif tab'ın filtresini güncelle
    if (activeTab === 'application') {
      setApplicationFilters(prev => ({ ...prev, search: value, page: 1 }));
    } else if (activeTab === 'audit') {
      setAuditFilters(prev => ({ ...prev, search: value, page: 1 }));
    } else {
      setSecurityFilters(prev => ({ ...prev, search: value, page: 1 }));
    }
  }, [activeTab]);

  const filteredLogs = currentData?.logs || [];
  
  // Yükleme durumu - ilk yüklemede loading göster
  if (isLoading && !currentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu - API hatası varsa hata sayfası göster
  if (error && !currentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Log Yükleme Hatası</h3>
          <p className="text-gray-600 mb-6">{error.message || 'Loglar yüklenirken bir hata oluştu'}</p>
          <button 
            onClick={refetch} 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition-colors font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Sayfa Başlığı ve Kontroller */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FiActivity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                Sistem Logları
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl text-sm sm:text-base">
                {activeTab === 'application' && 'Sistem hataları, API çağrıları ve performans loglarını izleyin ve analiz edin'}
                {activeTab === 'audit' && 'Kullanıcı aksiyonları ve veri değişikliklerini takip edin (kim ne yaptı)'}
                {activeTab === 'security' && 'Güvenlik olayları, başarısız giriş denemeleri ve yetkisiz erişimleri monitör edin'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtreler</span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={refetch}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 text-sm"
              >
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>
            </div>
          </div>
        </div>
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uygulama Logları</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {activeTab === 'application' ? (currentData?.total || 0).toLocaleString('tr-TR') : '-'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiServer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Denetim Logları</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {activeTab === 'audit' ? (currentData?.total || 0).toLocaleString('tr-TR') : '-'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Güvenlik Logları</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {activeTab === 'security' ? (currentData?.total || 0).toLocaleString('tr-TR') : '-'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiLock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Log Tipi Sekmeleri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => handleTabChange('application')}
                className={`flex-1 min-w-0 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'application'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiServer className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Uygulama</span>
                <span className="hidden sm:inline text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">Sistem & API</span>
              </button>
              <button
                onClick={() => handleTabChange('audit')}
                className={`flex-1 min-w-0 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'audit'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Denetim</span>
                <span className="hidden sm:inline text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">Kullanıcı Aksiyonları</span>
              </button>
              <button
                onClick={() => handleTabChange('security')}
                className={`flex-1 min-w-0 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'security'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiLock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Güvenlik</span>
                <span className="hidden sm:inline text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">Giriş & Erişim</span>
              </button>
            </div>
          </div>
          {/* Arama Çubuğu - İzole Component */}
          <SearchContainer 
            onSearch={handleSearchChange}
            activeTab={activeTab}
          />

          {/* Filtreleme Seçenekleri */}
          {showFilters && (
            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
              {/* Uygulama Log Filtreleri */}
              {activeTab === 'application' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Log Seviyesi</label>
                      <select
                        value={applicationFilters.level}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      >
                        <option value="">Tümü</option>
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="http">HTTP</option>
                        <option value="debug">Debug</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select
                        value={applicationFilters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      >
                        <option value="">Tümü</option>
                        <option value="auth">Authentication</option>
                        <option value="api">API</option>
                        <option value="database">Database</option>
                        <option value="security">Security</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      <select
                        value={applicationFilters.platform}
                        onChange={(e) => handleFilterChange('platform', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      >
                        <option value="">Tümü</option>
                        <option value="web">Web</option>
                        <option value="mobile-ios">Mobile iOS</option>
                        <option value="mobile-android">Mobile Android</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç</label>
                      <input
                        type="date"
                        value={applicationFilters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş</label>
                      <input
                        type="date"
                        value={applicationFilters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı ID</label>
                      <input
                        type="number"
                        placeholder="Kullanıcı ID..."
                        value={applicationFilters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request ID</label>
                      <input
                        type="text"
                        placeholder="Request ID..."
                        value={applicationFilters.requestId}
                        onChange={(e) => handleFilterChange('requestId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Denetim Log Filtreleri */}
              {activeTab === 'audit' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aksiyon</label>
                      <input
                        type="text"
                        placeholder="Aksiyon ara..."
                        value={auditFilters.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kaynak Tipi</label>
                      <input
                        type="text"
                        placeholder="Resource type..."
                        value={auditFilters.resourceType}
                        onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç</label>
                      <input
                        type="date"
                        value={auditFilters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş</label>
                      <input
                        type="date"
                        value={auditFilters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı ID (Actor)</label>
                      <input
                        type="number"
                        placeholder="İşlemi yapan kullanıcı ID..."
                        value={auditFilters.actorId}
                        onChange={(e) => handleFilterChange('actorId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kaynak ID</label>
                      <input
                        type="number"
                        placeholder="Etkilenen kaynak ID..."
                        value={auditFilters.resourceId}
                        onChange={(e) => handleFilterChange('resourceId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Güvenlik Log Filtreleri */}
              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Olay Tipi</label>
                      <select
                        value={securityFilters.eventType}
                        onChange={(e) => handleFilterChange('eventType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      >
                        <option value="">Tümü</option>
                        <option value="login_success">Başarılı Giriş</option>
                        <option value="login_failed">Başarısız Giriş</option>
                        <option value="logout">Çıkış</option>
                        <option value="logout_all_devices">Tüm Cihazlardan Çıkış</option>
                        <option value="unauthorized_access">Yetkisiz Erişim</option>
                        <option value="user_registered">Kullanıcı Kaydı</option>
                        <option value="password_reset_requested">Şifre Sıfırlama İsteği</option>
                        <option value="password_reset_completed">Şifre Sıfırlama Tamamlandı</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Önem Derecesi</label>
                      <select
                        value={securityFilters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      >
                        <option value="">Tümü</option>
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                        <option value="critical">Kritik</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç</label>
                      <input
                        type="date"
                        value={securityFilters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş</label>
                      <input
                        type="date"
                        value={securityFilters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IP Adresi</label>
                      <input
                        type="text"
                        placeholder="IP adresi (örn: 192.168.1.1)"
                        value={securityFilters.ipAddress}
                        onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-4 sm:mt-6">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FiFilter className="w-4 h-4" />
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Log Listesi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'application' && 'Uygulama Logları'}
                {activeTab === 'audit' && 'Denetim Logları'}
                {activeTab === 'security' && 'Güvenlik Logları'}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-sm text-gray-600">
                  {currentData?.total ? `${currentData.total.toLocaleString('tr-TR')} kayıt` : '0 kayıt'}
                </span>
                {currentData?.totalPages > 1 && (
                  <span className="text-sm text-gray-500">
                    Sayfa {currentData?.page || 1} / {currentData?.totalPages || 1}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <LogList 
              logs={filteredLogs}
              activeTab={activeTab}
              isLoading={isLoading}
              currentData={currentData}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;