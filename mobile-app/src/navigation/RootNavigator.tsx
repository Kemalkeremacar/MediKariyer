/**
 * RootNavigator - Session Persistence Implementation
 * State-Based Navigation Pattern
 * 
 * Navigation Logic (Priority Order):
 * 1. isHydrating -> Splash Screen (shows loading)
 * 2. !isAuthenticated -> AuthStack (Login/Register)
 * 3. isAuthenticated && !user.is_active -> AccountDisabledScreen (deactivated users)
 * 4. isAuthenticated && !user.is_approved -> AuthStack (PendingApproval screen)
 * 5. All checks pass -> AppStack (Dashboard)
 * 
 * Features:
 * - State-based initialRouteName (no useEffect navigation.reset calls)
 * - All screens registered for deep linking support
 * - Tolerant type checking for MSSQL BIT fields (1, '1', true, 'true')
 * - Mobile API integration via authService.getMe()
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AccountDisabledScreen } from '@/features/auth/screens/AccountDisabledScreen';
import { useAuthStore } from '@/store/authStore';
import { navigationRef } from './navigationRef';
import { colors, spacing, typography } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { devLog } from '@/utils/devLogger';
import type { RootStackParamList } from './types';

// Enable screens - safe to call with both old and new architecture
try {
  enableScreens();
} catch (error) {
  if (__DEV__) {
    devLog.warn('Failed to enable screens:', error);
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Helper function to check if user is active (handles boolean, number, string types)
 * MSSQL BIT tipi için toleranslı kontrol - 1, '1', true, 'true' değerlerini kabul eder
 * 
 * CRITICAL: Eğer user yoksa veya is_active undefined/null ise, kullanıcıyı engelleme!
 * Sadece kesinlikle false veya 0 ise engelle.
 */
const isUserActive = (user: any): boolean => {
  // Kullanıcı yoksa Login'e gider, engelleme yapma!
  if (!user) {
    devLog.log('🛑 DEBUG isUserActive: user is null/undefined, returning TRUE (allow login)');
    return true;
  }
  
  // ÇOK DETAYLI DEBUG LOG'LAR
  devLog.log('🛑 DEBUG isUserActive - FULL USER OBJECT:', JSON.stringify(user, null, 2));
  devLog.log('🛑 DEBUG isUserActive - is_active value:', user.is_active);
  devLog.log('🛑 DEBUG isUserActive - is_active type:', typeof user.is_active);
  devLog.log('🛑 DEBUG isUserActive - is_active === 0:', user.is_active === 0);
  devLog.log('🛑 DEBUG isUserActive - is_active === false:', user.is_active === false);
  devLog.log('🛑 DEBUG isUserActive - is_active === "0":', user.is_active === '0');
  devLog.log('🛑 DEBUG isUserActive - is_active === null:', user.is_active === null);
  devLog.log('🛑 DEBUG isUserActive - is_active === undefined:', user.is_active === undefined);
  
  const active = user.is_active;
  
  // ACİL ÖNLEM: Eğer undefined veya null ise, kullanıcıyı engelleme!
  // Varsayılan olarak AKTİF kabul et (Login olabilsin, engel olmasın)
  if (active === undefined || active === null) {
    devLog.log('🛑 DEBUG isUserActive - is_active is null/undefined, defaulting to TRUE (allow access)');
    return true; 
  }
  
  // Toleranslı Kontrol - Aktif değerler
  if (active === true) {
    devLog.log('🛑 DEBUG isUserActive - is_active is true, returning TRUE');
    return true;
  }
  if (active === 1) {
    devLog.log('🛑 DEBUG isUserActive - is_active is 1, returning TRUE');
    return true;
  }
  if (active === '1') {
    devLog.log('🛑 DEBUG isUserActive - is_active is "1", returning TRUE');
    return true;
  }
  if (active === 'true') {
    devLog.log('🛑 DEBUG isUserActive - is_active is "true", returning TRUE');
    return true;
  }
  
  // Sadece kesinlikle false veya 0 ise engelle
  if (active === false || active === 0 || active === '0') {
    devLog.log('🛑 DEBUG isUserActive - is_active is false/0/"0", returning FALSE (block access)');
    return false;
  }

  // Diğer her durumda (beklenmeyen değerler) AKTİF kabul et
  devLog.log('🛑 DEBUG isUserActive - unexpected value, defaulting to TRUE (allow access)');
  return true;
};

/**
 * Helper function to check if user is approved (handles boolean, number, string types)
 */
const isUserApproved = (user: any): boolean => {
  if (user?.is_approved === undefined || user?.is_approved === null) return false;
  if (typeof user.is_approved === 'boolean') return user.is_approved;
  if (typeof user.is_approved === 'number') return user.is_approved === 1;
  if (typeof user.is_approved === 'string') return user.is_approved === 'true' || user.is_approved === '1';
  return false;
};

export const RootNavigator = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Determine initial route based on auth state (memoized for performance)
  const initialRouteName = useMemo((): keyof RootStackParamList => {
    devLog.log('🧭 RootNavigator - Calculating initialRouteName:', {
      isHydrating,
      authStatus,
      hasUser: !!user,
      userId: user?.id,
      isActive: user?.is_active,
      isApproved: user?.is_approved,
    });

    // During hydration, show Auth (will be replaced by actual state after hydration)
    if (isHydrating) {
      devLog.log('🧭 RootNavigator - Returning Auth (hydrating)');
      return 'Auth';
    }

    // Not authenticated
    if (authStatus !== 'authenticated' || !user) {
      devLog.log('🧭 RootNavigator - Returning Auth (not authenticated)');
      return 'Auth';
    }

    // Authenticated - check user status
    const userIsActive = isUserActive(user);
    const userIsApproved = isUserApproved(user);
    const userIsAdmin = user.role === 'admin';

    devLog.log('🧭 RootNavigator - User checks:', {
      userIsActive,
      userIsApproved,
      userIsAdmin,
    });

    // Check inactive status first - most restrictive
    if (!userIsActive) {
      devLog.log('🧭 RootNavigator - Returning AccountDisabled (inactive)');
      return 'AccountDisabled';
    }

    // Check approval status
    if (!userIsApproved && !userIsAdmin) {
      devLog.log('🧭 RootNavigator - Returning Auth (not approved)');
      return 'Auth'; // Auth stack will show PendingApproval screen
    }

    // User is authenticated, active, and approved
    devLog.log('🧭 RootNavigator - Returning App (authenticated, active, approved)');
    return 'App';
  }, [isHydrating, authStatus, user]);

  // Track previous route to detect changes
  const previousRouteRef = useRef<keyof RootStackParamList | null>(null);

  // CRITICAL: Reset navigation when initialRouteName changes
  // This ensures navigation happens immediately when auth state changes
  // React Navigation's initialRouteName only works on first render,
  // so we need to manually reset navigation when route should change
  useEffect(() => {
    // Skip if still hydrating (will be handled after hydration completes)
    if (isHydrating) {
      return;
    }

    // Skip if route hasn't changed
    if (previousRouteRef.current === initialRouteName) {
      return;
    }

    // Skip if navigation is not ready
    if (!navigationRef.isReady()) {
      devLog.log('🧭 RootNavigator - Navigation ref not ready, skipping reset');
      return;
    }

    // Get current route to avoid unnecessary resets
    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name as keyof RootStackParamList;

    // Only reset if we're not already on the target route
    if (currentRouteName !== initialRouteName) {
      devLog.log('🧭 RootNavigator - Route changed, resetting navigation:', {
        from: previousRouteRef.current,
        to: initialRouteName,
        current: currentRouteName,
      });

      navigationRef.reset({
        index: 0,
        routes: [{ name: initialRouteName }],
      });

      devLog.log('🧭 RootNavigator - Navigation reset completed');
    } else {
      devLog.log('🧭 RootNavigator - Already on target route, skipping reset');
    }

    // Update previous route
    previousRouteRef.current = initialRouteName;
  }, [initialRouteName, isHydrating]);

  // Loading state - Show splash screen
  if (isHydrating) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Typography variant="h2" style={styles.brandName}>
            MediKariyer
          </Typography>
          <ActivityIndicator 
            size="large" 
            color={colors.primary[600]} 
            style={styles.spinner}
          />
          <Typography variant="body" style={styles.loadingText}>
            Yükleniyor...
          </Typography>
        </View>
      </View>
    );
  }

  // State-Based Navigation
  // All screens are registered for deep linking support
  // Using key prop to force re-render when route changes (ensures initialRouteName is respected)
  // This eliminates the need for useEffect-based navigation.reset() calls
  return (
    <Stack.Navigator
      key={initialRouteName} // Force re-render when route changes
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth stack - For login, register, and pending approval */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
      
      {/* App stack - For authenticated and approved users */}
      <Stack.Screen name="App" component={AppNavigator} />
      
      {/* Account disabled screen - For authenticated but inactive users */}
      <Stack.Screen name="AccountDisabled" component={AccountDisabledScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 90,
    height: 90,
  },
  brandName: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing['3xl'],
    letterSpacing: 1,
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
  },
});
