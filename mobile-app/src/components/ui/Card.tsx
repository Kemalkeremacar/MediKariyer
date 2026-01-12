/**
 * @file Card.tsx
 * @description Modern kart bileşeni
 * 
 * Özellikler:
 * - Üç varyant (elevated, outlined, filled)
 * - Özelleştirilebilir padding
 * - Gölge seçenekleri (sm, md, lg)
 * - Tıklanabilir kart desteği
 * - Modern tasarım (yuvarlatılmış köşeler)
 * 
 * Kullanım:
 * ```tsx
 * <Card variant="elevated" padding="lg">İçerik</Card>
 * <Card onPress={handlePress}>Tıklanabilir Kart</Card>
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme } from '@/theme';

type Theme = typeof lightTheme;

/**
 * Card bileşeni props interface'i
 */
export interface CardProps {
  /** Kart içeriği */
  children: React.ReactNode;
  /** Kart varyantı */
  variant?: 'elevated' | 'outlined' | 'filled';
  /** İç boşluk */
  padding?: keyof Theme['spacing'] | '2xl';
  /** Gölge boyutu */
  shadow?: 'sm' | 'md' | 'lg';
  /** Tıklama fonksiyonu (varsa kart tıklanabilir olur) */
  onPress?: () => void;
  /** Ek stil */
  style?: ViewStyle;
}

/**
 * Card Bileşeni
 * Modern, esnek kart container
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  shadow,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const Container = onPress ? TouchableOpacity : View;
  
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Padding değerini hesapla
  const paddingValue = padding === '2xl' ? theme.spacing.xl * 1.5 : theme.spacing[padding as keyof Theme['spacing']];
  
  // Gölge stilini belirle
  const shadowStyle = shadow ? theme.shadows[shadow] : undefined;

  return (
    <Container
      style={[
        styles.base,
        styles[variant],
        { padding: paddingValue },
        shadowStyle,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.background.card,
  },
  elevated: {
    ...theme.shadows.md,
    backgroundColor: theme.colors.background.card,
    // Modern: Border kaldırıldı, sadece gölge kullanılıyor
  },
  outlined: {
    // Modern: İnce border yerine hafif gölge ve arka plan
    ...theme.shadows.sm,
    backgroundColor: theme.colors.background.card,
  },
  filled: {
    backgroundColor: theme.colors.neutral[50],
  },
});
