/**
 * @file SettingsStackNavigator.tsx
 * @description Hesap ayarları gezinme akışı
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Ekranlar:**
 * - SettingsMain: Ana ayarlar ekranı
 * - ChangePassword: Şifre değiştirme ekranı
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { ChangePasswordScreen } from '@/features/settings/screens/ChangePasswordScreen';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * SettingsStackNavigator - Ayarlar gezinme stack'i
 * SettingsTab içinde nested stack navigator olarak kullanılır
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
