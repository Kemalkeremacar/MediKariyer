/**
 * Doktor İş İlanları Sayfası
 * 
 * Doktorların iş ilanlarını görüntüleyebileceği ve başvuru yapabileceği sayfa
 * Modern dark theme ile ProfilePage ile tutarlı tasarım
 * 
 * Özellikler:
 * - İş ilanı listesi ve filtreleme
 * - İş ilanı detay görüntüleme
 * - Başvuru yapma modalı
 * - Arama ve filtreleme
 * - Sayfalama
 * - Glassmorphism dark theme
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Building, 
  Clock, X, Send,
  Briefcase, DollarSign, CheckCircle, ArrowRight, FileText
} from 'lucide-react';
import { useDoctorJobs, useDoctorJobDetail, useApplyToJob } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useLookup } from '@/hooks/useLookup';

const DoctorJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [coverLetter, setCoverLetter] = useState('');

  // Lookup Data Hook - Yeni yapıya göre güncellendi
  const { 
    data: lookupData,
    loading: lookupLoading,
    error: lookupErrorObj
  } = useLookup();
  
  // Lookup verilerini al
  const specialties = lookupData?.specialties || [];
  const cities = lookupData?.cities || [];
  
  // Error handling - ana error'u al
  const lookupError = lookupErrorObj?.error;
  const { data: jobsData, isLoading: jobsLoading } = useDoctorJobs({
    search: searchQuery,
    city: selectedCity,
    specialty: selectedSpecialty,
    page: currentPage,
    limit: 12
  });

  const { data: jobDetail, isLoading: jobDetailLoading } = useDoctorJobDetail(selectedJob?.id);
  const applyToJobMutation = useApplyToJob();

  const jobs = jobsData?.jobs || [];
  const pagination = jobsData?.pagination || {};

  // URL parametresinden jobId'yi al ve ilgili iş ilanını bul
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === parseInt(jobId));
      if (job) {
        setSelectedJob(job);
        setShowJobModal(true);
        // URL'den jobId parametresini temizle
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('jobId');
          return newParams;
        });
      }
    }
  }, [jobs, searchParams, setSearchParams]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleApplyClick = () => {
    setShowJobModal(false);
    setShowApplicationModal(true);
    setCoverLetter('');
  };

  const handleApplicationSubmit = async () => {
    if (!selectedJob) return;

    try {
      await applyToJobMutation.mutateAsync({
        jobId: selectedJob.id,
        coverLetter: coverLetter.trim() || undefined
      });
      
      setShowApplicationModal(false);
      setSelectedJob(null);
      setCoverLetter('');
      showToast.success('Başvurunuz başarıyla gönderildi!');
    } catch (error) {
      // Backend'den gelen hata mesajını kontrol et
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === 'Bu ilana daha önce başvuru yapılmış') {
        await showToast.confirm(
          'Başvuru Yapılamaz',
          'Bu ilana zaten başvuru yapmışsınız. Aynı ilana tekrar başvuru yapamazsınız.\n\nBaşvuru durumunuzu kontrol etmek için "Başvurularım" sayfasını ziyaret edebilirsiniz.',
          {
            confirmText: 'Başvurularımı Gör',
            cancelText: 'Tamam',
            type: 'warning',
            onConfirm: () => {
              setShowApplicationModal(false);
              setSelectedJob(null);
              setCoverLetter('');
              // Başvurularım sayfasına yönlendir
              window.location.href = '/doctor/applications';
            },
            onCancel: () => {
              setShowApplicationModal(false);
              setSelectedJob(null);
              setCoverLetter('');
            }
          }
        );
      } else if (errorMessage === 'Validasyon hatası') {
        const details = error.response?.data?.details;
        if (details && details.length > 0) {
          await showToast.confirm(
            'Geçersiz Bilgi',
            details[0].message + '\n\nLütfen gerekli alanları kontrol edin.',
            {
              confirmText: 'Tamam',
              cancelText: null, // null - buton gösterilmez
              type: 'warning',
              onConfirm: () => {
                // Modal'ı kapatma, kullanıcı düzeltme yapabilsin
              }
            }
          );
        } else {
          await showToast.confirm(
            'Geçersiz Bilgi',
            'Geçersiz bilgi girdiniz. Lütfen bilgilerinizi kontrol edin.',
            {
              confirmText: 'Tamam',
              cancelText: null, // null - buton gösterilmez
              type: 'warning',
              onConfirm: () => {
                // Modal'ı kapatma, kullanıcı düzeltme yapabilsin
              }
            }
          );
        }
      } else {
        // Genel hata yakalama - 400, 500 vs. tüm hatalar
        await showToast.confirm(
          'Başvuru Hatası',
          'Başvuru gönderilemedi. Lütfen tekrar deneyin.',
          {
            confirmText: 'Tamam',
            cancelText: null, // null - buton gösterilmez
            type: 'danger',
            onConfirm: () => {
              setShowApplicationModal(false);
              setSelectedJob(null);
              setCoverLetter('');
            }
          }
        );
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

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
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                    İş İlanları
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-1">
                      Kariyer Fırsatları
                    </span>
                  </h1>
                  <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                    Size uygun iş ilanlarını keşfedin ve başvuru yapın.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 w-32 h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-300 mb-1">Toplam İlan</div>
                    <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arama ve Filtreler */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-4 md:p-6">
            <form onSubmit={handleSearch} className="space-y-4 md:space-y-6">
              {/* Arama Çubuğu */}
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="İş ilanı, hastane veya pozisyon ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-sm md:text-base"
                />
              </div>

              {/* Filtreler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 md:mb-3">
                    Şehir
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      handleFilterChange();
                    }}
                    disabled={lookupLoading}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-slate-800">Tüm Şehirler</option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.name} className="bg-slate-800">{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 md:mb-3">
                    Uzmanlık Alanı
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => {
                      setSelectedSpecialty(e.target.value);
                      handleFilterChange();
                    }}
                    disabled={lookupLoading}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-slate-800">Tüm Uzmanlık Alanları</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.value} value={specialty.name} className="bg-slate-800">{specialty.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  Ara
                </button>
              </div>
            </form>
          </div>

          {/* Error Handling */}
          {lookupError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-400 mr-3">⚠️</div>
                <div className="text-red-300">
                  <p className="font-medium">Filtre verileri yüklenemedi</p>
                  <p className="text-sm">Sayfayı yenileyerek tekrar deneyin.</p>
                  <p className="text-xs mt-2 text-red-400">
                    Hata: {lookupError?.message || lookupError?.error?.message || JSON.stringify(lookupError) || 'Bilinmeyen hata'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* İş İlanları Listesi */}
          {jobsLoading || lookupLoading.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} className="h-64 bg-white/10 rounded-2xl" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
                ))}
              </div>

              {/* Sayfalama */}
              {pagination.total_pages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    Önceki
                  </button>
                  
                  {[...Array(pagination.total_pages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === currentPage;
                    const shouldShow = 
                      page === 1 || 
                      page === pagination.total_pages || 
                      Math.abs(page - currentPage) <= 2;

                    if (!shouldShow) {
                      if (page === 2 && currentPage > 4) {
                        return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                      }
                      if (page === pagination.total_pages - 1 && currentPage < pagination.total_pages - 3) {
                        return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl backdrop-blur-sm ${
                          isCurrentPage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'text-gray-300 bg-white/10 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                    disabled={currentPage === pagination.total_pages}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">İş ilanı bulunamadı</h3>
              <p className="text-gray-300 mb-4">Arama kriterlerinizi değiştirerek tekrar deneyin</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                  setSelectedSpecialty('');
                  setCurrentPage(1);
                }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}

          {/* İş İlanı Detay Modal */}
          {showJobModal && (
            <JobDetailModal
              job={selectedJob}
              jobDetail={jobDetail}
              isLoading={jobDetailLoading}
              onClose={() => {
                setShowJobModal(false);
                setSelectedJob(null);
              }}
              onApply={handleApplyClick}
            />
          )}

          {/* Başvuru Modal */}
          {showApplicationModal && (
            <ApplicationModal
              job={selectedJob}
              coverLetter={coverLetter}
              onCoverLetterChange={setCoverLetter}
              onSubmit={handleApplicationSubmit}
              onClose={() => {
                setShowApplicationModal(false);
                setSelectedJob(null);
                setCoverLetter('');
              }}
              isLoading={applyToJobMutation.isPending}
            />
          )}
        </div>
      </div>
  );
};

// İş İlanı Kartı Component
const JobCard = ({ job, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-300 text-sm mb-2">
            <Building className="w-4 h-4 mr-2" />
            {job.hospital_name}
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {job.city}
          </div>
        </div>
        <div className="text-right">
          <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium mb-2">
            {job.specialty_name}
            {job.subspecialty_name && (
              <span className="ml-1 text-blue-200">({job.subspecialty_name})</span>
            )}
          </div>
          <div className="text-gray-400 text-xs">
            {new Date(job.created_at).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {job.employment_type}
          </div>
          {job.salary_range && (
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {job.salary_range}
            </div>
          )}
        </div>
        <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
          <span className="text-sm font-medium mr-2">Detaylar</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

// İş İlanı Detay Modal Component
const JobDetailModal = ({ job, jobDetail, isLoading, onClose, onApply }) => {
  if (!job) return null;

  // Viewport pozisyonu için scroll pozisyonunu koru
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-slate-800/95 rounded-3xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                  <p className="text-gray-300 text-sm">
                    {job.hospital_name} - {job.city}
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

            {/* İlan Bilgileri */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                İlan Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Uzmanlık Alanı</div>
                  <div className="text-white font-medium">{job.specialty_name}</div>
                  {job.subspecialty_name && (
                    <div className="text-blue-300 text-sm mt-1">Yan Dal: {job.subspecialty_name}</div>
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Çalışma Türü</div>
                  <div className="text-white font-medium">{job.employment_type}</div>
                </div>
                {job.min_experience_years !== null && job.min_experience_years !== undefined && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Min. Deneyim</div>
                    <div className="text-white font-medium">{job.min_experience_years} yıl</div>
                  </div>
                )}
                {job.salary_range && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Maaş Aralığı</div>
                    <div className="text-white font-medium">{job.salary_range}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Hastane Bilgileri */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                Hastane Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Hastane Adı</div>
                  <div className="text-white font-medium">{job.hospital_name}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Şehir</div>
                  <div className="text-white font-medium">{job.city}</div>
                </div>
                {jobDetail?.hospital_address && (
                  <div className="md:col-span-2">
                    <div className="text-gray-400 text-sm mb-1">Adres</div>
                    <div className="text-white font-medium">{jobDetail.hospital_address}</div>
                  </div>
                )}
                {jobDetail?.hospital_phone && (
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Telefon</div>
                    <div className="text-white font-medium">{jobDetail.hospital_phone}</div>
                  </div>
                )}
                {jobDetail?.hospital_email && (
                  <div>
                    <div className="text-gray-400 text-sm mb-1">E-posta</div>
                    <div className="text-white font-medium">{jobDetail.hospital_email}</div>
                  </div>
                )}
                {jobDetail?.hospital_website && (
                  <div className="md:col-span-2">
                    <div className="text-gray-400 text-sm mb-1">Website</div>
                    <a 
                      href={jobDetail.hospital_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      {jobDetail.hospital_website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Açıklama */}
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/30 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                İş Tanımı
              </h3>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {jobDetail?.description || job.description}
                </p>
              </div>
            </div>

            {/* Gereksinimler */}
            {jobDetail?.requirements && (
              <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-500/30 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                  Gereksinimler
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {jobDetail.requirements}
                  </p>
                </div>
              </div>
            )}

            {/* Avantajlar */}
            {jobDetail?.benefits && (
              <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-2xl p-6 border border-emerald-500/30 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Avantajlar
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {jobDetail.benefits}
                  </p>
                </div>
              </div>
            )}

            {/* İlan Tarihi ve Durum */}
            <div className="bg-gradient-to-r from-gray-900/30 to-slate-900/30 rounded-2xl p-6 border border-gray-500/30 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div>
                    İlan Tarihi: {new Date(job.created_at).toLocaleDateString('tr-TR')}
                  </div>
                  {job.deadline && (
                    <div>
                      Son Başvuru: {new Date(job.deadline).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  {job.status_name}
                </div>
              </div>
            </div>

            {/* Başvuru Butonu */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                Kapat
              </button>
              <button
                onClick={onApply}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Başvuru Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Başvuru Modal Component
const ApplicationModal = ({ job, coverLetter, onCoverLetterChange, onSubmit, onClose, isLoading }) => {
  if (!job) return null;

  // Viewport pozisyonu için scroll pozisyonunu koru
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-slate-800/95 rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Başvuru Yap</h2>
                  <p className="text-gray-300 text-sm">
                    {job.title} - {job.hospital_name}
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

            {/* Form */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Ön Yazı
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Neden bu pozisyona uygun olduğunuzu açıklayın
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => onCoverLetterChange(e.target.value)}
                    placeholder="Kendinizi tanıtın ve neden bu pozisyon için uygun olduğunuzu açıklayın..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-300 hover:bg-white/15"
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    {coverLetter.length}/1000 karakter
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-300">
                      <p className="font-medium mb-1">Başvuru Bilgileri</p>
                      <p>Profil bilgileriniz ve CV'niz otomatik olarak gönderilecektir.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                İptal
              </button>
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Başvuru Yapılıyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Başvuru Yap
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorJobsPage;