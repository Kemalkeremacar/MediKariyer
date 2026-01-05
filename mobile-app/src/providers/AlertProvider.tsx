/**
 * @file AlertProvider.tsx
 * @description Alert state yönetimi için provider
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CustomAlert, AlertType } from '@/components/ui/CustomAlert';
import { setGlobalAlertHandler } from '@/utils/alert';

interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    console.log('🔴 AlertProvider hideAlert called');
    setVisible(false);
    // Clear alert config after animation completes
    setTimeout(() => {
      console.log('🔴 Clearing alert config');
      setAlertConfig(null);
    }, 300);
  }, []);

  // Set global alert handler on mount
  useEffect(() => {
    setGlobalAlertHandler({ showAlert, hideAlert });
    return () => setGlobalAlertHandler(null);
  }, [showAlert, hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => {
            if (alertConfig.onCancel) {
              alertConfig.onCancel();
            }
            hideAlert();
          }}
          onConfirm={alertConfig.onConfirm}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
