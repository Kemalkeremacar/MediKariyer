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
  CheckCircle, X, Calendar, User, ArrowLeft, Camera, Upload, ArrowRight
} from 'lucide-react';
import { 
  hospitalProfileUpdateSchema
} from '@config/validation.js';
import { 
  useHospitalProfile, 
  useUpdateHospitalProfile, 
  useHospitalProfileCompletion
} from '../api/useHospital';
import { useLookup } from '@/hooks/useLookup';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';

const HospitalProfile = () => {
  // API hook'ları
  const { data: profileData, isLoading: profileLoading, error: profileError } = useHospitalProfile();
  const { data: completionData, isLoading: completionLoading } = useHospitalProfileCompletion();
  const { data: { cities } } = useLookup();

  // Mutation hook'ları
  const updateProfileMutation = useUpdateHospitalProfile();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: '',
    city_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    about: '',
    logo: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // Logo yükleme handler'ı
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB - backend ile uyumlu)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error(toastMessages.photo.fileSizeError);
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error(toastMessages.validation.fileFormatError);
      return;
    }

    // Resmi sıkıştır ve optimize et
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Maksimum boyutları belirle (600x600 daha iyi kalite)
      const maxSize = 600;
      let { width, height } = img;
      
      // Oranları koru
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Resmi çiz ve sıkıştır
      ctx.drawImage(img, 0, 0, width, height);
      
      // JPEG formatında %85 kalite ile sıkıştır (daha iyi kalite)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      setLogoPreview(compressedDataUrl);
      setFormData(prev => ({ ...prev, logo: compressedDataUrl }));
      
      // Sıkıştırma sonucu bilgisi
      const originalSize = (file.size / 1024).toFixed(1);
      const compressedSize = (compressedDataUrl.length * 0.75 / 1024).toFixed(1); // Base64 overhead hesabı
      console.log(`Logo sıkıştırıldı: ${originalSize}KB → ${compressedSize}KB`);
    };
    
    img.onerror = () => {
      showToast.error('Logo yüklenirken hata oluştu');
    };
    
    // Resmi yükle
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Profil verilerini form'a yükle
  useEffect(() => {
    if (profileData?.data?.profile) {
      const profile = profileData.data.profile;
      setFormData({
        institution_name: profile.institution_name || '',
        city_id: profile.city_id || '',
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
  if (profileLoading) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
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
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-3xl p-8 border border-blue-100 shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil Yüklenemedi</h2>
            <p className="text-gray-700">{profileError.message || 'Bir hata oluştu'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Veri parsing
  const profile = profileData?.data?.profile;
  const completion = completionData?.data?.completion;

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    // Form verilerini orijinal profil verilerine geri döndür
    if (profileData?.data?.profile) {
      const profile = profileData.data.profile;
      setFormData({
        institution_name: profile.institution_name || '',
        city_id: profile.city_id || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        about: profile.about || '',
        logo: profile.logo || ''
      });
      if (profile.logo) {
        setLogoPreview(profile.logo);
      } else {
        setLogoPreview(null);
      }
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Zod validation kullan
      const sendData = {
        ...formData,
        city_id: formData.city_id ? parseInt(formData.city_id) : undefined
      };
      const validatedData = hospitalProfileUpdateSchema.parse(sendData);
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


  return (
    <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 p-8 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                {/* Metin - Sol */}
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Profil Yönetimi</h1>
                  <h2 className="mb-4 text-xl font-semibold text-cyan-700 md:text-2xl">
                    Kurum Bilgilerini Düzenle
                  </h2>
                  <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                    Kurum profilinizi güncelleyin ve bilgilerinizi yönetin.
                  </p>
                </div>
                
                {/* Profil Tamamlanma Göstergesi - Sağ */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cyan-200/40 shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{completion?.percentage || 0}%</div>
                    <div className="text-xs text-gray-600">Tamamlanma</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Profil Tamamlanma Göstergesi */}
            <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Profil Durumu</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Tamamlanan Alanlar</span>
                  <span className="text-gray-900 font-semibold">{completion?.completedFields || 0}/{completion?.totalFields || 0}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completion?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Temel Bilgiler */}
              <div>
                  <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h2>
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
                          onClick={handleCancel}
                          className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-4 py-2 rounded-xl hover:bg-gray-500/30 transition-all duration-300 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          İptal
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={updateProfileMutation.isPending}
                          className="bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kurum Adı *
                        </label>
                        <input
                          type="text"
                          name="institution_name"
                          value={formData.institution_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                          placeholder="Sağlık kuruluşu adını girin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Şehir *
                        </label>
                        <select
                          name="city_id"
                          value={formData.city_id}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                        >
                          <option value="">Şehir Seçiniz</option>
                          {cities.map(city => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adres
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 resize-none"
                          placeholder="Tam adres girin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                          placeholder="Telefon numarası"
                        />
                      </div>

                      {/* E-posta (kayıt sırasında girilen) - sadece görüntüleme (input yerine text) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-posta
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 select-text">
                          {formData.email || '-'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Üyelikte girilen e‑posta; değiştirilemez.</p>
                      </div>

                      {/* E-posta form alanı kaldırıldı; header'da gösteriliyor */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Web Sitesi
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo
                        </label>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          {/* Logo Önizleme - Daha büyük ve optimize edilmiş alan */}
                          <div className="relative">
                            <div className="w-40 h-40 rounded-xl overflow-hidden bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                              {logoPreview ? (
                                <img 
                                  src={logoPreview} 
                                  alt="Kurum Logosu" 
                                  className="max-w-full max-h-full object-contain"
                                  style={{ 
                                    padding: '16px'
                                  }}
                                />
                              ) : (
                                <div className="text-center">
                                  <Building className="w-20 h-20 text-gray-300 mx-auto mb-2" />
                                  <p className="text-xs text-gray-400">Logo Yok</p>
                                </div>
                              )}
                            </div>
                            {logoPreview && isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Orijinal logo'ya geri döndür
                                  const originalLogo = profileData?.data?.profile?.logo || '';
                                  setLogoPreview(originalLogo || null);
                                  setFormData(prev => ({ ...prev, logo: originalLogo }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                title="Orijinal logo'ya geri döndür"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {/* Logo Yükleme Butonları - Sadece düzenleme modunda */}
                          {isEditing && (
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-1 gap-3">
                                {/* Dosya Yükle */}
                                <label className="cursor-pointer">
                                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-center">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-600">Logo Yükle</span>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG veya SVG formatında</p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Logo Bilgisi - Sadece görüntüleme modunda */}
                          {!isEditing && (
                            <div className="flex-1">
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Kurum Logosu</h4>
                                {logoPreview ? (
                                  <p className="text-sm text-gray-600">Logo başarıyla yüklenmiş</p>
                                ) : (
                                  <p className="text-sm text-gray-500">Henüz logo yüklenmemiş</p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                  Logo düzenlemek için "Düzenle" butonuna tıklayın
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hakkında
                        </label>
                        <textarea
                          name="about"
                          value={formData.about}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 resize-none"
                          placeholder="Hastane hakkında bilgi yazın"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HospitalProfile;

