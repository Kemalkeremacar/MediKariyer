import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

export interface RadioProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Radio: React.FC<RadioProps> = ({
  selected,
  onPress,
  label,
  disabled = false,
  size = 'md',
}) => {
  const outerSize = size === 'sm' ? 20 : 24;
  const innerSize = size === 'sm' ? 10 : 12;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.radio,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
          },
          selected && styles.radioSelected,
          disabled && styles.radioDisabled,
        ]}
      >
        {selected && (
          <View
            style={[
              styles.radioInner,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
          />
        )}
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
  radio: {
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  radioSelected: {
    borderColor: colors.primary[600],
  },
  radioDisabled: {
    opacity: 0.5,
  },
  radioInner: {
    backgroundColor: colors.primary[600],
  },
  label: {
    fontSize: 15,
    color: colors.text.primary,
  },
  labelDisabled: {
    color: colors.text.disabled,
  },
});
