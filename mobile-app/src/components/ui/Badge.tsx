/**
 * @file Badge.tsx
 * @description Durum rozeti bileşeni
 * 
 * Özellikler:
 * - Farklı varyantlar (primary, secondary, success, warning, error, neutral)
 * - Başvuru durumları için özel status prop'u (pending, accepted, rejected, reviewed)
 * - İki boyut seçeneği (sm, md)
 * - Modern tasarım (yumuşak renkler, gölge efekti)
 * 
 * Kullanım:
 * ```tsx
 * <Badge variant="success">Onaylandı</Badge>
 * <Badge status="pending">Beklemede</Badge>
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Başvuru durumu tipleri
 */
export type BadgeStatus = 'pending' | 'accepted' | 'rejected' | 'reviewed';

/**
 * Badge bileşeni props interface'i
 */
export interface BadgeProps {
  /** Badge içeriği */
  children: React.ReactNode;
  /** Badge varyantı */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  /** Başvuru durumu (variant yerine kullanılabilir) */
  status?: BadgeStatus;
  /** Badge boyutu */
  size?: 'sm' | 'md';
  /** Ek stil */
  style?: ViewStyle;
  /** Metin stili */
  textStyle?: TextStyle;
}

/**
 * Badge Bileşeni
 * Durum göstergesi rozeti
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Status varsa variant'a dönüştür
  const effectiveVariant = status 
    ? (status === 'pending' ? 'warning' 
      : status === 'accepted' ? 'success' 
      : status === 'rejected' ? 'error' 
      : 'primary') // reviewed -> primary (mavi)
    : (variant || 'primary');

  return (
    <View style={[styles.base, styles[effectiveVariant], styles[`size_${size}`], style]}>
      <Text 
        allowFontScaling={false} 
        maxFontSizeMultiplier={1}
        style={[styles.text, styles[`text_${effectiveVariant}`], styles[`textSize_${size}`], textStyle]}
      >
        {children}
      </Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.full, // Tam yuvarlak
    alignSelf: 'flex-start',
    // Modern: Soft pastel shadow
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  primary: {
    backgroundColor: theme.colors.primary[100],
    // Modern: Border kaldırıldı
  },
  secondary: {
    backgroundColor: theme.colors.secondary[100],
    // Modern: Border kaldırıldı
  },
  success: {
    backgroundColor: theme.colors.success[100],
    // Modern: Border kaldırıldı
  },
  warning: {
    backgroundColor: theme.colors.warning[100],
    // Modern: Border kaldırıldı
  },
  error: {
    backgroundColor: theme.colors.error[100],
    // Modern: Border kaldırıldı
  },
  neutral: {
    backgroundColor: theme.colors.neutral[100],
    // Modern: Border kaldırıldı
  },
  size_sm: {
    paddingHorizontal: theme.spacing.md, // 12px
    paddingVertical: theme.spacing.xs, // 4px
  },
  size_md: {
    paddingHorizontal: theme.spacing.md, // 12px
    paddingVertical: theme.spacing.sm, // 8px
  },
  text: {
    fontWeight: theme.typography.fontWeight.medium, // Medium weight for badges
    includeFontPadding: false, // Android için
    textAlignVertical: 'center', // Android için
  },
  text_primary: {
    color: theme.colors.primary[700],
  },
  text_secondary: {
    color: theme.colors.secondary[700],
  },
  text_success: {
    color: theme.colors.success[700],
  },
  text_warning: {
    color: theme.colors.warning[700],
  },
  text_error: {
    color: theme.colors.error[700],
  },
  text_neutral: {
    color: theme.colors.neutral[700],
  },
  textSize_sm: {
    fontSize: theme.typography.fontSize.xs, // 12pt
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.sm, // 14pt - Regular for status badges
  },
});
