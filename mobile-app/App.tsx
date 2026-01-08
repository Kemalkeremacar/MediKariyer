/**
 * App.tsx - Application Root
 * 
 * ⚠️ PROVIDER HIERARCHY - SACRED ARCHITECTURE RULE
 * ═══════════════════════════════════════════════════════
 * BottomSheetModalProvider MUST be at ROOT level.
 * This is the ONLY place it should exist in the entire app.
 * 
 * FORBIDDEN (will break Select/BottomSheet components):
 * - Adding BottomSheetModalProvider inside ANY component
 * - Adding BottomSheetModalProvider inside ANY screen
 * - Using `presentation: 'modal'` for screens with Select
 * 
 * Provider Stack (DO NOT MODIFY ORDER):
 * GestureHandlerRootView
 * └── SafeAreaProvider
 *     └── PortalProvider
 *         └── BottomSheetModalProvider ← SINGLETON, ROOT LEVEL
 *             └── AppProviders
 *                 └── NavigationContainer
 *         └── PortalHost ("root") ← Toast/Alert render here
 * 
 * See: src/ARCHITECTURE.md for full documentation.
 * ═══════════════════════════════════════════════════════
 */

import React, { useEffect, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PortalProvider, PortalHost } from '@gorhom/portal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { AppProviders } from '@/providers/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthInitializer } from '@/providers/AuthInitializer';
import { navigationRef } from '@/navigation/navigationRef';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { OfflineNotice } from '@/components/feedback/OfflineNotice';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';
import { StyleSheet, Text, TextInput } from 'react-native';
import { errorLogger } from '@/utils/errorLogger';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Initialize Sentry for production error tracking
// Set your Sentry DSN in .env as EXPO_PUBLIC_SENTRY_DSN
if (env.SENTRY_DSN) {
  errorLogger.initSentry({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    tracesSampleRate: 0.2,
  });
}

/**
 * AppContent - Inner app component with push notifications
 */
const AppContent = () => {
  // Initialize axios interceptor for navigation integration
  useAxiosInterceptor();
  // Initialize push notifications
  usePushNotifications();
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Hide splash screen when hydration is complete
  useEffect(() => {
    if (!isHydrating) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
          // Continue even if hiding fails
        }
      };
      hideSplash();
    }
  }, [isHydrating]);

  // Handle deep link navigation
  const handleDeepLink = useCallback((url: string) => {
    if (!navigationRef.isReady()) {
      // Wait for navigation to be ready
      setTimeout(() => handleDeepLink(url), 100);
      return;
    }

    try {
      const { path, queryParams } = Linking.parse(url);
      
      // Handle reset password deep link: medikariyer://reset-password?token=...
      if (path === 'reset-password' && queryParams?.token) {
        // Navigate to Auth stack first, then to ResetPassword screen
        // @ts-expect-error - Nested navigation type issue, but works at runtime
        navigationRef.navigate('Auth', {
          screen: 'ResetPassword',
          params: { token: queryParams.token as string },
        });
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }, []);

  // Deep linking handler for password reset
  useEffect(() => {
    // Handle initial URL (when app is opened via deep link)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Handle URL changes (when app is already open and receives a deep link)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return (
    <>
      {/* Global Offline Notice - Shows at top when internet is disconnected */}
      <OfflineNotice />
      
      <AuthInitializer />
      <RootNavigator />
    </>
  );
};

export default function App() {
  useEffect(() => {
    // Disable font scaling globally for consistent UI
    // @ts-ignore
    Text.defaultProps = Text.defaultProps || {};
    // @ts-ignore
    Text.defaultProps.allowFontScaling = false;
    // @ts-ignore
    TextInput.defaultProps = TextInput.defaultProps || {};
    // @ts-ignore
    TextInput.defaultProps.allowFontScaling = false;
  }, []);

  // Fallback: Hide splash screen after maximum wait time (5 seconds)
  // This ensures splash screen doesn't stay forever if something goes wrong
  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        // Ignore errors
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  /**
   * Provider Hierarchy (Optimized for Z-Index):
   * 
   * GestureHandlerRootView
   * └── SafeAreaProvider
   *     └── PortalProvider
   *         └── BottomSheetModalProvider (ROOT LEVEL - Critical for Select/BottomSheet)
   *             └── AppProviders (QueryClient, Theme, Alert, Toast)
   *                 └── ErrorBoundary
   *                     └── NavigationContainer
   *                         └── AppContent
   *         └── PortalHost (name="root") - For Toast/Alert overlays
   */
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PortalProvider>
          {/* BottomSheetModalProvider at ROOT level - enables Select to render above navigation */}
          <BottomSheetModalProvider>
            <AppProviders>
              {/* ErrorBoundary wraps NavigationContainer - catches all JS errors */}
              <ErrorBoundary>
                <NavigationContainer ref={navigationRef}>
                  <AppContent />
                </NavigationContainer>
              </ErrorBoundary>
            </AppProviders>
          </BottomSheetModalProvider>
          {/* Global Portal Host - Renders all global overlays (Toast, Alert, etc.) */}
          <PortalHost name="root" />
        </PortalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
