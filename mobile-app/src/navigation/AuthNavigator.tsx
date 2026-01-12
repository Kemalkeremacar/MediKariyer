/**
 * @file AuthNavigator.tsx
 * @description Kimlik Doğrulama Navigator'ı - Unauthenticated akış
 * 
 * Authenticated olmayan kullanıcılar için navigasyon yapısı.
 * Login, Register, ForgotPassword, ResetPassword ekranlarını içerir.
 * 
 * Ekranlar:
 * - Login: Giriş ekranı
 * - Register: Kayıt ekranı
 * - PendingApproval: Onay bekleme ekranı
 * - ForgotPassword: Şifre sıfırlama talebi ekranı
 * - ResetPassword: Şifre sıfırlama ekranı (token ile)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';
import { PendingApprovalScreen } from '@/features/auth/screens/PendingApprovalScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator - Unauthenticated akış
 * @description Login ve kayıt ekranlarını yönetir
 */
export const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false, // Header'ları gizle (custom header kullanılıyor)
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

