/**
 * Global Loader Component
 * Displays a full-screen loading indicator managed by UI store
 */

import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useUIStore } from '@/store/uiStore';
import { theme } from '@/theme';
import { Text } from '@/components/ui/Text';

export const GlobalLoader: React.FC = () => {
  const { isLoading, loadingMessage } = useUIStore();

  if (!isLoading) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isLoading}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          {loadingMessage && (
            <Text
              variant="body"
              color={theme.colors.text.primary}
              style={styles.message}
            >
              {loadingMessage}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing['2xl'],
    minWidth: 150,
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  message: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
