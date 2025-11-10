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

  // İlan durumunu kontrol et - Pasif ilan kontrolü
  const jobStatusId = application?.job_status_id;
  const jobStatus = application?.job_status || '';
  const isJobPassive = 
    jobStatusId === 4 ||
    jobStatusId === '4' ||
    jobStatus === 'Pasif' || 
    jobStatus === 'Passive' ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().trim() === 'pasif') ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().trim() === 'passive') ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('pasif')) ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('passive'));

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
      case 1: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 2: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 3: return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 4: return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 5: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
      showToast.success('Başvuru geri çekildi');
      navigate('/doctor/applications');
    } catch (error) {
      console.error('Withdraw error:', error);
      showToast.error('Başvuru geri çekilemedi');
    }
  };


  if (!application && !detailLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Başvuru bulunamadı</h2>
            <button
              onClick={() => navigate('/doctor/applications')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/doctor/applications')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri
            </button>
          </div>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Yayından Kaldırıldı</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Bu ilan yayından kaldırıldığı için başvuru detayları görüntülenemez.
            </p>
            <button
              onClick={() => navigate('/doctor/applications')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Başvurular sayfasına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Geri butonu ve başlık */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => {
              // ApplicationsPage'deki scroll pozisyonu zaten kaydedilmişti (detay sayfasına giderken)
              // Sadece geri dönüş yap, scroll pozisyonu ApplicationsPage tarafından restore edilecek
              navigate('/doctor/applications');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <div className="flex-1">
            {detailLoading ? (
              <div className="h-8 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-white">
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
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Başvuru Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Başvuru Tarihi</div>
                  <div className="text-white font-medium">
                    {new Date(application?.created_at || application?.applied_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Durum</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application?.status_id)}`}>
                      {getStatusText(application?.status_id)}
                    </span>
                    {/* İş ilanı pasifse "Yayından Kaldırıldı" badge'i göster */}
                    {((applicationDetail?.job_status_id === 4) || (application?.job_status_id === 4)) && (
                      <span className="inline-block px-4 py-2 rounded-full text-sm font-medium border bg-gray-500/20 text-gray-300 border-gray-500/30">
                        Yayından Kaldırıldı
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* İş İlanı Bilgileri */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                İş İlanı Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">İlan Başlığı</div>
                  <div className="text-white font-medium">{applicationDetail?.title || application?.job_title}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Hastane</div>
                  <div className="text-white font-medium">{applicationDetail?.hospital_name || application?.hospital_name}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Şehir</div>
                  <div className="text-white font-medium">{applicationDetail?.city || application?.job_city}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Uzmanlık</div>
                  <div className="text-white font-medium">{applicationDetail?.specialty_name || 'Belirtilmemiş'}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Çalışma Türü</div>
                  <div className="text-white font-medium">{applicationDetail?.employment_type || 'Belirtilmemiş'}</div>
                </div>
                {applicationDetail?.min_experience_years && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Minimum Deneyim</div>
                    <div className="text-white font-medium">{applicationDetail.min_experience_years} yıl</div>
                  </div>
                )}
              </div>
            </div>

            {/* İş Açıklaması */}
            {applicationDetail?.description && (
              <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  İş Tanımı
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {applicationDetail.description}
                  </p>
                </div>
              </div>
            )}

            {/* Ön Yazı */}
            {applicationDetail?.cover_letter && (
              <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Ön Yazı
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {applicationDetail.cover_letter}
                  </p>
                </div>
              </div>
            )}

            {/* Hastane Notu */}
            {applicationDetail?.notes && (
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  Hastane Notu
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {applicationDetail.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="sticky bottom-4 bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    // ApplicationsPage'deki scroll pozisyonu zaten kaydedilmişti (detay sayfasına giderken)
                    // Sadece geri dönüş yap, scroll pozisyonu ApplicationsPage tarafından restore edilecek
                    navigate('/doctor/applications');
                  }}
                  className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium"
                >
                  Geri
                </button>
                {application?.status_id === 1 && (
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

