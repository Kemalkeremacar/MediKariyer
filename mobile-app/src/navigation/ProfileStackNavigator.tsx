import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { ProfileEditScreen } from '@/features/profile/screens/ProfileEditScreen';
import { EducationScreen } from '@/features/profile/screens/EducationScreen';
import { ExperienceScreen } from '@/features/profile/screens/ExperienceScreen';
import { CertificatesScreen } from '@/features/profile/screens/CertificatesScreen';
import { LanguagesScreen } from '@/features/profile/screens/LanguagesScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * ProfileStackNavigator - Profile management screens
 * Handles profile viewing and editing
 */
export const ProfileStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
    />
    <Stack.Screen 
      name="ProfileEdit" 
      component={ProfileEditScreen}
      options={{
        presentation: 'modal',
      }}
    />
    <Stack.Screen 
      name="Education" 
      component={EducationScreen}
    />
    <Stack.Screen 
      name="Experience" 
      component={ExperienceScreen}
    />
    <Stack.Screen 
      name="Certificates" 
      component={CertificatesScreen}
    />
    <Stack.Screen 
      name="Languages" 
      component={LanguagesScreen}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
    />
  </Stack.Navigator>
);
