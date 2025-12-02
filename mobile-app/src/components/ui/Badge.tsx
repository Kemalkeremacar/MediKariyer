import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.base, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
        {children}
      </Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  primary: {
    backgroundColor: theme.colors.primary[100],
  },
  secondary: {
    backgroundColor: theme.colors.secondary[100],
  },
  success: {
    backgroundColor: theme.colors.success[100],
  },
  warning: {
    backgroundColor: theme.colors.warning[100],
  },
  error: {
    backgroundColor: theme.colors.error[100],
  },
  neutral: {
    backgroundColor: theme.colors.neutral[100],
  },
  size_sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  size_md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  size_lg: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    fontWeight: theme.typography.fontWeight.medium,
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
    fontSize: theme.typography.fontSize.xs,
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.sm,
  },
  textSize_lg: {
    fontSize: theme.typography.fontSize.base,
  },
});
