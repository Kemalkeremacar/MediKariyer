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
            
            // Check if access token is expired
            const isExpired = await tokenManager.isAccessTokenExpired();
            
            if (isExpired) {
              console.log('⚠️ Access token expired, attempting refresh...');
              
              // Try to refresh token
              const refreshToken = await tokenManager.getRefreshToken();
              if (!refreshToken) {
                console.log('🔴 No refresh token, marking unauthenticated');
                await tokenManager.clearTokens();
                markUnauthenticated();
                return;
              }
              
              try {
                const response = await apiClient.post(endpoints.auth.refreshToken, {
                  refreshToken,
                });
                const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
                await tokenManager.saveTokens(accessToken, newRefreshToken);
                markAuthenticated(user);
                console.log('✅ Token refreshed successfully');
                return;
              } catch (error) {
                console.error('❌ Token refresh failed:', error);
                await tokenManager.clearTokens();
                markUnauthenticated();
                return;
              }
            }
            
            // Token valid and not expired, fetch user data
            try {
              console.log('🔵 Fetching user data...');
              const response = await apiClient.get(endpoints.auth.me);
              const user = response.data.data.user;
              markAuthenticated(user);
              console.log('✅ User data fetched successfully');
            } catch (error) {
              console.error('❌ Failed to fetch user data:', error);
              await tokenManager.clearTokens();
              markUnauthenticated();
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

