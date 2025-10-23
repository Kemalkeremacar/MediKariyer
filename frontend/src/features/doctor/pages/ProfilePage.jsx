/**
 * Doktor Profil Sayfası
 * 
 * Doktorun profil bilgilerini düzenleyebileceği sayfa
 * Üye olurken yazdığı isim soyisim otomatik dolu gelir
 * 
 * Özellikler:
 * - Kişisel bilgiler (isim, soyisim, telefon, doğum tarihi)
 * - Eğitim bilgileri (CRUD)
 * - Deneyim bilgileri (CRUD)
 * - Sertifika bilgileri (CRUD)
 * - Dil bilgileri (CRUD)
 * - Profil tamamlanma durumu
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  User, GraduationCap, Briefcase, Award, Globe,
  Plus, Edit, Trash2, Save, X, CheckCircle,
  Phone, Mail, Calendar, MapPin, Camera, Upload,
  Clock, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { 
  doctorPersonalInfoSchema,
  doctorEducationSchema,
  doctorExperienceSchema,
  doctorCertificateSchema,
  doctorLanguageSchema
} from '@config/validation.js';
import { 
  useDoctorProfile, 
  useUpdateDoctorProfile,
  useDoctorEducations,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  useDoctorExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useDoctorCertificates,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  useDoctorLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
  useDoctorProfileCompletion,
  useRequestPhotoChange,
  usePhotoRequestStatus,
  useCancelPhotoRequest
} from '../api/useDoctor.js';
import { useLookup } from '../../../hooks/useLookup';
import { showToast } from '@/utils/toastUtils';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Lookup Data Hook - Yeni yapıya göre güncellendi
  const { 
    data: lookupData,
    loading: lookupLoading,
    utils: lookupUtils
  } = useLookup();
  
  // Lookup verilerini al
  const cities = lookupData.cities || [];
  const educationTypes = lookupData.educationTypes || [];
  const languageLevels = lookupData.languageLevels || [];
  const languages = lookupData.languages || [];
  const specialties = lookupData.specialties || [];
  const allSubspecialties = lookupData.subspecialties || [];
  // certificateTypes kaldırıldı (sertifika türü elle yazılıyor)
  
  // Seçilen branşa göre yan dalları filtrele (RegisterPage mantığı)
  const filteredSubspecialties = useMemo(() => {
    if (!selectedSpecialtyId) return [];
    return allSubspecialties.filter(sub => sub.specialty_id === parseInt(selectedSpecialtyId));
  }, [selectedSpecialtyId, allSubspecialties]);
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: completionData } = useDoctorProfileCompletion();
  const updateProfileMutation = useUpdateDoctorProfile();

  // Eğitim Hooks
  const { data: educationsData, isLoading: educationsLoading } = useDoctorEducations();
  const educations = educationsData?.educations || [];
  const createEducationMutation = useCreateEducation();
  const updateEducationMutation = useUpdateEducation();
  const deleteEducationMutation = useDeleteEducation();

  // Deneyim Hooks
  const { data: experiencesData, isLoading: experiencesLoading } = useDoctorExperiences();
  const experiences = experiencesData?.experiences || [];
  const createExperienceMutation = useCreateExperience();
  const updateExperienceMutation = useUpdateExperience();
  const deleteExperienceMutation = useDeleteExperience();

  // Sertifika Hooks
  const { data: certificatesData, isLoading: certificatesLoading } = useDoctorCertificates();
  const certificates = certificatesData?.certificates || [];
  const createCertificateMutation = useCreateCertificate();
  const updateCertificateMutation = useUpdateCertificate();
  const deleteCertificateMutation = useDeleteCertificate();

  // Dil Hooks
  const { data: languagesData, isLoading: languagesLoading } = useDoctorLanguages();
  const doctorLanguages = languagesData?.languages || [];
  const createLanguageMutation = useCreateLanguage();
  const updateLanguageMutation = useUpdateLanguage();
  const deleteLanguageMutation = useDeleteLanguage();

  // Fotoğraf onay sistemi hooks
  const requestPhotoChangeMutation = useRequestPhotoChange();
  const { data: photoRequestStatus } = usePhotoRequestStatus();
  const cancelPhotoRequestMutation = useCancelPhotoRequest();

  const tabs = [
    { id: 'personal', label: 'Kişisel Bilgiler', icon: User },
    { id: 'education', label: 'Eğitim Bilgileri', icon: GraduationCap },
    { id: 'certificates', label: 'Sertifika ve Kurslar', icon: Award },
    { id: 'experience', label: 'Mesleki Deneyimleri', icon: Briefcase },
    { id: 'languages', label: 'Yabancı Dil', icon: Globe },
  ];

  const handlePersonalInfoUpdate = async (data) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      showToast.success('Kişisel bilgiler güncellendi');
    } catch (error) {
      console.error('handlePersonalInfoUpdate - Error:', error);
      showToast.error('Güncelleme başarısız');
    }
  };

  const handleAddItem = (type) => {
    setEditingItem(null);
    setFormData({ type });
    setShowForm(true);
  };

  const handleEditItem = (item, type) => {
    setEditingItem({ ...item, type });

    // Ortak normalizasyon yardımcıları
    const toDateInput = (val) => (val ? String(val).slice(0, 10) : '');
    const toStr = (val) => (val === null || val === undefined ? '' : String(val));

    let normalized = { ...item, type };

    if (type === 'education') {
      normalized = {
        ...normalized,
        education_institution: toStr(item.education_institution),
        field: toStr(item.field),
        graduation_year: item.graduation_year || '',
        education_type: item.education_type ?? ''
      };
    } else if (type === 'experience') {
      normalized = {
        ...normalized,
        organization: toStr(item.organization),
        role_title: toStr(item.role_title),
        specialty_id: item.specialty_id || '',
        subspecialty_id: item.subspecialty_id || '',
        start_date: toDateInput(item.start_date),
        end_date: item.is_current ? '' : toDateInput(item.end_date || ''),
        is_current: !!item.is_current,
        description: toStr(item.description)
      };
    } else if (type === 'certificate') {
      normalized = {
        ...normalized,
        certificate_name: toStr(item.certificate_name),
        institution: toStr(item.institution),
        certificate_year: item.certificate_year || ''
      };
    } else if (type === 'language') {
      normalized = {
        ...normalized,
        language_id: item.language_id || '',
        level_id: item.level_id || ''
      };
    }

    setFormData(normalized);

    // Eğer experience düzenliyorsak, selectedSpecialtyId'yi set et
    if (type === 'experience' && item.specialty_id) {
      setSelectedSpecialtyId(item.specialty_id);
    }
    
    setShowForm(true);
  };

  const handleDeleteItem = async (id, type) => {
    const confirmed = await showToast.confirm({
      title: "Öğeyi Sil",
      message: "Bu öğeyi silmek istediğinizden emin misiniz?",
      type: "danger",
      destructive: true,
      confirmText: "Sil",
      cancelText: "İptal",
    });
    
    if (!confirmed) return;

    try {
      switch (type) {
        case 'education':
          await deleteEducationMutation.mutateAsync(id);
          break;
        case 'experience':
          await deleteExperienceMutation.mutateAsync(id);
          break;
        case 'certificate':
          await deleteCertificateMutation.mutateAsync(id);
          break;
        case 'language':
          await deleteLanguageMutation.mutateAsync(id);
          break;
      }
      showToast.success('Öğe silindi');
    } catch (error) {
      showToast.error('Silme başarısız');
    }
  };

  const handleFormDataChange = useCallback((newData) => {
    setFormData(newData);
  }, []);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setFormData({});
    setEditingItem(null);
    setSelectedSpecialtyId(null);
  }, []);

  const handleSubmitForm = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      const type = formData.type || activeTab;
      const { type: _, ...data } = formData;
      
      // Mezuniyet yılını sayıya çevir
      if (data.graduation_year && typeof data.graduation_year === 'string') {
        data.graduation_year = parseInt(data.graduation_year);
      }
      
      // Sertifika yılını sayıya çevir
      if (data.certificate_year && typeof data.certificate_year === 'string') {
        data.certificate_year = parseInt(data.certificate_year);
      }
      
      // Education type ID'yi sayıya çevir
      if (data.education_type_id && typeof data.education_type_id === 'string') {
        data.education_type_id = parseInt(data.education_type_id);
      }

      // Specialty ID'yi sayıya çevir
      if (data.specialty_id && typeof data.specialty_id === 'string') {
        data.specialty_id = parseInt(data.specialty_id);
      }
      
      // Subspecialty ID'yi sayıya çevir
      if (data.subspecialty_id === '') {
        // Boş string gönderilmesin; null olarak kabul edelim (schema nullable)
        data.subspecialty_id = null;
      } else if (data.subspecialty_id && typeof data.subspecialty_id === 'string') {
        data.subspecialty_id = parseInt(data.subspecialty_id);
      }

      // Açıklama boş string ise null'a çevir (backend nullable)
      if (data.description === '') {
        data.description = null;
      }

      // is_current true ise end_date null
      if (data.is_current === true) {
        data.end_date = null;
      }
      
      // Language ID'yi sayıya çevir
      if (data.language_id && typeof data.language_id === 'string') {
        data.language_id = parseInt(data.language_id);
      }
      
      // Level ID'yi sayıya çevir
      if (data.level_id && typeof data.level_id === 'string') {
        data.level_id = parseInt(data.level_id);
      }
      
      // Validation based on form type
      let validatedData;
      switch (type) {
        case 'education':
          // education_type_id DİĞER değilse education_type boş string olarak gönderilsin
          if (data.education_type === null || data.education_type === undefined) {
            data.education_type = '';
          }
          validatedData = doctorEducationSchema.parse(data);
          break;
        case 'experience':
          validatedData = doctorExperienceSchema.parse(data);
          break;
        case 'certificate':
          validatedData = doctorCertificateSchema.parse(data);
          break;
        case 'language':
          validatedData = doctorLanguageSchema.parse(data);
          break;
        default:
          validatedData = data;
      }
      
      if (editingItem) {
        // Güncelleme
        switch (type) {
          case 'education':
            await updateEducationMutation.mutateAsync({ id: editingItem.id, data: validatedData });
            break;
          case 'experience':
            await updateExperienceMutation.mutateAsync({ id: editingItem.id, data: validatedData });
            break;
          case 'certificate':
            await updateCertificateMutation.mutateAsync({ id: editingItem.id, data: validatedData });
            break;
          case 'language':
            await updateLanguageMutation.mutateAsync({ id: editingItem.id, data: validatedData });
            break;
        }
        showToast.success('Güncelleme başarılı');
      } else {
        // Yeni ekleme
        switch (type) {
          case 'education':
            await createEducationMutation.mutateAsync(validatedData);
            break;
          case 'experience':
            await createExperienceMutation.mutateAsync(validatedData);
            break;
          case 'certificate':
            await createCertificateMutation.mutateAsync(validatedData);
            break;
          case 'language':
            await createLanguageMutation.mutateAsync(validatedData);
            break;
        }
        showToast.success('Ekleme başarılı');
      }
      
      setShowForm(false);
      setFormData({});
      setEditingItem(null);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Form submit error:', error);
        // Backend validation hatası - details array'i kontrol et
        const backendDetails = error.response?.data?.details;
        if (backendDetails && backendDetails.length > 0) {
          // İlk validation hatasını göster
          showToast.error(backendDetails[0].message);
        } else {
          // Genel hata mesajı
          showToast.error('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };

  if (profileLoading || lookupLoading.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="space-y-8 p-6">
          <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
          <SkeletonLoader className="h-96 bg-white/10 rounded-3xl" />
        </div>
      </div>
    );
  }

  const completionPercentage = completionData?.completion_percentage || 0;
  const missingSections = completionData?.missing_fields || [];

  // Tamamlanma durumuna göre renk belirleme
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'from-green-400 to-emerald-400';
    if (percentage >= 60) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  const getCompletionMessage = (percentage) => {
    if (percentage === 100) return 'Profiliniz tamamlandı! 🎉';
    if (percentage >= 80) return 'Neredeyse tamamlandı! 👏';
    if (percentage >= 60) return 'İyi gidiyorsunuz! 💪';
    if (percentage >= 40) return 'Devam edin! 📝';
    return 'Profilinizi tamamlayın 🚀';
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
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                    {profile?.profile?.title || 'Dr.'} {profile?.profile?.first_name || ''} {profile?.profile?.last_name || ''}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-1 text-xl">
                      Profil Düzenle
                    </span>
                  </h1>
                  <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                    Profesyonel bilgilerinizi güncelleyin ve kariyerinizi ileriye taşıyın.
                  </p>
                </div>
                
                {/* Profil Tamamlanma Kartı */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 min-w-[280px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-300">Profil Tamamlanma</div>
                      <div className={`text-2xl font-bold bg-gradient-to-r ${getCompletionColor(completionPercentage)} bg-clip-text text-transparent`}>
                        {completionPercentage}%
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getCompletionColor(completionPercentage)}`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    
                    {/* Mesaj */}
                    <div className="text-xs text-gray-300 text-center">
                      {getCompletionMessage(completionPercentage)}
                    </div>
                    
                    {/* Eksik Bölümler */}
                    {missingSections.length > 0 && completionPercentage < 100 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Eksik Bölümler:</div>
                        <div className="flex flex-wrap gap-1">
                          {missingSections.map((section, index) => {
                            const sectionNames = {
                              'education': 'Eğitim',
                              'experience': 'Deneyim',
                              'certificates': 'Sertifika',
                              'languages': 'Dil',
                              'first_name': 'Ad',
                              'last_name': 'Soyad',
                              'title': 'Ünvan',
                              'specialty_id': 'Uzmanlık',
                              'dob': 'Doğum Tarihi',
                              'phone': 'Telefon',
                              'birth_place_id': 'Doğum Yeri',
                              'residence_city_id': 'İkamet Yeri'
                            };
                            return (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30"
                              >
                                {sectionNames[section] || section}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
            <div className="border-b border-white/20">
              <nav className="flex flex-wrap gap-2 p-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-8">
            {/* Kişisel Bilgiler Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-8">
                {/* Profil Fotoğrafı Butonu - Modal Açar */}
                <ProfilePhotoButton 
                  photoRequestStatus={photoRequestStatus}
                  onOpenModal={() => setShowPhotoModal(true)}
                />
                
                {/* Profil Fotoğrafı Modal */}
                {showPhotoModal && (
                  <PhotoManagementModal
                    isOpen={showPhotoModal}
                    onClose={() => setShowPhotoModal(false)}
                    profile={profile}
                    photoRequestStatus={photoRequestStatus}
                    requestPhotoChangeMutation={requestPhotoChangeMutation}
                    onCancelPhotoRequest={async () => {
                      try {
                        await cancelPhotoRequestMutation.mutateAsync();
                        showToast.success('Fotoğraf talebi iptal edildi');
                      } catch (error) {
                        showToast.error('İptal işlemi başarısız');
                      }
                    }}
                  />
                )}
                
                {/* Kişisel Bilgiler Formu */}
              <PersonalInfoTab 
                profile={profile} 
                onUpdate={handlePersonalInfoUpdate}
                isLoading={updateProfileMutation.isPending}
                cities={cities}
              />
              </div>
            )}

            {/* Eğitim Tab */}
            {activeTab === 'education' && (
              <EducationTab
                educations={educations}
                isLoading={educationsLoading}
                onAdd={() => handleAddItem('education')}
                onEdit={(item) => handleEditItem(item, 'education')}
                onDelete={(id) => handleDeleteItem(id, 'education')}
                educationTypes={educationTypes}
              />
            )}

            {/* Deneyim Tab */}
            {activeTab === 'experience' && (
              <ExperienceTab
                experiences={experiences}
                isLoading={experiencesLoading}
                onAdd={() => handleAddItem('experience')}
                onEdit={(item) => handleEditItem(item, 'experience')}
                onDelete={(id) => handleDeleteItem(id, 'experience')}
              />
            )}

            {/* Sertifika Tab */}
            {activeTab === 'certificates' && (
              <CertificateTab
                certificates={certificates}
                isLoading={certificatesLoading}
                onAdd={() => handleAddItem('certificate')}
                onEdit={(item) => handleEditItem(item, 'certificate')}
                onDelete={(id) => handleDeleteItem(id, 'certificate')}
              />
            )}

            {/* Dil Tab */}
            {activeTab === 'languages' && (
              <LanguageTab
                languages={doctorLanguages}
                isLoading={languagesLoading}
                onAdd={() => handleAddItem('language')}
                onEdit={(item) => handleEditItem(item, 'language')}
                onDelete={(id) => handleDeleteItem(id, 'language')}
              />
            )}
          </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <FormModal
              type={formData.type || activeTab}
              data={formData}
              onChange={handleFormDataChange}
              onSubmit={handleSubmitForm}
              onClose={handleFormClose}
              isEditing={!!editingItem}
              isLoading={
                createEducationMutation.isPending ||
                updateEducationMutation.isPending ||
                createExperienceMutation.isPending ||
                updateExperienceMutation.isPending ||
                createCertificateMutation.isPending ||
                updateCertificateMutation.isPending ||
                createLanguageMutation.isPending ||
                updateLanguageMutation.isPending
              }
              educationTypes={educationTypes}
              specialties={specialties}
              filteredSubspecialties={filteredSubspecialties}
              
              languageLevels={languageLevels}
              languages={languages}
              selectedSpecialtyId={selectedSpecialtyId}
              setSelectedSpecialtyId={setSelectedSpecialtyId}
            />
          )}
        </div>
      </div>
  );
};

// Profil Fotoğrafı Modal Component
const PhotoManagementModal = ({ 
  isOpen,
  onClose,
  profile,
  photoRequestStatus,
  requestPhotoChangeMutation,
  onCancelPhotoRequest 
}) => {
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const profileData = profile?.profile;
    if (profileData?.profile_photo) {
      setPhotoPreview(profileData.profile_photo);
    }
  }, [profile]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Sadece JPEG, PNG ve WebP formatları desteklenir');
      return;
    }

    try {
    const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await requestPhotoChangeMutation.mutateAsync(reader.result);
          showToast.success('Fotoğraf yüklendi! Admin onayı bekleniyor.');
          // Dosya input'unu temizle
          e.target.value = '';
        } catch (error) {
          console.error('Photo upload error:', error);
          showToast.error('Fotoğraf yükleme başarısız: ' + (error.response?.data?.message || error.message));
        }
    };
    reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      showToast.error('Fotoğraf yükleme başarısız');
    }
  };

  // Backend response: { success: true, message: '...', data: { status: {...} } }
  // Axios interceptor wraps it: response.data = backend response
  const pendingRequest = photoRequestStatus?.data?.status || null;
  const hasPendingRequest = pendingRequest?.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profil Fotoğrafı Yönetimi</h2>
              <p className="text-xs text-blue-100">Admin onayı gerektirir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Fotoğraflar */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            {/* Mevcut Fotoğraf */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-3 border-green-400 flex items-center justify-center shadow-xl">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-green-400 font-semibold flex items-center gap-1 justify-center">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aktif
                </span>
              </div>
            </div>
            
            {/* Bekleyen Talep Fotoğrafı */}
            {hasPendingRequest && pendingRequest.file_url && (
              <>
                <div className="hidden lg:block text-gray-400">
                  <ArrowRight className="w-8 h-8 animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-3 border-yellow-400 flex items-center justify-center shadow-xl">
                    <img src={pendingRequest.file_url} alt="Bekleyen Fotoğraf" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-1 rounded-full shadow-lg animate-pulse">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-yellow-400 font-semibold flex items-center gap-1 justify-center">
                      <Clock className="w-3.5 h-3.5" />
                      Bekliyor
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Talep Durumu Kartı */}
          {pendingRequest && (
            <div className={`p-4 rounded-xl border shadow-lg ${
              pendingRequest.status === 'pending' ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10' :
              pendingRequest.status === 'approved' ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10' :
              'border-red-500/50 bg-gradient-to-br from-red-500/10 to-pink-500/10'
            }`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      {pendingRequest.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                      {pendingRequest.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {pendingRequest.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
                      Talep Durumu
                    </h4>
                    
                    {pendingRequest.status === 'pending' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-yellow-300 font-medium">
                            Admin onayı bekleniyor
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          Onaylandıktan sonra yeni fotoğrafınız otomatik olarak her yerde görünecek.
                        </p>
                      </div>
                    )}
                    
                    {pendingRequest.status === 'approved' && (
                      <div className="space-y-2">
                        <span className="text-sm text-green-300 font-medium">
                          ✓ Fotoğraf onaylandı
                        </span>
                        <p className="text-xs text-gray-300">
                          Yeni fotoğrafınız artık her yerde görünüyor.
                        </p>
                        {pendingRequest.reviewed_at && (
                          <p className="text-xs text-gray-400">
                            {new Date(pendingRequest.reviewed_at).toLocaleString('tr-TR')}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {pendingRequest.status === 'rejected' && (
                      <div className="space-y-2">
                        <span className="text-sm text-red-300 font-medium">
                          ✗ Fotoğraf reddedildi
                        </span>
                        {pendingRequest.reason && (
                          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-2">
                            <p className="text-xs text-red-200 font-semibold mb-1">Red Nedeni:</p>
                            <p className="text-xs text-red-100">{pendingRequest.reason}</p>
                          </div>
                        )}
                        {pendingRequest.reviewed_at && (
                          <p className="text-xs text-gray-400">
                            {new Date(pendingRequest.reviewed_at).toLocaleString('tr-TR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {pendingRequest.status === 'pending' && (
                    <button
                      onClick={onCancelPhotoRequest}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold border border-red-500/30"
                    >
                      <X className="w-3.5 h-3.5" />
                      İptal
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Yeni Fotoğraf Yükleme */}
          {(!hasPendingRequest || pendingRequest.status !== 'pending') && (
            <div className="border-2 border-dashed border-white/30 rounded-xl p-6 hover:border-blue-500 hover:bg-white/5 transition-all duration-300 bg-white/5">
              <label className="cursor-pointer block text-center">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-blue-400" />
                </div>
                <span className="text-base text-white font-bold block mb-2">Yeni Fotoğraf Yükle</span>
                <span className="text-xs text-gray-400 block mb-4">
                  Max 5MB • JPEG, PNG, WebP
                </span>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm">
                  <Camera className="w-4 h-4" />
                  Dosya Seç
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {hasPendingRequest && pendingRequest.status === 'pending' && (
            <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-300 font-medium">
                ⏳ Bekleyen talebiniz var. Yeni yüklemek için önce iptal edin veya onayı bekleyin.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-sm p-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-lg text-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

// Profil Fotoğrafı Butonu Component
const ProfilePhotoButton = ({ photoRequestStatus, onOpenModal }) => {
  const pendingRequest = photoRequestStatus?.data?.status || null;
  const hasPendingRequest = pendingRequest?.status === 'pending';

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/30 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Camera className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Profil Fotoğrafı</h3>
            <p className="text-sm text-gray-400 mt-1">
              {hasPendingRequest ? (
                <span className="text-yellow-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Onay bekleyen talebiniz var
                </span>
              ) : (
                'Fotoğrafınızı yönetin'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Fotoğraf Yönetimi
        </button>
      </div>
      {hasPendingRequest && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Fotoğraf değişiklik talebiniz admin onayı bekliyor. Detayları görmek için "Fotoğraf Yönetimi" butonuna tıklayın.
          </p>
        </div>
      )}
    </div>
  );
};

// Kişisel Bilgiler Tab Component
const PersonalInfoTab = ({ profile, onUpdate, isLoading, cities = [] }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: 'Dr.',
    specialty_id: '',
    subspecialty_id: '',
    dob: '',
    birth_place_id: '',
    residence_city_id: '',
    phone: '',
    email: '',
  });
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  
  // Lookup data
  const { 
    data: lookupData,
  } = useLookup();
  
  const specialties = lookupData.specialties || [];
  const allSubspecialties = lookupData.subspecialties || [];
  
  // Seçilen branşa göre yan dalları filtrele
  const filteredSubspecialties = useMemo(() => {
    if (!selectedSpecialtyId) return [];
    return allSubspecialties.filter(sub => sub.specialty_id === parseInt(selectedSpecialtyId));
  }, [selectedSpecialtyId, allSubspecialties]);

  // Profil verisi geldiğinde formData'yı güncelle - SADECE İLK YÜKLEMEDE
  const initialProfileLoaded = useRef(false);
  
  useEffect(() => {
    if (profile?.profile && !initialProfileLoaded.current) {
      const profileData = profile.profile;
      
      // Doğum tarihi formatını düzelt (ISO string'den YYYY-MM-DD'ye)
      let formattedDob = '';
      if (profileData.dob) {
        const date = new Date(profileData.dob);
        if (!isNaN(date.getTime())) {
          formattedDob = date.toISOString().split('T')[0];
        }
      }
      
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        title: profileData.title || 'Dr.',
        specialty_id: profileData.specialty_id || '',
        subspecialty_id: profileData.subspecialty_id || '',
        dob: formattedDob,
        birth_place_id: profileData.birth_place_id?.toString() || '',
        residence_city_id: profileData.residence_city_id?.toString() || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
      });
      setSelectedSpecialtyId(profileData.specialty_id || null);
      initialProfileLoaded.current = true;
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // ID'leri integer'a çevir - boş string kontrolü ekle
      const dataToValidate = {
        ...formData,
        specialty_id: formData.specialty_id ? parseInt(formData.specialty_id) : undefined,
        subspecialty_id: formData.subspecialty_id ? parseInt(formData.subspecialty_id) : null,
        birth_place_id: formData.birth_place_id && formData.birth_place_id !== '' ? parseInt(formData.birth_place_id) : null,
        residence_city_id: formData.residence_city_id && formData.residence_city_id !== '' ? parseInt(formData.residence_city_id) : null
      };
      
      // Zod validation kullan
      const validatedData = doctorPersonalInfoSchema.parse(dataToValidate);
      
      // Güncellemeyi yap ve bekle
      await onUpdate(validatedData);
      
      // NOT: Güncelleme başarılı oldu, form verisi zaten doğru
      // Cache invalidate olacak ve yeni veri gelecek ama formData'yı koruyoruz
      // useEffect çalışacak ama formData zaten güncel değerlerle dolu
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Validation error:', error);
        showToast.error('Güncelleme başarısız: ' + error.message);
      }
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-xl">
          <User className="w-6 h-6 text-green-400" />
        </div>
        Kişisel Bilgiler
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Satır 1: Ad - Soyad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Ad *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              required
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Soyad *
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
            required
          />
        </div>
        
        {/* Satır 2: Ünvan - Doğum Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Ünvan *
          </label>
          <select
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
            required
          >
            <option value="Dr." className="bg-slate-800">Dr.</option>
            <option value="Uz. Dr." className="bg-slate-800">Uz. Dr.</option>
            <option value="Dr. Öğr. Üyesi" className="bg-slate-800">Dr. Öğr. Üyesi</option>
            <option value="Doç. Dr." className="bg-slate-800">Doç. Dr.</option>
            <option value="Prof. Dr." className="bg-slate-800">Prof. Dr.</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Doğum Tarihi
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
          />
        </div>
        
        {/* Satır 3: Uzmanlık - Yan Dal Uzmanlığı */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Uzmanlık *
          </label>
          <select
            value={formData.specialty_id}
            onChange={(e) => {
              const newSpecialtyId = e.target.value;
              setFormData({ ...formData, specialty_id: newSpecialtyId, subspecialty_id: '' });
              setSelectedSpecialtyId(newSpecialtyId ? parseInt(newSpecialtyId) : null);
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
            required
          >
            <option value="" className="bg-slate-800">Uzmanlık Seçiniz</option>
            {specialties.map(specialty => (
              <option key={specialty.id} value={specialty.id} className="bg-slate-800">
                {specialty.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Yan Dal Uzmanlığı
          </label>
          <select
            value={formData.subspecialty_id}
            onChange={(e) => setFormData({ ...formData, subspecialty_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.specialty_id || filteredSubspecialties.length === 0}
          >
            <option value="" className="bg-slate-800">Yan Dal Seçiniz (Opsiyonel)</option>
            {filteredSubspecialties.map(subspecialty => (
              <option key={subspecialty.id} value={subspecialty.id} className="bg-slate-800">
                {subspecialty.name}
              </option>
            ))}
          </select>
          {formData.specialty_id && filteredSubspecialties.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Bu uzmanlık için yan dal bulunmuyor</p>
          )}
        </div>
        
        {/* Satır 4: Doğum Yeri - İkamet Yeri */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Doğum Yeri
          </label>
          <select
            value={formData.birth_place_id}
            onChange={(e) => setFormData({ ...formData, birth_place_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
          >
            <option value="" className="bg-slate-800 text-white">Şehir seçin</option>
            {cities.map(city => (
              <option key={city.value} value={city.value.toString()} className="bg-slate-800 text-white">
                {city.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            İkamet Yeri
          </label>
          <select
            value={formData.residence_city_id}
            onChange={(e) => setFormData({ ...formData, residence_city_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
          >
            <option value="" className="bg-slate-800 text-white">Şehir seçin</option>
            {cities.map(city => (
              <option key={city.value} value={city.value.toString()} className="bg-slate-800 text-white">
                {city.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Satır 5: Telefon - E-Mail */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Telefon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
            placeholder="+90 5XX XXX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            E-Mail
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-300 cursor-not-allowed backdrop-blur-sm"
            placeholder="ornek@email.com"
          />
          <p className="text-xs text-gray-400 mt-1">E-mail adresi değiştirilemez</p>
        </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Kişisel Bilgileri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

// Eğitim Tab Component
const EducationTab = ({ educations, isLoading, onAdd, onEdit, onDelete, educationTypes = [] }) => {
  if (isLoading) {
    return <SkeletonLoader className="h-64 bg-white/10 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          Eğitim Bilgileri
        </h3>
        <button
          onClick={onAdd}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Ekle
        </button>
      </div>
      <div className="space-y-4">
        {educations?.map((education) => (
          <div key={education.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-white text-lg">
                  {education.education_type_name || education.education_type || 'Eğitim'}
                </h4>
                <p className="text-gray-300 mt-1">{education.education_institution}</p>
                <p className="text-gray-400 text-sm mt-2">{education.field} • {education.graduation_year}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(education)}
                  className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(education.id)}
                  className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {educations?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-300 text-lg">Henüz eğitim bilgisi eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Deneyim Tab Component
const ExperienceTab = ({ experiences, isLoading, onAdd, onEdit, onDelete }) => {
  if (isLoading) {
    return <SkeletonLoader className="h-64 bg-white/10 rounded-2xl" />;
  }

  const [expanded, setExpanded] = React.useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR') : 'Belirtilmemiş');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-green-400" />
          Deneyim Bilgileri
        </h3>
        <button
          onClick={onAdd}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Ekle
        </button>
      </div>

      <div className="space-y-4">
        {experiences?.map((experience) => {
          const isOpen = !!expanded[experience.id];
          const header = (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                <h4 className="font-semibold text-white text-lg">{experience.role_title}</h4>
                  <span className="text-gray-300">• {experience.organization}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {experience.specialty_name && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {experience.specialty_name}
                    </span>
                  )}
                  {experience.subspecialty_name && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {experience.subspecialty_name}
                    </span>
                  )}
                </div>
                <div className="text-gray-400 text-sm mt-3 flex items-center gap-2 flex-wrap">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(experience.start_date)} - {experience.is_current ? 'Devam ediyor' : formatDate(experience.end_date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(experience)}
                  className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(experience.id)}
                  className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );

          const desc = experience.description || '';
          const short = desc.length > 180 ? `${desc.slice(0, 180)}...` : desc;

          return (
            <div key={experience.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              {header}
              {desc && (
                <div className="mt-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {isOpen ? desc : short}
                  </p>
                  {desc.length > 180 && (
                    <button onClick={() => toggle(experience.id)} className="mt-2 text-blue-300 hover:text-blue-200 text-sm font-medium">
                      {isOpen ? 'Daha az göster' : 'Devamını oku'}
                    </button>
                  )}
          </div>
              )}
            </div>
          );
        })}

        {experiences?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-300 text-lg">Henüz deneyim bilgisi eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sertifika Tab Component
const CertificateTab = ({ certificates, isLoading, onAdd, onEdit, onDelete }) => {
  if (isLoading) {
    return <SkeletonLoader className="h-64 bg-white/10 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Award className="w-6 h-6 text-yellow-400" />
          Sertifika Bilgileri
        </h3>
        <button
          onClick={onAdd}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Ekle
        </button>
      </div>
      <div className="space-y-4">
        {certificates?.map((certificate) => (
          <div key={certificate.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-white text-lg">{certificate.certificate_name || 'Sertifika'}</h4>
                </div>
                <p className="text-gray-300 mt-2">{certificate.institution}</p>
                {certificate.certificate_year && (
                  <p className="text-gray-400 text-sm mt-2">Yıl: {certificate.certificate_year}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(certificate)}
                  className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(certificate.id)}
                  className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {certificates?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-300 text-lg">Henüz sertifika bilgisi eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Dil Tab Component
const LanguageTab = ({ languages, isLoading, onAdd, onEdit, onDelete }) => {
  if (isLoading) {
    return <SkeletonLoader className="h-64 bg-white/10 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Globe className="w-6 h-6 text-purple-400" />
          Dil Bilgileri
        </h3>
        <button
          onClick={onAdd}
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Ekle
        </button>
      </div>
      <div className="space-y-4">
        {languages?.map((language) => (
          <div key={language.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-white text-lg">{language.language}</h4>
                <p className="text-gray-300 mt-1">{language.level}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(language)}
                  className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(language.id)}
                  className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {languages?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-300 text-lg">Henüz dil bilgisi eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Form Modal Component
const FormModal = ({ type, data, onChange, onSubmit, onClose, isEditing, isLoading, educationTypes = [], specialties = [], filteredSubspecialties = [], languageLevels = [], languages = [], selectedSpecialtyId, setSelectedSpecialtyId }) => {

  const getFormFields = () => {
    switch (type) {
      case 'education':
        const fields = [
          { name: 'education_type_id', label: 'Derece Türü', type: 'select', required: true, options: educationTypes },
          { name: 'education_institution', label: 'Eğitim Kurumu', type: 'text', required: true, placeholder: 'Örn: İstanbul Üniversitesi' },
          { name: 'field', label: 'Alan', type: 'text', required: true, placeholder: 'Örn: Tıp' },
          { name: 'graduation_year', label: 'Mezuniyet Yılı', type: 'number', required: true, placeholder: 'Örn: 2007', min: 1950, max: new Date().getFullYear() + 5 }
        ];

        // Eğer "DİĞER" seçilmişse derece türü alanını ekle
        const selectedEducationType = educationTypes.find(type => 
          type.value == data.education_type_id || type.id == data.education_type_id
        );
        
        if (selectedEducationType && (selectedEducationType.value === 'DİĞER' || selectedEducationType.name === 'DİĞER' || selectedEducationType.label === 'DİĞER')) {
          fields.splice(1, 0, { 
            name: 'education_type', 
            label: 'Derece Türü', 
            type: 'text', 
            required: true, 
            placeholder: 'Özel derece türünü yazın' 
          });
        }

        return fields;
      case 'experience':
        return [
          { name: 'organization', label: 'Kurum', type: 'text', required: true },
          { name: 'role_title', label: 'Ünvan', type: 'text', required: true },
          { name: 'specialty_id', label: 'Uzmanlık Alanı', type: 'select', required: true, options: specialties, onChange: (value) => {
            setSelectedSpecialtyId(value ? parseInt(value) : null);
            // Hem specialty_id'yi güncelle hem de subspecialty'yi sıfırla
            const newData = { ...data, specialty_id: value, subspecialty_id: '' };
            onChange(newData);
          }},
          { name: 'subspecialty_id', label: 'Yan Dal Uzmanlığı', type: 'select', required: false, options: filteredSubspecialties, disabled: !data.specialty_id || filteredSubspecialties.length === 0 },
          { name: 'start_date', label: 'Başlangıç Tarihi', type: 'date', required: true },
          { name: 'end_date', label: 'Bitiş Tarihi', type: 'date', required: false, disabled: data.is_current, min: data.start_date || undefined },
          { name: 'is_current', label: 'Halen Çalışıyor', type: 'checkbox', required: false },
          { name: 'description', label: 'Açıklama', type: 'textarea', required: false, placeholder: 'İş tanımı ve sorumluluklar...' },
        ];
      case 'certificate':
        return [
          { name: 'certificate_name', label: 'Sertifika Türü', type: 'text', required: true, placeholder: 'Örn: İleri Yaşam Desteği' },
          { name: 'institution', label: 'Kurum', type: 'text', required: true, placeholder: 'Örn: Türk Tabipleri Birliği' },
          { name: 'certificate_year', label: 'Sertifika Yılı', type: 'number', required: true, min: 1950, max: new Date().getFullYear(), placeholder: 'Örn: 2021' },
        ];
      case 'language':
        return [
          { name: 'language_id', label: 'Dil', type: 'select', required: true, options: languages },
          { name: 'level_id', label: 'Seviye', type: 'select', required: true, options: languageLevels },
        ];
      default:
        return [];
    }
  };

  // Her render'da hesapla (performans sorunu yok, basit switch-case)
  const fields = getFormFields();

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Düzenle' : 'Yeni Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-6 space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={data[field.name] || ''}
                  onChange={(e) => {
                    // Eğer field'ın özel onChange'i varsa onu kullan
                    if (field.onChange) {
                      field.onChange(e.target.value);
                    } else {
                      onChange({ ...data, [field.name]: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
                  required={field.required}
                  disabled={field.disabled || false}
                >
                  <option value="" className="bg-slate-800">Seçiniz</option>
                  {field.options.map((option) => (
                    <option 
                      key={option.value || option.id || option} 
                      value={option.value || option.id || option} 
                      className="bg-slate-800"
                    >
                      {option.label || option.name || option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data[field.name] || false}
                    onChange={(e) => {
                      const newData = { ...data, [field.name]: e.target.checked };
                      // Eğer "Halen Çalışıyor" checkbox'ı işaretlenirse, end_date'i temizle
                      if (field.name === 'is_current' && e.target.checked) {
                        newData.end_date = null;
                      }
                      onChange(newData);
                    }}
                    className="w-5 h-5 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm text-gray-300">{field.label}</label>
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={data[field.name] || ''}
                  onChange={(e) => onChange({ ...data, [field.name]: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm min-h-[100px] resize-y"
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  rows={4}
                />
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={data[field.name] || ''}
                  onChange={(e) => onChange({ ...data, [field.name]: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  min={field.min || undefined}
                  max={field.max || undefined}
                  disabled={field.disabled || false}
                />
              ) : (
                <input
                  type={field.type}
                  value={data[field.name] || ''}
                  onChange={(e) => onChange({ ...data, [field.name]: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  disabled={field.disabled || false}
                  min={field.min || undefined}
                  max={field.max || undefined}
                />
              )}
            </div>
          ))}
          </form>
        </div>
        <div className="p-6 border-t border-white/20 flex-shrink-0">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
            >
              İptal
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl flex items-center gap-3 disabled:opacity-50 transition-all duration-300 shadow-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEditing ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;