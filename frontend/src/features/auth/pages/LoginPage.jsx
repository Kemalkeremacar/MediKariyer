import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft, FiClock } from 'react-icons/fi';
import { useLogin } from '../api/useAuth';
import useAuthStore from '@/store/authStore';
import useUiStore from '@/store/uiStore';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import { loginSchema } from '@config/validation.js';
import { ButtonSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import logger from '@/utils/logger';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { showSuccess, showError } = useUiStore();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pendingToastId, setPendingToastId] = useState(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: '', description: '' });
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    
    // Location state'ten gelen pendingApproval kontrolü - sadece admin olmayan kullanıcılar için
    if (location.state?.pendingApproval && (!user || user.role !== 'admin')) {
      setErrorModal({
        show: true,
        message: '⚠️ Admin Onayı Bekleniyor!',
        description: 'Hesabınız admin tarafından onaylandıktan sonra sisteme erişebilirsiniz.'
      });
      
      // Location state'i temizle
      navigate(location.pathname, { replace: true });
    }
    
    // Sadece başarılı giriş sonrası yönlendirme yap
    if (isAuthenticated && user && !loginMutation.isLoading && !loginMutation.isError) {
      
      // Onay kontrolü
      if (!user.is_approved && user.role !== 'admin') {
        // Modal göster
        if (!errorModal.show) {
          setErrorModal({
            show: true,
            message: '⚠️ Admin Onayı Bekleniyor!',
            description: 'Hesabınız admin tarafından onaylandıktan sonra sisteme erişebilirsiniz.'
          });
        }
        // Login sayfasında kal, yönlendirme yapma
        return;
      }
      
      // İlk giriş kontrolü ve yönlendirme
      if (user.isFirstLogin && user.role !== 'admin') {
        // İlk giriş yapan doktor ve hastaneleri profil düzenleme sayfasına yönlendir
        switch (user.role) {
          case 'doctor':
            navigate(ROUTE_CONFIG.DOCTOR.PROFILE_EDIT, { 
              replace: true,
              state: { 
                isFirstLogin: true,
                message: 'Hoş geldiniz! Lütfen profilinizi tamamlayın.'
              }
            });
            break;
          case 'hospital':
            navigate(ROUTE_CONFIG.HOSPITAL.PROFILE_EDIT, { 
              replace: true,
              state: { 
                isFirstLogin: true,
                message: 'Hoş geldiniz! Lütfen profil bilgilerinizi tamamlayın.'
              }
            });
            break;
          default:
            navigate(ROUTE_CONFIG.PUBLIC.HOME, { replace: true });
        }
      } else {
      // Normal yönlendirme (daha önce giriş yapmış kullanıcılar)
      switch (user.role) {
        case 'admin':
          // Admin için location state'i temizle
          navigate(ROUTE_CONFIG.ADMIN.DASHBOARD, { replace: true, state: {} });
          break;
          case 'doctor':
            navigate(ROUTE_CONFIG.DOCTOR.DASHBOARD, { replace: true });
            break;
          case 'hospital':
            navigate(ROUTE_CONFIG.HOSPITAL.DASHBOARD, { replace: true });
            break;
          default:
            navigate(ROUTE_CONFIG.PUBLIC.HOME, { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // Cleanup modal when component unmounts
  useEffect(() => {
    return () => {
      setErrorModal({ show: false, message: '', description: '' });
    };
  }, []);

  // Success message from redirect
  useEffect(() => {
    if (location.state?.message) {
      showSuccess(location.state.message);
    }
  }, [location.state, showSuccess]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Form hatasını temizle
    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Zod validation kullan
      const validatedData = loginSchema.parse(formData);
      
      // Önceki modal'ı temizle
      if (errorModal.show) {
        setErrorModal({ show: false, message: '', description: '' });
      }
      
      // Giriş yapmaya çalışırken auth state'ini temizle
      const { clearAuthState } = useAuthStore.getState();
      clearAuthState();
    
    // User action logging
    logger.userAction('Login Attempt', {
      email: formData.email,
      userAgent: navigator.userAgent
    });

    
    loginMutation.mutate(validatedData, {
      onError: (error) => {
        // Admin onayı bekleyen kullanıcı için sadece form hatası göster (modal değil)
        const errorMessage = error.response?.data?.message || error.message || '';
        if (errorMessage.includes('admin onayını bekliyor')) {
          setFormError('Hesabınız admin onayını bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.');
          return; // Modal gösterme, sadece form hatası
        } else if (errorMessage.includes('Geçersiz email veya şifre')) {
          // Kayıtlı olmayan kullanıcı için modal göster
          setErrorModal({
            show: true,
            message: '❌ Giriş Hatası!',
            description: 'Bu e-posta adresi sistemde kayıtlı değil. Lütfen kayıt olun veya doğru e-posta adresini girin.'
          });
        } else {
          // Diğer hatalar için form hatası göster
          setFormError(errorMessage || 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
        }
      }
    });
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        setFormError(firstError.message);
      } else {
        console.error('Validation error:', error);
        setFormError('Form doğrulama hatası');
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-white overflow-x-hidden" style={{ 
      userSelect: 'text', 
      WebkitUserSelect: 'text', 
      MozUserSelect: 'text', 
      msUserSelect: 'text'
    }}>
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="modern-heading-primary text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900">
              Giriş Yapın
            </span>
          </h1>
          <p className="modern-text-primary text-center">Hesabınıza güvenli giriş yapın</p>
        </div>

        {/* Login Form */}
        <div className="modern-card p-8">
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
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ornek@email.com"
                  className="modern-form-input pl-10"
                  disabled={loginMutation.isLoading}
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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="modern-form-input pl-10 pr-12"
                  disabled={loginMutation.isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to={ROUTE_CONFIG.PUBLIC.FORGOT_PASSWORD}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Şifremi unuttum
              </Link>
            </div>

            {/* Kalıcı Bildirim Mesajları */}
            {formError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-200">
                      Giriş Hatası
                    </p>
                    <p className="text-sm text-red-300 mt-1">
                      {formError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Başarı Mesajları */}
            {location.state?.message && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-200">
                      Başarılı
                    </p>
                    <p className="text-sm text-green-300 mt-1">
                      {location.state.message}
                    </p>
                  </div>
                </div>
              </div>
            )}



            {/* Submit button */}
            <button
              type="submit"
              disabled={loginMutation.isLoading}
              className="w-full modern-btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <ButtonSpinner />
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>

          </form>

          {/* Footer links */}
          <div className="mt-8 text-center space-y-4">
            <p className="modern-text-secondary">
              Hesabınız yok mu?{' '}
              <Link 
                to={ROUTE_CONFIG.PUBLIC.REGISTER} 
                className="modern-btn-secondary inline-block px-4 py-2 text-sm"
              >
                Kayıt Olun
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

      {/* Error Modal - Basit Versiyon */}
      {errorModal.show && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
            style={{ zIndex: 10000 }}
          >
            {/* Modal Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-blue-900">
                {errorModal.message}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-blue-800 leading-relaxed">
                {errorModal.description}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setErrorModal({ show: false, message: '', description: '' });
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                style={{ zIndex: 10001 }}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
