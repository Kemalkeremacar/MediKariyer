import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { ChangePasswordScreen } from '@/features/settings/screens/ChangePasswordScreen';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * SettingsStackNavigator - Account settings screens
 * Handles account settings and security
 */
export const SettingsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen 
      name="SettingsMain" 
      component={SettingsScreen}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);
