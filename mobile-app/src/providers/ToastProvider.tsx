/**
 * @file ToastProvider.tsx
 * @description Toast notification system using React Context
 * 
 * Requirements:
 * - 4.6: Clean up all pending toast timers on unmount
 * - 5.4: Generate unique identifiers for each toast instance
 * - 9.3: Log lifecycle events in development mode
 * - 9.5: Ensure logs are stripped in production builds
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal } from '@gorhom/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast, ToastType } from '@/components/ui/Toast';
import { zIndex } from '@/theme';
import { overlayDevLog } from '@/utils/devLogger';

/**
 * Development-only logging utility for ToastProvider
 * Uses the centralized overlay logging system
 * 
 * @param message - The message to log
 * @param data - Optional data to include
 */
const toastDevLog = (message: string, data?: unknown): void => {
  overlayDevLog(`[Toast] ${message}`, data);
};



interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to access toast functionality.
 * Must be used within a ToastProvider.
 * 
 * @throws Error if called outside ToastProvider
 * @returns ToastContextType with showToast method
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error(
      'useToast must be used within ToastProvider. ' +
      'Ensure ToastProvider is in your component tree above this component.'
    );
  }
  
  return context;
};

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Counter for generating unique IDs with collision prevention
let toastIdCounter = 0;

/**
 * Generates a unique toast ID with collision prevention.
 * Combines timestamp, counter, and random string for uniqueness.
 */
const generateToastId = (): string => {
  toastIdCounter = (toastIdCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${Date.now()}-${toastIdCounter}-${Math.random().toString(36).slice(2, 11)}`;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const insets = useSafeAreaInsets();
  
  // Track all active timers for cleanup
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup all timers on unmount
  useEffect(() => {
    toastDevLog('Provider mounted');
    return () => {
      const timerCount = timersRef.current.size;
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
      toastDevLog('Provider unmounted - timers cleaned up', { timerCount });
    };
  }, []);

  const hideToast = useCallback((id: string) => {
    toastDevLog('hideToast called', { id });
    
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
      toastDevLog('Timer cleared for toast', { id });
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    const id = generateToastId();
    
    toastDevLog('showToast called', { 
      id, 
      type, 
      duration,
      messageLength: message.length,
    });
    
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Set auto-dismiss timer and track it
    const timer = setTimeout(() => {
      toastDevLog('Auto-dismiss timer fired', { id });
      hideToast(id);
    }, duration);
    
    timersRef.current.set(id, timer);
    toastDevLog('Timer set for toast', { id, duration });
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Portal renders toasts at root level, above all modals */}
      <Portal hostName="root">
        <View style={[styles.toastContainer, { top: insets.top + 10 }]} pointerEvents="box-none">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onHide={() => hideToast(toast.id)}
            />
          ))}
        </View>
      </Portal>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: zIndex.toast, // Merkezi z-index sisteminden
    elevation: zIndex.toast, // Android elevation
  },
});
