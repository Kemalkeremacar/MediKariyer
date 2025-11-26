import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppProviders } from '@/providers/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthInitializer } from '@/providers/AuthInitializer';

export default function App() {
  return (
    <SafeAreaProvider>
      <BottomSheetModalProvider>
        <AppProviders>
          <AuthInitializer />
          <RootNavigator />
          <StatusBar style="dark" />
        </AppProviders>
      </BottomSheetModalProvider>
    </SafeAreaProvider>
  );
}
