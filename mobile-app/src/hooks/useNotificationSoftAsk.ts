/**
 * @file useNotificationSoftAsk.ts
 * @description Bildirim izni için "soft ask" (yumuşak soru) akışını yöneten hook
 * 
 * ✅ STRATEJİ:
 * 1. Soft ask gösterilmeli mi kontrol et
 * 2. Özel modal göster (soft ask - kullanıcıya açıklama yap)
 * 3. Kullanıcı kabul ederse → sistem popup'ını göster
 * 4. Kullanıcı reddederse → Ayarlar'dan sonra açabilir
 * 
 * ⏰ ZAMANLAMA:
 * - ✅ İlk başvurudan sonra
 * - ✅ Dashboard'da (5 saniye gecikmeli)
 * - ❌ Login/onboarding sırasında DEĞİL
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { errorLogger } from '@/utils/errorLogger';

const SOFT_ASK_SHOWN_KEY = '@notification_soft_ask_shown';

export const useNotificationSoftAsk = () => {
  const [showSoftAsk, setShowSoftAsk] = useState(false);

  /**
   * Soft ask gösterilmeli mi kontrol et
   * 
   * Göster eğer:
   * 1. Daha önce gösterilmemişse
   * 2. İzin durumu 'undetermined' ise (hiç sorulmamış)
   */
  const checkShouldShowSoftAsk = useCallback(async (): Promise<boolean> => {
    try {
      // Daha önce gösterilmiş mi kontrol et
      const hasShownSoftAsk = await AsyncStorage.getItem(SOFT_ASK_SHOWN_KEY);
      if (hasShownSoftAsk === 'true') {
        return false;
      }

      // İzin durumunu kontrol et
      const { status } = await Notifications.getPermissionsAsync();
      
      // Sadece hiç sorulmamışsa göster (undetermined)
      if (status === 'undetermined') {
        return true;
      }

      return false;
    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'useNotificationSoftAsk - checkShouldShowSoftAsk',
      });
      return false;
    }
  }, []);

  /**
   * Soft ask modal'ını tetikle
   * Doğru zamanda çağır (ilk başvurudan sonra, dashboard'da, vb.)
   */
  const triggerSoftAsk = useCallback(async () => {
    const shouldShow = await checkShouldShowSoftAsk();
    if (shouldShow) {
      setShowSoftAsk(true);
    }
  }, [checkShouldShowSoftAsk]);

  /**
   * Kullanıcı kabul etti - sistem popup'ını göster
   */
  const handleAccept = useCallback(async () => {
    try {
      // 1. Önce soft ask modal'ını kapat
      setShowSoftAsk(false);
      
      // 2. Gösterildi olarak işaretle (bir daha gösterme)
      await AsyncStorage.setItem(SOFT_ASK_SHOWN_KEY, 'true');

      // 3. Modal tamamen kapanması için küçük bir gecikme
      // Bu, hem iOS hem Android'de görsel hataları önler
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. ŞİMDİ sistem popup'ını göster
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        // Cihaz token'ını kaydet
        await pushNotificationService.registerDeviceToken();
      }
    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'useNotificationSoftAsk - handleAccept',
      });
      // Hata olsa bile modal zaten kapatıldı (adım 1)
    }
  }, []);

  /**
   * Kullanıcı reddetti - Ayarlar'dan sonra açabilir
   */
  const handleDecline = useCallback(async () => {
    try {
      // Soft ask modal'ını kapat
      setShowSoftAsk(false);
      
      // Gösterildi olarak işaretle (bir daha gösterme)
      await AsyncStorage.setItem(SOFT_ASK_SHOWN_KEY, 'true');
      
      // Kullanıcı isterse Ayarlar'dan sonra açabilir
    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'useNotificationSoftAsk - handleDecline',
      });
    }
  }, []);

  /**
   * Soft ask'ı sıfırla (test için)
   * Soft ask'ı tekrar göstermek için çağır
   */
  const resetSoftAsk = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SOFT_ASK_SHOWN_KEY);
    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'useNotificationSoftAsk - resetSoftAsk',
      });
    }
  }, []);

  return {
    showSoftAsk,
    triggerSoftAsk,
    handleAccept,
    handleDecline,
    resetSoftAsk, // Sadece test için
  };
};
