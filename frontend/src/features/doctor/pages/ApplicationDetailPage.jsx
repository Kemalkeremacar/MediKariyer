/**
 * Doktor Başvuru Detay Sayfası
 * 
 * Başvuru detaylarını gösteren sayfa
 * JobDetailPage'e benzer modern ve kullanıcı dostu tasarım
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Building, FileText, Calendar, Clock, 
  CheckCircle, MapPin, Trash2, AlertCircle, XCircle
} from 'lucide-react';
import { useApplicationDetail, useWithdrawApplication } from '../api/useDoctor.js';
import { useMyApplications } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const DoctorApplicationDetailPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  // Application detail fetch
  const { data: applicationDetail, isLoading: detailLoading } = useApplicationDetail(parseInt(applicationId || '0'));

  // Applications listesinden application'ı bul (fallback için)
  const { data: applicationsData } = useMyApplications({ page: 1, limit: 100 });
  const applications = applicationsData?.applications || [];
  const application = applicationDetail || applications.find(a => a.id === parseInt(applicationId || '0'));

  const withdrawMutation = useWithdrawApplication();

  // İlan durumunu kontrol et - Pasif ilan kontrolü (ilan pasif, hastane pasif veya silinmiş)
  const jobStatusId = application?.job_status_id;
  const jobStatus = application?.job_status || '';
  const hospitalIsActive = application?.hospital_is_active !== false && application?.hospital_is_active !== 0 && application?.hospital_is_active !== '0';
  const jobDeletedAt = application?.job_deleted_at; // İş ilanı silinme tarihi
  const isJobPassive = 
    jobStatusId === 4 ||
    jobStatusId === '4' ||
    jobStatus === 'Pasif' || 
    jobStatus === 'Passive' ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().trim() === 'pasif') ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().trim() === 'passive') ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('pasif')) ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('passive')) ||
    !hospitalIsActive || // Hastane pasifse ilan da pasif gibi görünsün
    !!jobDeletedAt; // İş ilanı silinmişse (yayından kaldırılmış) pasif gibi görünsün

  // Status helper functions
  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1: return 'Başvuruldu';
      case 2: return 'İnceleniyor';
      case 3: return 'Kabul Edildi';
      case 4: return 'Red Edildi';
      case 5: return 'Geri Çekildi';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1: return 'border border-amber-200 bg-amber-100 text-amber-800';
      case 2: return 'border border-blue-200 bg-blue-100 text-blue-800';
      case 3: return 'border border-emerald-200 bg-emerald-100 text-emerald-800';
      case 4: return 'border border-rose-200 bg-rose-100 text-rose-800';
      case 5: return 'border border-gray-200 bg-gray-100 text-gray-700';
      default: return 'border border-gray-200 bg-gray-100 text-gray-700';
    }
  };

  const handleWithdraw = async () => {
    const confirmed = await showToast.confirm({
      title: "Başvuruyu Geri Çek",
      message: "Bu başvuruyu geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      type: "warning",
      size: "small",
      confirmText: "Geri Çek",
      cancelText: "İptal",
      destructive: true,
    });
    
    if (!confirmed) return;

    try {
      await withdrawMutation.mutateAsync({ applicationId: parseInt(applicationId || '0'), reason: '' });
      // Toast mesajı mutation'ın onSuccess'inde gösteriliyor
      navigate('/doctor/applications');
    } catch (error) {
      console.error('Withdraw error:', error);
      // Toast mesajı mutation'ın onError'unda gösteriliyor
    }
  };


  if (!application && !detailLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Başvuru bulunamadı</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Aradığınız başvuru bulunamadı veya erişim yetkiniz bulunmuyor.
            </p>
            <button
              onClick={() => navigate('/doctor/applications')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-blue-600 hover:text-white font-medium rounded-xl transition-all border shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Başvurular sayfasına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pasif ilan için erişimi engelle
  if (application && isJobPassive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/doctor/applications')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-xl text-gray-700 hover:bg-blue-50 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Yayından Kaldırıldı</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bu ilan yayından kaldırıldığı için başvuru detayları görüntülenemez.
            </p>
            <button
              onClick={() => navigate('/doctor/applications')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-blue-600 hover:text-white font-medium rounded-xl transition-all border shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Başvurular sayfasına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Geri butonu ve başlık */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => {
              // ApplicationsPage'deki scroll pozisyonu zaten kaydedilmişti (detay sayfasına giderken)
              // Sadece geri dönüş yap, scroll pozisyonu ApplicationsPage tarafından restore edilecek
              navigate('/doctor/applications');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-xl text-gray-700 hover:bg-blue-50 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <div className="flex-1">
            {detailLoading ? (
              <div className="h-8 bg-white rounded-xl animate-pulse" />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Başvuru Detayı
              </h1>
            )}
          </div>
        </div>

        {/* Content */}
        {detailLoading ? (
          <div className="space-y-6">
            <SkeletonLoader count={5} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Başvuru Durumu ve Tarihi */}
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Başvuru Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Başvuru Tarihi</div>
                  <div className="text-gray-900 font-medium">
                    {new Date(application?.created_at || application?.applied_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Durum</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application?.status_id)}`}>
                      {getStatusText(application?.status_id)}
                    </span>
                    {/* İş ilanı pasifse veya hastane pasifse "Yayından Kaldırıldı" badge'i göster */}
                    {isJobPassive && (
                      <span className="inline-block px-4 py-2 rounded-full text-sm font-medium border bg-gray-100 text-gray-700 border-gray-200">
                        Yayından Kaldırıldı
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* İş İlanı Bilgileri */}
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                İş İlanı Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 md:col-span-2">
                  <div className="text-gray-600 text-sm mb-1">İlan Başlığı</div>
                  <div className="text-gray-900 font-medium text-lg">{applicationDetail?.title || application?.job_title}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Hastane</div>
                  <div className="text-gray-900 font-medium">{applicationDetail?.hospital_name || application?.hospital_name}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Şehir</div>
                  <div className="text-gray-900 font-medium">{applicationDetail?.city || application?.job_city}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Uzmanlık Alanı</div>
                  <div className="text-gray-900 font-medium">{applicationDetail?.specialty_name || 'Belirtilmemiş'}</div>
                  {applicationDetail?.subspecialty_name && (
                    <div className="text-blue-600 text-sm mt-1">Yan Dal: {applicationDetail.subspecialty_name}</div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Çalışma Türü</div>
                  <div className="text-gray-900 font-medium">{applicationDetail?.employment_type || 'Belirtilmemiş'}</div>
                </div>
                {applicationDetail?.min_experience_years !== null && applicationDetail?.min_experience_years !== undefined && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                    <div className="text-gray-600 text-sm mb-1">Min. Deneyim</div>
                    <div className="text-gray-900 font-medium">{applicationDetail.min_experience_years} yıl</div>
                  </div>
                )}
              </div>
            </div>

            {/* İş Açıklaması */}
            {applicationDetail?.description && (
              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  İş Tanımı
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {applicationDetail.description}
                  </p>
                </div>
              </div>
            )}

            {/* Ön Yazı */}
            {applicationDetail?.cover_letter && (
              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Ön Yazı
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {applicationDetail.cover_letter}
                  </p>
                </div>
              </div>
            )}

            {/* Hastane Notu */}
            {applicationDetail?.notes && (
              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Hastane Notu
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {applicationDetail.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="sticky bottom-4 bg-white/95 backdrop-blur-lg border border-blue-100 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    // ApplicationsPage'deki scroll pozisyonu zaten kaydedilmişti (detay sayfasına giderken)
                    // Sadece geri dönüş yap, scroll pozisyonu ApplicationsPage tarafından restore edilecek
                    navigate('/doctor/applications');
                  }}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-medium shadow-sm"
                >
                  Geri
                </button>
                {application?.status_id === 1 && (
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Başvuruyu Geri Çek</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorApplicationDetailPage;

