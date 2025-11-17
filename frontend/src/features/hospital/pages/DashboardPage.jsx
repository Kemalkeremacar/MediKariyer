/**
 * Hospital Dashboard Sayfası
 * 
 * Doctor Dashboard pattern'ini takip eden modern hastane dashboard'u
 * Backend hospitalService.js ve hospitalController.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Dashboard istatistikleri (profil tamamlanma, iş ilanları, başvurular)
 * - Son başvurular listesi
 * - Hızlı işlem butonları
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - API yanıt normalizasyonu
 * - Performans optimizasyonları
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0
 * @since 2024
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Briefcase, Activity, Target, RefreshCw, User
} from 'lucide-react';
import { useHospitalDashboard, useHospitalProfile } from '../api/useHospital';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const HospitalDashboard = () => {
  // API hook'ları - dashboard ve profil verisi
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useHospitalDashboard();
  
  const { 
    data: profileData, 
    isLoading: profileLoading 
  } = useHospitalProfile();

  const normalizedDashboard = useMemo(() => {
    return dashboardData?.data || dashboardData;
  }, [dashboardData]);

  const normalizedProfile = useMemo(() => {
    return profileData?.data || profileData;
  }, [profileData]);

  // Loading state - skeleton loader
  if (dashboardLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader className="h-12 w-80 bg-white rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} className="h-32 bg-white rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SkeletonLoader className="lg:col-span-2 h-96 bg-white rounded-3xl" />
            <SkeletonLoader className="h-96 bg-white rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error handling - gelişmiş hata yönetimi
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white backdrop-blur-sm rounded-3xl p-8 border border-blue-200">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Yüklenemedi</h2>
            <p className="text-gray-600 mb-6">{dashboardError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => refetchDashboard()} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-gray-900 px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Veri parsing - dashboard ve profil verisi
  const profile = normalizedProfile?.profile;
  const institutionName = profile?.institution_name || 'Hastaneniz';
  
  // Dashboard verileri
  const recentApplications = (dashboardData?.data?.recent_applications || []).slice(0, 5);
  const recentJobs = (dashboardData?.data?.recent_jobs || []).slice(0, 5);
  
  console.log('🎯 Hospital Dashboard Data:', dashboardData);
  console.log('📋 Recent Applications:', recentApplications);
  console.log('📋 Recent Jobs:', recentJobs);

  const getJobStatusClasses = (status) => {
    const normalized = status?.toString().trim().toLowerCase();
    const map = {
      'aktif': 'border border-emerald-200 bg-emerald-100 text-emerald-800',
      'onaylandı': 'border border-emerald-200 bg-emerald-100 text-emerald-800',
      'pasif': 'border border-gray-200 bg-gray-100 text-gray-700',
      'reddedildi': 'border border-rose-200 bg-rose-100 text-rose-800',
      'onay bekliyor': 'border border-amber-200 bg-amber-100 text-amber-800',
      'revizyon gerekli': 'border border-orange-200 bg-orange-100 text-orange-800',
      'taslak': 'border border-slate-200 bg-slate-100 text-slate-700',
    };
    return map[normalized] || 'border border-gray-200 bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-8 border border-white/20 shadow-[0_20px_60px_-30px_rgba(30,64,175,0.45)]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Logo - Sol Taraf */}
                {profile?.logo && (
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white/20 shadow-lg">
                      <img 
                        src={profile.logo} 
                        alt={institutionName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Metin ve Buton - Sağ Taraf */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{institutionName}</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-blue-300 mb-4">
                      İşe Alım ve Başvuru Yönetimi
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      İş ilanlarınızı yönetin, başvuruları değerlendirin ve en iyi doktorları keşfedin.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/hospital/profile"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
                    >
                      <User className="w-5 h-5" />
                      Profil Yönetimi
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Son Başvurular */}
            <div className="rounded-2xl border border-blue-200 bg-white shadow-lg p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="border-b border-blue-100 pb-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                    <Activity className="h-6 w-6 text-blue-600" />
                    Son Başvurular
                  </h2>
                </div>
              </div>
              <div className="pt-6">
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                            <p className="mt-1 text-gray-600">
                              {application.first_name && application.last_name 
                                ? `${application.first_name} ${application.last_name}`
                                : 'Doktor'
                              }
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                application.status_id === 1 ? 'border border-amber-200 bg-amber-100 text-amber-800' :
                                application.status_id === 2 ? 'border border-blue-200 bg-blue-100 text-blue-800' :
                                application.status_id === 3 ? 'border border-emerald-200 bg-emerald-100 text-emerald-800' :
                                application.status_id === 4 ? 'border border-rose-200 bg-rose-100 text-rose-800' :
                                application.status_id === 5 ? 'border border-gray-200 bg-gray-100 text-gray-700' :
                                'border border-gray-200 bg-gray-100 text-gray-700'
                              }`}>
                                {application.status_id === 1 ? 'Başvuruldu' :
                                 application.status_id === 2 ? 'İnceleniyor' :
                                 application.status_id === 3 ? 'Kabul Edildi' :
                                 application.status_id === 4 ? 'Red Edildi' :
                                 application.status_id === 5 ? 'Geri Çekildi' :
                                 application.status || 'Bilinmiyor'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {application.applied_at ? new Date(application.applied_at).toLocaleDateString('tr-TR') : 'Tarih yok'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <Activity className="h-10 w-10 text-blue-600" />
                    </div>
                    <p className="text-lg text-gray-600">Henüz başvuru bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>

            {/* İş İlanlarım */}
            <div className="rounded-2xl border border-blue-200 bg-white shadow-lg p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="border-b border-blue-100 pb-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                    <Target className="h-6 w-6 text-blue-600" />
                    İş İlanlarım
                  </h2>
                </div>
              </div>
              <div className="pt-6">
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="mt-1 text-gray-600">{job.specialty}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobStatusClasses(job.status)}`}>
                                {job.status || 'Durum Yok'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {job.city ? job.city : 'Şehir belirtilmemiş'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(job.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <Briefcase className="h-10 w-10 text-blue-600" />
                    </div>
                    <p className="text-lg text-gray-600">Henüz iş ilanı oluşturmadınız</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HospitalDashboard;
