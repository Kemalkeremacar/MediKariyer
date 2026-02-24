/**
 * @file authStore.js
 * @description Auth Store - Kimlik doğrulama state yönetimi
 * 
 * Bu dosya, Zustand kullanarak kullanıcı kimlik doğrulama durumunu yönetir.
 * Token'lar, kullanıcı bilgileri, authentication durumu ve ilgili tüm
 * işlemler bu store üzerinden gerçekleştirilir.
 * 
 * Ana Özellikler:
 * - Zustand persist middleware: localStorage'da otomatik kalıcılık
 * - Token yönetimi: Access token ve refresh token saklama
 * - User state: Kullanıcı bilgileri ve durumu
 * - Authentication durumu: isAuthenticated, isLoading durumları
 * - Role kontrolü: Doctor, Hospital, Admin rol kontrolleri
 * - Permission kontrolü: Rol bazlı route erişim kontrolleri
 * - Token expiry kontrolü: Token geçerlilik ve yenileme kontrolleri
 * - Session yönetimi: Login, logout, state temizleme
 * 
 * State Yapısı:
 * - user: Kullanıcı bilgileri objesi
 * - token: JWT access token
 * - refreshToken: JWT refresh token
 * - isAuthenticated: Authentication durumu
 * - isLoading: Loading durumu
 * - lastLoginAt: Son giriş zamanı
 * 
 * Actions:
 * - fetchUser: Backend'den kullanıcı bilgilerini getirir
 * - login: Kullanıcı girişi yapar
 * - logout: Kullanıcı çıkışı yapar
 * - clearAuthState: Auth state'ini temizler
 * - updateUser: Kullanıcı bilgilerini günceller
 * - updateTokens: Token'ları günceller
 * - setLoading: Loading durumunu ayarlar
 * 
 * Getters:
 * - getUser: Kullanıcı bilgisini döndürür
 * - getToken: Access token'ı döndürür
 * - getRefreshToken: Refresh token'ı döndürür
 * - isLoggedIn: Giriş yapılmış mı kontrol eder
 * - getUserRole: Kullanıcı rolünü döndürür
 * - isApproved: Kullanıcı onaylı mı kontrol eder
 * - isActive: Kullanıcı aktif mi kontrol eder
 * - isDoctor/isHospital/isAdmin: Rol kontrolü
 * 
 * Permission Checks:
 * - canAccessDoctorRoutes: Doctor route'larına erişim kontrolü
 * - canAccessHospitalRoutes: Hospital route'larına erişim kontrolü
 * - canAccessAdminRoutes: Admin route'larına erişim kontrolü
 * - canAccessRoleRoutes: Genel rol bazlı erişim kontrolü
 * 
 * Token Management:
 * - isTokenExpired: Token'ın süresi dolmuş mu kontrol eder
 * - shouldRefreshToken: Token yenilenmeli mi kontrol eder
 * - clearSensitiveData: Hassas verileri temizler
 * 
 * Persistence:
 * - Zustand persist middleware ile localStorage'a otomatik kayıt
 * - Storage key: 'medikariyer-auth'
 * - Sadece gerekli alanlar persist edilir (user, token, refreshToken, isAuthenticated, lastLoginAt)
 * 
 * Kullanım:
 * ```javascript
 * import useAuthStore from '@/store/authStore';
 * 
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * 
 * // Login
 * await login(userData, { accessToken, refreshToken });
 * 
 * // Logout
 * logout();
 * 
 * // User fetch
 * await fetchUser();
 * ```
 * 
 * Backend Uyumluluk:
 * - Token format: JWT token
 * - User data structure: Backend'den gelen user objesi ile uyumlu
 * - is_approved: 1 (integer) veya true (boolean) formatı kabul edilir
 * - is_active: 1 (integer) veya true (boolean) formatı kabul edilir
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * IMPORTS - Kütüphane ve utility import'ları
 * ============================================================================
 */

/**
 * Zustand store oluşturucu fonksiyonu
 * State management için kullanılır
 */
import { create } from 'zustand';

/**
 * Zustand persist middleware
 * State'in localStorage'a otomatik kaydedilmesini sağlar
 */
import { persist } from 'zustand/middleware';

/**
 * HTTP client
 * API istekleri için kullanılır
 */
import { apiRequest } from '../services/http/client';

/**
 * API endpoint tanımları
 * Backend endpoint path'leri için kullanılır
 */
import { ENDPOINTS } from '@config/api.js';

/**
 * Logger utility
 * Log kayıtları için kullanılır
 */
import logger from '../utils/logger';

// React Query client'ı import et (cache temizliği için)
// Ama circular dependency olmaması için lazy import yapılacak
let queryClientInstance = null;

// ============================================================================
// AUTH STORE - Kimlik doğrulama state yönetimi
// ============================================================================

/**
 * Auth Store Instance
 * 
 * Zustand persist middleware ile localStorage'a otomatik kaydedilir
 * Storage key: 'medikariyer-auth'
 * 
 * @type {Object} Zustand store instance
 */
const useAuthStore = create(
  /**
   * Zustand persist middleware
   * 
   * State'i localStorage'a otomatik olarak kaydeder
   * Sayfa yenilendiğinde state restore edilir
   */
  persist(
    /**
     * Store fonksiyonu
     * 
     * @param {Function} set - State güncelleme fonksiyonu
     * @param {Function} get - State okuma fonksiyonu
     * @returns {Object} Store state ve actions
     */
    (set, get) => ({
      // ======================================================================
      // STATE - State değişkenleri
      // ======================================================================
      
      /**
       * Kullanıcı bilgileri
       * 
       * Backend'den gelen kullanıcı objesi
       * İçerir: id, email, role, full_name, is_approved, is_active, vb.
       * 
       * @type {Object|null} Kullanıcı objesi veya null
       */
      user: null,
      
      /**
       * JWT Access Token
       * 
       * API istekleri için kullanılan token
       * Authorization header'da Bearer token olarak gönderilir
       * 
       * @type {string|null} JWT token string veya null
       */
      token: null,
      
      /**
       * JWT Refresh Token
       * 
       * Access token expire olduğunda yenilemek için kullanılan token
       * 
       * @type {string|null} JWT refresh token string veya null
       */
      refreshToken: null,
      
      /**
       * Authentication durumu
       * 
       * Kullanıcının giriş yapıp yapmadığını belirtir
       * true: Giriş yapılmış, false: Giriş yapılmamış
       * 
       * @type {boolean} Authentication durumu
       */
      isAuthenticated: false,
      
      /**
       * Loading durumu
       * 
       * Kullanıcı bilgisi fetch edilirken true olur
       * 
       * @type {boolean} Loading durumu
       */
      isLoading: false,
      
      /**
       * Son giriş zamanı
       * 
       * ISO string formatında son giriş zamanı
       * 
       * @type {string|null} ISO string veya null
       */
      lastLoginAt: null,

      // ======================================================================
      // ACTIONS - State değiştiren fonksiyonlar
      // ======================================================================
      
      /**
       * Kullanıcı bilgilerini backend'den getirir
       * 
       * Backend'e GET /auth/me isteği gönderir
       * Başarılı olursa user state'ini günceller
       * 
       * İşlem adımları:
       * 1. Token kontrolü: Token yoksa hata döndürür
       * 2. Token expire kontrolü: Token expire olduysa state'i temizler
       * 3. API isteği: Backend'den kullanıcı bilgisini getirir
       * 4. State güncelleme: Başarılı ise user state'ini günceller
       * 
       * @returns {Promise<Object>} Result objesi
       * @returns {boolean} result.success - İşlem başarılı mı
       * @returns {Object|null} result.data - Kullanıcı bilgileri
       * @returns {string} result.message - İşlem mesajı
       */
      fetchUser: async () => {
        /**
         * Mevcut state'i al
         */
        const state = get();
        
        /**
         * Token kontrolü
         * 
         * Token yoksa isteği gönderme
         * Hata mesajı döndür
         */
        if (!state.token) {
          return { success: false, message: 'Oturum tokenı bulunamadı.' };
        }
        
        /**
         * Token expire kontrolü
         * 
         * Token süresi dolmuşsa state'i temizle
         * logout() fonksiyonunu çağırma (yönlendirme yapılmaz)
         */
        if (state.isTokenExpired && state.isTokenExpired()) {
          /**
           * Token süresi dolmuşsa state'i temizle
           * Kullanıcı bilgilerini ve token'ları sıfırla
           */
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            lastLoginAt: null
          });
          return { success: false, message: 'Token süresi dolmuş.' };
        }
        
        /**
         * Loading state'ini aktif et
         * Kullanıcı bilgisi fetch edilirken loading gösterilir
         */
        set({ isLoading: true });
        
        try {
          /**
           * Backend'e istek gönder
           * 
           * GET /auth/me endpoint'ine istek at
           * Authorization header otomatik olarak eklenir (HTTP client interceptor)
           */
          const response = await apiRequest.get(ENDPOINTS.AUTH.ME);
          
          /**
           * Response'dan sonucu çıkar
           * 
           * Backend response formatı:
           * {
           *   success: boolean,
           *   data: { user: {...} },
           *   message: string
           * }
           */
          const result = {
            success: response.data.success,
            data: response.data.data?.user,
            message: response.data.message
          };
          
          /**
           * Başarılı response kontrolü
           * 
           * success true ve user data varsa state'i güncelle
           */
          if (result.success && result.data) {
            /**
             * User state'ini güncelle
             * 
             * Kullanıcı bilgilerini state'e kaydet
             * isAuthenticated: true olarak ayarla
             * isLoading: false olarak ayarla
             */
            set({
              user: result.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            /**
             * Başarısız response
             * 
             * Token geçersizse veya sunucu hatası oluşursa
             * Oturumu tamamen temizle
             */
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
          
          /**
           * Sonucu döndür
           */
          return result;
        } catch (error) {
          /**
           * Hata yakalama
           * 
           * API isteği başarısız olursa (network error, 401, vb.)
           * Hata logla ve oturumu temizle
           */
          logger.error('fetchUser error:', error);
          
          /**
           * Hata durumunda oturumu temizle
           * 
           * Kullanıcı bilgilerini ve token'ları sıfırla
           * Authentication durumunu false yap
           */
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          /**
           * Hata mesajı döndür
           */
          return { success: false, message: 'Kullanıcı bilgisi alınamadı.' };
        } finally {
          /**
           * Finally bloğu
           * 
           * Her durumda loading state'ini false yap
           * Try veya catch bloğunda zaten false yapılmış olsa bile
           * Burada garanti edilir
           */
          set({ isLoading: false });
        }
      },

      /**
       * Kullanıcı girişi yapar
       * 
       * Kullanıcı bilgilerini ve token'ları state'e kaydeder
       * Zustand persist middleware ile localStorage'a otomatik kaydedilir
       * 
       * @param {Object} userData - Kullanıcı bilgileri objesi
       * @param {string} userData.email - Kullanıcı email'i
       * @param {string} userData.role - Kullanıcı rolü (doctor, hospital, admin)
       * @param {Object} tokens - Token objesi
       * @param {string} tokens.accessToken - JWT access token
       * @param {string} tokens.refreshToken - JWT refresh token
       */
      login: (userData, tokens) => {
        /**
         * Login işlemini logla
         * 
         * Debugging ve audit için login işlemini loglar
         * Email, rol ve token varlığı loglanır
         */
        logger.info('AuthStore login called', { 
          user: userData?.email, 
          role: userData?.role,
          hasTokens: !!(tokens?.accessToken && tokens?.refreshToken)
        });
        
        try {
          /**
           * ⚠️ CRITICAL: Önceki kullanıcının localStorage cache'lerini temizle
           * Yeni kullanıcı login olduğunda önceki kullanıcının verileri kalmamalı
           */
          try {
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
              // Photo management cache'lerini temizle (başka kullanıcıya ait olabilir)
              if (key.startsWith('doctor-photo-')) {
                localStorage.removeItem(key);
              }
            });
          } catch (_) {
            logger.warn('Failed to clear user-specific localStorage cache');
          }
          
          /**
           * React Query cache'ini temizle
           * Önceki kullanıcının cache'leri yeni kullanıcıda görünmesin
           */
          try {
            if (!queryClientInstance) {
              // Lazy import: React Query client'ı ilk kullanımda yükle
              import('@tanstack/react-query').then(({ QueryClient }) => {
                // queryClient'a erişim için window global'den al (main.jsx'te tanımlanmış)
                queryClientInstance = window.__REACT_QUERY_CLIENT__;
                if (queryClientInstance) {
                  queryClientInstance.clear(); // Tüm cache'leri temizle
                  logger.info('React Query cache cleared on login');
                }
              }).catch((err) => {
                logger.warn('Failed to import QueryClient', { error: err });
              });
            } else if (queryClientInstance) {
              queryClientInstance.clear();
              logger.info('React Query cache cleared on login');
            }
          } catch (_) {
            logger.warn('Failed to clear React Query cache on login');
          }
          
          /**
           * localStorage quota kontrolü
           * 
           * localStorage'a yazmadan önce quota kontrolü yap
           * Eğer localStorage doluysa eski auth verilerini temizle
           */
          try {
            // Test için küçük bir veri yazmayı dene
            const testKey = '__medikariyer_quota_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
          } catch (quotaError) {
            // localStorage quota hatası varsa eski auth verilerini temizle
            logger.warn('localStorage quota exceeded, clearing old auth data', { error: quotaError });
            try {
              localStorage.removeItem('medikariyer-auth');
              logger.info('Cleared old auth data from localStorage');
            } catch (clearError) {
              logger.error('Failed to clear localStorage', { error: clearError });
            }
          }
          
          /**
           * State'i güncelle
           * 
           * Kullanıcı bilgilerini, token'ları ve authentication durumunu güncelle
           * Son giriş zamanını kaydet
           * Zustand persist middleware localStorage'a otomatik kaydedecek
           */
          set({
            user: userData,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            lastLoginAt: new Date().toISOString()
          });
        } catch (error) {
          /**
           * localStorage yazma hatası
           * 
           * Quota hatası veya başka bir localStorage hatası durumunda
           * Hata logla ve kullanıcıya bilgi ver
           */
          logger.error('Login state update error', { 
            error: error.message,
            errorName: error.name,
            stack: error.stack
          });
          
          // localStorage'ı temizle ve tekrar dene
          try {
            localStorage.removeItem('medikariyer-auth');
            // Tekrar dene
            set({
              user: userData,
              token: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
              lastLoginAt: new Date().toISOString()
            });
          } catch (retryError) {
            logger.error('Failed to retry login after localStorage clear', { error: retryError });
            // Hata devam ederse state'i güncelle ama localStorage'a yazma
            // Kullanıcı sayfa yenilendiğinde tekrar giriş yapmak zorunda kalacak
            set({
              user: userData,
              token: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
              lastLoginAt: new Date().toISOString()
            });
          }
        }
      },

      /**
       * Kullanıcı çıkışı yapar
       * 
       * Auth state'ini temizler
       * Zustand persist middleware ile localStorage'dan da otomatik temizlenir
       * 
       * Not: Yönlendirme yapmaz, component tarafında yapılmalıdır
       */
      logout: () => {
        /**
         * Zaten logout edilmişse tekrar logout yapma
         * 
         * Gereksiz state güncellemelerini önler
         */
        const currentState = get();
        if (!currentState.isAuthenticated) return;
        
        /**
         * ⚠️ CRITICAL: Kullanıcıya özel tüm localStorage cache'lerini temizle
         */
        try {
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            // Photo management cache'lerini temizle
            if (key.startsWith('doctor-photo-')) {
              localStorage.removeItem(key);
            }
          });
        } catch (_) {
          logger.warn('Failed to clear user-specific localStorage cache on logout');
        }
        
        /**
         * React Query cache'ini tamamen temizle
         */
        try {
          if (queryClientInstance) {
            queryClientInstance.clear();
            logger.info('React Query cache cleared on logout');
          } else if (window.__REACT_QUERY_CLIENT__) {
            window.__REACT_QUERY_CLIENT__.clear();
            logger.info('React Query cache cleared on logout (via window global)');
          }
        } catch (_) {
          logger.warn('Failed to clear React Query cache on logout');
        }
        
        /**
         * Auth state'ini temizle
         * 
         * Tüm auth bilgilerini sıfırla
         * Zustand persist middleware localStorage'ı otomatik temizler
         */
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginAt: null
        });
        
        /**
         * Not: Sayfa yenilenmesine neden olan kısmı kaldırdık
         * React Router ile yönlendirme yapılacak (component tarafında)
         */
      },

      /**
       * Auth state'ini temizler
       * 
       * logout() ile aynı işlevi görür
       * Ancak yönlendirme yapmaz (logout yapmaz)
       * 
       * Kullanım: Token expire olduğunda state'i temizlemek için
       */
      clearAuthState: () => {
        /**
         * Auth state'ini temizle
         * 
         * Zustand persist middleware otomatik olarak localStorage'ı temizleyecek
         * Storage key: 'medikariyer-auth'
         */
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginAt: null
        });
      },

      /**
       * Kullanıcı bilgilerini günceller
       * 
       * Mevcut user state'ini yeni verilerle merge eder
       * 
       * @param {Object} userData - Güncellenecek kullanıcı bilgileri
       */
      updateUser: (userData) => {
        /**
         * User state'ini güncelle
         * 
         * Mevcut user objesini spread edip yeni verilerle birleştir
         * Partial update yapılır (tüm alanlar güncellenmek zorunda değil)
         */
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      /**
       * Token'ları günceller
       * 
       * Token refresh işlemlerinde kullanılır
       * Access token ve refresh token'ı yeniler
       * 
       * @param {Object} tokens - Yeni token'lar
       * @param {string} tokens.accessToken - Yeni access token
       * @param {string} tokens.refreshToken - Yeni refresh token
       */
      updateTokens: (tokens) => {
        /**
         * Token güncelleme işlemini logla
         */
        logger.info('AuthStore updateTokens called', { 
          hasAccessToken: !!tokens?.accessToken,
          hasRefreshToken: !!tokens?.refreshToken
        });
        
        /**
         * Token state'ini güncelle
         * 
         * Yeni token'ları state'e kaydet
         * Zustand persist middleware ile localStorage'a otomatik kaydedilir
         */
        set({
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken
        });
      },

      /**
       * Loading durumunu ayarlar
       * 
       * @param {boolean} loading - Loading durumu (true/false)
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // ======================================================================
      // GETTERS - State okuma fonksiyonları
      // ======================================================================
      
      /**
       * Kullanıcı bilgisini döndürür
       * 
       * @returns {Object|null} Kullanıcı objesi veya null
       */
      getUser: () => get().user,
      
      /**
       * Access token'ı döndürür
       * 
       * @returns {string|null} JWT token veya null
       */
      getToken: () => get().token,
      
      /**
       * Refresh token'ı döndürür
       * 
       * @returns {string|null} JWT refresh token veya null
       */
      getRefreshToken: () => get().refreshToken,
      
      /**
       * Giriş yapılmış mı kontrol eder
       * 
       * @returns {boolean} isAuthenticated değeri
       */
      isLoggedIn: () => get().isAuthenticated,
      
      /**
       * Kullanıcı rolünü döndürür
       * 
       * @returns {string|null} Kullanıcı rolü (doctor, hospital, admin) veya null
       */
      getUserRole: () => get().user?.role || null,
      
      /**
       * Kullanıcı onaylı mı kontrol eder
       * 
       * Backend'den gelen is_approved değeri kontrol edilir
       * 1 (integer) veya true (boolean) formatı kabul edilir
       * 
       * @returns {boolean} Onaylı ise true, değilse false
       */
      isApproved: () => get().user?.is_approved === 1 || get().user?.is_approved === true,
      
      /**
       * Kullanıcı aktif mi kontrol eder
       * 
       * Backend'den gelen is_active değeri kontrol edilir
       * 1 (integer) veya true (boolean) formatı kabul edilir
       * 
       * @returns {boolean} Aktif ise true, değilse false
       */
      isActive: () => get().user?.is_active === 1 || get().user?.is_active === true,
      
      // ======================================================================
      // ROLE CHECKS - Rol kontrol fonksiyonları
      // ======================================================================
      // Tek kimlik yaklaşımına uygun: Bir kullanıcı tek bir role sahiptir
      
      /**
       * Kullanıcı doktor rolünde mi kontrol eder
       * 
       * @returns {boolean} Doctor rolünde ise true
       */
      isDoctor: () => get().user?.role === 'doctor',
      
      /**
       * Kullanıcı hastane rolünde mi kontrol eder
       * 
       * @returns {boolean} Hospital rolünde ise true
       */
      isHospital: () => get().user?.role === 'hospital',
      
      /**
       * Kullanıcı admin rolünde mi kontrol eder
       * 
       * @returns {boolean} Admin rolünde ise true
       */
      isAdmin: () => get().user?.role === 'admin',

      // ======================================================================
      // PERMISSION CHECKS - Yetki kontrol fonksiyonları
      // ======================================================================
      // Tek kimlik yaklaşımına uygun: Rol bazlı route erişim kontrolleri
      
      /**
       * Doktor route'larına erişim kontrolü
       * 
       * Kontroller:
       * - Kullanıcı authenticate olmuş mu
       * - Kullanıcı doctor rolünde mi
       * - Kullanıcı onaylı mı
       * 
       * @returns {boolean} Erişim izni varsa true
       */
      canAccessDoctorRoutes: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role === 'doctor' && 
               (state.user?.is_approved === 1 || state.user?.is_approved === true);
      },

      /**
       * Hastane route'larına erişim kontrolü
       * 
       * Kontroller:
       * - Kullanıcı authenticate olmuş mu
       * - Kullanıcı hospital rolünde mi
       * - Kullanıcı onaylı mı
       * 
       * @returns {boolean} Erişim izni varsa true
       */
      canAccessHospitalRoutes: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role === 'hospital' && 
               (state.user?.is_approved === 1 || state.user?.is_approved === true);
      },

      /**
       * Admin route'larına erişim kontrolü
       * 
       * Kontroller:
       * - Kullanıcı authenticate olmuş mu
       * - Kullanıcı admin rolünde mi
       * 
       * Not: Admin için onay kontrolü yok (admin otomatik onaylı)
       * 
       * @returns {boolean} Erişim izni varsa true
       */
      canAccessAdminRoutes: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role === 'admin';
      },

      /**
       * Genel rol bazlı erişim kontrolü
       * 
       * Herhangi bir rol için route erişim kontrolü yapar
       * 
       * Kontroller:
       * - Kullanıcı authenticate olmuş mu
       * - Kullanıcı belirtilen role sahip mi
       * - Admin ise direkt true döndürür
       * - Diğer roller için onay kontrolü yapar
       * 
       * @param {string} role - Kontrol edilecek rol (doctor, hospital, admin)
       * @returns {boolean} Erişim izni varsa true
       */
      canAccessRoleRoutes: (role) => {
        const state = get();
        
        /**
         * Temel kontroller
         * Authenticate olmamış veya rol eşleşmiyorsa false döndür
         */
        if (!state.isAuthenticated || state.user?.role !== role) {
          return false;
        }
        
        /**
         * Admin her zaman erişebilir
         * Admin rolü için onay kontrolü yapılmaz
         */
        if (role === 'admin') {
          return true;
        }
        
        /**
         * Diğer roller için onay gerekli
         * Doctor ve hospital rolleri için is_approved kontrolü yapılır
         */
        return state.user?.is_approved === 1 || state.user?.is_approved === true;
      },

      // ======================================================================
      // ACCOUNT STATUS CHECKS - Hesap durumu kontrol fonksiyonları
      // ======================================================================
      
      /**
       * Kullanıcı onay bekliyor mu kontrol eder
       * 
       * Kontroller:
       * - Kullanıcı authenticate olmuş mu
       * - Kullanıcı admin değil mi (admin otomatik onaylı)
       * - Kullanıcı onaylanmamış mı
       * 
       * @returns {boolean} Onay bekliyorsa true
       */
      isPendingApproval: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role !== 'admin' && 
               !(state.user?.is_approved === 1 || state.user?.is_approved === true);
      },

      /**
       * Hesap aktif mi kontrol eder
       * 
       * Kontroller:
       * - Kullanıcı authenticate olmuş mu
       * - Kullanıcı aktif mi (is_active === 1 veya true)
       * 
       * @returns {boolean} Aktif ise true
       */
      isAccountActive: () => {
        const state = get();
        return state.isAuthenticated && 
               (state.user?.is_active === 1 || state.user?.is_active === true);
      },

      // ======================================================================
      // PROFILE COMPLETION - Profil tamamlanma kontrolü
      // ======================================================================
      
      /**
       * Profil tamamlanma yüzdesini hesaplar
       * 
       * Gerekli ve opsiyonel alanları kontrol eder
       * Tamamlanma yüzdesini döndürür
       * 
       * Gerekli alanlar: email, full_name
       * Opsiyonel alanlar: phone, bio
       * 
       * @returns {number} Tamamlanma yüzdesi (0-100)
       */
      getProfileCompletion: () => {
        /**
         * Kullanıcı bilgisini al
         */
        const user = get().user;
        if (!user) return 0;

        /**
         * Alan tanımlamaları
         */
        const requiredFields = ['email', 'full_name'];
        const optionalFields = ['phone', 'bio'];
        
        /**
         * Tamamlanma sayacı
         */
        let completed = 0;
        let total = requiredFields.length + optionalFields.length;

        /**
         * Gerekli alanları kontrol et
         * 
         * Alan dolu ve boş string değilse tamamlanmış sayılır
         */
        requiredFields.forEach(field => {
          if (user[field] && user[field].toString().trim()) {
            completed++;
          }
        });

        /**
         * Opsiyonel alanları kontrol et
         * 
         * Alan dolu ve boş string değilse tamamlanmış sayılır
         */
        optionalFields.forEach(field => {
          if (user[field] && user[field].toString().trim()) {
            completed++;
          }
        });

        /**
         * Yüzde hesapla ve yuvarla
         * 
         * Math.round ile yuvarlanır (örn: 83.33 → 83)
         */
        return Math.round((completed / total) * 100);
      },

      // ======================================================================
      // SESSION MANAGEMENT - Oturum yönetimi fonksiyonları
      // ======================================================================
      
      /**
       * Token'ın süresi dolmuş mu kontrol eder
       * 
       * JWT token'ın exp claim'ini kontrol eder
       * Token yoksa veya parse hatası varsa true döndürür (expire olmuş sayılır)
       * 
       * @returns {boolean} Token expire olduysa true
       */
      isTokenExpired: () => {
        /**
         * Token'ı al
         */
        const token = get().token;
        
        /**
         * Token yoksa expire olmuş sayılır
         */
        if (!token) {
          return true;
        }

        try {
          /**
           * JWT token'ı parse et
           * 
           * Token formatı: header.payload.signature
           * payload base64 decode edilir ve JSON parse edilir
           */
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          /**
           * Expire kontrolü
           * 
           * payload.exp: Token'ın expire zamanı (Unix timestamp, saniye cinsinden)
           * currentTime: Şu anki zaman (Unix timestamp, saniye cinsinden)
           * 
           * exp <= currentTime ise token expire olmuştur
           */
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp <= currentTime;
          return isExpired;
        } catch (error) {
          /**
           * Parse hatası
           * 
           * Token formatı hatalıysa expire olmuş sayılır
           */
          return true;
        }
      },

      /**
       * Token yenilenmeli mi kontrol eder
       * 
       * Token'ın expire olmasına 5 dakika veya daha az kaldıysa
       * true döndürür (proaktif refresh için)
       * 
       * @returns {boolean} Token yenilenmeli ise true
       */
      shouldRefreshToken: () => {
        /**
         * Token'ı al
         */
        const token = get().token;
        
        /**
         * Token yoksa refresh gerekmez
         */
        if (!token) {
          return false;
        }

        try {
          /**
           * JWT token'ı parse et
           */
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          /**
           * Kalan süre hesapla
           * 
           * payload.exp: Expire zamanı (saniye)
           * currentTime: Şu anki zaman (saniye)
           * timeUntilExpiry: Kalan süre (saniye)
           */
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;
          
          /**
           * 5 dakika kontrolü
           * 
           * Kalan süre 300 saniye (5 dakika) veya daha az ise
           * Token yenilenmelidir (proaktif refresh)
           */
          const shouldRefresh = timeUntilExpiry <= 300; // 5 minutes in seconds
          return shouldRefresh;
        } catch (error) {
          /**
           * Parse hatası
           * 
           * Token formatı hatalıysa refresh gerekmez
           */
          return false;
        }
      },

      // ======================================================================
      // DATA MANAGEMENT - Veri yönetimi fonksiyonları
      // ======================================================================
      
      /**
       * Hassas verileri temizler
       * 
       * Token'ları ve authentication durumunu temizler
       * Kullanıcı bilgileri korunur
       * 
       * Kullanım: Token'ları temizlemek ama kullanıcı bilgisini tutmak için
       */
      clearSensitiveData: () => {
        set({
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },

      /**
       * Store'u sıfırlar
       * 
       * Tüm state'i başlangıç değerlerine döndürür
       * 
       * Kullanım: Store'u tamamen temizlemek için
       */
      reset: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          lastLoginAt: null
        });
      },

      /**
       * Stored token'dan initialize eder
       * 
       * Sayfa yenilendiğinde localStorage'dan token restore edilir
       * Token geçerli ise kullanıcı bilgisi fetch edilir
       * Token expire olmuşsa state temizlenir
       * 
       * Kullanım: Uygulama başlangıcında otomatik olarak çağrılır
       */
      initializeFromToken: () => {
        const state = get();
        
        /**
         * Zaten authenticated ise tekrar initialize etme
         * 
         * Gereksiz API çağrılarını önler
         */
        if (state.isAuthenticated && state.user) {
          return;
        }

        /**
         * Token varsa ve expire olmamışsa
         * Kullanıcı bilgisini fetch et
         */
        if (state.token && !state.isTokenExpired()) {
          /**
           * fetchUser'ı async olarak çağır ama await etme
           * 
           * Initialize işlemi blocking olmamalı
           * Hata durumunda sadece log'la, logout yapma
           */
          state.fetchUser().catch((error) => {
            logger.error('Failed to fetch user during initialization:', error);
            // Hata durumunda logout yapma, sadece log'la
          });
        } else {
          /**
           * Token yoksa veya expire olduysa
           * State'i temizle
           */
          state.clearAuthState();
        }
      },

      /**
       * localStorage'ı temizler ve state'i sıfırlar
       * 
       * Manuel olarak localStorage'ı temizler
       * State'i de sıfırlar
       * 
       * Kullanım: Manuel temizlik işlemleri için
       */
      clearStorage: () => {
        /**
         * localStorage'dan auth data'yı sil
         */
        localStorage.removeItem('medikariyer-auth');
        
        /**
         * State'i sıfırla
         */
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          lastLoginAt: null
        });
      }
    }),
    /**
     * Persist middleware konfigürasyonu
     * 
     * State'in localStorage'a kaydedilmesi için konfigürasyon
     */
    {
      /**
       * Storage key
       * 
       * localStorage'da kullanılacak key adı
       */
      name: 'medikariyer-auth',
      
      /**
       * Partialize fonksiyonu
       * 
       * State'in hangi kısımlarının persist edileceğini belirler
       * Sadece gerekli alanlar localStorage'a kaydedilir
       * User objesi sadece temel alanlarla sınırlandırılır (profile bilgileri hariç)
       * 
       * @param {Object} state - Store state
       * @returns {Object} Persist edilecek state kısımları
       */
      partialize: (state) => {
        // User objesini sadece gerekli alanlarla sınırlandır
        // Profile bilgileri localStorage'a kaydedilmez (çok büyük olabilir)
        const minimalUser = state.user ? {
          id: state.user.id,
          email: state.user.email,
          role: state.user.role,
          is_approved: state.user.is_approved,
          is_active: state.user.is_active,
          created_at: state.user.created_at,
          last_login: state.user.last_login,
          // Profile bilgileri localStorage'a kaydedilmez
          // Her zaman backend'den alınabilir
        } : null;

        return {
          user: minimalUser,
          token: state.token,
          refreshToken: state.refreshToken,
          /**
           * isAuthenticated hesaplama
           * 
           * user ve token varsa authenticated sayılır
           * Bu değer persist edilir ama her zaman hesaplanır
           */
          isAuthenticated: !!(state.user && state.user.id && state.token),
          lastLoginAt: state.lastLoginAt
        };
      },
      /**
       * Storage error handler
       * 
       * localStorage quota hatası durumunda çalışır
       * Eski verileri temizleyip tekrar denemeyi sağlar
       */
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          logger.error('localStorage rehydration error', { error });
          // localStorage hatası varsa temizle
          try {
            localStorage.removeItem('medikariyer-auth');
          } catch (e) {
            logger.error('Failed to clear localStorage', { error: e });
          }
        }
      }
    }
  )
);

// ============================================================================
// EXPORTS - Store export'ları
// ============================================================================

/**
 * useAuth alias export
 * 
 * Uyumluluk için alternative export
 * useAuthStore ile aynı store'u döndürür
 */
export const useAuth = useAuthStore;

/**
 * Named export
 * 
 * Direct import için: import { useAuthStore } from '@/store/authStore'
 */
export { useAuthStore };

/**
 * Default export
 * 
 * Direct import için: import useAuthStore from '@/store/authStore'
 */
export default useAuthStore;
