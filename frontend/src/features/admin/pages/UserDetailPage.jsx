/**
 * UserDetailPage - Kullanıcı detay sayfası
 * Backend: getUserById (/admin/users/:id)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Globe,
  Calendar,
  MapPin,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Save,
  X,
  Shield,
  Clock,
  Activity,
  FileText,
  Eye,
  UserCheck,
  UserX,
  MoreVertical,
  Download,
  History,
  GraduationCap,
  Mail,
  Briefcase,
  Award,
  Languages
} from 'lucide-react';
import { useUserById, useUpdateUserStatus, useUpdateUserApproval, useDeleteUser } from '../api/useAdmin';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: user, isLoading, error, refetch } = useUserById(id);
  
  // Debug logging - removed for production
  const updateUserStatus = useUpdateUserStatus();
  const updateUserApproval = useUpdateUserApproval();
  const deleteUser = useDeleteUser();

  // Fotoğraf onay fonksiyonu kaldırıldı
  // İlk kayıt: Admin kullanıcıyı onaylarken fotoğrafı görür, uygunsuzsa kullanıcıyı reddeder
  // Fotoğraf değişikliği: /admin/photo-approvals sayfasından onaylanır

  const handleStatusChange = (field, value) => {
    const isMutating = updateUserStatus.isPending || updateUserApproval.isPending;
    if (isMutating) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }
    
    if (field === 'is_approved') {
      updateUserApproval.mutate(
        { userId: id, approved: value, reason: 'Admin tarafından güncellendi' },
        {
          onSuccess: () => {
            showToast.success(value ? 'Kullanıcı onaylandı' : 'Kullanıcı onayı kaldırıldı');
            refetch();
          },
          onError: (error) => {
            showToast.error(error.response?.data?.message || 'Onay durumu güncellenirken hata oluştu');
          }
        }
      );
    } else {
      updateUserStatus.mutate(
        { userId: id, field, value, reason: 'Admin tarafından güncellendi' },
        {
          onSuccess: () => {
            showToast.success(value ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi');
            refetch();
          },
          onError: (error) => {
            showToast.error(error.response?.data?.message || 'Durum güncellenirken hata oluştu');
          }
        }
      );
    }
  };

  const handleDeleteUser = () => {
    const isMutating = updateUserStatus.isPending || updateUserApproval.isPending || deleteUser.isPending;
    if (isMutating) {
      showToast.warning('İşlem devam ediyor, lütfen bekleyin...');
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    
    deleteUser.mutate(id, {
      onSuccess: () => {
        showToast.success(`${user?.data?.user?.email || user?.email} kullanıcısı silindi`);
        navigate('/admin/users');
      },
      onError: (error) => {
        console.error('Silme hatası:', error);
        showToast.error(`Kullanıcı silinirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      }
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      doctor: 'bg-blue-100 text-blue-800',
      hospital: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role === 'admin' ? 'Admin' : role === 'doctor' ? 'Doktor' : 'Hastane'}
      </span>
    );
  };

  const getStatusBadge = (isApproved, isActive) => {
    if (!isActive) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Pasif</span>;
    }
    if (!isApproved) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Onay Bekliyor</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Aktif</span>;
  };

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div className="p-6 text-red-500">Hata oluştu: {error.message}</div>;
  if (!user) return <div className="p-6 text-gray-500">Kullanıcı bulunamadı</div>;

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/users')}
              className="admin-btn admin-btn-outline flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kullanıcı Listesine Dön
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Profil Fotoğrafı - Doktorlar için gerçek fotoğraf, diğerleri için icon */}
                  {(user.data?.user?.role || user.role) === 'doctor' && (user.data?.user?.profile?.profile_photo || user.profile?.profile_photo) ? (
                    <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 border-4 border-indigo-100 shadow-xl flex-shrink-0">
                      <img 
                        src={user.data?.user?.profile?.profile_photo || user.profile?.profile_photo} 
                        alt="Profil" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.data?.user?.profile?.first_name && user.data?.user?.profile?.last_name 
                        ? `${user.data.user.profile.first_name} ${user.data.user.profile.last_name}`
                        : user.data?.user?.profile?.institution_name || user.data?.user?.profile?.name || 'Kullanıcı'}
                    </h1>
                    <p className="text-gray-600">{user.data?.user?.email || user.email}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      {getRoleBadge(user.data?.user?.role || user.role)}
                      {getStatusBadge(user.data?.user?.is_approved || user.is_approved, user.data?.user?.is_active || user.is_active)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {!(user.data?.user?.is_approved || user.is_approved) ? (
                    <button
                      onClick={() => handleStatusChange('is_approved', true)}
                      disabled={updateUserApproval.isPending}
                      className="admin-btn admin-btn-success flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Onayla</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('is_approved', false)}
                      disabled={updateUserApproval.isPending}
                      className="admin-btn admin-btn-warning flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Onayı Kaldır</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleStatusChange('is_active', !(user.data?.user?.is_active || user.is_active))}
                    disabled={updateUserStatus.isPending}
                    className={`admin-btn ${(user.data?.user?.is_active || user.is_active) ? 'admin-btn-danger' : 'admin-btn-success'} flex items-center space-x-2`}
                  >
                    {(user.data?.user?.is_active || user.is_active) ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    <span>{(user.data?.user?.is_active || user.is_active) ? 'Pasifleştir' : 'Aktifleştir'}</span>
                  </button>
                  
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleteUser.isPending}
                    className="admin-btn admin-btn-danger flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: Eye },
                  { id: 'profile', label: 'Profil Detayları', icon: User },
                  { id: 'activity', label: 'Aktivite', icon: Activity }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">E-posta</p>
                            <p className="font-medium text-gray-900">{user.data?.user?.email || user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                            <p className="font-medium text-gray-900">
                              {new Date(user.data?.user?.created_at || user.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Durum Bilgileri</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Onay Durumu</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            (user.data?.user?.is_approved || user.is_approved) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(user.data?.user?.is_approved || user.is_approved) ? 'Onaylandı' : 'Onay Bekliyor'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Aktivite Durumu</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            (user.data?.user?.is_active || user.is_active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {(user.data?.user?.is_active || user.is_active) ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (user.data?.user?.profile || user.profile) && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {(user.data?.user?.role || user.role) === 'doctor' ? 'Doktor Profil Bilgileri' : 
                     (user.data?.user?.role || user.role) === 'hospital' ? 'Hastane Profil Bilgileri' : 'Profil Bilgileri'}
                  </h3>
                  
                  {/* Temel Bilgiler Kartı */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-indigo-600" />
                      Temel Bilgiler
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(user.data?.user?.role || user.role) === 'doctor' && (
                        <>
                          {/* Ad Soyad - Her zaman göster */}
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Ad Soyad</p>
                              <p className="font-semibold text-gray-900">
                                {(user.data?.user?.profile?.title || user.profile?.title || 'Dr.')} {user.data?.user?.profile?.first_name || user.profile?.first_name || '-'} {user.data?.user?.profile?.last_name || user.profile?.last_name || '-'}
                              </p>
                            </div>
                          </div>
                          
                          {/* E-posta - Her zaman göster */}
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">E-posta</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.email || user.email || '-'}</p>
                            </div>
                          </div>
                          
                          {/* Branş */}
                          <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Branş</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.specialty_name || user.profile?.specialty_name || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* Yan Dal */}
                          {(user.data?.user?.profile?.subspecialty_name || user.profile?.subspecialty_name) && (
                            <div className="flex items-start gap-3">
                              <Briefcase className="h-5 w-5 text-indigo-600 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Yan Dal</p>
                                <p className="font-semibold text-gray-900">{user.data?.user?.profile?.subspecialty_name || user.profile?.subspecialty_name}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Telefon */}
                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Telefon</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.phone || user.profile?.phone || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* Doğum Tarihi */}
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Doğum Tarihi</p>
                              <p className="font-semibold text-gray-900">
                                {(user.data?.user?.profile?.dob || user.profile?.dob) 
                                  ? new Date(user.data?.user?.profile?.dob || user.profile?.dob).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
                                  : 'Belirtilmemiş'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Doğum Yeri */}
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Doğum Yeri</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.birth_place || user.profile?.birth_place || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* İkamet Yeri */}
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">İkamet Şehri</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.residence_city || user.profile?.residence_city || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                        </>
                      )}
                    
                      {(user.data?.user?.role || user.role) === 'hospital' && (
                        <>
                          {/* Hastane Adı */}
                          <div className="flex items-start gap-3">
                            <Building className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Hastane Adı</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.name || user.profile?.name || '-'}</p>
                            </div>
                          </div>
                          
                          {/* E-posta */}
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">E-posta</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.email || user.email || '-'}</p>
                            </div>
                          </div>
                          
                          {/* Hastane Türü */}
                          <div className="flex items-start gap-3">
                            <Building className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Hastane Türü</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.type || user.profile?.type || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* Şehir */}
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Şehir</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.city || user.profile?.city || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* Adres */}
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Adres</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.address || user.profile?.address || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* Telefon */}
                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Telefon</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.phone || user.profile?.phone || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          {/* Website */}
                          <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Website</p>
                              <p className="font-semibold text-gray-900">{user.data?.user?.profile?.website || user.profile?.website || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Doktor için ek bilgiler */}
                  {(user.data?.user?.role || user.role) === 'doctor' && (
                    <>
                      {/* Eğitim Bilgileri */}
                      {(user.data?.user?.profile?.educations?.length > 0 || user.profile?.educations?.length > 0) && (
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                            Eğitim Bilgileri
                          </h4>
                          <div className="space-y-3">
                            {(user.data?.user?.profile?.educations || user.profile?.educations || []).map((education, index) => (
                              <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-indigo-100 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-lg">{education.institution_name}</p>
                                    <p className="text-sm text-gray-700 mt-1">
                                      <span className="font-medium">{education.education_type_name || education.degree_type || 'Derece'}</span>
                                      {education.field && <span> • {education.field}</span>}
                                    </p>
                                    {education.graduation_year && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        Mezuniyet: {education.graduation_year}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Deneyim Bilgileri */}
                      {(user.data?.user?.profile?.experiences?.length > 0 || user.profile?.experiences?.length > 0) && (
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                            Mesleki Deneyimler
                          </h4>
                          <div className="space-y-3">
                            {(user.data?.user?.profile?.experiences || user.profile?.experiences || []).map((experience, index) => (
                              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <Briefcase className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-lg">{experience.organization}</p>
                                    <div className="mt-2 space-y-1">
                                      {experience.role_title && (
                                        <p className="text-sm text-gray-700">
                                          <span className="font-medium text-green-700">Pozisyon:</span> {experience.role_title}
                                        </p>
                                      )}
                                      {experience.specialty_name && (
                                        <p className="text-sm text-gray-700">
                                          <span className="font-medium text-green-700">Uzmanlık:</span> {experience.specialty_name}
                                        </p>
                                      )}
                                      {experience.subspecialty_name && (
                                        <p className="text-sm text-gray-700">
                                          <span className="font-medium text-green-700">Yan Dal:</span> {experience.subspecialty_name}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-600 mt-2">
                                        {experience.start_date ? new Date(experience.start_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : 'Başlangıç tarihi belirtilmemiş'}
                                        {' - '}
                                        {experience.is_current ? (
                                          <span className="text-green-600 font-medium">Halen Çalışıyor</span>
                                        ) : experience.end_date ? (
                                          new Date(experience.end_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
                                        ) : (
                                          'Bitiş tarihi belirtilmemiş'
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Sertifika Bilgileri */}
                      {(user.data?.user?.profile?.certificates?.length > 0 || user.profile?.certificates?.length > 0) && (
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <Award className="h-5 w-5 mr-2 text-amber-600" />
                            Sertifika ve Kurslar
                          </h4>
                          <div className="space-y-3">
                            {(user.data?.user?.profile?.certificates || user.profile?.certificates || []).map((certificate, index) => (
                              <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-amber-100 rounded-lg">
                                    <Award className="h-5 w-5 text-amber-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-lg">
                                      {certificate.custom_name || certificate.certificate_type_name || 'Sertifika'}
                                    </p>
                                    {certificate.issued_at && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        Alınış Tarihi: {new Date(certificate.issued_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Dil Bilgileri */}
                      {(user.data?.user?.profile?.languages?.length > 0 || user.profile?.languages?.length > 0) && (
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <Languages className="h-5 w-5 mr-2 text-purple-600" />
                            Yabancı Diller
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(user.data?.user?.profile?.languages || user.profile?.languages || []).map((language, index) => (
                              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center mb-2">
                                  <Languages className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="font-semibold text-gray-900">{language.language_name}</p>
                                <p className="text-sm text-purple-700 mt-1">{language.level_name || language.proficiency_level || 'Seviye belirtilmemiş'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Hastane için ek bilgiler */}
                  {(user.data?.user?.role || user.role) === 'hospital' && (
                    <>
                      {/* Departman Bilgileri */}
                      {(user.data?.user?.profile?.departments?.length > 0 || user.profile?.departments?.length > 0) && (
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <Building className="h-5 w-5 mr-2" />
                            Departmanlar
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(user.data?.user?.profile?.departments || user.profile?.departments || []).map((department, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="font-medium text-gray-900">{department.name}</p>
                                {department.description && (
                                  <p className="text-sm text-gray-600">{department.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* İletişim Bilgileri */}
                      {(user.data?.user?.profile?.contacts?.length > 0 || user.profile?.contacts?.length > 0) && (
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <Phone className="h-5 w-5 mr-2" />
                            İletişim Bilgileri
                          </h4>
                          <div className="space-y-3">
                            {(user.data?.user?.profile?.contacts || user.profile?.contacts || []).map((contact, index) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900">{contact.contact_type}</p>
                                    <p className="text-sm text-gray-600">{contact.contact_value}</p>
                                    {contact.description && (
                                      <p className="text-xs text-gray-500">{contact.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aktivite geçmişi yakında eklenecek</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Kullanıcıyı Sil</h3>
              </div>
              <p className="text-gray-600 mb-6">
                <strong>{user.data?.user?.email || user.email}</strong> kullanıcısını silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="admin-btn admin-btn-outline"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteUser.isPending}
                  className="admin-btn admin-btn-danger"
                >
                  {deleteUser.isPending ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default UserDetailPage;