import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { errorLogger } from '@/utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'ErrorBoundary',
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - Simple design without theme dependencies
      // This ensures ErrorBoundary works even if ThemeProvider fails
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={80} color={colors.error[600]} />
            </View>
            
            <Typography variant="h1" style={styles.title}>
              Beklenmeyen Bir Hata Oluştu
            </Typography>
            
            <Typography variant="body" style={styles.description}>
              Üzgünüz, bir şeyler yanlış gitti. Lütfen uygulamayı yeniden başlatın.
            </Typography>

            {__DEV__ && this.state.error && (
              <View style={styles.errorCard}>
                <Typography variant="h4" style={styles.errorTitle}>
                  Hata Detayı (Sadece Development):
                </Typography>
                <Typography variant="caption" style={styles.errorText}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo?.componentStack && (
                  <Typography variant="caption" style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </View>
            )}

            <Button
              label="Tekrar Dene"
              onPress={this.handleReset}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.button}
            />
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  errorCard: {
    width: '100%',
    marginBottom: spacing.xl,
    backgroundColor: colors.error[50],
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error[700],
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: colors.error[600],
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  stackTrace: {
    fontSize: 11,
    color: colors.neutral[600],
    fontFamily: 'monospace',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  button: {
    marginTop: spacing.lg,
  },
});
