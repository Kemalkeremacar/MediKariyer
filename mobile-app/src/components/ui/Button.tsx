import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[600] : theme.colors.text.inverse}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  primary: {
    backgroundColor: theme.colors.primary[600],
  },
  secondary: {
    backgroundColor: theme.colors.secondary[600],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  size_lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  text_primary: {
    color: theme.colors.text.inverse,
  },
  text_secondary: {
    color: theme.colors.text.inverse,
  },
  text_outline: {
    color: theme.colors.primary[600],
  },
  text_ghost: {
    color: theme.colors.primary[600],
  },
  textDisabled: {
    color: theme.colors.text.disabled,
  },
  textSize_sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.base,
  },
  textSize_lg: {
    fontSize: theme.typography.fontSize.lg,
  },
});
