/**
 * @file IconButton.tsx
 * @description İkon butonu bileşeni
 * 
 * Özellikler:
 * - Üç boyut seçeneği (sm, md, lg)
 * - Üç varyant (filled, outlined, ghost)
 * - Dört renk seçeneği (primary, secondary, error, neutral)
 * - Devre dışı bırakma
 * - Yuvarlak buton tasarımı
 * 
 * Kullanım:
 * ```tsx
 * <IconButton icon={<Icon />} onPress={handlePress} variant="filled" />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';

/**
 * IconButton bileşeni props interface'i
 */
export interface IconButtonProps {
  /** Buton ikonu */
  icon: React.ReactNode;
  /** Tıklama fonksiyonu */
  onPress: () => void;
  /** Buton boyutu */
  size?: 'sm' | 'md' | 'lg';
  /** Buton varyantı */
  variant?: 'filled' | 'outlined' | 'ghost';
  /** Buton rengi */
  color?: 'primary' | 'secondary' | 'error' | 'neutral';
  /** Devre dışı durumu */
  disabled?: boolean;
  /** Ek stil */
  style?: ViewStyle;
}

/**
 * Boyut haritası (piksel cinsinden)
 */
const sizeMap = {
  sm: 32,
  md: 44,
  lg: 56,
};

/**
 * İkon Butonu Bileşeni
 * Yuvarlak ikon butonu
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  color = 'primary',
  disabled = false,
  style,
}) => {
  const buttonSize = sizeMap[size];

  /**
   * Varyanta göre arka plan rengini döndürür
   */
  const getBackgroundColor = () => {
    if (variant === 'filled') return colors[color][600];
    if (variant === 'outlined') return 'transparent';
    return colors[color][50]; // ghost
  };

  /**
   * Varyanta göre kenarlık rengini döndürür
   */
  const getBorderColor = () => {
    if (variant === 'outlined') return colors[color][300];
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
