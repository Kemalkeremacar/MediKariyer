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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="space-y-8 p-6">
          <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} className="h-32 bg-white/10 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SkeletonLoader className="lg:col-span-2 h-96 bg-white/10 rounded-3xl" />
            <SkeletonLoader className="h-96 bg-white/10 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error handling - gelişmiş hata yönetimi
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Yüklenemedi</h2>
            <p className="text-gray-300 mb-6">{dashboardError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => refetchDashboard()} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
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
  const recentApplications = dashboardData?.data?.recent_applications || [];
  const recentJobs = dashboardData?.data?.recent_jobs || [];
  
  console.log('🎯 Hospital Dashboard Data:', dashboardData);
  console.log('📋 Recent Applications:', recentApplications);
  console.log('📋 Recent Jobs:', recentJobs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="space-y-8 p-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Logo - Sol Taraf */}
                {profile?.logo && (
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-blue-400/30 shadow-lg">
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
                    <h2 className="text-xl md:text-2xl font-semibold text-blue-400 mb-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Son Başvurular */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-8 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-400" />
                    Son Başvurular
                  </h2>
                  <Link
                    to="/hospital/applications"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group"
                  >
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="p-8">
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{application.job_title}</h3>
                          <p className="text-gray-300 mt-1">
                            {application.first_name && application.last_name 
                              ? `${application.first_name} ${application.last_name}`
                              : 'Doktor'
                            }
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              application.status_id === 1 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              application.status_id === 3 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              application.status_id === 4 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {application.status_id === 1 ? 'Başvuruldu' :
                               application.status_id === 2 ? 'İnceleniyor' :
                               application.status_id === 3 ? 'Kabul Edildi' :
                               application.status_id === 4 ? 'Reddedildi' :
                               application.status_id === 5 ? 'Geri Çekildi' :
                               application.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {application.applied_at ? new Date(application.applied_at).toLocaleDateString('tr-TR') : 'Tarih yok'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Activity className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-300 text-lg mb-4">Henüz başvuru bulunmuyor</p>
                    <p className="text-gray-400 text-sm">İş ilanı oluşturarak başvuru almaya başlayın</p>
                  </div>
                )}
              </div>
            </div>

            {/* İş İlanlarım */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-8 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-purple-400" />
                    İş İlanlarım
                  </h2>
                  <Link
                    to="/hospital/jobs"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group"
                  >
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="p-8">
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                            <p className="text-gray-300 mt-1">{job.specialty}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                job.status === 'Aktif' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                job.status === 'Pasif' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                                {job.status === 'Aktif' ? 'Aktif' :
                                 job.status === 'Pasif' ? 'Pasif' :
                                 job.status}
                              </span>
                              <span className="text-xs text-gray-400">
                                {job.city ? job.city : 'Şehir belirtilmemiş'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(job.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-300 text-lg mb-4">Henüz iş ilanı oluşturmadınız</p>
                    <p className="text-gray-400 text-sm">İş İlanları sayfasından yeni ilan ekleyebilirsiniz</p>
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
