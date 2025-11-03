/**
 * @file PhotoManagementPage.jsx
 * @description Fotoğraf Yönetimi Sayfası - Profil fotoğrafı yükleme ve değiştirme işlemleri
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Clock, AlertCircle, Info, Upload, RefreshCw, CheckCircle, XCircle, Image as ImageIcon, History } from 'lucide-react';
import { showToast } from '@/utils/toastUtils';
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
      // Poll status while pending
      intervalId = setInterval(() => {
        refetchStatus();
      }, 5000);
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
      showToast.error('Lütfen JPG veya PNG formatında bir dosya seçiniz.');
      return;
    }
    if (photoFile.size > MAX_FILE_SIZE) {
      showToast.error('Dosya boyutu en fazla 10MB olabilir.');
      return;
    }
    setSelectedFile(photoFile);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(photoFile);
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await requestPhotoChangeMutation.mutateAsync(selectedFile);
      showToast.success('Fotoğraf talebi gönderildi!');
      
      // Pending state'ini ayarla (backend'den veri gelene kadar)
      setAwaitingApproval(true);
      
      // Geçici olarak localStorage'a kaydet (backend response gelene kadar)
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
      
      // Backend'den güncel verileri çek (pending durumu ve history güncellenecek)
      await refetchStatus();
      refetchProfile();
      
      setSubmissionMessage({ type: 'success', text: 'Değiştirme talebiniz gönderildi. Admin onayı bekleniyor.' });
    } catch (error) {
      showToast.error('Fotoğraf yüklenemedi.');
      setSubmissionMessage({ type: 'error', text: 'Fotoğraf yüklenemedi. Lütfen dosya türü/boyutunu ve bağlantınızı kontrol edin.' });
    }
    setIsUploading(false);
  };

  const handleCancelRequest = async () => {
    try {
      await cancelPhotoRequestMutation.mutateAsync();
      showToast.success('Değişiklik talebiniz iptal edildi.');
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
      showToast.error('İptal işlemi başarısız.');
    }
  };

  // Loading + skeletons
  if (isProfileLoading || isStatusLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 animate-pulse">
        <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-8" />
        <div className="w-full max-w-xl bg-white/10 rounded-2xl p-14 shadow-xl">
          <div className="h-10 bg-gray-400/20 rounded mb-4 w-2/3"></div>
          <div className="h-32 w-32 bg-gray-400/20 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-400/10 rounded mb-5 w-full"></div>
          <div className="h-12 bg-blue-400/20 rounded-xl mb-3"></div>
          <div className="h-5 bg-gray-300/20 rounded w-2/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center py-8 px-2 md:px-4">
      <div className="w-full max-w-5xl">
        <div className="sticky top-0 z-20 flex justify-between items-center mb-3 bg-transparent">
          <button onClick={() => navigate('/doctor/profile')} className="flex items-center gap-2 text-blue-400 hover:text-blue-600 font-bold text-base bg-white/5 rounded-full px-4 py-2">
            <ArrowLeft className="w-5 h-5" /> Profile Dön
          </button>
          {/* Otomatik yenileniyor */}
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-7 shadow-xl border border-white/20 animate-in fade-in duration-200">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-300" /> Profil Fotoğrafı Yönetimi
            </h2>
            <p className="mt-1 text-blue-100/90 text-sm flex items-center gap-2"><Info className="w-4 h-4 text-blue-300" /> Profil fotoğrafınız; başvurularda, ilanlarda ve hastane profillerinde görünür. Net bir yüz fotoğrafı seçiniz.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOL: Mevcut Fotoğraf */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-blue-300" /> Mevcut Fotoğraf</h3>
              <div className="flex flex-col items-center gap-3">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-700/20 border-[4px] border-blue-500/30 shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.profile_photo ? (
                    <img src={profile.profile_photo} alt="Mevcut Profil Fotoğrafı" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-1">Son onaylı fotoğrafınız</p>
              </div>
            </div>

            {/* SAĞ: Yeni Fotoğraf / Yükleme */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-green-300" /> Yeni Fotoğraf Seç / Yükle</h3>
              <div className="flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-green-400/10 to-emerald-700/20 border-[4px] border-green-500/30 shadow-xl flex items-center justify-center overflow-hidden mb-3">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Yeni Fotoğraf Önizleme" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                {hasPendingRequest && (
                  <div className="w-full mb-3 p-3 flex items-center gap-2 rounded-lg border-l-4 border-yellow-500 bg-yellow-500/10 text-yellow-200">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Onay bekleyen talebiniz var. Yeni yükleme için önce iptal edin.</span>
                    <button onClick={handleCancelRequest} className="ml-auto px-3 py-1 bg-yellow-600/70 hover:bg-yellow-700 text-white text-xs rounded-md">İptal Et</button>
                  </div>
                )}
                {!hasPendingRequest && (
                  <>
                    <label className="block w-full">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isUploading} />
                      <span className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl px-6 py-3 mb-2 cursor-pointer text-base shadow-lg transition-all duration-150">
                        <Upload className="w-5 h-5 mr-2" /> Yeni Fotoğraf Seç
                      </span>
                    </label>
                    {selectedFile && (
                      <button
                        onClick={handlePhotoUpload}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold shadow-lg text-base transition-all"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                        Değiştirme Talebi Gönder
                      </button>
                    )}
                  </>
                )}
                <p className="text-gray-400 text-xs mt-3 flex items-center gap-1"><Info className="w-4 h-4" /> JPG veya PNG • Maksimum 10MB</p>
                {submissionMessage && (
                  <div className={`mt-3 w-full text-xs rounded-lg p-3 border ${submissionMessage.type === 'success' ? 'bg-green-500/10 text-green-200 border-green-500/30' : 'bg-red-500/10 text-red-200 border-red-500/30'}`}>
                    {submissionMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Başvuru Geçmişi */}

          {/* Geçmiş Kayıtlar */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><History className="w-4 h-4 text-purple-300" /> Geçmiş Kayıtlar</h3>
            {localHistory.length > 0 ? (
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                {localHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-lg border border-white/10 bg-white/5 flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-300" />}
                      {item.status === 'pending' && <Clock className="w-4 h-4 text-yellow-300" />}
                      {item.status === 'rejected' && <XCircle className="w-4 h-4 text-red-300" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-200">
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
                        <span className="text-gray-400">• {item.created_at ? new Date(item.created_at).toLocaleString('tr-TR') : '-'}</span>
                      </div>
                      {item.reason && (
                        <div className="mt-1 text-xs text-red-200">Red Nedeni: {item.reason}</div>
                      )}
                      {item.file_url && (
                        <div className="mt-2">
                          <img src={item.file_url} alt="Geçmiş Fotoğraf" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-sm">
                Geçmiş kayıt bulunamadı.
              </div>
            )}
          </div>

          {/* Bilgilendirme */}
          <div className="mt-8 mb-2 flex flex-col gap-3">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-300" />
              Gerçek ve güncel bir yüz fotoğrafı kullanmanız başvurunuzun hızlanmasına ve güvenilirliğinize katkı sağlar. Yüklemeleriniz admin onayından sonra her yere otomatik yansır.
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-blue-300" />
              Sistem tarafından red veya eksik dosya seçimi durumunda size hemen bildirim gösterilir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoManagementPage;