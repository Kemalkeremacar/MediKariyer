/**
 * Admin Job Detail Page
 * 
 * İş ilanı detay sayfası - Admin için tüm hastanelerin iş ilanlarını görüntüleme
 * Hospital JobDetailPage'in aynısı, tek fark: Admin tüm hastanelerin ilanlarını görebilir
 * Backend adminService.getJobDetails ile tam entegrasyon
 * 
 * Özellikler:
 * - İş ilanı detayları görüntüleme
 * - Başvuru sayısı ve listesi
 * - İlan düzenleme (modal) ve silme işlemleri
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0 - Admin Edition
 * @since 2024
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Edit3, Trash2, Users, MapPin, Calendar, 
  Clock, Target, AlertCircle, ArrowLeft, CheckCircle, Building, X,
  Hourglass, RefreshCw, XCircle, History, FileText, Settings, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import { useJobById, useDeleteJob, useUpdateJob, useUpdateJobStatus, useApproveJob, useRequestRevision, useRejectJob, useJobHistory, QUERY_KEYS } from '../api/useAdmin';
import { useQueryClient } from '@tanstack/react-query';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';
import useAuthStore from '@/store/authStore';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { resolveRevisionNote as resolveRevisionNoteUtil } from '@/utils/jobUtils';
import { useLookup } from '@/hooks/useLookup';
import { jobSchema } from '@config/validation.js';

const AdminJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [showJobEditModal, setShowJobEditModal] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    specialty_id: '',
    subspecialty_id: '',
    city_id: '',
    employment_type: '',
    min_experience_years: '',
    description: ''
  });
  const actionScrollRef = useRef(null);

  const captureScroll = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const current = window.scrollY || window.pageYOffset || 0;
    actionScrollRef.current = current;
    return current;
  }, []);

  const restoreScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (actionScrollRef.current === null || actionScrollRef.current === undefined) return;
    const target = Number(actionScrollRef.current) || 0;
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

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    restoreScroll();
  };

  const closeRevisionModal = () => {
    setShowRevisionModal(false);
    setRevisionNote('');
    restoreScroll();
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    restoreScroll();
  };

  const closeStatusChangeModal = () => {
    setShowStatusChangeModal(false);
    setStatusChangeReason('');
    setSelectedStatusId(null);
    restoreScroll();
  };

  const openApprovalModal = () => {
    captureScroll();
    setShowApprovalModal(true);
  };

  const openRevisionModal = () => {
    captureScroll();
    setShowRevisionModal(true);
  };

  const openRejectModal = () => {
    captureScroll();
    setShowRejectModal(true);
  };

  const openStatusChangeModal = (statusId = null) => {
    captureScroll();
    if (statusId !== null) {
      setSelectedStatusId(statusId);
    }
    setShowStatusChangeModal(true);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  // API hooks - Admin API kullanır (tüm hastanelerin ilanlarına erişir)
  const { 
    data: jobData, 
    isLoading: jobLoading, 
    error: jobError,
    refetch: refetchJob
  } = useJobById(id);

  const deleteJobMutation = useDeleteJob();
  const updateStatusMutation = useUpdateJobStatus();
  const updateJobMutation = useUpdateJob();
  const approveJobMutation = useApproveJob();
  const requestRevisionMutation = useRequestRevision();
  const rejectJobMutation = useRejectJob();
  const { data: historyData } = useJobHistory(id);
  const { data: lookupData } = useLookup();
  const specialties = lookupData?.specialties || [];
  const subspecialties = lookupData?.subspecialties || [];
  const cities = lookupData?.cities || [];

  // Veri parsing - Backend response: { data: { data: { job: {...} } } }
  const job = jobData?.data?.data?.job || jobData?.data?.job || jobData?.data || null;
  const historyResponse = historyData?.data ?? null;
  const history =
    (historyResponse?.data && Array.isArray(historyResponse.data.history)
      ? historyResponse.data.history
      : Array.isArray(historyResponse?.history)
        ? historyResponse.history
        : []) || [];

  const normalizeDateValue = useCallback((value) => {
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

      // Örnek: "2025-01-07 12:37:05" → ISO benzeri
      if (trimmed.includes(' ') && !trimmed.includes('T')) {
        candidates.push(trimmed.replace(' ', 'T'));
      }
      candidates.push(trimmed);

      // UTC bilgisi belirtilmemişse son çare olarak 'Z' eklemeyi dene
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
  }, []);

  const formatDateTime = useCallback((value) => {
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
  }, [normalizeDateValue]);

  const getTurkishStatusName = useCallback((statusName) => {
    if (!statusName && statusName !== 0) return 'Bilinmiyor';
    const statusIdMap = {
      1: 'Onay Bekliyor',
      2: 'Revizyon Gerekli',
      3: 'Onaylandı',
      4: 'Pasif',
      5: 'Reddedildi'
    };
    if (typeof statusName === 'number') {
      return statusIdMap[statusName] || 'Bilinmiyor';
    }
    const normalized = String(statusName).trim();
    if (/^\d+$/.test(normalized)) {
      const numeric = Number(normalized);
      if (!Number.isNaN(numeric) && statusIdMap[numeric]) {
        return statusIdMap[numeric];
      }
    }
    const turkishStatuses = ['Onay Bekliyor', 'Revizyon Gerekli', 'Onaylandı', 'Pasif', 'Reddedildi'];
    if (turkishStatuses.includes(normalized)) {
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
      'aktİf': 'Onaylandı',
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
    const pushEntry = (rawEntry = {}, explicitRole) => {
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
        explicitRole ||
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
        note: note.trim()
      });
    };

    const shouldIncludeEntry = (entry) => {
      const role = (entry?.changed_by_role || entry?.actor_role || entry?.changed_by || '').toString().toLowerCase();
      const newStatus = getTurkishStatusName(entry?.new_status_name ?? entry?.new_status_id ?? entry?.status_id);
      return role === 'admin' || newStatus === 'Revizyon Gerekli';
    };

    if (Array.isArray(history)) {
      history.forEach((entry) => {
        if (shouldIncludeEntry(entry)) {
          pushEntry(entry);
        }
      });
    }

    if (Array.isArray(job?.revision_history)) {
      job.revision_history.forEach((entry) => {
        pushEntry(entry, entry?.changed_by_role || entry?.actor_role || entry?.role);
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
  }, [history, job?.revision_history, job?.status_history, resolveRevisionNote, getTurkishStatusName, job?.revision_requested_at, normalizeDateValue]);

  const jobStatusName = getTurkishStatusName(job?.status ?? job?.status_id);
  const isPendingApproval = jobStatusName === 'Onay Bekliyor';
  const isNeedsRevision = jobStatusName === 'Revizyon Gerekli';

  const revisionCount = useMemo(() => {
    const serverCountRaw = Number(job?.revision_count ?? job?.revisionCount);
    if (Number.isFinite(serverCountRaw) && serverCountRaw >= 0) {
      return serverCountRaw;
    }
    const adminEntries = allRevisionEntries.filter((entry) => entry.changed_by_role === 'admin');
    return adminEntries.length;
  }, [allRevisionEntries, job?.revision_count, job?.revisionCount]);
  const latestRevisionEntry = allRevisionEntries[0] || (job?.revision_note ? {
    changed_at: job?.revision_requested_at || job?.updated_at || job?.created_at || null,
    changed_by_role: 'admin',
    note: job.revision_note
  } : null);
  const olderRevisionEntries = allRevisionEntries.length > 1 ? allRevisionEntries.slice(1) : [];
  const latestRevisionNoteRaw = latestRevisionEntry?.note
    || job?.last_revision_note
    || job?.latest_revision_note
    || job?.revision_note
    || '';
  const latestAdminRevisionNote = latestRevisionNoteRaw.trim();

  // Job actions
  const confirmDeleteJob = async () => {
    try {
      await deleteJobMutation.mutateAsync(id);
      showToast.success(toastMessages.job.deleteSuccess);
      closeDeleteModal();
      navigate('/admin/jobs');
    } catch (error) {
      console.error('İş ilanı silme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.job.deleteError });
    }
  };

  // Export iş ilanı fonksiyonu (Backend PDF servisi kullanarak)
  const handleExportJob = async () => {
    if (!job) {
      showToast.warning('İş ilanı verisi bulunamadı');
      return;
    }

    try {
      // Zustand store'dan token al (localStorage'dan değil)
      const token = useAuthStore.getState().token;
      
      // Token kontrolü - yoksa kullanıcıyı bilgilendir
      if (!token) {
        showToast.error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // Backend PDF endpoint'ine istek at
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3100/api'}/pdf/job/${job.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Token'ı Bearer formatında gönder
        }
      });

      // Response kontrolü
      if (!response.ok) {
        throw new Error('PDF oluşturulamadı');
      }

      // PDF blob'unu al ve indir
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ilan-${job.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Temizlik
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.success('İş ilanı başarıyla indirildi');
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      showToast.error('PDF indirilirken bir hata oluştu');
    }
  };

  // Approve job handler
  const handleApproveJob = async () => {
    try {
      await approveJobMutation.mutateAsync(id);
      closeApprovalModal();
      refetchJob();
      restoreScroll();
    } catch (error) {
      console.error('Approve job error:', error);
      restoreScroll();
    }
  };

  // Request revision handler
  const handleRequestRevision = async () => {
    const trimmedNote = revisionNote.trim();
    if (!trimmedNote) {
      showToast.error(toastMessages.job.revisionNoteRequired);
      return;
    }
    if (trimmedNote.length < 10) {
      showToast.error(toastMessages.job.revisionNoteMinLength);
      return;
    }
    if (trimmedNote.length > 1000) {
      showToast.error(toastMessages.job.revisionNoteMaxLength);
      return;
    }
    try {
      await requestRevisionMutation.mutateAsync({ jobId: id, revision_note: trimmedNote });
      closeRevisionModal();
      refetchJob();
      restoreScroll();
    } catch (error) {
      console.error('Request revision error:', error);
      restoreScroll();
    }
  };

  // Reject job handler
  const handleRejectJob = async () => {
    const trimmedReason = rejectionReason.trim();
    // Rejection reason optional ama girilmişse validation yap
    if (trimmedReason && trimmedReason.length < 5) {
      showToast.error(toastMessages.job.rejectReasonMinLength);
      return;
    }
    if (trimmedReason && trimmedReason.length > 500) {
      showToast.error(toastMessages.job.rejectReasonMaxLength);
      return;
    }
    try {
      await rejectJobMutation.mutateAsync({ 
        jobId: id, 
        rejection_reason: trimmedReason || null 
      });
      closeRejectModal();
      refetchJob();
      restoreScroll();
    } catch (error) {
      console.error('Reject job error:', error);
      restoreScroll();
    }
  };

  // Status change handler - Direct status update with reason
  const handleStatusChange = async (newStatusId, reason = null) => {
    try {
      const payload = { 
        jobId: id, 
        status_id: newStatusId
      };
      
      // Reason varsa ekle, yoksa ekleme (null gönderme)
      if (reason && reason.trim()) {
        payload.reason = reason.trim();
      }
      
      await updateStatusMutation.mutateAsync(payload);
      refetchJob();
      // History'i de yenile
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_HISTORY, id] });
      restoreScroll();
    } catch (error) {
      console.error('Status change error:', error);
      restoreScroll();
    }
  };

  const openJobEditModal = () => {
    if (!job) return;
    captureScroll();
    setJobFormData({
      title: job.title || '',
      specialty_id: job.specialty_id?.toString() || '',
      subspecialty_id: job.subspecialty_id?.toString() || '',
      city_id: job.city_id?.toString() || '',
      employment_type: job.employment_type || '',
      min_experience_years: job.min_experience_years?.toString() || '',
      description: job.description || ''
    });
    setShowJobEditModal(true);
  };

  const closeJobEditModal = () => {
    setShowJobEditModal(false);
    restoreScroll();
  };

  const handleJobInputChange = (field, value) => {
    setJobFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'specialty_id') {
        next.subspecialty_id = '';
      }
      return next;
    });
  };

  const handleJobEditSubmit = async () => {
    try {
      const submitData = {
        title: jobFormData.title,
        specialty_id: parseInt(jobFormData.specialty_id, 10),
        subspecialty_id: jobFormData.subspecialty_id ? parseInt(jobFormData.subspecialty_id, 10) : null,
        city_id: parseInt(jobFormData.city_id, 10),
        employment_type: jobFormData.employment_type,
        min_experience_years: jobFormData.min_experience_years ? parseInt(jobFormData.min_experience_years, 10) : null,
        description: jobFormData.description
      };
      const validatedData = jobSchema.parse(submitData);
      await updateJobMutation.mutateAsync({ jobId: id, jobData: validatedData });
      showToast.success(toastMessages.job.updateSuccess);
      closeJobEditModal();
      await refetchJob();
    } catch (error) {
      if (error?.errors?.[0]?.message) {
        showToast.error(error.errors[0].message);
      } else {
        showToast.error(error, { defaultMessage: toastMessages.job.updateError });
      }
    }
  };

  // Status badge component - Türkçe status'lar için güncellendi
  const StatusBadge = ({ status, statusId }) => {
    // Artık backend'den Türkçe geliyor, çeviri gereksiz
    const statusConfig = {
      'Onay Bekliyor': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Hourglass },
      'Revizyon Gerekli': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: RefreshCw },
      'Onaylandı': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Pasif': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Clock },
      'Reddedildi': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle },
      // Geriye uyumluluk için eski İngilizce isimler
      'Pending Approval': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Hourglass },
      'Needs Revision': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: RefreshCw },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      'Passive': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Clock },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['Pasif'];
    const IconComponent = config.icon;

    return (
      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${config.bg} ${config.text} ${config.border} border inline-flex items-center justify-center gap-2 w-[160px]`}>
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="text-center truncate">{status}</span>
      </span>
    );
  };

  // Status options - Paylaşılan durum listesi
  const statusOptions = [
    { id: 1, name: 'Onay Bekliyor', description: 'Admin onayı bekliyor', color: 'yellow', icon: Hourglass },
    { id: 2, name: 'Revizyon Gerekli', description: 'Revizyon talebi var', color: 'orange', icon: RefreshCw },
    { id: 3, name: 'Onaylandı', description: 'Onaylandı ve yayında', color: 'green', icon: CheckCircle },
    { id: 4, name: 'Pasif', description: 'Yayından kaldırıldı', color: 'gray', icon: Clock },
    { id: 5, name: 'Reddedildi', description: 'Tamamen reddedildi', color: 'red', icon: XCircle },
  ];

  // Edit Modal Component - Manuel durum seçimi için
  const EditModal = () => {
    if (!showEditModal) return null;

    return (
      <ModalContainer
        isOpen={true}
        onClose={() => {
          setShowEditModal(false);
        }}
        title="İlan Durumunu Değiştir"
        size="medium"
        maxHeight="90vh"
        closeOnBackdrop={true}
        align="center"
        fullScreenOnMobile
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-900 font-medium mb-1">Mevcut Durum: {getTurkishStatusName(job?.status)}</p>
                <p className="text-blue-700 text-sm">Aşağıdan yeni durumu seçin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusOptions.map((status) => {
              if (status.id === job?.status_id) return null; // Mevcut durumu gösterme
              
              const colorClasses = {
                yellow: 'from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600',
                orange: 'from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600',
                green: 'from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
                gray: 'from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600',
                red: 'from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600',
              };

              const IconComponent = status.icon;

              return (
                <button
                  key={status.id}
                  onClick={() => {
                    // Özel durumlar için modal aç
                    if (status.id === 3 && job?.status_id === 1) {
                      setShowEditModal(false);
                      openApprovalModal();
                      return;
                    }
                    if (status.id === 2 && job?.status_id === 1) {
                      setShowEditModal(false);
                      openRevisionModal();
                      return;
                    }
                    if (status.id === 5 && (job?.status_id === 1 || job?.status_id === 2)) {
                      setShowEditModal(false);
                      openRejectModal();
                      return;
                    }
                    // Diğer durumlar için not modal'ı aç
                    setSelectedStatusId(status.id);
                    setStatusChangeReason('');
                    setShowEditModal(false);
                    openStatusChangeModal(status.id);
                  }}
                  className={`bg-gradient-to-br ${colorClasses[status.color]} text-white p-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">{status.name}</div>
                      <div className="text-sm text-white/90">{status.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ModalContainer>
    );
  };

  // Loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-full max-w-xs bg-gray-200 rounded-lg mb-6" />
          <SkeletonLoader className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (jobError) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İş İlanı Yüklenemedi</h2>
              <p className="text-gray-600 mb-6">{jobError.message || 'Bir hata oluştu'}</p>
              <Link
                to="/admin/jobs"
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-dark)] transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İş İlanı Bulunamadı</h2>
              <p className="text-gray-600 mb-6">Aradığınız iş ilanı bulunamadı veya silinmiş olabilir.</p>
              <Link
                to="/admin/jobs"
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-dark)] transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                İş İlanlarına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link
                to="/admin/jobs"
                className="flex items-center justify-center sm:justify-start px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-indigo-600" />
                  İş İlanı Detayı
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">İş ilanı bilgilerini görüntüleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openJobEditModal}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg flex-1 sm:flex-none"
                title="İlan içeriğini düzenle"
              >
                <Edit3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
              <button
                onClick={handleExportJob}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors shadow-md hover:shadow-lg flex-1 sm:flex-none"
                title="İş ilanını indir"
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">İndir</span>
              </button>
              <button
                onClick={openDeleteModal}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg flex-1 sm:flex-none"
                disabled={deleteJobMutation.isPending}
                title="İş ilanını kalıcı olarak siler (deleted_at set eder)"
              >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Job Content */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h2>
              <div className="flex items-center gap-4 mb-4">
                <StatusBadge status={job.status} statusId={job.status_id} />
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {job.application_count || 0} Başvuru
                </span>
                {job.approved_at && (
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Onaylandı: {new Date(job.approved_at).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          </div>


            {/* Önceki Revizyonlar */}
            {latestAdminRevisionNote && isPendingApproval && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <History className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800">Son Revizyon Notu</h3>
                      {revisionCount > 1 && (
                        <p className="text-sm text-amber-700 mt-1">
                          Toplam revizyon talebi: {revisionCount}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white border border-amber-200/70 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{formatDateTime(latestRevisionEntry?.changed_at || latestRevisionEntry?.created_at)}</span>
                          <span className="text-gray-500">
                            {latestRevisionEntry?.changed_by_role === 'admin' ? 'Admin tarafından' : latestRevisionEntry?.changed_by_role === 'hospital' ? 'Hastane tarafından' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                          {latestAdminRevisionNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hastane Adı - Admin için ek bilgi */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-600 text-sm">Hastane</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">{job.institution_name || 'Belirtilmemiş'}</p>
            </div>

            {/* Uzmanlık */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-600 text-sm">Uzmanlık Alanı</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">{job.specialty || 'Belirtilmemiş'}</p>
              {job.subspecialty_name && (
                <p className="text-blue-600 text-sm mt-1">Yan Dal: {job.subspecialty_name}</p>
              )}
            </div>
            
            {/* Şehir */}
            {job.city && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Şehir</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{job.city}</p>
              </div>
            )}

            {/* İstihdam Türü */}
            {job.employment_type && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-600 text-sm">İstihdam Türü</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{job.employment_type}</p>
              </div>
            )}

            {/* Minimum Deneyim */}
            {job.min_experience_years !== null && job.min_experience_years !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Minimum Deneyim</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{job.min_experience_years} Yıl</p>
              </div>
            )}

            {/* Oluşturulma Tarihi */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-gray-600 text-sm">Oluşturulma Tarihi</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">
                {new Date(job.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* İş Tanımı */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              İş Tanımı
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description || 'İş tanımı belirtilmemiş.'}</p>
          </div>

          {/* İlan Durumu Yönetimi - Ayrı Bölüm */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  İlan Durumu Yönetimi
                </h3>
                <p className="text-gray-600 mt-2">İlanın durumunu görüntüleyin ve yönetin</p>
              </div>
            </div>

            {/* Mevcut Durum Kartı */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Mevcut Durum</label>
              <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={job.status} statusId={job.status_id} />
                    <div className="text-sm text-gray-600">
                      {job.status_id === 1 && 'İlan admin onayı bekliyor'}
                      {job.status_id === 2 && 'Revizyon yapılması gerekiyor'}
                      {job.status_id === 3 && 'İlan onaylandı ve yayında'}
                      {job.status_id === 4 && 'İlan pasif durumda'}
                      {job.status_id === 5 && 'İlan reddedildi'}
                    </div>
                  </div>
                  {job.approved_at && (
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Onay: {new Date(job.approved_at).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Durum Değiştirme Bölümü */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Durum Değiştir</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pending Approval → Approved */}
                {job.status_id === 1 && (
                  <button
                    onClick={openApprovalModal}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Onayla</div>
                        <div className="text-sm text-green-100">İlanı onayla ve yayına al</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Pending Approval → Needs Revision */}
                {job.status_id === 1 && (
                  <button
                    onClick={openRevisionModal}
                    className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-5 rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Revizyon İste</div>
                        <div className="text-sm text-orange-100">Revizyon notu ile geri gönder</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Pending Approval → Rejected */}
                {job.status_id === 1 && (
                  <button
                    onClick={openRejectModal}
                    className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Reddet</div>
                        <div className="text-sm text-red-100">İlanı tamamen reddet</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Needs Revision → Approved */}
                {job.status_id === 2 && (
                  <button
                    onClick={openApprovalModal}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Onayla</div>
                        <div className="text-sm text-green-100">Revizyonu onayla ve yayına al</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Needs Revision → Rejected */}
                {job.status_id === 2 && (
                  <button
                    onClick={openRejectModal}
                    className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Reddet</div>
                        <div className="text-sm text-red-100">Revizyonu yetersiz bul ve reddet</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Approved → Passive */}
                {job.status_id === 3 && (
                  <button
                    onClick={() => {
                      captureScroll();
                      handleStatusChange(4);
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gradient-to-br from-gray-500 to-slate-600 text-white p-5 rounded-xl hover:from-gray-600 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Pasif Yap</div>
                        <div className="text-sm text-gray-100">İlanı yayından kaldır</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Passive → Approved */}
                {job.status_id === 4 && (
                  <button
                    onClick={() => {
                      captureScroll();
                      handleStatusChange(3);
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Yayına Al</div>
                        <div className="text-sm text-green-100">İlanı tekrar aktif et</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Rejected → Pending Approval (Tekrar gözden geçirme) */}
                {job.status_id === 5 && (
                  <button
                    onClick={() => handleStatusChange(1)}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Hourglass className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Tekrar İncele</div>
                        <div className="text-sm text-blue-100">İlanı yeniden onay sürecine al</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Generic Status Change Button - Manual Status Selection */}
                <button
                  onClick={() => {
                    setShowEditModal(true);
                  }}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left group border-2 border-indigo-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Manuel Durum Değiştir</div>
                      <div className="text-sm text-indigo-100">Tüm durumları görüntüle</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Revizyon Notu Bilgisi */}
            {isNeedsRevision && job?.revision_note && (
              <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Revizyon Notu
                    </h4>
                    <p className="text-orange-800 whitespace-pre-wrap leading-relaxed">{job.revision_note}</p>
                    {revisionCount > 0 && (
                      <p className="text-sm text-orange-600 mt-2 font-medium">
                        🔄 Revizyon Sayısı: {revisionCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job History Timeline */}
          {history.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsHistoryOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="text-lg font-semibold text-gray-900">İlan Geçmişi</div>
                    <div className="text-sm text-gray-500">Toplam {history.length} kayıt</div>
                  </div>
                </div>
                {isHistoryOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {isHistoryOpen && (
                <div className="px-6 pb-6 pt-2">
                  <div className="space-y-4">
                    {history.map((entry, index) => (
                      <div key={entry.id || `${entry.changed_at}-${index}`} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-400'}`} />
                          {index < history.length - 1 && <div className="w-0.5 h-full bg-gray-300 mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {getTurkishStatusName(entry.old_status_name) || 'Başlangıç'} → {getTurkishStatusName(entry.new_status_name)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(entry.changed_at || entry.created_at || entry.updated_at || entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {entry.changed_by_role === 'admin' ? 'Admin' : 'Hastane'} tarafından değiştirildi
                          </p>
                          {entry.note && (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 mt-2">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <ModalContainer
            isOpen={showApprovalModal}
            onClose={closeApprovalModal}
            title="İlanı Onayla"
            size="medium"
            align="center"
            maxHeight="85vh"
            backdropClassName="bg-black/40 backdrop-blur-sm"
          >
            <div className="space-y-6">
              <section className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/70 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-2">
                      İlanı onaylamak üzeresiniz
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "{job.title}" ilanı onaylandığında yayına alınır ve doktorlar tarafından görüntülenebilir.
                    </p>
                  </div>
                </div>
              </section>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeApprovalModal}
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleApproveJob}
                  disabled={approveJobMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  {approveJobMutation.isPending ? 'Onaylanıyor...' : 'Onayla'}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}

        {/* Revision Modal */}
        {showRevisionModal && (
          <ModalContainer
            isOpen={showRevisionModal}
            onClose={closeRevisionModal}
            title={job?.status_id === 2 ? 'Revizyon Notu' : 'Revizyon Talep Et'}
            size="large"
            align="center"
            maxHeight="85vh"
            backdropClassName="bg-black/40 backdrop-blur-sm"
          >
            <div className="space-y-6">
              {job?.status_id === 2 ? (
                <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/70 border border-amber-200 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 mb-2">Revizyon Notu</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {job.revision_note}
                      </p>
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  <section className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/70 border border-orange-200 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900 mb-2">
                          Revizyon talep etmek üzeresiniz
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          "{job.title}" ilanı için açıklayıcı bir revizyon notu girin.
                        </p>
                      </div>
                    </div>
                  </section>
                  <textarea
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="Revizyon notunu buraya yazın... (En az 10 karakter)"
                    className="w-full min-h-[150px] px-4 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 border-2 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm resize-none"
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className={revisionNote.trim().length < 10 ? 'text-red-600' : 'text-gray-500'}>
                      {revisionNote.trim().length < 10 
                        ? `En az ${10 - revisionNote.trim().length} karakter daha gerekli` 
                        : `${revisionNote.trim().length}/1000 karakter`}
                    </span>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={closeRevisionModal}
                      className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleRequestRevision}
                      disabled={requestRevisionMutation.isPending || revisionNote.trim().length < 10}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requestRevisionMutation.isPending ? 'Gönderiliyor...' : 'Revizyon İste'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </ModalContainer>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <ModalContainer
            isOpen={showRejectModal}
            onClose={closeRejectModal}
            title="İlanı Reddet"
            size="medium"
            align="center"
            maxHeight="85vh"
            backdropClassName="bg-black/40 backdrop-blur-sm"
          >
            <div className="space-y-6">
              <section className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/70 border border-rose-200 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-2">
                      "{job.title}" ilanını reddetmek üzeresiniz
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Bu işlem geri alınamaz. Gerekirse reddetme sebebini paylaşın.
                    </p>
                  </div>
                </div>
              </section>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Red Sebebi (Opsiyonel)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Red sebebini buraya yazın... (En az 5 karakter)"
                  className="w-full min-h-[100px] px-4 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 border-2 border-rose-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-sm resize-none"
                  maxLength={500}
                />
                {rejectionReason.trim() && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className={rejectionReason.trim().length < 5 ? 'text-red-600' : 'text-gray-500'}>
                      {rejectionReason.trim().length < 5 
                        ? `En az ${5 - rejectionReason.trim().length} karakter daha gerekli` 
                        : `${rejectionReason.trim().length}/500 karakter`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeRejectModal}
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                >
                  İptal
                </button>
                <button
                  onClick={handleRejectJob}
                  disabled={rejectJobMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50"
                >
                  {rejectJobMutation.isPending ? 'Reddediliyor...' : 'Reddet'}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}

    {isDeleteModalOpen && (
      <ModalContainer
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="İlanı Sil"
        size="small"
        maxHeight="80vh"
        align="center"
        backdropClassName="bg-black/40 backdrop-blur-sm"
      >
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-white/70 border border-rose-200 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 mb-2">
                  "{job.title}" ilanını kalıcı olarak silmek üzeresiniz
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Bu işlem geri alınamaz ve ilgili başvuruları etkileyebilir.
                </p>
              </div>
            </div>
          </section>
          <div className="flex justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
            >
              Vazgeç
            </button>
            <button
              onClick={confirmDeleteJob}
              disabled={deleteJobMutation.isPending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteJobMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </ModalContainer>
    )}

        {/* Status Change Modal - Manuel durum değişikliği için not alanı */}
        {showStatusChangeModal && selectedStatusId && (
          <ModalContainer
            isOpen={showStatusChangeModal}
            onClose={closeStatusChangeModal}
            title="Durum Değişikliği"
            size="medium"
            align="center"
            maxHeight="85vh"
            backdropClassName="bg-black/40 backdrop-blur-sm"
          >
            <div className="space-y-6">
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/70 border border-blue-200 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-2">
                      Yeni Durum: {statusOptions.find(s => s.id === selectedStatusId)?.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      Mevcut durum: {getTurkishStatusName(job?.status)}
                    </p>
                  </div>
                </div>
              </section>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Değişiklik Notu (Opsiyonel)
                </label>
                <textarea
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="Durum değişikliği için bir not ekleyin..."
                  className="w-full min-h-[100px] px-4 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none"
                  maxLength={500}
                />
                {statusChangeReason.trim() && (
                  <div className="flex items-center justify-between text-sm mt-1 text-gray-500">
                    <span>
                      {statusChangeReason.trim().length}/500 karakter
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeStatusChangeModal}
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                >
                  İptal
                </button>
                <button
                  onClick={async () => {
                    const reason = statusChangeReason.trim() || null;
                    captureScroll();
                    await handleStatusChange(selectedStatusId, reason);
                    closeStatusChangeModal();
                    showToast.success(toastMessages.job.statusUpdateSuccessGeneric);
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateStatusMutation.isPending ? 'Güncelleniyor...' : 'Durumu Değiştir'}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}

        {/* Edit Modal */}
        <EditModal />

        {showJobEditModal && (
          <ModalContainer
            isOpen={showJobEditModal}
            onClose={closeJobEditModal}
            title="İlan İçeriğini Düzenle"
            size="large"
            align="center"
            maxHeight="90vh"
            backdropClassName="bg-black/40 backdrop-blur-sm"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">İlan Başlığı</label>
                  <input
                    type="text"
                    value={jobFormData.title}
                    onChange={(e) => handleJobInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Uzmanlık Alanı</label>
                  <select
                    value={jobFormData.specialty_id}
                    onChange={(e) => handleJobInputChange('specialty_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Uzmanlık seçin</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Yan Dal</label>
                  <select
                    value={jobFormData.subspecialty_id}
                    onChange={(e) => handleJobInputChange('subspecialty_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={!jobFormData.specialty_id}
                  >
                    <option value="">Yan dal (opsiyonel)</option>
                    {subspecialties
                      .filter((sub) => sub.specialty_id === parseInt(jobFormData.specialty_id, 10))
                      .map((sub) => (
                        <option key={sub.value} value={sub.value}>{sub.label}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Şehir</label>
                  <select
                    value={jobFormData.city_id}
                    onChange={(e) => handleJobInputChange('city_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Şehir seçin</option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">İstihdam Türü</label>
                  <select
                    value={jobFormData.employment_type}
                    onChange={(e) => handleJobInputChange('employment_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">İstihdam türü seçin</option>
                    <option value="Tam Zamanlı">Tam Zamanlı</option>
                    <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                    <option value="Nöbet Usulü">Nöbet Usulü</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Minimum Deneyim (Yıl)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={jobFormData.min_experience_years}
                    onChange={(e) => handleJobInputChange('min_experience_years', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Opsiyonel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">İş Tanımı</label>
                  <textarea
                    value={jobFormData.description}
                    onChange={(e) => handleJobInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeJobEditModal}
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                  disabled={updateJobMutation.isPending}
                >
                  İptal
                </button>
                <button
                  onClick={handleJobEditSubmit}
                  disabled={updateJobMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  {updateJobMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}
      </div>
    </div>
  );
};

export default AdminJobDetailPage;
