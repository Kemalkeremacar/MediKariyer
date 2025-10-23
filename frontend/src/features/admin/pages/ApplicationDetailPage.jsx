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
  Activity, Mail, Phone, MapPin, Target, ExternalLink
} from 'lucide-react';
import { useApplicationById, useUpdateApplicationStatus } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

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
    
    const statusColors = {
      'Başvuruldu': 'bg-blue-100 text-blue-800 border-blue-200',
      'İnceleniyor': 'bg-purple-100 text-purple-800 border-purple-200',
      'Kabul Edildi': 'bg-green-100 text-green-800 border-green-200',
      'Reddedildi': 'bg-red-100 text-red-800 border-red-200',
      'Geri Çekildi': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border gap-2 ${statusColors[config.text] || statusColors['Başvuruldu']}`}>
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

  if (error || !application) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
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

  const statusConfig = getStatusConfig(application.status_id || application.status);
  const timelineSteps = getTimelineSteps();

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
                <p className="text-gray-600 mt-2">
                  Başvuru detaylarını görüntüleyin ve durumunu güncelleyin
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </button>
              <StatusBadge status={application.status_id || application.status} />
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Başvuru Durumu Güncelle
          </h3>
          <div className="flex items-center justify-between mb-6">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      step.isActive 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : step.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-sm font-medium mt-3 ${
                      step.isActive ? 'text-blue-600' : step.isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                      step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Status Update Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleStatusUpdate(1)}
              disabled={isUpdating || (application.status_id || application.status) === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (application.status_id || application.status) === 1
                  ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Clock className="w-4 h-4 mr-2 inline" />
              Başvuruldu
            </button>
            <button
              onClick={() => handleStatusUpdate(2)}
              disabled={isUpdating || (application.status_id || application.status) === 2}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (application.status_id || application.status) === 2
                  ? 'bg-purple-100 text-purple-600 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              İnceleniyor
            </button>
            <button
              onClick={() => handleStatusUpdate(3)}
              disabled={isUpdating || (application.status_id || application.status) === 3}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (application.status_id || application.status) === 3
                  ? 'bg-green-100 text-green-600 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2 inline" />
              Kabul Edildi
            </button>
            <button
              onClick={() => handleStatusUpdate(4)}
              disabled={isUpdating || (application.status_id || application.status) === 4}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (application.status_id || application.status) === 4
                  ? 'bg-red-100 text-red-600 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <XCircle className="w-4 h-4 mr-2 inline" />
              Reddedildi
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Details */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
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
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Application Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        Başvuru Özeti
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Başvuru Tarihi</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {application.applied_at ? new Date(application.applied_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">İş İlanı</p>
                            <button
                              onClick={() => navigate(`/admin/jobs/${application.job_id}`)}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                            >
                              {application.job_title || 'Belirtilmemiş'}
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Ön Yazı
                          </h3>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{application.cover_letter}</p>
                          </div>
                        </div>
                      )}

                      {application.notes && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Notlar
                          </h3>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{application.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'doctor' && (
                  <div className="space-y-6">
                    {/* Doctor Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-indigo-600" />
                        Doktor Bilgileri
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Ad Soyad</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {application.first_name} {application.last_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">E-posta</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {application.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={() => navigate(`/admin/users/${application.user_id}`)}
                          disabled={!application.user_id}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            application.user_id 
                              ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Doktor Profilini Görüntüle
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Status Management */}
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
              
              {/* Notes Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not Ekle (Opsiyonel)
                </label>
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
