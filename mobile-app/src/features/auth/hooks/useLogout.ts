/**
 * @file useLogout.ts
 * @description Çıkış yapma işlevi hook'u
 * 
 * Bu hook kullanıcı çıkışını yönetir. Token temizleme, auth state sıfırlama,
 * cache temizleme ve navigasyon işlemlerini otomatik olarak halleder.
 * 
 * **KRİTİK:** Bu hook birçok yan etki içerir:
 * - Backend'e logout isteği gönder
 * - Token'ları secure storage'dan sil
 * - Query cache'i temizle
 * - Auth state'i sıfırla
 * - Navigasyonu Auth ekranına sıfırla
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/api/services/authService';
import { navigationRef } from '@/navigation/navigationRef';
import { devLog } from '@/utils/devLogger';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Çıkış yapma hook'u
 * 
 * **İşleyiş Sırası:**
 * 1. Backend'e logout isteği gönder (refresh token ile)
 * 2. Token'ları secure storage'dan sil
 * 3. Query cache'i temizle (kullanıcı verilerini sil)
 * 4. Auth state'i sıfırla (unauthenticated)
 * 5. Hydration flag'ini false yap
 * 6. Navigasyonu Auth ekranına sıfırla
 * 
 * **ÖNEMLİ:** API çağrısı başarısız olsa bile yerel temizlik yapılır.
 * Bu, kullanıcının her durumda çıkış yapabilmesini sağlar.
 * 
 * **Kullanım:**
 * ```tsx
 * const logout = useLogout();
 * 
 * const handleLogout = () => {
 *   logout.mutate();
 * };
 * ```
 * 
 * @returns React Query mutation objesi
 */
export const useLogout = () => {
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      devLog.log('🔴 useLogout - Starting logout process...');
      
      try {
        // Get refresh token
        const refreshToken = await tokenManager.getRefreshToken();
        
        // Call logout API if refresh token exists
        if (refreshToken) {
          devLog.log('🔴 useLogout - Calling logout API...');
          await authService.logout(refreshToken);
          devLog.log('🔴 useLogout - Logout API call successful');
        } else {
          devLog.log('🔴 useLogout - No refresh token found, skipping API call');
        }
      } catch (error) {
        // Even if API call fails, we still want to clear local data
        devLog.warn('🔴 useLogout - Logout API call failed, continuing with local cleanup:', error);
      }
      
      // Clear tokens from secure storage
      devLog.log('🔴 useLogout - Clearing tokens...');
      await tokenManager.clearTokens();
      
      // FIXED: Clear persisted auth state from AsyncStorage
      // This ensures no old user data remains after logout
      devLog.log('🔴 useLogout - Clearing persisted auth state...');
      try {
        await AsyncStorage.removeItem('auth-storage');
      } catch (error) {
        devLog.warn('🔴 useLogout - Failed to clear AsyncStorage:', error);
        // Don't throw - continue with logout
      }
      
      // Clear all user-scoped query cache so no data from the previous user leaks
      devLog.log('🔴 useLogout - Clearing query cache...');
      queryClient.clear();
      
      // Clear auth state
      devLog.log('🔴 useLogout - Marking unauthenticated...');
      markUnauthenticated();
      
      // CRITICAL: Set isHydrating to false after logout
      // This ensures RootNavigator shows Auth screen properly (not splash screen)
      setHydrating(false);
      devLog.log('🔴 useLogout - Hydration set to false');
      
      // CRITICAL: Reset navigation to Auth screen
      // React Navigation's initialRouteName only works on first render,
      // so we need to manually reset navigation after logout
      if (navigationRef.isReady()) {
        devLog.log('🔴 useLogout - Resetting navigation to Auth screen...');
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
        devLog.log('🔴 useLogout - Navigation reset to Auth screen');
      } else {
        devLog.warn('🔴 useLogout - Navigation ref not ready, navigation will be handled by RootNavigator');
      }
      
      // Verify state was cleared
      const currentState = useAuthStore.getState();
      devLog.log('🔴 useLogout - Final auth state:', {
        authStatus: currentState.authStatus,
        hasUser: !!currentState.user,
        isHydrating: currentState.isHydrating,
      });
    },
  });
};
