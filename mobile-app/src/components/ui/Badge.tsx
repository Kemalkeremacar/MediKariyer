import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type BadgeStatus = 'pending' | 'accepted' | 'rejected' | 'reviewed';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  status?: BadgeStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

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

  // Map status to variant if status is provided
  const effectiveVariant = status 
    ? (status === 'pending' ? 'warning' 
      : status === 'accepted' ? 'success' 
      : status === 'rejected' ? 'error' 
      : 'primary') // reviewed -> primary (blue)
    : (variant || 'primary');

  return (
    <View style={[styles.base, styles[effectiveVariant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${effectiveVariant}`], styles[`textSize_${size}`], textStyle]}>
        {children}
      </Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md, // 12px for pill shape (8px grid)
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
    paddingHorizontal: theme.spacing.sm, // 8px
    paddingVertical: theme.spacing.xs, // 4px
  },
  size_md: {
    paddingHorizontal: theme.spacing.sm, // 8px
    paddingVertical: theme.spacing.xs, // 4px
  },
  text: {
    fontWeight: theme.typography.fontWeight.normal, // Regular weight for badges
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
