import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsScreen, JobDetailScreen } from '@/features/jobs/screens';
import type { JobsStackParamList } from './types';

const Stack = createNativeStackNavigator<JobsStackParamList>();

/**
 * JobsStackNavigator - Job browsing flow
 * Nested stack navigator for jobs list and job details
 */
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

