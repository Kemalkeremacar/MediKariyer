/**
 * Admin Application Detail Page
 * 
 * Admin başvuru detay sayfası - Tüm başvuruları yönetebilir
 * Hastane ApplicationsPage'in tam yetkili versiyonu
 * 
 * Özellikler:
 * - Başvuru detaylarını görüntüleme
 * - Doktor profil detayına yönlendirme
 * - Başvuru durumunu değiştirme (Başvuruldu/İnceleniyor/Kabul/Reddet)
 * - İş ilanı bilgilerini görüntüleme
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0 - Admin Edition
 * @since 2024
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, User, Calendar, ArrowLeft, CheckCircle, XCircle, 
  Clock, Briefcase, Eye, AlertCircle, RefreshCw, MessageSquare, 
  Activity, Mail, Phone, MapPin, Target, Shield, ExternalLink
} from 'lucide-react';
import { useApplicationById, useUpdateApplicationStatus } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import TransitionWrapper from '@/components/ui/TransitionWrapper';

const AdminApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const { data: applicationData, isLoading, error, refetch } = useApplicationById(id);
  const updateStatusMutation = useUpdateApplicationStatus();
  
  const application = applicationData?.data?.application || applicationData?.data || {};

  const getStatusConfig = (status) => {
    const statusConfig = {
      // String-based
      'Başvuruldu': { color: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', text: 'Başvuruldu', icon: Clock },
      'İnceleniyor': { color: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', text: 'İnceleniyor', icon: Eye },
      'Kabul Edildi': { color: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', text: 'Kabul Edildi', icon: CheckCircle },
      'Reddedildi': { color: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', text: 'Reddedildi', icon: XCircle },
      'Geri Çekildi': { color: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', text: 'Geri Çekildi', icon: ArrowLeft },
      // Numeric
      1: { color: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', text: 'Başvuruldu', icon: Clock },
      2: { color: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', text: 'İnceleniyor', icon: Eye },
      3: { color: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', text: 'Kabul Edildi', icon: CheckCircle },
      4: { color: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', text: 'Reddedildi', icon: XCircle },
      5: { color: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', text: 'Geri Çekildi', icon: ArrowLeft }
    };
    return statusConfig[status] || statusConfig[1];
  };

  const handleStatusUpdate = async (statusId) => {
    const statusConfig = getStatusConfig(statusId);
    const confirmed = await showToast.confirm(
      'Başvuru Durumu Güncelle',
      `Başvuru durumunu "${statusConfig.text}" olarak değiştirmek istediğinizden emin misiniz?`,
      {
        confirmText: 'Güncelle',
        cancelText: 'İptal',
        type: 'warning'
      }
    );

    if (confirmed) {
      setIsUpdating(true);
      try {
        await updateStatusMutation.mutateAsync({ 
          applicationId: id,
          status_id: statusId, 
          notes: notes || 'Admin tarafından güncellendi'
        });
        showToast.success('Başvuru durumu güncellendi');
        setIsUpdating(false);
        setNotes('');
        refetch();
      } catch (error) {
        console.error('Status update error:', error);
        setIsUpdating(false);
      }
    }
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${config.color} ${config.textColor} ${config.borderColor} border gap-2`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  const getTimelineSteps = () => {
    const currentStatus = application.status_id || application.status;
    const statusValue = typeof currentStatus === 'number' ? currentStatus : 1;
    
    const steps = [
      { id: 1, name: 'Başvuruldu', icon: Clock },
      { id: 2, name: 'İnceleniyor', icon: Eye },
      { id: 3, name: 'Kabul Edildi', icon: CheckCircle },
    ];

    return steps.map((step) => {
      const isActive = step.id === statusValue;
      const isCompleted = step.id < statusValue;
      const Icon = step.icon;

      return {
        ...step,
        isActive,
        isCompleted,
        icon: Icon
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SkeletonLoader className="h-96 bg-white/10 rounded-3xl" />
              </div>
              <div>
                <SkeletonLoader className="h-64 bg-white/10 rounded-3xl" />
              </div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Başvuru Bulunamadı</h2>
              <p className="text-gray-300 mb-6">Aradığınız başvuru bulunamadı veya silinmiş olabilir.</p>
              <button 
                onClick={() => navigate('/admin/applications')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Başvuru Listesine Dön
              </button>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status_id || application.status);
  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <TransitionWrapper>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/applications')}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Admin Panel</p>
                  <h1 className="text-2xl font-bold text-white">Başvuru #{application.id}</h1>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Yenile
              </button>
              <StatusBadge status={application.status_id || application.status} />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Başvuru Süreci
            </h3>
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                        step.isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50' 
                          : step.isCompleted 
                          ? 'bg-blue-500/50 text-white' 
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className={`text-sm font-medium mt-3 ${
                        step.isActive ? 'text-blue-400' : step.isCompleted ? 'text-blue-300' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                        step.isCompleted ? 'bg-blue-500/50' : 'bg-white/10'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Başvuru Detayları', icon: Target },
                { id: 'doctor', name: 'Doktor Bilgileri', icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-400 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
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
          <div>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ana İçerik */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                      <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-6 h-6" />
                        Başvuru Özeti
                      </h2>
                      <p className="text-blue-100 mt-2">{statusConfig.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Başvuru Tarihi</p>
                            <p className="text-lg font-semibold text-white">
                              {application.applied_at ? new Date(application.applied_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Briefcase className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">İş İlanı</p>
                            <button
                              onClick={() => navigate(`/admin/jobs/${application.job_id}`)}
                              className="text-lg font-semibold text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                            >
                              {application.job_title || 'Belirtilmemiş'}
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            Ön Yazı
                          </h3>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{application.cover_letter}</p>
                          </div>
                        </div>
                      )}

                      {application.notes && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            Notlar
                          </h3>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{application.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Yan Panel */}
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                      <h3 className="text-xl font-bold text-white">Durum Yönetimi</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <button
                          className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => handleStatusUpdate(2)}
                          disabled={isUpdating}
                        >
                          <Eye className="w-4 h-4" />
                          İnceleme Altına Al
                        </button>
                        
                        <button
                          className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => handleStatusUpdate(3)}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Kabul Et
                        </button>
                        
                        <button
                          className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => handleStatusUpdate(4)}
                          disabled={isUpdating}
                        >
                          <XCircle className="w-4 h-4" />
                          Reddet
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Not Ekle (Opsiyonel)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Başvuru hakkında not ekleyin..."
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'doctor' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <User className="w-6 h-6" />
                    Doktor Bilgileri
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <User className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Ad Soyad</p>
                        <p className="text-lg font-semibold text-white">
                          {application.first_name} {application.last_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">E-posta</p>
                        <p className="text-lg font-semibold text-white">{application.email || 'Belirtilmemiş'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Phone className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Telefon</p>
                        <p className="text-lg font-semibold text-white">{application.phone || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <MapPin className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">İkamet Şehri</p>
                        <p className="text-lg font-semibold text-white">{application.residence_city || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Doktor Profil Detayı Butonu */}
                  <div className="text-center">
                    <button
                      onClick={() => navigate(`/admin/users/${application.user_id}`)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 font-medium"
                    >
                      <User className="w-5 h-5" />
                      Doktor Profil Detayına Git
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default AdminApplicationDetailPage;
