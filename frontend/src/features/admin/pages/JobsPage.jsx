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

const AdminJobsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20
  });

  const { data, isLoading, error } = useAdminJobs(filters);

  const jobs = data?.data?.data?.data || data?.data?.data || [];
  const pagination = data?.data?.data?.pagination || data?.data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Aktif': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Pasif': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: Clock }
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
      <div className="min-h-screen">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-lg mb-6" />
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} className="h-24 bg-gray-200 rounded-xl mb-4" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
              <p className="text-gray-600">{error.message || 'İş ilanları yüklenemedi'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Briefcase className="h-8 w-8 mr-3 text-indigo-600" />
                İş İlanları Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">Tüm hastanelerin iş ilanlarını görüntüleyin ve yönetin</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Toplam: {pagination.total || jobs.length} İlan</span>
            </div>
            <div className="text-sm text-gray-500">
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
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* İlan Başlığı ve Durum - 4 kolon */}
                  <div className="lg:col-span-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-gray-500">
                        {job.application_count || 0} Başvuru
                      </span>
                    </div>
                  </div>

                  {/* Hastane - 2 kolon */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="truncate">{job.institution_name || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Uzmanlık - 2 kolon */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{job.specialty || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Şehir - 2 kolon */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{job.city || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Tarih ve Buton - 2 kolon */}
                  <div className="lg:col-span-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/jobs/${job.id}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
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
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">İş İlanı Bulunamadı</h3>
            <p className="text-gray-500">Henüz hiç iş ilanı oluşturulmamış.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.page === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= pagination.pages}
              className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;
