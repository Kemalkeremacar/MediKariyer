/**
 * LogDetailPage - Log detay sayfası
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiClock, FiInfo, FiAlertCircle, 
  FiArrowLeft, FiUser, FiGlobe
} from 'react-icons/fi';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  const getLogTypeTitle = () => {
    switch (type) {
      case 'application': return 'Uygulama';
      case 'audit': return 'Denetim';
      case 'security': return 'Güvenlik';
      default: return 'Log';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonLoader className="h-12 w-80 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FiAlertCircle className="w-16 h-16 text-red-900 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">Log Bulunamadı</h3>
          <p className="text-black mb-4">{error || 'Log kaydı bulunamadı'}</p>
          <button
            onClick={() => navigate('/admin/logs')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
          >
            Log Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/logs')}
          className="flex items-center gap-2 px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Log Listesine Dön
        </button>
        <h1 className="text-3xl font-bold text-black flex items-center gap-3">
          <FiActivity className="h-8 w-8 text-blue-900" />
          {getLogTypeTitle()} Log Detayı
        </h1>
        <p className="text-black mt-2">
          Log ID: #{log.id} • {formatTimestamp(log.timestamp)}
        </p>
      </div>

      <div className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <FiClock className="w-5 h-5 text-blue-900" />
            Temel Bilgiler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black">Zaman</label>
              <p className="text-black mt-1">{formatTimestamp(log.timestamp)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black">Log ID</label>
              <p className="text-black mt-1 font-mono">#{log.id}</p>
            </div>
            
            {/* Application Log Fields */}
            {type === 'application' && (
              <>
                {log.level && (
                  <div>
                    <label className="text-sm font-medium text-black">Log Seviyesi</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getBadgeClass('level', log.level)}`}>
                        {translate('levels', log.level)}
                      </span>
                    </p>
                  </div>
                )}
                {log.category && (
                  <div>
                    <label className="text-sm font-medium text-black">Kategori</label>
                    <p className="text-black mt-1 capitalize">{log.category}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Audit Log Fields */}
            {type === 'audit' && (
              <>
                {log.action && (
                  <div>
                    <label className="text-sm font-medium text-black">İşlem</label>
                    <p className="mt-1">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        {translate('actions', log.action)}
                      </span>
                    </p>
                  </div>
                )}
                {log.actor_role && (
                  <div>
                    <label className="text-sm font-medium text-black">Kullanıcı Rolü</label>
                    <p className="text-black mt-1 capitalize">{log.actor_role}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Security Log Fields */}
            {type === 'security' && (
              <>
                {log.event_type && (
                  <div>
                    <label className="text-sm font-medium text-black">Olay Tipi</label>
                    <p className="text-black mt-1">{translate('eventTypes', log.event_type)}</p>
                  </div>
                )}
                {log.severity && (
                  <div>
                    <label className="text-sm font-medium text-black">Önem Derecesi</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getBadgeClass('severity', log.severity)}`}>
                        {translate('severities', log.severity)}
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Log Mesajı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <FiInfo className="w-5 h-5 text-green-900" />
            Log Mesajı
          </h3>
          <p className="text-black leading-relaxed">{log.message || 'Mesaj bulunamadı'}</p>
        </div>
        
        {/* Kullanıcı Bilgileri (Audit Log) */}
        {type === 'audit' && (log.actor_name || log.actor_email) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-purple-900" />
              İşlemi Yapan Kullanıcı
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.actor_id && (
                <div>
                  <label className="text-sm font-medium text-black">Kullanıcı ID</label>
                  <p className="text-black mt-1">{log.actor_id}</p>
                </div>
              )}
              {log.actor_name && (
                <div>
                  <label className="text-sm font-medium text-black">Ad Soyad</label>
                  <p className="text-black mt-1 font-medium">{log.actor_name}</p>
                </div>
              )}
              {log.actor_email && (
                <div>
                  <label className="text-sm font-medium text-black">E-posta</label>
                  <p className="text-black mt-1">{log.actor_email}</p>
                </div>
              )}
              {log.resource_type && (
                <div>
                  <label className="text-sm font-medium text-black">Etkilenen Kaynak</label>
                  <p className="text-black mt-1 capitalize">{log.resource_type}</p>
                </div>
              )}
              {log.resource_id && (
                <div>
                  <label className="text-sm font-medium text-black">Kaynak ID</label>
                  <p className="text-black mt-1">{log.resource_id}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Değişiklik Detayları (Audit Log) */}
        {type === 'audit' && (log.old_values || log.new_values) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              Değişiklik Detayları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.old_values && (
                <div>
                  <label className="text-sm font-medium text-black mb-2 block">Eski Değerler</label>
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
                </div>
              )}
              {log.new_values && (
                <div>
                  <label className="text-sm font-medium text-black mb-2 block">Yeni Değerler</label>
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teknik Detaylar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <FiGlobe className="w-5 h-5 text-black" />
            Teknik Detaylar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {log.ip_address && (
              <div>
                <label className="text-sm font-medium text-black">IP Adresi</label>
                <p className="text-black mt-1 font-mono text-sm">{log.ip_address}</p>
              </div>
            )}
            {log.user_id && (
              <div>
                <label className="text-sm font-medium text-black">Kullanıcı ID</label>
                <p className="text-black mt-1">{log.user_id}</p>
              </div>
            )}
            {log.email && (
              <div>
                <label className="text-sm font-medium text-black">E-posta</label>
                <p className="text-black mt-1">{log.email}</p>
              </div>
            )}
            {log.url && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-black">URL</label>
                <p className="text-black mt-1 text-sm break-all font-mono bg-gray-50 p-2 rounded border border-gray-200">
                  {log.url}
                </p>
              </div>
            )}
            {log.method && (
              <div>
                <label className="text-sm font-medium text-black">HTTP Metodu</label>
                <p className="mt-1">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    {log.method}
                  </span>
                </p>
              </div>
            )}
            {log.status_code && (
              <div>
                <label className="text-sm font-medium text-black">Durum Kodu</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    log.status_code >= 500 ? 'bg-red-100 text-red-800' :
                    log.status_code >= 400 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.status_code}
                  </span>
                </p>
              </div>
            )}
            {log.duration_ms && (
              <div>
                <label className="text-sm font-medium text-black">İşlem Süresi</label>
                <p className="text-black mt-1">
                  {log.duration_ms}ms
                  {log.duration_ms > 1000 && (
                    <span className="text-xs text-orange-900 ml-2">
                      ({(log.duration_ms / 1000).toFixed(2)}s)
                    </span>
                  )}
                </p>
              </div>
            )}
            {log.request_id && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-black">Request ID</label>
                <p className="text-black mt-1 font-mono text-xs break-all">{log.request_id}</p>
              </div>
            )}
            {log.user_agent && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-black">User Agent</label>
                <p className="text-black mt-1 text-sm break-all">{log.user_agent}</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        {log.metadata && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              Ek Bilgiler (Metadata)
            </h3>
            <pre className="text-black text-xs overflow-x-auto font-mono bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-900" />
              Hata Detayları (Stack Trace)
            </h3>
            <pre className="text-black text-xs overflow-x-auto font-mono bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto whitespace-pre-wrap">
              {log.stack_trace}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogDetailPage;



