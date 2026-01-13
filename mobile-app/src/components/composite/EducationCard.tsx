/**
 * @file EducationCard.tsx
 * @description Eğitim kartı bileşeni - Web ile uyumlu modern tasarım
 * 
 * Web görünümü:
 * - Eğitim tipi (küçük, bold, üstte)
 * - Kurum adı (ana başlık)
 * - Alan + Yıl badge (yan yana)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/theme';

export interface EducationCardProps {
  /** Eğitim tipi (Uzmanlık, Tıp Fakültesi vb.) */
  degree: string;
  /** Kurum adı */
  institution: string;
  /** Alan/bölüm */
  field?: string;
  /** Başlangıç tarihi (kullanılmıyor) */
  startDate?: string;
  /** Mezuniyet yılı */
  endDate?: string;
  /** Devam ediyor mu */
  current?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Yeşil tema (web ile uyumlu)
const THEME = {
  cardBackground: '#FFFFFF',
  border: '#A7F3D0', // green-200
  iconBackground: '#D1FAE5', // green-100
  iconColor: '#059669', // green-600
  badgeBackground: '#D1FAE5', // green-100
  badgeText: '#065F46', // green-800
};

export const EducationCard: React.FC<EducationCardProps> = ({
  degree,
  institution,
  field,
  endDate,
  onPress,
  onEdit,
  onDelete,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  // Yılı çıkar
  const year = endDate?.replace('Mezuniyet: ', '').trim();

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.row}>
          {/* İkon */}
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={20} color={THEME.iconColor} />
          </View>
          
          {/* İçerik */}
          <View style={styles.content}>
            {/* Eğitim Tipi - küçük, bold */}
            <Typography style={styles.degreeType}>
              {degree}
            </Typography>
            
            {/* Kurum Adı - ana başlık */}
            <Typography style={styles.institution}>
              {institution}
            </Typography>
            
            {/* Alan ve Yıl - yan yana */}
            <View style={styles.metaRow}>
              {field && (
                <Typography style={styles.field}>
                  {field}
                </Typography>
              )}
              {year && (
                <View style={styles.yearBadge}>
                  <Typography style={styles.yearText}>
                    {year}
                  </Typography>
                </View>
              )}
            </View>
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
  degreeType: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  institution: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  field: {
    fontSize: 12,
    color: colors.text.secondary,
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
