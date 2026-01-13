/**
 * @file JobsStackNavigator.tsx
 * @description İş ilanları gezinme akışı - iş listesi ve detay ekranları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Ekranlar:**
 * - JobsList: İş ilanları listesi
 * - JobDetail: İş ilanı detay sayfası
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsScreen } from '@/features/jobs/screens/JobsScreen';
import { JobDetailScreen } from '@/features/jobs/screens/JobDetailScreen';
import type { JobsStackParamList } from './types';

const Stack = createNativeStackNavigator<JobsStackParamList>();

/**
 * JobsStackNavigator - İş ilanları gezinme stack'i
 * JobsTab içinde nested stack navigator olarak kullanılır
 */
export const JobsStackNavigator = () => (
  <Stack.Navigator
    initialRouteName="JobsList"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 200,
      freezeOnBlur: true, // Kaynak tasarrufu için aktif olmayan ekranları dondur
    }}
  >
    <Stack.Screen name="JobsList" component={JobsScreen} />
    <Stack.Screen 
      name="JobDetail" 
      component={JobDetailScreen}
      options={{ 
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
