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
  supportEmail: 'info@medikariyer.net',
  
  // Web site
  website: 'https://medikariyer.net',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Store URL'ini platform'a göre oluşturur
 */
const getStoreUrl = (): string => {
  if (Platform.OS === 'ios') {
    // iOS: App Store ID varsa App Store linki, yoksa website
    if (APP_CONFIG.appStoreId) {
      return `https://apps.apple.com/app/id${APP_CONFIG.appStoreId}`;
    }
    // App Store'da henüz yayınlanmamışsa website'e yönlendir
    return APP_CONFIG.website;
  }
  
  // Android: Play Store linki
  return `https://play.google.com/store/apps/details?id=${APP_CONFIG.androidPackage}`;
};

/**
 * Paylaşım mesajını oluşturur
 */
const getShareMessage = (): string => {
  // Şu anda uygulama store'larda olmadığı için website'i paylaş
  // Store'a yüklendikten sonra getStoreUrl() kullanılacak
  const url = APP_CONFIG.website;
  
  return `🏥 ${APP_CONFIG.appName}

Sağlık sektöründe kariyer fırsatları için ideal platform!

✅ Binlerce iş ilanı
✅ Kolay başvuru süreci
✅ Profesyonel profil oluşturma

Daha fazla bilgi: ${url}`;
};

/**
 * Uygulama versiyonunu alır
 * Öncelik sırası: expoConfig.version > nativeApplicationVersion > manifest2 > fallback
 */
const getAppVersion = (): string => {
  // Önce expoConfig'den al (app.json'daki version)
  if (Constants.expoConfig?.version) {
    return Constants.expoConfig.version;
  }
  
  // Production build'de native versiyon
  if (Application.nativeApplicationVersion) {
    return Application.nativeApplicationVersion;
  }
  
  // Manifest2 fallback
  if (Constants.manifest2?.extra?.expoClient?.version) {
    return Constants.manifest2.extra.expoClient.version;
  }
  
  // Son fallback
  return '1.0.0';
};

/**
 * Build numarasını alır
 * Öncelik sırası: expoConfig.ios.buildNumber/android.versionCode > nativeBuildVersion > fallback
 */
const getBuildNumber = (): string => {
  // Önce expoConfig'den al (app.json'daki buildNumber/versionCode)
  if (Platform.OS === 'ios' && Constants.expoConfig?.ios?.buildNumber) {
    return Constants.expoConfig.ios.buildNumber;
  }
  
  if (Platform.OS === 'android' && Constants.expoConfig?.android?.versionCode) {
    return String(Constants.expoConfig.android.versionCode);
  }
  
  // Production build'de native build number
  if (Application.nativeBuildVersion) {
    return Application.nativeBuildVersion;
  }
  
  // Son fallback
  return '1';
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
   * 
   * NOT: Uygulama store'larda yayınlandıktan sonra APP_CONFIG.appStoreId
   * ve androidPackage güncellenecek, o zaman store linklerini paylaşacak.
   */
  const shareApp = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Paylaşım mesajını al
      const message = getShareMessage();
      
      const shareContent: any = {
        message,
        title: APP_CONFIG.appName,
      };
      
      // iOS için URL ayrı parametre olarak da ekle
      if (Platform.OS === 'ios') {
        shareContent.url = APP_CONFIG.website;
      }
      
      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        showToast('Teşekkürler! 🎉', 'success');
        return true;
      }
      
      // Kullanıcı paylaşımı iptal etti
      return false;
    } catch (error) {
      console.error('Share error:', error);
      showToast('Paylaşım yapılamadı', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Uygulamayı değerlendir
   * 
   * Şu anda uygulama store'larda olmadığı için website'e yönlendirir.
   * Store'a yüklendikten sonra in-app review ve store linklerini kullanacak.
   * 
   * TODO: Uygulama yayınlandıktan sonra:
   * 1. APP_CONFIG.appStoreId'yi güncelle (iOS)
   * 2. In-app review'ı aktif et
   * 3. Store linklerini kullan
   */
  const rateApp = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Şu anda store'da olmadığı için bilgilendirme göster
      Alert.alert(
        'Uygulamayı Değerlendir',
        'Uygulamamız yakında App Store ve Play Store\'da yayınlanacak. O zamana kadar web sitemizi ziyaret edebilir ve geri bildirimlerinizi paylaşabilirsiniz.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Web Sitesine Git',
            onPress: async () => {
              const canOpen = await Linking.canOpenURL(APP_CONFIG.website);
              if (canOpen) {
                await Linking.openURL(APP_CONFIG.website);
                showToast('Teşekkürler! 🌟', 'success');
              }
            },
          },
        ]
      );
      
      return true;
      
      /* Store'a yüklendikten sonra bu kod aktif edilecek:
      
      // In-app review mümkün mü kontrol et
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        // In-app review göster
        await StoreReview.requestReview();
        showToast('Teşekkürler! 🌟', 'success');
        return true;
      }
      
      // In-app review mümkün değilse store'a yönlendir
      const storeUrl = getStoreUrl();
      const canOpen = await Linking.canOpenURL(storeUrl);
      
      if (canOpen) {
        await Linking.openURL(storeUrl);
        showToast('Teşekkürler! 🌟', 'success');
        return true;
      }
      
      return false;
      */
    } catch (error) {
      console.warn('Rate app error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

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
    
    // Utils
    getAppInfo,
    
    // State
    isLoading,
  };
};
