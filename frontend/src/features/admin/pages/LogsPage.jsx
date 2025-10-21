/**
 * @file LogsPage.jsx
 * @description Admin log görüntüleme sayfası - Modern ve kullanıcı dostu tasarım
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useApplicationLogs, useAuditLogs, useSecurityLogs, useLogStatistics, useCleanupLogs } from '../api/useLogs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock, 
  FiFilter, 
  FiRefreshCw, 
  FiTrash2, 
  FiEye, 
  FiDownload,
  FiCalendar,
  FiUser,
  FiGlobe,
  FiShield,
  FiDatabase,
  FiCode,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus
} from 'react-icons/fi';

const LogsPage = () => {
  const [activeTab, setActiveTab] = useState('application');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    level: '',
    category: '',
    eventType: '',
    severity: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Queries
  const { data: appLogsData, isLoading: isLoadingApp, refetch: refetchApp } = useApplicationLogs(
    activeTab === 'application' ? filters : {}
  );
  const { data: auditLogsData, isLoading: isLoadingAudit, refetch: refetchAudit } = useAuditLogs(
    activeTab === 'audit' ? filters : {}
  );
  const { data: securityLogsData, isLoading: isLoadingSecurity, refetch: refetchSecurity } = useSecurityLogs(
    activeTab === 'security' ? filters : {}
  );
  const { data: statsData } = useLogStatistics();
  const cleanupMutation = useCleanupLogs();

  const isLoading = isLoadingApp || isLoadingAudit || isLoadingSecurity;

  // Filter handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      level: '',
      category: '',
      eventType: '',
      severity: '',
      startDate: '',
      endDate: ''
    });
  };

  // Get log level color
  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'http': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'debug': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR'),
      relative: getRelativeTime(date)
    };
  };

  // Get relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Cleanup handler
  const handleCleanup = () => {
    if (confirm('90 günden eski loglar silinecek. Emin misiniz?')) {
      cleanupMutation.mutate(90);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    if (activeTab === 'application') refetchApp();
    else if (activeTab === 'audit') refetchAudit();
    else if (activeTab === 'security') refetchSecurity();
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'application') return appLogsData;
    if (activeTab === 'audit') return auditLogsData;
    if (activeTab === 'security') return securityLogsData;
    return null;
  };

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiActivity className="mr-3 text-blue-600" />
                Sistem Logları
              </h1>
              <p className="text-gray-600 mt-2">
                Uygulama, güvenlik ve audit loglarını görüntüleyin ve yönetin
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="mr-2" />
                Filtreler
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Application Logs</h3>
                  <p className="text-3xl font-bold mt-2">
                    {statsData.totals?.applicationLogs?.toLocaleString() || 0}
                  </p>
                </div>
                <FiDatabase className="w-8 h-8 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm opacity-90">
                <FiTrendingUp className="mr-1" />
                Son 7 gün
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Audit Logs</h3>
                  <p className="text-3xl font-bold mt-2">
                    {statsData.totals?.auditLogs?.toLocaleString() || 0}
                  </p>
                </div>
                <FiCheckCircle className="w-8 h-8 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm opacity-90">
                <FiUser className="mr-1" />
                Kullanıcı aksiyonları
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Security Logs</h3>
                  <p className="text-3xl font-bold mt-2">
                    {statsData.totals?.securityLogs?.toLocaleString() || 0}
                  </p>
                </div>
                <FiShield className="w-8 h-8 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm opacity-90">
                <FiAlertTriangle className="mr-1" />
                Güvenlik olayları
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Toplam Log</h3>
                  <p className="text-3xl font-bold mt-2">
                    {(statsData.totals?.applicationLogs || 0) + 
                     (statsData.totals?.auditLogs || 0) + 
                     (statsData.totals?.securityLogs || 0)}
                  </p>
                </div>
                <FiActivity className="w-8 h-8 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm opacity-90">
                <FiClock className="mr-1" />
                Bu dönem
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab('application')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'application'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiDatabase className="mr-2" />
                Application Logs
                {activeTab === 'application' && currentData && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                    {currentData.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'audit'
                    ? 'border-green-500 text-green-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Audit Logs
                {activeTab === 'audit' && currentData && (
                  <span className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    {currentData.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-red-500 text-red-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiShield className="mr-2" />
                Security Logs
                {activeTab === 'security' && currentData && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                    {currentData.total}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Tümünü Temizle
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Application Log Filters */}
                {activeTab === 'application' && (
                  <>
                    <select
                      value={filters.level}
                      onChange={(e) => handleFilterChange('level', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tüm Seviyeler</option>
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="http">HTTP</option>
                      <option value="debug">Debug</option>
                    </select>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tüm Kategoriler</option>
                      <option value="auth">Auth</option>
                      <option value="api">API</option>
                      <option value="database">Database</option>
                      <option value="security">Security</option>
                      <option value="business">Business</option>
                    </select>
                  </>
                )}

                {/* Security Log Filters */}
                {activeTab === 'security' && (
                  <>
                    <select
                      value={filters.severity}
                      onChange={(e) => handleFilterChange('severity', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tüm Önem Dereceleri</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <input
                      type="text"
                      value={filters.eventType}
                      onChange={(e) => handleFilterChange('eventType', e.target.value)}
                      placeholder="Event Type"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                )}

                {/* Date Filters */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      placeholder="Başlangıç"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      placeholder="Bitiş"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCleanup}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={cleanupMutation.isPending}
                >
                  <FiTrash2 className="mr-2" />
                  Eski Logları Temizle
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Filtreleri Kapat
                </button>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : currentData?.logs?.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentData.logs.map((log) => {
                    const timestamp = formatTimestamp(log.timestamp);
                    return (
                      <div 
                        key={log.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setClickPosition({ 
                            x: rect.left, 
                            y: rect.top + window.scrollY 
                          });
                          setSelectedLog(log);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-2">
                              {/* Timestamp */}
                              <div className="flex items-center text-sm text-gray-500">
                                <FiClock className="mr-1" />
                                <span>{timestamp.relative}</span>
                              </div>
                              
                              {/* Level/Severity Badge */}
                              {activeTab === 'application' && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLogLevelColor(log.level)}`}>
                                  {log.level.toUpperCase()}
                                </span>
                              )}
                              {activeTab === 'security' && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                                  {log.severity.toUpperCase()}
                                </span>
                              )}
                              
                              {/* Category/Event Type */}
                              {activeTab === 'application' && log.category && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {log.category}
                                </span>
                              )}
                              {activeTab === 'security' && log.event_type && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {log.event_type}
                                </span>
                              )}
                            </div>
                            
                            {/* Message */}
                            <div className="mb-3">
                              <p className="text-gray-900 font-medium">{log.message}</p>
                            </div>
                            
                            {/* Details */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {/* User Info */}
                              {activeTab === 'audit' && (
                                <div className="flex items-center">
                                  <FiUser className="mr-1" />
                                  <span>{log.actor_name} ({log.actor_role})</span>
                                </div>
                              )}
                              
                              {/* Action */}
                              {activeTab === 'audit' && (
                                <div className="flex items-center">
                                  <FiCode className="mr-1" />
                                  <span>{log.action}</span>
                                </div>
                              )}
                              
                              {/* IP Address */}
                              {log.ip_address && (
                                <div className="flex items-center">
                                  <FiGlobe className="mr-1" />
                                  <span>{log.ip_address}</span>
                                </div>
                              )}
                              
                              {/* Duration */}
                              {log.duration_ms && (
                                <div className="flex items-center">
                                  <FiClock className="mr-1" />
                                  <span>{log.duration_ms}ms</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {currentData.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{currentData.total.toLocaleString()}</span> kayıt bulundu - 
                      Sayfa <span className="font-medium">{currentData.page}</span> / <span className="font-medium">{currentData.totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentData.page - 1)}
                        disabled={currentData.page === 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={() => handlePageChange(currentData.page + 1)}
                        disabled={currentData.page === currentData.totalPages}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Log kaydı bulunamadı</h3>
                <p className="text-gray-500">Seçilen filtreler için herhangi bir log kaydı bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Log Detail Modal */}
        {selectedLog && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setSelectedLog(null)}
          >
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl max-w-4xl w-[90%] max-h-[85vh] overflow-hidden"
              style={{ 
                top: `${Math.max(clickPosition.y - 50, 50)}px`
              }}
              onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
              <div className="bg-white p-6 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Log Detayı</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Zaman</label>
                      <p className="text-gray-900">{formatTimestamp(selectedLog.timestamp).date} {formatTimestamp(selectedLog.timestamp).time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Log ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedLog.id}</p>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mesaj</label>
                    <p className="text-gray-900 mt-1">{selectedLog.message}</p>
                  </div>
                  
                  {/* Application Log Fields */}
                  {activeTab === 'application' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLog.level && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Level</label>
                          <p className="text-gray-900">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLogLevelColor(selectedLog.level)}`}>
                              {selectedLog.level.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      )}
                      {selectedLog.category && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Kategori</label>
                          <p className="text-gray-900">{selectedLog.category}</p>
                        </div>
                      )}
                      {selectedLog.request_id && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Request ID</label>
                          <p className="text-gray-900 font-mono text-xs">{selectedLog.request_id}</p>
                        </div>
                      )}
                      {selectedLog.user_id && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">User ID</label>
                          <p className="text-gray-900">{selectedLog.user_id}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit Log Fields */}
                  {activeTab === 'audit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLog.action && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Aksiyon</label>
                          <p className="text-gray-900">{selectedLog.action}</p>
                        </div>
                      )}
                      {selectedLog.actor_id && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Actor ID</label>
                          <p className="text-gray-900">{selectedLog.actor_id}</p>
                        </div>
                      )}
                      {selectedLog.actor_role && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Actor Role</label>
                          <p className="text-gray-900">{selectedLog.actor_role}</p>
                        </div>
                      )}
                      {selectedLog.resource_type && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Resource Type</label>
                          <p className="text-gray-900">{selectedLog.resource_type}</p>
                        </div>
                      )}
                      {selectedLog.resource_id && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Resource ID</label>
                          <p className="text-gray-900">{selectedLog.resource_id}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security Log Fields */}
                  {activeTab === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLog.event_type && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Event Type</label>
                          <p className="text-gray-900">{selectedLog.event_type}</p>
                        </div>
                      )}
                      {selectedLog.severity && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Severity</label>
                          <p className="text-gray-900">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedLog.severity)}`}>
                              {selectedLog.severity.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      )}
                      {selectedLog.user_id && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">User ID</label>
                          <p className="text-gray-900">{selectedLog.user_id}</p>
                        </div>
                      )}
                      {selectedLog.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedLog.email}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Common Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLog.ip_address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">IP Adresi</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedLog.ip_address}</p>
                      </div>
                    )}
                    {selectedLog.user_agent && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">User Agent</label>
                        <p className="text-gray-900 text-sm break-all">{selectedLog.user_agent}</p>
                      </div>
                    )}
                    {selectedLog.url && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">URL</label>
                        <p className="text-gray-900 text-sm break-all font-mono bg-gray-50 p-2 rounded">{selectedLog.url}</p>
                      </div>
                    )}
                    {selectedLog.method && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">HTTP Method</label>
                        <p className="text-gray-900">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium text-sm">
                            {selectedLog.method}
                          </span>
                        </p>
                      </div>
                    )}
                    {selectedLog.status_code && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status Code</label>
                        <p className="text-gray-900">
                          <span className={`inline-block px-3 py-1 rounded font-medium text-sm ${
                            selectedLog.status_code >= 500 ? 'bg-red-100 text-red-800' :
                            selectedLog.status_code >= 400 ? 'bg-orange-100 text-orange-800' :
                            selectedLog.status_code >= 300 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {selectedLog.status_code}
                          </span>
                        </p>
                      </div>
                    )}
                    {selectedLog.response_time && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Response Time</label>
                        <p className="text-gray-900">{selectedLog.response_time}ms</p>
                      </div>
                    )}
                  </div>

                  {/* Old/New Values for Audit */}
                  {activeTab === 'audit' && (selectedLog.old_values || selectedLog.new_values) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLog.old_values && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Eski Değerler</label>
                          <pre className="mt-2 p-4 bg-red-50 text-red-900 rounded-lg text-xs overflow-x-auto font-mono">
                            {JSON.stringify(typeof selectedLog.old_values === 'string' ? JSON.parse(selectedLog.old_values) : selectedLog.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.new_values && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Yeni Değerler</label>
                          <pre className="mt-2 p-4 bg-green-50 text-green-900 rounded-lg text-xs overflow-x-auto font-mono">
                            {JSON.stringify(typeof selectedLog.new_values === 'string' ? JSON.parse(selectedLog.new_values) : selectedLog.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Metadata */}
                  {selectedLog.metadata && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Metadata</label>
                      <pre className="mt-2 p-4 bg-gray-50 text-gray-900 rounded-lg text-xs overflow-x-auto font-mono border border-gray-200">
                        {JSON.stringify(typeof selectedLog.metadata === 'string' ? JSON.parse(selectedLog.metadata) : selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {/* Stack Trace */}
                  {selectedLog.stack_trace && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Stack Trace</label>
                      <pre className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg text-xs overflow-x-auto text-red-900 font-mono">
                        {selectedLog.stack_trace}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;

