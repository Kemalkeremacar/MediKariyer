// normalizeDateValue ve formatDateTime artık dateUtils'den geliyor
/**
 * Hospital Job Detail Page
 * 
 * İş ilanı detay sayfası - Hastane için iş ilanı görüntüleme
 * Backend hospitalService.getJobById ile tam entegrasyon
 * 
 * Özellikler:
 * - İş ilanı detayları görüntüleme
 * - Başvuru sayısı ve listesi
 * - İlan düzenleme ve silme işlemleri
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, Edit3, Users, MapPin, Calendar, 
  Target, AlertCircle, ArrowLeft, Building, CheckCircle, Clock, Settings,
  Hourglass, RefreshCw, XCircle, FileText, History, PauseCircle, Download
} from 'lucide-react';
import { useHospitalJobById, useUpdateHospitalJobStatus, useResubmitHospitalJob, downloadJobPDF } from '../api/useHospital';
import TransitionWrapper from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
// ConfirmationModal global; local import gerekmez
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { ModalContainer } from '@/components/ui/ModalContainer';
import { resolveRevisionNote as resolveRevisionNoteUtil } from '@/utils/jobUtils';
import { formatDate, formatMonthYear, normalizeDateValue } from '@/utils/dateUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const jobsBackUrlRef = useRef('/hospital/jobs');
  const detailScrollRef = useRef(null);

  useEffect(() => {
    if (location.state?.from) {
      jobsBackUrlRef.current = location.state.from;
    }
  }, [location.state]);

  const captureDetailScroll = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const current = window.scrollY || window.pageYOffset || 0;
    detailScrollRef.current = current;
    return current;
  }, []);

  const restoreDetailScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (detailScrollRef.current === null || detailScrollRef.current === undefined) return;
    const target = Number(detailScrollRef.current) || 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'auto' });
      setTimeout(() => {
        window.scrollTo({ top: target, behavior: 'auto' });
      }, 50);
      setTimeout(() => {
        window.scrollTo({ top: target, behavior: 'auto' });
      }, 120);
    });
  }, []);

  const handleBackToJobs = useCallback(() => {
    const targetUrl = jobsBackUrlRef.current || '/hospital/jobs';
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('hospital_jobs_state')) {
        const fallbackState = {
          scrollY: window.scrollY || window.pageYOffset || 0,
          page: 1,
          statusFilter: '',
          specialtyId: '',
          subspecialtyId: '',
        };
        try {
          sessionStorage.setItem('hospital_jobs_state', JSON.stringify(fallbackState));
        } catch (error) {
          console.error('JobDetailPage: varsayılan liste durumu kaydedilemedi', error);
        }
      }
    }
    navigate(targetUrl);
  }, [navigate]);

  // API hooks
  const { 
    data: jobData, 
    isLoading: jobLoading, 
    error: jobError,
    refetch: refetchJob
  } = useHospitalJobById(jobId);

  const updateStatusMutation = useUpdateHospitalJobStatus({ enableToast: false });
  const resubmitJobMutation = useResubmitHospitalJob({ enableToast: false });

  // UI Store kaldırıldı: onaylar showToast.confirm ile yönetilecek

  // Veri parsing
  const job = jobData?.data?.job || null;

  const rawHistory = job?.status_history || job?.history || job?.status_log || [];

  const getTurkishStatusName = useCallback((status) => {
    if (!status && status !== 0) return 'Bilinmiyor';
    const statusIdMap = {
      1: 'Onay Bekliyor',
      2: 'Revizyon Gerekli',
      3: 'Onaylandı',
      4: 'Pasif',
      5: 'Reddedildi'
    };
    if (typeof status === 'number') {
      return statusIdMap[status] || 'Bilinmiyor';
    }
    const normalized = String(status).trim();
    if (/^\d+$/.test(normalized)) {
      const numeric = Number(normalized);
      if (!Number.isNaN(numeric) && statusIdMap[numeric]) {
        return statusIdMap[numeric];
      }
    }
    if (Object.values(statusIdMap).includes(normalized)) {
      return normalized;
    }
    const normalizedLower = normalized.toLowerCase();
    const statusMap = {
      'pending approval': 'Onay Bekliyor',
      'pending_approval': 'Onay Bekliyor',
      'needs revision': 'Revizyon Gerekli',
      'needs_revision': 'Revizyon Gerekli',
      'approved': 'Onaylandı',
      'active': 'Onaylandı',
      'passive': 'Pasif',
      'inactive': 'Pasif',
      'rejected': 'Reddedildi',
      'aktif': 'Onaylandı',
      'pasif': 'Pasif'
    };
    if (statusMap[normalizedLower]) {
      return statusMap[normalizedLower];
    }
    return normalized;
  }, []);

  // Utility fonksiyonunu kullan
  const resolveRevisionNote = useCallback((entry) => {
    return resolveRevisionNoteUtil(entry);
  }, []);

const allRevisionEntries = useMemo(() => {
    const collected = [];
    const pushEntry = (rawEntry = {}) => {
      const note = resolveRevisionNote(rawEntry);
      if (!note || !note.trim()) return;

      const changedAt =
        rawEntry.changed_at ||
        rawEntry.created_at ||
        rawEntry.updated_at ||
        rawEntry.timestamp ||
        job?.revision_requested_at ||
        null;

      const roleRaw =
        rawEntry.changed_by_role ||
        rawEntry.actor_role ||
        rawEntry.changed_by ||
        rawEntry.role ||
        'unknown';

      let normalizedRole = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
      if (!normalizedRole || normalizedRole === 'unknown') {
        const statusName = getTurkishStatusName(rawEntry?.new_status_name ?? rawEntry?.new_status_id ?? rawEntry?.status_id);
        if (statusName === 'Revizyon Gerekli') {
          normalizedRole = 'admin';
        }
      }
      if (!normalizedRole) {
        normalizedRole = 'unknown';
      }
      collected.push({
        changed_at: changedAt,
        changed_by_role: normalizedRole,
        note: note.trim(),
        _source: rawEntry
      });
    };

    const shouldIncludeEntry = (entry) => {
      const role = (entry?.changed_by_role || entry?.actor_role || entry?.changed_by || '').toString().toLowerCase();
      const newStatus = getTurkishStatusName(entry?.new_status_name ?? entry?.new_status_id ?? entry?.status_id);
      return role === 'admin' || newStatus === 'Revizyon Gerekli';
    };

    if (Array.isArray(rawHistory)) {
      rawHistory.forEach((entry) => {
        if (shouldIncludeEntry(entry)) {
          pushEntry(entry);
        }
      });
    }

    if (Array.isArray(job?.revision_history)) {
      job.revision_history.forEach((entry) => {
        const role = (entry?.changed_by_role || entry?.actor_role || entry?.changed_by || '').toString().toLowerCase();
        if (role === 'admin') {
          pushEntry(entry);
        }
      });
    }

    if (Array.isArray(job?.status_history)) {
      job.status_history.forEach((entry) => {
        if (shouldIncludeEntry(entry)) {
          pushEntry(entry);
        }
      });
    }

    const getTime = (entry) => {
      if (!entry) return 0;
      const date = normalizeDateValue(entry.changed_at ?? 0);
      return date ? date.getTime() : 0;
    };

    const seen = new Set();
    const unique = collected.filter((entry) => {
      const key = `${entry.changed_at ?? 'unknown'}-${entry.note}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => getTime(b) - getTime(a));
    return unique;
  }, [rawHistory, job?.revision_history, job?.status_history, resolveRevisionNote, getTurkishStatusName, job?.revision_requested_at, normalizeDateValue]);

  const jobLatestRevisionFallback =
    allRevisionEntries[0] ||
    job?.latest_revision ||
    job?.last_revision ||
    job?.lastRevision ||
    (Array.isArray(job?.status_history)
      ? job.status_history
          .slice()
          .reverse()
          .find((entry) => getTurkishStatusName(entry.new_status_name ?? entry.new_status_id) === 'Revizyon Gerekli')
      : null);

  const hospitalRevisionCount = useMemo(() => {
    const serverCountRaw = Number(job?.revision_count ?? job?.revisionCount);
    if (Number.isFinite(serverCountRaw) && serverCountRaw >= 0) {
      return serverCountRaw;
    }
    const adminEntries = allRevisionEntries.filter((entry) => entry.changed_by_role === 'admin');
    const dynamicCount = adminEntries.length;
    if (dynamicCount > 0) return dynamicCount;
    return jobLatestRevisionFallback ? 1 : 0;
  }, [allRevisionEntries, job?.revision_count, job?.revisionCount, jobLatestRevisionFallback]);

  const latestRevisionNote =
    (allRevisionEntries[0]?.note && allRevisionEntries[0].note.trim()) ||
    jobLatestRevisionFallback?.note ||
    jobLatestRevisionFallback?.revision_note ||
    job?.last_revision_note ||
    job?.latest_revision_note ||
    job?.revision_note ||
    '';

  const jobStatusName = getTurkishStatusName(job?.status ?? job?.status_id);
  const isNeedsRevision = jobStatusName === 'Revizyon Gerekli';

  // Status update handler - Sadece Onaylandı ↔ Pasif geçişi için
  // Hastane sadece:
  // - Onaylandı (3) → Pasif (4) geçişi yapabilir
  // - Pasif (4) → Onaylandı (3) geçişi yapabilir
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    targetStatus: null,
  });
  const [resubmitModal, setResubmitModal] = useState({
    isOpen: false,
  });

  const openStatusModal = (statusId) => {
    captureDetailScroll();
    setStatusModal({
      isOpen: true,
      targetStatus: statusId,
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      targetStatus: null,
    });
    restoreDetailScroll();
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModal.targetStatus) return;
    try {
      const targetStatus = statusModal.targetStatus;
      await updateStatusMutation.mutateAsync({
        jobId,
        status_id: targetStatus,
        reason: 'Hastane tarafından güncellendi',
      });
      showToast.success(targetStatus === 3 ? toastMessages.job.activateSuccess : toastMessages.job.deactivateSuccess);
      closeStatusModal();
      await refetchJob();
      restoreDetailScroll();
    } catch (error) {
      console.error('Status update error:', error);
      showToast.error(error, { defaultMessage: toastMessages.job.statusUpdateError });
      restoreDetailScroll();
    }
  };

  const openResubmitModal = () => {
    captureDetailScroll();
    setResubmitModal({
      isOpen: true,
    });
  };

  const closeResubmitModal = () => {
    setResubmitModal({
      isOpen: false,
    });
    restoreDetailScroll();
  };

  const handleResubmitJob = async () => {
    try {
      await resubmitJobMutation.mutateAsync(jobId);
      showToast.success(toastMessages.job.resubmitSuccess);
      closeResubmitModal();
      await refetchJob();
      restoreDetailScroll();
    } catch (error) {
      console.error('Resubmit error:', error);
      showToast.error(error, { defaultMessage: toastMessages.job.resubmitError });
      restoreDetailScroll();
    }
  };

  // Export iş ilanı fonksiyonu - Backend'den PDF indir
  const handleExportJob = async () => {
    if (!job || !jobId) {
      showToast.warning('İş ilanı verisi bulunamadı');
      return;
    }
    
    try {
      await downloadJobPDF(jobId);
    } catch (error) {
      // Error handling already done in downloadJobPDF
      console.error('PDF indirme hatası:', error);
    }
  };

  // Status badge component - Türkçe status'lar için güncellendi
  const StatusBadge = ({ status }) => {
    const normalized = status?.toString().trim().toLowerCase();
    const statusConfig = {
      'onay bekliyor': { classes: 'border border-amber-200 bg-amber-100 text-amber-800', icon: Hourglass },
      'pending approval': { classes: 'border border-amber-200 bg-amber-100 text-amber-800', icon: Hourglass },
      'revizyon gerekli': { classes: 'border border-orange-200 bg-orange-100 text-orange-800', icon: RefreshCw },
      'needs revision': { classes: 'border border-orange-200 bg-orange-100 text-orange-800', icon: RefreshCw },
      'onaylandı': { classes: 'border border-emerald-200 bg-emerald-100 text-emerald-800', icon: CheckCircle },
      'approved': { classes: 'border border-emerald-200 bg-emerald-100 text-emerald-800', icon: CheckCircle },
      'pasif': { classes: 'border border-gray-200 bg-gray-100 text-gray-700', icon: Clock },
      'passive': { classes: 'border border-gray-200 bg-gray-100 text-gray-700', icon: Clock },
      'reddedildi': { classes: 'border border-rose-200 bg-rose-100 text-rose-800', icon: XCircle },
      'rejected': { classes: 'border border-rose-200 bg-rose-100 text-rose-800', icon: XCircle },
      'taslak': { classes: 'border border-slate-200 bg-slate-100 text-slate-700', icon: Clock },
      'draft': { classes: 'border border-slate-200 bg-slate-100 text-slate-700', icon: Clock },
    };

    const config = statusConfig[normalized] || { classes: 'border border-gray-200 bg-gray-100 text-gray-700', icon: Clock };
    const IconComponent = config.icon;

    return (
      <span className={`px-4 py-2 rounded-xl text-sm font-medium ${config.classes} inline-flex items-center justify-center gap-2 w-[160px]`}>
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="text-center truncate">{status}</span>
      </span>
    );
  };

  // Loading state
  if (jobLoading) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <TransitionWrapper>
          <div className="max-w-7xl mx-auto space-y-8">
            <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
            <SkeletonLoader className="h-96 bg-white/10 rounded-3xl" />
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  // Error state
  if (jobError) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Yüklenemedi</h2>
              <p className="text-gray-100 mb-6">{jobError.message || 'Bir hata oluştu'}</p>
              <button
                type="button"
                onClick={handleBackToJobs}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </button>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Bulunamadı</h2>
              <p className="text-gray-100 mb-6">Aradığınız iş ilanı bulunamadı veya silinmiş olabilir.</p>
              <button
                type="button"
                onClick={handleBackToJobs}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </button>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8 overflow-x-hidden">
      <TransitionWrapper>
        <div className="max-w-7xl mx-auto space-y-8 w-full min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBackToJobs}
                className="bg-white border border-blue-200 text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">İş İlanı Detayı</h1>
                <p className="text-gray-700 mt-1">İş ilanı bilgilerini görüntüleyin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* PDF İndirme Butonu */}
              <button
                onClick={handleExportJob}
                className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 inline-flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                title="İş ilanını indir"
              >
                <Download className="w-4 h-4" />
                İndir
              </button>
              {/* Needs Revision durumunda Resubmit butonu */}
              {job?.status_id === 2 && (
                <button
                  onClick={openResubmitModal}
                  disabled={resubmitJobMutation.isPending}
                  className="bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-3 rounded-xl hover:bg-green-500/30 transition-all duration-300 inline-flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${resubmitJobMutation.isPending ? 'animate-spin' : ''}`} />
                  {resubmitJobMutation.isPending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                </button>
              )}
              {/* Sadece Needs Revision durumunda edit butonu göster */}
              {job?.status_id === 2 && (
                <Link
                  to={`/hospital/jobs/${jobId}/edit`}
                  className="bg-yellow-500/20 text-gray-900 border border-yellow-500/30 px-4 py-3 rounded-xl hover:bg-yellow-500/30 transition-all duration-300 inline-flex items-center gap-2 font-semibold"
                >
                  <Edit3 className="w-4 h-4" />
                  Düzenle
                </Link>
              )}
            </div>
          </div>

          {/* Job Content */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-lg p-8 space-y-8">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h2>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <StatusBadge status={job.status} statusId={job.status_id} />
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {job.application_count || 0} Başvuru
                  </span>
                  {job.approved_at && (
                    <span className="text-gray-700 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Onaylandı: {formatDate(job.approved_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Revision Note - Needs Revision durumunda göster */}
            {isNeedsRevision && latestRevisionNote && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Revizyon Notu
                    </h3>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{latestRevisionNote}</p>
                    {hospitalRevisionCount > 0 && (
                      <p className="text-sm text-gray-700 mt-2 font-medium">
                        Revizyon Sayısı: {hospitalRevisionCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Job Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Uzmanlık */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-sm font-semibold">Uzmanlık Alanı</span>
                </div>
                <p className="text-gray-900 font-semibold text-lg">{job.specialty}</p>
                {job.subspecialty_name && (
                  <p className="text-blue-700 text-sm mt-1 font-medium">Yan Dal: {job.subspecialty_name}</p>
                )}
              </div>

              {/* Şehir */}
              {job.city && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm font-semibold">Şehir</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{job.city}</p>
                </div>
              )}

              {/* İstihdam Türü */}
              {job.employment_type && (
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700 text-sm font-semibold">İstihdam Türü</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{job.employment_type}</p>
                </div>
              )}

              {/* Minimum Deneyim */}
              {job.min_experience_years !== null && job.min_experience_years !== undefined && (
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-gray-700 text-sm font-semibold">Minimum Deneyim</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{job.min_experience_years} Yıl</p>
                </div>
              )}

              {/* Oluşturulma Tarihi */}
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 text-sm font-semibold">Oluşturulma Tarihi</span>
                </div>
                <p className="text-gray-900 font-semibold text-lg">
                  {formatMonthYear(job.created_at)}
                </p>
              </div>
            </div>

            {/* İş Tanımı */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                İş Tanımı
              </h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* İlan Durumu Yönetimi */}
            {job?.status_id !== 2 && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">İlan Durumu Yönetimi</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Mevcut Durum */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={job?.status} statusId={job?.status_id} />
                      <span className="text-gray-900 font-semibold">Mevcut Durum</span>
                    </div>
                  </div>

                  {/* Durum Değiştirme Butonları */}
                  <div className="flex items-center gap-4">
                    {job?.status_id === 3 ? (
                      <button
                        onClick={() => openStatusModal(4)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-orange-100 text-orange-700 border border-orange-200 px-6 py-3 rounded-xl hover:bg-orange-200 transition-all duration-300 inline-flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Clock className="w-5 h-5" />
                        Pasif Yap
                      </button>
                    ) : job?.status_id === 4 ? (
                      <button
                        onClick={() => openStatusModal(3)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-green-100 text-green-700 border border-green-200 px-6 py-3 rounded-xl hover:bg-green-200 transition-all duration-300 inline-flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Aktif Yap
                      </button>
                    ) : (
                      <div className="text-gray-700 text-sm font-medium">
                        Durum bilgisi yükleniyor...
                      </div>
                    )}
                  </div>

                  {/* Bilgilendirme */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1 text-gray-900">Durum Değişikliği Hakkında:</p>
                        <ul className="space-y-1">
                          <li>• <strong>Onaylandı:</strong> Doktorlar bu ilanı görebilir ve başvuru yapabilir</li>
                          <li>• <strong>Pasif:</strong> Doktorlar bu ilanı göremez ve başvuru yapamaz</li>
                          <li>• <strong>Not:</strong> Durum değişikliği sadece Onaylandı ve Pasif durumları arasında yapılabilir</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                to={`/hospital/applications?jobIds=${jobId}`}
                className="bg-blue-600 text-white border border-blue-700 px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 inline-flex items-center gap-2 font-semibold shadow-sm"
              >
                <Users className="w-5 h-5" />
                Başvuruları Görüntüle ({job.application_count || 0})
              </Link>
              <button
                type="button"
                onClick={handleBackToJobs}
                className="text-gray-700 hover:text-gray-900 transition-colors font-semibold"
              >
                İş İlanlarına Dön
              </button>
            </div>
          </div>
        </div>
      </TransitionWrapper>

      {statusModal.isOpen && (
        <ModalContainer
          isOpen={statusModal.isOpen}
          onClose={closeStatusModal}
          title="İlan Durumu Değiştir"
          size="small"
          maxHeight="80vh"
          align="center"
          backdropClassName="bg-black/40 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-white/70 border border-blue-200 flex items-center justify-center">
                  {statusModal.targetStatus === 3 ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <PauseCircle className="w-6 h-6 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    {statusModal.targetStatus === 3
                      ? `"${job?.title}" ilanını yeniden aktif hale getirmek üzeresiniz`
                      : `"${job?.title}" ilanını pasif duruma almak üzeresiniz`}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {statusModal.targetStatus === 3
                      ? 'Aktif ilanlar doktorlar tarafından görüntülenir ve başvuru alır.'
                      : 'Pasif ilanlar doktorlara kapatılır ve yeni başvuru kabul etmez.'}
                  </p>
                </div>
              </div>
            </section>
            <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                Dilerseniz daha sonra ilan durumunu tekrar değiştirebilirsiniz.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeStatusModal}
                className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={updateStatusMutation.isPending}
                className={`px-5 py-2 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  statusModal.targetStatus === 3
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700'
                }`}
              >
                {updateStatusMutation.isPending
                  ? 'Güncelleniyor...'
                  : statusModal.targetStatus === 3
                    ? 'Aktif Yap'
                    : 'Pasif Yap'}
              </button>
            </div>
          </div>
        </ModalContainer>
      )}

      {resubmitModal.isOpen && (
        <ModalContainer
          isOpen={resubmitModal.isOpen}
          onClose={closeResubmitModal}
          title="İlanı Tekrar Gönder"
          size="small"
          maxHeight="80vh"
          backdropClassName="bg-black/40 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <section className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-white/70 border border-emerald-200 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    "{job?.title}" ilanını yeniden incelemeye göndermek üzeresiniz
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Revizyonları tamamladıysanız ilanı tekrar admin onayına gönderebilirsiniz. Onaylanana kadar ilan doktorlara kapalı kalır.
                  </p>
                </div>
              </div>
            </section>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeResubmitModal}
                className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
              >
                Vazgeç
              </button>
              <button
                onClick={handleResubmitJob}
                disabled={resubmitJobMutation.isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50"
              >
                {resubmitJobMutation.isPending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
              </button>
            </div>
          </div>
        </ModalContainer>
      )}

      {/* ConfirmationModal global olarak App.jsx içinde render ediliyor */}
    </div>
  );
};

export default JobDetailPage;


