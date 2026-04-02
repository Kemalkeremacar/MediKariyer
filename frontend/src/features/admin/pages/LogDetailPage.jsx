/**
 * LogDetailPage - Profesyonel Log Detay Sayfası
 * 
 * Log Tipleri:
 * - Application: Sistem hataları, API çağrıları, performans metrikleri
 * - Audit: Kullanıcı aksiyonları, veri değişiklikleri (kim ne yaptı, ne değişti)
 * - Security: Güvenlik olayları, başarısız giriş denemeleri, yetkisiz erişimler
 * 
 * @author MediKariyer Development Team
 * @version 4.0.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiClock, FiInfo, FiAlertCircle, 
  FiArrowLeft, FiUser, FiGlobe, FiServer,
  FiLayers, FiCopy
} from 'react-icons/fi';
import { showToast } from '@/utils/toastUtils';
import http from '@/services/http/client';

const LogDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        setIsLoading(true);
        const response = await http.get(`/logs/${type}/${id}`);
        setLog(response.data.data.log);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Log detayı yüklenirken hata oluştu');
        showToast.error('Log detayı yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    if (type && id) {
      fetchLog();
    }
  }, [type, id]);

  // Timestamp formatı
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  // Çeviriler
  const translations = {
    actions: {
      'user.register': 'Kullanıcı Kaydı', 'user.login': 'Giriş', 'user.logout': 'Çıkış',
      'user.logout_all': 'Tüm Cihazlardan Çıkış', 'user.approve': 'Kullanıcı Onayı',
      'user.reject': 'Kullanıcı Reddi', 'job.approve': 'İlan Onayı', 'job.reject': 'İlan Reddi',
      'job.request_revision': 'Revizyon İsteği', 'application.update_status': 'Başvuru Güncelleme',
      'photo_request.approve': 'Fotoğraf Onayı', 'photo_request.reject': 'Fotoğraf Reddi'
    },
    eventTypes: {
      'login_success': 'Başarılı Giriş', 'login_failed': 'Başarısız Giriş', 'logout': 'Çıkış',
      'logout_all_devices': 'Tüm Cihazlardan Çıkış', 'unauthorized_access': 'Yetkisiz Erişim',
      'user_registered': 'Kullanıcı Kaydı', 'password_reset_requested': 'Şifre Sıfırlama İsteği',
      'password_reset_completed': 'Şifre Sıfırlama Tamamlandı'
    },
    severities: { 'low': 'Düşük', 'medium': 'Orta', 'high': 'Yüksek', 'critical': 'Kritik' },
    levels: { 'error': 'Hata', 'warn': 'Uyarı', 'info': 'Bilgi', 'http': 'HTTP', 'debug': 'Debug' }
  };

  const translate = (type, value) => translations[type]?.[value] || value;

  // Badge renkleri
  const getBadgeClass = (type, value) => {
    const classes = {
      level: {
        error: 'bg-red-100 text-red-800', warn: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800', http: 'bg-purple-100 text-purple-800',
        debug: 'bg-gray-100 text-gray-800'
      },
      severity: {
        critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800',
        medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800'
      }
    };
    return classes[type]?.[value?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getLogTypeInfo = () => {
    switch (type) {
      case 'application': 
        return { 
          title: 'Uygulama Logu', 
          description: 'Sistem hataları, API çağrıları ve performans metrikleri',
          icon: FiServer,
          color: 'blue'
        };
      case 'audit': 
        return { 
          title: 'Denetim Logu', 
          description: 'Kullanıcı aksiyonları ve veri değişiklikleri',
          icon: FiUser,
          color: 'purple'
        };
      case 'security': 
        return { 
          title: 'Güvenlik Logu', 
          description: 'Güvenlik olayları ve erişim denemeleri',
          icon: FiAlertCircle,
          color: 'red'
        };
      default: 
        return { 
          title: 'Log', 
          description: '',
          icon: FiActivity,
          color: 'gray'
        };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast.success('Panoya kopyalandı');
    }).catch(() => {
      showToast.error('Kopyalama başarısız');
    });
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="animate-pulse">
            <div className="h-6 lg:h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6 lg:mb-8"></div>
            <div className="space-y-4 lg:space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !log) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Log Bulunamadı</h3>
          <p className="text-gray-600 mb-6 text-sm lg:text-base">{error || 'Log kaydı bulunamadı'}</p>
          <button
            onClick={() => navigate('/admin/logs')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition-colors font-medium text-sm lg:text-base"
          >
            Log Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  const logTypeInfo = getLogTypeInfo();
  const IconComponent = logTypeInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate('/admin/logs')}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-4 lg:mb-6 transition-colors text-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Log Listesine Dön</span>
            <span className="sm:hidden">Geri</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-${logTypeInfo.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <IconComponent className={`h-5 w-5 lg:h-6 lg:w-6 text-${logTypeInfo.color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
                {logTypeInfo.title} Detayı
              </h1>
              <p className="text-gray-600 mb-4 text-sm lg:text-base">
                {logTypeInfo.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiLayers className="w-4 h-4" />
                  Log ID: #{log.id}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:space-y-6">
          {/* Log Mesajı */}
          {log.message && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  Log Mesajı
                </h3>
                <button
                  onClick={() => copyToClipboard(log.message)}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors self-start sm:self-auto"
                >
                  <FiCopy className="w-3 h-3" />
                  Kopyala
                </button>
              </div>
              <div className={`p-3 lg:p-4 rounded-lg border ${
                (log.level === 'error' || log.severity === 'critical' || log.severity === 'high') 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`leading-relaxed whitespace-pre-wrap text-sm lg:text-base ${
                  (log.level === 'error' || log.severity === 'critical' || log.severity === 'high') 
                    ? 'text-red-900 font-medium' 
                    : 'text-gray-900'
                }`}>
                  {log.message}
                </p>
              </div>
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-green-600" />
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Zaman</label>
                  <p className="text-gray-900 font-mono text-sm">{formatTimestamp(log.timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Log ID</label>
                  <p className="text-gray-900 font-mono text-sm">#{log.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Application Log Fields */}
                {type === 'application' && (
                  <>
                    {log.level && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Log Seviyesi</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass('level', log.level)}`}>
                          {translate('levels', log.level)}
                        </span>
                      </div>
                    )}
                    {log.category && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Kategori</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {log.category}
                        </span>
                      </div>
                    )}
                    {log.platform && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Platform</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.platform === 'web' ? 'bg-blue-100 text-blue-800' :
                          log.platform === 'mobile-ios' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.platform === 'web' ? 'Web' :
                           log.platform === 'mobile-ios' ? 'Mobile iOS' :
                           log.platform === 'mobile-android' ? 'Mobile Android' :
                           log.platform}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Audit Log Fields */}
                {type === 'audit' && (
                  <>
                    {log.action && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">İşlem</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {translate('actions', log.action)}
                        </span>
                      </div>
                    )}
                    {log.actor_role && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Kullanıcı Rolü</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {log.actor_role}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Security Log Fields */}
                {type === 'security' && (
                  <>
                    {log.event_type && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Olay Tipi</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {translate('eventTypes', log.event_type)}
                        </span>
                      </div>
                    )}
                    {log.severity && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Önem Derecesi</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass('severity', log.severity)}`}>
                          {translate('severities', log.severity)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Kullanıcı Bilgileri */}
          {((type === 'audit' && (log.actor_name || log.actor_email || log.actor_id)) || 
            (type === 'security' && (log.user_id || log.email))) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-purple-600" />
                {type === 'audit' ? 'İşlemi Yapan Kullanıcı' : 'Kullanıcı Bilgileri'}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {type === 'audit' && (
                  <>
                    {log.actor_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Kullanıcı ID</label>
                        <p className="text-gray-900">{log.actor_id}</p>
                      </div>
                    )}
                    {log.actor_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Ad Soyad</label>
                        <p className="text-gray-900 font-medium">{log.actor_name}</p>
                      </div>
                    )}
                    {log.actor_email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">E-posta</label>
                        <p className="text-gray-900">{log.actor_email}</p>
                      </div>
                    )}
                    {log.resource_type && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Etkilenen Kaynak</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {log.resource_type}
                        </span>
                      </div>
                    )}
                    {log.resource_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Kaynak ID</label>
                        <p className="text-gray-900">{log.resource_id}</p>
                      </div>
                    )}
                  </>
                )}
                
                {type === 'security' && (
                  <>
                    {log.user_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Kullanıcı ID</label>
                        <p className="text-gray-900">{log.user_id}</p>
                      </div>
                    )}
                    {log.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">E-posta</label>
                        <p className="text-gray-900">{log.email}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Değişiklik Detayları (Audit Log) */}
          {type === 'audit' && (log.old_values || log.new_values) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
                Değişiklik Detayları
              </h3>
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                {log.old_values && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Eski Değerler</label>
                    <div className="relative">
                      <pre className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                        {(() => {
                          try {
                            const value = typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values;
                            return JSON.stringify(value, null, 2);
                          } catch (e) {
                            return typeof log.old_values === 'string' ? log.old_values : JSON.stringify(log.old_values, null, 2);
                          }
                        })()}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(log.old_values)}
                        className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FiCopy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                {log.new_values && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Yeni Değerler</label>
                    <div className="relative">
                      <pre className="p-4 bg-green-50 text-green-900 border border-green-200 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                        {(() => {
                          try {
                            const value = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
                            return JSON.stringify(value, null, 2);
                          } catch (e) {
                            return typeof log.new_values === 'string' ? log.new_values : JSON.stringify(log.new_values, null, 2);
                          }
                        })()}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(log.new_values)}
                        className="absolute top-2 right-2 p-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <FiCopy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Teknik Detaylar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
              <FiGlobe className="w-5 h-5 text-indigo-600" />
              Teknik Detaylar
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {log.ip_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">IP Adresi</label>
                  <p className="text-gray-900 font-mono text-sm">{log.ip_address}</p>
                </div>
              )}
              {type === 'application' && log.user_id && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Kullanıcı ID</label>
                  <p className="text-gray-900">{log.user_id}</p>
                </div>
              )}
              {log.method && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">HTTP Metodu</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {log.method}
                  </span>
                </div>
              )}
              {log.status_code && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Durum Kodu</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.status_code >= 500 ? 'bg-red-100 text-red-800' :
                    log.status_code >= 400 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.status_code}
                  </span>
                </div>
              )}
              {log.duration_ms && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">İşlem Süresi</label>
                  <p className="text-gray-900">
                    {log.duration_ms}ms
                    {log.duration_ms > 1000 && (
                      <span className="text-xs text-orange-600 ml-2">
                        ({(log.duration_ms / 1000).toFixed(2)}s)
                      </span>
                    )}
                  </p>
                </div>
              )}
              {log.request_id && (
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Request ID</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-gray-900 font-mono text-xs break-all flex-1 bg-gray-50 p-2 rounded border">{log.request_id}</p>
                    <button
                      onClick={() => copyToClipboard(log.request_id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors self-start sm:self-auto"
                    >
                      <FiCopy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              {log.url && (
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium text-gray-600 block mb-1">URL</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-gray-900 text-sm break-all font-mono bg-gray-50 p-2 rounded border border-gray-200 flex-1">
                      {log.url}
                    </p>
                    <button
                      onClick={() => copyToClipboard(log.url)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors self-start sm:self-auto"
                    >
                      <FiCopy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Agent */}
          {log.user_agent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">User Agent</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-gray-900 text-sm break-all flex-1 font-mono bg-gray-50 p-3 rounded border border-gray-200">
                    {log.user_agent}
                  </p>
                  <button
                    onClick={() => copyToClipboard(log.user_agent)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors self-start sm:self-auto"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Browser/Device Detection */}
                <div className="flex flex-wrap gap-2">
                  {log.user_agent.toLowerCase().includes('mobile') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📱 Mobile
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('chrome') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Chrome
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('firefox') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Firefox
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('safari') && !log.user_agent.toLowerCase().includes('chrome') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Safari
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('windows') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      🪟 Windows
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('mac') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      🍎 macOS
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('linux') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      🐧 Linux
                    </span>
                  )}
                  {log.user_agent.toLowerCase().includes('android') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🤖 Android
                    </span>
                  )}
                  {(log.user_agent.toLowerCase().includes('iphone') || log.user_agent.toLowerCase().includes('ipad')) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      📱 iOS
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Metadata */}
          {log.metadata && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Ek Bilgiler (Metadata)</h3>
                <button
                  onClick={() => copyToClipboard(log.metadata)}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors self-start sm:self-auto"
                >
                  <FiCopy className="w-3 h-3" />
                  Kopyala
                </button>
              </div>
              <pre className="text-gray-900 text-xs overflow-x-auto font-mono bg-gray-50 p-3 lg:p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                {(() => {
                  try {
                    const value = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
                    return JSON.stringify(value, null, 2);
                  } catch (e) {
                    return typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata, null, 2);
                  }
                })()}
              </pre>
            </div>
          )}

          {/* Stack Trace */}
          {log.stack_trace && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
                <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                  Hata Detayları (Stack Trace)
                </h3>
                <button
                  onClick={() => copyToClipboard(log.stack_trace)}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors self-start sm:self-auto"
                >
                  <FiCopy className="w-3 h-3" />
                  Kopyala
                </button>
              </div>
              <pre className="text-red-900 text-xs overflow-x-auto font-mono bg-red-50 p-3 lg:p-4 rounded-lg border border-red-200 max-h-96 overflow-y-auto whitespace-pre-wrap">
                {log.stack_trace}
              </pre>
            </div>
          )}
          
          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-blue-600" />
              Zaman Bilgileri
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Log Zamanı (timestamp)</label>
                <p className="text-gray-900 font-mono text-sm">{formatTimestamp(log.timestamp)}</p>
              </div>
              {log.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Kayıt Zamanı (created_at)</label>
                  <p className="text-gray-900 font-mono text-sm">{formatTimestamp(log.created_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailPage;