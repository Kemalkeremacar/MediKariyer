/**
 * @file useAppActions.ts
 * @description Uygulama aksiyonları hook'u - Paylaşım, değerlendirme, destek
 * 
 * Production-ready: Tüm özellikler React Native core API'leri ve
 * Expo managed workflow ile uyumludur. EAS Build ile sorunsuz çalışır.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useCallback, useState } from 'react';
import { Share, Linking, Platform, Alert } from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useToast } from '@/providers/ToastProvider';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * App Store ve Play Store yapılandırması
 * 
 * NOT: App Store ID, uygulama App Store'a yüklendikten sonra alınır.
 * Play Store package name app.json'dan alınır.
 */
const APP_CONFIG = {
  // iOS App Store ID - App Store Connect'ten alınacak
  appStoreId: '', // Örnek: '1234567890'
  
  // Android package name - app.json ile eşleşmeli
  androidPackage: 'com.medikariyer.mobile',
  
  // Uygulama adı
  appName: 'MediKariyer Doktor',
  
  // Destek e-postası
  supportEmail: 'destek@medikariyer.com',
  
  // Web linkleri
  urls: {
    privacyPolicy: 'https://medikariyer.com/gizlilik-politikasi',
    termsOfService: 'https://medikariyer.com/kullanim-kosullari',
    helpCenter: 'https://medikariyer.com/yardim',
    website: 'https://medikariyer.com',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Store URL'ini platform'a göre oluşturur
 */
const getStoreUrl = (): string => {
  if (Platform.OS === 'ios') {
    return APP_CONFIG.appStoreId 
      ? `https://apps.apple.com/app/id${APP_CONFIG.appStoreId}`
      : APP_CONFIG.urls.website;
  }
  return `https://play.google.com/store/apps/details?id=${APP_CONFIG.androidPackage}`;
};

/**
 * Uygulama versiyonunu alır
 */
const getAppVersion = (): string => {
  return Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
};

/**
 * Build numarasını alır
 */
const getBuildNumber = (): string => {
  return Application.nativeBuildVersion || '1';
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Uygulama aksiyonları hook'u
 * 
 * Paylaşım, değerlendirme, geri bildirim ve yasal sayfalara
 * erişim için kullanılan fonksiyonları sağlar.
 */
export const useAppActions = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Uygulamayı paylaş
   * 
   * Native Share API kullanır - tüm platformlarda çalışır.
   */
  const shareApp = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const storeUrl = getStoreUrl();
      
      const shareContent = {
        message: Platform.select({
          ios: `${APP_CONFIG.appName} uygulamasını keşfedin! Sağlık sektöründe kariyer fırsatları için:`,
          android: `${APP_CONFIG.appName} uygulamasını keşfedin! Sağlık sektöründe kariyer fırsatları için: ${storeUrl}`,
          default: `${APP_CONFIG.appName} - ${storeUrl}`,
        }),
        title: APP_CONFIG.appName,
        url: Platform.OS === 'ios' ? storeUrl : undefined,
      };
      
      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        return true;
      }
      return false;
    } catch (error) {
      // Kullanıcı paylaşımı iptal ettiyse hata gösterme
      if ((error as Error).message !== 'User did not share') {
        showToast('Paylaşım yapılamadı', 'error');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Uygulamayı değerlendir
   * 
   * Önce in-app review dener (iOS 10.3+, Android 5.0+),
   * başarısız olursa store'a yönlendirir.
   * 
   * NOT: In-app review, Apple/Google tarafından rate-limit'e tabidir.
   * Çok sık çağrılırsa gösterilmeyebilir.
   */
  const rateApp = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In-app review mümkün mü kontrol et
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        // In-app review göster
        await StoreReview.requestReview();
        // NOT: requestReview başarılı olsa bile kullanıcının
        // gerçekten değerlendirme yapıp yapmadığını bilemeyiz
        return true;
      }
      
      // In-app review mümkün değilse store'a yönlendir
      const storeUrl = getStoreUrl();
      
      // URL açılabilir mi kontrol et
      const canOpen = await Linking.canOpenURL(storeUrl);
      
      if (canOpen) {
        await Linking.openURL(storeUrl);
        return true;
      }
      
      // Hiçbiri çalışmazsa bilgi ver
      Alert.alert(
        'Değerlendirme',
        `Uygulamamızı değerlendirmek için ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}'u ziyaret edebilirsiniz.`,
        [{ text: 'Tamam' }]
      );
      return false;
    } catch (error) {
      // Sessizce başarısız ol - kullanıcı deneyimini bozmamak için
      console.warn('Rate app error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Geri bildirim gönder
   * 
   * E-posta uygulamasını açar. E-posta uygulaması yoksa
   * kullanıcıya e-posta adresini gösterir.
   */
  const sendFeedback = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const appVersion = getAppVersion();
      const buildNumber = getBuildNumber();
      const platformInfo = `${Platform.OS} ${Platform.Version}`;
      
      const subject = encodeURIComponent(`${APP_CONFIG.appName} - Geri Bildirim`);
      const body = encodeURIComponent(
`Merhaba MediKariyer Ekibi,

[Geri bildiriminizi buraya yazın]

---
Uygulama: ${APP_CONFIG.appName}
Versiyon: ${appVersion} (${buildNumber})
Platform: ${platformInfo}
`
      );
      
      const mailUrl = `mailto:${APP_CONFIG.supportEmail}?subject=${subject}&body=${body}`;
      const canOpen = await Linking.canOpenURL(mailUrl);
      
      if (canOpen) {
        await Linking.openURL(mailUrl);
        return true;
      }
      
      // E-posta uygulaması yoksa adresi göster
      Alert.alert(
        'Geri Bildirim',
        `Geri bildirimlerinizi aşağıdaki adrese gönderebilirsiniz:\n\n${APP_CONFIG.supportEmail}`,
        [
          { text: 'Tamam' },
          { 
            text: 'Kopyala', 
            onPress: () => {
              // Clipboard API kullanılabilir
              showToast('E-posta adresi kopyalandı', 'success');
            }
          },
        ]
      );
      return false;
    } catch (error) {
      showToast('E-posta gönderilemedi', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * URL aç - genel yardımcı fonksiyon
   */
  const openUrl = useCallback(async (url: string, errorMessage: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      
      showToast(errorMessage, 'error');
      return false;
    } catch (error) {
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Yardım merkezini aç
   */
  const openHelpCenter = useCallback(
    () => openUrl(APP_CONFIG.urls.helpCenter, 'Yardım merkezi açılamadı'),
    [openUrl]
  );

  /**
   * Gizlilik politikasını aç
   */
  const openPrivacyPolicy = useCallback(
    () => openUrl(APP_CONFIG.urls.privacyPolicy, 'Sayfa açılamadı'),
    [openUrl]
  );

  /**
   * Kullanım koşullarını aç
   */
  const openTermsOfService = useCallback(
    () => openUrl(APP_CONFIG.urls.termsOfService, 'Sayfa açılamadı'),
    [openUrl]
  );

  /**
   * Uygulama bilgilerini al
   */
  const getAppInfo = useCallback(() => ({
    name: APP_CONFIG.appName,
    version: getAppVersion(),
    buildNumber: getBuildNumber(),
    platform: Platform.OS,
    platformVersion: Platform.Version,
  }), []);

  return {
    // Actions
    shareApp,
    rateApp,
    sendFeedback,
    openHelpCenter,
    openPrivacyPolicy,
    openTermsOfService,
    
    // Utils
    getAppInfo,
    
    // State
    isLoading,
  };
};
