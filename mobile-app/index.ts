import { registerRootComponent } from 'expo';

import App from './App';

// Disable console logs in production to prevent JS thread blocking
// This is critical for performance, especially on Android emulator
if (__DEV__ === false) {
  console.log = () => {};
  console.warn = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Keep console.error for critical errors
}

// Disable yellow box warnings in production
if (__DEV__ === false) {
  // @ts-ignore - console.disableYellowBox is a React Native global that exists at runtime
  if (typeof (console as any).disableYellowBox !== 'undefined') {
    (console as any).disableYellowBox = true;
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
