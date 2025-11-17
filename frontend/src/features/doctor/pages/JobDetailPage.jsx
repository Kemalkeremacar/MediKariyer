/**
 * Doktor İş İlanı Detay Sayfası
 * 
 * Modal içeriğinin sayfa versiyonu
 * Modern ve kullanıcı dostu tasarım
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, Building, FileText, CheckCircle, Send, ArrowLeft, Clock, AlertCircle
} from 'lucide-react';
import { useDoctorJobDetail, useApplyToJob } from '../api/useDoctor.js';
import { useDoctorJobs } from '../api/useDoctor.js';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';

const DoctorJobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Job detail fetch
  const { data: jobDetail, isLoading: jobDetailLoading, isError: jobDetailError } = useDoctorJobDetail(parseInt(jobId || '0'));

  // Jobs listesinden job'u bul (fallback için - sadece jobDetail başarısız olursa)
  const shouldFetchFallback = (jobDetailError || (!jobDetail && !jobDetailLoading));
  const { data: jobsData } = useDoctorJobs({ page: 1, limit: 100 });
  const jobs = jobsData?.jobs || [];
  // jobDetail direkt job objesidir (wrapper yok)
  const job = jobDetail || jobs.find(j => j.id === parseInt(jobId || '0'));

  const applyToJobMutation = useApplyToJob();
  // Eğer backend job detayında aktif başvuru bilgisi gönderiyorsa butonu otomatik kilitle
  useEffect(() => {
    if (!jobDetail) return;
    const alreadyApplied =
      Boolean(
        jobDetail.has_active_application ||
        jobDetail.hasExistingApplication ||
        jobDetail.alreadyApplied ||
        jobDetail.application_status // backend'den dönen truthy değer
      );
    if (alreadyApplied) {
      setHasApplied(true);
    }
  }, [jobDetail]);


  const jobsScrollPositionRef = useRef(null);
  const jobsPageRef = useRef(null);
  const jobsBackUrlRef = useRef('/doctor/jobs');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    jobsScrollPositionRef.current = sessionStorage.getItem('jobsPageScrollPosition');
    jobsPageRef.current = sessionStorage.getItem('jobsPageCurrentPage');
    jobsBackUrlRef.current = location.state?.from
      || sessionStorage.getItem('jobsLastVisitedUrl')
      || '/doctor/jobs';
  }, [location]);

  useEffect(() => {
    if (jobDetail && typeof jobDetail.has_active_application !== 'undefined') {
      setHasApplied(Boolean(jobDetail.has_active_application));
    }
  }, [jobDetail?.has_active_application]);

  const handleBackToJobs = useCallback(() => {
    if (typeof window !== 'undefined') {
      const fallbackScroll = window.scrollY || window.pageYOffset || 0;
      const storedScroll = jobsScrollPositionRef.current;
      const storedPage = jobsPageRef.current;
      const targetUrl = jobsBackUrlRef.current || '/doctor/jobs';

      sessionStorage.setItem('jobsLastVisitedUrl', targetUrl);

      sessionStorage.setItem(
        'jobsPageScrollPosition',
        storedScroll !== null && storedScroll !== undefined ? storedScroll : String(fallbackScroll)
      );

      sessionStorage.setItem(
        'jobsPageCurrentPage',
        storedPage !== null && storedPage !== undefined ? storedPage : (() => {
          try {
            const parsed = new URL(targetUrl, window.location.origin);
            const pageParam = parsed.searchParams.get('page');
            return pageParam || '1';
          } catch (error) {
            return '1';
          }
        })()
      );

      navigate(targetUrl);
      return;
    }

    navigate('/doctor/jobs');
  }, [navigate]);

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setCoverLetter('');
  };

  const handleApplicationSubmit = async () => {
    if (!job) return;

    try {
      await applyToJobMutation.mutateAsync({
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined
      });
      
      closeApplicationModal();
      setHasApplied(true);
      showToast.success(
        `${toastMessages.application.createSuccess} Başvurularım sayfasından süreci takip edebilirsiniz.`
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === 'Bu ilana daha önce başvuru yapılmış') {
        closeApplicationModal();
        setHasApplied(true);
        showToast.warning(toastMessages.application.alreadyExists);
      } else if (errorMessage === 'Validasyon hatası') {
        const details = error.response?.data?.details;
        if (details && details.length > 0) {
          await showToast.confirm(
            'Geçersiz Bilgi',
            details[0].message + '\n\nLütfen gerekli alanları kontrol edin.',
            {
              confirmText: 'Tamam',
              cancelText: null,
              type: 'warning'
            }
          );
        } else {
          showToast.error(error, { defaultMessage: toastMessages.application.createError });
        }
      } else {
        showToast.error(error, { defaultMessage: toastMessages.application.createError });
      }
    }
  };

  if (!job && !jobDetailLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 border border-white/20">
              <Briefcase className="h-12 w-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">İlan Bulunamadı</h2>
            <p className="text-gray-300 mb-8 text-center max-w-md">
              Aradığınız iş ilanı artık mevcut değil veya kaldırılmış olabilir.
            </p>
            <button
              onClick={handleBackToJobs}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-20px_rgba(37,99,235,0.6)]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              İlanlar Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Geri butonu ve başlık */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBackToJobs}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <div className="flex-1">
            {jobDetailLoading ? (
              <div className="h-8 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {job?.title}
              </h1>
            )}
          </div>
        </div>

        {/* Content */}
        {jobDetailLoading ? (
          <div className="space-y-6">
            <SkeletonLoader count={5} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hastane ve Şehir */}
            <div className="flex items-center gap-3 mb-6 text-gray-300">
              <Briefcase className="w-5 h-5" />
              <span>{job?.hospital_name} - {job?.city}</span>
            </div>

            {/* İlan Bilgileri */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                İlan Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Uzmanlık Alanı</div>
                  <div className="text-white font-medium">{job?.specialty_name}</div>
                  {job?.subspecialty_name && (
                    <div className="text-blue-300 text-sm mt-1">Yan Dal: {job?.subspecialty_name}</div>
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Çalışma Türü</div>
                  <div className="text-white font-medium">{job?.employment_type}</div>
                </div>
                {job?.min_experience_years !== null && job?.min_experience_years !== undefined && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Min. Deneyim</div>
                    <div className="text-white font-medium">{job?.min_experience_years} yıl</div>
                  </div>
                )}
                {job?.salary_range && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Maaş Aralığı</div>
                    <div className="text-white font-medium">{job?.salary_range}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Hastane Bilgileri */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                Hastane Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Hastane Adı</div>
                  <div className="text-white font-medium">{job?.hospital_name}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Şehir</div>
                  <div className="text-white font-medium">{job?.city}</div>
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
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                İş Tanımı
              </h3>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {jobDetail?.description || job?.description}
                </p>
              </div>
            </div>

            {/* Gereksinimler */}
            {jobDetail?.requirements && (
              <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-500/30">
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
              <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-2xl p-6 border border-emerald-500/30">
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
            <div className="bg-gradient-to-r from-gray-900/30 to-slate-900/30 rounded-2xl p-6 border border-gray-500/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>İlan Tarihi: {new Date(job?.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {job?.deadline && (
                    <div>
                      Son Başvuru: {new Date(job.deadline).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
                <div className={`flex items-center text-sm ${((job?.status_name||job?.status||'').toString().toLowerCase()==='pasif') ? 'text-red-400' : 'text-green-400'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${((job?.status_name||job?.status||'').toString().toLowerCase()==='pasif') ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  {job?.status_name || job?.status}
                </div>
              </div>
            </div>

            {/* Başvuru Butonu */}
            <div className="sticky bottom-4 bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToJobs}
                  className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium"
                >
                  Geri
                </button>
                <button
                  onClick={() => {
                    setShowApplicationModal(true);
                  }}
                  disabled={
                    ((job?.status_name||job?.status||'').toString().toLowerCase()==='pasif') ||
                    hasApplied ||
                    applyToJobMutation.isPending
                  }
                  className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2 ${
                    ((job?.status_name||job?.status||'').toString().toLowerCase()==='pasif') || hasApplied
                      ? 'bg-white/10 text-gray-400 border border-white/20 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {hasApplied ? 'Başvurunuz Bulunuyor' : 'Başvuru Yap'}
                </button>
              </div>
              {hasApplied && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-sm text-green-200">
                  <AlertCircle className="w-4 h-4 text-green-300 mt-0.5" />
                  <div className="flex-1">
                    Bu ilana zaten bir başvurunuz var. Detayları <button
                      type="button"
                      onClick={() => navigate('/doctor/applications')}
                      className="underline text-green-300 hover:text-green-200 font-semibold ml-1"
                    >
                      Başvurularım
                    </button> sayfasından takip edebilirsiniz.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Başvuru Modal */}
        <ApplicationModal
          isOpen={showApplicationModal}
          job={job}
          coverLetter={coverLetter}
          onCoverLetterChange={setCoverLetter}
          onSubmit={handleApplicationSubmit}
          onClose={closeApplicationModal}
          isLoading={applyToJobMutation.isPending}
        />
      </div>
    </div>
  );
};

// Başvuru Modal Component
const ApplicationModal = ({ isOpen, job, coverLetter, onCoverLetterChange, onSubmit, onClose, isLoading }) => {
  if (!job || !isOpen) return null;

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Başvuru Yap"
      size="medium"
      maxHeight="85vh"
      closeOnBackdrop={true}
      fullScreenOnMobile={false}
      align="center"
    >
      <div className="p-4 md:p-6 space-y-5">
        {/* İlan Bilgisi (Kompakt) */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-sm md:text-base text-gray-200 font-medium truncate">{job.title}</span>
          </div>
          <span className="text-gray-500">•</span>
          <span className="text-sm md:text-base text-gray-400 truncate">{job.hospital_name}</span>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ön Yazı <span className="text-gray-500 text-xs">(İsteğe bağlı)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => onCoverLetterChange(e.target.value)}
              placeholder="Kendinizi tanıtın ve neden bu pozisyon için uygun olduğunuzu açıklayın..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 hover:bg-white/10 text-sm md:text-base"
            />
            <div className="text-xs text-gray-400 mt-1.5 text-right">
              {coverLetter.length}/1000
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300 leading-relaxed">
                Profil bilgileriniz ve CV'niz otomatik olarak gönderilecektir.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 mt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 bg-white/5 border border-white/20 text-white px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm md:text-base font-medium"
          >
            İptal
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm md:text-base font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gönderiliyor...
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
    </ModalContainer>
  );
};

export default DoctorJobDetailPage;

