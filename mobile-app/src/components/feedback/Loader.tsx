import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/ui/Text';

export interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color = theme.colors.primary[600],
  message,
  fullScreen = false,
  style,
}) => {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text
          variant="bodySmall"
          color={theme.colors.text.secondary}
          style={styles.message}
        >
          {message}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, style]}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  message: {
    marginTop: theme.spacing.md,
  },
});
