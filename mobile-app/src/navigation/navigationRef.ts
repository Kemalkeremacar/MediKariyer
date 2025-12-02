import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootNavigationParamList } from './types';

/**
 * Navigation reference for programmatic navigation
 * Allows navigation from outside React components (e.g., services, utilities)
 */
export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();

/**
 * Navigate to a screen programmatically
 * @param name - Screen name to navigate to
 * @param params - Optional parameters for the screen
 */
export const navigate = (name: keyof RootNavigationParamList, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
};

/**
 * Go back to the previous screen
 */
export const goBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

/**
 * Reset the navigation state
 * @param state - New navigation state
 */
export const reset = (state: Parameters<typeof navigationRef.reset>[0]) => {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  }
};

/**
 * Get current route name
 */
export const getCurrentRoute = () => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return undefined;
};

