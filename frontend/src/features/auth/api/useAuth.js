/**
 * @file useAuth.js
 * @description Authentication hooks - Backend authController ile tam uyumlu
 * Tüm authentication işlemleri için React Query hooks
 * 
 * Backend Uyumluluk:
 * - authController.js endpoint'leri ile birebir uyumlu
 * - authService.js response formatları ile uyumlu
 * - authRoutes.js route yapısı ile uyumlu
 * 
 * @author MediKariyer Development Team
 * @version 2.1.0
 * @since 2024
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS } from '@config/api.js';
import useAuthStore from '@/store/authStore';
import useUiStore from '@/store/uiStore';
import { ROUTE_CONFIG } from '@config/routes.js';
import logger from '@/utils/logger';
import { 
  validateLogin, 
  validateDoctorRegister, 
  validateHospitalRegister,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  validateLogout
} from '@config/validation.js';

// ==================== QUERY KEYS ====================
export const QUERY_KEYS = {
  USER: ['user'],
  ME: ['auth', 'me'],
  VERIFY_TOKEN: ['auth', 'verify-token']
};

// ==================== LOGIN HOOKS ====================

/**
 * Login Hook - Unified login endpoint
 * Backend: authController.loginUnified
 * Endpoint: POST /auth/login
 * Response: { user: {...}, tokens: { accessToken, refreshToken } }
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showSuccess, showError } = useUiStore();

  return useMutation({
    mutationFn: async ({ email, password, role }) => {
      logger.info('Login attempt started', { email, role });
      
      // Frontend validasyonu
      const validation = validateLogin({ email, password, role });
      if (!validation.isValid) {
        const errorMessage = validation.errors[0] || 'Form doğrulama hatası';
        throw new Error(errorMessage);
      }

      // Backend'e gönderilecek data (role opsiyonel)
      const loginData = { email, password };
      if (role) {
        loginData.role = role;
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.LOGIN, loginData);
      
      // Backend response format: { success, message, data: { user, tokens } }
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Giriş başarısız');
      }
      
      return result;
    },
    onSuccess: (res) => {
      if (res && res.success && res.data && res.data.user && res.data.tokens) {
        logger.info('Login successful', { user: res.data.user });
        
        // AuthStore'a kullanıcı ve token bilgilerini kaydet
        login(res.data.user, res.data.tokens);
        
        showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // LoginPage'deki useEffect yönlendirmeyi yapacak
        logger.info('Login successful, LoginPage will handle redirect', {
          role: res.data.user.role
        });
      } else {
        logger.error('Invalid login response', res);
        showError(res?.message || 'Giriş başarısız.');
      }
    },
    onError: (error) => {
      logger.error('Login error', { 
        message: error.message, 
        status: error.response?.status,
        data: error.response?.data 
      });
      let errorMessage = 'Giriş başarısız';
      
      // 403 hatası için özel kontrol
      if (error.response?.status === 403) {
        const message = error.response?.data?.message || '';
        if (message.includes('admin onayını bekliyor') || message.includes('admin onayını')) {
          errorMessage = 'Hesabınız admin onayını bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.';
        } else if (message.includes('pasifleştirilmiştir')) {
          errorMessage = 'Hesabınız pasifleştirilmiştir. Lütfen sistem yöneticisi ile iletişime geçin.';
        } else {
          errorMessage = message || 'Erişim reddedildi';
        }
      } else if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes('Geçersiz email veya şifre')) {
          errorMessage = 'Geçersiz email veya şifre';
        } else {
          errorMessage = message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // LoginPage kendi hata yönetimini yapıyor, toast gösterme
      // showError(errorMessage);
    },
  });
};

/**
 * Forgot Password Hook
 * Backend: authController.forgotPassword
 * Endpoint: POST /auth/forgot-password
 * Response: { success, message }
 */
export const useForgotPassword = () => {
  const { showSuccess, showError } = useUiStore();

  return useMutation({
    mutationFn: async ({ email }) => {
      logger.info('Forgot password request started', { email });

      const validation = validateForgotPassword({ email });
      if (!validation.isValid) {
        const errorMessage = validation.errors[0] || 'Form doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Şifre sıfırlama talebi başarısız');
      }

      return result;
    },
    onSuccess: (res) => {
      logger.info('Forgot password request successful', res);
      const successMessage = res?.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.';
      showSuccess(successMessage);
    },
    onError: (error) => {
      logger.error('Forgot password request error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      const errorMessage = error.response?.data?.message || error.message || 'Şifre sıfırlama talebi başarısız';
      showError(errorMessage);
    }
  });
};

/**
 * Reset Password Hook
 * Backend: authController.resetPassword
 * Endpoint: POST /auth/reset-password
 */
export const useResetPassword = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUiStore();

  return useMutation({
    mutationFn: async ({ token, password, confirmPassword }) => {
      const validation = validateResetPassword({ token, password, confirmPassword });
      if (!validation.isValid) {
        const errorMessage = validation.errors[0] || 'Form doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Şifre sıfırlama başarısız');
      }

      return result;
    },
    onSuccess: (res) => {
      const message = res?.message || 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.';
      showSuccess(message);

      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, {
        replace: true,
        state: {
          message
        }
      });
    },
    onError: (error) => {
      logger.error('Reset password request error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      const errorMessage = error.response?.data?.message || error.message || 'Şifre sıfırlama başarısız';
      showError(errorMessage);
    }
  });
};

export const useChangePassword = () => {
  const { showSuccess, showError } = useUiStore();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword, confirmPassword }) => {
      const validation = validateChangePassword({ currentPassword, newPassword, confirmPassword });
      if (!validation.isValid) {
        const errorMessage = validation.errors[0] || 'Form doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmPassword
      });

      const result = response.data;
      if (!result.success) {
        throw new Error(result.message || 'Şifre değiştirme başarısız');
      }

      return result;
    },
    onSuccess: (res) => {
      const message = res?.message || 'Şifreniz başarıyla güncellendi.';
      showSuccess(message);
    },
    onError: (error) => {
      logger.error('Change password error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      const errorMessage = error.response?.data?.message || error.message || 'Şifre değiştirme başarısız';
      showError(errorMessage);
    }
  });
};

// ==================== REGISTRATION HOOKS ====================

/**
 * Doctor Registration Hook
 * Backend: authController.registerDoctor
 * Endpoint: POST /auth/registerDoctor
 * Response: { user: {...}, profile: {...} }
 */
export const useRegisterDoctor = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUiStore();

  return useMutation({
    mutationFn: async ({ email, password, first_name, last_name, title, specialty_id, subspecialty_id, region, profile_photo }) => {
      logger.info('Doctor registration started', { email, title, specialty_id, region });
      
      // Frontend validasyonu
      const validation = validateDoctorRegister({ 
        email, 
        password, 
        first_name, 
        last_name, 
        title, 
        specialty_id, 
        subspecialty_id, 
        region, 
        profile_photo 
      });
      if (!validation.isValid) {
        logger.error('Validation failed', { 
          data: { email, first_name, last_name, title, specialty_id, region, hasPassword: !!password, hasPhoto: !!profile_photo },
          errors: validation.errors 
        });
        const errorMessage = (validation.errors && validation.errors[0]?.message) || 'Form doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.REGISTER_DOCTOR, {
        email,
        password,
        first_name,
        last_name,
        title,
        specialty_id,
        subspecialty_id,
        region,
        profile_photo
      });
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Doktor kaydı başarısız');
      }
      
      return result;
    },
    onSuccess: (result) => {
      logger.info('Doctor registration successful');
      showSuccess('Doktor kaydınız başarılı! Admin onayı sonrası sisteme giriş yapabilirsiniz.');
      
      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, {
        state: {
          pendingApproval: true,
          message: 'Doktor kaydınız alındı. Admin onayı sonrası sisteme giriş yapabilirsiniz.'
        }
      });
    },
    onError: (error) => {
      logger.error('Doctor registration error', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      let errorMessage = 'Doktor kaydı başarısız';
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes('zaten kayıtlı')) {
          errorMessage = 'Bu e-posta adresi zaten kullanımda';
        } else if (message.includes('Validasyon hatası')) {
          errorMessage = 'Girilen bilgilerde hata var';
        } else {
          errorMessage = message;
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Sunucu çalışmıyor. Lütfen daha sonra tekrar deneyin.';
      }
      
      showError(errorMessage);
    },
  });
};

/**
 * Hospital Registration Hook
 * Backend: authController.registerHospital
 * Endpoint: POST /auth/registerHospital
 * Response: { user: {...}, profile: {...} }
 */
export const useRegisterHospital = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUiStore();

  return useMutation({
    mutationFn: async ({ email, password, institution_name, city_id, phone, logo }) => {
      logger.info('Hospital registration started', { email });
      
      // Frontend validasyonu
      const validation = validateHospitalRegister({ 
        email, password, institution_name, city_id, phone, logo 
      });
      if (!validation.isValid) {
        logger.error('Hospital validation failed', { 
          data: { email, institution_name, city_id },
          errors: validation.errors 
        });
        const errorMessage = (validation.errors && validation.errors[0]?.message) || 'Form doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.REGISTER_HOSPITAL, {
        email,
        password,
        institution_name,
        city_id,
        phone,
        logo
      });
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Hastane kaydı başarısız');
      }
      
      return result;
    },
    onSuccess: (result) => {
      logger.info('Hospital registration successful');
      showSuccess('Hastane kaydınız başarılı! Admin onayı sonrası sisteme giriş yapabilirsiniz.');
      
      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, {
        state: {
          pendingApproval: true,
          message: 'Hastane kaydınız alındı. Admin onayı sonrası sisteme giriş yapabilirsiniz.'
        }
      });
    },
    onError: (error) => {
      logger.error('Hospital registration error', error);
      let errorMessage = 'Hastane kaydı başarısız';
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes('zaten kayıtlı')) {
          errorMessage = 'Bu e-posta adresi zaten kullanımda';
        } else if (message.includes('Validasyon hatası')) {
          errorMessage = 'Girilen bilgilerde hata var';
        } else {
          errorMessage = message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    },
  });
};

// ==================== TOKEN MANAGEMENT HOOKS ====================

/**
 * Refresh Token Hook
 * Backend: authController.refreshToken
 * Endpoint: POST /auth/refresh
 * Response: { accessToken, refreshToken, user: {...} }
 */
export const useRefreshToken = () => {
  const { updateTokens } = useAuthStore();

  return useMutation({
    mutationFn: async ({ refreshToken }) => {
      logger.info('Token refresh started');
      
      // Frontend validasyonu
      const validation = validateRefreshToken({ refreshToken });
      if (!validation.isValid) {
        const errorMessage = validation.errors[0]?.message || 'Refresh token doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Token yenileme başarısız');
      }
      
      return result;
    },
    onSuccess: (res) => {
      if (res && res.success && res.data) {
        logger.info('Token refresh successful');
        
        // Yeni token'ları AuthStore'a kaydet
        updateTokens({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        });
      }
    },
    onError: (error) => {
      logger.error('Token refresh error', error);
      // Token yenileme başarısızsa logout et
      const { logout } = useAuthStore.getState();
      logout();
    },
  });
};

/**
 * Logout Hook (Single Device)
 * Backend: authController.logout
 * Endpoint: POST /auth/logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout, refreshToken } = useAuthStore();
  const { showSuccess } = useUiStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logger.info('Logout started');
      
      // Frontend validasyonu
      const validation = validateLogout({});
      if (!validation.isValid) {
        const errorMessage = validation.errors[0]?.message || 'Logout doğrulama hatası';
        throw new Error(errorMessage);
      }

      const response = await apiRequest.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Çıkış başarısız');
      }
      
      return result;
    },
    onSuccess: () => {
      logger.info('Logout successful');
      showSuccess('Başarıyla çıkış yaptınız');
      
      // React Query cache'ini temizle - farklı kullanıcılar için cache karışmasın
      queryClient.clear();
      
      // AuthStore'dan logout et
      logout();
      
      // Login sayfasına yönlendir
      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, { replace: true });
    },
    onError: (error) => {
      logger.error('Logout error', error);
      
      // Hata olsa bile cache'i temizle ve logout et
      queryClient.clear();
      logout();
      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, { replace: true });
    },
  });
};

/**
 * Logout All Devices Hook
 * Backend: authController.logoutAll
 * Endpoint: POST /auth/logout-all
 */
export const useLogoutAll = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { showSuccess } = useUiStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logger.info('Logout all devices started');
      
      const response = await apiRequest.post(ENDPOINTS.AUTH.LOGOUT_ALL);
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Tüm cihazlardan çıkış başarısız');
      }
      
      return result;
    },
    onSuccess: () => {
      logger.info('Logout all devices successful');
      showSuccess('Tüm cihazlardan başarıyla çıkış yaptınız');
      
      // React Query cache'ini temizle - farklı kullanıcılar için cache karışmasın
      queryClient.clear();
      
      // AuthStore'dan logout et
      logout();
      
      // Login sayfasına yönlendir
      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, { replace: true });
    },
    onError: (error) => {
      logger.error('Logout all devices error', error);
      
      // Hata olsa bile cache'i temizle ve logout et
      queryClient.clear();
      logout();
      navigate(ROUTE_CONFIG.PUBLIC.LOGIN, { replace: true });
    },
  });
};

// ==================== USER INFO HOOKS ====================

/**
 * Get Current User Hook
 * Backend: authController.getMe
 * Endpoint: GET /auth/me
 */
export const useMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await apiRequest.get(ENDPOINTS.AUTH.ME);
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Kullanıcı bilgileri alınamadı');
      }
      
      return result;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: (failureCount, error) => {
      // Token hatası varsa retry etme
      if (error.message.includes('Token') || error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Verify Token Hook
 * Backend: authController.verifyToken
 * Endpoint: POST /auth/verify-token
 */
export const useVerifyToken = () => {
  return useMutation({
    mutationFn: async () => {
      logger.info('Token verification started');
      
      const response = await apiRequest.post(ENDPOINTS.AUTH.VERIFY_TOKEN);
      
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Token doğrulama başarısız');
      }
      
      return result;
    },
    onError: (error) => {
      logger.error('Token verification error', error);
      // Token geçersizse logout et
      const { logout } = useAuthStore.getState();
      logout();
    },
  });
};

export default {
  useLogin,
  useRegisterDoctor,
  useRegisterHospital,
  useRefreshToken,
  useLogout,
  useLogoutAll,
  useMe,
  useVerifyToken
};