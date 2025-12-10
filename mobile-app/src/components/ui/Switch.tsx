import React from 'react';
import { Switch as RNSwitch, Platform, SwitchProps as RNSwitchProps } from 'react-native';
import { colors } from '@/theme';

export interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

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
