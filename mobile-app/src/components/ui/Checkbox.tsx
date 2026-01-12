/**
 * @file Checkbox.tsx
 * @description Onay kutusu bileşeni
 * 
 * Özellikler:
 * - İki boyut seçeneği (sm, md)
 * - Etiket desteği
 * - Devre dışı bırakma
 * - Modern tasarım (yuvarlatılmış köşeler)
 * - Checkmark ikonu
 * 
 * Kullanım:
 * ```tsx
 * <Checkbox checked={isChecked} onPress={toggleCheck} label="Kabul ediyorum" />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

/**
 * Checkbox bileşeni props interface'i
 */
export interface CheckboxProps {
  /** Seçili durumu */
  checked: boolean;
  /** Tıklama fonksiyonu */
  onPress: () => void;
  /** Etiket metni */
  label?: string;
  /** Devre dışı durumu */
  disabled?: boolean;
  /** Checkbox boyutu */
  size?: 'sm' | 'md';
}

/**
 * Checkbox Bileşeni
 * Modern onay kutusu
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  size = 'md',
}) => {
  const boxSize = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: boxSize / 4,
          },
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {checked && <Ionicons name="checkmark" size={iconSize} color={colors.background.primary} />}
      </View>
      {label && (
        <Typography
          variant="body"
          style={disabled ? styles.labelDisabled : styles.label}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[200],
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    color: colors.text.primary,
  },
  labelDisabled: {
    color: colors.text.disabled,
  },
});
