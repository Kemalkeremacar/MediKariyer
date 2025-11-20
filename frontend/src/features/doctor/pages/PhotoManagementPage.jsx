/**
 * @file PhotoManagementPage.jsx
 * @description Fotoğraf Yönetimi Sayfası - Profil fotoğrafı yükleme ve değiştirme işlemleri
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Clock, AlertCircle, Info, Upload, RefreshCw, CheckCircle, XCircle, Image as ImageIcon, History } from 'lucide-react';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { useDoctorProfile, usePhotoRequestStatus, useRequestPhotoChange, useCancelPhotoRequest } from '../api/useDoctor.js';
import useAuthStore from '@/store/authStore';
import { compressImage, validateImage } from '@/utils/imageUtils';

// TUTARLILIK: Tüm yerlerde 5MB limit (RegisterPage ile aynı)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const getPendingStorageKey = (userId) => `doctor-photo-pending-${userId || 'anon'}`;
const getHistoryStorageKey = (userId) => `doctor-photo-history-${userId || 'anon'}`;

const loadPendingCache = (userId) => {
  if (!userId) return null;
  try {
    let saved = localStorage.getItem(getPendingStorageKey(userId));
    if (!saved) {
      const legacy = localStorage.getItem('doctor-photo-pending-anon');
      if (legacy) {
        localStorage.setItem(getPendingStorageKey(userId), legacy);
        localStorage.removeItem('doctor-photo-pending-anon');
        saved = legacy;
      }
    }
    if (!saved) return null;
    const pending = JSON.parse(saved);
    if (pending?.isPending && (!pending.userId || pending.userId === userId)) {
      return pending;
    }
  } catch (_) {}
  return null;
};

const loadHistoryCache = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(getHistoryStorageKey(userId));
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const filtered = parsed.filter((item) => !item.userId || item.userId === userId);
    if (filtered.length === 0 && parsed.length > 0) {
      localStorage.removeItem(getHistoryStorageKey(userId));
    }
    return filtered;
  } catch (_) {}
  return [];
};

const PhotoManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useDoctorProfile();
  const profile = profileData?.profile || {};
  const { data: photoRequestStatus, isLoading: isStatusLoading, refetch: refetchStatus } = usePhotoRequestStatus();
  const requestPhotoChangeMutation = useRequestPhotoChange();
  const cancelPhotoRequestMutation = useCancelPhotoRequest();
  const pendingCache = useMemo(() => loadPendingCache(userId), [userId]);
  const historyCache = useMemo(() => loadHistoryCache(userId), [userId]);

  const [photoPreview, setPhotoPreview] = useState(pendingCache?.file_url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [awaitingApproval, setAwaitingApproval] = useState(Boolean(pendingCache?.isPending));
  const fileInputRef = useRef(null);
  const prevProfilePhotoRef = useRef(profile?.profile_photo || null);
  const prevUserIdRef = useRef(userId);
  const [pendingOverride, setPendingOverride] = useState(null);
  // Persist pending state across refreshes (key depends on current user)
  const getStorageKey = () => getPendingStorageKey(userId);
  // Local history cache key per user
  const getHistoryKey = () => getHistoryStorageKey(userId);
  
  // İlk render'da localStorage'dan history yükle (senkron)
  const [localHistory, setLocalHistory] = useState(historyCache);
  const updateHistoryState = useCallback((updater) => {
    setLocalHistory((prev) => {
      const nextHistory = typeof updater === 'function' ? updater(prev) : updater;
      if (userId) {
        try {
          localStorage.setItem(getHistoryStorageKey(userId), JSON.stringify(nextHistory));
        } catch (_) {}
      }
      return nextHistory;
    });
  }, [userId]);

  // Kullanıcı değiştiğinde (logout vs) diğer kullanıcıya ait cache'leri temizle
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    if (prevUserId && !userId) {
      try {
        const allKeys = Object.keys(localStorage);
        allKeys.forEach((key) => {
          if (key.startsWith('doctor-photo-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (_) {}
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  // Sayfa ilk yüklendiğinde localStorage'dan pending request'i ve history'yi HEMEN yükle
  // Backend verisi gelene kadar geçici olarak göster
  useEffect(() => {
    if (!userId) return;
    
    try {
      // ⚠️ CRITICAL: Önce tüm başka kullanıcılara ait cache'leri temizle
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('doctor-photo-') && !key.includes(`-${userId}`)) {
          // Bu key başka kullanıcıya ait, temizle
          localStorage.removeItem(key);
        }
      });
      
      // Local history cache'ini HEMEN yükle - KİŞİYE ÖZEL KONTROL (Backend gelmeden önce göster)
      const historyFromCache = loadHistoryCache(userId);
      if (historyFromCache.length > 0) {
        setLocalHistory(historyFromCache);
      }
      
      const pendingFromCache = loadPendingCache(userId);
      if (pendingFromCache?.isPending) {
        setAwaitingApproval(true);
        if (pendingFromCache.file_url) {
          setPhotoPreview(pendingFromCache.file_url);
        }
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    setPendingOverride(null);
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
            userId: user?.id, // Kişiye özel
            created_at: statusObj.created_at || new Date().toISOString(),
            file_url: maybePreview,
            id: statusObj.id // ID'yi de kaydet duplicate kontrolü için
          })
        );
      } catch (_) {}
      return; // Early return - pending durumunda işlem bitti
    }

    // Backend approved/rejected döndü → Temizle
    if (statusObjStatus === 'approved' || statusObjStatus === 'rejected') {
      setAwaitingApproval(false);
      setPhotoPreview(null);
      try {
        localStorage.removeItem(getStorageKey());
      } catch (_) {}
      return;
    }

    // Backend null döndü (hiç talep yok)
    // ⚠️ Optimistic update sırasında da null dönebilir, bu yüzden localStorage kontrol edelim
    if (!statusObj) {
      try {
        const saved = localStorage.getItem(getStorageKey());
        if (saved) {
          const pending = JSON.parse(saved);
          // LocalStorage'da pending var ve kişiye ait → Optimistic update devam ediyor, dokunma
          if (pending?.isPending && (!pending?.userId || pending.userId === user?.id)) {
            return; // Optimistic update sürecinde, backend henüz kaydetmedi
          }
        }
        // LocalStorage boş veya başka kullanıcıya ait → Temizle
        setAwaitingApproval(false);
        setPhotoPreview(null);
        localStorage.removeItem(getStorageKey());
      } catch (_) {
        setAwaitingApproval(false);
        setPhotoPreview(null);
      }
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
      const hasPendingFromBackend = historyList.some((it) => it?.status === 'pending');
      
      // Önce backend'den gelen history'yi ekle (birincil kaynak)
      historyList.forEach((it) => {
        if (!it) return;
        map.set(keyFn(it), it);
      });
      
      // Sonra localHistory'yi ekle (cache)
      localHistory.forEach((it) => {
        if (!it) return;
        if (hasPendingFromBackend && (it.optimistic || (!it.id && it.status === 'pending'))) {
          return;
        }
        // Backend'den gelen bir kayıtla aynı değilse ekle
        const key = keyFn(it);
        if (!map.has(key)) {
          map.set(key, it);
        }
      });
      
      // tempHistory artık kullanılmıyor - backend'den gelen veri birincil kaynak
      
      // Sırala ve limit uygula (en yeni tarih en başta)
      const merged = Array.from(map.values())
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA; // En yeni (dateB) - En eski (dateA) = büyükten küçüğe
        })
        .slice(0, 50)
        .map(item => ({ ...item, userId: user?.id })); // Her item'a userId ekle (kişiye özel cache)
      
      updateHistoryState(merged);
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoRequestStatus, historyList.length, user?.id, updateHistoryState]);

  // Sağ taraftaki önizleme başlangıçta boş kalmalı; sadece seçim yapılınca dolacak

  // Pending request durumunu kontrol et
  const hasPendingRequest = pendingOverride !== null
    ? pendingOverride
    : (statusObjStatus === 'pending' || awaitingApproval);
  const isInitialStatusLoading = isStatusLoading && !photoRequestStatus;
  const disableUploadActions = isInitialStatusLoading || hasPendingRequest || isUploading || requestPhotoChangeMutation.isPending;

  // On pending request status changes, auto-refresh and reset UI when completed
  useEffect(() => {
    let intervalId;
    if (statusObjStatus === 'pending' || awaitingApproval) {
      // Poll status while pending - 3 saniyede bir (admin onayladığında HEMEN görsün)
      intervalId = setInterval(() => {
        refetchStatus();
        refetchProfile(); // Profili de yenile (fotoğraf değişmişse görsün)
      }, 3000); // Admin onayı için daha reaktif
    } else if (statusObjStatus === 'approved' || statusObjStatus === 'rejected') {
      // ✅ Karar verildi: profil ve geçmişi yenile, sağ tarafı sıfırla
      refetchProfile(); // Fotoğraf değişmişse hemen yükle
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

  const handlePhotoChange = async (e) => {
    const photoFile = e.target.files[0];
    setSelectedFile(null);
    if (!photoFile) return;

    // TUTARLILIK: imageUtils kullanarak validation
    const validation = validateImage(photoFile, { 
      maxSizeMB: 5,
      allowedTypes: ALLOWED_TYPES
    });
    if (!validation.valid) {
      showToast.error(validation.error || toastMessages.photoManagement.fileFormatError);
      return;
    }

    try {
      // TUTARLILIK: Compression ekle (RegisterPage ile aynı)
      const compressedBase64 = await compressImage(photoFile, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        maxSizeMB: 2
      });
      
      setSelectedFile(photoFile); // Orijinal file'ı sakla (backend'e gönderilecek)
      setPhotoPreview(compressedBase64); // Compressed preview göster
    } catch (error) {
      showToast.error(error.message || 'Fotoğraf yüklenirken bir hata oluştu');
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    if (awaitingApproval || statusObjStatus === 'pending') {
      showToast.warning('Zaten bekleyen bir talebiniz var. Önce iptal edin.');
      return;
    }

    // TUTARLILIK: Compression ile base64 oluştur (photoPreview zaten compressed)
    let base64ToSend = photoPreview;
    if (!base64ToSend && selectedFile) {
      try {
        base64ToSend = await compressImage(selectedFile, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85,
          maxSizeMB: 2
        });
      } catch (error) {
        showToast.error(error.message || 'Fotoğraf işlenirken bir hata oluştu');
        return;
      }
    }

    // ⚡ OPTIMISTIC UPDATE: UI'ı HEMEN güncelle (backend'den cevap beklemeden)
    setAwaitingApproval(true);
    setPendingOverride(true);
    setSubmissionMessage({ type: 'success', text: 'Değiştirme talebiniz gönderildi. Admin onayı bekleniyor.' });

    // Geçici olarak localStorage'a kaydet (sayfa yenileme için - KİŞİYE ÖZEL KEY)
    let maybePreview = null;
    try {
      maybePreview = typeof base64ToSend === 'string' && base64ToSend.length <= 300000 ? base64ToSend : null;
      localStorage.setItem(
        getStorageKey(), // user?.id içeren kişiye özel key
        JSON.stringify({
          isPending: true,
          userId: user?.id, // Ekstra güvenlik: user ID'yi de sakla
          created_at: new Date().toISOString(),
          file_url: maybePreview,
        }),
      );
    } catch (_) {}

    updateHistoryState((prev) => {
      const optimisticEntry = {
        id: `pending-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        file_url: maybePreview,
        optimistic: true,
        userId: user?.id,
      };
      const withoutOldOptimistic = prev.filter((item) => !(item.optimistic && item.status === 'pending'));
      return [optimisticEntry, ...withoutOldOptimistic].slice(0, 50);
    });

    setIsUploading(true);

    try {
      // Backend'e gönder (compressed base64 string)
      await requestPhotoChangeMutation.mutateAsync(base64ToSend);
      showToast.success(toastMessages.photoManagement.requestSuccess);

      // Backend'den güncel verileri çek (pending durumu ve history güncellenecek)
      await refetchStatus();
      refetchProfile();

    } catch (error) {
      // ❌ HATA: Optimistic update'i geri al
      setAwaitingApproval(false);
      setPendingOverride(false);
      setSubmissionMessage({ type: 'error', text: 'Fotoğraf yüklenemedi. Lütfen dosya türü/boyutunu ve bağlantınızı kontrol edin.' });
      try { localStorage.removeItem(getStorageKey()); } catch (_) {}
      showToast.error(toastMessages.photoManagement.uploadError);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelPhotoRequestMutation.mutateAsync();
      // Toast mesajı useCancelPhotoRequest hook'u içinde gösteriliyor, burada tekrar göstermeye gerek yok
      // UI ve yerel durumu hemen senkronize et
      setAwaitingApproval(false);
      setPendingOverride(false);
      setSelectedFile(null);
      setPhotoPreview(null);
      setSubmissionMessage(null);
      try { localStorage.removeItem(getStorageKey()); } catch (_) {}
      updateHistoryState((prev) => {
        let updated = false;
        const mapped = prev.map((item) => {
          if (!updated && item.status === 'pending') {
            updated = true;
            return {
              ...item,
              status: 'cancelled',
              updated_at: new Date().toISOString(),
              optimistic: false,
            };
          }
          return item;
        });
        return mapped;
      });
      // Sunucu durumunu tazele
      refetchStatus();
      refetchProfile();
    } catch (error) {
      // Hata toast'ı da hook içinde gösteriliyor
      console.error('Cancel photo request error:', error);
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
                {isInitialStatusLoading && (
                  <div className="w-full mb-3 p-3 flex items-center gap-2 rounded-lg border-l-4 border-blue-400 bg-blue-50 text-blue-700">
                    <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
                    <span>Fotoğraf talep durumu yükleniyor. Lütfen birkaç saniye bekleyin.</span>
                  </div>
                )}
                {hasPendingRequest && !isInitialStatusLoading && (
                  <div className="w-full mb-3 p-3 flex items-center gap-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 text-amber-700">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Onay bekleyen talebiniz var. Yeni yükleme için önce iptal edin.</span>
                    <button
                      onClick={handleCancelRequest}
                      disabled={cancelPhotoRequestMutation.isPending}
                      className={`ml-auto px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-md ${cancelPhotoRequestMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {cancelPhotoRequestMutation.isPending ? 'İptal ediliyor...' : 'İptal Et'}
                    </button>
                  </div>
                )}
                {!hasPendingRequest && (
                  <>
                    <label className={`block w-full ${disableUploadActions ? 'pointer-events-none opacity-60' : ''}`}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                        disabled={disableUploadActions}
                      />
                      <span className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl px-6 py-3 mb-2 cursor-pointer text-base shadow-md transition-all duration-150">
                        <Upload className="w-5 h-5 mr-2" /> Yeni Fotoğraf Seç
                      </span>
                    </label>
                    {selectedFile && (
                      <button
                        onClick={handlePhotoUpload}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-md text-base transition-all"
                        disabled={disableUploadActions}
                      >
                        {isUploading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : hasPendingRequest ? (
                          <Clock className="w-5 h-5" />
                        ) : disableUploadActions && isInitialStatusLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                        {disableUploadActions
                          ? hasPendingRequest
                            ? 'Onay Bekleniyor...'
                            : 'Durum yükleniyor...'
                          : 'Değiştirme Talebi Gönder'}
                      </button>
                    )}
                  </>
                )}
                <p className="text-gray-500 text-xs mt-3 flex items-center gap-1"><Info className="w-4 h-4 text-blue-500" /> JPG, PNG veya WEBP • Maksimum 5MB (otomatik optimize edilir)</p>
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