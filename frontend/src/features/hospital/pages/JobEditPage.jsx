/**
 * Hospital Job Edit Sayfası
 * 
 * Hastanelerin mevcut iş ilanlarını düzenleyebileceği sayfa
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Mevcut iş ilanı verilerini yükleme
 * - İş ilanı düzenleme formu
 * - Uzmanlık ve şehir seçimi
 * - Detaylı iş tanımı
 * - Modern glassmorphism dark theme
 * - Form validasyonu
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Briefcase, MapPin, Users, Clock, 
  FileText, Target, Building, AlertCircle
} from 'lucide-react';
import { useHospitalJobById, useUpdateHospitalJob } from '../api/useHospital';
import { useLookup } from '@/hooks/useLookup';
import TransitionWrapper from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { jobSchema } from '@config/validation.js';

const JobEditPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const updateJobMutation = useUpdateHospitalJob();

  // API hooks
  const { 
    data: jobData, 
    isLoading: jobLoading, 
    error: jobError
  } = useHospitalJobById(jobId);

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
  const [isInitialized, setIsInitialized] = useState(false);

  // İş ilanı verileri yüklendiğinde form'u doldur
  useEffect(() => {
    if (jobData?.data?.job && !isInitialized) {
      const job = jobData.data.job;
      setFormData({
        title: job.title || '',
        specialty_id: job.specialty_id?.toString() || '',
        subspecialty_id: job.subspecialty_id?.toString() || '',
        city_id: job.city_id?.toString() || '',
        employment_type: job.employment_type || '',
        min_experience_years: job.min_experience_years?.toString() || '',
        description: job.description || ''
      });
      setIsInitialized(true);
    }
  }, [jobData, isInitialized]);

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
      
      await updateJobMutation.mutateAsync({ jobId, jobData: validatedData });
      // Toast message hook'ta gösteriliyor
      // Küçük bir delay ile navigate (cache update için)
      setTimeout(() => {
        navigate(`/hospital/jobs/${jobId}`);
      }, 500);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        console.error('❌ Zod Validation Error:', error.errors);
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('❌ Job update error:', error);
        showToast.error(error.message || 'İş ilanı güncellenemedi');
      }
    }
  };

  const handleCancel = () => {
    navigate(`/hospital/jobs/${jobId}`);
  };

  // Loading state
  if (jobLoading || lookupLoading.isLoading) {
    return (
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
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
      <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İş İlanı Yüklenemedi</h2>
              <p className="text-gray-300 mb-6">{jobError.message || 'Bir hata oluştu'}</p>
              <button
                onClick={() => navigate('/hospital/jobs')}
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
    <div className="hospital-light min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <TransitionWrapper>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri Dön
              </button>
              <div></div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center">İş İlanını Düzenle</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Temel Bilgiler</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İş İlanı Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 ${
                      errors.title ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Örn: Kardiyoloji Uzmanı Aranıyor"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Uzmanlık Alanı *
                  </label>
                  <select
                    value={formData.specialty_id}
                    onChange={(e) => handleInputChange('specialty_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 ${
                      errors.specialty_id ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" className="bg-slate-800">Uzmanlık Alanı Seçin</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.value} value={specialty.value} className="bg-slate-800">
                        {specialty.label}
                      </option>
                    ))}
                  </select>
                  {errors.specialty_id && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.specialty_id}
                    </p>
                  )}
                </div>

                {/* Subspecialty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Yan Dal Uzmanlığı
                  </label>
                  <select
                    value={formData.subspecialty_id}
                    onChange={(e) => handleInputChange('subspecialty_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 ${
                      errors.subspecialty_id ? 'border-red-500' : 'border-white/20'
                    }`}
                    disabled={!formData.specialty_id || !subspecialties.some(sub => sub.specialty_id === parseInt(formData.specialty_id))}
                  >
                    <option value="" className="bg-slate-800">
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
                        <option key={subspecialty.value} value={subspecialty.value} className="bg-slate-800">
                          {subspecialty.label}
                        </option>
                      ))}
                  </select>
                  {errors.subspecialty_id && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subspecialty_id}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Şehir *
                  </label>
                  <select
                    value={formData.city_id}
                    onChange={(e) => handleInputChange('city_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 ${
                      errors.city_id ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" className="bg-slate-800">Şehir Seçin</option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.value} className="bg-slate-800">
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.city_id}
                    </p>
                  )}
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İstihdam Türü *
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 ${
                      errors.employment_type ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" className="bg-slate-800">İstihdam Türü Seçin</option>
                    <option value="Tam Zamanlı" className="bg-slate-800">Tam Zamanlı</option>
                    <option value="Yarı Zamanlı" className="bg-slate-800">Yarı Zamanlı</option>
                    <option value="Nöbet Usulü" className="bg-slate-800">Nöbet Usülü</option>
                  </select>
                  {errors.employment_type && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.employment_type}
                    </p>
                  )}
                </div>

                {/* Min Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Deneyim Yılı - Opsiyonel
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.min_experience_years}
                    onChange={(e) => handleInputChange('min_experience_years', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                    placeholder="Örn: 3 (Boş bırakılabilir)"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">İş Tanımı</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Detaylı İş Tanımı *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={10}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 resize-none ${
                    errors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="İş tanımını buraya yazın..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300"
                disabled={updateJobMutation.isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateJobMutation.isLoading}
              >
                {updateJobMutation.isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Değişiklikleri Kaydet
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

export default JobEditPage;


