/**
 * Hospital Job Create Sayfası
 * 
 * Hastanelerin yeni iş ilanı oluşturabileceği sayfa
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - İş ilanı oluşturma formu
 * - Uzmanlık ve şehir seçimi
 * - Detaylı iş tanımı
 * - Maaş bilgileri
 * - Modern glassmorphism dark theme
 * - Form validasyonu
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0
 * @since 2024
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Briefcase, MapPin, Users, Clock, 
  FileText, Target, Building, AlertCircle
} from 'lucide-react';
import { useCreateHospitalJob } from '../api/useHospital';
import { useLookup } from '@/hooks/useLookup';
import TransitionWrapper from '../../../components/ui/TransitionWrapper';
import { showToast } from '@/utils/toastUtils';
import { jobSchema } from '@config/validation.js';

const JobCreatePage = () => {
  const navigate = useNavigate();
  const createJobMutation = useCreateHospitalJob();

  // Lookup Data Hook
  const { 
    data: lookupData,
    loading: lookupLoading
  } = useLookup();
  
  const specialties = lookupData?.specialties || [];
  const subspecialties = lookupData?.subspecialties || [];
  const cities = lookupData?.cities || [];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    specialty_id: '',
    subspecialty_id: '',
    city_id: '',
    employment_type: '',
    min_experience_years: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Uzmanlık alanı değiştiğinde yan dal uzmanlığını sıfırla
      if (field === 'specialty_id') {
        newData.subspecialty_id = '';
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Form data'yı backend'e uygun formata çevir
      // NOT: status_id gönderilmiyor, backend otomatik olarak Aktif (1) yapacak
      const submitData = {
        title: formData.title,
        specialty_id: parseInt(formData.specialty_id),
        subspecialty_id: formData.subspecialty_id ? parseInt(formData.subspecialty_id) : null,
        city_id: parseInt(formData.city_id),
        employment_type: formData.employment_type,
        min_experience_years: formData.min_experience_years ? parseInt(formData.min_experience_years) : null,
        description: formData.description
      };

      // Zod validation kullan
      const validatedData = jobSchema.parse(submitData);
      await createJobMutation.mutateAsync(validatedData);
      navigate('/hospital/jobs');
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Job creation error:', error);
      }
    }
  };

  const handleCancel = () => {
    navigate('/hospital/jobs');
  };

  if (lookupLoading.isLoading) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-3xl p-8 border border-blue-100 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yükleniyor...</h2>
              <p className="text-gray-700">Form verileri hazırlanıyor</p>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <TransitionWrapper>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white border border-blue-200 text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Yeni İş İlanı Oluştur</h1>
                <p className="text-gray-700 mt-1">Nitelikli doktorlara ulaşmak için iş ilanınızı oluşturun</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    İş İlanı Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Örn: Kardiyoloji Uzmanı Aranıyor"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Uzmanlık Alanı *
                  </label>
                  <select
                    value={formData.specialty_id}
                    onChange={(e) => handleInputChange('specialty_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.specialty_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Uzmanlık Alanı Seçin</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </option>
                    ))}
                  </select>
                  {errors.specialty_id && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.specialty_id}
                    </p>
                  )}
                </div>

                {/* Subspecialty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Yan Dal Uzmanlığı
                  </label>
                  <select
                    value={formData.subspecialty_id}
                    onChange={(e) => handleInputChange('subspecialty_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.subspecialty_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!formData.specialty_id || !subspecialties.some(sub => sub.specialty_id === parseInt(formData.specialty_id))}
                  >
                    <option value="">
                      {!formData.specialty_id 
                        ? 'Önce Uzmanlık Alanı Seçin'
                        : !subspecialties.some(sub => sub.specialty_id === parseInt(formData.specialty_id))
                        ? 'Bu uzmanlık alanında yan dal yok'
                        : 'Yan Dal Uzmanlığı Seçin (Opsiyonel)'
                      }
                    </option>
                    {subspecialties
                      .filter(subspecialty => subspecialty.specialty_id === parseInt(formData.specialty_id))
                      .map((subspecialty) => (
                        <option key={subspecialty.value} value={subspecialty.value}>
                          {subspecialty.label}
                        </option>
                      ))}
                  </select>
                  {errors.subspecialty_id && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subspecialty_id}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Şehir *
                  </label>
                  <select
                    value={formData.city_id}
                    onChange={(e) => handleInputChange('city_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.city_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Şehir Seçin</option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.city_id}
                    </p>
                  )}
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    İstihdam Türü *
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.employment_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="" className="bg-slate-800">İstihdam Türü Seçin</option>
                    <option value="Tam Zamanlı" className="bg-slate-800">Tam Zamanlı</option>
                    <option value="Yarı Zamanlı" className="bg-slate-800">Yarı Zamanlı</option>
                    <option value="Nöbet Usulü" className="bg-slate-800">Nöbet Usulü</option>
                  </select>
                  {errors.employment_type && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.employment_type}
                    </p>
                  )}
                </div>

                {/* Min Experience Years */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Deneyim (Yıl) - Opsiyonel
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.min_experience_years}
                    onChange={(e) => handleInputChange('min_experience_years', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Örn: 2 (Boş bırakılabilir)"
                  />
                </div>
              </div>

              {/* Bilgilendirme Notu */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div>
                    <p className="text-sm text-gray-900 font-semibold mb-1">İlan Durumu</p>
                    <p className="text-xs text-gray-700">
                      Yeni oluşturulan ilanlar otomatik olarak <span className="font-semibold">"Aktif"</span> durumda yayınlanır ve doktorlar tarafından görüntülenebilir. 
                      İlan durumunu değiştirmek için ilan oluşturduktan sonra düzenleme sayfasını kullanabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>


            {/* Job Description */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">İş Tanımı</h2>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    İş Tanımı *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={8}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="İş pozisyonu hakkında detaylı açıklama..."
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mt-2">
                    En az 10 karakter olmalıdır
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={createJobMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {createJobMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    İş İlanını Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default JobCreatePage;

