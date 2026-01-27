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
 * - NotificationSettings: Bildirim ayarları ekranı
 * - DeleteAccount: Hesap silme ekranı (App Store/Play Store gereksinimi)
 * - HelpCenter: Yardım merkezi ve SSS ekranı
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { ChangePasswordScreen } from '@/features/settings/screens/ChangePasswordScreen';
import { NotificationSettingsScreen } from '@/features/settings/screens/NotificationSettingsScreen';
import { DeleteAccountScreen } from '@/features/settings/screens/DeleteAccountScreen';
import { HelpCenterScreen } from '@/features/settings/screens/HelpCenterScreen';
import { PrivacyPolicyScreen } from '@/features/settings/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '@/features/settings/screens/TermsOfServiceScreen';
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
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettingsScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="DeleteAccount" 
      component={DeleteAccountScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="HelpCenter" 
      component={HelpCenterScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
