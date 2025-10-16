/**
 * Admin Jobs Page - İş İlanları Yönetimi
 * Basit, temiz liste - Sadece önemli bilgiler
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminJobs } from '../api/useAdmin';
import { 
  Briefcase, Search, Eye, MapPin, Target, Calendar, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import TransitionWrapper from '@/components/ui/TransitionWrapper';

const AdminJobsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20
  });

  const { data, isLoading, error } = useAdminJobs(filters);

  const jobs = data?.data?.data?.data || data?.data?.data || [];
  const pagination = data?.data?.data?.pagination || data?.data?.pagination || {};
  
  console.log('🔍 Admin Jobs Data:', data);
  console.log('📋 Jobs:', jobs);
  console.log('📊 Pagination:', pagination);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Aktif': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: CheckCircle },
      'Pasif': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: Clock },
      'Silinmiş': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];
    const IconComponent = config.icon;

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-24 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Hata</h2>
            <p className="text-gray-300">{error.message || 'İş ilanları yüklenemedi'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <TransitionWrapper>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Briefcase className="w-8 h-8" />
                İş İlanları Yönetimi
              </h1>
              <p className="text-gray-300 mt-2">Tüm hastanelerin iş ilanlarını görüntüleyin ve yönetin</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Toplam: {pagination.total || jobs.length} İlan</span>
              </div>
              <div className="text-sm text-gray-300">
                Sayfa {pagination.page || 1} / {pagination.pages || 1}
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* İlan Başlığı ve Durum - 4 kolon */}
                    <div className="lg:col-span-4">
                      <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} />
                        <span className="text-xs text-gray-400">
                          {job.application_count || 0} Başvuru
                        </span>
                      </div>
                    </div>

                    {/* Hastane - 2 kolon */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <span className="truncate">{job.institution_name || 'Belirtilmemiş'}</span>
                      </div>
                    </div>

                    {/* Uzmanlık - 2 kolon */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="truncate">{job.specialty || 'Belirtilmemiş'}</span>
                      </div>
                    </div>

                    {/* Şehir - 2 kolon */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span>{job.city || 'Belirtilmemiş'}</span>
                      </div>
                    </div>

                    {/* Tarih ve Buton - 2 kolon */}
                    <div className="lg:col-span-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/jobs/${job.id}`)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">İş İlanı Bulunamadı</h3>
              <p className="text-gray-400">Henüz hiç iş ilanı oluşturulmamış.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filters.page === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= pagination.pages}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default AdminJobsPage;
