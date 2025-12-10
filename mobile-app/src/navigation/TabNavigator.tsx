import React from 'react';
import { Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { JobsStackNavigator } from './JobsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
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
 * - SettingsTab: Ayarlar (Settings)
 */
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 16,
          left: 16,
          right: 16,
          backgroundColor: colors.background.primary,
          borderTopWidth: 0,
          borderRadius: 24,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 12 : 10,
          paddingTop: 10,
          paddingHorizontal: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          marginHorizontal: 4,
          borderRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 2,
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
        tabBarLabel: 'Ayarlar',
        tabBarIcon: ({ focused }) => (
          <AnimatedIcon Icon={Settings} focused={focused} />
        ),
      }}
      listeners={({ navigation }) => ({
        tabPress: () => {
          navigation.navigate('SettingsTab', { screen: 'SettingsMain' });
        },
      })}
    />
    </Tab.Navigator>
  );
};




