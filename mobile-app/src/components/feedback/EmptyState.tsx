/**
 * @file EmptyState.tsx
 * @description Boş durum gösterimi bileşeni
 * 
 * Bu bileşen liste veya içerik alanlarında veri olmadığında gösterilir.
 * İkon, başlık, mesaj ve aksiyon butonu içerir.
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
 * EmptyState bileşeni için prop tipleri
 * 
 * @interface EmptyStateProps
 * @property {React.ReactNode} [icon] - Özel ikon (opsiyonel, varsayılan: dosya ikonu)
 * @property {string} [title] - Başlık metni
 * @property {string} [message] - Açıklama mesajı
 * @property {string} [actionText] - Aksiyon butonu metni
 * @property {Function} [onAction] - Aksiyon butonu callback'i
 * @property {boolean} [fullScreen] - Tam ekran modu (flex: 1)
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

/**
 * Boş durum gösterimi bileşeni
 * 
 * **Özellikler:**
 * - Özelleştirilebilir ikon
 * - Başlık ve açıklama metni
 * - Opsiyonel aksiyon butonu
 * - Tam ekran veya inline mod
 * 
 * **Kullanım:**
 * ```tsx
 * <EmptyState
 *   icon={<Ionicons name="briefcase-outline" size={64} color={colors.neutral[400]} />}
 *   title="Henüz İlan Yok"
 *   message="Yeni iş ilanları eklendiğinde burada görünecek"
 *   actionText="İlan Ara"
 *   onAction={() => navigation.navigate('JobSearch')}
 *   fullScreen={true}
 * />
 * ```
 * 
 * @param props - EmptyState prop'ları
 * @returns Boş durum bileşeni
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Henüz İçerik Yok',
  message = 'Burada görüntülenecek bir şey bulunamadı.',
  actionText,
  onAction,
  fullScreen = false,
}) => {
  return (
    <View style={fullScreen ? styles.containerFullScreen : styles.container}>
      {/* İkon - Özel veya varsayılan dosya ikonu */}
      {icon || <Ionicons name="file-tray-outline" size={64} color={colors.neutral[400]} />}
      
      {/* Başlık */}
      <Text style={styles.title}>{title}</Text>
      
      {/* Açıklama mesajı */}
      <Text style={styles.message}>{message}</Text>
      
      {/* Aksiyon butonu (varsa) */}
      {actionText && onAction && (
        <View style={styles.actionContainer}>
          <Button onPress={onAction} variant="primary">
            {actionText}
          </Button>
        </View>
      )}
    </View>
  );
};

/**
 * Stil tanımlamaları
 * Merkezi hizalanmış boş durum tasarımı
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
