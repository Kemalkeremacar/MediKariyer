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
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppProviders>
          <NavigationContainer ref={navigationRef}>
            <BottomSheetModalProvider>
              <AuthInitializer />
              <RootNavigator />
            </BottomSheetModalProvider>
          </NavigationContainer>
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
