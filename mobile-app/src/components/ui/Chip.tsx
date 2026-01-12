/**
 * @file Chip.tsx
 * @description Chip (etiket) bileşeni
 * 
 * Özellikler:
 * - Üç varyant (filled, outlined, soft)
 * - Altı renk seçeneği (primary, secondary, success, warning, error, neutral)
 * - İki boyut seçeneği (sm, md)
 * - Seçilebilir chip desteği
 * - Silme butonu desteği
 * - İkon desteği
 * - Tıklanabilir chip
 * 
 * Kullanım:
 * ```tsx
 * <Chip label="React Native" color="primary" />
 * <Chip label="Seçili" selected onPress={handlePress} />
 * <Chip label="Silinebilir" onDelete={handleDelete} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

/**
 * Chip bileşeni props interface'i
 */
export interface ChipProps {
  /** Chip metni */
  label: string;
  /** Chip varyantı */
  variant?: 'filled' | 'outlined' | 'soft';
  /** Chip rengi */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  /** Chip boyutu */
  size?: 'sm' | 'md';
  /** Seçili durumu */
  selected?: boolean;
  /** Tıklama fonksiyonu */
  onPress?: () => void;
  /** Silme fonksiyonu */
  onDelete?: () => void;
  /** Sol tarafta gösterilecek ikon */
  icon?: React.ReactNode;
  /** Ek stil */
  style?: ViewStyle;
}

/**
 * Chip Bileşeni
 * Modern etiket/tag bileşeni
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'soft',
  color = 'primary',
  size = 'md',
  selected = false,
  onPress,
  onDelete,
  icon,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  /**
   * Arka plan rengini belirler
   */
  const getBackgroundColor = () => {
    if (selected) return colors[color][600];
    if (variant === 'filled') return colors[color][600];
    if (variant === 'outlined') return 'transparent';
    return colors[color][50]; // soft
  };

  /**
   * Metin rengini belirler
   */
  const getTextColor = () => {
    if (selected || variant === 'filled') return colors.background.primary;
    return colors[color][700];
  };

  /**
   * Kenarlık rengini belirler
   */
  const getBorderColor = () => {
    if (variant === 'outlined') return colors[color][300];
    return 'transparent';
  };

  return (
    <Container
      style={[
        styles.chip,
        size === 'sm' ? styles.chipSm : styles.chipMd,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Typography
        variant="caption"
        style={{
          ...(size === 'sm' ? styles.textSm : styles.textMd),
          color: getTextColor(),
        }}
      >
        {label}
      </Typography>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="close" size={size === 'sm' ? 12 : 14} color={getTextColor()} />
        </TouchableOpacity>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  chipSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  chipMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  icon: {
    marginRight: -2,
  },
  textSm: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: 2,
    padding: 2,
  },
});
