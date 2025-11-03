/**
 * @file DashboardPage.jsx
 * @description Doktor Dashboard - Doktor paneli ana sayfası, son başvurular ve önerilen iş ilanları
 */

import React from 'react';
import { 
  Activity, 
  ArrowRight, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Target,
  User
} from 'lucide-react';
import { useDoctorDashboard, useDoctorProfile } from '../api/useDoctor';
import { Link } from 'react-router-dom';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const DoctorDashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDoctorDashboard();
  const { data: profileData, isLoading: profileLoading } = useDoctorProfile();

  if (dashboardLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader className="h-12 w-80 bg-white/10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <SkeletonLoader className="h-96 bg-white/10 rounded-2xl" />
            <SkeletonLoader className="h-96 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error handling
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Yüklenemedi</h2>
            <p className="text-gray-300 mb-6">{dashboardError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard verilerini al - max 5 göster
  const recentApplications = (dashboardData?.recent_applications || dashboardData?.data?.recent_applications || []).slice(0, 5);
  const recentJobs = (dashboardData?.recent_jobs || dashboardData?.data?.recent_jobs || []).slice(0, 5);
  
  // Profil verilerinden isim soyisim ve ünvan al
  // useDoctor hook'u res.data?.data döndürüyor, bu da { profile: {...} } oluyor
  const profile = profileData?.profile;
  const firstName = profile?.first_name || '';
  const lastName = profile?.last_name || '';
  const title = profile?.title || 'Dr.';
  const profilePhoto = profile?.profile_photo || null;
  const fullName = `${title} ${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-8 mb-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profil Fotoğrafı - Sol Taraf */}
                {profilePhoto && (
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400/30 shadow-lg">
                      <img 
                        src={profilePhoto} 
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Metin ve Buton - Sağ Taraf */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Hoş Geldiniz</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-blue-400 mb-4">{fullName}</h2>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      Kariyerinizi ileriye taşıyacak fırsatları keşfedin ve başvurularınızı takip edin.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/doctor/profile"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
                    >
                      <User className="w-5 h-5" />
                      Profili Düzenle
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ana İçerik */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Son Başvurular */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-8 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-400" />
                    Son Başvurular
                  </h2>
                  <Link
                    to="/doctor/applications"
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
                      <div key={application.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{application.job_title}</h3>
                          <p className="text-gray-300 mt-1">{application.hospital_name}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              application.status_id === 1 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              application.status_id === 2 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              application.status_id === 3 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              application.status_id === 4 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              application.status_id === 5 ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {application.status_id === 1 ? 'Başvuruldu' :
                               application.status_id === 2 ? 'İnceleniyor' :
                               application.status_id === 3 ? 'Kabul Edildi' :
                               application.status_id === 4 ? 'Red Edildi' :
                               application.status_id === 5 ? 'Geri Çekildi' :
                               application.status || 'Bilinmiyor'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(application.applied_at || application.created_at).toLocaleDateString('tr-TR')}
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
                    <p className="text-gray-300 text-lg mb-4">Henüz başvuru yapmadınız</p>
                    <Link
                      to="/doctor/jobs"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
                    >
                      İş İlanlarını Keşfedin
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Önerilen İş İlanları */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-8 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-purple-400" />
                    Önerilen İş İlanları
                  </h2>
                  <Link
                    to="/doctor/jobs"
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
                      <div key={job.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                            <p className="text-gray-300 mt-1">{job.hospital_name}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <MapPin className="w-4 h-4" />
                                {job.city}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(job.created_at).toLocaleDateString('tr-TR')}
                              </div>
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
                    <p className="text-gray-300 text-lg mb-4">Önerilen iş ilanı bulunamadı</p>
                    <Link
                      to="/doctor/jobs"
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 inline-flex items-center gap-2 group"
                    >
                      Tüm İş İlanlarını Görün
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DoctorDashboard;