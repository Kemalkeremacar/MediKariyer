/**
 * @file Switch.tsx
 * @description Switch (aç/kapa) bileşeni
 * 
 * Özellikler:
 * - Platform-specific tasarım (iOS/Android)
 * - Özelleştirilebilir renkler
 * - Devre dışı bırakma
 * - React Native Switch wrapper
 * 
 * Kullanım:
 * ```tsx
 * <Switch value={isEnabled} onValueChange={setIsEnabled} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { Switch as RNSwitch, Platform, SwitchProps as RNSwitchProps } from 'react-native';
import { colors } from '@/theme';

/**
 * Switch bileşeni props interface'i
 */
export interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  /** Switch durumu (açık/kapalı) */
  value: boolean;
  /** Durum değiştiğinde çağrılır */
  onValueChange: (value: boolean) => void;
  /** Devre dışı durumu */
  disabled?: boolean;
}

/**
 * Switch Bileşeni
 * Platform-specific aç/kapa butonu
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  ...props
}) => {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.neutral[300],
        true: colors.primary[600],
      }}
      thumbColor={Platform.OS === 'android' ? colors.background.primary : undefined}
      ios_backgroundColor={colors.neutral[300]}
      {...props}
    />
  );
};
