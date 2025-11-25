import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '@/screens/main/DashboardScreen';
import { JobsScreen } from '@/screens/jobs/JobsScreen';
import { ApplicationsScreen } from '@/screens/applications/ApplicationsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { View, Text } from 'react-native';

type MainTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Applications: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const PlaceholderScreen = ({ label }: { label: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{label}</Text>
  </View>
);

export const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Jobs" component={JobsScreen} />
    <Tab.Screen name="Applications" component={ApplicationsScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

