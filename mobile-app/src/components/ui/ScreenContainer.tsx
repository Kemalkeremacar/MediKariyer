import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export const ScreenContainer = ({
  children,
  scrollable = true,
  contentContainerStyle,
  style,
  ...scrollProps
}: ScreenContainerProps) => {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
});


