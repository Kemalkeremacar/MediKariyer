/**
 * @file LanguageCard.tsx
 * @description Yabancı dil kartı bileşeni - Web ile uyumlu modern tasarım
 * 
 * Web Tasarım Referansı (ApplicationDetailPage.jsx):
 * - Cyan tema (bg-cyan-50, border-cyan-200)
 * - Sol tarafta ikon (cyan-100 arka plan, cyan-600 ikon)
 * - Dil adı (ana başlık, koyu renk)
 * - Seviye badge'i (cyan-100 arka plan, cyan-800 yazı)
 * 
 * @author MediKariyer Development Team
 * @version 2.1.0
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/theme';

/**
 * LanguageCard bileşeni için prop tipleri
 */
export interface LanguageCardProps {
  language: string;
  level: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Mor tema (deneyim ile değiştirildi)
const THEME = {
  cardBackground: '#FFFFFF',
  border: '#E9D5FF', // purple-200
  iconBackground: '#F3E8FF', // purple-100
  iconColor: '#9333EA', // purple-600
  badgeBackground: '#F3E8FF', // purple-100
  badgeText: '#6B21A8', // purple-800
  titleColor: '#111827', // gray-900
};

/**
 * Yabancı Dil Kartı Bileşeni
 * Web'deki DoctorProfilePopover dil kartı ile birebir uyumlu
 * 
 * Layout:
 * [İkon] [Dil Adı]              [Edit] [Delete]
 *        [Seviye Badge]
 */
export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  level,
  onPress,
  onEdit,
  onDelete,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.row}>
          {/* Sol: İkon */}
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={20} color={THEME.iconColor} />
          </View>
          
          {/* Orta: İçerik */}
          <View style={styles.content}>
            {/* Dil Adı - Ana başlık */}
            <Typography style={styles.languageName}>
              {language}
            </Typography>
            
            {/* Seviye Badge */}
            <View style={styles.levelBadge}>
              <Typography style={styles.levelText}>
                {level}
              </Typography>
            </View>
          </View>
          
          {/* Sağ: Aksiyon Butonları */}
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
          </View>
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: THEME.iconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.titleColor,
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: THEME.badgeBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.badgeText,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
