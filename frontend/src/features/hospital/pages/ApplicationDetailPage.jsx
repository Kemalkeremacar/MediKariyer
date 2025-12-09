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
  ChevronUp, XCircle, Download
} from 'lucide-react';
import { useFloating, autoUpdate, offset, shift, FloatingPortal } from '@floating-ui/react';
import { useHospitalApplicationDetail, useUpdateApplicationStatus, useHospitalDoctorProfileDetail, downloadApplicationPDF } from '../api/useHospital';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from './ApplicationsPage';
import { GraduationCap, Award, Languages } from 'lucide-react';
import { formatDateTime, formatDate, formatDateShort, formatMonthYear } from '@/utils/dateUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  // Tek başvuruyu direkt fetch et
  const { data: applicationData, isLoading: applicationsLoading } = useHospitalApplicationDetail(parseInt(applicationId || '0'));
  const application = applicationData?.application || null;

  // Doktor aktif değilse (false, 0, null, undefined) profil bilgilerine erişim yok
  // Aktif edildiğinde (true, 1) profil bilgileri tekrar görünür olacak
  // SQL Server bit tipi 1/0 olarak gelebilir, bu yüzden kontrol ediyoruz
  const doctorIsActive = application?.doctor_is_active === true || application?.doctor_is_active === 1 || application?.doctor_is_active === '1';
  const isDoctorInactive = !doctorIsActive;
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
  const updateStatusMutation = useUpdateApplicationStatus({ enableToast: false });

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

  // Export başvuru fonksiyonu - Backend'den PDF indir
  const handleExportApplication = async () => {
    if (!application || !applicationId) {
      showToast.warning('Başvuru verisi bulunamadı');
      return;
    }
    
    try {
      await downloadApplicationPDF(applicationId);
    } catch (error) {
      // Error handling already done in downloadApplicationPDF
      console.error('PDF indirme hatası:', error);
    }
  };

  const isStatusChanged = parseInt(selectedStatus) !== (application?.status_id || 0);
  const isNotesChanged = notes !== (application?.notes || '');
  const isWithdrawn = application?.status_id === 5; // Geri çekilen başvurular için durum güncelleme yapılamaz

  if (applicationsLoading) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader count={6} />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
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
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8 flex flex-col">
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
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8 flex flex-col">
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
    <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8 flex flex-col overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8 flex-1 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="bg-white border border-blue-200 text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Başvuru Detayları</h1>
              <p className="text-gray-700 mt-1">
                {application.first_name} {application.last_name} - {application.job_title}
              </p>
            </div>
          </div>
          <div>
            {/* PDF İndirme Butonu */}
            <button
              onClick={handleExportApplication}
              className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 inline-flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
              title="Başvuruyu indir"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sol Kolon - Doktor Bilgileri ve Ön Yazı */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Doktor Bilgileri */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
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
                      <h3 className="text-lg font-bold text-gray-900">
                        {doctorProfile.title} {doctorProfile.first_name} {doctorProfile.last_name}
                      </h3>
                      <p className="text-gray-700 text-sm font-medium">{doctorProfile.specialty_name || 'Uzmanlık Belirtilmemiş'}</p>
                      {doctorProfile.subspecialty_name && (
                        <p className="text-gray-600 text-xs">Yan Dal: {doctorProfile.subspecialty_name}</p>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Phone className="w-4 h-4" />
                      <span>{application.phone || 'Belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
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
            <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Doktor Ön Yazısı
              </h2>
              
              {application.cover_letter ? (
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ön Yazı Bulunamadı</h3>
                  <p className="text-gray-600 text-sm">
                    Bu başvuru için doktor ön yazısı eklenmemiş.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon - Durum Yönetimi */}
          <div className="space-y-6 min-w-0">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 w-full max-w-full overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Durum Yönetimi
              </h2>

              {/* Mevcut Durum */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200 min-h-[100px]">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Mevcut Durum
                </h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-shrink-0 min-w-0">
                    <StatusBadge status_id={application.status_id} statusName={application.status} />
                  </div>
                  <div className="text-right flex-shrink-0 whitespace-nowrap">
                    <span className="text-xs text-gray-600 block font-medium">Son Güncelleme</span>
                    <span className="text-sm text-gray-700 font-semibold">
                      {formatDate(application.updated_at)}
                    </span>
                  </div>
                </div>
                {isWithdrawn && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-orange-700 text-xs font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>Geri çekilen başvurularda durum güncelleme yapılamaz.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Başvuru Bilgileri */}
              <div className="mb-4">
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium">Başvuru Tarihi</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">
                    {formatDateTime(application.applied_at)}
                  </span>
                </div>
              </div>

              {/* Durum Seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Yeni Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isWithdrawn}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Not Alanı */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Hastane Notu
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Değerlendirme notları ekleyin..."
                  rows={4}
                  disabled={isWithdrawn}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {/* Mevcut Not Gösterimi */}
              {application.notes && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    Mevcut Not
                  </label>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{application.notes}</p>
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
                    <p className="text-xs text-gray-600 text-center py-3 font-medium">Değişiklik yapmak için yukarıdaki alanları düzenleyin</p>
                  )}
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 min-h-[80px]">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-orange-700 text-sm font-semibold mb-1">Durum Güncelleme Devre Dışı</p>
                          <p className="text-orange-600 text-xs">
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
        <div className="bg-white border border-blue-100 shadow-lg rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-200 relative">
          {/* Kapatma Butonu - Sağ Üst Köşe */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-red-100 rounded-lg flex-shrink-0"
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
  // Tarihe göre sırala - en yeni üstte, en eski altta
  const educations = (doctorData?.educations || []).sort((a, b) => b.graduation_year - a.graduation_year);
  const experiences = (doctorData?.experiences || []).sort((a, b) => {
    const dateA = new Date(a.start_date);
    const dateB = new Date(b.start_date);
    return dateB - dateA; // En yeni üstte
  });
  const certificates = (doctorData?.certificates || []).sort((a, b) => b.certificate_year - a.certificate_year);
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
        <div className="bg-white border border-blue-100 shadow-lg rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-200 relative">
          {/* Kapatma Butonu - Sağ Üst Köşe */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-red-100 rounded-lg flex-shrink-0"
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
      className={`${isInline ? 'bg-white border border-blue-100 shadow-lg' : 'z-50 bg-slate-800/95 backdrop-blur-md'} rounded-2xl ${isInline ? '' : 'border border-white/20 shadow-2xl'} animate-in fade-in zoom-in-95 duration-200 flex flex-col ${isInline ? 'max-h-[85vh]' : 'w-[600px] max-w-[calc(100vw-32px)] max-h-[85vh]'} relative`}
    >
        {/* Kapatma Butonu - Sağ Üst Köşe */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 ${isInline ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0`}
          aria-label="Kapat"
        >
          <ChevronUp className="w-5 h-5 rotate-180" />
        </button>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {/* Kişisel ve İletişim Bilgileri */}
          <div className={`${isInline ? 'bg-blue-50' : 'bg-white/5'} rounded-2xl p-4 mb-6`}>
            <h3 className={`text-lg font-semibold ${isInline ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
              <User className={`w-5 h-5 ${isInline ? 'text-blue-600' : 'text-blue-400'}`} />
              Kişisel ve İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>Ad Soyad</span>
                <p className={`font-medium ${isInline ? 'text-gray-900' : 'text-white'}`}>
                  {profile.title} {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>Telefon</span>
                <p className={isInline ? 'text-gray-900' : 'text-white'}>{profile.phone || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>E-posta</span>
                <p className={isInline ? 'text-gray-900' : 'text-white'}>{profile.email || 'Belirtilmemiş'}</p>
              </div>
              {profile.dob && (
                <div>
                  <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>Doğum Tarihi</span>
                  <p className={isInline ? 'text-gray-900' : 'text-white'}>{formatDate(profile.dob)}</p>
                </div>
              )}
              <div>
                <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>Doğum Yeri</span>
                <p className={isInline ? 'text-gray-900' : 'text-white'}>{profile.birth_place_name || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>İkamet Yeri</span>
                <p className={isInline ? 'text-gray-900' : 'text-white'}>{profile.residence_city_name || 'Belirtilmemiş'}</p>
              </div>
              {profile.specialty_name && (
                <div>
                  <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>Uzmanlık Alanı</span>
                  <p className={isInline ? 'text-gray-900' : 'text-white'}>{profile.specialty_name}</p>
                </div>
              )}
              {profile.subspecialty_name && (
                <div>
                  <span className={`text-sm ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>Yan Dal</span>
                  <p className={isInline ? 'text-gray-900' : 'text-white'}>{profile.subspecialty_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          {educations.length > 0 && (
            <div className={`${isInline ? 'bg-green-50' : 'bg-white/5'} rounded-2xl p-4 mb-6`}>
              <h3 className={`text-lg font-semibold ${isInline ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
                <GraduationCap className={`w-5 h-5 ${isInline ? 'text-green-600' : 'text-green-400'}`} />
                Eğitim Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className={`${isInline ? 'bg-white border border-green-200' : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30'} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${isInline ? 'bg-green-100' : 'bg-green-500/20'} rounded-lg flex items-center justify-center`}>
                        <GraduationCap className={`w-5 h-5 ${isInline ? 'text-green-600' : 'text-green-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {edu.education_type_name && (
                          <p className={`text-xs mb-1 font-semibold ${isInline ? 'text-gray-900' : 'text-white'}`}>{edu.education_type_name}</p>
                        )}
                        <h4 className={`font-semibold text-sm mb-1 ${isInline ? 'text-gray-900' : 'text-white'}`}>{edu.institution_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${isInline ? 'text-gray-700' : 'text-gray-300'}`}>{edu.field}</p>
                          <span className={`px-2 py-0.5 ${isInline ? 'bg-green-100 text-green-800' : 'bg-green-500/20 text-green-300'} rounded text-xs font-medium`}>
                            {edu.graduation_year}
                          </span>
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
            <div className={`${isInline ? 'bg-purple-50' : 'bg-white/5'} rounded-2xl p-4 mb-6`}>
              <h3 className={`text-lg font-semibold ${isInline ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
                <Briefcase className={`w-5 h-5 ${isInline ? 'text-purple-600' : 'text-purple-400'}`} />
                İş Deneyimi
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className={`${isInline ? 'bg-white border border-purple-200' : 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30'} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${isInline ? 'bg-purple-100' : 'bg-purple-500/20'} rounded-lg flex items-center justify-center`}>
                        <Briefcase className={`w-5 h-5 ${isInline ? 'text-purple-600' : 'text-purple-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs font-semibold ${isInline ? 'text-gray-900' : 'text-white'}`}>{exp.organization}</p>
                          <span className={`px-2 py-0.5 ${isInline ? 'bg-purple-100 text-purple-800' : 'bg-purple-500/20 text-purple-300'} rounded text-xs font-medium`}>
                            {new Date(exp.start_date).getFullYear()}{exp.end_date && !exp.is_current ? ` - ${new Date(exp.end_date).getFullYear()}` : ''}
                          </span>
                        </div>
                        {exp.specialty_name && (
                          <p className={`text-xs mb-1 ${isInline ? 'text-gray-600' : 'text-gray-400'}`}>
                            {exp.specialty_name}{exp.subspecialty_name && ` - ${exp.subspecialty_name}`}
                          </p>
                        )}
                        {exp.description && (
                          <p className={`text-xs mt-2 ${isInline ? 'text-gray-700' : 'text-gray-300'}`}>{exp.description}</p>
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
            <div className={`${isInline ? 'bg-yellow-50' : 'bg-white/5'} rounded-2xl p-4 mb-6`}>
              <h3 className={`text-lg font-semibold ${isInline ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
                <Award className={`w-5 h-5 ${isInline ? 'text-yellow-600' : 'text-yellow-400'}`} />
                Sertifikalar ve Kurslar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificates.map((cert, idx) => (
                  <div key={idx} className={`${isInline ? 'bg-white border border-yellow-200' : 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30'} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${isInline ? 'bg-yellow-100' : 'bg-yellow-500/20'} rounded-lg flex items-center justify-center`}>
                        <Award className={`w-5 h-5 ${isInline ? 'text-yellow-600' : 'text-yellow-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm mb-1 ${isInline ? 'text-gray-900' : 'text-white'}`}>{cert.certificate_name || 'Sertifika'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${isInline ? 'text-gray-700' : 'text-gray-300'}`}>{cert.institution}</p>
                          <span className={`px-2 py-0.5 ${isInline ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-500/20 text-yellow-300'} rounded text-xs font-medium`}>
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
            <div className={`${isInline ? 'bg-cyan-50' : 'bg-white/5'} rounded-2xl p-4 mb-6`}>
              <h3 className={`text-lg font-semibold ${isInline ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
                <Languages className={`w-5 h-5 ${isInline ? 'text-cyan-600' : 'text-cyan-400'}`} />
                Dil Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className={`${isInline ? 'bg-white border border-cyan-200' : 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30'} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${isInline ? 'bg-cyan-100' : 'bg-cyan-500/20'} rounded-lg flex items-center justify-center`}>
                        <Languages className={`w-5 h-5 ${isInline ? 'text-cyan-600' : 'text-cyan-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm mb-1 ${isInline ? 'text-gray-900' : 'text-white'}`}>{lang.language_name}</h4>
                        <span className={`px-2 py-0.5 ${isInline ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'} rounded text-xs font-medium inline-block`}>
                          {lang.level_name}
                        </span>
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
