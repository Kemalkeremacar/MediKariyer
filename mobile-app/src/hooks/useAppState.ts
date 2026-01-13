/**
 * @file useAppState.ts
 * @description Active session check when app comes to foreground
 * 
 * Features:
 * - Monitors app state changes (background -> active)
 * - Silently checks user status via mobile API when app becomes active
 * - Updates store if user is deactivated (is_active === false)
 * - Only checks if user is authenticated
 * 
 * CRITICAL: Only uses /api/mobile/* endpoints via authService
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import { devLog } from '@/utils/devLogger';

/**
 * Hook to check active session when app comes to foreground
 * 
 * When app state changes to 'active':
 * - If user is authenticated, silently calls authService.getMe()
 * - If user.is_active === false, updates store (RootNavigator will redirect to AccountDisabledScreen)
 * - Handles errors gracefully (network errors don't affect current session)
 */
export const useAppState = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const hasUser = useAuthStore((state) => !!state.user);
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // Only check when app transitions from background/inactive to active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        authStatus === 'authenticated' &&
        hasUser
      ) {
        devLog.log('🔄 App became active, checking user status...');
        
        try {
          // Silently check user status via mobile API
          const updatedUser = await authService.getMe();
          
          // Update store with latest user data
          // This will trigger RootNavigator to check is_active/is_approved
          // If user is deactivated, RootNavigator will redirect to AccountDisabledScreen
          markAuthenticated(updatedUser);
          
          devLog.log('✅ User status checked successfully');
        } catch (error: any) {
          // Handle errors gracefully
          // Network errors shouldn't affect current session
          const isAuthError = error?.response?.status === 401;
          
          if (isAuthError) {
            // Token expired or invalid - this will be handled by axios interceptor
            devLog.warn('⚠️ Auth error during app state check:', error?.message);
          } else {
            // Network error - don't affect current session
            devLog.warn('⚠️ Network error during app state check (ignoring):', error?.message);
          }
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [authStatus, hasUser, markAuthenticated]);
};

