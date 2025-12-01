import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsScreen } from '@/screens/jobs/JobsScreen';
import { JobDetailScreen } from '@/screens/jobs/JobDetailScreen';

export type JobsStackParamList = {
  JobsList: undefined;
  JobDetail: { id: number };
};

const Stack = createNativeStackNavigator<JobsStackParamList>();

export const JobsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="JobsList" component={JobsScreen} />
    <Stack.Screen 
      name="JobDetail" 
      component={JobDetailScreen}
      options={{ 
        presentation: 'card',
        animation: 'slide_from_right'
      }}
    />
  </Stack.Navigator>
);

