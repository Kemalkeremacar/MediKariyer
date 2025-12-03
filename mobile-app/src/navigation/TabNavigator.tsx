import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { JobsStackNavigator } from './JobsStackNavigator';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { Home, Briefcase, FileText, User } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * TabNavigator - Main app navigation
 * Bottom tab navigator for primary authenticated features
 */
export const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary[600],
      tabBarInactiveTintColor: colors.neutral[500],
      tabBarStyle: {
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        height: 70,
        paddingBottom: 12,
        paddingTop: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Anasayfa',
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="JobsTab"
      component={JobsStackNavigator}
      options={{
        tabBarLabel: 'İlanlar',
        tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Applications"
      component={ApplicationsScreen}
      options={{
        tabBarLabel: 'Başvurularım',
        tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Hesabım',
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);


