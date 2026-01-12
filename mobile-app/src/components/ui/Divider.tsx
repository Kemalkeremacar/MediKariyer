/**
 * @file Divider.tsx
 * @description Ayırıcı çizgi bileşeni
 * 
 * Özellikler:
 * - Yatay ve dikey yönlendirme
 * - Etiket desteği (yatay için)
 * - Özelleştirilebilir boşluk (sm, md, lg)
 * - Modern tasarım (açık renk)
 * 
 * Kullanım:
 * ```tsx
 * <Divider />
 * <Divider label="VEYA" />
 * <Divider orientation="vertical" />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

/**
 * Divider bileşeni props interface'i
 */
export interface DividerProps {
  /** Ayırıcı yönü */
  orientation?: 'horizontal' | 'vertical';
  /** Etiket metni (sadece yatay için) */
  label?: string;
  /** Boşluk boyutu */
  spacing?: 'sm' | 'md' | 'lg';
  /** Ek stil */
  style?: ViewStyle;
}

/**
 * Divider Bileşeni
 * Yatay veya dikey ayırıcı çizgi
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  spacing: spacingSize = 'md',
  style,
}) => {
  const spacingValue = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }[spacingSize];

  // Etiketli yatay ayırıcı
  if (label && orientation === 'horizontal') {
    return (
      <View style={[styles.labelContainer, { marginVertical: spacingValue }, style]}>
        <View style={styles.line} />
        <Typography variant="caption" style={styles.label}>
          {label}
        </Typography>
        <View style={styles.line} />
      </View>
    );
  }

  // Dikey ayırıcı
  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          { marginHorizontal: spacingValue },
          style,
        ]}
      />
    );
  }

  // Basit yatay ayırıcı
  return (
    <View
      style={[
        styles.horizontal,
        { marginVertical: spacingValue },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.neutral[100], // Modern: Daha açık renk
  },
  vertical: {
    width: 1,
    backgroundColor: colors.neutral[100], // Modern: Daha açık renk
    alignSelf: 'stretch',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[100], // Modern: Daha açık renk
  },
  label: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
