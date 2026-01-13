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
      animation: 'slide_from_right',
      animationDuration: 200,
      freezeOnBlur: true,
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
        // NOT: presentation: 'modal' kullanılmıyor - BottomSheet/Select bileşenlerini bozabilir
        // Bunun yerine slide_from_bottom animasyonu kullanılıyor
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
