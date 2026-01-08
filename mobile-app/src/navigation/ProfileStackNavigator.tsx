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
// Form Screens (renamed from *FormModal to *FormScreen for clarity)
import { EducationFormModal as EducationFormScreen } from '@/features/profile/components/EducationFormModal';
import { ExperienceFormModal as ExperienceFormScreen } from '@/features/profile/components/ExperienceFormModal';
import { LanguageFormModal as LanguageFormScreen } from '@/features/profile/components/LanguageFormModal';
import { CertificateFormModal as CertificateFormScreen } from '@/features/profile/components/CertificateFormModal';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * ProfileStackNavigator - Profile management screens
 * Handles profile viewing and editing
 * 
 * NOTE: Form screens (Education, Experience, Language, Certificate) are
 * navigation screens with slide_from_bottom animation, NOT true modals.
 * They use the root-level BottomSheetModalProvider for Select components.
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
        // NOT: presentation: 'card' kullanılıyor çünkü bu ekranda Select bileşenleri var
        // presentation: 'modal' kullanılırsa Select dropdown'ları arkada kalabilir
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="PhotoManagement" 
      component={PhotoManagementScreen}
      options={{
        // NOT: presentation: 'card' kullanılıyor - modal yerine
        // Bu ekranda Select yok ama tutarlılık için card kullanıyoruz
        animation: 'slide_from_bottom',
        gestureEnabled: true,
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
    
    {/* Form Screens - Full screen forms with slide_from_bottom animation */}
    {/* These are NOT modal presentations - they're card screens for better BottomSheet support */}
    <Stack.Screen 
      name="EducationFormModal" 
      component={EducationFormScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="ExperienceFormModal" 
      component={ExperienceFormScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="LanguageFormModal" 
      component={LanguageFormScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
    <Stack.Screen 
      name="CertificateFormModal" 
      component={CertificateFormScreen}
      options={{
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
