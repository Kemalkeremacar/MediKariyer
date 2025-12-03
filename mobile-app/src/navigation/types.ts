/**
 * Navigation Type Definitions
 * Centralized type definitions for all navigators
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

/**
 * Root Stack - Top-level navigator
 * Handles routing between authenticated and unauthenticated flows
 */
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  PendingApproval: undefined;
  AccountDisabled: undefined;
};

/**
 * Auth Stack - Unauthenticated flow
 * Screens for login and registration
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Jobs Stack - Job browsing and details
 * Nested within the Jobs tab
 */
export type JobsStackParamList = {
  JobsList: undefined;
  JobDetail: { id: number };
};

/**
 * App Tab - Main authenticated navigation
 * Bottom tab navigator for primary app features
 */
export type AppTabParamList = {
  Dashboard: undefined;
  JobsTab: NavigatorScreenParams<JobsStackParamList>;
  Applications: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
};

/**
 * Combined navigation param list for programmatic navigation
 * Includes all possible routes across all navigators
 */
export type RootNavigationParamList = RootStackParamList &
  AuthStackParamList &
  AppTabParamList &
  JobsStackParamList;

/**
 * Navigation prop types for type-safe navigation
 */
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppTabNavigationProp = BottomTabNavigationProp<AppTabParamList>;
export type JobsStackNavigationProp = NativeStackNavigationProp<JobsStackParamList>;
