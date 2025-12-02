import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { errorLogger } from '@/utils/errorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log unhandled error
    errorLogger.logUnhandledError(error, true);
    
    // Log error info for debugging
    errorLogger.logError(error, {
      type: 'render',
      componentStack: errorInfo.componentStack,
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text variant="h2" align="center" style={styles.title}>
            Bir Şeyler Yanlış Gitti
          </Text>
          <Text
            variant="body"
            align="center"
            color={theme.colors.text.secondary}
            style={styles.message}
          >
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen uygulamayı yeniden başlatmayı deneyin.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text variant="bodySmall" color={theme.colors.error[600]}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
          <Button onPress={this.handleReset} style={styles.button}>
            Tekrar Dene
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['3xl'],
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    marginBottom: theme.spacing.lg,
  },
  message: {
    marginBottom: theme.spacing.xl,
  },
  errorDetails: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    maxWidth: '100%',
  },
  button: {
    minWidth: 150,
  },
});
