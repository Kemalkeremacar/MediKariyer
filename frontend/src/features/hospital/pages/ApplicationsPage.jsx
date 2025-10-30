/**
 * Hospital Applications Sayfası
 * 
 * Hastane başvuru yönetimi - Modern ve kullanıcı dostu
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Başvuru listesi ve filtreleme
 * - Başvuru durumu yönetimi (dropdown ile)
 * - Doktor profil görüntüleme (modal ile)
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * Başvuru Durumları:
 * - Başvuruldu (1): Doktor başvurdu, henüz incelenmedi
 * - İnceleniyor (2): Hastane inceliyor
 * - Kabul Edildi (3): Başvuru kabul edildi
 * - Reddedildi (4): Başvuru reddedildi
 * - Geri Çekildi (5): Doktor geri çekti (hastane görmez)
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Filter, User, MapPin, Calendar, 
  CheckCircle, X, Clock, Eye, AlertCircle, ArrowRight, 
  RefreshCw, Phone, Mail, Briefcase, Target, Building,
  UserCheck, GraduationCap, Award, Languages, ExternalLink, Settings,
  ArrowLeft
} from 'lucide-react';
import { useHospitalApplications, useUpdateApplicationStatus, useHospitalDoctorProfileDetail, useHospitalProfile } from '../api/useHospital';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { ModalContainer } from '@/components/ui/ModalContainer';

const HospitalApplications = () => {
  const navigate = useNavigate();
  
  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  
  // Modal states - sayfa seviyesinde
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // API hook'ları
  const { 
    data: applicationsData, 
    isLoading: applicationsLoading, 
    error: applicationsError,
    refetch: refetchApplications
  } = useHospitalApplications(filters);

  const { data: profileData } = useHospitalProfile();

  const { data: applicationStatuses, isLoading: statusesLoading } = useApplicationStatuses();
  
  // Doktor profil detayı için hook
  const { 
    data: doctorProfileData, 
    isLoading: doctorProfileLoading 
  } = useHospitalDoctorProfileDetail(selectedDoctorId);

  const updateStatusMutation = useUpdateApplicationStatus();

  // Veri parsing
  const applications = applicationsData?.data?.applications || [];
  const pagination = applicationsData?.data?.pagination || {};

  // Fallback status options (Geri Çekildi hariç - hastane kullanmaz)
  const statusOptions = applicationStatuses?.length > 0 
    ? applicationStatuses.filter(s => s.value !== 5) 
    : [
        { value: 1, label: 'Başvuruldu', name: 'Başvuruldu' },
        { value: 2, label: 'İnceleniyor', name: 'İnceleniyor' },
        { value: 3, label: 'Kabul Edildi', name: 'Kabul Edildi' },
        { value: 4, label: 'Reddedildi', name: 'Reddedildi' }
      ];

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      page: 1,
      limit: 20
    });
  };

  // Status update handler
  const handleStatusChange = async (applicationId, newStatusId, notes = '') => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status_id: parseInt(newStatusId),
        notes: notes || null
      });
    } catch (error) {
      console.error('Başvuru durumu güncelleme hatası:', error);
    }
  };

  // Doktor profil görüntüleme
  const handleViewDoctorProfile = (doctorProfileId) => {
    setSelectedDoctorId(doctorProfileId);
    setShowDoctorModal(true);
  };

  // Modal açma fonksiyonları
  const handleOpenStatusModal = (application) => {
    setSelectedApplication(application);
    setShowStatusModal(true);
  };

  const handleOpenCoverLetterModal = (application) => {
    setSelectedApplication(application);
    setShowCoverLetterModal(true);
  };

  // İş ilanı detayına yönlendirme
  const handleJobClick = (jobId) => {
    console.log('🔍 Job ID:', jobId, 'Type:', typeof jobId);
    
    // jobId'yi temizle - eğer virgül varsa ilk değeri al
    const cleanJobId = String(jobId).split(',')[0].trim();
    console.log('✅ Clean Job ID:', cleanJobId);
    
    if (cleanJobId) {
      navigate(`/hospital/jobs/${cleanJobId}`);
    }
  };

  // Loading state
  if (applicationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="space-y-8 p-6">
          <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-1 gap-6">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-48 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (applicationsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Başvurular Yüklenemedi</h2>
            <p className="text-gray-300 mb-6">{applicationsError.message || 'Bir hata oluştu'}</p>
            <button 
              onClick={() => refetchApplications()} 
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

  // Profil verilerini al
  const profile = profileData?.data?.profile;
  const institutionName = profile?.institution_name || 'Hastaneniz';

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
                {/* Metin ve Buton */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Başvurular</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-blue-400 mb-4">
                      Başvuru Değerlendirme ve Yönetim
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      İş ilanlarınıza gelen başvuruları inceleyin ve değerlendirin.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link
                      to="/hospital/jobs"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group w-full md:w-auto justify-center"
                    >
                      <Briefcase className="w-5 h-5" />
                      İş İlanlarına Git
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Doktor adı veya iş ilanı ara..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
                >
                  <option value="" className="bg-slate-800">Tüm Durumlar</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.label} className="bg-slate-800">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear button */}
            {(filters.search || filters.status) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Filtreleri Temizle
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              {pagination.total || 0} başvuru bulundu
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sayfa:</span>
              <span className="text-white font-medium">
                {pagination.page || 1} / {pagination.pages || 1}
              </span>
            </div>
          </div>

          {/* Applications List */}
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <StaggeredAnimation key={application.id} delay={index * 50}>
                  <ApplicationCard
                    application={application}
                    statusOptions={statusOptions}
                    onStatusChange={handleStatusChange}
                    onViewProfile={handleViewDoctorProfile}
                    onJobClick={handleJobClick}
                    onOpenStatusModal={handleOpenStatusModal}
                    onOpenCoverLetterModal={handleOpenCoverLetterModal}
                  />
                </StaggeredAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Henüz Başvuru Yok
              </h3>
              <p className="text-gray-300 mb-8">
                İş ilanlarınıza henüz başvuru yapılmamış.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page <= 1}
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
                        page === filters.page
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
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page >= pagination.pages}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>

        {/* Doktor Profil Modal */}
        {showDoctorModal && (
          <DoctorProfileModal
            doctorId={selectedDoctorId}
            doctorData={doctorProfileData?.data}
            isLoading={doctorProfileLoading}
            onClose={() => {
              setShowDoctorModal(false);
              setSelectedDoctorId(null);
            }}
          />
        )}

        {/* Başvuru Durumu Modal */}
        {showStatusModal && selectedApplication && (
          <ApplicationStatusModal
            application={selectedApplication}
            statusOptions={statusOptions}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedApplication(null);
            }}
            onStatusUpdate={(statusId, notes) => {
              handleStatusChange(selectedApplication.id, statusId, notes);
              setShowStatusModal(false);
              setSelectedApplication(null);
            }}
            onNoteOnlyUpdate={(notes) => {
              handleStatusChange(selectedApplication.id, selectedApplication.status_id, notes);
              setShowStatusModal(false);
              setSelectedApplication(null);
            }}
          />
        )}

        {/* Doktor Ön Yazısı Modal */}
        {showCoverLetterModal && selectedApplication && (
          <CoverLetterModal
            application={selectedApplication}
            onClose={() => {
              setShowCoverLetterModal(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
  );
};

// Status Badge Component (ApplicationCard'dan önce tanımlanmalı)
const StatusBadge = ({ status_id, statusName }) => {
  const statusConfig = {
    1: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', label: 'Beklemede', icon: Clock },
    2: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', label: 'İnceleniyor', icon: Eye },
    3: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', label: 'Kabul Edildi', icon: CheckCircle },
    4: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', label: 'Red Edildi', icon: X },
    5: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', label: 'Geri Çekildi', icon: ArrowLeft }
  };

  const config = statusConfig[status_id] || statusConfig[1];
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {statusName || config.label}
    </span>
  );
};

// Application Card Component
const ApplicationCard = ({ application, statusOptions, onStatusChange, onViewProfile, onJobClick, onOpenStatusModal, onOpenCoverLetterModal }) => {
  const [selectedStatus, setSelectedStatus] = useState(application.status_id?.toString() || '1');
  const [notes, setNotes] = useState(application.notes || '');
  const [showNotes, setShowNotes] = useState(false);

  const handleStatusUpdate = () => {
    if (parseInt(selectedStatus) === application.status_id) {
      showToast.info('Durum zaten seçili');
      return;
    }
    onStatusChange(application.id, selectedStatus, notes);
    setShowNotes(false);
  };

  const handleModalStatusUpdate = (newStatus, newNotes) => {
    onStatusChange(application.id, newStatus, newNotes);
    setShowStatusModal(false);
  };

  const handleNoteOnlyUpdate = (newNotes) => {
    onStatusChange(application.id, application.status_id?.toString(), newNotes);
    setShowStatusModal(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doktor Bilgileri - 4 kolon */}
        <div className="lg:col-span-4">
          <div className="flex items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                {application.first_name} {application.last_name}
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Phone className="w-3 h-3" />
                  <span className="truncate">{application.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{application.email}</span>
                </div>
              </div>
              <button
                onClick={() => onViewProfile(application.doctor_profile_id)}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Profili Görüntüle
              </button>
            </div>
          </div>
        </div>

        {/* İlan Bilgileri - 3 kolon */}
        <div className="lg:col-span-3">
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-xs block mb-1">İş İlanı</span>
              <p className="text-white font-medium mb-1">{application.job_title}</p>
              {/* Şehir ve Minimum Deneyim */}
              <div className="text-gray-300 text-xs mb-2 flex items-center gap-3">
                {application.job_city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {application.job_city}
                  </span>
                )}
                {typeof application.min_experience_years !== 'undefined' && application.min_experience_years !== null && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Min. Deneyim: {application.min_experience_years} yıl
                  </span>
                )}
              </div>
              
              {/* İş İlanı Durumu */}
              <div className="mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (() => {
                    const status = application.job_status || application.job_status_fallback;
                    if (status === 'Aktif') return 'bg-green-500/20 text-green-300 border border-green-500/30';
                    if (status === 'Pasif') return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
                    return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
                  })()
                }`}>
                  {(() => {
                    const status = application.job_status || application.job_status_fallback;
                    if (status === 'Aktif') return '🟢 Aktif';
                    if (status === 'Pasif') return '🟠 Pasif';
                    return `❓ ${status || 'Bilinmiyor'}`;
                  })()}
                </span>
              </div>
              
              <button
                onClick={() => onJobClick(application.job_id)}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                İlana Git
              </button>
            </div>
          </div>
        </div>

        {/* Durum Yönetimi - 5 kolon */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
              Başvuru Durumu
            </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCoverLetterModal(application)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" />
                  Doktor Ön Yazısı
                </button>
                {application.status_id !== 5 && (
                  <button
                    onClick={() => onOpenStatusModal(application)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    <Settings className="w-3 h-3" />
                    Durum Yönet
                  </button>
                )}
              </div>
            </div>
            
            {/* Mevcut Durum Gösterimi */}
            <div className="flex items-center">
              <StatusBadge status_id={application.status_id} statusName={application.status} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

// Doktor Ön Yazısı Modal Component
const CoverLetterModal = ({ application, onClose }) => {
  return (
    <ModalContainer isOpen={true} onClose={onClose} title="Doktor Ön Yazısı" size="large" maxHeight="90vh" closeOnBackdrop={true} align="auto" fullScreenOnMobile>
      <div className="p-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Doktor Ön Yazısı</h2>
                <p className="text-gray-300 text-sm">
                  {application.first_name} {application.last_name} - {application.job_title}
                </p>
              </div>
            </div>
          </div>

          {/* Başvuru Bilgileri */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 mb-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              Başvuru Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400 block">Başvuru Tarihi</span>
                <span className="text-sm text-gray-300">
                  {new Date(application.applied_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Güncelleme Tarihi</span>
                <span className="text-sm text-gray-300">
                  {new Date(application.updated_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Doktor Ön Yazısı İçeriği */}
          {application.cover_letter ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Ön Yazı İçeriği
              </h3>
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-green-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
                      {application.cover_letter}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-gray-900/30 to-slate-900/30 rounded-2xl p-8 border border-gray-500/30 text-center">
                <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Ön Yazı Bulunamadı</h3>
                <p className="text-gray-400 text-sm">
                  Bu başvuru için doktor ön yazısı eklenmemiş.
                </p>
              </div>
            </div>
          )}

          {/* Kapat Butonu */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      </ModalContainer>
  );
};

// Başvuru Durumu Modal Component
const ApplicationStatusModal = ({ application, statusOptions, onClose, onStatusUpdate, onNoteOnlyUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(application.status_id?.toString() || '1');
  const [notes, setNotes] = useState(application.notes || '');

  const handleStatusUpdate = () => {
    onStatusUpdate(selectedStatus, notes);
  };

  const handleNoteOnlyUpdate = () => {
    onNoteOnlyUpdate(notes);
  };

  const isStatusChanged = parseInt(selectedStatus) !== application.status_id;
  const isNotesChanged = notes !== (application.notes || '');

  return (
    <ModalContainer isOpen={true} onClose={onClose} title="Başvuru Durumu Yönetimi" size="large" maxHeight="90vh" closeOnBackdrop={true} align="auto" fullScreenOnMobile>
      <div className="p-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Başvuru Durumu Yönetimi</h2>
              <p className="text-gray-300 text-sm">
                {application.first_name} {application.last_name} - {application.job_title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
          </button>
        </div>

        {/* Mevcut Durum */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-4 mb-4 border border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Mevcut Durum
          </h3>
          <div className="flex items-center justify-between">
            <StatusBadge status_id={application.status_id} statusName={application.status} />
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Son Güncelleme</span>
              <span className="text-sm text-gray-300">
                {new Date(application.updated_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Durum Seçimi */}
        <div className="mb-4">
          <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Yeni Durum
          </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:bg-white/15"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value} className="bg-slate-800">
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

        {/* Not Alanı */}
        <div className="mb-4">
          <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Hastane Notu
          </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            placeholder="Değerlendirme notları ekleyin..."
            rows={4}
            className="w-full px-4 py-4 bg_WHITE/10 border border_WHITE/20 rounded-2xl text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all duration-300 hover:bg-white/15"
          />
        </div>

        {/* Mevcut Not Gösterimi */}
        {application.notes && (
          <div className="mb-8">
            <label className="block text-lg font-semibold text_white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              Mevcut Not
            </label>
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <FileText className="w-4 h-4 text-orange-300" />
            </div>
                <div className="flex-1">
                  <span className="text-sm text-orange-300 font-medium block mb-2">Hastane Notu:</span>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{application.notes}</p>
          </div>
              </div>
            </div>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium"
          >
            İptal
          </button>
          
          {/* Sadece Not Güncelle */}
          {!isStatusChanged && isNotesChanged && (
            <button
              onClick={handleNoteOnlyUpdate}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium shadow-lg"
            >
              Notu Güncelle
            </button>
          )}
          
          {/* Durum ve Not Güncelle */}
          {isStatusChanged && (
            <button
              onClick={handleStatusUpdate}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
            >
              Durum ve Notu Güncelle
            </button>
          )}
        </div>
          </div>
        </ModalContainer>
  );
};

// Doktor Profil Modal Component
const DoctorProfileModal = ({ doctorId, doctorData, isLoading, onClose }) => {
  if (!doctorId) return null;

  if (isLoading) {
    return (
      <ModalContainer isOpen={true} onClose={onClose} title="Doktor Profili" size="xl" maxHeight="90vh" closeOnBackdrop={true} align="auto" fullScreenOnMobile>
        <div className="flex items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ModalContainer>
    );
  }

  const profile = doctorData?.profile;
  const educations = doctorData?.educations || [];
  const experiences = doctorData?.experiences || [];
  const certificates = doctorData?.certificates || [];
  const languages = doctorData?.languages || [];

  if (!profile) {
    return (
      <ModalContainer isOpen={true} onClose={onClose} title="Doktor Profili" size="large" maxHeight="80vh" closeOnBackdrop={true} align="auto" fullScreenOnMobile>
        <div className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Profil Bulunamadı</h3>
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-6 py-2 rounded-xl hover:bg-blue-500/30"
          >
            Kapat
          </button>
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer isOpen={true} onClose={onClose} title="Doktor Profili" size="xl" maxHeight="90vh" closeOnBackdrop={true} align="auto" fullScreenOnMobile>
      <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text_white font-bold text-2xl">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text_white mb-1">
                  {profile.title} {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-300 font-medium">{profile.specialty_name || 'Uzmanlık Belirtilmemiş'}</p>
                {profile.subspecialty_name && (
                  <p className="text-gray-400 text-sm">Yan Dal: {profile.subspecialty_name}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text_white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Kişisel ve İletişim Bilgileri */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Kişisel ve İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Ad Soyad</span>
                <p className="text-white font-medium">
                  {profile.title} {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Telefon</span>
                <p className="text-white">{profile.phone || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">E-posta</span>
                <p className="text-white">{profile.email || 'Belirtilmemiş'}</p>
              </div>
              {profile.dob && (
                <div>
                  <span className="text-gray-400 text-sm">Doğum Tarihi</span>
                  <p className="text-white">{new Date(profile.dob).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              {profile.birth_place_name && (
                <div>
                  <span className="text-gray-400 text-sm">Doğum Yeri</span>
                  <p className="text-white">{profile.birth_place_name}</p>
                </div>
              )}
              {profile.residence_city_name && (
                <div>
                  <span className="text-gray-400 text-sm">İkamet Şehri</span>
                  <p className="text-white">{profile.residence_city_name}</p>
                </div>
              )}
              {profile.specialty_name && (
                <div>
                  <span className="text-gray-400 text-sm">Uzmanlık Alanı</span>
                  <p className="text-white">{profile.specialty_name}</p>
                </div>
              )}
              {profile.subspecialty_name && (
                <div>
                  <span className="text-gray-400 text-sm">Yan Dal</span>
                  <p className="text-white">{profile.subspecialty_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          {educations.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-400" />
                Eğitim Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {edu.institution_name}
                        </h4>
                        <p className="text-gray-300 text-xs mb-1 line-clamp-2">
                          {edu.field}
                        </p>
                        {edu.degree_type && (
                          <p className="text-gray-400 text-xs mb-2">
                            {edu.degree_type}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                            {edu.graduation_year}
                          </span>
                      {edu.education_type_name && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                          {edu.education_type_name}
                        </span>
                      )}
                    </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deneyim Bilgileri */}
          {experiences.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                İş Deneyimi
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold text-sm line-clamp-2">
                            {exp.role_title}
                          </h4>
                      {exp.is_current && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium ml-2 flex-shrink-0">
                          Devam Ediyor
                        </span>
                      )}
                    </div>
                        <p className="text-gray-300 text-xs mb-1 line-clamp-2">
                          {exp.organization}
                        </p>
                    {exp.specialty_name && (
                          <p className="text-gray-400 text-xs mb-2">
                        Uzmanlık: {exp.specialty_name}
                        {exp.subspecialty_name && ` - ${exp.subspecialty_name}`}
                      </p>
                    )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                      {new Date(exp.start_date).toLocaleDateString('tr-TR')} - 
                      {exp.is_current ? ' Devam Ediyor' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş')}
                          </span>
                        </div>
                    {exp.description && (
                          <p className="text-gray-300 text-xs mt-2 pt-2 border-t border-white/10 line-clamp-3">
                        {exp.description}
                      </p>
                    )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sertifikalar */}
          {certificates.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Sertifikalar ve Kurslar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {cert.certificate_name || 'Sertifika'}
                        </h4>
                        <p className="text-gray-300 text-xs mb-1 flex items-center gap-1">
                          <span className="text-yellow-400">📍</span>
                          {cert.institution}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">
                            {cert.certificate_year}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dil Bilgileri */}
          {languages.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-cyan-400" />
                Dil Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Languages className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {lang.language_name}
                        </h4>
                        <p className="text-gray-300 text-xs mb-2">
                          Seviye: {lang.level_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs font-medium">
                            {lang.level_name}
                  </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kapat Butonu */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Kapat
            </button>
          </div>
          </div>
        </ModalContainer>
  );
};

export default HospitalApplications;
