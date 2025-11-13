/**
 * @file DashboardPage.jsx
 * @description Admin Dashboard - Admin paneli ana sayfası ve istatistikler
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Briefcase, 
  FileText, 
  AlertCircle, 
  Settings, 
  BarChart3, 
  UserCheck,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Bell,
  Calendar,
  Camera,
  Stethoscope,
  Building2
} from 'lucide-react';
import { useDashboard, useUsers, useAdminJobs, usePhotoRequests } from '../api/useAdmin';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Analytics hooks
  const { data: dashboardData, isLoading, refetch: refetchDashboard, error } = useDashboard();
  
  // Bekleyen sayıları almak için ayrı query'ler
  const { data: pendingDoctorsData } = useUsers({ role: 'doctor', isApproved: false, limit: 1 });
  const { data: pendingHospitalsData } = useUsers({ role: 'hospital', isApproved: false, limit: 1 });
  const { data: pendingJobsData } = useAdminJobs({ status: 1, limit: 1 });
  const { data: pendingPhotosData } = usePhotoRequests({ status: 'pending', limit: 1 });

  // Bekleyen sayıları hesapla
  const pendingDoctorsCount = pendingDoctorsData?.data?.data?.pagination?.total || 
                               pendingDoctorsData?.data?.pagination?.total || 0;
  const pendingHospitalsCount = pendingHospitalsData?.data?.data?.pagination?.total || 
                                pendingHospitalsData?.data?.pagination?.total || 0;
  const pendingJobsCount = pendingJobsData?.data?.data?.data?.pagination?.total || 
                           pendingJobsData?.data?.data?.pagination?.total || 
                           pendingJobsData?.data?.pagination?.total || 0;
  const pendingPhotosCount = pendingPhotosData?.data?.data?.pagination?.total || 
                             pendingPhotosData?.data?.pagination?.total || 0;
  
  // Debug logging - removed for production

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchDashboard();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Onay bekleyenler için hızlı erişim butonları (başvurular kaldırıldı)
  const pendingApprovalActions = [
    {
      title: 'Onay bekleyen doktorlar',
      icon: Stethoscope,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverBgColor: 'hover:bg-blue-100',
      href: '/admin/users?isApproved=false',
      count: pendingDoctorsCount
    },
    {
      title: 'Onay bekleyen hastaneler',
      icon: Building2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverBgColor: 'hover:bg-green-100',
      href: '/admin/hospitals?isApproved=false',
      count: pendingHospitalsCount
    },
    {
      title: 'Onay bekleyen iş ilanları',
      icon: Briefcase,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverBgColor: 'hover:bg-orange-100',
      href: '/admin/jobs?status=1',
      count: pendingJobsCount
    },
    {
      title: 'Onay bekleyen fotoğraf onayları',
      icon: Camera,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverBgColor: 'hover:bg-purple-100',
      href: '/admin/photo-approvals?status=pending',
      count: pendingPhotosCount
    },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, onClick }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      green: 'bg-green-50 text-green-600 border-green-200'
    };

    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
    const trendColorClass = trend === 'up' ? 'text-green-500' : 'text-red-500';

    return (
      <div 
        className={`admin-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl border-2 ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
      </div>
    );
  };

  // İnce uzun buton komponenti - Bekleyen sayısı ile
  const PendingActionButton = ({ title, icon: Icon, bgColor, iconColor, borderColor, hoverBgColor, href, count = 0 }) => (
    <button
      onClick={() => navigate(href)}
      className={`w-full ${bgColor} ${borderColor} ${hoverBgColor} border-2 rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md group`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className={`p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900 text-left block">{title}</span>
          {count > 0 && (
            <span className={`text-sm font-semibold ${iconColor} mt-1 block`}>
              {count} bekleyen
            </span>
          )}
        </div>
      </div>
      <ArrowRight className={`h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2`} />
    </button>
  );

  return (
    <div className="min-h-screen">
      <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Activity className="h-10 w-10 mr-4 text-indigo-600" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Sistem yönetimi ve analitik veriler
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="admin-btn admin-btn-outline flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Yenileniyor...' : 'Yenile'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="admin-card p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Doktorlar"
                value={dashboardData.data?.overview?.totalDoctors}
                subtitle="Kayıtlı doktor sayısı"
                icon={Stethoscope}
                color="blue"
                onClick={() => navigate('/admin/users')}
              />
              <StatCard
                title="Hastaneler"
                value={dashboardData.data?.overview?.totalHospitals}
                subtitle="Kayıtlı hastane sayısı"
                icon={Building2}
                color="green"
                onClick={() => navigate('/admin/hospitals')}
              />
              <StatCard
                title="Toplam İş İlanı"
                value={dashboardData.data?.overview?.totalJobs}
                subtitle="Aktif iş pozisyonları"
                icon={Briefcase}
                color="orange"
                trend={dashboardData.data?.trends?.recentJobs > 0 ? 'up' : 'down'}
                trendValue={Math.round((dashboardData.data?.trends?.recentJobs / dashboardData.data?.overview?.totalJobs) * 100)}
                onClick={() => navigate('/admin/jobs')}
              />
              <StatCard
                title="Toplam Başvuru"
                value={dashboardData.data?.overview?.totalApplications}
                subtitle="İş başvuruları"
                icon={FileText}
                color="red"
                trend={dashboardData.data?.trends?.recentApplications > 0 ? 'up' : 'down'}
                trendValue={Math.round((dashboardData.data?.trends?.recentApplications / dashboardData.data?.overview?.totalApplications) * 100)}
                onClick={() => navigate('/admin/applications')}
              />
            </div>
          ) : error ? (
            <div className="admin-card p-6 mb-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">API Hatası</h3>
                <p className="text-gray-600 mb-4">
                  Dashboard verileri yüklenirken hata oluştu: {error.message}
                </p>
                <button 
                  onClick={handleRefresh}
                  className="admin-btn admin-btn-primary"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card p-6 mb-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yok</h3>
                <p className="text-gray-600 mb-4">
                  Dashboard verileri henüz yüklenmedi.
                </p>
                <button 
                  onClick={handleRefresh}
                  className="admin-btn admin-btn-primary"
                >
                  Yenile
                </button>
              </div>
            </div>
          )}


          {/* Onay Bekleyenler - Hızlı Erişim Butonları */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-yellow-600" />
              Onay Bekleyenler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovalActions.map((action, index) => (
                <PendingActionButton
                  key={index}
                  title={action.title}
                  icon={action.icon}
                  bgColor={action.bgColor}
                  iconColor={action.iconColor}
                  borderColor={action.borderColor}
                  hoverBgColor={action.hoverBgColor}
                  href={action.href}
                  count={action.count}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;