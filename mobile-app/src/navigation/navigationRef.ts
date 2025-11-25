import { createNavigationContainerRef } from '@react-navigation/native';

export type RootNavigationParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Applications: undefined;
  Notifications: undefined;
  Profile: undefined;
  Auth?: undefined;
};

export const navigationRef = createNavigationContainerRef<any>();

export const navigate = (name: keyof RootNavigationParamList | string, params?: object) => {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
};

