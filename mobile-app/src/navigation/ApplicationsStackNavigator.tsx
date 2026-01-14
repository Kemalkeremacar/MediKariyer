/**
 * @file ApplicationsStackNavigator.tsx
 * @description Başvurular gezinme akışı - başvuru listesi ve detay ekranları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Ekranlar:**
 * - ApplicationsList: Başvurular listesi
 * - ApplicationDetail: Başvuru detay sayfası
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { ApplicationDetailScreen } from '@/features/applications/screens/ApplicationDetailScreen';
import type { ApplicationsStackParamList } from './types';

const Stack = createNativeStackNavigator<ApplicationsStackParamList>();

/**
 * ApplicationsStackNavigator - Başvurular gezinme stack'i
 * ApplicationsTab içinde nested stack navigator olarak kullanılır
 */
export const ApplicationsStackNavigator = () => (
  <Stack.Navigator
    initialRouteName="ApplicationsList"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 200,
      freezeOnBlur: true,
    }}
  >
    <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} />
    <Stack.Screen 
      name="ApplicationDetail" 
      component={ApplicationDetailScreen}
      options={{ 
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
