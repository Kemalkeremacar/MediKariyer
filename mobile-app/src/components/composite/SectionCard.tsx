/**
 * @file SectionCard.tsx
 * @description Bölüm/menü kartı bileşeni
 * 
 * Bu bileşen ayarlar, profil bölümleri gibi menü öğelerini gösterir.
 * İkon, başlık, alt başlık, badge ve chevron içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

/**
 * SectionCard bileşeni için prop tipleri
 * 
 * @interface SectionCardProps
 * @property {React.ReactNode} icon - Gösterilecek ikon (genellikle Ionicons)
 * @property {string} title - Bölüm başlığı
 * @property {string} [subtitle] - Alt başlık (opsiyonel)
 * @property {string | number} [badge] - Badge içeriği (sayı veya metin)
 * @property {Function} [onPress] - Kart tıklama callback'i
 */
export interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string | number;
  onPress?: () => void;
}

/**
 * Bölüm kartı bileşeni
 * 
 * **Özellikler:**
 * - İkon container (gradient arka plan)
 * - Başlık ve alt başlık
 * - Badge göstergesi (sayı veya metin)
 * - Chevron ikonu (tıklanabilirse)
 * - Modern gölge efekti
 * 
 * **Kullanım:**
 * ```tsx
 * <SectionCard
 *   icon={<Ionicons name="person" size={24} color={colors.primary[600]} />}
 *   title="Kişisel Bilgiler"
 *   subtitle="Adınız, soyadınız ve iletişim bilgileriniz"
 *   badge={3}
 *   onPress={() => navigation.navigate('PersonalInfo')}
 * />
 * ```
 * 
 * @param props - SectionCard prop'ları
 * @returns Bölüm kartı bileşeni
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {/* İkon container */}
      <View style={styles.iconContainer}>
        {icon}
      </View>
      
      {/* Başlık ve alt başlık */}
      <View style={styles.content}>
        <Typography variant="h3" style={styles.title}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" style={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
      </View>

      {/* Badge (varsa) */}
      {badge !== undefined && (
        <View style={styles.badge}>
          <Typography variant="caption" style={styles.badgeText}>
            {badge}
          </Typography>
        </View>
      )}

      {/* Chevron ikonu (tıklanabilirse) */}
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
      )}
    </TouchableOpacity>
  );
};

/**
 * Stil tanımlamaları
 * Modern kart tasarımı ve soft shadow efekti
 */
const styles = StyleSheet.create({
  // Kart container - Yatay düzen
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: 18,
    // Modern: Border kaldırıldı, soft shadow eklendi
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.background.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
