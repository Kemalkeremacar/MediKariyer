/**
 * Navigation Module
 * Centralized exports for all navigation components and utilities
 */

export { RootNavigator } from './RootNavigator';
export { AuthNavigator } from './AuthNavigator';
export { AppNavigator } from './AppNavigator';
export { TabNavigator } from './TabNavigator';
export { JobsStackNavigator } from './JobsStackNavigator';
export { navigationRef, navigate, goBack, reset, getCurrentRoute } from './navigationRef';
export type {
  RootStackParamList,
  AuthStackParamList,
  AppTabParamList,
  JobsStackParamList,
  RootNavigationParamList,
  RootStackNavigationProp,
  AuthStackNavigationProp,
  AppTabNavigationProp,
  JobsStackNavigationProp,
} from './types';
