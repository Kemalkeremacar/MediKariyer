/**
 * @file App.tsx
 * @description MediKariyer Mobile uygulamasının ana giriş dosyası.
 * Provider hiyerarşisi, deep linking, splash screen yönetimi ve global ayarlar bu dosyada yapılandırılır.
 * 
 * ⚠️ PROVIDER HİYERARŞİSİ - MİMARİ KURAL
 * ═══════════════════════════════════════════════════════
 * BottomSheetModalProvider ROOT seviyesinde OLMALIDIR.
 * Bu, uygulamanın tamamında bulunması gereken TEK yerdir.
 * 
 * YASAK (Select/BottomSheet bileşenlerini bozar):
 * - BottomSheetModalProvider'ı HERHANGİ bir component içine eklemek
 * - BottomSheetModalProvider'ı HERHANGİ bir screen içine eklemek
 * - Select içeren ekranlar için `presentation: 'modal'` kullanmak
 * 
 * Provider Yığını (SIRAYI DEĞİŞTİRMEYİN):
 * GestureHandlerRootView
 * └── SafeAreaProvider
 *     └── PortalProvider
 *         └── BottomSheetModalProvider ← TEKİL, ROOT SEVİYESİ
 *             └── AppProviders
 *                 └── NavigationContainer
 *         └── PortalHost ("root") ← Toast/Alert burada render edilir
 * 
 * Detaylı bilgi için: src/ARCHITECTURE.md
 * ═══════════════════════════════════════════════════════
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useEffect, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PortalProvider, PortalHost } from '@gorhom/portal';
import { BottomSheetModalProvider, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { AppProviders } from '@/providers/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthInitializer } from '@/providers/AuthInitializer';
import { navigationRef } from '@/navigation/navigationRef';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { OfflineNotice } from '@/components/feedback/OfflineNotice';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';
import { StyleSheet, Text, TextInput } from 'react-native';
import { errorLogger } from '@/utils/errorLogger';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
// i18n konfigürasyonu - uygulama başlangıcında yüklenir
import '@/config/i18n';

// Splash screen'i asset yükleme tamamlanana kadar otomatik gizlenmesini engelle
SplashScreen.preventAutoHideAsync();

// Production ortamında hata takibi için Sentry'yi başlat
// Sentry DSN'inizi .env dosyasında EXPO_PUBLIC_SENTRY_DSN olarak ayarlayın
if (env.SENTRY_DSN) {
  errorLogger.initSentry({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    tracesSampleRate: 0.2,
  });
}

/**
 * AppContent - Push notification ve deep linking yönetimi
 * @description İç uygulama bileşeni, axios interceptor, push notification ve deep linking'i başlatır
 */
const AppContent = () => {
  // Axios interceptor'ı başlat (navigation entegrasyonu için)
  useAxiosInterceptor();
  // Push notification'ları başlat
  usePushNotifications();
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Hydration tamamlandığında splash screen'i gizle
  useEffect(() => {
    if (!isHydrating) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Splash screen gizlenemedi:', error);
          // Hata olsa bile devam et
        }
      };
      hideSplash();
    }
  }, [isHydrating]);

  // Deep link navigasyonunu yönet
  const handleDeepLink = useCallback((url: string) => {
    if (!navigationRef.isReady()) {
      // Navigation hazır olana kadar bekle
      setTimeout(() => handleDeepLink(url), 100);
      return;
    }

    try {
      const { path, queryParams } = Linking.parse(url);
      
      // Şifre sıfırlama deep link'ini yönet: medikariyer://reset-password?token=...
      if (path === 'reset-password' && queryParams?.token) {
        // Önce Auth stack'e, sonra ResetPassword ekranına yönlendir
        // @ts-expect-error - İç içe navigation tip sorunu, ancak runtime'da çalışır
        navigationRef.navigate('Auth', {
          screen: 'ResetPassword',
          params: { token: queryParams.token as string },
        });
      }
    } catch (error) {
      console.error('Deep link işlenirken hata:', error);
    }
  }, []);

  // Şifre sıfırlama için deep linking handler
  useEffect(() => {
    // İlk URL'i işle (uygulama deep link ile açıldığında)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // URL değişikliklerini işle (uygulama zaten açıkken deep link geldiğinde)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return (
    <>
      {/* Global Çevrimdışı Bildirimi - İnternet bağlantısı kesildiğinde üstte gösterilir */}
      <OfflineNotice />
      
      <AuthInitializer />
      <RootNavigator />
    </>
  );
};

export default function App() {
  useEffect(() => {
    // Tutarlı UI için font ölçeklendirmeyi global olarak devre dışı bırak
    // @ts-ignore
    Text.defaultProps = Text.defaultProps || {};
    // @ts-ignore
    Text.defaultProps.allowFontScaling = false;
    // @ts-ignore
    TextInput.defaultProps = TextInput.defaultProps || {};
    // @ts-ignore
    TextInput.defaultProps.allowFontScaling = false;
  }, []);

  // Yedek: Maksimum bekleme süresinden (5 saniye) sonra splash screen'i gizle
  // Bu, bir şeyler ters giderse splash screen'in sonsuza kadar kalmamasını sağlar
  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        // Hataları yoksay
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  /**
   * Provider Hiyerarşisi (Z-Index için optimize edilmiş):
   * 
   * GestureHandlerRootView
   * └── SafeAreaProvider
   *     └── PortalProvider
   *         └── BottomSheetModalProvider (ROOT SEVİYESİ - Select/BottomSheet için kritik)
   *             └── AppProviders (QueryClient, Theme, Alert, Toast)
   *                 └── ErrorBoundary
   *                     └── NavigationContainer
   *                         └── AppContent
   *         └── PortalHost (name="root") - Toast/Alert overlay'leri için
   */
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider style={styles.container}>
        <PortalProvider>
          {/* BottomSheetModalProvider ROOT seviyesinde - Select'in navigation üzerinde render edilmesini sağlar */}
          <BottomSheetModalProvider>
            <AppProviders>
              {/* ErrorBoundary NavigationContainer'ı sarar - tüm JS hatalarını yakalar */}
              <ErrorBoundary>
                <NavigationContainer ref={navigationRef}>
                  <AppContent />
                </NavigationContainer>
              </ErrorBoundary>
            </AppProviders>
          </BottomSheetModalProvider>
          {/* Global Portal Host - Tüm global overlay'leri render eder (Toast, Alert, vb.) */}
          <PortalHost name="root" />
        </PortalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Tablet için beyaz background
  },
});
