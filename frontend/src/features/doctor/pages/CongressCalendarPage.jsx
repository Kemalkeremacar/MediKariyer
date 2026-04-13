/**
 * Doktor Kongre Takvimi Sayfası
 * Doktorların kongreleri görüntüleyebileceği sayfa
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, Users, Search, Filter, XCircle as XIcon, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useCongresses } from '../../congress/api/useCongress';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useSpecialties, useSubspecialties } from '@/hooks/useLookup';
import { normalizePagination, createPageChangeHandler } from '@/utils/paginationUtils';

const CongressCalendarPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    specialty_id: '',
    subspecialty_id: '',
    country: '',
    city: '',
    page: 1,
    limit: 12
  });

  const [searchInput, setSearchInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const { data: congressData, isLoading, isFetching } = useCongresses(filters);
  const { rawData: specialtiesRaw = [], isLoading: specialtiesLoading } = useSpecialties();
  const selectedSpecialtyId = filters.specialty_id ? Number(filters.specialty_id) : null;
  const { rawData: subspecialtiesRaw = [], isLoading: subspecialtiesLoading } = useSubspecialties(selectedSpecialtyId);

  const payload = congressData?.data?.data;
  const congresses = payload?.data || [];
  const pagination = normalizePagination(payload?.pagination);

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

  const handlePageChange = createPageChangeHandler(setFilters);

  const clearFilters = () => {
    setFilters({
      search: '',
      specialty_id: '',
      subspecialty_id: '',
      country: '',
      city: '',
      page: 1,
      limit: 12
    });
    setSearchInput('');
    setCountryInput('');
    setCityInput('');
  };

  // Search: debounce + trim
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = (searchInput || '').trim();
      setFilters((prev) => ({ ...prev, search: trimmed, page: 1 }));
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Country: debounce + trim
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = (countryInput || '').trim();
      setFilters((prev) => ({ ...prev, country: trimmed, page: 1 }));
    }, 400);
    return () => clearTimeout(handle);
  }, [countryInput]);

  // City: debounce + trim
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = (cityInput || '').trim();
      setFilters((prev) => ({ ...prev, city: trimmed, page: 1 }));
    }, 400);
    return () => clearTimeout(handle);
  }, [cityInput]);

  const activeFiltersCount = useMemo(
    () => [filters.search, filters.specialty_id, filters.subspecialty_id, filters.country, filters.city].filter(Boolean).length,
    [filters.search, filters.specialty_id, filters.subspecialty_id, filters.country, filters.city]
  );

  const isFirstLoad = isLoading && congresses.length === 0;

  const getStatusBadge = (congress) => {
    const start = new Date(congress.start_date);
    const end = new Date(congress.end_date);
    const now = new Date();
    
    // Gün bazında karşılaştırma için saatleri sıfırla
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const daysToStart = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysToEnd = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Güvenlik: Bitmiş kongreler hiç gösterilmemeli (backend filtrelemeli ama yine de kontrol)
    if (daysToEnd < 0) {
      return null; // Bitmiş kongre - gösterme
    }

    // Henüz başlamamış kongreler
    if (daysToStart > 0) {
      return null; // Status gösterme
    }
    
    // Bugün başlayan kongreler
    if (daysToStart === 0) {
      if (daysToEnd === 0) {
        return { label: 'Bugün (Tek Gün)', className: 'bg-amber-50 border-amber-200 text-amber-800', icon: Clock };
      }
      return { label: 'Bugün başlıyor', className: 'bg-amber-50 border-amber-200 text-amber-800', icon: Clock };
    }
    
    // Devam eden kongreler
    if (daysToEnd > 0) {
      return { label: 'Devam ediyor', className: 'bg-blue-50 border-blue-200 text-blue-800', icon: Clock };
    }
    
    // Bugün biten kongreler
    if (daysToEnd === 0) {
      return { label: 'Son gün', className: 'bg-amber-50 border-amber-200 text-amber-800', icon: Clock };
    }
    
    // Bu duruma hiç gelmemeli çünkü backend bitmiş kongreleri filtreliyor
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section - her zaman render */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-6 md:mb-8 border border-cyan-200/30 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                  <Calendar className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  Kongre Takvimi
                </h1>
                <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
                  Yaklaşan tıbbi kongre ve etkinlikleri keşfedin
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md p-3 min-w-[100px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500 mb-0.5">Toplam</div>
                  <div className="text-xl font-bold text-blue-600">{pagination.total ?? congresses.length}</div>
                </div>
              </div>
            </div>

            {isFetching && (
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50/70 border border-blue-200/60 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Güncelleniyor…
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-4 md:p-6 mb-6">
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <select
                value={filters.specialty_id ?? ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : '';
                  // specialty değişince subspecialty sıfırlansın
                  setFilters((prev) => ({ ...prev, specialty_id: value, subspecialty_id: '', page: 1 }));
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={specialtiesLoading}
              >
                <option value="">{specialtiesLoading ? 'Uzmanlık yükleniyor…' : 'Uzmanlık alanı (tümü)'}</option>
                {specialtiesRaw.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={filters.subspecialty_id ?? ''}
                onChange={(e) => handleFilterChange('subspecialty_id', e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={!selectedSpecialtyId || subspecialtiesLoading}
                title={!selectedSpecialtyId ? 'Önce uzmanlık seçin' : undefined}
              >
                <option value="">
                  {!selectedSpecialtyId
                    ? 'Yan dal (önce uzmanlık seçin)'
                    : subspecialtiesLoading
                      ? 'Yan dal yükleniyor…'
                      : 'Yan dal (tümü)'}
                </option>
                {subspecialtiesRaw.map((ss) => (
                  <option key={ss.id} value={ss.id}>
                    {ss.name}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Ülke"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            
            <input
              type="text"
              placeholder="Şehir"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm">
                  <span>Arama: {filters.search}</span>
                  <button
                    onClick={() => { setSearchInput(''); handleFilterChange('search', ''); }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.specialty_id && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-sm">
                  <span>
                    Uzmanlık: {specialtiesRaw.find((s) => s.id === Number(filters.specialty_id))?.name || filters.specialty_id}
                  </span>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, specialty_id: '', subspecialty_id: '', page: 1 }))}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.subspecialty_id && (
                <div className="flex items-center gap-2 px-3 py-1 bg-fuchsia-50 border border-fuchsia-200 rounded-full text-fuchsia-700 text-sm">
                  <span>
                    Yan dal: {subspecialtiesRaw.find((s) => s.id === Number(filters.subspecialty_id))?.name || filters.subspecialty_id}
                  </span>
                  <button onClick={() => handleFilterChange('subspecialty_id', '')} className="text-fuchsia-600 hover:text-fuchsia-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.country && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm">
                  <span>Ülke: {filters.country}</span>
                  <button onClick={() => { setCountryInput(''); handleFilterChange('country', ''); }} className="text-green-600 hover:text-green-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filters.city && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-sm">
                  <span>Şehir: {filters.city}</span>
                  <button onClick={() => { setCityInput(''); handleFilterChange('city', ''); }} className="text-orange-600 hover:text-orange-800">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Congress Grid */}
        {isFirstLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : congresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-700 text-lg font-semibold">Sonuç bulunamadı</p>
            <p className="text-gray-500 mt-2">
              Filtreleri değiştirerek tekrar deneyin.
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:text-white transition-colors text-sm font-semibold"
              >
                Filtreleri Temizle <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {congresses.map((congress) => (
                <div
                  key={congress.id}
                  className="group bg-white rounded-2xl border border-gray-200/80 shadow-md hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden h-full flex flex-col"
                >
                  {/* Status */}
                  <div className="px-5 pt-5 pb-0">
                    {(() => {
                      const badge = getStatusBadge(congress);
                      if (!badge) return null;
                      const Icon = badge.icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.className}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Başlık */}
                  <div className="px-5 pt-5 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.6rem]">
                      {congress.title}
                    </h3>
                  </div>

                  {/* Uzmanlık / Yan dal */}
                  <div className="px-5 pb-3 flex flex-wrap gap-1.5 min-h-[2rem] items-start">
                    {Array.isArray(congress.specialties) && congress.specialties.length > 0 ? (
                      <>
                        {congress.specialties.slice(0, 3).map((s) => (
                          <span
                            key={s.id ?? s.name}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold rounded-full max-w-full"
                            title={s?.name}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="truncate">{s?.name}</span>
                          </span>
                        ))}
                        {congress.specialties.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-semibold rounded-full">
                            +{congress.specialties.length - 3}
                          </span>
                        )}
                      </>
                    ) : congress.specialty_name ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold rounded-full max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="truncate">{congress.specialty_name}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 text-[11px] font-medium rounded-full">
                        Uzmanlık belirtilmemiş
                      </span>
                    )}
                    {congress.subspecialty_name && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 text-[11px] font-semibold rounded-full max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 flex-shrink-0" />
                        <span className="truncate">{congress.subspecialty_name}</span>
                      </span>
                    )}
                  </div>

                  {/* Ayırıcı */}
                  <div className="mx-5 border-t border-gray-100" />

                  {/* Bilgiler */}
                  <div className="px-5 pt-3 pb-2 flex-1 flex flex-col gap-2.5">
                    {(congress.location || congress.city || congress.country) && (
                      <div className="flex items-start gap-2.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="line-clamp-2 leading-snug">
                          {congress.location || ''}
                          {congress.location && (congress.city || congress.country) && (
                            <span className="text-gray-500"> - </span>
                          )}
                          {(congress.city || congress.country) && (
                            <span className="text-gray-500">
                              {[congress.city, congress.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {congress.organizer && (
                      <div className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="line-clamp-1 leading-snug">{congress.organizer}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="leading-snug">
                        {formatDate(congress.start_date)} – {formatDate(congress.end_date)}
                      </span>
                    </div>
                  </div>

                  {/* Buton */}
                  <div className="px-5 pb-5 pt-2 mt-auto">
                    <Link
                      to={`/doctor/congresses/${congress.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:text-white transition-colors text-sm font-semibold"
                    >
                      Detayları Gör <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Mobile */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 md:mt-8">
                {/* Mobile: compact */}
                <div className="flex md:hidden items-center justify-between gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>

                {/* Desktop: numbered */}
                <div className="hidden md:flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === pagination.page;
                    const shouldShow =
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 2;

                    if (!shouldShow) {
                      if (page === 2 && pagination.page > 4) {
                        return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                      }
                      if (page === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 3) {
                        return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl ${
                          isCurrentPage
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                            : 'text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {/* closing isFirstLoad ternary */}
      </div>
    </div>
  );
};

export default CongressCalendarPage;
