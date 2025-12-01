import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { DashboardScreen } from '@/screens/main/DashboardScreen';
import { ApplicationsScreen } from '@/screens/applications/ApplicationsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { JobsStackNavigator } from './JobsStackNavigator';
import type { JobsStackParamList } from './JobsStackNavigator';
import { Home, Briefcase, FileText, User } from 'lucide-react-native';
import { colors } from '@/constants/theme';

export type MainTabParamList = {
  Dashboard: undefined;
  JobsTab: NavigatorScreenParams<JobsStackParamList> | undefined;
  Applications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary[600],
      tabBarInactiveTintColor: colors.neutral[500],
      tabBarStyle: {
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
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
        tabBarIcon: ({ color, size }) => (
          <Home size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="JobsTab"
      component={JobsStackNavigator}
      options={{
        tabBarLabel: 'İlanlar',
        tabBarIcon: ({ color, size }) => (
          <Briefcase size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Applications"
      component={ApplicationsScreen}
      options={{
        tabBarLabel: 'Başvurularım',
        tabBarIcon: ({ color, size }) => (
          <FileText size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Hesabım',
        tabBarIcon: ({ color, size }) => (
          <User size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

