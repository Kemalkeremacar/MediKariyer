/**
 * @file AlertProvider.tsx
 * @description Deterministic alert state management using React Context exclusively
 * 
 * Key design decisions:
 * 1. No global handler - context only
 * 2. Callback refs to prevent stale closures
 * 3. Execution guard to prevent double-firing from rapid clicks
 * 
 * Responsibilities:
 * - showAlert: Display alert with configuration
 * - hideAlert: Close alert and clean up state
 * - Manage callback execution with proper guards
 * 
 * Requirements:
 * - 9.3: Log lifecycle events in development mode
 * - 9.5: Ensure logs are stripped in production builds
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  PropsWithChildren,
} from 'react';
import { CustomAlert } from '@/components/ui/CustomAlert';
import { alertRef } from '@/utils/alertRef';
import { overlayDevLog, overlayDevWarn, overlayDevError } from '@/utils/devLogger';
import type {
  AlertConfig,
  AlertContextType,
  AlertProviderState,
} from '@/types/alert';

// Re-export types for convenience
export type { AlertConfig, AlertContextType, AlertType } from '@/types/alert';

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Development-only logging utility for AlertProvider
 * Uses the centralized overlay logging system
 * 
 * @param message - The message to log
 * @param data - Optional data to include
 */
const alertDevLog = (message: string, data?: unknown): void => {
  overlayDevLog(`[Alert] ${message}`, data);
};

/**
 * Development-only warning utility for AlertProvider
 * 
 * @param message - The warning message
 * @param data - Optional data to include
 */
const alertDevWarn = (message: string, data?: unknown): void => {
  overlayDevWarn(`[Alert] ${message}`, data);
};

/**
 * Development-only error utility for AlertProvider
 * 
 * @param message - The error message
 * @param error - Optional error object
 */
const alertDevError = (message: string, error?: unknown): void => {
  overlayDevError(`[Alert] ${message}`, error);
};

export const AlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AlertProviderState>({
    config: null,
    isExecuting: false,
  });

  // Store callbacks in refs to avoid stale closure issues
  const callbacksRef = useRef<{
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({});

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Unique ID for each alert to track replacement
  // When a new alert is shown, the ID changes, invalidating any pending callbacks from the previous alert
  const alertIdRef = useRef<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    alertDevLog('Provider mounted');
    return () => {
      isMountedRef.current = false;
      // Clean up callbacks on unmount
      callbacksRef.current = {};
      alertIdRef.current = 0;
      alertDevLog('Provider unmounted - callbacks cleaned up');
    };
  }, []);

  const showAlert = useCallback((config: AlertConfig) => {
    // Check if we're replacing an existing alert
    const isReplacing = state.config !== null;
    
    alertDevLog('showAlert called', { 
      type: config.type, 
      title: config.title,
      hasOnConfirm: typeof config.onConfirm === 'function',
      hasOnCancel: typeof config.onCancel === 'function',
      isReplacing,
    });
    
    if (isReplacing) {
      alertDevLog('Replacing existing alert - previous callbacks will not be executed');
    }
    
    // Increment alert ID to invalidate any pending callbacks from previous alert
    // This ensures that if handleConfirm/handleCancel is called after replacement,
    // the callback from the old alert won't execute
    alertIdRef.current += 1;
    const newAlertId = alertIdRef.current;
    
    // Store callbacks in ref to prevent stale closures
    // The alertId is captured in the callback wrapper to validate execution
    callbacksRef.current = {
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
    };
    
    if (isMountedRef.current) {
      // Reset isExecuting to false when showing a new alert
      // This allows the new alert's callbacks to be executed
      setState({ config: { ...config, _alertId: newAlertId } as AlertConfig, isExecuting: false });
    } else {
      alertDevWarn('showAlert called on unmounted provider');
    }
  }, [state.config]);

  const hideAlert = useCallback(() => {
    alertDevLog('hideAlert called');
    
    // Clear callbacks
    callbacksRef.current = {};
    
    // Note: We don't reset alertIdRef here because it's used to track
    // the sequence of alerts. The ID only needs to increment on new alerts.
    
    if (isMountedRef.current) {
      setState({ config: null, isExecuting: false });
    } else {
      alertDevWarn('hideAlert called on unmounted provider');
    }
  }, []);

  // Connect to alertRef for imperative access from non-component code
  // This allows API interceptors and utility functions to show alerts
  useImperativeHandle(
    alertRef,
    () => ({
      showAlert,
      hideAlert,
    }),
    [showAlert, hideAlert]
  );

  const handleConfirm = useCallback(() => {
    // Guard against rapid clicks - prevent multiple executions
    if (state.isExecuting) {
      alertDevWarn('handleConfirm blocked - already executing');
      return;
    }
    
    // Capture the current alert ID to validate callback execution
    const currentAlertId = (state.config as AlertConfig & { _alertId?: number })?._alertId;
    const expectedAlertId = alertIdRef.current;
    
    // If the alert was replaced, don't execute the old callback
    if (currentAlertId !== expectedAlertId) {
      alertDevWarn('handleConfirm blocked - alert was replaced', {
        currentAlertId,
        expectedAlertId,
      });
      return;
    }
    
    alertDevLog('handleConfirm executing');
    
    // Set executing flag immediately
    setState(prev => ({ ...prev, isExecuting: true }));
    
    // Execute callback from ref (not from state to avoid stale closures)
    try {
      const callback = callbacksRef.current.onConfirm;
      if (typeof callback === 'function') {
        alertDevLog('Executing onConfirm callback');
        callback();
        alertDevLog('onConfirm callback completed successfully');
      } else {
        alertDevLog('No onConfirm callback provided, skipping');
      }
    } catch (error) {
      alertDevError('onConfirm callback error', error);
    }
    
    // Hide alert after callback execution
    hideAlert();
  }, [state.isExecuting, state.config, hideAlert]);

  const handleCancel = useCallback(() => {
    // Guard against rapid clicks - prevent multiple executions
    if (state.isExecuting) {
      alertDevWarn('handleCancel blocked - already executing');
      return;
    }
    
    // Capture the current alert ID to validate callback execution
    const currentAlertId = (state.config as AlertConfig & { _alertId?: number })?._alertId;
    const expectedAlertId = alertIdRef.current;
    
    // If the alert was replaced, don't execute the old callback
    if (currentAlertId !== expectedAlertId) {
      alertDevWarn('handleCancel blocked - alert was replaced', {
        currentAlertId,
        expectedAlertId,
      });
      return;
    }
    
    alertDevLog('handleCancel executing');
    
    // Set executing flag immediately
    setState(prev => ({ ...prev, isExecuting: true }));
    
    // Execute callback from ref (not from state to avoid stale closures)
    try {
      const callback = callbacksRef.current.onCancel;
      if (typeof callback === 'function') {
        alertDevLog('Executing onCancel callback');
        callback();
        alertDevLog('onCancel callback completed successfully');
      } else {
        alertDevLog('No onCancel callback provided, skipping');
      }
    } catch (error) {
      alertDevError('onCancel callback error', error);
    }
    
    // Hide alert after callback execution
    hideAlert();
  }, [state.isExecuting, state.config, hideAlert]);

  const contextValue: AlertContextType = {
    showAlert,
    hideAlert,
    isVisible: state.config !== null,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {state.config && (
        <CustomAlert
          visible={true}
          type={state.config.type}
          title={state.config.title}
          message={state.config.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmText={state.config.confirmText}
          cancelText={state.config.cancelText}
        />
      )}
    </AlertContext.Provider>
  );
};

/**
 * Hook to access alert functionality
 * Must be used within AlertProvider
 * 
 * @throws Error if used outside AlertProvider
 * @returns AlertContextType with showAlert, hideAlert, and isVisible
 */
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error(
      'useAlert must be used within AlertProvider. ' +
      'Ensure AlertProvider is in your component tree above this component.'
    );
  }
  
  return context;
};
