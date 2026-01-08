/**
 * @file useAuthInitialization.ts
 * @description Initialize authentication on app startup
 * 
 * Features:
 * - Validate tokens from SecureStore
 * - Check token expiry
 * - Fetch user data using mobile API (authService.getMe)
 * - Auto logout if tokens are invalid/expired
 * - Handle network errors gracefully (offline mode support)
 * 
 * CRITICAL: Only uses /api/mobile/* endpoints via authService
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/api/services/authService';
import { REQUEST_TIMEOUT_MS } from '@/config/constants';
import { devLog } from '@/utils/devLogger';

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
              devLog.log('🔴 No valid tokens found, marking unauthenticated');
              markUnauthenticated();
              return;
            }

            // Validate device binding (security check)
            const isDeviceValid = await tokenManager.validateDeviceBinding();
            
            if (!isDeviceValid) {
              devLog.log('🔴 Device binding validation failed, tokens from different device');
              await tokenManager.clearTokens();
              markUnauthenticated();
              return;
            }
            
            // Fetch user data using mobile API service
            // API client interceptor will handle token refresh if needed
            // If token is expired, the interceptor will refresh it automatically
            try {
              devLog.log('🔵 Fetching user data via mobile API...');
              const user = await authService.getMe();
              
              // Mark user as authenticated with user data
              // RootNavigator will handle is_active and is_approved checks
              markAuthenticated(user);
              devLog.log('✅ User data fetched successfully via mobile API');
            } catch (error: any) {
              // Scenario B: 401 Unauthorized - Token expired or invalid
              const isAuthError = error?.response?.status === 401 || error?.name === 'ApiError';
              
              if (isAuthError) {
                devLog.log('🔴 Authentication failed (401), clearing tokens and marking unauthenticated');
                await tokenManager.clearTokens();
                markUnauthenticated();
              } else {
                // Scenario C: Network Error - Keep token, allow offline mode
                // User can retry later when network is available
                devLog.warn('⚠️ Network error during auth initialization, keeping token for offline mode:', error?.message);
                // Don't clear tokens on network error - allow user to continue with cached data
                // Check if we have persisted user data in store (from previous session)
                // If yes, mark as authenticated to allow offline access
                // If no, mark as unauthenticated (first time login requires network)
                const persistedUser = useAuthStore.getState().user;
                if (persistedUser) {
                  devLog.log('✅ Using persisted user data for offline mode');
                  markAuthenticated(persistedUser);
                } else {
                  devLog.log('⚠️ No persisted user data, marking unauthenticated');
                  markUnauthenticated();
                }
              }
            }
          })(),
          timeoutPromise,
        ]);
      } catch (error) {
        // Handle timeout or other errors
        if (error instanceof Error && error.message === 'Auth initialization timeout') {
          devLog.warn('⚠️ Auth initialization timed out, marking unauthenticated');
        } else {
          devLog.error('❌ Auth initialization error:', error);
        }
        // On timeout or error, clear tokens and mark as unauthenticated
        try {
          await tokenManager.clearTokens();
        } catch (clearError) {
          devLog.error('Failed to clear tokens:', clearError);
        }
        markUnauthenticated();
      } finally {
        setHydrating(false);
      }
    };

    initializeAuth();
  }, [markAuthenticated, markUnauthenticated, setHydrating]);
};

