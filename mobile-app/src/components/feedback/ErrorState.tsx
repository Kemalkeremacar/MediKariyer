/**
 * @file ErrorState.tsx
 * @description Hata durumu gösterimi bileşeni
 * 
 * Bu bileşen API çağrıları veya işlemlerde hata oluştuğunda gösterilir.
 * Hata ikonu, mesaj ve tekrar deneme butonu içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

/**
 * ErrorState bileşeni için prop tipleri
 * 
 * @interface ErrorStateProps
 * @property {string} [title] - Hata başlığı
 * @property {string} [message] - Hata açıklama mesajı
 * @property {Function} [onRetry] - Tekrar deneme callback'i
 * @property {string} [retryText] - Tekrar deneme butonu metni
 * @property {boolean} [fullScreen] - Tam ekran modu (flex: 1)
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

/**
 * Hata durumu gösterimi bileşeni
 * 
 * **Özellikler:**
 * - Kırmızı hata ikonu
 * - Başlık ve açıklama metni
 * - Tekrar deneme butonu
 * - Tam ekran veya inline mod
 * 
 * **Kullanım:**
 * ```tsx
 * <ErrorState
 *   title="Yükleme Hatası"
 *   message="İş ilanları yüklenirken bir hata oluştu"
 *   onRetry={() => refetch()}
 *   retryText="Tekrar Dene"
 *   fullScreen={true}
 * />
 * ```
 * 
 * @param props - ErrorState prop'ları
 * @returns Hata durumu bileşeni
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Bir Hata Oluştu',
  message = 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.',
  onRetry,
  retryText = 'Tekrar Dene',
  fullScreen = false,
}) => {
  return (
    <View style={fullScreen ? styles.containerFullScreen : styles.container}>
      {/* Hata ikonu - Kırmızı uyarı */}
      <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
      
      {/* Hata başlığı */}
      <Text style={styles.title}>{title}</Text>
      
      {/* Hata açıklama mesajı */}
      <Text style={styles.message}>{message}</Text>
      
      {/* Tekrar deneme butonu (varsa) */}
      {onRetry && (
        <View style={styles.actionContainer}>
          <Button onPress={onRetry} variant="primary" label={retryText} />
        </View>
      )}
    </View>
  );
};

/**
 * Stil tanımlamaları
 * Merkezi hizalanmış hata durumu tasarımı
 */
const styles = StyleSheet.create({
  // Inline container - Padding ile merkezi hizalama
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  // Tam ekran container - Flex ile merkezi hizalama
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
