import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Text } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { PendingApprovalScreen } from '@/screens/auth/PendingApprovalScreen';
import { useAuthStore } from '@/store/authStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { isApprovedFlag } from '@/utils/approval';

// Enable screens - safe to call with both old and new architecture
// Note: With new architecture enabled, some warnings may appear but functionality works
try {
  enableScreens();
} catch (error) {
  // Silently fail if screens can't be enabled (e.g., in some test environments)
  if (__DEV__) {
    console.warn('Failed to enable screens:', error);
  }
}

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
      return <MainNavigator />;
    }

    const isApproved = isApprovedFlag(user.is_approved);
    if (!isApproved) {
      return <PendingApprovalScreen />;
    }
  }

  return authStatus === 'authenticated' ? <MainNavigator /> : <AuthNavigator />;
};

