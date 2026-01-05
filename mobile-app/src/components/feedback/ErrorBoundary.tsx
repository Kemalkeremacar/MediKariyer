/**
 * ErrorBoundary - Stabilizasyon Faz 5
 * 
 * Production-ready error boundary with elegant fallback UI
 * - Markaya uygun tasarım
 * - "Yeniden Başlat" butonu
 * - Development mode'da detaylı hata bilgisi
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors, spacing } from '@/theme';
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

      // Production-ready error UI - Elegant, brand-consistent design
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#1D4ED8', '#2563EB', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
                  </View>
                </View>
                
                {/* Title */}
                <Typography variant="h1" style={styles.title}>
                  Bir Şeyler Yanlış Gitti
                </Typography>
                
                {/* Description */}
                <Typography variant="body" style={styles.description}>
                  Üzgünüz, beklenmeyen bir hata oluştu. Uygulamayı yeniden başlatarak sorunu çözebilirsiniz.
                </Typography>

                {/* Development Error Details */}
                {__DEV__ && this.state.error && (
                  <View style={styles.errorCard}>
                    <View style={styles.errorHeader}>
                      <Ionicons name="code-slash" size={20} color={colors.error[600]} />
                      <Typography variant="h3" style={styles.errorTitle}>
                        Hata Detayı (Development)
                      </Typography>
                    </View>
                    <ScrollView 
                      style={styles.errorScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={true}
                    >
                      <Typography variant="caption" style={styles.errorText}>
                        {this.state.error.toString()}
                      </Typography>
                      {this.state.errorInfo?.componentStack && (
                        <Typography variant="caption" style={styles.stackTrace}>
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Action Button */}
                <Button
                  label="Yeniden Başlat"
                  onPress={this.handleReset}
                  variant="gradient"
                  gradientColors={['#FFFFFF', '#F3F4F6']}
                  size="lg"
                  fullWidth
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                  icon={<Ionicons name="refresh" size={20} color="#1D4ED8" />}
                />

                {/* Help Text */}
                <Typography variant="caption" style={styles.helpText}>
                  Sorun devam ederse lütfen destek ekibimizle iletişime geçin.
                </Typography>
              </View>
            </ScrollView>
          </LinearGradient>
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
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  errorCard: {
    width: '100%',
    marginBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error[200],
    maxHeight: 300,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error[700],
  },
  errorScroll: {
    maxHeight: 200,
  },
  errorText: {
    fontSize: 12,
    color: colors.error[600],
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    lineHeight: 18,
  },
  stackTrace: {
    fontSize: 11,
    color: colors.neutral[600],
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  button: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonLabel: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  helpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
