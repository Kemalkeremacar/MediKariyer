import React from 'react';
import { Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { JobsStackNavigator } from './JobsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
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
 * - ProfileTab: Anasayfa (Profile as home page)
 * - JobsTab: İlanlar (Job listings)
 * - Applications: Başvurular (My applications)
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
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[100],
          height: 80,
          paddingBottom: 15,
          paddingTop: 10,
          paddingHorizontal: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
    <Tab.Screen
      name="ProfileTab"
      component={ProfileStackNavigator}
      options={{
        tabBarLabel: 'Anasayfa',
        tabBarIcon: ({ focused }) => (
          <AnimatedIcon Icon={Home} focused={focused} />
        ),
      }}
      listeners={({ navigation }) => ({
        tabPress: () => {
          navigation.navigate('ProfileTab', { screen: 'ProfileMain' });
        },
      })}
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
    </Tab.Navigator>
  );
};




