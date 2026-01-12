/**
 * @file ProfileStackNavigator.tsx
 * @description Profil yönetimi gezinme akışı
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Ekranlar:**
 * - ProfileMain: Ana profil/dashboard ekranı
 * - ProfileEdit: Profil düzenleme
 * - PhotoManagement: Fotoğraf yönetimi
 * - Education: Eğitim bilgileri listesi
 * - Experience: Deneyim bilgileri listesi
 * - Certificates: Sertifika listesi
 * - Languages: Dil bilgileri listesi
 * - Notifications: Bildirimler
 * - Form Screens: Ekleme/düzenleme formları
 * 
 * **ÖNEMLİ NOT:**
 * Form ekranları (*FormModal) gerçek modal değil, slide_from_bottom animasyonlu
 * navigation ekranlarıdır. Root-level BottomSheetModalProvider'ı kullanarak
 * Select bileşenlerinin doğru çalışmasını sağlarlar.
 */

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
// Form Screens (geriye dönük uyumluluk için *FormModal isimli)
import { EducationFormModal as EducationFormScreen } from '@/features/profile/components/EducationFormModal';
import { ExperienceFormModal as ExperienceFormScreen } from '@/features/profile/components/ExperienceFormModal';
import { LanguageFormModal as LanguageFormScreen } from '@/features/profile/components/LanguageFormModal';
import { CertificateFormModal as CertificateFormScreen } from '@/features/profile/components/CertificateFormModal';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * ProfileStackNavigator - Profil yönetimi gezinme stack'i
 * ProfileTab içinde nested stack navigator olarak kullanılır
 * 
 * **NOT:** Form ekranları (Education, Experience, Language, Certificate)
 * slide_from_bottom animasyonlu navigation ekranlarıdır, gerçek modal DEĞİL.
 * Root-level BottomSheetModalProvider'ı Select bileşenleri için kullanırlar.
 */
export const ProfileStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right', // Yumuşak animasyon
      animationDuration: 200, // Daha hızlı animasyon (varsayılan: 350ms)
      freezeOnBlur: true, // Kaynak tasarrufu için aktif olmayan ekranları dondur
    }}
  >
    {/* Ana Ekranlar */}
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
    
    {/* Liste Ekranları */}
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
    
    {/* Form Ekranları - slide_from_bottom animasyonlu tam ekran formlar */}
    {/* Bunlar modal presentation DEĞİL - daha iyi BottomSheet desteği için card ekranlar */}
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
