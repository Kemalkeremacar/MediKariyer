import React from 'react';
import { Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { JobsStackNavigator } from './JobsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { Home, Briefcase, FileText, Settings } from 'lucide-react-native';
import { colors } from '@/theme';
import type { AppTabParamList } from './types';

const AnimatedIcon = ({ Icon, focused }: { Icon: any; focused: boolean }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Icon
        size={24}
        color={focused ? colors.primary[600] : colors.neutral[500]}
        strokeWidth={focused ? 2.5 : 2}
      />
    </Animated.View>
  );
};

const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * TabNavigator - Main app navigation
 * Bottom tab navigator for primary authenticated features
 * 
 * Tabs:
 * - Dashboard: Anasayfa (Home page with overview)
 * - JobsTab: İlanlar (Job listings)
 * - Applications: Başvurularım (My applications)
 * - Notifications: Bildirimler (Notifications)
 * - ProfileTab: Profilim (Profile editing)
 * - SettingsTab: Hesabım (Account settings)
 */
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[100],
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Anasayfa',
        tabBarIcon: ({ focused }) => (
          <AnimatedIcon Icon={Home} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="JobsTab"
      component={JobsStackNavigator}
      options={{
        tabBarLabel: 'İlanlar',
        tabBarIcon: ({ focused }) => (
          <AnimatedIcon Icon={Briefcase} focused={focused} />
        ),
      }}
      listeners={({ navigation }) => ({
        tabPress: () => {
          navigation.navigate('JobsTab', { screen: 'JobsList' });
        },
      })}
    />
    <Tab.Screen
      name="Applications"
      component={ApplicationsScreen}
      options={{
        tabBarLabel: 'Başvurular',
        tabBarIcon: ({ focused }) => (
          <AnimatedIcon Icon={FileText} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="SettingsTab"
      component={SettingsStackNavigator}
      options={{
        tabBarLabel: 'Hesabım',
        tabBarIcon: ({ focused }) => (
          <AnimatedIcon Icon={Settings} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        tabBarButton: () => null,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileStackNavigator}
      options={{
        tabBarButton: () => null,
      }}
    />
    </Tab.Navigator>
  );
};




