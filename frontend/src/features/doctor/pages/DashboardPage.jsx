/**
 * @file DashboardPage.jsx
 * @description Doktor Dashboard - Doktor paneli ana sayfası, son başvurular ve önerilen iş ilanları
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Target,
  ArrowRight,
  User
} from 'lucide-react';
import { useDoctorDashboard, useDoctorProfile } from '../api/useDoctor';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/dateUtils';

const DoctorDashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDoctorDashboard();
  const { data: profileData, isLoading: profileLoading } = useDoctorProfile();

  if (dashboardLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <SkeletonLoader className="h-12 w-80 bg-blue-100 rounded-2xl" />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <SkeletonLoader className="h-96 rounded-2xl bg-blue-100" />
            <SkeletonLoader className="h-96 rounded-2xl bg-blue-100" />
          </div>
        </div>
      </div>
    );
  }

  // Error handling
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Dashboard Yüklenemedi</h2>
            <p className="mb-6 text-gray-600">{dashboardError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 p-8 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                {/* Profil Fotoğrafı - Sol Taraf */}
                {profilePhoto && (
                  <div className="flex-shrink-0">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-cyan-300/40 shadow-lg">
                      <img 
                        src={profilePhoto} 
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Metin ve Buton - Sağ Taraf */}
                <div className="flex flex-1 flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex-1">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Hoş Geldiniz</h1>
                    <h2 className="mb-4 text-xl font-semibold text-cyan-700 md:text-2xl">{fullName}</h2>
                    <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                      Kariyerinizi ileriye taşıyacak fırsatları keşfedin ve başvurularınızı takip edin.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/doctor/profile"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
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

          {/* Ana İçerik */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Son Başvurular */}
            <div className="rounded-2xl border border-blue-200 bg-white shadow-lg p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="border-b border-blue-100 pb-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                    <Activity className="h-6 w-6 text-blue-600" />
                    Son Başvurular
                  </h2>
                  {/* Tümünü gör butonu kaldırıldı */}
                </div>
              </div>
              <div className="pt-6">
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                            <p className="mt-1 text-gray-600">{application.hospital_name}</p>
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
                                 application.status_id === 4 ? 'Reddedildi' :
                                 application.status_id === 5 ? 'Geri Çekildi' :
                                 application.status || 'Bilinmiyor'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(application.applied_at || application.created_at)}
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
                    <p className="text-lg text-gray-600">Henüz başvuru yapmadınız</p>
                  </div>
                )}
              </div>
            </div>

            {/* Önerilen İş İlanları */}
            <div className="rounded-2xl border border-blue-200 bg-white shadow-lg p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="border-b border-blue-100 pb-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                    <Target className="h-6 w-6 text-blue-600" />
                    Önerilen İş İlanları
                  </h2>
                  {/* Tümünü gör butonu kaldırıldı */}
                </div>
              </div>
              <div className="pt-6">
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="mt-1 text-gray-600">{job.hospital_name}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {job.city}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {formatDate(job.created_at)}
                              </div>
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
                    <p className="text-lg text-gray-600">Önerilen iş ilanı bulunamadı</p>
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