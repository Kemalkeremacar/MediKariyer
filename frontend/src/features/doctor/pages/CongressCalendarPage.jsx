/**
 * Doktor Kongre Takvimi Sayfası
 * Doktorların kongreleri görüntüleyebileceği sayfa
 */

import React, { useState } from 'react';
import { Calendar, MapPin, Globe, Users, Search, ExternalLink, Filter, XCircle as XIcon } from 'lucide-react';
import { useCongresses } from '../../congress/api/useCongress';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const CongressCalendarPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    country: '',
    city: '',
    page: 1,
    limit: 12
  });

  const { data: congressData, isLoading } = useCongresses(filters);

  const congresses = congressData?.data?.data || [];
  const pagination = congressData?.data?.pagination || {};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialty: '',
      country: '',
      city: '',
      page: 1,
      limit: 12
    });
  };

  const activeFiltersCount = [filters.search, filters.specialty, filters.country, filters.city].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader className="h-32 bg-gray-200 rounded-3xl mb-8" />
          <SkeletonLoader className="h-24 bg-gray-200 rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 rounded-3xl p-8 mb-8 border border-cyan-200/30 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  Kongre Takvimi
                </h1>
                <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
                  Yaklaşan tıbbi kongre ve etkinlikleri keşfedin
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md p-3 min-w-[100px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500 mb-0.5">Toplam Kongre</div>
                  <div className="text-xl font-bold text-blue-600">{pagination.total || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Kongre ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <input
              type="text"
              placeholder="Uzmanlık alanı"
              value={filters.specialty}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            
            <input
              type="text"
              placeholder="Ülke"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            
            <input
              type="text"
              placeholder="Şehir"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm">
                  <span>Arama: {filters.search}</span>
                  <button onClick={() => handleFilterChange('search', '')} className="text-blue-600 hover:text-blue-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.specialty && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-sm">
                  <span>Uzmanlık: {filters.specialty}</span>
                  <button onClick={() => handleFilterChange('specialty', '')} className="text-purple-600 hover:text-purple-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.country && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm">
                  <span>Ülke: {filters.country}</span>
                  <button onClick={() => handleFilterChange('country', '')} className="text-green-600 hover:text-green-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.city && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-sm">
                  <span>Şehir: {filters.city}</span>
                  <button onClick={() => handleFilterChange('city', '')} className="text-orange-600 hover:text-orange-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Congress Grid */}
        {congresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henüz kongre bulunmamaktadır</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {congresses.map((congress) => (
                <div
                  key={congress.id}
                  className="bg-white rounded-xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {congress.specialty && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
                        {congress.specialty}
                      </span>
                    )}

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {congress.title}
                    </h3>

                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {formatDate(congress.start_date)} - {formatDate(congress.end_date)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {congress.location}
                        {congress.city && `, ${congress.city}`}
                        {congress.country && `, ${congress.country}`}
                      </span>
                    </div>

                    {congress.organizer && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                        <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{congress.organizer}</span>
                      </div>
                    )}

                    {congress.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {congress.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {congress.website_url && (
                        <a
                          href={congress.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Globe className="w-4 h-4" />
                          Web Sitesi
                        </a>
                      )}
                      {congress.registration_url && (
                        <a
                          href={congress.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Kayıt Ol
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Önceki
                </button>
                
                <span className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CongressCalendarPage;
