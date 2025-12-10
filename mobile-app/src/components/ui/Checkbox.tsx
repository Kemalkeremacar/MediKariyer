import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

export interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

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
        {checked && <Check size={iconSize} color={colors.background.primary} strokeWidth={3} />}
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
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
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
