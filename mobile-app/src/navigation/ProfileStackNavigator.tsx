import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/features/profile/screens/DashboardScreen';
import { ProfileEditScreen } from '@/features/profile/screens/ProfileEditScreen';
import { PhotoManagementScreen } from '@/features/profile/screens/PhotoManagementScreen';
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
      animation: 'slide_from_right', // Smooth animation
      animationDuration: 200, // Faster animation (default: 350ms)
      freezeOnBlur: true, // Freeze inactive screens to save resources
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={DashboardScreen}
    />
    <Stack.Screen 
      name="ProfileEdit" 
      component={ProfileEditScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen 
      name="PhotoManagement" 
      component={PhotoManagementScreen}
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
