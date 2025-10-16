/**
 * Hospital Doctors Sayfası
 * 
 * Modern doktor profil listesi ve görüntüleme sayfası
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Doktor profillerini listeleme ve filtreleme
 * - Doktor profil detayları görüntüleme
 * - Uzmanlık alanına göre filtreleme
 * - Şehir bazlı filtreleme
 * - Arama fonksiyonu
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0
 * @since 2024
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Search, Filter, MapPin, Calendar, Award, 
  Eye, Phone, Mail, GraduationCap, Briefcase, 
  ArrowRight, RefreshCw, AlertCircle, Target,
  Building, Users, Star, CheckCircle
} from 'lucide-react';
import { useHospitalDoctorProfiles } from '../api/useHospital';
import TransitionWrapper, { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const HospitalDoctors = () => {
  // State management
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    city: '',
    page: 1,
    limit: 20
  });
  const [showFilters, setShowFilters] = useState(false);

  // API hook'ları
  const { 
    data: doctorsData, 
    isLoading: doctorsLoading, 
    error: doctorsError,
    refetch: refetchDoctors
  } = useHospitalDoctorProfiles(filters);

  // Veri parsing
  const doctors = doctorsData?.data?.doctors || [];
  const pagination = doctorsData?.data?.pagination || {};

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', e.target.search.value);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialty: '',
      city: '',
      page: 1,
      limit: 20
    });
  };

  // Helper functions
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatSpecialties = (specialties) => {
    if (!specialties) return 'Belirtilmemiş';
    if (typeof specialties === 'string') return specialties;
    if (Array.isArray(specialties)) return specialties.join(', ');
    return 'Belirtilmemiş';
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Loading state
  if (doctorsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="space-y-8 p-6">
            <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} className="h-80 bg-white/10 rounded-2xl" />
              ))}
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  // Error state
  if (doctorsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Doktorlar Yüklenemedi</h2>
              <p className="text-gray-300 mb-6">{doctorsError.message || 'Bir hata oluştu'}</p>
              <button 
                onClick={() => refetchDoctors()} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Yeniden Dene
              </button>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <TransitionWrapper>
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Doktor Profilleri</h1>
              <p className="text-gray-300 mt-2">Nitelikli doktorları keşfedin ve bağlantı kurun</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/hospital/jobs"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-2"
              >
                <Briefcase className="w-5 h-5" />
                İş İlanları
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Filtreler</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Gizle' : 'Göster'}
              </button>
            </div>

            {showFilters && (
              <div className="space-y-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="search"
                      placeholder="Doktor adı veya e-posta ara..."
                      defaultValue={filters.search}
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-6 py-3 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Ara
                  </button>
                </form>

                {/* Specialty and City Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Uzmanlık Alanı:</label>
                    <input
                      type="text"
                      placeholder="Uzmanlık alanı girin"
                      value={filters.specialty}
                      onChange={(e) => handleFilterChange('specialty', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Şehir:</label>
                    <input
                      type="text"
                      placeholder="Şehir girin"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {(filters.search || filters.specialty || filters.city) && (
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-4 py-2 rounded-xl hover:bg-gray-500/30 transition-all duration-300 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              {pagination.total || 0} doktor bulundu
              {filters.search && ` - "${filters.search}" için`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sayfa:</span>
              <span className="text-white font-medium">
                {pagination.page || 1} / {pagination.pages || 1}
              </span>
            </div>
          </div>

          {/* Doctors Grid */}
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor, index) => (
                <StaggeredAnimation key={doctor.id} delay={index * 100}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 p-6 group">
                    {/* Doctor Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        {doctor.first_name || doctor.last_name ? (
                          <span className="text-white font-bold text-lg">
                            {getInitials(doctor.first_name, doctor.last_name)}
                          </span>
                        ) : (
                          <User className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                          {doctor.first_name && doctor.last_name 
                            ? `${doctor.first_name} ${doctor.last_name}`
                            : 'Doktor'
                          }
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300">Onaylı Profil</span>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{formatSpecialties(doctor.specialties)}</span>
                      </div>
                      
                      {doctor.residence_city && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{doctor.residence_city}</span>
                        </div>
                      )}

                      {doctor.experience_years && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Briefcase className="w-4 h-4 text-purple-400" />
                          <span className="text-sm">{doctor.experience_years} yıl deneyim</span>
                        </div>
                      )}

                      {doctor.dob && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className="text-sm">
                            {calculateAge(doctor.dob)} yaşında
                          </span>
                        </div>
                      )}

                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm">{doctor.phone}</span>
                        </div>
                      )}

                      {doctor.email && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-4 h-4 text-pink-400" />
                          <span className="text-sm truncate">{doctor.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio Preview */}
                    {doctor.bio && (
                      <div className="mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                          {doctor.bio}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(doctor.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      <Link
                        to={`/hospital/doctors/${doctor.id}`}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
                      >
                        <Eye className="w-4 h-4" />
                        Profili Gör
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </StaggeredAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {filters.search || filters.specialty || filters.city ? 'Sonuç Bulunamadı' : 'Henüz Doktor Yok'}
              </h3>
              <p className="text-gray-300 mb-8">
                {filters.search || filters.specialty || filters.city 
                  ? 'Arama kriterlerinize uygun doktor bulunamadı. Filtreleri değiştirmeyi deneyin.'
                  : 'Sistemde henüz kayıtlı doktor bulunmuyor.'
                }
              </p>
              <div className="flex gap-4 justify-center">
                {filters.search || filters.specialty || filters.city ? (
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-6 py-3 rounded-xl hover:bg-gray-500/30 transition-all duration-300"
                  >
                    Filtreleri Temizle
                  </button>
                ) : (
                  <Link
                    to="/hospital/jobs"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
                  >
                    <Briefcase className="w-5 h-5" />
                    İş İlanı Oluştur
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                        page === pagination.page
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
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

export default HospitalDoctors;
