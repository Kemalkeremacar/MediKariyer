/**
 * @file navigationRef.ts
 * @description Navigation Referansı - Programatik navigasyon için
 * 
 * React component'leri dışından navigasyon yapılmasını sağlar.
 * Örnek kullanım alanları:
 * - Service'ler
 * - Utility fonksiyonları
 * - API interceptor'lar
 * - Push notification handler'ları
 * 
 * Kullanım:
 * ```typescript
 * import { navigationRef, navigate } from '@/navigation/navigationRef';
 * 
 * // Component dışından navigasyon
 * navigate('JobDetail', { id: 123 });
 * 
 * // Geri git
 * goBack();
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootNavigationParamList } from './types';

/**
 * Navigation referansı - Programatik navigasyon için
 * @description React component'leri dışından navigasyon yapılmasını sağlar
 */
export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();

/**
 * Programatik olarak bir ekrana git
 * @param name - Gidilecek ekran adı
 * @param params - Ekran parametreleri (opsiyonel)
 * 
 * @example
 * navigate('JobDetail', { id: 123 });
 */
export const navigate = (name: keyof RootNavigationParamList, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
};

/**
 * Önceki ekrana geri dön
 * @description Navigation stack'te geri gidilebiliyorsa geri gider
 */
export const goBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

/**
 * Navigation durumunu sıfırla
 * @param state - Yeni navigation durumu
 * 
 * @example
 * reset({
 *   index: 0,
 *   routes: [{ name: 'Login' }],
 * });
 */
export const reset = (state: Parameters<typeof navigationRef.reset>[0]) => {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  }
};

/**
 * Mevcut route adını al
 * @returns Mevcut route objesi veya undefined
 */
export const getCurrentRoute = () => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return undefined;
};

