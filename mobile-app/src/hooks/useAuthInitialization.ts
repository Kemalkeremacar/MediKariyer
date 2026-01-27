/**
 * @file useAuthInitialization.ts
 * @description Uygulama başlangıcında kimlik doğrulama başlatma hook'u
 * 
 * Özellikler:
 * - SecureStore'dan token'ları doğrula
 * - Token süresini kontrol et
 * - Mobile API kullanarak kullanıcı verilerini getir (authService.getMe)
 * - Token'lar geçersiz/süresi dolmuşsa otomatik çıkış yap
 * - Network hatalarını zarif şekilde yönet (offline mod desteği)
 * 
 * ÖNEMLİ: Sadece /api/mobile/* endpoint'lerini authService üzerinden kullanır
 * 
 * İşlem Akışı:
 * 1. Token'ların varlığını ve geçerliliğini kontrol et
 * 2. Cihaz bağlamasını doğrula (güvenlik kontrolü)
 * 3. Kullanıcı verilerini API'den getir
 * 4. Başarılıysa authenticated olarak işaretle
 * 5. Başarısızsa (401) token'ları temizle ve unauthenticated olarak işaretle
 * 6. Network hatası varsa offline mod için persist edilmiş veriyi kullan
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/api/services/authService';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { REQUEST_TIMEOUT_MS } from '@/config/constants';
import { devLog } from '@/utils/devLogger';

export const useAuthInitialization = () => {
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setHydrating(true);
        
        // Sonsuz beklemeyi önlemek için timeout promise oluştur
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Auth başlatma zaman aşımı'));
          }, REQUEST_TIMEOUT_MS + 5000); // 5 saniye buffer ekle
        });

        // Başlatmayı timeout ile yarıştır
        await Promise.race([
          (async () => {
            // Token'ların var olup olmadığını ve geçerli JWT olup olmadığını kontrol et
            const isValid = await tokenManager.validateTokens();
            
            if (!isValid) {
              devLog.log('🔴 Geçerli token bulunamadı, unauthenticated olarak işaretleniyor');
              markUnauthenticated();
              return;
            }

            // Cihaz bağlamasını doğrula (güvenlik kontrolü)
            const isDeviceValid = await tokenManager.validateDeviceBinding();
            
            if (!isDeviceValid) {
              devLog.log('🔴 Cihaz bağlama doğrulaması başarısız, token\'lar farklı cihazdan');
              await tokenManager.clearTokens();
              markUnauthenticated();
              return;
            }
            
            // Mobile API servisi kullanarak kullanıcı verilerini getir
            // API client interceptor gerekirse token yenilemeyi otomatik olarak yönetir
            // Token süresi dolmuşsa, interceptor otomatik olarak yenileyecek
            try {
              devLog.log('🔵 Mobile API üzerinden kullanıcı verisi getiriliyor...');
              const user = await authService.getMe();
              
              // Kullanıcıyı kullanıcı verisi ile authenticated olarak işaretle
              // RootNavigator is_active ve is_approved kontrollerini yapacak
              markAuthenticated(user);
              devLog.log('✅ Kullanıcı verisi mobile API üzerinden başarıyla getirildi');
              
              // Push notification token'ını kaydet (arka planda, hata olsa bile devam et)
              pushNotificationService.registerDeviceToken().catch((error) => {
                devLog.warn('⚠️ Push notification token kaydedilemedi:', error);
              });
            } catch (error: any) {
              // Senaryo A: 403 Forbidden - Kullanıcı onay bekliyor (beklenen durum)
              const is403Error = error?.response?.status === 403;
              
              if (is403Error) {
                devLog.log('⏳ User pending approval - expected 403 from /auth/me (silent)');
                // Onay bekleyen kullanıcı için persist edilmiş veriyi kullan
                const persistedUser = useAuthStore.getState().user;
                if (persistedUser) {
                  devLog.log('✅ Onay bekleyen kullanıcı için persist edilmiş veri kullanılıyor');
                  markAuthenticated(persistedUser);
                } else {
                  devLog.log('⚠️ Persist edilmiş kullanıcı verisi yok, unauthenticated olarak işaretleniyor');
                  markUnauthenticated();
                }
                return;
              }
              
              // Senaryo B: 401 Unauthorized - Token süresi dolmuş veya geçersiz
              const isAuthError = error?.response?.status === 401 || error?.name === 'ApiError';
              
              if (isAuthError) {
                devLog.log('🔴 Kimlik doğrulama başarısız (401), token\'lar temizleniyor ve unauthenticated olarak işaretleniyor');
                await tokenManager.clearTokens();
                markUnauthenticated();
              } else {
                // Senaryo C: Network Hatası - Token\'ı tut, offline moda izin ver
                // Kullanıcı network müsait olduğunda tekrar deneyebilir
                devLog.warn('⚠️ Auth başlatma sırasında network hatası, offline mod için token tutuluyor:', error?.message);
                // Network hatasında token\'ları temizleme - kullanıcının cache\'lenmiş veri ile devam etmesine izin ver
                // Store\'da persist edilmiş kullanıcı verisi var mı kontrol et (önceki oturumdan)
                // Varsa, offline erişim için authenticated olarak işaretle
                // Yoksa, unauthenticated olarak işaretle (ilk giriş network gerektirir)
                const persistedUser = useAuthStore.getState().user;
                if (persistedUser) {
                  devLog.log('✅ Offline mod için persist edilmiş kullanıcı verisi kullanılıyor');
                  markAuthenticated(persistedUser);
                } else {
                  devLog.log('⚠️ Persist edilmiş kullanıcı verisi yok, unauthenticated olarak işaretleniyor');
                  markUnauthenticated();
                }
              }
            }
          })(),
          timeoutPromise,
        ]);
        
        // FIXED: Clear timeout if auth logic completes first (prevent memory leak)
        clearTimeout(timeoutId!);
      } catch (error) {
        // Timeout veya diğer hataları yönet
        if (error instanceof Error && error.message === 'Auth başlatma zaman aşımı') {
          devLog.warn('⚠️ Auth başlatma zaman aşımına uğradı, unauthenticated olarak işaretleniyor');
        } else {
          devLog.error('❌ Auth başlatma hatası:', error);
        }
        // Timeout veya hata durumunda, token\'ları temizle ve unauthenticated olarak işaretle
        try {
          await tokenManager.clearTokens();
        } catch (clearError) {
          devLog.error('Token\'lar temizlenemedi:', clearError);
        }
        markUnauthenticated();
      } finally {
        setHydrating(false);
      }
    };

    initializeAuth();
  }, [markAuthenticated, markUnauthenticated, setHydrating]);
};

