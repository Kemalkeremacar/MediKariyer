import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Henüz İçerik Yok',
  message = 'Burada görüntülenecek bir şey bulunamadı.',
  actionText,
  onAction,
  fullScreen = false,
}) => {
  return (
    <View style={fullScreen ? styles.containerFullScreen : styles.container}>
      {icon || <Ionicons name="file-tray-outline" size={64} color={colors.neutral[400]} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <View style={styles.actionContainer}>
          <Button onPress={onAction} variant="primary">
            {actionText}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  containerFullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: spacing.lg,
  },
});
