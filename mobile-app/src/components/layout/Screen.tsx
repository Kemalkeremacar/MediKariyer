import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Loader } from '@/components/feedback/Loader';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

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
          <Loader size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text variant="h4" align="center" style={styles.errorTitle}>
            Bir Hata Oluştu
          </Text>
          <Text align="center" color={theme.colors.text.secondary} style={styles.errorMessage}>
            {error.message || 'Beklenmeyen bir hata oluştu'}
          </Text>
          {onRetry && (
            <Button onPress={onRetry} style={styles.retryButton}>
              Tekrar Dene
            </Button>
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

const createStyles = (theme: any) => StyleSheet.create({
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
  },
  errorMessage: {
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    minWidth: 120,
  },
});
