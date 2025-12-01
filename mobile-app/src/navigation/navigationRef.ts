import { createNavigationContainerRef } from '@react-navigation/native';
import type { MainTabParamList } from './MainNavigator';
import type { JobsStackParamList } from './JobsStackNavigator';

export type RootNavigationParamList = MainTabParamList & {
  JobsTab: JobsStackParamList;
};

export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();

export const navigate = <T extends keyof RootNavigationParamList>(
  name: T,
  params?: RootNavigationParamList[T],
) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
};

