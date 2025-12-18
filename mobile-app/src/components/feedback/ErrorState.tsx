import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Bir Hata Oluştu',
  message = 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.',
  onRetry,
  retryText = 'Tekrar Dene',
  fullScreen = false,
}) => {
  return (
    <View style={fullScreen ? styles.containerFullScreen : styles.container}>
      <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={styles.actionContainer}>
          <Button onPress={onRetry} variant="primary" label={retryText} />
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
