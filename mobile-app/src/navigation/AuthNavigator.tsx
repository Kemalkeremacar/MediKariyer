/**
 * @file AuthNavigator.tsx
 * @description Kimlik Doğrulama Navigator'ı - Unauthenticated akış
 * 
 * Authenticated olmayan kullanıcılar için navigasyon yapısı.
 * Login, Register, ForgotPassword, ResetPassword, PendingApproval, Onboarding ekranlarını içerir.
 * 
 * Ekranlar:
 * - Login: Giriş ekranı
 * - Register: Kayıt ekranı
 * - PendingApproval: Onay bekleme ekranı
 * - Onboarding: Tanıtım ekranları (onaylı kullanıcılar için)
 * - ForgotPassword: Şifre sıfırlama talebi ekranı
 * - ResetPassword: Şifre sıfırlama ekranı (token ile)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';
import { PendingApprovalScreen } from '@/features/auth/screens/PendingApprovalScreen';
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { useAuthStore } from '@/store/authStore';
import { devLog } from '@/utils/devLogger';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Kullanıcının onaylı olup olmadığını kontrol eden yardımcı fonksiyon
 */
const isUserApproved = (user: any): boolean => {
  if (user?.is_approved === undefined || user?.is_approved === null) return false;
  if (typeof user.is_approved === 'boolean') return user.is_approved;
  if (typeof user.is_approved === 'number') return user.is_approved === 1;
  if (typeof user.is_approved === 'string') return user.is_approved === 'true' || user.is_approved === '1';
  return false;
};

/**
 * Kullanıcının onboarding'i gördüğünü kontrol eden yardımcı fonksiyon
 */
const hasUserSeenOnboarding = (user: any): boolean => {
  if (user?.is_onboarding_seen === undefined || user?.is_onboarding_seen === null) return false;
  if (typeof user.is_onboarding_seen === 'boolean') return user.is_onboarding_seen;
  if (typeof user.is_onboarding_seen === 'number') return user.is_onboarding_seen === 1;
  if (typeof user.is_onboarding_seen === 'string') return user.is_onboarding_seen === 'true' || user.is_onboarding_seen === '1';
  return false;
};

/**
 * AuthNavigator - Unauthenticated akış
 * @description Login ve kayıt ekranlarını yönetir
 */
export const AuthNavigator = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  // Auth stack içinde hangi ekranın gösterileceğini belirle
  const initialRouteName = useMemo((): keyof AuthStackParamList => {
    devLog.log('🔐 AuthNavigator - initialRouteName hesaplanıyor:', {
      authStatus,
      hasUser: !!user,
      userId: user?.id,
      isApproved: user?.is_approved,
      isOnboardingSeen: user?.is_onboarding_seen,
    });

    // Authenticated değilse Login göster
    if (authStatus !== 'authenticated' || !user) {
      devLog.log('🔐 AuthNavigator - Login döndürülüyor (authenticated değil)');
      return 'Login';
    }

    // Authenticated ama onaysız ise PendingApproval göster
    const userIsApproved = isUserApproved(user);
    const userIsAdmin = user.role === 'admin';
    
    if (!userIsApproved && !userIsAdmin) {
      devLog.log('🔐 AuthNavigator - PendingApproval döndürülüyor (onaysız)');
      return 'PendingApproval';
    }

    // Onaylı ama onboarding görmemiş ise Onboarding göster
    const userHasSeenOnboarding = hasUserSeenOnboarding(user);
    
    if (!userHasSeenOnboarding) {
      devLog.log('🔐 AuthNavigator - Onboarding döndürülüyor (onboarding görülmemiş)');
      return 'Onboarding';
    }

    // Bu duruma gelmemeli (RootNavigator App'e yönlendirmeli)
    devLog.log('🔐 AuthNavigator - Login döndürülüyor (fallback)');
    return 'Login';
  }, [authStatus, user?.id, user?.is_approved, user?.is_onboarding_seen, user?.role]);

  // NOT: Navigation reset burada yapılmıyor çünkü:
  // 1. useLogin hook zaten login sonrası doğru ekrana yönlendiriyor
  // 2. RootNavigator state değişikliklerinde navigation reset yapıyor
  // 3. CommonActions.reset() nested navigator'da çalışmıyor ve error veriyor

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false, // Header'ları gizle (custom header kullanılıyor)
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

