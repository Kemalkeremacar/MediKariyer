/**
 * @file ExperienceCard.tsx
 * @description İş deneyimi kartı bileşeni - Web ile uyumlu modern tasarım
 * 
 * Web görünümü:
 * - Kurum adı (büyük, bold) + Yıl aralığı badge (yan yana)
 * - Uzmanlık alanı (alt satır, küçük)
 * - Açıklama (varsa)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/theme';

export interface ExperienceCardProps {
  /** Pozisyon/rol */
  title: string;
  /** Kurum/hastane adı */
  company: string;
  /** Uzmanlık alanı */
  location?: string;
  /** Başlangıç yılı */
  startDate: string;
  /** Bitiş yılı */
  endDate?: string;
  /** Devam ediyor mu */
  current?: boolean;
  /** Açıklama */
  description?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Mavi tema
const THEME = {
  cardBackground: '#FFFFFF',
  border: '#BFDBFE', // blue-200
  iconBackground: '#DBEAFE', // blue-100
  iconColor: '#2563EB', // blue-600
  badgeBackground: '#DBEAFE', // blue-100
  badgeText: '#1E40AF', // blue-800
};

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  company,
  location,
  startDate,
  endDate,
  current = false,
  description,
  onPress,
  onEdit,
  onDelete,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  // Yıl aralığını oluştur (web formatı: "2007 - 2021")
  const getYearRange = () => {
    if (!startDate) return '';
    if (current) return startDate;
    if (endDate) return `${startDate} - ${endDate}`;
    return startDate;
  };

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.row}>
          {/* İkon */}
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase" size={20} color={THEME.iconColor} />
          </View>
          
          {/* İçerik */}
          <View style={styles.content}>
            {/* Kurum Adı + Yıl Badge - üst satır */}
            <View style={styles.titleRow}>
              <Typography style={styles.company} numberOfLines={1}>
                {company}
              </Typography>
              {getYearRange() && (
                <View style={styles.yearBadge}>
                  <Typography style={styles.yearText}>
                    {getYearRange()}
                  </Typography>
                </View>
              )}
            </View>
            
            {/* Uzmanlık Alanı - alt satır */}
            {location && (
              <Typography style={styles.specialty}>
                {location}
              </Typography>
            )}
            
            {/* Açıklama */}
            {description && (
              <Typography style={styles.description} numberOfLines={2}>
                {description}
              </Typography>
            )}
          </View>
          
          {/* Aksiyonlar */}
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                  <Ionicons name="pencil-outline" size={16} color={colors.primary[600]} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={16} color={colors.error[600]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: THEME.iconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: 2,
  },
  company: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'uppercase',
    flex: 1,
  },
  yearBadge: {
    backgroundColor: THEME.badgeBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  yearText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.badgeText,
  },
  specialty: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 6,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
