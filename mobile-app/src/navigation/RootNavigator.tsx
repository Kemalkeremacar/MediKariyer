import React from 'react';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { PendingApprovalScreen } from '@/features/auth/screens/PendingApprovalScreen';
import { AccountDisabledScreen } from '@/features/auth/screens/AccountDisabledScreen';
import { useAuthStore } from '@/store/authStore';
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

  // Helper function to check if user is approved (handles boolean, number, string types)
  const isApproved = () => {
    if (!user?.is_approved) return false;
    if (typeof user.is_approved === 'boolean') return user.is_approved;
    if (typeof user.is_approved === 'number') return user.is_approved === 1;
    if (typeof user.is_approved === 'string') return user.is_approved === 'true' || user.is_approved === '1';
    return false;
  };

  // Helper function to check if user is active (handles boolean, number types)
  const isActive = () => {
    if (user?.is_active === undefined || user?.is_active === null) return true; // Default to true if not set
    if (typeof user.is_active === 'boolean') return user.is_active;
    if (typeof user.is_active === 'number') return user.is_active === 1;
    return true;
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {authStatus === 'authenticated' ? (
        <>
          {!isApproved() ? (
            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          ) : !isActive() ? (
            <Stack.Screen name="AccountDisabled" component={AccountDisabledScreen} />
          ) : (
            <Stack.Screen name="App" component={AppNavigator} />
          )}
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

