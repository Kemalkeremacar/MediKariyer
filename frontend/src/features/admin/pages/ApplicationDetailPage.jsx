/**
 * Admin Application Detail Page (Yeniden Tasarım)
 * - Başvuru, Hastane ve Doktor detayları sekmeli yapı
 * - Sağ kolon: durum güncelleme aksiyonları
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, User, Calendar, ArrowLeft, CheckCircle, XCircle,
  Clock, Briefcase, Eye, AlertCircle, RefreshCw, MessageSquare,
  Mail, Phone, MapPin, Building, ExternalLink
} from 'lucide-react';
import { useApplicationById, useUpdateApplicationStatus } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const AdminApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('application');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const { data: applicationData, isLoading, error, refetch } = useApplicationById(id);
  const updateStatusMutation = useUpdateApplicationStatus();

  // Hook bu sayfada axios response döndürüyor (data sarmalı var). Güçlü normalizasyon:
  const rawApplication = (
    applicationData?.data?.data?.application ||
    applicationData?.data?.application ||
    applicationData?.data ||
    {}
  );

  // Farklı response şekillerini tek modele normalize et
  const application = (() => {
    const a = rawApplication || {};
    const get = (...keys) => keys.find((k) => k !== undefined && k !== null && k !== '') ?? undefined;

    const id = a.id || a.application_id || a.app_id;
    const appliedAt = a.applied_at || a.created_at || a.appliedAt || a.createdAt;
    const status = a.status_id || a.statusId || a.status;

    const jobId = a.job_id || a.jobId || a.job?.id;
    const jobTitle = get(a.job_title, a.jobTitle, a.job?.title, 'Belirtilmemiş');

    // Hastane alanları birkaç farklı yerden gelebilir
    const hospitalName = get(
      a.hospital_name,
      a.hospital,
      a.hospital_profile?.institution_name,
      a.hospitalProfile?.institution_name,
      a.job?.hospital_name,
      a.job?.hospital?.institution_name
    );
    const hospitalCity = get(
      a.city_name,
      a.city,
      a.hospital_city,
      a.hospital_profile?.city,
      a.hospitalProfile?.city,
      a.job?.city_name
    );
    const hospitalEmail = get(
      a.hospital_email,
      a.hospital_profile?.email,
      a.hospitalProfile?.email
    );
    const hospitalPhone = get(
      a.hospital_phone,
      a.hospital_profile?.phone,
      a.hospitalProfile?.phone
    );

    // Doktor alanları
    const doctorFirstName = get(
      a.first_name,
      a.firstName,
      a.doctor_first_name,
      a.user?.profile?.first_name
    );
    const doctorLastName = get(
      a.last_name,
      a.lastName,
      a.doctor_last_name,
      a.user?.profile?.last_name
    );
    const doctorEmail = get(a.email, a.doctor_email, a.user?.email);
    const userId = a.user_id || a.userId || a.user?.id;

    return {
      id,
      applied_at: appliedAt,
      status_id: status,
      job_id: jobId,
      job_title: jobTitle,
      hospital_name: hospitalName,
      city_name: hospitalCity,
      hospital_email: hospitalEmail,
      hospital_phone: hospitalPhone,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
      user_id: userId,
      cover_letter: a.cover_letter || a.coverLetter,
      notes: a.notes,
    };
  })();

  const getStatusConfig = (status) => {
    const statusConfig = {
      1: { key: 1, text: 'Başvuruldu', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      2: { key: 2, text: 'İnceleniyor', icon: Eye, color: 'bg-purple-100 text-purple-800 border-purple-200' },
      3: { key: 3, text: 'Kabul Edildi', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
      4: { key: 4, text: 'Reddedildi', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
      5: { key: 5, text: 'Geri Çekildi', icon: ArrowLeft, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    if (typeof status === 'number') return statusConfig[status] || statusConfig[1];
    // String fallback
    const map = { 'Başvuruldu': 1, 'İnceleniyor': 2, 'Kabul Edildi': 3, 'Reddedildi': 4, 'Geri Çekildi': 5 };
    return statusConfig[map[status]] || statusConfig[1];
  };

  const handleStatusUpdate = async (statusId) => {
    const statusCfg = getStatusConfig(statusId);
    const confirmed = await showToast.confirm(
      'Başvuru Durumu Güncelle',
      `Başvuru durumunu "${statusCfg.text}" olarak değiştirmek istiyor musunuz?`,
      { confirmText: 'Güncelle', cancelText: 'İptal', type: 'warning' }
    );
    if (!confirmed) return;
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({ applicationId: id, status_id: statusId, notes: notes || 'Admin tarafından güncellendi' });
      showToast.success('Başvuru durumu güncellendi');
      setNotes('');
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const cfg = getStatusConfig(status);
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border gap-2 ${cfg.color}`}>
        <Icon className="w-4 h-4" />
        {cfg.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-lg mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonLoader className="h-96 bg-gray-200 rounded-xl" />
            </div>
            <div>
              <SkeletonLoader className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!application?.id && !application?.application_id)) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Başvuru Bulunamadı</h2>
              <p className="text-gray-600 mb-6">Aradığınız başvuru bulunamadı veya silinmiş olabilir.</p>
              <button
                onClick={() => navigate('/admin/applications')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Başvuru Listesine Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusCfg = getStatusConfig(application.status_id || application.status);

  return (
    <div className="min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/applications')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-indigo-600" />
                  Başvuru Detayı #{application.id}
                </h1>
                <p className="text-gray-600 mt-2">Başvuru detaylarını görüntüleyin ve durumunu güncelleyin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => refetch()} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </button>
              <StatusBadge status={application.status_id || application.status} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Tabs */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'application', name: 'Başvuru', icon: FileText },
                  { id: 'hospital', name: 'Hastane', icon: Building },
                  { id: 'doctor', name: 'Doktor', icon: User }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'application' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Başvuru Tarihi */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Başvuru Tarihi</p>
                        <p className="text-lg font-semibold text-gray-900">{application.applied_at ? new Date(application.applied_at).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
                      </div>
                    </div>
                    {/* İlan Bilgisi */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">İş İlanı</p>
                        <button
                          onClick={() => {
                            const digits = String(application.job_id || '').match(/\d+/);
                            if (digits) navigate(`/admin/jobs/${digits[0]}`);
                          }}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          {application.job_title || 'Belirtilmemiş'}
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ön Yazı */}
                  {application.cover_letter && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Ön Yazı
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{application.cover_letter}</p>
                    </div>
                  )}

                  {/* Notlar */}
                  {application.notes && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Notlar
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{application.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'hospital' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hastane</p>
                        <p className="text-lg font-semibold text-gray-900">{application.hospital_name || application.hospital || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Şehir</p>
                        <p className="text-lg font-semibold text-gray-900">{application.city_name || application.city || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    {application.hospital_email && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Mail className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">E-posta</p>
                          <p className="text-lg font-semibold text-gray-900">{application.hospital_email}</p>
                        </div>
                      </div>
                    )}
                    {application.hospital_phone && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Telefon</p>
                          <p className="text-lg font-semibold text-gray-900">{application.hospital_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'doctor' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ad Soyad</p>
                        <p className="text-lg font-semibold text-gray-900">{[application.first_name, application.last_name].filter(Boolean).join(' ') || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">E-posta</p>
                        <p className="text-lg font-semibold text-gray-900">{application.email || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/admin/users/${application.user_id}`)}
                      disabled={!application.user_id}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${application.user_id ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Doktor Profilini Görüntüle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Status Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Durum Yönetimi</h3>
              <div className="space-y-3">
                <button
                  className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleStatusUpdate(2)}
                  disabled={isUpdating}
                >
                  <Eye className="w-4 h-4" />
                  İnceleme Altına Al
                </button>
                <button
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleStatusUpdate(3)}
                  disabled={isUpdating}
                >
                  <CheckCircle className="w-4 h-4" />
                  Kabul Et
                </button>
                <button
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleStatusUpdate(4)}
                  disabled={isUpdating}
                >
                  <XCircle className="w-4 h-4" />
                  Reddet
                </button>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Not Ekle (Opsiyonel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Başvuru hakkında not ekleyin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetailPage;
