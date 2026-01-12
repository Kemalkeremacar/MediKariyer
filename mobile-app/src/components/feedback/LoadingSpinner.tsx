/**
 * @file LoadingSpinner.tsx
 * @description Yükleme göstergesi bileşeni
 * 
 * Bu bileşen veri yüklenirken gösterilen spinner'ı sağlar.
 * Opsiyonel mesaj ve boyut seçenekleri içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

/**
 * LoadingSpinner bileşeni için prop tipleri
 * 
 * @interface LoadingSpinnerProps
 * @property {string} [message] - Yükleme mesajı (opsiyonel)
 * @property {'small' | 'large'} [size] - Spinner boyutu
 * @property {boolean} [fullScreen] - Tam ekran modu (flex: 1)
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/**
 * Yükleme göstergesi bileşeni
 * 
 * **Özellikler:**
 * - React Native ActivityIndicator
 * - Özelleştirilebilir boyut (small/large)
 * - Opsiyonel yükleme mesajı
 * - Tam ekran veya inline mod
 * 
 * **Kullanım:**
 * ```tsx
 * <LoadingSpinner
 *   message="İş ilanları yükleniyor..."
 *   size="large"
 *   fullScreen={true}
 * />
 * ```
 * 
 * @param props - LoadingSpinner prop'ları
 * @returns Yükleme göstergesi bileşeni
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  fullScreen = false,
}) => {
  return (
    <View style={fullScreen ? styles.containerFullScreen : styles.container}>
      {/* Yükleme spinner'ı - Primary renk */}
      <ActivityIndicator size={size} color={colors.primary[600]} />
      
      {/* Yükleme mesajı (varsa) */}
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

/**
 * Stil tanımlamaları
 * Merkezi hizalanmış yükleme göstergesi tasarımı
 */
const styles = StyleSheet.create({
  // Inline container - Padding ile merkezi hizalama
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  // Tam ekran container - Flex ile merkezi hizalama
  containerFullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  message: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
