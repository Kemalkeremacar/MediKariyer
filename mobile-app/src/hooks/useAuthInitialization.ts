/**
 * @file useAuthInitialization.ts
 * @description Initialize authentication on app startup
 * 
 * Features:
 * - Validate tokens from SecureStore
 * - Check token expiry
 * - Fetch user data if tokens are valid
 * - Auto logout if tokens are invalid/expired
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { REQUEST_TIMEOUT_MS } from '@/config/constants';

export const useAuthInitialization = () => {
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const setHydrating = useAuthStore((state) => state.setHydrating);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setHydrating(true);
        
        // Create a timeout promise to prevent infinite waiting
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Auth initialization timeout'));
          }, REQUEST_TIMEOUT_MS + 5000); // Add 5 seconds buffer
        });

        // Wrap the initialization in a race with timeout
        await Promise.race([
          (async () => {
            // Check if tokens exist and are valid JWT
            const isValid = await tokenManager.validateTokens();
            
            if (!isValid) {
              console.log('🔴 No valid tokens found, marking unauthenticated');
              markUnauthenticated();
              return;
            }

            // Validate device binding (security check)
            const isDeviceValid = await tokenManager.validateDeviceBinding();
            
            if (!isDeviceValid) {
              console.log('🔴 Device binding validation failed, tokens from different device');
              await tokenManager.clearTokens();
              markUnauthenticated();
              return;
            }
            
            // Fetch user data - API client interceptor will handle token refresh if needed
            // If token is expired, the interceptor will refresh it automatically
            try {
              console.log('🔵 Fetching user data...');
              const response = await apiClient.get(endpoints.auth.me);
              const user = response.data.data.user;
              markAuthenticated(user);
              console.log('✅ User data fetched successfully');
            } catch (error: any) {
              // If error is 401, token refresh was attempted but failed
              // If error is network, we'll mark as unauthenticated
              const isAuthError = error?.response?.status === 401 || error?.name === 'ApiError';
              
              if (isAuthError) {
                console.log('🔴 Authentication failed, marking unauthenticated');
                await tokenManager.clearTokens();
                markUnauthenticated();
              } else {
                // Network error or other error - don't clear tokens, just mark as unauthenticated
                // User can retry later
                console.error('❌ Failed to fetch user data (network error):', error);
                markUnauthenticated();
              }
            }
          })(),
          timeoutPromise,
        ]);
      } catch (error) {
        // Handle timeout or other errors
        if (error instanceof Error && error.message === 'Auth initialization timeout') {
          console.warn('⚠️ Auth initialization timed out, marking unauthenticated');
        } else {
          console.error('❌ Auth initialization error:', error);
        }
        // On timeout or error, clear tokens and mark as unauthenticated
        try {
          await tokenManager.clearTokens();
        } catch (clearError) {
          console.error('Failed to clear tokens:', clearError);
        }
        markUnauthenticated();
      } finally {
        setHydrating(false);
      }
    };

    initializeAuth();
  }, [markAuthenticated, markUnauthenticated, setHydrating]);
};

