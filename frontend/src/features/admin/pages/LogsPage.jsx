/**
 * Admin Logs Sayfası
 * 
 * Sistem loglarını görüntüleme ve yönetme sayfası
 * Backend logService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - 3 log tipi için tab sistemi (Application, Audit, Security)
 * - Gerçek API entegrasyonu
 * - Gelişmiş filtreleme
 * - Log detay modal'ı
 * - Kullanıcı bilgileri gösterimi
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiSearch, FiEye, FiClock, 
  FiAlertCircle, FiInfo, FiShield, FiEdit3,
  FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { 
  useApplicationLogs, 
  useAuditLogs, 
  useSecurityLogs
} from '../api/useLogs';

const LogsPage = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('application');
  
  // Filter states - her tab için ayrı filtreler
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

  // API hooks - sadece aktif tab için data çek (infinite loop önleme)
  // Filter objeleri hook içinde memoize ediliyor, burada direkt geçebiliriz
  const { 
    data: applicationLogsData, 
    isLoading: applicationLoading, 
    error: applicationError,
    refetch: refetchApplication 
  } = useApplicationLogs(applicationFilters, activeTab === 'application');
  
  const { 
    data: auditLogsData, 
    isLoading: auditLoading, 
    error: auditError,
    refetch: refetchAudit 
  } = useAuditLogs(auditFilters, activeTab === 'audit');
  
  const { 
    data: securityLogsData, 
    isLoading: securityLoading, 
    error: securityError,
    refetch: refetchSecurity 
  } = useSecurityLogs(securityFilters, activeTab === 'security');
  
  // Statistics - disabled (gerektiğinde manuel çekilebilir)
  // const { data: statisticsData } = useLogStatistics(statisticsOptions, false);

  // Aktif tab'a göre data ve loading state - basitleştirilmiş
  const currentData = activeTab === 'application' ? applicationLogsData : 
                     activeTab === 'audit' ? auditLogsData : securityLogsData;
  const isLoading = activeTab === 'application' ? applicationLoading : 
                   activeTab === 'audit' ? auditLoading : securityLoading;
  const error = activeTab === 'application' ? applicationError : 
               activeTab === 'audit' ? auditError : securityError;

  const refetch = () => {
    if (activeTab === 'application') refetchApplication();
    else if (activeTab === 'audit') refetchAudit();
    else refetchSecurity();
  };

  // Filter handlers - birleştirilmiş
  const handleFilterChange = (key, value) => {
    const filterSetters = {
      application: setApplicationFilters,
      audit: setAuditFilters,
      security: setSecurityFilters
    };
    
    filterSetters[activeTab](prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handlePageChange = (direction) => {
    const currentFilters = activeTab === 'application' ? applicationFilters : 
                          activeTab === 'audit' ? auditFilters : securityFilters;
    const currentPage = currentFilters.page;
    
    if (direction === 'prev' && currentPage > 1) {
      handleFilterChange('page', currentPage - 1);
    } else if (direction === 'next' && currentData?.totalPages && currentPage < currentData.totalPages) {
      handleFilterChange('page', currentPage + 1);
    }
  };

  const clearFilters = () => {
    setApplicationFilters({
      level: '',
      category: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    });
    setAuditFilters({
      action: '',
      resourceType: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    });
    setSecurityFilters({
      eventType: '',
      severity: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    });
    setSearchQuery('');
  };

  // Log detay sayfasına yönlendirme
  const handleLogClick = (log) => {
    navigate(`/admin/logs/${activeTab}/${log.id}`);
  };

  // Arama filtresi
  const filteredLogs = useMemo(() => {
    if (!currentData?.logs) return [];
    if (!searchQuery) return currentData.logs;
    
    const query = searchQuery.toLowerCase();
    return currentData.logs.filter(log => {
      const message = log.message?.toLowerCase() || '';
      const action = log.action?.toLowerCase() || '';
      const actorName = log.actor_name?.toLowerCase() || '';
      const actorEmail = log.actor_email?.toLowerCase() || '';
      const email = log.email?.toLowerCase() || '';
      
      return message.includes(query) || 
             action.includes(query) || 
             actorName.includes(query) || 
             actorEmail.includes(query) ||
             email.includes(query);
    });
  }, [currentData, searchQuery]);

  // Timestamp formatı - Daha okunabilir
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: '-', time: '-', relative: '-' };
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let relative = '';
    if (diffMins < 1) relative = 'Az önce';
    else if (diffMins < 60) relative = `${diffMins} dakika önce`;
    else if (diffHours < 24) relative = `${diffHours} saat önce`;
    else if (diffDays < 7) relative = `${diffDays} gün önce`;
    else relative = date.toLocaleDateString('tr-TR');
    
    return {
      date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      relative
    };
  };

  // Action'ları Türkçe'ye çevir
  const translateAction = (action) => {
    const translations = {
      'user.register': 'Kullanıcı Kaydı',
      'user.login': 'Giriş Yapıldı',
      'user.logout': 'Çıkış Yapıldı',
      'user.logout_all': 'Tüm Cihazlardan Çıkış',
      'user.approve': 'Kullanıcı Onaylandı',
      'user.reject': 'Kullanıcı Reddedildi',
      'job.approve': 'İş İlanı Onaylandı',
      'job.reject': 'İş İlanı Reddedildi',
      'job.request_revision': 'İş İlanı Revizyon İstendi',
      'application.update_status': 'Başvuru Durumu Güncellendi',
      'photo_request.approve': 'Fotoğraf Onaylandı',
      'photo_request.reject': 'Fotoğraf Reddedildi'
    };
    return translations[action] || action;
  };

  // Event type'ları Türkçe'ye çevir
  const translateEventType = (eventType) => {
    const translations = {
      'login_success': 'Başarılı Giriş',
      'login_failed': 'Başarısız Giriş',
      'logout': 'Çıkış',
      'logout_all_devices': 'Tüm Cihazlardan Çıkış',
      'unauthorized_access': 'Yetkisiz Erişim',
      'rate_limit_exceeded': 'Rate Limit Aşıldı',
      'suspicious_activity': 'Şüpheli Aktivite',
      'user_registered': 'Kullanıcı Kaydı',
      'password_changed': 'Şifre Değiştirildi',
      'token_expired': 'Token Süresi Doldu',
      'token_revoked': 'Token İptal Edildi',
      'invalid_token': 'Geçersiz Token',
      'account_locked': 'Hesap Kilitlendi'
    };
    return translations[eventType] || eventType;
  };

  // Severity'yi Türkçe'ye çevir
  const translateSeverity = (severity) => {
    const translations = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'critical': 'Kritik'
    };
    return translations[severity] || severity;
  };

  // Level'ı Türkçe'ye çevir
  const translateLevel = (level) => {
    const translations = {
      'error': 'Hata',
      'warn': 'Uyarı',
      'info': 'Bilgi',
      'http': 'HTTP',
      'debug': 'Debug'
    };
    return translations[level] || level;
  };

  // Log level renkleri - CSS class'ları kullan
  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'logs-badge logs-badge-error';
      case 'warn': return 'logs-badge logs-badge-warn';
      case 'info': return 'logs-badge logs-badge-info';
      case 'http': return 'logs-badge logs-badge-http';
      case 'debug': return 'logs-badge logs-badge-debug';
      default: return 'logs-badge logs-badge-debug';
    }
  };

  // Severity renkleri - CSS class'ları kullan
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'logs-badge logs-badge-critical';
      case 'high': return 'logs-badge logs-badge-high';
      case 'medium': return 'logs-badge logs-badge-medium';
      case 'low': return 'logs-badge logs-badge-low';
      default: return 'logs-badge logs-badge-debug';
    }
  };

  // Export fonksiyonu
  const handleExport = () => {
    if (!currentData?.logs || currentData.logs.length === 0) {
      showToast.warning('Export edilecek log bulunamadı');
      return;
    }

    const dataStr = JSON.stringify(currentData.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast.success('Loglar export edildi');
  };

  // Loading state
  if (isLoading && !currentData) {
    return (
      <div className="logs-page-container">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-lg mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-20 w-full bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="logs-page-container flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Log Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">{error.message || 'Loglar yüklenirken bir hata oluştu'}</p>
          <button
            onClick={() => refetch()}
            className="admin-btn admin-btn-primary"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-page-container">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiActivity className="h-8 w-8 text-blue-600" />
              Sistem Logları
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Tüm sistem aktivitelerini, kullanıcı işlemlerini ve güvenlik olaylarını takip edin
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="admin-btn admin-btn-primary"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={refetch}
              className="admin-btn admin-btn-secondary"
            >
              <FiRefreshCw className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>


        {/* Tabs */}
        <div className="logs-tabs-container">
          <div className="logs-tabs-list">
            <button
              onClick={() => setActiveTab('application')}
              className={`logs-tab-button ${activeTab === 'application' ? 'logs-tab-button-active' : ''}`}
            >
              <FiActivity className="inline-block" />
              Uygulama Logları
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`logs-tab-button ${activeTab === 'audit' ? 'logs-tab-button-active' : ''}`}
            >
              <FiShield className="inline-block" />
              Denetim Logları
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`logs-tab-button ${activeTab === 'security' ? 'logs-tab-button-active' : ''}`}
            >
              <FiAlertCircle className="inline-block" />
              Güvenlik Logları
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card mb-6">
          <div className="admin-card-body">
            {/* Arama */}
            <div className="mb-4">
              <div className="logs-search-wrapper">
                <FiSearch className="logs-search-icon" />
                <input
                  type="text"
                  placeholder="Log mesajında ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-form-input pl-10"
                />
              </div>
            </div>

          {/* Application Log Filters */}
          {activeTab === 'application' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="admin-form-label">Log Seviyesi</label>
                <select
                  value={applicationFilters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="admin-form-select"
                >
                  <option value="">Tüm Seviyeler</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="http">HTTP</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              
              <div>
                <label className="admin-form-label">Kategori</label>
                <select
                  value={applicationFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="admin-form-select"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="auth">Authentication</option>
                  <option value="api">API</option>
                  <option value="database">Database</option>
                  <option value="security">Security</option>
                  <option value="business">Business</option>
                </select>
              </div>
              
              <div>
                <label className="admin-form-label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={applicationFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              
              <div>
                <label className="admin-form-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={applicationFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="admin-form-input"
                />
              </div>
            </div>
          )}

          {/* Audit Log Filters */}
          {activeTab === 'audit' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="admin-form-label">Aksiyon</label>
                <input
                  type="text"
                  placeholder="Aksiyon ara..."
                  value={auditFilters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              
              <div>
                <label className="admin-form-label">Kaynak Tipi</label>
                <input
                  type="text"
                  placeholder="Resource type..."
                  value={auditFilters.resourceType}
                  onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              
              <div>
                <label className="admin-form-label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={auditFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              
              <div>
                <label className="admin-form-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={auditFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="admin-form-input"
                />
              </div>
            </div>
          )}

          {/* Security Log Filters */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="admin-form-label">Olay Tipi</label>
                <select
                  value={securityFilters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  className="admin-form-select"
                >
                  <option value="">Tüm Olay Tipleri</option>
                  <option value="login_success">Başarılı Giriş</option>
                  <option value="login_failed">Başarısız Giriş</option>
                  <option value="logout">Çıkış</option>
                  <option value="logout_all_devices">Tüm Cihazlardan Çıkış</option>
                  <option value="unauthorized_access">Yetkisiz Erişim</option>
                  <option value="rate_limit_exceeded">Rate Limit Aşıldı</option>
                  <option value="suspicious_activity">Şüpheli Aktivite</option>
                  <option value="user_registered">Kullanıcı Kaydı</option>
                  <option value="password_changed">Şifre Değiştirildi</option>
                  <option value="token_expired">Token Süresi Doldu</option>
                  <option value="token_revoked">Token İptal Edildi</option>
                  <option value="invalid_token">Geçersiz Token</option>
                  <option value="account_locked">Hesap Kilitlendi</option>
                </select>
              </div>
              
              <div>
                <label className="admin-form-label">Önem Derecesi</label>
                <select
                  value={securityFilters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="admin-form-select"
                >
                  <option value="">Tüm Önem Dereceleri</option>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik</option>
                </select>
              </div>
              
              <div>
                <label className="admin-form-label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={securityFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              
              <div>
                <label className="admin-form-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={securityFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="admin-form-input"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="admin-btn admin-btn-secondary"
            >
              Filtreleri Temizle
            </button>
          </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'application' && 'Uygulama Log Kayıtları'}
                {activeTab === 'audit' && 'Denetim Log Kayıtları'}
                {activeTab === 'security' && 'Güvenlik Log Kayıtları'}
              </h2>
              <span className="text-sm text-gray-600">
                {currentData?.total || 0} kayıt (Sayfa {currentData?.page || 1}/{currentData?.totalPages || 1})
              </span>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-20 w-full bg-gray-200 rounded-lg" />
                ))}
              </div>
            ) : filteredLogs.length > 0 ? (
              <>
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => handleLogClick(log)}
                      className="logs-item"
                    >
                      <div className="logs-item-header">
                        <div className="logs-item-content">
                          {/* Application Log Badge */}
                          {activeTab === 'application' && log.level && (
                            <span className={getLogLevelColor(log.level)}>
                              {translateLevel(log.level)}
                            </span>
                          )}
                          
                          {/* Security Log Badge */}
                          {activeTab === 'security' && log.severity && (
                            <span className={getSeverityColor(log.severity)}>
                              {translateSeverity(log.severity)}
                            </span>
                          )}
                          
                          {/* Audit Log - Actor Info */}
                          {activeTab === 'audit' && (
                            <div className="flex items-center space-x-2 flex-wrap">
                              {log.actor_name && (
                                <span className="text-sm text-gray-900 font-medium">{log.actor_name}</span>
                              )}
                              {log.actor_email && (
                                <span className="text-xs text-gray-500">({log.actor_email})</span>
                              )}
                              {log.action && (
                                <span className="logs-badge logs-badge-info">
                                  {translateAction(log.action)}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Category/Event Type */}
                          {(log.category || log.event_type) && (
                            <span className="logs-badge logs-badge-info">
                              {log.category || translateEventType(log.event_type)}
                            </span>
                          )}
                          
                          {/* Timestamp - Relative time göster */}
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            <span title={`${formatTimestamp(log.timestamp).date} ${formatTimestamp(log.timestamp).time}`}>
                              {formatTimestamp(log.timestamp).relative}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">#{log.id}</span>
                          <FiEye className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="logs-item-message">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {currentData?.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange('prev')}
                      disabled={currentData.page === 1}
                      className="admin-btn admin-btn-outline"
                    >
                      Önceki
                    </button>
                    <span className="text-sm text-gray-600">
                      Sayfa {currentData.page} / {currentData.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange('next')}
                      disabled={currentData.page >= currentData.totalPages}
                      className="admin-btn admin-btn-outline"
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FiActivity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Log kaydı bulunamadı</h3>
                <p className="text-sm text-gray-600">Seçilen filtreler için herhangi bir log kaydı bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
