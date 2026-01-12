/**
 * @file useNetworkStatus.ts
 * @description Network Bağlantı Durumu Hook'u
 * 
 * Özellikler:
 * - İnternet bağlantı durumunu izler
 * - Reaktif state sağlar (offline awareness)
 * - Uygulama genelinde offline durumu yönetimi
 * - Manuel yenileme desteği
 * 
 * Kullanım:
 * ```typescript
 * const { isOffline, isConnected, refresh } = useNetworkStatus();
 * 
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// ============================================================================
// TİPLER
// ============================================================================

// Network durumu tipi
interface NetworkStatus {
  /** Cihaz bir ağa bağlı mı? */
  isConnected: boolean | null;
  /** İnternet gerçekten erişilebilir mi? */
  isInternetReachable: boolean | null;
  /** Kolaylık flag'i: offline ise true */
  isOffline: boolean;
  /** Ağ tipi (wifi, cellular, vb.) */
  type: string | null;
  /** Manuel olarak network durumunu yenile */
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Network bağlantı durumunu izleyen hook
 * 
 * @returns Network durumu ve aksiyonları
 * 
 * @example
 * ```tsx
 * const { isOffline, isConnected, refresh } = useNetworkStatus();
 * 
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * 
 * // Manuel yenileme
 * <Button onPress={refresh} title="Yenile" />
 * ```
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [type, setType] = useState<string | null>(null);

  // Network değişikliği handler'ı
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    setIsConnected(state.isConnected);
    setIsInternetReachable(state.isInternetReachable);
    setType(state.type);
  }, []);

  // Manuel yenileme fonksiyonu
  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
  }, [handleNetworkChange]);

  useEffect(() => {
    // İlk durumu al
    NetInfo.fetch().then(handleNetworkChange);

    // Network durum değişikliklerini dinle
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  return {
    isConnected,
    isInternetReachable,
    isOffline: isConnected === false,
    type,
    refresh,
  };
};

export default useNetworkStatus;
