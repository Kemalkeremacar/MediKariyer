/**
 * LogDetailPage - Log detay sayfası
 * Backend: getLogById (/api/logs/:type/:id)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiClock, FiInfo, FiShield, FiAlertCircle, 
  FiEdit3, FiArrowLeft
} from 'react-icons/fi';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
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
        showToast.error(toastMessages.log.loadError);
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

  // Log level renkleri
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

  // Severity renkleri
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'logs-badge logs-badge-critical';
      case 'high': return 'logs-badge logs-badge-high';
      case 'medium': return 'logs-badge logs-badge-medium';
      case 'low': return 'logs-badge logs-badge-low';
      default: return 'logs-badge logs-badge-debug';
    }
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

  if (error || !log) {
    return (
      <div className="logs-page-container flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Log Bulunamadı</h3>
          <p className="text-gray-600 mb-4">{error || 'Log kaydı bulunamadı'}</p>
          <button
            onClick={() => navigate('/admin/logs')}
            className="admin-btn admin-btn-primary"
          >
            Log Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-page-container">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/logs')}
            className="admin-btn admin-btn-secondary mb-4 flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Log Listesine Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiActivity className="h-8 w-8 text-blue-600" />
            {getLogTypeTitle()} Log Detayı
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Log ID: #{log.id} • {formatTimestamp(log.timestamp).relative}
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Bu log kaydı ne hakkında?</strong> Bu sayfa, sistemde gerçekleşen bir olayın detaylı bilgilerini gösterir. 
              {type === 'application' && ' Uygulama logları sistem aktivitelerini, hataları ve bilgilendirme mesajlarını içerir.'}
              {type === 'audit' && ' Denetim logları kullanıcı işlemlerini ve sistem değişikliklerini kaydeder.'}
              {type === 'security' && ' Güvenlik logları güvenlik olaylarını ve şüpheli aktiviteleri takip eder.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-blue-600" />
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Zaman</label>
                <p className="text-gray-900">{formatTimestamp(log.timestamp).date} {formatTimestamp(log.timestamp).time}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTimestamp(log.timestamp).relative}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Log ID</label>
                <p className="text-gray-900 font-mono text-sm">#{log.id}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiInfo className="w-5 h-5 text-green-600" />
              Log Mesajı
            </h3>
            <p className="text-gray-700 text-base leading-relaxed">{log.message || 'Mesaj bulunamadı'}</p>
            {log.message && (
              <p className="text-xs text-gray-500 mt-2">
                Bu mesaj, log kaydının oluşturulma nedeni ve içeriği hakkında bilgi verir.
              </p>
            )}
          </div>
          
          {/* Application Log Fields */}
          {type === 'application' && (
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-orange-600" />
                Uygulama Log Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.level && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Log Seviyesi</label>
                    <p className="text-gray-900">
                      <span className={getLogLevelColor(log.level)}>
                        {translateLevel(log.level)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.level === 'error' && 'Kritik hata - Acil müdahale gerekebilir'}
                      {log.level === 'warn' && 'Uyarı - Dikkat edilmesi gereken durum'}
                      {log.level === 'info' && 'Bilgilendirme - Normal sistem aktivitesi'}
                      {log.level === 'http' && 'HTTP isteği - API çağrısı'}
                      {log.level === 'debug' && 'Debug - Geliştirme amaçlı detaylı bilgi'}
                    </p>
                  </div>
                )}
                {log.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Kategori</label>
                    <p className="text-gray-900 capitalize">{log.category}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Log'un hangi sistem bileşenine ait olduğunu gösterir
                    </p>
                  </div>
                )}
                {log.request_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">İstek ID</label>
                    <p className="text-gray-900 font-mono text-xs break-all">{log.request_id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Bu isteği diğer loglarla ilişkilendirmek için kullanılır
                    </p>
                  </div>
                )}
                {log.user_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Kullanıcı ID</label>
                    <p className="text-gray-900">{log.user_id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Bu işlemi gerçekleştiren kullanıcının ID'si
                    </p>
                  </div>
                )}
                {log.duration_ms && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">İşlem Süresi</label>
                    <p className="text-gray-900">
                      {log.duration_ms}ms
                      {log.duration_ms > 1000 && (
                        <span className="text-xs text-orange-600 ml-2">({(log.duration_ms / 1000).toFixed(2)}s - Yavaş)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      İşlemin tamamlanma süresi (milisaniye)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Log Fields */}
          {type === 'audit' && (
            <>
              <div className="admin-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-purple-600" />
                  Denetim Log Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.action && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Yapılan İşlem</label>
                      <p className="text-gray-900">
                        <span className="logs-badge logs-badge-info">
                          {translateAction(log.action)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 font-mono">({log.action})</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sistemde gerçekleştirilen işlem tipi
                      </p>
                    </div>
                  )}
                  {log.actor_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">İşlemi Yapan Kullanıcı ID</label>
                      <p className="text-gray-900">{log.actor_id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Bu işlemi gerçekleştiren kullanıcının ID'si
                      </p>
                    </div>
                  )}
                  {log.actor_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Kullanıcı Adı</label>
                      <p className="text-gray-900 font-medium">{log.actor_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        İşlemi yapan kullanıcının tam adı
                      </p>
                    </div>
                  )}
                  {log.actor_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">E-posta Adresi</label>
                      <p className="text-gray-900">{log.actor_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        İşlemi yapan kullanıcının e-posta adresi
                      </p>
                    </div>
                  )}
                  {log.actor_role && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Kullanıcı Rolü</label>
                      <p className="text-gray-900 capitalize font-medium">
                        {log.actor_role === 'admin' ? 'Yönetici' : 
                         log.actor_role === 'doctor' ? 'Doktor' : 
                         log.actor_role === 'hospital' ? 'Hastane' : log.actor_role}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        İşlemi yapan kullanıcının sistem rolü
                      </p>
                    </div>
                  )}
                  {log.resource_type && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Etkilenen Kaynak</label>
                      <p className="text-gray-900 capitalize">
                        {log.resource_type === 'user' ? 'Kullanıcı' :
                         log.resource_type === 'job' ? 'İş İlanı' :
                         log.resource_type === 'application' ? 'Başvuru' :
                         log.resource_type === 'doctor' ? 'Doktor Profili' :
                         log.resource_type === 'hospital' ? 'Hastane Profili' : log.resource_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        İşlemin etkilediği kaynak tipi
                      </p>
                    </div>
                  )}
                  {log.resource_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Kaynak ID</label>
                      <p className="text-gray-900">{log.resource_id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Etkilenen kaynağın benzersiz ID'si
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Old/New Values */}
              {(log.old_values || log.new_values) && (
                <div className="admin-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiEdit3 className="w-5 h-5 text-indigo-600" />
                    Değişiklik Detayları
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bu bölüm, işlem sırasında değişen verilerin eski ve yeni değerlerini gösterir. 
                    Kırmızı alan eski değerleri, yeşil alan yeni değerleri temsil eder.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.old_values && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          Değişiklik Öncesi Değerler
                        </label>
                        <pre className="mt-2 p-4 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs overflow-x-auto font-mono max-h-64 overflow-y-auto">
                          {JSON.stringify(typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_values && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          Değişiklik Sonrası Değerler
                        </label>
                        <pre className="mt-2 p-4 bg-green-50 text-green-900 border border-green-200 rounded-lg text-xs overflow-x-auto font-mono max-h-64 overflow-y-auto">
                          {JSON.stringify(typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Security Log Fields */}
          {type === 'security' && (
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiShield className="w-5 h-5 text-red-600" />
                Güvenlik Log Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.event_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Güvenlik Olayı</label>
                    <p className="text-gray-900 font-medium">{translateEventType(log.event_type)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.event_type === 'login_success' && 'Kullanıcı başarıyla giriş yaptı'}
                      {log.event_type === 'login_failed' && 'Başarısız giriş denemesi - şifre hatalı olabilir'}
                      {log.event_type === 'unauthorized_access' && 'Yetkisiz erişim denemesi - güvenlik riski'}
                      {log.event_type === 'user_registered' && 'Yeni kullanıcı kaydı oluşturuldu'}
                      {log.event_type === 'logout_all_devices' && 'Kullanıcı tüm cihazlardan çıkış yaptı'}
                      {!['login_success', 'login_failed', 'unauthorized_access', 'user_registered', 'logout_all_devices'].includes(log.event_type) && 'Güvenlik ile ilgili bir olay'}
                    </p>
                  </div>
                )}
                {log.severity && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Önem Derecesi</label>
                    <p className="text-gray-900">
                      <span className={getSeverityColor(log.severity)}>
                        {translateSeverity(log.severity)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.severity === 'critical' && 'Kritik - Acil müdahale gerekli'}
                      {log.severity === 'high' && 'Yüksek - Önemli güvenlik olayı'}
                      {log.severity === 'medium' && 'Orta - Dikkat edilmesi gereken durum'}
                      {log.severity === 'low' && 'Düşük - Bilgilendirme amaçlı'}
                    </p>
                  </div>
                )}
                {log.user_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Kullanıcı ID</label>
                    <p className="text-gray-900">{log.user_id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Olayla ilişkili kullanıcının ID'si
                    </p>
                  </div>
                )}
                {log.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">E-posta Adresi</label>
                    <p className="text-gray-900">{log.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Olayla ilişkili kullanıcının e-posta adresi
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiInfo className="w-5 h-5 text-gray-600" />
              Teknik Detaylar
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bu bölüm, isteğin teknik detaylarını gösterir. Sorun giderme ve analiz için kullanılır.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.ip_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">IP Adresi</label>
                  <p className="text-gray-900 font-mono text-sm">{log.ip_address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    İsteğin geldiği IP adresi
                  </p>
                </div>
              )}
              {log.user_agent && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Tarayıcı ve Cihaz Bilgisi</label>
                  <p className="text-gray-700 text-sm break-all">{log.user_agent}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Kullanıcının kullandığı tarayıcı ve işletim sistemi bilgisi
                  </p>
                </div>
              )}
              {log.url && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">İstek URL'i</label>
                  <p className="text-gray-700 text-sm break-all font-mono bg-gray-50 p-2 rounded border border-gray-200">{log.url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    İsteğin yapıldığı sayfa veya API endpoint'i
                  </p>
                </div>
              )}
              {log.method && (
                <div>
                  <label className="text-sm font-medium text-gray-600">HTTP Metodu</label>
                  <p className="text-gray-900">
                    <span className="logs-badge logs-badge-info">
                      {log.method}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {log.method === 'GET' && 'Veri okuma isteği'}
                    {log.method === 'POST' && 'Yeni kayıt oluşturma isteği'}
                    {log.method === 'PUT' && 'Kayıt güncelleme isteği'}
                    {log.method === 'DELETE' && 'Kayıt silme isteği'}
                    {log.method === 'PATCH' && 'Kısmi güncelleme isteği'}
                  </p>
                </div>
              )}
              {log.status_code && (
                <div>
                  <label className="text-sm font-medium text-gray-600">HTTP Durum Kodu</label>
                  <p className="text-gray-900">
                    <span className={`logs-badge ${
                      log.status_code >= 500 ? 'logs-badge-error' :
                      log.status_code >= 400 ? 'logs-badge-warn' :
                      log.status_code >= 300 ? 'logs-badge-warn' :
                      'logs-badge-low'
                    }`}>
                      {log.status_code}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {log.status_code >= 500 && 'Sunucu hatası - Acil müdahale gerekli'}
                    {log.status_code >= 400 && log.status_code < 500 && 'İstemci hatası - İstek geçersiz'}
                    {log.status_code >= 300 && log.status_code < 400 && 'Yönlendirme - Normal işlem'}
                    {log.status_code >= 200 && log.status_code < 300 && 'Başarılı - İşlem tamamlandı'}
                    {log.status_code < 200 && 'Bilgi - İşlem devam ediyor'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {log.metadata && (
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiInfo className="w-5 h-5 text-yellow-600" />
                Ek Bilgiler (Metadata)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Bu bölüm, log kaydıyla ilgili ek teknik bilgileri içerir. Geliştiriciler için detaylı bilgi sağlar.
              </p>
              <pre className="text-gray-700 text-xs overflow-x-auto font-mono bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                {JSON.stringify(typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Stack Trace */}
          {log.stack_trace && (
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
                Hata Detayları (Stack Trace)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Bu bölüm, hatanın nerede ve nasıl oluştuğunu gösteren teknik detayları içerir. 
                Hata ayıklama ve sorun giderme için kullanılır.
              </p>
              <pre className="text-gray-700 text-xs overflow-x-auto font-mono bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto whitespace-pre-wrap">
                {log.stack_trace}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetailPage;

