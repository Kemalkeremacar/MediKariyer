/**
 * Hospital Profile Sayfası
 * 
 * Doctor Profile pattern'ini takip eden modern hastane profil yönetimi
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Temel profil bilgileri yönetimi
 * - Departman yönetimi
 * - İletişim bilgisi yönetimi
 * - Profil tamamlanma göstergesi
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Form validasyonu
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, Save, Plus, Edit3, Trash2, Phone, Mail, 
  MapPin, Globe, Info, Users, Briefcase, AlertCircle,
  CheckCircle, X, Calendar, User, ArrowLeft, Camera, Upload
} from 'lucide-react';
import { 
  hospitalProfileUpdateSchema,
  hospitalDepartmentSchema,
  hospitalContactSchema
} from '@config/validation.js';
import { 
  useHospitalProfile, 
  useUpdateHospitalProfile, 
  useHospitalProfileCompletion,
  useHospitalDepartments, 
  useCreateHospitalDepartment, 
  useUpdateHospitalDepartment, 
  useDeleteHospitalDepartment,
  useHospitalContacts, 
  useCreateHospitalContact, 
  useUpdateHospitalContact, 
  useDeleteHospitalContact 
} from '../api/useHospital';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';

const HospitalProfile = () => {
  // API hook'ları
  const { data: profileData, isLoading: profileLoading, error: profileError } = useHospitalProfile();
  const { data: completionData, isLoading: completionLoading } = useHospitalProfileCompletion();
  const { data: departmentsData, isLoading: departmentsLoading } = useHospitalDepartments();
  const { data: contactsData, isLoading: contactsLoading } = useHospitalContacts();

  // Mutation hook'ları
  const updateProfileMutation = useUpdateHospitalProfile();
  const createDepartmentMutation = useCreateHospitalDepartment();
  const updateDepartmentMutation = useUpdateHospitalDepartment();
  const deleteDepartmentMutation = useDeleteHospitalDepartment();
  const createContactMutation = useCreateHospitalContact();
  const updateContactMutation = useUpdateHospitalContact();
  const deleteContactMutation = useDeleteHospitalContact();

  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    about: '',
    logo: ''
  });

  // Department ve Contact state'leri
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ department_name: '', description: '' });
  const [newContact, setNewContact] = useState({ contact_type: '', contact_value: '', description: '' });
  const [logoPreview, setLogoPreview] = useState(null);

  // Logo yükleme handler'ı
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Preview oluştur ve base64'e çevir
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setFormData(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Profil verilerini form'a yükle
  useEffect(() => {
    if (profileData?.data?.profile) {
      const profile = profileData.data.profile;
      setFormData({
        institution_name: profile.institution_name || '',
        city: profile.city || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        about: profile.about || '',
        logo: profile.logo || ''
      });
      if (profile.logo) {
        setLogoPreview(profile.logo);
      }
    }
  }, [profileData]);

  // Loading state
  if (profileLoading || departmentsLoading || contactsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="space-y-8 p-6">
          <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SkeletonLoader className="h-96 bg-white/10 rounded-3xl" />
            <SkeletonLoader className="lg:col-span-2 h-96 bg-white/10 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error handling
  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Profil Yüklenemedi</h2>
            <p className="text-gray-300">{profileError.message || 'Bir hata oluştu'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Veri parsing
  const profile = profileData?.data?.profile;
  const completion = completionData?.data?.completion;
  const departments = departmentsData?.data?.departments || [];
  const contacts = contactsData?.data?.contacts || [];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Zod validation kullan
      const validatedData = hospitalProfileUpdateSchema.parse(formData);
      await updateProfileMutation.mutateAsync(validatedData);
      setIsEditing(false);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Profil güncelleme hatası:', error);
      }
    }
  };

  // Department handlers
  const handleCreateDepartment = async () => {
    if (!newDepartment.department_name.trim()) {
      showToast.error('Departman adı gereklidir');
      return;
    }
    
    try {
      // Zod validation kullan
      const validatedData = hospitalDepartmentSchema.parse(newDepartment);
      await createDepartmentMutation.mutateAsync(validatedData);
      setNewDepartment({ department_name: '', description: '' });
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Departman oluşturma hatası:', error);
      }
    }
  };

  const handleUpdateDepartment = async (departmentId, data) => {
    try {
      // Zod validation kullan
      const validatedData = hospitalDepartmentSchema.parse(data);
      await updateDepartmentMutation.mutateAsync({ departmentId, departmentData: validatedData });
      setEditingDepartment(null);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Departman güncelleme hatası:', error);
      }
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDepartmentMutation.mutateAsync(departmentId);
      } catch (error) {
        console.error('Departman silme hatası:', error);
      }
    }
  };

  // Contact handlers
  const handleCreateContact = async () => {
    if (!newContact.contact_type.trim() || !newContact.contact_value.trim()) {
      showToast.error('İletişim türü ve değeri gereklidir');
      return;
    }
    try {
      // Zod validation kullan
      const validatedData = hospitalContactSchema.parse(newContact);
      await createContactMutation.mutateAsync(validatedData);
      setNewContact({ contact_type: '', contact_value: '', description: '' });
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('İletişim bilgisi oluşturma hatası:', error);
      }
    }
  };

  const handleUpdateContact = async (contactId, data) => {
    try {
      // Zod validation kullan
      const validatedData = hospitalContactSchema.parse(data);
      await updateContactMutation.mutateAsync({ contactId, contactData: validatedData });
      setEditingContact(null);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('İletişim bilgisi güncelleme hatası:', error);
      }
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Bu iletişim bilgisini silmek istediğinizden emin misiniz?')) {
      try {
        await deleteContactMutation.mutateAsync(contactId);
      } catch (error) {
        console.error('İletişim bilgisi silme hatası:', error);
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Temel Bilgiler', icon: Building },
    { id: 'departments', label: 'Departmanlar', icon: Users },
    { id: 'contacts', label: 'İletişim', icon: Phone }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="space-y-8 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Hastane Profili</h1>
              <p className="text-gray-300 mt-2">Profil bilgilerinizi yönetin ve güncelleyin</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Profil Tamamlanma Göstergesi */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{completion?.percentage || 0}%</div>
                  <div className="text-xs text-gray-300">Tamamlanma</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Tab Navigation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Profil Durumu */}
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Profil Durumu</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Tamamlanan Alanlar</span>
                    <span className="text-white">{completion?.completedFields || 0}/{completion?.totalFields || 0}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completion?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Temel Bilgiler Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Temel Bilgiler</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Düzenle
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-4 py-2 rounded-xl hover:bg-gray-500/30 transition-all duration-300 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          İptal
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={updateProfileMutation.isPending}
                          className="bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {updateProfileMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Kurum Adı *
                        </label>
                        <input
                          type="text"
                          name="institution_name"
                          value={formData.institution_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="Sağlık kuruluşu adını girin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Şehir *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="Şehir girin"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Adres *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={3}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="Tam adres girin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Telefon *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="Telefon numarası"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          E-posta *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="E-posta adresi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Web Sitesi
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Logo
                        </label>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {/* Logo Önizleme */}
                          <div className="relative">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/5 border-2 border-white/20 flex items-center justify-center">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                              ) : (
                                <Building className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                            {logoPreview && isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoPreview(null);
                                  setFormData({ ...formData, logo: '' });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {/* Logo Yükleme Butonları */}
                          {isEditing && (
                            <div className="flex-1 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {/* Dosya Yükle */}
                                <label className="cursor-pointer">
                                  <div className="border-2 border-dashed border-white/20 rounded-lg p-3 hover:border-blue-500 hover:bg-white/5 transition-all duration-300 text-center">
                                    <Upload className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                                    <span className="text-xs text-gray-300">Dosya Yükle</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                </label>
                                
                                {/* Kamera ile Çek */}
                                <label className="cursor-pointer">
                                  <div className="border-2 border-dashed border-white/20 rounded-lg p-3 hover:border-blue-500 hover:bg-white/5 transition-all duration-300 text-center">
                                    <Camera className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                                    <span className="text-xs text-gray-300">Fotoğraf Çek</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-400">
                                Logo yükleyin veya kamera ile çekin. Maksimum 5MB.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Hakkında
                        </label>
                        <textarea
                          name="about"
                          value={formData.about}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                          placeholder="Hastane hakkında bilgi yazın"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Departmanlar Tab */}
              {activeTab === 'departments' && (
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Departmanlar</h2>
                    <button
                      onClick={handleCreateDepartment}
                      disabled={createDepartmentMutation.isPending}
                      className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {createDepartmentMutation.isPending ? 'Ekleniyor...' : 'Departman Ekle'}
                    </button>
                  </div>

                  {/* Yeni Departman Formu */}
                  <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Yeni Departman</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Departman Adı"
                          value={newDepartment.department_name}
                          onChange={(e) => setNewDepartment(prev => ({ ...prev, department_name: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <textarea
                          placeholder="Açıklama"
                          value={newDepartment.description}
                          onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Departman Listesi */}
                  <div className="space-y-4">
                    {departments.map((department) => (
                      <div key={department.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{department.department_name}</h3>
                            {department.description && (
                              <p className="text-sm text-gray-400 mt-2">{department.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingDepartment(department.id)}
                              className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {departments.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Henüz departman eklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* İletişim Tab */}
              {activeTab === 'contacts' && (
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">İletişim Bilgileri</h2>
                    <button
                      onClick={handleCreateContact}
                      disabled={createContactMutation.isPending}
                      className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {createContactMutation.isPending ? 'Ekleniyor...' : 'İletişim Ekle'}
                    </button>
                  </div>

                  {/* Yeni İletişim Formu */}
                  <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Yeni İletişim Bilgisi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <select
                          value={newContact.contact_type}
                          onChange={(e) => setNewContact(prev => ({ ...prev, contact_type: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="">İletişim Türü Seçin</option>
                          <option value="phone">Telefon</option>
                          <option value="email">E-posta</option>
                          <option value="fax">Faks</option>
                          <option value="emergency">Acil</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="İletişim Değeri"
                          value={newContact.contact_value}
                          onChange={(e) => setNewContact(prev => ({ ...prev, contact_value: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Açıklama (opsiyonel)"
                          value={newContact.description}
                          onChange={(e) => setNewContact(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* İletişim Listesi */}
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              {contact.contact_type === 'phone' && <Phone className="w-6 h-6 text-white" />}
                              {contact.contact_type === 'email' && <Mail className="w-6 h-6 text-white" />}
                              {contact.contact_type === 'fax' && <Phone className="w-6 h-6 text-white" />}
                              {contact.contact_type === 'emergency' && <AlertCircle className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                              <p className="font-semibold text-white capitalize">{contact.contact_type}</p>
                              <p className="text-gray-300">{contact.contact_value}</p>
                              {contact.description && (
                                <p className="text-sm text-gray-400">{contact.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingContact(contact.id)}
                              className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {contacts.length === 0 && (
                      <div className="text-center py-12">
                        <Phone className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Henüz ek iletişim bilgisi eklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default HospitalProfile;
