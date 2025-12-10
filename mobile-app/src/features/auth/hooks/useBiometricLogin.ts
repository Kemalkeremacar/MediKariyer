/**
 * @file useBiometricLogin.ts
 * @description Biometric login hook
 * 
 * Features:
 * - Quick login with biometric
 * - Store credentials securely for biometric login
 * - Auto-login with biometric on app start
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { biometricAuth } from '@/utils/biometricAuth';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = 'medikariyer_biometric_credentials';

interface BiometricCredentials {
  email: string;
  // Password is NOT stored, only email for UX
  // User must authenticate with biometric to login
}

const canUseWebStorage =
  __DEV__ &&
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined';

const storage = {
  async setItem(key: string, value: string) {
    if (canUseWebStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string) {
    if (canUseWebStorage) {
      return window.localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async deleteItem(key: string) {
    if (canUseWebStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const useBiometricLogin = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

  /**
   * Save email for biometric login (password is NOT stored)
   */
  const saveBiometricCredentials = async (email: string) => {
    try {
      const credentials: BiometricCredentials = { email };
      await storage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
      return true;
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      return false;
    }
  };

  /**
   * Get saved email for biometric login
   */
  const getBiometricCredentials = async (): Promise<BiometricCredentials | null> => {
    try {
      const data = await storage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
      return null;
    }
  };

  /**
   * Clear biometric credentials
   */
  const clearBiometricCredentials = async () => {
    try {
      await storage.deleteItem(BIOMETRIC_CREDENTIALS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
      return false;
    }
  };

  /**
   * Check if biometric login is available
   */
  const isBiometricLoginAvailable = async (): Promise<boolean> => {
    const isAvailable = await biometricAuth.isAvailable();
    const credentials = await getBiometricCredentials();
    return isAvailable && !!credentials;
  };

  /**
   * Login with biometric
   * Note: This uses existing valid tokens, not password
   * User must have logged in with password at least once
   */
  const loginWithBiometric = useMutation({
    mutationFn: async () => {
      setIsAuthenticating(true);

      // Check if biometric is available
      const isAvailable = await biometricAuth.isAvailable();
      if (!isAvailable) {
        throw new Error('Biyometrik kimlik doğrulama kullanılamıyor.');
      }

      // Check if tokens exist
      const { accessToken, refreshToken } = await tokenManager.getTokens();
      if (!accessToken || !refreshToken) {
        throw new Error('Oturum bulunamadı. Lütfen email ve şifre ile giriş yapın.');
      }

      // Authenticate with biometric
      const result = await biometricAuth.authenticate('Giriş yapmak için doğrulayın');
      
      if (!result.success) {
        throw new Error(result.error || result.warning || 'Kimlik doğrulama başarısız.');
      }

      // Fetch user data
      const user = await authService.getMe();
      
      return { user };
    },
    onSuccess: async (data) => {
      markAuthenticated(data.user);
      setIsAuthenticating(false);
    },
    onError: (error) => {
      setIsAuthenticating(false);
      throw error;
    },
  });

  return {
    loginWithBiometric,
    saveBiometricCredentials,
    getBiometricCredentials,
    clearBiometricCredentials,
    isBiometricLoginAvailable,
    isAuthenticating,
  };
};
