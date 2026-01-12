/**
 * @file ErrorBoundary.tsx
 * @description React hata yakalama sınırı bileşeni
 * 
 * Bu bileşen React component tree'sinde oluşan hataları yakalar ve
 * kullanıcıya zarif bir hata ekranı gösterir. Production-ready tasarım.
 * 
 * **Özellikler:**
 * - Gradient arka plan ile marka uyumlu tasarım
 * - "Yeniden Başlat" butonu
 * - Development mode'da detaylı hata bilgisi
 * - Otomatik hata loglama
 * 
 * **ÖNEMLİ:** Bu bileşen için yerel BottomSheetModalProvider gerekmez.
 * App.tsx'teki root-level provider tüm BottomSheetModal bileşenlerini yönetir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors, spacing } from '@/theme';
import { errorLogger } from '@/utils/errorLogger';

/**
 * ErrorBoundary bileşeni için prop tipleri
 * 
 * @interface Props
 * @property {ReactNode} children - Korunacak child component'ler
 * @property {ReactNode} [fallback] - Özel hata UI'ı (opsiyonel)
 * @property {Function} [onError] - Hata yakalandığında çağrılacak callback
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * ErrorBoundary state tipleri
 * 
 * @interface State
 * @property {boolean} hasError - Hata oluştu mu?
 * @property {Error | null} error - Yakalanan hata objesi
 * @property {ErrorInfo | null} errorInfo - React hata bilgisi
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary sınıfı
 * 
 * **Yaşam Döngüsü:**
 * 1. getDerivedStateFromError: Hata yakalandığında state güncellenir
 * 2. componentDidCatch: Hata loglanır ve özel handler çağrılır
 * 3. render: Hata UI'ı veya normal children render edilir
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Hata yakalandığında state'i güncelle
   * React lifecycle method
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Hata yakalandığında loglama ve callback çağırma
   * React lifecycle method
   * 
   * @param error - Yakalanan hata objesi
   * @param errorInfo - React component stack bilgisi
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hata loglama servisine gönder
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'ErrorBoundary',
    });

    // Özel hata handler'ı çağır (varsa)
    this.props.onError?.(error, errorInfo);

    // State'i güncelle
    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Hata state'ini sıfırla ve uygulamayı yeniden başlat
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    // Hata varsa fallback UI göster
    if (this.state.hasError) {
      // Özel fallback UI varsa onu kullan
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Production-ready hata UI - Zarif, marka uyumlu tasarım
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
                {/* Hata İkonu */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
                  </View>
                </View>
                
                {/* Başlık */}
                <Typography variant="h1" style={styles.title}>
                  Bir Şeyler Yanlış Gitti
                </Typography>
                
                {/* Açıklama */}
                <Typography variant="body" style={styles.description}>
                  Üzgünüz, beklenmeyen bir hata oluştu. Uygulamayı yeniden başlatarak sorunu çözebilirsiniz.
                </Typography>

                {/* Development Hata Detayları - Sadece geliştirme modunda */}
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
                      {/* Hata mesajı */}
                      <Typography variant="caption" style={styles.errorText}>
                        {this.state.error.toString()}
                      </Typography>
                      {/* Component stack trace */}
                      {this.state.errorInfo?.componentStack && (
                        <Typography variant="caption" style={styles.stackTrace}>
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Yeniden Başlat Butonu */}
                <Button
                  label="Yeniden Başlat"
                  onPress={this.handleReset}
                  variant="gradient"
                  gradientColors={['#FFFFFF', '#F3F4F6']}
                  size="lg"
                  fullWidth
                  style={styles.button}
                  textStyle={styles.buttonLabel}
                />

                {/* Yardım Metni */}
                <Typography variant="caption" style={styles.helpText}>
                  Sorun devam ederse lütfen destek ekibimizle iletişime geçin.
                </Typography>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      );
    }

    // Hata yoksa normal children'ı render et
    return this.props.children;
  }
}

/**
 * Stil tanımlamaları
 * Gradient arka plan ve zarif hata ekranı tasarımı
 */
const styles = StyleSheet.create({
  // Ana container
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
