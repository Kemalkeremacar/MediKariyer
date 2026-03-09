/**
 * @file useLogin.ts
 * @description Giriş yapma işlevi hook'u
 * 
 * Bu hook kullanıcı girişini yönetir. Token saklama, auth state güncelleme
 * ve navigasyon işlemlerini otomatik olarak halleder.
 * 
 * **KRİTİK:** Bu hook birçok yan etki içerir:
 * - Token'ları secure storage'a kaydet
 * - Auth state'i güncelle
 * - Query cache'i temizle
 * - Navigasyonu sıfırla
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { navigationRef } from '@/navigation/navigationRef';
import { devLog } from '@/utils/devLogger';
import type { LoginPayload, AuthResponsePayload } from '@/types/auth';

/**
 * Login callback tipleri
 * 
 * @interface UseLoginCallbacks
 * @property {Function} [onSuccess] - Başarılı girişte çağrılır
 * @property {Function} [onError] - Hata oluştuğunda çağrılır
 * @property {Function} [onSettled] - Her durumda çağrılır
 */
interface UseLoginCallbacks {
  onSuccess?: (data: AuthResponsePayload) => void | Promise<void>;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/**
 * Giriş yapma hook'u
 * 
 * **İşleyiş Sırası:**
 * 1. Kullanıcı bilgileri ile API'ye istek gönder
 * 2. Token'ları secure storage'a kaydet
 * 3. Auth state'i güncelle (kullanıcı bilgileri)
 * 4. Hydration flag'ini false yap (splash screen'i kapat)
 * 5. Query cache'i temizle (önceki kullanıcı verilerini sil)
 * 6. Navigasyonu App ekranına sıfırla
 * 7. Callback'leri çağır
 * 
 * **Kullanım:**
 * ```tsx
 * const login = useLogin({
 *   onSuccess: () => {
 *     alert.success('Hoşgeldiniz!');
 *   },
 *   onError: (error) => {
 *     alert.error(error.message);
 *   }
 * });
 * 
 * login.mutate({ email: 'user@example.com', password: '123456' });
 * ```
 * 
 * @param callbacks - Başarı, hata ve settled callback'leri
 * @returns React Query mutation objesi
 */
export const useLogin = (callbacks?: UseLoginCallbacks) => {
  const setAuthState = useAuthStore((state) => state.markAuthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      // Login API çağrısı
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data) => {
      devLog.log('🔐 useLogin onSuccess - Starting auth setup...');
      
      /**
       * 1. Token'ları kaydet
       * Access ve refresh token'ları secure storage'a kaydet
       */
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      devLog.log('🔐 useLogin onSuccess - Tokens saved');
      
      /**
       * 2. Auth state'i güncelle
       * Kullanıcı bilgilerini store'a kaydet ve authenticated durumuna geç
       */
      setAuthState(data.user);
      devLog.log('🔐 useLogin onSuccess - Auth state updated');
      
      /**
       * 3. Hydration flag'ini false yap
       * KRİTİK: Bu olmadan RootNavigator Auth ekranını göstermeye devam eder
       */
      setHydrating(false);
      devLog.log('🔐 useLogin onSuccess - Hydration set to false');
      
      // State güncellemesini doğrula
      const currentState = useAuthStore.getState();
      devLog.log('🔐 useLogin onSuccess - Current auth state:', {
        authStatus: currentState.authStatus,
        hasUser: !!currentState.user,
        userId: currentState.user?.id,
        isActive: currentState.user?.is_active,
        isApproved: currentState.user?.is_approved,
        isHydrating: currentState.isHydrating,
      });

      /**
       * 4. Query cache'i temizle
       * Önceki kullanıcının verilerinin yeni kullanıcıya gösterilmemesi için
       * tüm cache'i temizle
       */
      queryClient.clear();
      
      /**
       * 4.5. Push notification token'ını kaydet
       * Arka planda çalışır, hata olsa bile devam eder
       */
      pushNotificationService.registerDeviceToken().catch((error) => {
        devLog.warn('⚠️ Push notification token kaydedilemedi:', error);
      });

      /**
       * 5. Navigasyonu sıfırla
       * KRİTİK: React Navigation'ın initialRouteName'i sadece ilk render'da çalışır.
       * Bu yüzden login sonrası manuel olarak navigasyonu sıfırlamalıyız.
       * 
       * requestAnimationFrame kullanarak state güncellemelerinin
       * flush edilmesini bekleriz.
       */
      requestAnimationFrame(() => {
        if (navigationRef.isReady()) {
          /**
           * Kullanıcı durumunu kontrol et
           * Tip güvenli kontroller (boolean, number, string)
           */
          const isApproved = 
            data.user.is_approved === true || 
            data.user.is_approved === 1 || 
            (typeof data.user.is_approved === 'string' && (data.user.is_approved === 'true' || data.user.is_approved === '1'));
          const isActive = 
            data.user.is_active === true || 
            data.user.is_active === 1 || 
            (typeof data.user.is_active === 'string' && (data.user.is_active === 'true' || data.user.is_active === '1'));
          const isOnboardingSeen = 
            data.user.is_onboarding_seen === true || 
            data.user.is_onboarding_seen === 1 || 
            (typeof data.user.is_onboarding_seen === 'string' && (data.user.is_onboarding_seen === 'true' || data.user.is_onboarding_seen === '1'));
          const isAdmin = data.user.role === 'admin';
          
          // Aktif, onaylı VE onboarding tamamlamış kullanıcıları App ekranına yönlendir
          if (isActive && (isApproved || isAdmin) && isOnboardingSeen) {
            devLog.log('🔐 useLogin onSuccess - Resetting navigation to App screen');
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'App' }],
            });
            devLog.log('🔐 useLogin onSuccess - Navigation reset completed');
          } else if (isActive && (isApproved || isAdmin) && !isOnboardingSeen) {
            // Onaylı ama onboarding görmemiş - Onboarding ekranına yönlendir
            devLog.log('🔐 useLogin onSuccess - User approved but onboarding not seen, navigating to Onboarding');
            navigationRef.reset({
              index: 0,
              routes: [{ 
                name: 'Auth',
                state: {
                  routes: [{ name: 'Onboarding' }],
                },
              }],
            });
            devLog.log('🔐 useLogin onSuccess - Navigation to Onboarding completed');
          } else if (isActive && !isApproved && !isAdmin) {
            // Onaysız kullanıcı - PendingApproval ekranına yönlendir
            devLog.log('🔐 useLogin onSuccess - User not approved, navigating to PendingApproval');
            navigationRef.reset({
              index: 0,
              routes: [{ 
                name: 'Auth',
                state: {
                  routes: [{ name: 'PendingApproval' }],
                },
              }],
            });
            devLog.log('🔐 useLogin onSuccess - Navigation to PendingApproval completed');
          } else {
            devLog.log('🔐 useLogin onSuccess - Unexpected state, letting RootNavigator handle navigation');
          }
        } else {
          devLog.log('🔐 useLogin onSuccess - Navigation ref not ready, RootNavigator will handle navigation');
        }
      });

      /**
       * 6. Callback'leri çağır
       * Kullanıcı tanımlı ek yan etkileri çalıştır
       */
      await callbacks?.onSuccess?.(data);
      devLog.log('🔐 useLogin onSuccess - Callbacks completed');
    },
    onError: (error) => {
      // Hata callback'ini çağır
      callbacks?.onError?.(error);
    },
    onSettled: () => {
      // Her durumda çağrılacak callback
      callbacks?.onSettled?.();
    },
  });
};
