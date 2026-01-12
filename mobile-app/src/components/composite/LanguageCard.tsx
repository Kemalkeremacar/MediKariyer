/**
 * @file LanguageCard.tsx
 * @description Yabancı dil bilgilerini gösteren kart bileşeni
 * 
 * Bu bileşen kullanıcının yabancı dil bilgilerini görsel olarak sunar.
 * Dil adı, seviye badge'i ve CEFR seviye göstergesi içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing } from '@/theme';

/**
 * LanguageCard bileşeni için prop tipleri
 * 
 * @interface LanguageCardProps
 * @property {string} language - Dil adı (örn: "İngilizce", "Almanca")
 * @property {string} level - Dil seviyesi (örn: "İleri", "Orta")
 * @property {Function} [onPress] - Kart tıklama callback'i
 * @property {Function} [onEdit] - Düzenleme butonu callback'i
 * @property {Function} [onDelete] - Silme butonu callback'i
 */
export interface LanguageCardProps {
  language: string;
  level: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Dil seviyelerine göre badge renkleri
 * Başlangıç/Temel → neutral, Orta → primary, İleri/Ana Dil → success
 */
const levelColors = {
  'Başlangıç': 'neutral' as const,
  'Temel': 'neutral' as const,
  'Orta': 'primary' as const,
  'Orta Üstü': 'primary' as const,
  'İleri': 'success' as const,
  'Ana Dil': 'success' as const,
};

/**
 * Dil seviyelerinin CEFR karşılıkları
 * Avrupa Ortak Dil Referans Çerçevesi (A1-C2) etiketleri
 */
const levelLabels = {
  'Başlangıç': 'A1',
  'Temel': 'A2',
  'Orta': 'B1',
  'Orta Üstü': 'B2',
  'İleri': 'C1',
  'Ana Dil': 'C2',
};

/**
 * Yabancı dil kartı bileşeni
 * 
 * **Özellikler:**
 * - Dil adı ve seviye gösterimi
 * - CEFR seviye etiketi (A1-C2)
 * - Seviyeye göre renkli badge
 * - Düzenleme ve silme butonları
 * - Tıklanabilir kart (onPress varsa)
 * 
 * **Kullanım:**
 * ```tsx
 * <LanguageCard
 *   language="İngilizce"
 *   level="İleri"
 *   onEdit={() => handleEdit(id)}
 *   onDelete={() => handleDelete(id)}
 * />
 * ```
 * 
 * @param props - LanguageCard prop'ları
 * @returns Yabancı dil kartı bileşeni
 */
export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  level,
  onPress,
  onEdit,
  onDelete,
}) => {
  // onPress varsa TouchableOpacity, yoksa View kullan
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="md">
        <View style={styles.container}>
          {/* Dil ikonu */}
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={20} color={colors.primary[600]} />
          </View>
          
          {/* Dil adı ve seviye bilgisi */}
          <View style={styles.content}>
            <Typography variant="h3" style={styles.language}>
              {language}
            </Typography>
            <View style={styles.levelContainer}>
              {/* Seviye badge'i (renkli) */}
              <Badge variant={levelColors[level as keyof typeof levelColors] || 'primary'} size="sm">
                {level}
              </Badge>
              {/* CEFR seviye etiketi */}
              <Typography variant="caption" style={styles.levelText}>
                {levelLabels[level as keyof typeof levelLabels] || level}
              </Typography>
            </View>
          </View>
          
          {/* Aksiyon butonları veya chevron ikonu */}
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.error[600]} />
              </TouchableOpacity>
            )}
            {/* Sadece onPress varsa ve edit/delete yoksa chevron göster */}
            {onPress && !onDelete && !onEdit && (
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            )}
          </View>
        </View>
      </Card>
    </Wrapper>
  );
};

/**
 * Stil tanımlamaları
 * Kompakt ve temiz kart tasarımı
 */
const styles = StyleSheet.create({
  // Ana container - Yatay düzen
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  language: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
});
