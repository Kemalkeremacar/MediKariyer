import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiHome, FiMail, FiLock, FiPhone, FiMapPin, FiArrowLeft, FiCheck, FiCamera, FiUpload, FiImage } from 'react-icons/fi';
import { useRegisterDoctor, useRegisterHospital } from '../api/useAuth';
import { showToast } from '@/utils/toastUtils';
import useAuthStore from '../../../store/authStore';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import { registerDoctorSchema, registerHospitalSchema } from '@config/validation.js';
import { useLookup } from '@/hooks/useLookup';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  // Lookup verileri
  const { data: { specialties, subspecialties, cities } } = useLookup();

  // URL parametresinden user type'ı al
  const urlUserType = searchParams.get('type');
  const [userType, setUserType] = useState(urlUserType || 'doctor');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Doctor fields
    first_name: '',
    last_name: '',
    title: 'Dr.',
    specialty_id: '',
    subspecialty_id: '',
    profile_photo: '',
    // Hospital fields
    institution_name: '',
    city_id: '',
    address: '',
    phone: '',
    website: '',
    about: '',
    logo: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: '', description: '' });
  
  // Hook'ları userType'a göre seç
  const registerDoctorMutation = useRegisterDoctor();
  const registerHospitalMutation = useRegisterHospital();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTE_CONFIG.PRIVATE.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Seçilen branşa göre yan dalları filtrele
  const filteredSubspecialties = useMemo(() => {
    if (!formData.specialty_id) return [];
    return subspecialties.filter(sub => sub.specialty_id === parseInt(formData.specialty_id));
  }, [formData.specialty_id, subspecialties]);

  // Branş değiştiğinde yan dalı sıfırla
  useEffect(() => {
    if (formData.specialty_id && formData.subspecialty_id) {
      const isValidSubspecialty = filteredSubspecialties.some(
        sub => sub.id === parseInt(formData.subspecialty_id)
      );
      if (!isValidSubspecialty) {
        setFormData(prev => ({ ...prev, subspecialty_id: '' }));
      }
    }
  }, [formData.specialty_id, formData.subspecialty_id, filteredSubspecialties]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Fotoğraf yükleme
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Fotoğraf boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Preview oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData(prev => ({ ...prev, profile_photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Kamera ile fotoğraf çekme (mobil)
  const handleCameraCapture = async (e) => {
    handlePhotoUpload(e);
  };

  // Logo yükleme
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Logo boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Preview oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      title: 'Dr.',
      specialty_id: '',
      subspecialty_id: '',
      profile_photo: '',
      institution_name: '',
      city_id: '',
      address: '',
      phone: '',
      website: '',
      about: '',
      logo: '',
    });
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // UserType'a göre doğru schema'yı kullan
      if (userType === 'doctor') {
        const validatedData = registerDoctorSchema.parse({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          title: formData.title,
          specialty_id: parseInt(formData.specialty_id),
          subspecialty_id: formData.subspecialty_id ? parseInt(formData.subspecialty_id) : undefined,
          profile_photo: formData.profile_photo,
        });
        registerDoctorMutation.mutate(validatedData);
      } else if (userType === 'hospital') {
        const validatedData = registerHospitalSchema.parse({
          email: formData.email,
          password: formData.password,
          institution_name: formData.institution_name,
          city_id: parseInt(formData.city_id),
          phone: formData.phone,
          logo: formData.logo,
        });
        registerHospitalMutation.mutate(validatedData);
      }
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Validation error:', error);
      }
    }
  };

  const userTypes = [
    { value: 'doctor', label: 'Doktor', icon: FiUser, description: 'Sağlık profesyoneli olarak kayıt olun' },
    { value: 'hospital', label: 'Sağlık Kuruluşu', icon: FiHome, description: 'Sağlık kurumu olarak kayıt olun' },
  ];

  const titleOptions = [
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Uz. Dr.', label: 'Uz. Dr.' },
    { value: 'Dr. Öğr. Üyesi', label: 'Dr. Öğr. Üyesi' },
    { value: 'Doç. Dr.', label: 'Doç. Dr.' },
    { value: 'Prof. Dr.', label: 'Prof. Dr.' },
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-white overflow-x-hidden" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="modern-heading-primary text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900">
              Kayıt Olun
            </span>
          </h1>
          <p className="modern-text-primary text-center">Yeni hesabınızı oluşturun</p>
        </div>

        {/* Register Form */}
        <div className="modern-card p-8">
          {/* User Type Selection */}
          <div className="mb-8">
            <h3 className="modern-heading-tertiary mb-4">Hesap Türünüzü Seçin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUserType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    userType === type.value
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-blue-300 bg-blue-50/50 text-blue-700 hover:border-blue-400 hover:bg-blue-100/50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <type.icon className={`w-6 h-6 mr-3 ${userType === type.value ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  <p className="text-sm text-left">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="modern-form-label">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-blue-600" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modern-form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="modern-form-label">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-600" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="modern-form-input pl-10"
                  required
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">En az 3 karakter</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="modern-form-label">
                Şifre Tekrarı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-600" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="modern-form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Doctor Fields */}
            {userType === 'doctor' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="modern-form-label">
                      Ad *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="Adınız"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="modern-form-input pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="modern-form-label">
                      Soyad *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Soyadınız"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="modern-form-input pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Ünvan */}
                <div>
                  <label className="modern-form-label">
                    Ünvan *
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="modern-form-input"
                    required
                  >
                    {titleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branş ve Yan Dal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="modern-form-label">
                      Branş *
                    </label>
                    <select
                      name="specialty_id"
                      value={formData.specialty_id}
                      onChange={handleInputChange}
                      className="modern-form-input"
                      required
                    >
                      <option value="">Branş Seçiniz</option>
                      {specialties.map(specialty => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="modern-form-label">
                      Yan Dal
                    </label>
                    <select
                      name="subspecialty_id"
                      value={formData.subspecialty_id}
                      onChange={handleInputChange}
                      className="modern-form-input"
                      disabled={!formData.specialty_id || filteredSubspecialties.length === 0}
                    >
                      <option value="">Yan Dal Seçiniz (Opsiyonel)</option>
                      {filteredSubspecialties.map(subspecialty => (
                        <option key={subspecialty.id} value={subspecialty.id}>
                          {subspecialty.name}
                        </option>
                      ))}
                    </select>
                    {formData.specialty_id && filteredSubspecialties.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Bu branş için yan dal bulunmuyor</p>
                    )}
                  </div>
                </div>

                {/* Profil Fotoğrafı */}
                <div>
                  <label className="modern-form-label">
                    Profil Fotoğrafı *
                  </label>
                  <div className="space-y-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img 
                          src={photoPreview} 
                          alt="Profil önizleme" 
                          className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setFormData(prev => ({ ...prev, profile_photo: '' }));
                          }}
                          className="absolute top-0 right-1/2 transform translate-x-16 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-colors text-center">
                            <FiUpload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <span className="text-sm text-blue-700">Dosya Yükle</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {/* Fotoğraf çek opsiyonu kaldırıldı */}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Profil fotoğrafı zorunludur. Maksimum 5MB.</p>
                  </div>
                </div>
              </>
            )}

            {/* Hospital Fields */}
            {userType === 'hospital' && (
              <>
                <div>
                  <label className="modern-form-label">
                    Sağlık Kuruluşu Adı *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="h-5 w-5 text-blue-600" />
                    </div>
                    <input
                      type="text"
                      name="institution_name"
                      placeholder="Sağlık Kuruluşu Adı"
                      value={formData.institution_name}
                      onChange={handleInputChange}
                      className="modern-form-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="modern-form-label">
                    Şehir *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleInputChange}
                      className="modern-form-input pl-10 appearance-none"
                      required
                    >
                      <option value="">Şehir Seçiniz</option>
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="modern-form-label">
                    Telefon *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-blue-600" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Telefon Numarası"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="modern-form-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="modern-form-label">
                    Logo / Fotoğraf *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiImage className="h-5 w-5 text-blue-600" />
                    </div>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="modern-form-input pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG veya GIF formatında logo yükleyiniz
                  </p>
                </div>

              </>
            )}


            {/* Submit button */}
            <button
              type="submit"
              disabled={registerDoctorMutation.isLoading || registerHospitalMutation.isLoading}
              className="w-full modern-btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(registerDoctorMutation.isLoading || registerHospitalMutation.isLoading) ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-lg">Kayıt işlemi devam ediyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiCheck className="mr-2" />
                  Kayıt Ol
                </div>
              )}
            </button>
          </form>


          {/* Footer links */}
          <div className="mt-8 text-center space-y-4">
            <p className="modern-text-secondary">
              Zaten bir hesabınız var mı?{' '}
              <Link 
                to={ROUTE_CONFIG.PUBLIC.LOGIN} 
                className="modern-btn-secondary inline-block px-4 py-2 text-sm"
              >
                Giriş Yapın
              </Link>
            </p>
            <Link
              to={ROUTE_CONFIG.PUBLIC.HOME}
              className="inline-flex items-center modern-text-muted hover:text-blue-800 text-sm transition-colors duration-200"
            >
              <FiArrowLeft className="mr-1" />
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {errorModal.show && (
        <ErrorModal 
          message={errorModal.message}
          description={errorModal.description}
          onClose={() => setErrorModal({ show: false, message: '', description: '' })}
        />
      )}
    </div>
  );
};

// Error Modal Component
const ErrorModal = ({ message, description, onClose }) => {
  // Viewport pozisyonu için scroll pozisyonunu koru
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
        style={{ zIndex: 10000 }}
      >
        {/* Modal Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-blue-900">
            {message}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="mb-6">
          <p className="text-blue-800 leading-relaxed">
            {description || 'Lütfen bilgilerinizi kontrol edip tekrar deneyin.'}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            style={{ zIndex: 10001 }}
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
