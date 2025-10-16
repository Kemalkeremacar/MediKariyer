/**
 * HTTP Client - Axios Instance ve Interceptor'lar
 * Backend services eşleniği
 */

import axios from 'axios';
import { APP_CONFIG } from '@config/app.js';
import { ROUTE_CONFIG } from '@config/routes.js';
import logger from '../../utils/logger';
import useAuthStore from '../../store/authStore';

// Base URL - environment'a göre ayarlanır
const BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'http://192.168.1.198:3000/api');

// Public endpoint'ler - token gerektirmeyen endpoint'ler
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/registerDoctor',
  '/auth/registerHospital',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/lookup',
  '/contact',
  '/health'
];

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 saniye
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
});


// Request interceptor - Token ekleme ve logging
apiClient.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };
    
    const token = useAuthStore.getState().getToken();
    
    // Public endpoint kontrolü - Daha spesifik kontrol
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => {
      // Tam eşleşme veya başlangıç eşleşmesi kontrolü
      return config.url === endpoint || 
             (endpoint.endsWith('/') && config.url?.startsWith(endpoint)) ||
             (!endpoint.endsWith('/') && config.url?.startsWith(endpoint + '/'));
    });
    
    if (!isPublicEndpoint) {
      // Token durumunu kontrol et
      if (!token) {
        logger.warn('No token found for protected endpoint', { url: config.url });
        return Promise.reject(new Error('Authorization header bulunamadı'));
      }
      
      if (useAuthStore.getState().isTokenExpired()) {
        logger.warn('Token expired, skipping request', { url: config.url });
        return Promise.reject(new Error('Token expired'));
      }
      
      // Token geçerliyse Authorization header ekle
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('Authorization header added', { url: config.url, tokenPreview: token.substring(0, 20) + '...' });
    }
    
    // Request ID ekleme (debugging için)
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Request-ID'] = requestId;
    
    // API çağrısını logla
    logger.apiLog(config.method?.toUpperCase() || 'GET', config.url, config.data, null, 0);
    
    return config;
  },
  (error) => {
    logger.captureError(error, 'API Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor - Token refresh ve error handling
apiClient.interceptors.response.use(
  (response) => {
    // Performance logging
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    logger.apiLog(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url,
      response.config.data,
      response.data,
      duration
    );

    // Başarılı response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const duration = Date.now() - (originalRequest.metadata?.startTime || Date.now());
    
    // Error logging
    logger.captureError(error, 'API Response', {
      url: originalRequest.url,
      method: originalRequest.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      duration
    });
    
    // 401 Unauthorized - Token refresh dene
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Public endpoint kontrolü
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      if (isPublicEndpoint) {
        // Public endpoint'ler için 401 hatası normal - yönlendirme yapma
        logger.info('Public endpoint 401 error - not redirecting', { url: originalRequest.url });
        return Promise.reject(error);
      }
      
      const refreshToken = useAuthStore.getState().getRefreshToken();
      
      if (refreshToken) {
        try {
          logger.info('Attempting token refresh');
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          // Auth store'u güncelle
          useAuthStore.getState().updateTokens({
            accessToken,
            refreshToken: newRefreshToken
          });
          
          logger.info('Token refresh successful');
          
          // Orijinal request'i yeni token ile tekrar dene
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          // Refresh başarısız - logout
          logger.error('Token refresh failed', refreshError);
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        // Refresh token yok - logout
        logger.warn('No refresh token available, redirecting to home');
        useAuthStore.getState().logout();
      }
    }
    
    // 403 Forbidden - Yetkisiz erişim
    if (error.response?.status === 403) {
      // Role-based error handling
      const userRole = useAuthStore.getState().getUserRole();
      
      logger.warn('Access forbidden', {
        userRole,
        url: originalRequest.url,
        method: originalRequest.method
      });
      
      if (userRole === APP_CONFIG.USER_ROLES.DOCTOR && !useAuthStore.getState().isApproved()) {
        // Onaylanmamış doktor
        window.location.href = ROUTE_CONFIG.DOCTOR.DASHBOARD;
      } else {
        // Diğer yetki hataları
        logger.error('Unauthorized access', error.response.data);
      }
    }
    
    // Network error handling
    if (!error.response) {
      logger.error('Network error', {
        message: error.message,
        url: originalRequest.url,
        method: originalRequest.method
      });
    }
    
    return Promise.reject(error);
  }
);

// Rate limiting için basit implementation
const rateLimiter = {
  requests: new Map(),
  
  isAllowed: (endpoint) => {
    const now = Date.now();
    const windowStart = now - 60000; // 1 dakika
    
    if (!rateLimiter.requests.has(endpoint)) {
      rateLimiter.requests.set(endpoint, []);
    }
    
    const requests = rateLimiter.requests.get(endpoint);
    
    // Eski request'leri temizle
    const recentRequests = requests.filter(time => time > windowStart);
    rateLimiter.requests.set(endpoint, recentRequests);
    
    // Limit kontrolü
    if (recentRequests.length >= 60) { // 60 çağrı/dakika
      return false;
    }
    
    // Yeni request'i ekle
    recentRequests.push(now);
    return true;
  }
};

// API Client wrapper fonksiyonları
export const apiRequest = {
  get: async (url, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.get(url, config);
  },
  
  post: async (url, data, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.post(url, data, config);
  },
  
  put: async (url, data, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.put(url, data, config);
  },
  
  patch: async (url, data, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.patch(url, data, config);
  },
  
  delete: async (url, config = {}) => {
    if (!rateLimiter.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }
    return apiClient.delete(url, config);
  }
};

// File upload için özel client
export const fileUploadClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 1 dakika (dosya yükleme için daha uzun)
  headers: {
    'Content-Type': 'multipart/form-data',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
});

// File upload client için interceptor'lar
fileUploadClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
    if (token && !useAuthStore.getState().isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility fonksiyonlar
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

// Doctor specific API helpers
export const doctorApiRequest = {
  // Dashboard
  getDashboard: () => apiRequest.get('/doctor/dashboard'),
  
  // Profile
  getProfile: () => apiRequest.get('/doctor/profile'),
  updateProfile: (data) => apiRequest.put('/doctor/profile', data),
  getProfileFull: () => apiRequest.get('/doctor/profile/full'),
  getProfileComplete: () => apiRequest.get('/doctor/profile/complete'),
  getProfileCompletion: () => apiRequest.get('/doctor/profile/completion'),
  updateProfilePersonal: (data) => apiRequest.patch('/doctor/profile/personal', data),
  
  // Educations
  getEducations: () => apiRequest.get('/doctor/educations'),
  createEducation: (data) => apiRequest.post('/doctor/educations', data),
  updateEducation: (educationId, data) => apiRequest.patch(`/doctor/educations/${educationId}`, data),
  deleteEducation: (educationId) => apiRequest.delete(`/doctor/educations/${educationId}`),
  
  // Experiences
  getExperiences: () => apiRequest.get('/doctor/experiences'),
  createExperience: (data) => apiRequest.post('/doctor/experiences', data),
  updateExperience: (experienceId, data) => apiRequest.patch(`/doctor/experiences/${experienceId}`, data),
  deleteExperience: (experienceId) => apiRequest.delete(`/doctor/experiences/${experienceId}`),
  
  // Certificates
  getCertificates: () => apiRequest.get('/doctor/certificates'),
  createCertificate: (data) => apiRequest.post('/doctor/certificates', data),
  updateCertificate: (certificateId, data) => apiRequest.patch(`/doctor/certificates/${certificateId}`, data),
  deleteCertificate: (certificateId) => apiRequest.delete(`/doctor/certificates/${certificateId}`),
  
  // Languages
  getLanguages: () => apiRequest.get('/doctor/languages'),
  createLanguage: (data) => apiRequest.post('/doctor/languages', data),
  updateLanguage: (languageId, data) => apiRequest.patch(`/doctor/languages/${languageId}`, data),
  deleteLanguage: (languageId) => apiRequest.delete(`/doctor/languages/${languageId}`),
  
  // Applications
  createApplication: (data) => apiRequest.post('/doctor/applications', data),
  getMyApplications: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/doctor/applications/me${queryString ? '?' + queryString : ''}`);
  },
  getApplicationDetail: (applicationId) => apiRequest.get(`/doctor/applications/${applicationId}`),
  withdrawApplication: (applicationId) => apiRequest.patch(`/doctor/applications/${applicationId}/withdraw`),
  deleteApplication: (applicationId) => apiRequest.delete(`/doctor/applications/${applicationId}`),
  reapplyApplication: (applicationId) => apiRequest.post(`/doctor/applications/${applicationId}/reapply`),
  
  // Jobs
  getJobs: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/doctor/jobs${queryString ? '?' + queryString : ''}`);
  },
  getJobDetail: (jobId) => apiRequest.get(`/doctor/jobs/${jobId}`),
  
  // Profile Notifications
  notifyProfileUpdate: () => apiRequest.post('/doctor/profile/notify-update')
};

// Hospital specific API helpers
export const hospitalApiRequest = {
  // Dashboard
  getDashboard: () => apiRequest.get('/hospital/dashboard'),
  
  // Profile
  getProfile: () => apiRequest.get('/hospital'),
  updateProfile: (data) => apiRequest.put('/hospital', data),
  getProfileCompletion: () => apiRequest.get('/hospital/profile/completion'),
  
  // Jobs
  getJobs: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/jobs${queryString ? '?' + queryString : ''}`);
  },
  
  createJob: (data) => apiRequest.post('/hospital/jobs', data),
  updateJob: (jobId, data) => apiRequest.put(`/hospital/jobs/${jobId}`, data),
  deleteJob: (jobId) => apiRequest.delete(`/hospital/jobs/${jobId}`),
  
  // Applications
  getApplications: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/applications${queryString ? '?' + queryString : ''}`);
  },
  
  getJobApplications: (jobId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/jobs/${jobId}/applications${queryString ? '?' + queryString : ''}`);
  },
  
  updateApplicationStatus: (applicationId, data) => 
    apiRequest.put(`/hospital/applications/${applicationId}/status`, data),
  
  // Departments
  getDepartments: () => apiRequest.get('/hospital/departments'),
  createDepartment: (data) => apiRequest.post('/hospital/departments', data),
  updateDepartment: (departmentId, data) => apiRequest.put(`/hospital/departments/${departmentId}`, data),
  deleteDepartment: (departmentId) => apiRequest.delete(`/hospital/departments/${departmentId}`),
  
  // Contacts
  getContacts: () => apiRequest.get('/hospital/contacts'),
  createContact: (data) => apiRequest.post('/hospital/contacts', data),
  updateContact: (contactId, data) => apiRequest.put(`/hospital/contacts/${contactId}`, data),
  deleteContact: (contactId) => apiRequest.delete(`/hospital/contacts/${contactId}`),
  
  // Doctors
  getDoctorProfiles: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest.get(`/hospital/doctors${queryString ? '?' + queryString : ''}`);
  },
  
  getDoctorProfileDetail: (doctorId) => apiRequest.get(`/hospital/doctors/${doctorId}`)
};

export default apiClient;
