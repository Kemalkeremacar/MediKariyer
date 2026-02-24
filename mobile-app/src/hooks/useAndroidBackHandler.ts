/**
 * @file useAndroidBackHandler.ts
 * @description Android donanım geri tuşu kontrolü için hook
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **KULLANIM:**
 * ```typescript
 * useAndroidBackHandler(() => {
 *   // Özel geri tuşu davranışı
 *   navigation.goBack();
 *   return true; // Event'i tüket (varsayılan davranışı engelle)
 * });
 * ```
 */

import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android donanım geri tuşu için özel handler
 * @param handler - Geri tuşuna basıldığında çalışacak fonksiyon
 * @returns true ise event tüketilir (varsayılan davranış engellenir), false ise varsayılan davranış çalışır
 */
export const useAndroidBackHandler = (handler: () => boolean) => {
  useEffect(() => {
    // Geri tuşu event listener'ı ekle
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);

    // Cleanup: Component unmount olduğunda listener'ı kaldır
    return () => backHandler.remove();
  }, [handler]);
};
