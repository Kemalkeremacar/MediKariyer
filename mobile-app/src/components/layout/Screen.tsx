/**
 * Screen Component
 * TD-004: theme: any → Theme tipi ile değiştirildi
 */

import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import type { Theme } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  safeArea?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  header,
  loading = false,
  error = null,
  onRetry,
  scrollable = true,
  refreshing = false,
  onRefresh,
  safeArea = true,
  style,
  contentContainerStyle,
}) => {
  const { theme } = useTheme();
  const Container = safeArea ? SafeAreaView : View;
  const ContentWrapper = scrollable ? ScrollView : View;
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Typography variant="h3" style={styles.errorTitle}>
            Bir Hata Oluştu
          </Typography>
          <Typography variant="body" style={styles.errorMessage}>
            {error.message || 'Beklenmeyen bir hata oluştu'}
          </Typography>
          {onRetry && (
            <Button onPress={onRetry} style={styles.retryButton} label="Tekrar Dene" />
          )}
        </View>
      );
    }

    return children;
  };

  return (
    <Container style={[styles.container, style]}>
      {header}
      <ContentWrapper
        style={styles.content}
        contentContainerStyle={[
          scrollable && styles.scrollContent,
          contentContainerStyle,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[600]}
            />
          ) : undefined
        }
      >
        {renderContent()}
      </ContentWrapper>
    </Container>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  errorTitle: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  errorMessage: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  retryButton: {
    minWidth: 120,
  },
});
