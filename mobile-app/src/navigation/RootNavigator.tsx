import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Text } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { PendingApprovalScreen } from '@/screens/auth/PendingApprovalScreen';
import { useAuthStore } from '@/store/authStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { navigationRef } from '@/navigation/navigationRef';

enableScreens();

export const RootNavigator = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const user = useAuthStore((state) => state.user);
  usePushNotifications();

  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Başlatılıyor...</Text>
      </View>
    );
  }

  // Approval Guard Logic (web'deki ApprovalGuard.jsx ile aynı mantık)
  if (authStatus === 'authenticated' && user) {
    // Admin muafiyeti: Admin rolü için onay kontrolü yapılmaz
    if (user.role === 'admin') {
      return (
        <NavigationContainer ref={navigationRef}>
          <MainNavigator />
        </NavigationContainer>
      );
    }

    // Onay durumu kontrolü: is_approved === true veya is_approved === 1 (backend uyumluluğu)
    const isApproved =
      user.is_approved === true ||
      user.is_approved === 1 ||
      String(user.is_approved) === '1';
    if (!isApproved) {
      return (
        <NavigationContainer ref={navigationRef}>
          <PendingApprovalScreen />
        </NavigationContainer>
      );
    }
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {authStatus === 'authenticated' ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

