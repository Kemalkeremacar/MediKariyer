import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AccountDisabledScreen } from '@/features/auth/screens/AccountDisabledScreen';
import { useAuthStore } from '@/store/authStore';
import { navigationRef } from './navigationRef';
import type { RootStackParamList } from './types';

// Enable screens - safe to call with both old and new architecture
// Note: With new architecture enabled, some warnings may appear but functionality works
try {
  enableScreens();
} catch (error) {
  // Silently fail if screens can't be enabled (e.g., in some test environments)
  if (__DEV__) {
    console.warn('Failed to enable screens:', error);
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator - Top-level navigator
 * Handles routing between authenticated and unauthenticated flows
 * Also manages special states like pending approval and disabled accounts
 */
export const RootNavigator = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Helper function to check if user is active (handles boolean, number types)
  const isActive = () => {
    if (user?.is_active === undefined || user?.is_active === null) return true; // Default to true if not set
    if (typeof user.is_active === 'boolean') return user.is_active;
    if (typeof user.is_active === 'number') return user.is_active === 1;
    return true;
  };

  // Helper function to check if user is approved (handles boolean, number, string types)
  const isApproved = () => {
    if (user?.is_approved === undefined || user?.is_approved === null) return false;
    if (typeof user.is_approved === 'boolean') return user.is_approved;
    if (typeof user.is_approved === 'number') return user.is_approved === 1;
    if (typeof user.is_approved === 'string') return user.is_approved === 'true' || user.is_approved === '1';
    return false;
  };

  // Check if user is admin (admin users bypass approval check)
  const isAdmin = user?.role === 'admin';

  // Navigate to App screen when user is authenticated and approved
  // IMPORTANT: All hooks must be called before any early returns
  useEffect(() => {
    if (authStatus === 'authenticated' && user && navigationRef.isReady()) {
      const userIsActive = isActive();
      const userIsApproved = isApproved();
      const userIsAdmin = user?.role === 'admin';
      
      if (userIsActive && (userIsApproved || userIsAdmin)) {
        // User is authenticated, active, and approved - navigate to App
        // Use reset to clear navigation history and set App as root
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    }
  }, [authStatus, user]);

  // Early returns AFTER all hooks
  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Başlatılıyor...</Text>
      </View>
    );
  }

  // Safety check: If authenticated but user data is missing (zombie user edge case),
  // force back to Auth flow to prevent invalid state
  if (authStatus === 'authenticated' && !user) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth stack - Always available for deep linking (e.g., password reset) */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
      
      {authStatus === 'authenticated' ? (
        <>
          {!isActive() ? (
            <Stack.Screen name="AccountDisabled" component={AccountDisabledScreen} />
          ) : !isApproved() && !isAdmin ? (
            // User is authenticated but not approved - show Auth stack (PendingApproval screen)
            // LoginScreen useEffect will redirect to PendingApproval
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <Stack.Screen name="App" component={AppNavigator} />
          )}
        </>
      ) : null}
    </Stack.Navigator>
  );
};

