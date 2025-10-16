/**
 * Doktor Başvurularım Sayfası
 * 
 * Doktorların yaptığı başvuruları görüntüleyebileceği sayfa
 * Modern dark theme ile ProfilePage ile tutarlı tasarım
 * 
 * Özellikler:
 * - Başvuru listesi ve filtreleme
 * - Başvuru detay görüntüleme
 * - Başvuru geri çekme
 * - Durum takibi
 * - Arama ve filtreleme
 * - Glassmorphism dark theme
 */

import React, { useState } from 'react';
import { 
  FileText, Building, MapPin, Calendar, Clock, 
  CheckCircle, XCircle, AlertCircle, Eye, Filter,
  Search, ChevronRight, ExternalLink, X, Trash2,
  TrendingUp, Users, Briefcase, ArrowRight
} from 'lucide-react';
import { useMyApplications, useApplicationDetail, useWithdrawApplication, useDeleteApplication, useReapplyToJob } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const DoctorApplicationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // API çağrıları
  const { data: applicationsData, isLoading: applicationsLoading } = useMyApplications({
    search: searchQuery,
    status: statusFilter,
    page: currentPage,
    limit: 12
  });

  const { data: applicationDetail, isLoading: detailLoading } = useApplicationDetail(selectedApplication?.id);
  const withdrawMutation = useWithdrawApplication();
  const deleteMutation = useDeleteApplication();
  const reapplyMutation = useReapplyToJob();

  const applications = applicationsData?.applications || [];
  const pagination = applicationsData?.pagination || {};

  const handleApplicationClick = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleWithdraw = async (applicationId) => {
    const confirmed = await showToast.confirm({
      title: "Başvuruyu Geri Çek",
      message: "Bu başvuruyu geri çekmek istediğinizden emin misiniz?",
      type: "warning",
      confirmText: "Geri Çek",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;

    try {
      await withdrawMutation.mutateAsync({ applicationId, reason: '' });
      showToast.success('Başvuru geri çekildi');
    } catch (error) {
      console.error('Withdraw error:', error);
      showToast.error('Başvuru geri çekilemedi');
    }
  };

  const handleDelete = async (applicationId) => {
    const confirmed = await showToast.confirm({
      title: "Başvuruyu Sil",
      message: "Bu başvuruyu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!",
      type: "danger",
      destructive: true,
      confirmText: "Sil",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(applicationId);
      showToast.success('Başvuru kalıcı olarak silindi');
    } catch (error) {
      console.error('Delete error:', error);
      showToast.error('Başvuru silinemedi');
    }
  };

  const handleReapply = async (application) => {
    const confirmed = await showToast.confirm({
      title: "Yeniden Başvuru Yap",
      message: "Bu ilana yeniden başvuru yapmak istediğinizden emin misiniz? Mevcut başvuru silinip yeni başvuru oluşturulacak.",
      type: "info",
      confirmText: "Yeniden Başvuru Yap",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;

    try {
      await reapplyMutation.mutateAsync({ 
        applicationId: application.id, 
        coverLetter: '' 
      });
      showToast.success('Başvuru başarıyla yeniden yapıldı');
    } catch (error) {
      showToast.error('Yeniden başvuru yapılamadı');
    }
  };

  const isWithdrawing = withdrawMutation.isLoading;
  const isDeleting = deleteMutation.isLoading;
  const isReapplying = reapplyMutation.isLoading;

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Başvuruldu':
        return 'Başvuruldu';
      case 'İnceleniyor':
        return 'İnceleniyor';
      case 'Kabul Edildi':
        return 'Kabul Edildi';
      case 'Reddedildi':
        return 'Reddedildi';
      case 'Geri Çekildi':
        return 'Geri Çekildi';
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Başvuruldu', label: 'Başvuruldu' },
    { value: 'İnceleniyor', label: 'İnceleniyor' },
    { value: 'Kabul Edildi', label: 'Kabul Edildi' },
    { value: 'Reddedildi', label: 'Reddedildi' },
    { value: 'Geri Çekildi', label: 'Geri Çekildi' },
  ];

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
                    Başvurularım
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-1">
                      Başvuru Takibi
                    </span>
                  </h1>
                  <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                    Yaptığınız başvuruları takip edin ve yönetin.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 w-32 h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-300 mb-1">Toplam Başvuru</div>
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

              {/* Durum Filtresi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 md:mb-3">
                    Durum
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-sm md:text-base"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800">{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base"
                >
                  <Search className="w-4 h-4" />
                  Ara
                </button>
              </div>
            </form>
          </div>

          {/* Başvuru Listesi */}
          <div className="space-y-4 md:space-y-6">
            {applicationsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : applications?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-2">Başvuru bulunamadı</h3>
                <p className="text-gray-400 text-sm md:text-base px-4">Henüz hiç başvuru yapmadınız veya arama kriterlerinize uygun başvuru bulunmuyor.</p>
              </div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20 p-4 md:p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{application.job_title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{application.hospital}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{application.city}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                            application.status === 'Başvuruldu' ? 'bg-yellow-500/20 text-yellow-300' :
                            application.status === 'İnceleniyor' ? 'bg-blue-500/20 text-blue-300' :
                            application.status === 'Kabul Edildi' ? 'bg-green-500/20 text-green-300' :
                            application.status === 'Reddedildi' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {getStatusText(application.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Başvuru: {new Date(application.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {application.updated_at !== application.created_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Güncelleme: {new Date(application.updated_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Eye className="w-4 h-4" />
                        Detay
                      </button>
                      
                      {application.status === 'Başvuruldu' && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          disabled={isWithdrawing}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                        >
                          <X className="w-4 h-4" />
                          Geri Çek
                        </button>
                      )}

                      {application.status === 'Geri Çekildi' && (
                        <button
                          onClick={() => handleReapply(application)}
                          disabled={isReapplying}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                        >
                          <ArrowRight className="w-4 h-4" />
                          {isReapplying ? 'Yeniden Başvuruluyor...' : 'Yeniden Başvur'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(application.id)}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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

          {/* Başvuru Detay Modal */}
          {selectedApplication && (
            <ApplicationDetailModal
              application={selectedApplication}
              applicationDetail={applicationDetail}
              isLoading={detailLoading}
              onClose={() => {
                setSelectedApplication(null);
              }}
              onWithdraw={() => {
                handleWithdraw(selectedApplication.id);
                setSelectedApplication(null);
              }}
            />
          )}
        </div>
      </div>
  );
};

// Başvuru Detay Modal Component
const ApplicationDetailModal = ({ application, applicationDetail, isLoading, onClose, onWithdraw }) => {
  if (!application) return null;

  const getStatusText = (status) => {
    switch (status) {
      case 'Başvuruldu':
        return 'Başvuruldu';
      case 'İnceleniyor':
        return 'İnceleniyor';
      case 'Kabul Edildi':
        return 'Kabul Edildi';
      case 'Reddedildi':
        return 'Reddedildi';
      case 'Geri Çekildi':
        return 'Geri Çekildi';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Başvuru Detayı</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* İş İlanı Bilgileri */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">İş İlanı Detayları</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Pozisyon</label>
                    <p className="text-white font-medium">{applicationDetail?.title || application.job_title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hastane</label>
                    <p className="text-white">{applicationDetail?.hospital_name || application.hospital}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Şehir</label>
                    <p className="text-white">{applicationDetail?.city || application.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Uzmanlık</label>
                    <p className="text-white">{applicationDetail?.specialty_name || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Çalışma Türü</label>
                    <p className="text-white">{applicationDetail?.employment_type || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Deneyim</label>
                    <p className="text-white">{applicationDetail?.min_experience_years ? `${applicationDetail.min_experience_years} yıl` : 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">İlan Tarihi</label>
                    <p className="text-white">{applicationDetail?.created_at ? new Date(applicationDetail.created_at).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Son Güncelleme</label>
                    <p className="text-white">{applicationDetail?.updated_at ? new Date(applicationDetail.updated_at).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                  </div>
                </div>

                {applicationDetail?.hospital_address && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hastane Adresi</label>
                    <p className="text-white">{applicationDetail.hospital_address}</p>
                  </div>
                )}

                {applicationDetail?.hospital_phone && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hastane Telefonu</label>
                    <p className="text-white">{applicationDetail.hospital_phone}</p>
                  </div>
                )}

                {applicationDetail?.hospital_email && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hastane E-posta</label>
                    <p className="text-white">{applicationDetail.hospital_email}</p>
                  </div>
                )}
              </div>

              {/* İş Açıklaması */}
              {applicationDetail?.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">İş Açıklaması</label>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 whitespace-pre-wrap">{applicationDetail.description}</p>
                  </div>
                </div>
              )}

              {/* Başvuru Bilgileri */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Başvuru Bilgileri</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Başvuru Tarihi</label>
                    <p className="text-white">{new Date(application.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'Başvuruldu' ? 'bg-yellow-500/20 text-yellow-300' :
                      application.status === 'İnceleniyor' ? 'bg-blue-500/20 text-blue-300' :
                      application.status === 'Kabul Edildi' ? 'bg-green-500/20 text-green-300' :
                      application.status === 'Reddedildi' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>

                {applicationDetail?.notes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notlar</label>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-300 whitespace-pre-wrap">{applicationDetail.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ön Yazı */}
              {applicationDetail?.cover_letter && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ön Yazı</label>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 whitespace-pre-wrap">{applicationDetail.cover_letter}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Kapat
                </button>
                {application.status === 'Başvuruldu' && onWithdraw && (
                  <button
                    onClick={onWithdraw}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Başvuruyu Geri Çek
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorApplicationsPage;