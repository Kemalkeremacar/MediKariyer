/**
 * @file RootNavigator.tsx
 * @description Ana navigasyon yöneticisi - Durum bazlı navigasyon
 * 
 * Navigasyon Mantığı (Öncelik Sırası):
 * 1. isHydrating -> Splash Screen (yükleniyor gösterir)
 * 2. !isAuthenticated -> AuthStack (Login/Register)
 * 3. isAuthenticated && !user.is_active -> AccountDisabledScreen (pasif kullanıcılar)
 * 4. isAuthenticated && !user.is_approved -> AuthStack (PendingApproval ekranı)
 * 5. Tüm kontroller geçti -> AppStack (Dashboard)
 * 
 * Özellikler:
 * - Durum bazlı initialRouteName (useEffect navigation.reset çağrıları yok)
 * - Deep linking desteği için tüm ekranlar kayıtlı
 * - MSSQL BIT alanları için toleranslı tip kontrolü (1, '1', true, 'true')
 * - Mobile API entegrasyonu (authService.getMe() üzerinden)
 * - Otomatik yönlendirme (auth durumu değiştiğinde)
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AccountDisabledScreen } from '@/features/auth/screens/AccountDisabledScreen';
import { useAuthStore } from '@/store/authStore';
import { navigationRef } from './navigationRef';
import { colors, spacing, typography } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { devLog } from '@/utils/devLogger';
import type { RootStackParamList } from './types';

// Enable screens - hem eski hem yeni mimari ile güvenli şekilde çağrılabilir
try {
  enableScreens();
} catch (error) {
  if (__DEV__) {
    devLog.warn('Screens etkinleştirilemedi:', error);
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Kullanıcının aktif olup olmadığını kontrol eden yardımcı fonksiyon
 * @description Boolean, number, string tiplerini yönetir (MSSQL BIT tipi için)
 * 
 * ÖNEMLİ: Kullanıcı yoksa veya is_active undefined/null ise, kullanıcıyı engelleme!
 * Sadece kesinlikle false veya 0 ise engelle.
 * 
 * MSSQL BIT tipi için toleranslı kontrol - 1, '1', true, 'true' değerlerini kabul eder
 * 
 * @param user - Kullanıcı objesi
 * @returns Aktifse true, değilse false
 */
const isUserActive = (user: any): boolean => {
  // Kullanıcı yoksa Login'e gider, engelleme yapma!
  if (!user) {
    devLog.log('🛑 DEBUG isUserActive: kullanıcı null/undefined, TRUE döndürülüyor (login\'e izin ver)');
    return true;
  }
  
  // ÇOK DETAYLI DEBUG LOG'LAR
  devLog.log('🛑 DEBUG isUserActive - TAM KULLANICI OBJESİ:', JSON.stringify(user, null, 2));
  devLog.log('🛑 DEBUG isUserActive - is_active değeri:', user.is_active);
  devLog.log('🛑 DEBUG isUserActive - is_active tipi:', typeof user.is_active);
  devLog.log('🛑 DEBUG isUserActive - is_active === 0:', user.is_active === 0);
  devLog.log('🛑 DEBUG isUserActive - is_active === false:', user.is_active === false);
  devLog.log('🛑 DEBUG isUserActive - is_active === "0":', user.is_active === '0');
  devLog.log('🛑 DEBUG isUserActive - is_active === null:', user.is_active === null);
  devLog.log('🛑 DEBUG isUserActive - is_active === undefined:', user.is_active === undefined);
  
  const active = user.is_active;
  
  // ACİL ÖNLEM: Eğer undefined veya null ise, kullanıcıyı engelleme!
  // Varsayılan olarak AKTİF kabul et (Login olabilsin, engel olmasın)
  if (active === undefined || active === null) {
    devLog.log('🛑 DEBUG isUserActive - is_active null/undefined, varsayılan TRUE (erişime izin ver)');
    return true; 
  }
  
  // Toleranslı Kontrol - Aktif değerler
  if (active === true) {
    devLog.log('🛑 DEBUG isUserActive - is_active true, TRUE döndürülüyor');
    return true;
  }
  if (active === 1) {
    devLog.log('🛑 DEBUG isUserActive - is_active 1, TRUE döndürülüyor');
    return true;
  }
  if (active === '1') {
    devLog.log('🛑 DEBUG isUserActive - is_active "1", TRUE döndürülüyor');
    return true;
  }
  if (active === 'true') {
    devLog.log('🛑 DEBUG isUserActive - is_active "true", TRUE döndürülüyor');
    return true;
  }
  
  // Sadece kesinlikle false veya 0 ise engelle
  if (active === false || active === 0 || active === '0') {
    devLog.log('🛑 DEBUG isUserActive - is_active false/0/"0", FALSE döndürülüyor (erişimi engelle)');
    return false;
  }

  // Diğer her durumda (beklenmeyen değerler) AKTİF kabul et
  devLog.log('🛑 DEBUG isUserActive - beklenmeyen değer, varsayılan TRUE (erişime izin ver)');
  return true;
};

/**
 * Kullanıcının onaylı olup olmadığını kontrol eden yardımcı fonksiyon
 * @description Boolean, number, string tiplerini yönetir (MSSQL BIT tipi için)
 * @param user - Kullanıcı objesi
 * @returns Onaylıysa true, değilse false
 */
const isUserApproved = (user: any): boolean => {
  if (user?.is_approved === undefined || user?.is_approved === null) return false;
  if (typeof user.is_approved === 'boolean') return user.is_approved;
  if (typeof user.is_approved === 'number') return user.is_approved === 1;
  if (typeof user.is_approved === 'string') return user.is_approved === 'true' || user.is_approved === '1';
  return false;
};

export const RootNavigator = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Auth durumuna göre başlangıç route'unu belirle (performans için memoize edilmiş)
  const initialRouteName = useMemo((): keyof RootStackParamList => {
    devLog.log('🧭 RootNavigator - initialRouteName hesaplanıyor:', {
      isHydrating,
      authStatus,
      hasUser: !!user,
      userId: user?.id,
      isActive: user?.is_active,
      isApproved: user?.is_approved,
    });

    // Hydration sırasında Auth göster (hydration sonrası gerçek duruma göre değişecek)
    if (isHydrating) {
      devLog.log('🧭 RootNavigator - Auth döndürülüyor (hydrating)');
      return 'Auth';
    }

    // Authenticated değil
    if (authStatus !== 'authenticated' || !user) {
      devLog.log('🧭 RootNavigator - Auth döndürülüyor (authenticated değil)');
      return 'Auth';
    }

    // Authenticated - kullanıcı durumunu kontrol et
    const userIsActive = isUserActive(user);
    const userIsApproved = isUserApproved(user);
    const userIsAdmin = user.role === 'admin';

    devLog.log('🧭 RootNavigator - Kullanıcı kontrolleri:', {
      userIsActive,
      userIsApproved,
      userIsAdmin,
    });

    // Önce pasif durumu kontrol et - en kısıtlayıcı
    if (!userIsActive) {
      devLog.log('🧭 RootNavigator - AccountDisabled döndürülüyor (pasif)');
      return 'AccountDisabled';
    }

    // Onay durumunu kontrol et
    if (!userIsApproved && !userIsAdmin) {
      devLog.log('🧭 RootNavigator - Auth döndürülüyor (onaysız)');
      return 'Auth'; // Auth stack PendingApproval ekranını gösterecek
    }

    // Kullanıcı authenticated, aktif ve onaylı
    devLog.log('🧭 RootNavigator - App döndürülüyor (authenticated, aktif, onaylı)');
    return 'App';
  }, [isHydrating, authStatus, user]);

  // Track previous route to detect changes
  const previousRouteRef = useRef<keyof RootStackParamList | null>(null);

  // CRITICAL: Reset navigation when initialRouteName changes
  // This ensures navigation happens immediately when auth state changes
  // React Navigation's initialRouteName only works on first render,
  // so we need to manually reset navigation when route should change
  useEffect(() => {
    // Skip if still hydrating (will be handled after hydration completes)
    if (isHydrating) {
      return;
    }

    // Skip if route hasn't changed
    if (previousRouteRef.current === initialRouteName) {
      return;
    }

    // Skip if navigation is not ready
    if (!navigationRef.isReady()) {
      devLog.log('🧭 RootNavigator - Navigation ref not ready, skipping reset');
      return;
    }

    // Get current route to avoid unnecessary resets
    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name as keyof RootStackParamList;

    // Only reset if we're not already on the target route
    if (currentRouteName !== initialRouteName) {
      devLog.log('🧭 RootNavigator - Route changed, resetting navigation:', {
        from: previousRouteRef.current,
        to: initialRouteName,
        current: currentRouteName,
      });

      navigationRef.reset({
        index: 0,
        routes: [{ name: initialRouteName }],
      });

      devLog.log('🧭 RootNavigator - Navigation reset completed');
    } else {
      devLog.log('🧭 RootNavigator - Already on target route, skipping reset');
    }

    // Update previous route
    previousRouteRef.current = initialRouteName;
  }, [initialRouteName, isHydrating]);

  // Loading state - Show splash screen
  if (isHydrating) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Typography variant="h2" style={styles.brandName}>
            MediKariyer
          </Typography>
          <ActivityIndicator 
            size="large" 
            color={colors.primary[600]} 
            style={styles.spinner}
          />
          <Typography variant="body" style={styles.loadingText}>
            Yükleniyor...
          </Typography>
        </View>
      </View>
    );
  }

  // State-Based Navigation
  // All screens are registered for deep linking support
  // Using key prop to force re-render when route changes (ensures initialRouteName is respected)
  // This eliminates the need for useEffect-based navigation.reset() calls
  return (
    <Stack.Navigator
      key={initialRouteName} // Force re-render when route changes
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth stack - For login, register, and pending approval */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
      
      {/* App stack - For authenticated and approved users */}
      <Stack.Screen name="App" component={AppNavigator} />
      
      {/* Account disabled screen - For authenticated but inactive users */}
      <Stack.Screen name="AccountDisabled" component={AccountDisabledScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 90,
    height: 90,
  },
  brandName: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing['3xl'],
    letterSpacing: 1,
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
  },
});
