/**
 * @file Screen.tsx
 * @description Temel ekran layout bileşeni
 * 
 * Bu bileşen tüm ekranlar için temel layout yapısını sağlar.
 * Safe area, scroll, loading, error ve offline durumlarını yönetir.
 * 
 * **Özellikler:**
 * - Safe area desteği (notch/status bar)
 * - Scroll veya static layout
 * - Pull-to-refresh desteği
 * - Loading ve error state'leri
 * - Offline banner gösterimi
 * - Özelleştirilebilir header
 * 
 * **TD-004:** theme: any → Theme tipi ile değiştirildi (TypeScript iyileştirmesi)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
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
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { Theme } from '@/theme';

/**
 * Screen bileşeni için prop tipleri
 * 
 * @interface ScreenProps
 * @property {React.ReactNode} children - Ekran içeriği
 * @property {React.ReactNode} [header] - Özel header bileşeni (opsiyonel)
 * @property {boolean} [loading] - Yükleme durumu
 * @property {Error | null} [error] - Hata objesi
 * @property {Function} [onRetry] - Hata durumunda tekrar deneme callback'i
 * @property {boolean} [scrollable] - Scroll edilebilir mi? (varsayılan: true)
 * @property {boolean} [refreshing] - Pull-to-refresh yenileme durumu
 * @property {Function} [onRefresh] - Pull-to-refresh callback'i
 * @property {boolean} [safeArea] - Safe area kullan (varsayılan: true)
 * @property {Array} [safeAreaEdges] - Safe area kenarları (varsayılan: ['top'])
 * @property {ViewStyle} [style] - Ek stil özellikleri
 * @property {ViewStyle} [contentContainerStyle] - İçerik container stili
 * @property {boolean} [showOfflineBanner] - Offline banner göster (varsayılan: true)
 */
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
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showOfflineBanner?: boolean;
}

/**
 * Temel ekran layout bileşeni
 * 
 * **Render Mantığı:**
 * 1. Loading durumu → ActivityIndicator göster
 * 2. Error durumu → Hata mesajı ve tekrar dene butonu göster
 * 3. Normal durum → Children'ı render et
 * 
 * **Kullanım:**
 * ```tsx
 * <Screen
 *   loading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 *   scrollable={true}
 *   refreshing={isRefreshing}
 *   onRefresh={handleRefresh}
 *   safeArea={true}
 *   safeAreaEdges={['top']}
 * >
 *   <View>İçerik</View>
 * </Screen>
 * ```
 * 
 * @param props - Screen prop'ları
 * @returns Ekran layout bileşeni
 */
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
  safeAreaEdges = ['top'], // Varsayılan: Sadece üst kenar (tab bar üstünde gri alan olmaması için)
  style,
  contentContainerStyle,
  showOfflineBanner = true,
}) => {
  const { theme } = useTheme();
  const { isOffline } = useNetworkStatus();
  
  /**
   * Container bileşeni seçimi
   * safeArea true ise SafeAreaView, değilse View kullan
   */
  const Container = safeArea ? SafeAreaView : View;
  
  /**
   * İçerik wrapper bileşeni seçimi
   * scrollable true ise ScrollView, değilse View kullan
   */
  const ContentWrapper = scrollable ? ScrollView : View;
  
  /**
   * Tema bazlı stiller
   * Memoize edilmiş, tema değiştiğinde yeniden hesaplanır
   */
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * İçerik render fonksiyonu
   * Loading, error ve normal durumları yönetir
   */
  const renderContent = () => {
    // Yükleme durumu - Merkezi spinner göster
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      );
    }

    // Hata durumu - Hata mesajı ve tekrar dene butonu göster
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Typography variant="h3" style={styles.errorTitle}>
            Bir Hata Oluştu
          </Typography>
          <Typography variant="body" style={styles.errorMessage}>
            {error.message || 'Beklenmeyen bir hata oluştu'}
          </Typography>
          {/* Tekrar dene butonu (onRetry varsa) */}
          {onRetry && (
            <Button onPress={onRetry} style={styles.retryButton} label="Tekrar Dene" />
          )}
        </View>
      );
    }

    // Normal durum - Children'ı render et
    return children;
  };

  return (
    <Container 
      style={[styles.container, style]}
      {...(safeArea && Container === SafeAreaView ? { edges: safeAreaEdges } : {})}
    >
      {/* Offline Banner - İnternet bağlantısı kesildiğinde göster */}
      {showOfflineBanner && <OfflineBanner visible={isOffline} />}
      
      {/* Özel Header (varsa) */}
      {header}
      
      {/* İçerik Wrapper - Scroll veya static */}
      <ContentWrapper
        style={styles.content}
        contentContainerStyle={[
          scrollable && styles.scrollContent,
          contentContainerStyle,
        ]}
        refreshControl={
          // Pull-to-refresh desteği (onRefresh varsa)
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

/**
 * Tema bazlı stil oluşturma fonksiyonu
 * 
 * @param theme - Aktif tema objesi
 * @returns StyleSheet objesi
 */
const createStyles = (theme: Theme) => StyleSheet.create({
  // Ana container - Tam ekran
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  // İçerik wrapper
  content: {
    flex: 1,
  },
  // Scroll content container - Flex grow ile minimum yükseklik
  scrollContent: {
    flexGrow: 1,
  },
  // Merkezi hizalanmış container (loading/error için)
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  // Hata başlığı
  errorTitle: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  // Hata mesajı
  errorMessage: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  // Tekrar dene butonu
  retryButton: {
    minWidth: 120,
  },
});
