/**
 * Hospital Application Detail Sayfası
 * 
 * Hastane başvuru detay yönetimi - Modern ve kullanıcı dostu
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Başvuru detayları görüntüleme
 * - Doktor bilgileri ve profil görüntüleme (popover ile)
 * - Doktor ön yazısı görüntüleme
 * - Başvuru durumu yönetimi (dropdown ile)
 * - Hastane notu ekleme/güncelleme
 * - Geri çekilen başvurularda durum güncelleme kısıtlaması
 * - URL parametreleri ve scroll pozisyonu korunması
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * Başvuru Durumları:
 * - Başvuruldu (1): Doktor başvurdu, henüz incelenmedi
 * - İnceleniyor (2): Hastane inceliyor
 * - Kabul Edildi (3): Başvuru kabul edildi
 * - Reddedildi (4): Başvuru reddedildi
 * - Geri Çekildi (5): Doktor geri çekti (durum güncelleme yapılamaz)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, Clock, Settings, Target, 
  Eye, User, Phone, Mail, Briefcase, MapPin, AlertCircle,
  ChevronUp, XCircle
} from 'lucide-react';
import { useFloating, autoUpdate, offset, shift, FloatingPortal } from '@floating-ui/react';
import { useHospitalApplications, useUpdateApplicationStatus, useHospitalDoctorProfileDetail } from '../api/useHospital';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from './ApplicationsPage';
import { GraduationCap, Award, Languages } from 'lucide-react';

const HospitalApplicationDetailPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  // Geri butonu handler - URL parametrelerini ve scroll pozisyonunu geri yükle
  const handleGoBack = () => {
    // Kaydedilmiş URL parametrelerini al
    const savedParams = sessionStorage.getItem('hospital_applications_params');
    const params = savedParams ? `?${savedParams}` : '';
    sessionStorage.removeItem('hospital_applications_params');
    
    // Geri git
    navigate(`/hospital/applications${params}`);
    
    // Scroll pozisyonunu geri yükle (sayfa yüklendikten sonra)
    setTimeout(() => {
      const savedScrollPosition = sessionStorage.getItem('hospital_applications_scroll');
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('hospital_applications_scroll');
      }
    }, 100);
  };

  // Application'ı bulmak için tüm applications'ı fetch et
  const { data: applicationsData, isLoading: applicationsLoading } = useHospitalApplications({ page: 1, limit: 100 });
  const applications = applicationsData?.data?.applications || [];
  const application = applications.find(a => a.id === parseInt(applicationId || '0'));

  // Doktor aktif değilse (false, 0, null, undefined) profil bilgilerine erişim yok
  // Aktif edildiğinde (true, 1) profil bilgileri tekrar görünür olacak
  const isDoctorInactive = !application?.doctor_is_active || application?.doctor_is_active === false || application?.doctor_is_active === 0;
  const doctorProfileId = isDoctorInactive ? null : application?.doctor_profile_id;
  const { data: doctorProfileData, isLoading: doctorProfileLoading } = useHospitalDoctorProfileDetail(doctorProfileId);
  
  // İlan durumunu kontrol et - Pasif ilanlar için erişimi engelle
  const jobStatus = application?.job_status || application?.job_status_fallback;
  const isJobPassive = 
    jobStatus === 'Pasif' || 
    jobStatus === 'Passive' || 
    application?.job_status_id === 4 ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('pasif'));

  // Doktor profil detayı
  // Popover state
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const profileButtonRef = useRef(null);
  
  // Status options
  const { data: applicationStatuses } = useApplicationStatuses();
  const statusOptions = applicationStatuses?.length > 0 
    ? applicationStatuses.filter(s => s.value !== 5) 
    : [
        { value: 1, label: 'Başvuruldu', name: 'Başvuruldu' },
        { value: 2, label: 'İnceleniyor', name: 'İnceleniyor' },
        { value: 3, label: 'Kabul Edildi', name: 'Kabul Edildi' },
        { value: 4, label: 'Reddedildi', name: 'Reddedildi' }
      ];

  // Status management
  const [selectedStatus, setSelectedStatus] = useState(application?.status_id?.toString() || '1');
  const [notes, setNotes] = useState(application?.notes || '');
  const updateStatusMutation = useUpdateApplicationStatus();

  // Application değiştiğinde state'i güncelle
  useEffect(() => {
    if (application) {
      setSelectedStatus(application.status_id?.toString() || '1');
      setNotes(application.notes || '');
    }
  }, [application]);

  const handleViewProfile = () => {
    if (profileButtonRef.current) {
      setPopoverAnchor(profileButtonRef.current);
    }
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
  };

  const handleStatusUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: parseInt(applicationId || '0'),
        status_id: parseInt(selectedStatus),
        notes: notes || null
      });
      showToast.success(toastMessages.application.updateStatusSuccess);
    } catch (error) {
      console.error('Başvuru durumu güncelleme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.application.updateStatusError });
    }
  };

  const handleNoteOnlyUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: parseInt(applicationId || '0'),
        status_id: application?.status_id,
        notes: notes || null
      });
      showToast.success(toastMessages.application.updateNoteSuccess);
    } catch (error) {
      console.error('Not güncelleme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.application.updateNoteError });
    }
  };

  const isStatusChanged = parseInt(selectedStatus) !== (application?.status_id || 0);
  const isNotesChanged = notes !== (application?.notes || '');
  const isWithdrawn = application?.status_id === 5; // Geri çekilen başvurular için durum güncelleme yapılamaz

  if (applicationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader count={6} />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Başvuru bulunamadı</h2>
            <button
              onClick={handleGoBack}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Başvurular sayfasına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isDoctorInactive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8 flex flex-col">
        <div className="max-w-7xl mx-auto flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Başvuru Detayları</h1>
              <p className="text-gray-300 mt-1">
                {application.first_name} {application.last_name} - {application.job_title}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Doktor Hesabı Silinmiş</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Bu başvuruyu yapan doktor hesabını sildiği için profil bilgilerine erişilemiyor. Başvuru işlemleri geçmiş kayıtlarınız için saklanmaya devam eder.
            </p>
            <button
              onClick={handleGoBack}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 font-medium rounded-xl transition-all border border-blue-500/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Başvurular sayfasına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isJobPassive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8 flex flex-col">
        <div className="max-w-7xl mx-auto flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Yayından Kaldırıldı</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Bu ilan yayından kaldırıldığı için başvuru detayları görüntülenemez.
            </p>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 font-medium rounded-xl transition-all border border-blue-500/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Başvurular sayfasına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doctorProfile = doctorProfileData?.data?.profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8 flex flex-col overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8 flex-1 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Başvuru Detayları</h1>
            <p className="text-gray-300 mt-1">
              {application.first_name} {application.last_name} - {application.job_title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sol Kolon - Doktor Bilgileri ve Ön Yazı */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Doktor Bilgileri */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Doktor Bilgileri
              </h2>
              
              {doctorProfileLoading ? (
                <SkeletonLoader count={3} />
              ) : doctorProfile ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {doctorProfile.profile_photo ? (
                      <img
                        src={doctorProfile.profile_photo}
                        alt={`${doctorProfile.first_name} ${doctorProfile.last_name}`}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {doctorProfile.first_name?.[0]}{doctorProfile.last_name?.[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">
                        {doctorProfile.title} {doctorProfile.first_name} {doctorProfile.last_name}
                      </h3>
                      <p className="text-gray-300 text-sm">{doctorProfile.specialty_name || 'Uzmanlık Belirtilmemiş'}</p>
                      {doctorProfile.subspecialty_name && (
                        <p className="text-gray-400 text-xs">Yan Dal: {doctorProfile.subspecialty_name}</p>
                      )}
                    </div>
                    <button
                      ref={profileButtonRef}
                      onClick={handleViewProfile}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Profili Görüntüle
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4" />
                      <span>{application.phone || 'Belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4" />
                      <span>{application.email || 'Belirtilmemiş'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Doktor profili yüklenemedi</p>
              )}
            </div>

            {/* Doktor Profil Popover - Doktor Bilgileri ve Ön Yazı Arasında */}
            {popoverAnchor && application?.doctor_profile_id && (
              <DoctorProfilePopover
                doctorId={application.doctor_profile_id}
                doctorData={doctorProfileData?.data}
                isLoading={doctorProfileLoading}
                onClose={handleClosePopover}
                isInline={true}
              />
            )}

            {/* Doktor Ön Yazısı */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Doktor Ön Yazısı
              </h2>
              
              {application.cover_letter ? (
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <FileText className="w-4 h-4 text-green-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-900/30 to-slate-900/30 rounded-xl p-8 border border-gray-500/30 text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Ön Yazı Bulunamadı</h3>
                  <p className="text-gray-400 text-sm">
                    Bu başvuru için doktor ön yazısı eklenmemiş.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon - Durum Yönetimi */}
          <div className="space-y-6 min-w-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 w-full max-w-full overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Durum Yönetimi
              </h2>

              {/* Mevcut Durum */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 mb-4 border border-blue-500/30 min-h-[100px]">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Mevcut Durum
                </h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-shrink-0 min-w-0">
                    <StatusBadge status_id={application.status_id} statusName={application.status} />
                  </div>
                  <div className="text-right flex-shrink-0 whitespace-nowrap">
                    <span className="text-xs text-gray-400 block">Son Güncelleme</span>
                    <span className="text-sm text-gray-300">
                      {new Date(application.updated_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
                {isWithdrawn && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-yellow-300 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>Geri çekilen başvurularda durum güncelleme yapılamaz.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Başvuru Bilgileri */}
              <div className="mb-4">
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Başvuru Tarihi</span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {new Date(application.applied_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Durum Seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  Yeni Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isWithdrawn}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value} className="bg-slate-800">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Not Alanı */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  Hastane Notu
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Değerlendirme notları ekleyin..."
                  rows={4}
                  disabled={isWithdrawn}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all duration-300 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Mevcut Not Gösterimi */}
              {application.notes && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    Mevcut Not
                  </label>
                  <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">{application.notes}</p>
                  </div>
                </div>
              )}

              {/* Butonlar */}
              {!isWithdrawn ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10 min-h-[80px]">
                  {/* Sadece Not Güncelle */}
                  {!isStatusChanged && isNotesChanged && (
                    <button
                      onClick={handleNoteOnlyUpdate}
                      disabled={updateStatusMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateStatusMutation.isPending ? 'Güncelleniyor...' : 'Notu Güncelle'}
                    </button>
                  )}
                  
                  {/* Durum ve Not Güncelle */}
                  {isStatusChanged && (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updateStatusMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed break-words"
                    >
                      {updateStatusMutation.isPending ? 'Güncelleniyor...' : 'Durum ve Notu Güncelle'}
                    </button>
                  )}
                  
                  {/* Değişiklik yoksa buton gösterme */}
                  {!isStatusChanged && !isNotesChanged && (
                    <p className="text-xs text-gray-400 text-center py-3">Değişiklik yapmak için yukarıdaki alanları düzenleyin</p>
                  )}
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 min-h-[80px]">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-300 text-sm font-medium mb-1">Durum Güncelleme Devre Dışı</p>
                        <p className="text-yellow-200/80 text-xs">
                          Geri çekilen başvurularda durum veya not güncellemesi yapılamaz.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating UI Popover Component (ApplicationsPage'den kopyalandı)
/**
 * Doktor Profil Popover Bileşeni
 * 
 * Doktor profil bilgilerini modern bir popover içinde gösterir
 * İki modda çalışabilir:
 * - Inline: Doktor Bilgileri ve Ön Yazı arasında, bölümlerle aynı genişlikte
 * - Floating: Butonun sağında Floating UI ile açılır (eski davranış)
 * 
 * Özellikler:
 * - Doktor kişisel bilgileri
 * - Eğitim bilgileri
 * - İş deneyimi
 * - Sertifikalar ve kurslar
 * - Dil bilgileri
 * - Responsive tasarım
 * - Viewport overflow kontrolü
 * 
 * @param {number} doctorId - Doktor profil ID'si
 * @param {Object} doctorData - Doktor profil verisi
 * @param {boolean} isLoading - Yükleme durumu
 * @param {HTMLElement} anchorElement - Popover'in bağlanacağı element (inline modda kullanılmaz)
 * @param {Function} onClose - Popover kapatma fonksiyonu
 * @param {boolean} isInline - Inline modda gösterilecek mi (default: false)
 */
const DoctorProfilePopover = ({ doctorId, doctorData, isLoading, anchorElement, onClose, isInline = false }) => {
  if (!doctorId) return null;

  // Floating UI hook'ları - her zaman çağrılmalı (React hook kuralları)
  const floatingConfig = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    middleware: [
      offset(12),
      shift({ padding: 16 })
    ],
    placement: 'right',
    whileElementsMounted: autoUpdate,
    disabled: isInline // Inline modda Floating UI'yı devre dışı bırak
  });

  useEffect(() => {
    if (!isInline && anchorElement && floatingConfig.refs.setReference) {
      floatingConfig.refs.setReference(anchorElement);
    }
  }, [anchorElement, floatingConfig, isInline]);

  // Loading state
  if (isLoading) {
    const LoadingContent = (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

    if (isInline) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 animate-in fade-in zoom-in-95 duration-200 relative">
          {/* Kapatma Butonu - Sağ Üst Köşe */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0"
            aria-label="Kapat"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </button>
          {LoadingContent}
        </div>
      );
    }

    return (
      <FloatingPortal>
        <div
          ref={floatingConfig.refs.setFloating}
          style={floatingConfig.floatingStyles}
          className="z-50 w-[400px] max-w-[calc(100vw-32px)] bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative"
        >
          {/* Kapatma Butonu - Sağ Üst Köşe */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0"
            aria-label="Kapat"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </button>
          {LoadingContent}
        </div>
      </FloatingPortal>
    );
  }

  const profile = doctorData?.profile;
  const educations = doctorData?.educations || [];
  const experiences = doctorData?.experiences || [];
  const certificates = doctorData?.certificates || [];
  const languages = doctorData?.languages || [];

  // Profile not found state
  if (!profile) {
    const NotFoundContent = (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Profil Bulunamadı</h3>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-6 py-2 rounded-xl hover:bg-blue-500/30 transition-all"
        >
          Kapat
        </button>
      </div>
    );

    if (isInline) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 animate-in fade-in zoom-in-95 duration-200 relative">
          {/* Kapatma Butonu - Sağ Üst Köşe */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0"
            aria-label="Kapat"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </button>
          {NotFoundContent}
        </div>
      );
    }

    return (
      <FloatingPortal>
        <div
          ref={floatingConfig.refs.setFloating}
          style={floatingConfig.floatingStyles}
          className="z-50 w-[400px] max-w-[calc(100vw-32px)] bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative"
        >
          {/* Kapatma Butonu - Sağ Üst Köşe */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0"
            aria-label="Kapat"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </button>
          {NotFoundContent}
        </div>
      </FloatingPortal>
    );
  }

  // Main content
  const PopoverContent = (
    <div
      ref={isInline ? null : floatingConfig.refs.setFloating}
      style={isInline ? {} : floatingConfig.floatingStyles}
      className={`${isInline ? 'bg-white/10 backdrop-blur-sm' : 'z-50 bg-slate-800/95 backdrop-blur-md'} rounded-2xl border border-white/20 ${isInline ? '' : 'shadow-2xl'} animate-in fade-in zoom-in-95 duration-200 flex flex-col ${isInline ? 'max-h-[85vh]' : 'w-[600px] max-w-[calc(100vw-32px)] max-h-[85vh]'} relative`}
    >
        {/* Kapatma Butonu - Sağ Üst Köşe */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0"
          aria-label="Kapat"
        >
          <ChevronUp className="w-5 h-5 rotate-180" />
        </button>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {/* Kişisel ve İletişim Bilgileri */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Kişisel ve İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Ad Soyad</span>
                <p className="text-white font-medium">
                  {profile.title} {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Telefon</span>
                <p className="text-white">{profile.phone || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">E-posta</span>
                <p className="text-white">{profile.email || 'Belirtilmemiş'}</p>
              </div>
              {profile.dob && (
                <div>
                  <span className="text-gray-400 text-sm">Doğum Tarihi</span>
                  <p className="text-white">{new Date(profile.dob).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              {profile.birth_place_name && (
                <div>
                  <span className="text-gray-400 text-sm">Doğum Yeri</span>
                  <p className="text-white">{profile.birth_place_name}</p>
                </div>
              )}
              {profile.residence_city_name && (
                <div>
                  <span className="text-gray-400 text-sm">İkamet Şehri</span>
                  <p className="text-white">{profile.residence_city_name}</p>
                </div>
              )}
              {profile.specialty_name && (
                <div>
                  <span className="text-gray-400 text-sm">Uzmanlık Alanı</span>
                  <p className="text-white">{profile.specialty_name}</p>
                </div>
              )}
              {profile.subspecialty_name && (
                <div>
                  <span className="text-gray-400 text-sm">Yan Dal</span>
                  <p className="text-white">{profile.subspecialty_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          {educations.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-400" />
                Eğitim Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">{edu.institution_name}</h4>
                        <p className="text-gray-300 text-xs mb-1">{edu.field}</p>
                        {edu.degree_type && <p className="text-gray-400 text-xs mb-2">{edu.degree_type}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                            {edu.graduation_year}
                          </span>
                          {edu.education_type_name && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                              {edu.education_type_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deneyim Bilgileri */}
          {experiences.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                İş Deneyimi
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold text-sm">{exp.role_title}</h4>
                          {exp.is_current && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium ml-2 flex-shrink-0">
                              Devam Ediyor
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs mb-1">{exp.organization}</p>
                        {exp.specialty_name && (
                          <p className="text-gray-400 text-xs mb-2">
                            Uzmanlık: {exp.specialty_name}
                            {exp.subspecialty_name && ` - ${exp.subspecialty_name}`}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                            {new Date(exp.start_date).toLocaleDateString('tr-TR')} - 
                            {exp.is_current ? ' Devam Ediyor' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş')}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-gray-300 text-xs mt-2 pt-2 border-t border-white/10">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sertifikalar */}
          {certificates.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Sertifikalar ve Kurslar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">{cert.certificate_name || 'Sertifika'}</h4>
                        <p className="text-gray-300 text-xs mb-1">{cert.institution}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">
                            {cert.certificate_year}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dil Bilgileri */}
          {languages.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-cyan-400" />
                Dil Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-cyan-500/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Languages className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">{lang.language_name}</h4>
                        <p className="text-gray-300 text-xs mb-2">Seviye: {lang.level_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs font-medium">
                            {lang.level_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );

  // Inline modda direkt render et, floating modda portal içinde render et
  if (isInline) {
    return PopoverContent;
  }

  return (
    <FloatingPortal>
      {PopoverContent}
    </FloatingPortal>
  );
};

export default HospitalApplicationDetailPage;