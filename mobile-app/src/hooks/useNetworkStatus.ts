/**
 * @file useNetworkStatus.ts
 * @description Network connectivity status hook
 * 
 * Monitors internet connection status and provides
 * reactive state for offline awareness throughout the app.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  /** Whether device is connected to a network */
  isConnected: boolean | null;
  /** Whether internet is actually reachable */
  isInternetReachable: boolean | null;
  /** Convenience flag: true when offline */
  isOffline: boolean;
  /** Network type (wifi, cellular, etc.) */
  type: string | null;
  /** Manually refresh network status */
  refresh: () => Promise<void>;
}

/**
 * Hook to monitor network connectivity status
 * 
 * @example
 * ```tsx
 * const { isOffline, isConnected, refresh } = useNetworkStatus();
 * 
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [type, setType] = useState<string | null>(null);

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    setIsConnected(state.isConnected);
    setIsInternetReachable(state.isInternetReachable);
    setType(state.type);
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
  }, [handleNetworkChange]);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

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
