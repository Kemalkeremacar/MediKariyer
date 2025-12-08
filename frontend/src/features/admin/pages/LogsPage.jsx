/**
 * Admin Logs Sayfası
 * 
 * Sistem loglarını görüntüleme ve yönetme sayfası
 * 
 * @author MediKariyer Development Team
 * @version 4.0.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiSearch, FiEye, FiClock, 
  FiAlertCircle, FiShield, FiRefreshCw, FiFilter
} from 'react-icons/fi';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { 
  useApplicationLogs, 
  useAuditLogs, 
  useSecurityLogs
} from '../api/useLogs';

const LogsPage = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('application');
  
  // Filter states
  const [applicationFilters, setApplicationFilters] = useState({
    level: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    resourceType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  
  const [securityFilters, setSecurityFilters] = useState({
    eventType: '',
    severity: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  // API hooks
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

  // Aktif tab'a göre data ve loading state
  const currentData = activeTab === 'application' ? applicationData : 
                     activeTab === 'audit' ? auditData : securityData;
  const isLoading = activeTab === 'application' ? applicationLoading : 
                   activeTab === 'audit' ? auditLoading : securityLoading;
  const error = activeTab === 'application' ? applicationError : 
               activeTab === 'audit' ? auditError : securityError;

  const refetch = () => {
    if (activeTab === 'application') refetchApplication();
    else if (activeTab === 'audit') refetchAudit();
    else refetchSecurity();
  };

  // Filter handlers
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
    setApplicationFilters({ level: '', category: '', startDate: '', endDate: '', page: 1, limit: 20 });
    setAuditFilters({ action: '', resourceType: '', startDate: '', endDate: '', page: 1, limit: 20 });
    setSecurityFilters({ eventType: '', severity: '', startDate: '', endDate: '', page: 1, limit: 20 });
    setSearchQuery('');
  };

  // Log detay sayfasına yönlendirme
  const handleLogClick = (log) => {
    navigate(`/admin/logs/${activeTab}/${log.id}`);
  };

  // Arama filtresi
  const filteredLogs = useMemo(() => {
    if (!currentData?.logs) return [];
    
    let logs = [...currentData.logs];
    
    if (!searchQuery) return logs;
    
    const query = searchQuery.toLowerCase();
    return logs.filter(log => {
      const message = log.message?.toLowerCase() || '';
      const action = log.action?.toLowerCase() || '';
      const actorName = log.actor_name?.toLowerCase() || '';
      const actorEmail = log.actor_email?.toLowerCase() || '';
      const email = log.email?.toLowerCase() || '';
      const eventType = log.event_type?.toLowerCase() || '';
      const category = log.category?.toLowerCase() || '';
      
      return message.includes(query) || 
             action.includes(query) || 
             actorName.includes(query) || 
             actorEmail.includes(query) ||
             email.includes(query) ||
             eventType.includes(query) ||
             category.includes(query);
    });
  }, [currentData, searchQuery]);

  // Timestamp formatı
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Çeviriler
  const translations = {
    actions: {
      'user.register': 'Kullanıcı Kaydı',
      'user.login': 'Giriş',
      'user.logout': 'Çıkış',
      'user.logout_all': 'Tüm Cihazlardan Çıkış',
      'user.approve': 'Kullanıcı Onayı',
      'user.reject': 'Kullanıcı Reddi',
      'job.approve': 'İlan Onayı',
      'job.reject': 'İlan Reddi',
      'job.request_revision': 'Revizyon İsteği',
      'application.update_status': 'Başvuru Güncelleme',
      'photo_request.approve': 'Fotoğraf Onayı',
      'photo_request.reject': 'Fotoğraf Reddi'
    },
    eventTypes: {
      'login_success': 'Başarılı Giriş',
      'login_failed': 'Başarısız Giriş',
      'logout': 'Çıkış',
      'logout_all_devices': 'Tüm Cihazlardan Çıkış',
      'unauthorized_access': 'Yetkisiz Erişim',
      'user_registered': 'Kullanıcı Kaydı',
      'password_reset_requested': 'Şifre Sıfırlama İsteği',
      'password_reset_completed': 'Şifre Sıfırlama Tamamlandı'
    },
    severities: {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'critical': 'Kritik'
    },
    levels: {
      'error': 'Hata',
      'warn': 'Uyarı',
      'info': 'Bilgi',
      'http': 'HTTP',
      'debug': 'Debug'
    }
  };

  const translate = (type, value) => {
    return translations[type]?.[value] || value;
  };

  // Badge renkleri
  const getBadgeClass = (type, value) => {
    const classes = {
      level: {
        error: 'bg-red-100 text-red-800',
        warn: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        http: 'bg-purple-100 text-purple-800',
        debug: 'bg-gray-100 text-gray-800'
      },
      severity: {
        critical: 'bg-red-100 text-red-800',
        high: 'bg-orange-100 text-orange-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      }
    };
    return classes[type]?.[value?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading && !currentData) {
    return (
      <div className="p-6">
        <SkeletonLoader className="h-12 w-80 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FiAlertCircle className="w-16 h-16 text-red-900 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">Log Yükleme Hatası</h3>
          <p className="text-black mb-4">{error.message || 'Loglar yüklenirken bir hata oluştu'}</p>
          <button onClick={refetch} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
              <FiActivity className="h-8 w-8 text-blue-900" />
              Sistem Logları
            </h1>
            <p className="text-black mt-2">
              Sistem aktivitelerini, kullanıcı işlemlerini ve güvenlik olaylarını takip edin
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-black"
          >
            <FiRefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('application')}
            className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'application'
                ? 'border-blue-600 text-blue-900'
                : 'border-transparent text-black hover:text-black'
            }`}
          >
            <FiActivity className="inline-block mr-2" />
            Uygulama Logları
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-900'
                : 'border-transparent text-black hover:text-black'
            }`}
          >
            <FiShield className="inline-block mr-2" />
            Denetim Logları
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-900'
                : 'border-transparent text-black hover:text-black'
            }`}
          >
            <FiAlertCircle className="inline-block mr-2" />
            Güvenlik Logları
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        {/* Arama */}
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <input
              type="text"
              placeholder="Log mesajında ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>
        </div>

        {/* Application Log Filters */}
        {activeTab === 'application' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Log Seviyesi</label>
              <select
                value={applicationFilters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              <label className="block text-sm font-medium text-black mb-1">Kategori</label>
              <select
                value={applicationFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              <label className="block text-sm font-medium text-black mb-1">Başlangıç</label>
              <input
                type="date"
                value={applicationFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Bitiş</label>
              <input
                type="date"
                value={applicationFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
        )}

        {/* Audit Log Filters */}
        {activeTab === 'audit' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Aksiyon</label>
              <input
                type="text"
                placeholder="Aksiyon ara..."
                value={auditFilters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Kaynak Tipi</label>
              <input
                type="text"
                placeholder="Resource type..."
                value={auditFilters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Başlangıç</label>
              <input
                type="date"
                value={auditFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Bitiş</label>
              <input
                type="date"
                value={auditFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
        )}

        {/* Security Log Filters */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Olay Tipi</label>
              <select
                value={securityFilters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="">Tümü</option>
                <option value="login_success">Başarılı Giriş</option>
                <option value="login_failed">Başarısız Giriş</option>
                <option value="logout">Çıkış</option>
                <option value="unauthorized_access">Yetkisiz Erişim</option>
                <option value="user_registered">Kullanıcı Kaydı</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Önem Derecesi</label>
              <select
                value={securityFilters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="">Tümü</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Başlangıç</label>
              <input
                type="date"
                value={securityFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">Bitiş</label>
              <input
                type="date"
                value={securityFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-black bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FiFilter className="w-4 h-4" />
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">
              {activeTab === 'application' && 'Uygulama Logları'}
              {activeTab === 'audit' && 'Denetim Logları'}
              {activeTab === 'security' && 'Güvenlik Logları'}
            </h2>
            <span className="text-sm text-black">
              {currentData?.total || 0} kayıt
            </span>
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonLoader key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <>
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => handleLogClick(log)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Application Log Badge */}
                          {activeTab === 'application' && log.level && (
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getBadgeClass('level', log.level)}`}>
                              {translate('levels', log.level)}
                            </span>
                          )}
                          
                          {/* Security Log Badge */}
                          {activeTab === 'security' && log.severity && (
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getBadgeClass('severity', log.severity)}`}>
                              {translate('severities', log.severity)}
                            </span>
                          )}
                          
                          {/* Category/Event Type */}
                          {log.category && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                              {log.category}
                            </span>
                          )}
                          {log.event_type && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {translate('eventTypes', log.event_type)}
                            </span>
                          )}
                          
                          {/* Timestamp */}
                          <div className="flex items-center gap-1 text-sm text-black">
                            <FiClock className="w-4 h-4" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </div>
                        
                        {/* Audit Log - Actor Info */}
                        {activeTab === 'audit' && (
                          <div className="mb-2">
                            {log.actor_name && (
                              <span className="text-sm font-medium text-black">{log.actor_name}</span>
                            )}
                            {log.actor_email && (
                              <span className="text-xs text-black ml-2">({log.actor_email})</span>
                            )}
                            {log.action && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                {translate('actions', log.action)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Message */}
                        <p className="text-black text-sm line-clamp-2">{log.message || 'Mesaj yok'}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-black">#{log.id}</span>
                        <FiEye className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {currentData?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange((currentData?.page || 1) - 1)}
                    disabled={(currentData?.page || 1) === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-black">
                    Sayfa {currentData?.page || 1} / {currentData?.totalPages || 1}
                  </span>
                  <button
                    onClick={() => handlePageChange((currentData?.page || 1) + 1)}
                    disabled={(currentData?.page || 1) >= (currentData?.totalPages || 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FiActivity className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">Log kaydı bulunamadı</h3>
              <p className="text-sm text-black">Seçilen filtreler için herhangi bir log kaydı bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;




