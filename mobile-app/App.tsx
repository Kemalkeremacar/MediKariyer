import React from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppProviders } from '@/providers/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthInitializer } from '@/providers/AuthInitializer';
import { navigationRef } from '@/navigation/navigationRef';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { StyleSheet } from 'react-native';

/**
 * AppContent - Inner app component with push notifications
 */
const AppContent = () => {
  // Initialize push notifications
  usePushNotifications();

  return (
    <>
      <AuthInitializer />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppProviders>
          <ErrorBoundary>
            <NavigationContainer ref={navigationRef}>
              <BottomSheetModalProvider>
                <AppContent />
              </BottomSheetModalProvider>
            </NavigationContainer>
          </ErrorBoundary>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
