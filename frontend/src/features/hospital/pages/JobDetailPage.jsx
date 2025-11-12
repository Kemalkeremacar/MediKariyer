const normalizeDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const candidates = [];

    if (trimmed.includes(' ') && !trimmed.includes('T')) {
      candidates.push(trimmed.replace(' ', 'T'));
    }
    candidates.push(trimmed);

    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
      const withZ = `${trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T')}Z`;
      candidates.push(withZ);
    }

    for (const candidate of candidates) {
      const date = new Date(candidate);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }
  return null;
};

const formatDateTime = (value) => {
  const date = normalizeDateValue(value);
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Istanbul',
      hour12: false
    }).format(date);
  } catch (error) {
    return date.toLocaleString('tr-TR');
  }
};
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
  Hourglass, RefreshCw, XCircle, FileText, History
} from 'lucide-react';
import { useHospitalJobById, useUpdateHospitalJobStatus, useResubmitHospitalJob } from '../api/useHospital';
import TransitionWrapper from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
// ConfirmationModal global; local import gerekmez
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { ModalContainer } from '@/components/ui/ModalContainer';

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

  const updateStatusMutation = useUpdateHospitalJobStatus();
  const resubmitJobMutation = useResubmitHospitalJob();

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

  const resolveRevisionNote = useCallback((entry) => {
    if (!entry) return '';
    const candidates = [];
    const tryPush = (val) => {
      if (typeof val === 'string' && val.trim()) {
        candidates.push(val.trim());
      }
    };
    tryPush(entry.note);
    tryPush(entry.revision_note);
    if (entry.details) {
      const details = typeof entry.details === 'string' ? (() => {
        try {
          return JSON.parse(entry.details);
        } catch (error) {
          return null;
        }
      })() : entry.details;
      if (details) {
        tryPush(details.revision_note);
        tryPush(details.note);
      }
    }
    if (entry.data) {
      const dataBlock = typeof entry.data === 'string' ? (() => {
        try {
          return JSON.parse(entry.data);
        } catch (error) {
          return null;
        }
      })() : entry.data;
      if (dataBlock) {
        tryPush(dataBlock.revision_note);
        tryPush(dataBlock.note);
      }
    }
    if (entry.metadata) {
      tryPush(entry.metadata.revision_note);
      tryPush(entry.metadata.note);
    }
    return candidates.length > 0 ? candidates[0] : '';
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

  // Status badge component - Türkçe status'lar için güncellendi
  const StatusBadge = ({ status, statusId }) => {
    // Artık backend'den Türkçe geliyor, çeviri gereksiz
    const statusConfig = {
      'Onay Bekliyor': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: Hourglass },
      'Revizyon Gerekli': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: RefreshCw },
      'Onaylandı': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: CheckCircle },
      'Pasif': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: Clock },
      'Reddedildi': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: XCircle },
      // Geriye uyumluluk için eski İngilizce isimler
      'Pending Approval': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: Hourglass },
      'Needs Revision': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: RefreshCw },
      'Approved': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: CheckCircle },
      'Passive': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: Clock },
      'Rejected': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];
    const IconComponent = config.icon;

    return (
      <span className={`px-4 py-2 rounded-xl text-sm font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-2`}>
        <IconComponent className="w-4 h-4" />
        {status}
      </span>
    );
  };

  // Loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Yüklenemedi</h2>
              <p className="text-gray-300 mb-6">{jobError.message || 'Bir hata oluştu'}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Bulunamadı</h2>
              <p className="text-gray-300 mb-6">Aradığınız iş ilanı bulunamadı veya silinmiş olabilir.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <TransitionWrapper>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBackToJobs}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">İş İlanı Detayı</h1>
                <p className="text-gray-300 mt-1">İş ilanı bilgilerini görüntüleyin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                  className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-4 py-3 rounded-xl hover:bg-yellow-500/30 transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Düzenle
                </Link>
              )}
            </div>
          </div>

          {/* Job Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 space-y-8">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">{job.title}</h2>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <StatusBadge status={job.status} statusId={job.status_id} />
                  <span className="text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {job.application_count || 0} Başvuru
                  </span>
                  {job.approved_at && (
                    <span className="text-gray-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Onaylandı: {new Date(job.approved_at).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Revision Note - Needs Revision durumunda göster */}
            {isNeedsRevision && latestRevisionNote && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-200 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Revizyon Notu
                    </h3>
                    <p className="text-orange-100 whitespace-pre-wrap leading-relaxed">{latestRevisionNote}</p>
                    {hospitalRevisionCount > 0 && (
                      <p className="text-sm text-orange-300 mt-2">
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
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-gray-400 text-sm">Uzmanlık Alanı</span>
                </div>
                <p className="text-white font-medium text-lg">{job.specialty}</p>
                {job.subspecialty_name && (
                  <p className="text-blue-300 text-sm mt-1">Yan Dal: {job.subspecialty_name}</p>
                )}
              </div>

              {/* Şehir */}
              {job.city && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-300" />
                    </div>
                    <span className="text-gray-400 text-sm">Şehir</span>
                  </div>
                  <p className="text-white font-medium text-lg">{job.city}</p>
                </div>
              )}

              {/* İstihdam Türü */}
              {job.employment_type && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-gray-400 text-sm">İstihdam Türü</span>
                  </div>
                  <p className="text-white font-medium text-lg">{job.employment_type}</p>
                </div>
              )}

              {/* Minimum Deneyim */}
              {job.min_experience_years !== null && job.min_experience_years !== undefined && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-300" />
                    </div>
                    <span className="text-gray-400 text-sm">Minimum Deneyim</span>
                  </div>
                  <p className="text-white font-medium text-lg">{job.min_experience_years} Yıl</p>
                </div>
              )}

              {/* Oluşturulma Tarihi */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-300" />
                  </div>
                  <span className="text-gray-400 text-sm">Oluşturulma Tarihi</span>
                </div>
                <p className="text-white font-medium text-lg">
                  {new Date(job.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* İş Tanımı */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                İş Tanımı
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* İlan Durumu Yönetimi */}
            {job?.status_id !== 2 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">İlan Durumu Yönetimi</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Mevcut Durum */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={job?.status} statusId={job?.status_id} />
                      <span className="text-gray-300">Mevcut Durum</span>
                    </div>
                  </div>

                  {/* Durum Değiştirme Butonları */}
                  <div className="flex items-center gap-4">
                    {job?.status_id === 3 ? (
                      <button
                        onClick={() => openStatusModal(4)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-6 py-3 rounded-xl hover:bg-orange-500/30 transition-all duration-300 inline-flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Clock className="w-5 h-5" />
                        Pasif Yap
                      </button>
                    ) : job?.status_id === 4 ? (
                      <button
                        onClick={() => openStatusModal(3)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-green-500/20 text-green-300 border border-green-500/30 px-6 py-3 rounded-xl hover:bg-green-500/30 transition-all duration-300 inline-flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Aktif Yap
                      </button>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Durum bilgisi yükleniyor...
                      </div>
                    )}
                  </div>

                  {/* Bilgilendirme */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">Durum Değişikliği Hakkında:</p>
                        <ul className="space-y-1 text-blue-300">
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
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Link
                to={`/hospital/applications?jobIds=${jobId}`}
                className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-6 py-3 rounded-xl hover:bg-blue-500/30 transition-all duration-300 inline-flex items-center gap-2 font-medium"
              >
                <Users className="w-5 h-5" />
                Başvuruları Görüntüle ({job.application_count || 0})
              </Link>
              <button
                type="button"
                onClick={handleBackToJobs}
                className="text-gray-300 hover:text-white transition-colors"
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
          <div className="space-y-4">
            <p className="text-gray-200 leading-relaxed">
              {statusModal.targetStatus === 3
                ? `"${job?.title}" ilanını tekrar aktif hale getirmek istediğinizden emin misiniz? İlan aktif olduğunda doktorlar tarafından görüntülenebilir ve başvuru yapılabilir.`
                : `"${job?.title}" ilanını pasif yapmak istediğinizden emin misiniz? Pasif ilanlar doktorlar tarafından görüntülenmez ve yeni başvuru alınmaz.`}
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200">
              <strong>Bilgi:</strong> Dilerseniz daha sonra ilan durumunu tekrar değiştirebilirsiniz.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeStatusModal}
                className="px-5 py-2 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={updateStatusMutation.isPending}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="space-y-4">
            <p className="text-gray-200 leading-relaxed">
              "{job?.title}" ilanını revizyonları tamamlayarak tekrar admin onayına göndermek üzeresiniz. Onaylanana kadar ilan doktorlar tarafından görünmeyecektir.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeResubmitModal}
                className="px-5 py-2 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleResubmitJob}
                disabled={resubmitJobMutation.isPending}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

