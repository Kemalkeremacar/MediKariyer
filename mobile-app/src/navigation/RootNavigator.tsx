import React from 'react';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
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

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {authStatus === 'authenticated' ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

