/**
 * @file CongressesStackNavigator.tsx
 * @description Kongre gezinme akışı - kongre listesi ve detay ekranları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **Ekranlar:**
 * - CongressesList: Kongre listesi
 * - CongressDetail: Kongre detay sayfası
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CongressesScreen } from '@/features/congresses/screens/CongressesScreen';
import { CongressDetailScreen } from '@/features/congresses/screens/CongressDetailScreen';
import type { CongressesStackParamList } from './types';

const Stack = createNativeStackNavigator<CongressesStackParamList>();

/**
 * CongressesStackNavigator - Kongre gezinme stack'i
 * CongressesTab içinde nested stack navigator olarak kullanılır
 */
export const CongressesStackNavigator = () => (
  <Stack.Navigator
    initialRouteName="CongressesList"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 200,
      freezeOnBlur: true, // Kaynak tasarrufu için aktif olmayan ekranları dondur
    }}
  >
    <Stack.Screen name="CongressesList" component={CongressesScreen} />
    <Stack.Screen 
      name="CongressDetail" 
      component={CongressDetailScreen}
      options={{ 
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
