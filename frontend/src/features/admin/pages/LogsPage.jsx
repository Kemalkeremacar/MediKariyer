/**
 * Admin Logs Sayfası
 * 
 * Sistem loglarını görüntüleme ve yönetme sayfası
 * Backend logService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Log listesi ve filtreleme
 * - Log detay modal'ı
 * - Log seviyesi ve kategorisi filtreleme
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { 
  FiActivity, FiFilter, FiSearch, FiEye, FiClock, 
  FiAlertCircle, FiInfo, FiShield, FiEdit3, FiX
} from 'react-icons/fi';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';
import { showToast } from '@/utils/toastUtils';

const LogsPage = () => {
  // State management
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('application');
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Mock data - gerçek API hook'u yerine
  const logsLoading = false;
  const logsError = null;
  const logs = [
    {
      id: 1,
      level: 'error',
      category: 'auth',
      message: 'Kullanıcı giriş hatası: Geçersiz kimlik bilgileri',
      timestamp: new Date().toISOString(),
      action: 'LOGIN_FAILED',
      request_id: 'req_123',
      user_id: 456,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      url: '/api/auth/login',
      method: 'POST',
      status_code: 401,
      response_time: 150
    },
    {
      id: 2,
      level: 'info',
      category: 'api',
      message: 'Başarılı API çağrısı: Kullanıcı profili güncellendi',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'PROFILE_UPDATE',
      request_id: 'req_124',
      user_id: 789,
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      url: '/api/users/profile',
      method: 'PUT',
      status_code: 200,
      response_time: 89
    },
    {
      id: 3,
      level: 'warn',
      category: 'security',
      message: 'Şüpheli aktivite tespit edildi: Çoklu başarısız giriş denemesi',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: 'SECURITY_ALERT',
      request_id: 'req_125',
      user_id: null,
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      url: '/api/auth/login',
      method: 'POST',
      status_code: 429,
      response_time: 45
    }
  ];
  const pagination = { total: logs.length };

  const refetchLogs = () => {
    console.log('Logs refetched');
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      level: '',
      category: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    });
  };

  // Log detay görüntüleme
  const handleLogClick = (log, event) => {
    setClickPosition({ x: event.clientX, y: event.clientY });
    setSelectedLog(log);
  };

  // Timestamp formatı
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR')
    };
  };

  // Log level renkleri
  const getLogLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Severity renkleri
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status code renkleri
  const getStatusColor = (statusCode) => {
    if (statusCode >= 500) return 'bg-red-100 text-red-800';
    if (statusCode >= 400) return 'bg-orange-100 text-orange-800';
    if (statusCode >= 300) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Loading state
  if (logsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
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
  if (logsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Log Yükleme Hatası</h3>
          <p className="text-gray-300 mb-4">Loglar yüklenirken bir hata oluştu</p>
          <button
            onClick={() => refetchLogs()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FiActivity className="h-8 w-8 mr-3 text-indigo-600" />
            Sistem Logları
          </h1>
          <p className="text-gray-300 mt-2">
            Sistem loglarını görüntüleyin ve yönetin
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl p-4 mb-6 border border-slate-600/30 hover:shadow-xl transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Log Seviyesi</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Seviyeler</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="auth">Authentication</option>
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="security">Security</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Başlangıç Tarihi</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bitiş Tarihi</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl border border-slate-600/30 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Log Kayıtları</h2>
              <span className="text-sm text-gray-400">
                {pagination.total || 0} kayıt
              </span>
            </div>
            
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    onClick={(e) => handleLogClick(log, e)}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all duration-200 border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                            {log.level?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          {log.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {log.category}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-300">
                          {formatTimestamp(log.timestamp).date} {formatTimestamp(log.timestamp).time}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">#{log.id}</span>
                        <FiEye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-white text-sm">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
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
          <ModalContainer
            isOpen={true}
            onClose={() => setSelectedLog(null)}
            title="Log Detayı"
            size="xl"
            maxHeight="90vh"
            closeOnBackdrop={true}
            align="auto"
            fullScreenOnMobile
          >
            <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FiClock className="w-5 h-5 text-blue-400" />
                        Temel Bilgiler
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Zaman</label>
                          <p className="text-white">{formatTimestamp(selectedLog.timestamp).date} {formatTimestamp(selectedLog.timestamp).time}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Log ID</label>
                          <p className="text-white font-mono text-sm">{selectedLog.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FiInfo className="w-5 h-5 text-green-400" />
                        Mesaj
                      </h3>
                      <p className="text-gray-200">{selectedLog.message}</p>
                    </div>
                  
                    {/* Application Log Fields */}
                    {activeTab === 'application' && (
                      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FiAlertCircle className="w-5 h-5 text-orange-400" />
                          Uygulama Log Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedLog.level && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Level</label>
                              <p className="text-white">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLogLevelColor(selectedLog.level)}`}>
                                  {selectedLog.level.toUpperCase()}
                                </span>
                              </p>
                            </div>
                          )}
                          {selectedLog.category && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Kategori</label>
                              <p className="text-white">{selectedLog.category}</p>
                            </div>
                          )}
                          {selectedLog.request_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Request ID</label>
                              <p className="text-white font-mono text-xs">{selectedLog.request_id}</p>
                            </div>
                          )}
                          {selectedLog.user_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">User ID</label>
                              <p className="text-white">{selectedLog.user_id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Audit Log Fields */}
                    {activeTab === 'audit' && (
                      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FiShield className="w-5 h-5 text-purple-400" />
                          Audit Log Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedLog.action && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Aksiyon</label>
                              <p className="text-white">{selectedLog.action}</p>
                            </div>
                          )}
                          {selectedLog.actor_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Actor ID</label>
                              <p className="text-white">{selectedLog.actor_id}</p>
                            </div>
                          )}
                          {selectedLog.actor_role && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Actor Role</label>
                              <p className="text-white">{selectedLog.actor_role}</p>
                            </div>
                          )}
                          {selectedLog.resource_type && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Resource Type</label>
                              <p className="text-white">{selectedLog.resource_type}</p>
                            </div>
                          )}
                          {selectedLog.resource_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Resource ID</label>
                              <p className="text-white">{selectedLog.resource_id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Security Log Fields */}
                    {activeTab === 'security' && (
                      <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-6 border border-red-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FiShield className="w-5 h-5 text-red-400" />
                          Güvenlik Log Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedLog.event_type && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Event Type</label>
                              <p className="text-white">{selectedLog.event_type}</p>
                            </div>
                          )}
                          {selectedLog.severity && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Severity</label>
                              <p className="text-white">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedLog.severity)}`}>
                                  {selectedLog.severity.toUpperCase()}
                                </span>
                              </p>
                            </div>
                          )}
                          {selectedLog.user_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">User ID</label>
                              <p className="text-white">{selectedLog.user_id}</p>
                            </div>
                          )}
                          {selectedLog.email && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Email</label>
                              <p className="text-white">{selectedLog.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Common Fields */}
                    <div className="bg-gradient-to-r from-gray-900/30 to-slate-900/30 rounded-2xl p-6 border border-gray-500/30">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FiInfo className="w-5 h-5 text-gray-400" />
                        Ek Bilgiler
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedLog.ip_address && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">IP Adresi</label>
                            <p className="text-white font-mono text-sm">{selectedLog.ip_address}</p>
                          </div>
                        )}
                        {selectedLog.user_agent && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-400">User Agent</label>
                            <p className="text-white text-sm break-all">{selectedLog.user_agent}</p>
                          </div>
                        )}
                        {selectedLog.url && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-400">URL</label>
                            <p className="text-white text-sm break-all font-mono bg-white/5 p-2 rounded">{selectedLog.url}</p>
                          </div>
                        )}
                        {selectedLog.method && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">HTTP Method</label>
                            <p className="text-white">
                              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded font-medium text-sm">
                                {selectedLog.method}
                              </span>
                            </p>
                          </div>
                        )}
                        {selectedLog.status_code && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Status Code</label>
                            <p className="text-white">
                              <span className={`inline-block px-3 py-1 rounded font-medium text-sm ${
                                selectedLog.status_code >= 500 ? 'bg-red-500/20 text-red-300' :
                                selectedLog.status_code >= 400 ? 'bg-orange-500/20 text-orange-300' :
                                selectedLog.status_code >= 300 ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                {selectedLog.status_code}
                              </span>
                            </p>
                          </div>
                        )}
                        {selectedLog.response_time && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Response Time</label>
                            <p className="text-white">{selectedLog.response_time}ms</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Old/New Values for Audit */}
                    {activeTab === 'audit' && (selectedLog.old_values || selectedLog.new_values) && (
                      <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FiEdit3 className="w-5 h-5 text-indigo-400" />
                          Değişiklik Detayları
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedLog.old_values && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Eski Değerler</label>
                              <pre className="mt-2 p-4 bg-red-500/10 text-red-300 rounded-lg text-xs overflow-x-auto font-mono">
                                {JSON.stringify(typeof selectedLog.old_values === 'string' ? JSON.parse(selectedLog.old_values) : selectedLog.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          {selectedLog.new_values && (
                            <div>
                              <label className="text-sm font-medium text-gray-400">Yeni Değerler</label>
                              <pre className="mt-2 p-4 bg-green-500/10 text-green-300 rounded-lg text-xs overflow-x-auto font-mono">
                                {JSON.stringify(typeof selectedLog.new_values === 'string' ? JSON.parse(selectedLog.new_values) : selectedLog.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {selectedLog.metadata && (
                      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 border border-yellow-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FiInfo className="w-5 h-5 text-yellow-400" />
                          Metadata
                        </h3>
                        <pre className="text-white text-xs overflow-x-auto font-mono bg-white/5 p-4 rounded-lg">
                          {JSON.stringify(typeof selectedLog.metadata === 'string' ? JSON.parse(selectedLog.metadata) : selectedLog.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Stack Trace */}
                    {selectedLog.stack_trace && (
                      <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-2xl p-6 border border-red-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FiAlertCircle className="w-5 h-5 text-red-400" />
                          Stack Trace
                        </h3>
                        <pre className="text-white text-xs overflow-x-auto font-mono bg-white/5 p-4 rounded-lg">
                          {selectedLog.stack_trace}
                        </pre>
                      </div>
                    )}
            </div>
          </ModalContainer>
        )}
      </div>
    </div>
  );
};

export default LogsPage;