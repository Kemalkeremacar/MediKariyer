/**
 * @file useBiometricAuth.ts
 * @description React hook for biometric authentication
 * 
 * Usage:
 * - Check if biometric is available
 * - Authenticate with biometric
 * - Enable/disable biometric login
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect } from 'react';
import { biometricAuth } from '@/utils/biometricAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'medikariyer_biometric_enabled';

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      setIsLoading(true);
      
      // Check if biometric is available
      const available = await biometricAuth.isAvailable();
      setIsAvailable(available);

      // Get biometric types
      if (available) {
        const types = await biometricAuth.getAvailableTypes();
        const typeNames = types.map((type) => biometricAuth.getBiometricName(type));
        setBiometricTypes(typeNames);
      }

      // Check if user has enabled biometric login
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (promptMessage?: string) => {
    if (!isAvailable) {
      return {
        success: false,
        error: 'Biyometrik kimlik doğrulama kullanılamıyor.',
      };
    }

    return await biometricAuth.authenticate(promptMessage);
  };

  const enableBiometric = async () => {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      setIsEnabled(true);
      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      setIsEnabled(false);
      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  };

  return {
    isAvailable,
    isEnabled,
    isLoading,
    biometricTypes,
    authenticate,
    enableBiometric,
    disableBiometric,
    refresh: checkBiometricAvailability,
  };
};
