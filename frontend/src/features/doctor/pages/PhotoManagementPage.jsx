/**
 * @file PhotoManagementPage.jsx
 * @description Fotoğraf Yönetimi Sayfası - Profil fotoğrafı yükleme ve değiştirme işlemleri
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Clock, AlertCircle, Info, Upload, RefreshCw, CheckCircle, XCircle, Image as ImageIcon, History } from 'lucide-react';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { useDoctorProfile, usePhotoRequestStatus, useRequestPhotoChange, useCancelPhotoRequest } from '../api/useDoctor.js';
import useAuthStore from '@/store/authStore';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const PhotoManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useDoctorProfile();
  const profile = profileData?.profile || {};
  const { data: photoRequestStatus, isLoading: isStatusLoading, refetch: refetchStatus } = usePhotoRequestStatus();
  const requestPhotoChangeMutation = useRequestPhotoChange();
  const cancelPhotoRequestMutation = useCancelPhotoRequest();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const fileInputRef = useRef(null);
  const prevProfilePhotoRef = useRef(profile?.profile_photo || null);
  // Persist pending state across refreshes (key depends on current user)
  const getStorageKey = () => `doctor-photo-pending-${user?.id || 'anon'}`;
  // Local history cache key per user
  const getHistoryKey = () => `doctor-photo-history-${user?.id || 'anon'}`;
  const [localHistory, setLocalHistory] = useState([]);

  // Sayfa ilk yüklendiğinde localStorage'dan pending request'i yükle
  // Backend verisi gelene kadar geçici olarak göster
  useEffect(() => {
    if (!user?.id) return;
    
    try {
      let saved = localStorage.getItem(getStorageKey());
      // Eski/yanlış anahtar (anon) kalmış olabilir: migrate et
      if (!saved) {
        const legacy = localStorage.getItem('doctor-photo-pending-anon');
        if (legacy && user?.id) {
          localStorage.setItem(getStorageKey(), legacy);
          localStorage.removeItem('doctor-photo-pending-anon');
          saved = legacy;
        }
      }
      
      // localStorage'dan pending request'i yükle (backend verisi gelene kadar)
      if (saved) {
        const pending = JSON.parse(saved);
        if (pending && pending.isPending) {
          // Backend verisi henüz gelmediyse geçici olarak göster
          // Backend verisi geldiğinde bu useEffect'teki state güncellenecek
          setAwaitingApproval(true);
          if (pending.file_url) {
            setPhotoPreview(pending.file_url);
          }
        }
      }
      
      // Local history cache'ini yükle
      const savedHistory = localStorage.getItem(getHistoryKey());
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setLocalHistory(parsed);
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Backend'den gelen veriyi normalize et
  // Backend formatı: { data: { status: {...}, history: [...] } }
  const raw = photoRequestStatus;
  const rawData = raw?.data || raw;
  
  // Status objesi: pending request'i temsil ediyor (veya null)
  const statusObj = rawData?.status || null;
  const statusObjStatus = statusObj?.status || null;
  
  // History array: tüm geçmiş kayıtlar
  const rawHistory = rawData?.history || [];
  const historyList = Array.isArray(rawHistory) ? rawHistory.map((h) => ({
    id: h.id || null, // ID'yi ekle duplicate kontrolü için
    status: h.status || h.state || h.result || 'unknown',
    reason: h.reason || h.message || h.note || '',
    file_url: h.file_url || h.fileUrl || h.url || null,
    created_at: h.created_at || h.createdAt || h.date || h.timestamp || null
  })) : [];

  // Backend'den gelen pending request'i tespit et ve state'i güncelle
  useEffect(() => {
    if (!statusObj) {
      // Backend'de pending request yok
      if (statusObjStatus !== 'pending') {
        // Eğer başka bir durumdaysa (approved/rejected) ve localStorage'da pending varsa temizle
        try {
          const saved = localStorage.getItem(getStorageKey());
          if (saved) {
            const pending = JSON.parse(saved);
            // Eğer backend'de approved/rejected durumu varsa ve localStorage'daki pending daha eskiyse temizle
            if (statusObjStatus === 'approved' || statusObjStatus === 'rejected') {
              localStorage.removeItem(getStorageKey());
              setAwaitingApproval(false);
              setPhotoPreview(null);
            }
          }
        } catch (_) {}
      }
      return;
    }

    // Backend'de pending request var
    if (statusObjStatus === 'pending') {
      setAwaitingApproval(true);
      
      // Backend'den gelen file_url'i kullan (localStorage'dan değil)
      if (statusObj.file_url) {
        setPhotoPreview(statusObj.file_url);
      }
      
      // Pending request'i localStorage'a kaydet (sayfa yenileme için)
      try {
        const maybePreview = typeof statusObj.file_url === 'string' && statusObj.file_url.length <= 300000 
          ? statusObj.file_url 
          : null;
        localStorage.setItem(
          getStorageKey(),
          JSON.stringify({
            isPending: true,
            created_at: statusObj.created_at || new Date().toISOString(),
            file_url: maybePreview,
            id: statusObj.id // ID'yi de kaydet duplicate kontrolü için
          })
        );
      } catch (_) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusObj, statusObjStatus, user?.id]);

  // History'yi backend'den gelen veriyle birleştir ve duplicate'leri önle
  useEffect(() => {
    if (!photoRequestStatus) return; // Backend verisi henüz gelmediyse bekle
    
    try {
      // Duplicate kontrolü için unique key: id varsa id kullan, yoksa created_at + status + file_url
      const keyFn = (item) => {
        if (item.id) return `id-${item.id}`;
        return `${item.created_at || ''}|${item.status}|${item.file_url || ''}`;
      };
      
      const map = new Map();
      
      // Önce backend'den gelen history'yi ekle (birincil kaynak)
      historyList.forEach((it) => {
        if (!it) return;
        map.set(keyFn(it), it);
      });
      
      // Sonra localHistory'yi ekle (cache)
      localHistory.forEach((it) => {
        if (!it) return;
        // Backend'den gelen bir kayıtla aynı değilse ekle
        const key = keyFn(it);
        if (!map.has(key)) {
          map.set(key, it);
        }
      });
      
      // tempHistory artık kullanılmıyor - backend'den gelen veri birincil kaynak
      
      // Sırala ve limit uygula
      const merged = Array.from(map.values())
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        })
        .slice(0, 50);
      
      setLocalHistory(merged);
      localStorage.setItem(getHistoryKey(), JSON.stringify(merged));
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoRequestStatus, historyList.length, user?.id]);

  // Sağ taraftaki önizleme başlangıçta boş kalmalı; sadece seçim yapılınca dolacak

  // Pending request durumunu kontrol et
  const hasPendingRequest = statusObjStatus === 'pending' || awaitingApproval;

  // On pending request status changes, auto-refresh and reset UI when completed
  useEffect(() => {
    let intervalId;
    if (statusObjStatus === 'pending' || awaitingApproval) {
      // Poll status while pending - 15 saniyede bir (daha az sıklıkta)
      intervalId = setInterval(() => {
        refetchStatus();
      }, 15000); // 5000'den 15000'e çıkarıldı
    } else if (statusObjStatus === 'approved' || statusObjStatus === 'rejected') {
      // Karar verildi: profil ve geçmişi yenile, sağ tarafı sıfırla
      refetchProfile();
      setSelectedFile(null);
      setPhotoPreview(null);
      setIsUploading(false);
      setSubmissionMessage(null);
      setAwaitingApproval(false);
      try { localStorage.removeItem(getStorageKey()); } catch (_) {}
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusObjStatus, awaitingApproval]);

  // If profile photo has changed (admin approved), force-reset right side
  useEffect(() => {
    const prev = prevProfilePhotoRef.current;
    if (profile?.profile_photo && prev !== profile.profile_photo) {
      prevProfilePhotoRef.current = profile.profile_photo;
      setSelectedFile(null);
      setPhotoPreview(null);
      setAwaitingApproval(false);
      setSubmissionMessage(null);
      try { localStorage.removeItem(getStorageKey()); } catch (_) {}
    }
  }, [profile?.profile_photo]);

  const handlePhotoChange = (e) => {
    const photoFile = e.target.files[0];
    setSelectedFile(null);
    if (!photoFile) return;
    if (!ALLOWED_TYPES.includes(photoFile.type)) {
      showToast.error(toastMessages.photoManagement.fileFormatError);
      return;
    }
    if (photoFile.size > MAX_FILE_SIZE) {
      showToast.error(toastMessages.photoManagement.fileSizeError);
      return;
    }
    setSelectedFile(photoFile);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(photoFile);
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    if (awaitingApproval || statusObjStatus === 'pending') {
      showToast.warning('Zaten bekleyen bir talebiniz var. Önce iptal edin.');
      return;
    }
    
    setIsUploading(true);
    
    // ⚡ OPTIMISTIC UPDATE: UI'ı hemen güncelle (backend'den cevap beklemeden)
    setAwaitingApproval(true);
    setSubmissionMessage({ type: 'success', text: 'Değiştirme talebiniz gönderildi. Admin onayı bekleniyor.' });
    
    // Geçici olarak localStorage'a kaydet (sayfa yenileme için)
    try {
      const maybePreview = typeof photoPreview === 'string' && photoPreview.length <= 300000 ? photoPreview : null;
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify({ 
          isPending: true, 
          created_at: new Date().toISOString(), 
          file_url: maybePreview 
        })
      );
    } catch (_) {}
    
    try {
      // Backend'e gönder (arka planda)
      await requestPhotoChangeMutation.mutateAsync(selectedFile);
      showToast.success(toastMessages.photoManagement.requestSuccess);
      
      // Backend'den güncel verileri çek (arka planda, silent)
      refetchStatus();
      refetchProfile();
    } catch (error) {
      // ❌ HATA: Optimistic update'i geri al
      setAwaitingApproval(false);
      setSubmissionMessage({ type: 'error', text: 'Fotoğraf yüklenemedi. Lütfen dosya türü/boyutunu ve bağlantınızı kontrol edin.' });
      try { localStorage.removeItem(getStorageKey()); } catch (_) {}
      showToast.error(toastMessages.photoManagement.uploadError);
    }
    setIsUploading(false);
  };

  const handleCancelRequest = async () => {
    try {
      await cancelPhotoRequestMutation.mutateAsync();
      showToast.success(toastMessages.photoManagement.cancelSuccess);
      // UI ve yerel durumu hemen senkronize et
      setAwaitingApproval(false);
      setSelectedFile(null);
      setPhotoPreview(null);
      setSubmissionMessage(null);
      try { localStorage.removeItem(getStorageKey()); } catch (_) {}
      // Sunucu durumunu tazele
      refetchStatus();
      refetchProfile();
    } catch (error) {
      showToast.error(toastMessages.photoManagement.cancelError);
    }
  };

  // Loading state - Sadece profil yüklenene kadar bekle, status arka planda yüklenebilir
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center shadow-md">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Profil yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header - Geri butonu */}
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor/profile')} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-4 w-4" />
            <span className="font-medium">Profile Dön</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl p-7 shadow-xl border border-blue-100 animate-in fade-in duration-200">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-600" /> Profil Fotoğrafı Yönetimi
            </h2>
            <p className="mt-1 text-gray-600 text-sm flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> Profil fotoğrafınız; başvurularda, ilanlarda ve hastane profillerinde görünür. Net bir yüz fotoğrafı seçiniz.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOL: Mevcut Fotoğraf */}
            <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-blue-600" /> Mevcut Fotoğraf</h3>
              <div className="flex flex-col items-center gap-3">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-700/20 border-[4px] border-blue-500/30 shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.profile_photo ? (
                    <img src={profile.profile_photo} alt="Mevcut Profil Fotoğrafı" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">Son onaylı fotoğrafınız</p>
              </div>
            </div>

            {/* SAĞ: Yeni Fotoğraf / Yükleme */}
            <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-emerald-600" /> Yeni Fotoğraf Seç / Yükle</h3>
              <div className="flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-green-400/10 to-emerald-700/20 border-[4px] border-green-500/30 shadow-xl flex items-center justify-center overflow-hidden mb-3">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Yeni Fotoğraf Önizleme" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                {hasPendingRequest && (
                  <div className="w-full mb-3 p-3 flex items-center gap-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 text-amber-700">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Onay bekleyen talebiniz var. Yeni yükleme için önce iptal edin.</span>
                    <button onClick={handleCancelRequest} className="ml-auto px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-md">İptal Et</button>
                  </div>
                )}
                {!hasPendingRequest && (
                  <>
                    <label className="block w-full">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isUploading} />
                      <span className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl px-6 py-3 mb-2 cursor-pointer text-base shadow-md transition-all duration-150">
                        <Upload className="w-5 h-5 mr-2" /> Yeni Fotoğraf Seç
                      </span>
                    </label>
                    {selectedFile && (
                      <button
                        onClick={handlePhotoUpload}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-md text-base transition-all"
                        disabled={isUploading || awaitingApproval || statusObjStatus === 'pending'}
                      >
                        {isUploading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                        {awaitingApproval || statusObjStatus === 'pending' ? 'Onay Bekleniyor...' : 'Değiştirme Talebi Gönder'}
                      </button>
                    )}
                  </>
                )}
                <p className="text-gray-500 text-xs mt-3 flex items-center gap-1"><Info className="w-4 h-4 text-blue-500" /> JPG veya PNG • Maksimum 10MB</p>
                {submissionMessage && (
                  <div className={`mt-3 w-full text-xs rounded-lg p-3 border ${submissionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {submissionMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Başvuru Geçmişi */}

          {/* Geçmiş Kayıtlar */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><History className="w-4 h-4 text-purple-600" /> Geçmiş Kayıtlar</h3>
            {localHistory.length > 0 ? (
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                {localHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-lg border border-blue-100 bg-white flex items-start gap-3 shadow-sm">
                    <div className="mt-0.5">
                      {item.status === 'approved' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {item.status === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
                      {item.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <span className="font-semibold">
                          {(() => {
                            switch (item.status) {
                              case 'approved': return 'Onaylandı';
                              case 'pending': return 'Onay bekleniyor';
                              case 'rejected': return 'Reddedildi';
                              case 'cancelled': return 'İptal edildi';
                              default: return 'Bilinmiyor';
                            }
                          })()}
                        </span>
                        <span className="text-gray-500">• {item.created_at ? new Date(item.created_at).toLocaleString('tr-TR') : '-'}</span>
                      </div>
                      {item.reason && (
                        <div className="mt-1 text-xs text-rose-600">Red Nedeni: {item.reason}</div>
                      )}
                      {item.file_url && (
                        <div className="mt-2">
                          <img src={item.file_url} alt="Geçmiş Fotoğraf" className="w-14 h-14 rounded-lg object-cover border border-blue-50" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-blue-100 bg-white text-gray-600 text-sm shadow-sm">
                Geçmiş kayıt bulunamadı.
              </div>
            )}
          </div>

          {/* Bilgilendirme */}
          <div className="mt-8 mb-2 flex flex-col gap-3">
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Gerçek ve güncel bir yüz fotoğrafı kullanmanız başvurunuzun hızlanmasına ve güvenilirliğinize katkı sağlar. Yüklemeleriniz admin onayından sonra her yere otomatik yansır.
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Sistem tarafından red veya eksik dosya seçimi durumunda size hemen bildirim gösterilir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoManagementPage;