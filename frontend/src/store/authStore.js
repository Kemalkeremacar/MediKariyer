/**
 * Auth Store - Authentication state management
 * Zustand ile kullanıcı authentication durumu
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../services/http/client';
import { ENDPOINTS } from '@config/api.js';
import logger from '../utils/logger';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      lastLoginAt: null,

      // Actions
      fetchUser: async () => {
        const state = get();
        
        if (!state.token) {
          return { success: false, message: 'Oturum tokenı bulunamadı.' };
        }
        
        // Token süresi dolmuşsa fetchUser'ı çağırma
        if (state.isTokenExpired && state.isTokenExpired()) {
          // Token süresi dolmuşsa state'i temizle ama logout çağırma
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            lastLoginAt: null
          });
          return { success: false, message: 'Token süresi dolmuş.' };
        }
        
        set({ isLoading: true });
        try {
          const response = await apiRequest.get(ENDPOINTS.AUTH.ME);
          const result = {
            success: response.data.success,
            data: response.data.data?.user,
            message: response.data.message
          };
          
          if (result.success && result.data) {
            set({
              user: result.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token geçersizse veya sunucu hatası oluşursa oturumu tamamen temizle
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
          return result;
        } catch (error) {
          console.error('fetchUser error:', error);
          // Hata durumunda oturumu temizle
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return { success: false, message: 'Kullanıcı bilgisi alınamadı.' };
        } finally {
          set({ isLoading: false });
        }
      },

      login: (userData, tokens) => {
        logger.info('AuthStore login called', { 
          user: userData?.email, 
          role: userData?.role,
          hasTokens: !!(tokens?.accessToken && tokens?.refreshToken)
        });
        
        set({
          user: userData,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          lastLoginAt: new Date().toISOString()
        });
      },

      logout: () => {
        // Zaten logout edilmişse tekrar logout yapma
        const currentState = get();
        if (!currentState.isAuthenticated) return;
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginAt: null
        });
        
        // Sayfa yenilenmesine neden olan kısmı kaldırdık
        // React Router ile yönlendirme yapılacak
      },

      clearAuthState: () => {
        // Sadece auth state'ini temizle, yönlendirme yapma
        // Zustand persist middleware otomatik olarak localStorage'ı temizleyecek
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginAt: null
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      updateTokens: (tokens) => {
        logger.info('AuthStore updateTokens called', { 
          hasAccessToken: !!tokens?.accessToken,
          hasRefreshToken: !!tokens?.refreshToken
        });
        
        set({
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
      getRefreshToken: () => get().refreshToken,
      isLoggedIn: () => get().isAuthenticated,
      getUserRole: () => get().user?.role || null,
      isApproved: () => get().user?.is_approved === 1 || get().user?.is_approved === true,
      isActive: () => get().user?.is_active === 1 || get().user?.is_active === true,
      
      // Role checks - Tek kimlik yaklaşımına uygun
      isDoctor: () => get().user?.role === 'doctor',
      isHospital: () => get().user?.role === 'hospital',
      isAdmin: () => get().user?.role === 'admin',

      // Permission checks - Tek kimlik yaklaşımına uygun
      canAccessDoctorRoutes: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role === 'doctor' && 
               (state.user?.is_approved === 1 || state.user?.is_approved === true);
      },

      canAccessHospitalRoutes: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role === 'hospital' && 
               (state.user?.is_approved === 1 || state.user?.is_approved === true);
      },

      canAccessAdminRoutes: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role === 'admin';
      },

      // Unified permission check
      canAccessRoleRoutes: (role) => {
        const state = get();
        if (!state.isAuthenticated || state.user?.role !== role) {
          return false;
        }
        
        // Admin her zaman erişebilir
        if (role === 'admin') {
          return true;
        }
        
        // Diğer roller için onay gerekli
        return state.user?.is_approved === 1 || state.user?.is_approved === true;
      },

      // Account status checks
      isPendingApproval: () => {
        const state = get();
        return state.isAuthenticated && 
               state.user?.role !== 'admin' && 
               !(state.user?.is_approved === 1 || state.user?.is_approved === true);
      },

      isAccountActive: () => {
        const state = get();
        return state.isAuthenticated && 
               (state.user?.is_active === 1 || state.user?.is_active === true);
      },

      // Profile completion
      getProfileCompletion: () => {
        const user = get().user;
        if (!user) return 0;

        const requiredFields = ['email', 'full_name'];
        const optionalFields = ['phone', 'bio'];
        
        let completed = 0;
        let total = requiredFields.length + optionalFields.length;

        requiredFields.forEach(field => {
          if (user[field] && user[field].toString().trim()) {
            completed++;
          }
        });

        optionalFields.forEach(field => {
          if (user[field] && user[field].toString().trim()) {
            completed++;
          }
        });

        return Math.round((completed / total) * 100);
      },

      // Session management
      isTokenExpired: () => {
        const token = get().token;
        if (!token) {
          return true;
        }

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp <= currentTime;
          return isExpired;
        } catch (error) {
          console.error('AuthStore - Token expiry check error:', error);
          return true;
        }
      },

      shouldRefreshToken: () => {
        const token = get().token;
        if (!token) {
          return false;
        }

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;
          const shouldRefresh = timeUntilExpiry <= 300; // 5 minutes in seconds
          return shouldRefresh;
        } catch (error) {
          console.error('AuthStore - Token refresh check error:', error);
          return false;
        }
      },

      // Clear sensitive data
      clearSensitiveData: () => {
        set({
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },

      // Reset store
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

      // Initialize from stored token
      initializeFromToken: () => {
        const state = get();
        
        // Eğer zaten authenticated ise tekrar initialize etme
        if (state.isAuthenticated && state.user) {
          return;
        }

        // Token varsa user bilgisini fetch et
        if (state.token && !state.isTokenExpired()) {
          // fetchUser'ı async olarak çağır ama await etme
          state.fetchUser().catch((error) => {
            logger.error('Failed to fetch user during initialization:', error);
            // Hata durumunda logout yapma, sadece log'la
          });
        } else {
          // Token yoksa veya expire olduysa state'i temizle
          state.clearAuthState();
        }
      },

      // Clear localStorage and reset state
      clearStorage: () => {
        localStorage.removeItem('medikariyer-auth');
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
    {
      name: 'medikariyer-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: !!(state.user && state.user.id && state.token),
        lastLoginAt: state.lastLoginAt
      })
    }
  )
);

// 🔑 Ek export ile uyumluluk sağlıyoruz
export const useAuth = useAuthStore;
export { useAuthStore };
export default useAuthStore;
