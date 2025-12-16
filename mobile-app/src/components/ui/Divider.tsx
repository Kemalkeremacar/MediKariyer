import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  spacing?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

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
