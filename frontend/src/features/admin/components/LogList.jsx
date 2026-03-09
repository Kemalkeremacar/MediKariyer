/**
 * LogList - Log Listesi Component'i
 * 
 * Sistem loglarının listelenmesi ve görüntülenmesi için özel tasarlanmış component.
 * React.memo ile optimize edilmiş, sadece gerekli durumlarda render olur.
 * 
 * Desteklenen Log Tipleri:
 * - Application Logs: Sistem hataları, API çağrıları, performans logları
 * - Audit Logs: Kullanıcı aksiyonları, veri değişiklikleri
 * - Security Logs: Güvenlik olayları, giriş denemeleri
 * 
 * Özellikler:
 * - Responsive tasarım
 * - Pagination desteği
 * - Log detay sayfasına yönlendirme
 * - Badge'ler ile görsel kategorizasyon
 * - Timestamp formatlaması
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiEye, FiClock, 
  FiUser, FiGlobe
} from 'react-icons/fi';

const LogList = memo(({ 
  logs, 
  activeTab, 
  isLoading, 
  currentData,
  onPageChange 
}) => {
  const navigate = useNavigate();

  // Log detay sayfasına yönlendirme fonksiyonu
  const handleLogClick = (log) => {
    navigate(`/admin/logs/${activeTab}/${log.id}`);
  };

  // Timestamp'i kullanıcı dostu formata çevirme
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
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Çeviri tabloları - İngilizce değerleri Türkçe'ye çevirir
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

  // Badge renk sınıflarını belirleyen fonksiyon
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiActivity className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Log kaydı bulunamadı</h3>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          Seçilen filtreler için herhangi bir log kaydı bulunamadı. Filtreleri değiştirmeyi deneyin.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            onClick={() => handleLogClick(log)}
            className="group p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 bg-white hover:bg-blue-50/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {/* Log Level/Severity Badge */}
                  {activeTab === 'application' && log.level && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass('level', log.level)}`}>
                      {translate('levels', log.level)}
                    </span>
                  )}
                  
                  {activeTab === 'security' && log.severity && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass('severity', log.severity)}`}>
                      {translate('severities', log.severity)}
                    </span>
                  )}
                  
                  {/* Category/Event Type */}
                  {log.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {log.category}
                    </span>
                  )}
                  {log.event_type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {translate('eventTypes', log.event_type)}
                    </span>
                  )}
                  
                  {/* Platform Badge */}
                  {log.platform && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {log.platform === 'web' ? 'Web' : log.platform === 'mobile-ios' ? 'iOS' : 'Android'}
                    </span>
                  )}
                  
                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FiClock className="w-4 h-4" />
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                </div>
                {/* Audit Log - Actor Info */}
                {activeTab === 'audit' && (
                  <div className="mb-3 flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-gray-400" />
                    {log.actor_name && (
                      <span className="text-sm font-medium text-gray-900">{log.actor_name}</span>
                    )}
                    {log.actor_email && (
                      <span className="text-xs text-gray-500">({log.actor_email})</span>
                    )}
                    {log.action && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {translate('actions', log.action)}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Message */}
                <p className={`text-sm leading-relaxed ${
                  (log.level === 'error' || log.severity === 'critical' || log.severity === 'high') 
                    ? 'text-red-700 font-medium' 
                    : 'text-gray-700'
                }`}>
                  {log.message || 'Mesaj yok'}
                </p>
                
                {/* Additional Info */}
                {(log.ip_address || log.user_id || log.request_id) && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    {log.ip_address && (
                      <div className="flex items-center gap-1">
                        <FiGlobe className="w-3 h-3" />
                        <span>{log.ip_address}</span>
                      </div>
                    )}
                    {log.user_id && (
                      <div className="flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        <span>User #{log.user_id}</span>
                      </div>
                    )}
                    {log.request_id && (
                      <div className="flex items-center gap-1">
                        <span>Req: {log.request_id.substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 ml-6">
                <span className="text-xs text-gray-400 font-mono">#{log.id}</span>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FiEye className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {currentData?.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => onPageChange((currentData?.page || 1) - 1)}
            disabled={(currentData?.page || 1) === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
          >
            Önceki
          </button>
          
          <div className="flex items-center gap-1">
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, currentData?.totalPages || 1) }, (_, i) => {
              const pageNum = Math.max(1, (currentData?.page || 1) - 2) + i;
              if (pageNum > (currentData?.totalPages || 1)) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === (currentData?.page || 1)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onPageChange((currentData?.page || 1) + 1)}
            disabled={(currentData?.page || 1) >= (currentData?.totalPages || 1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </>
  );
});

LogList.displayName = 'LogList';

export default LogList;