import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export interface GradientButtonProps {
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  label?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  colors?: readonly [string, string, ...string[]];
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  label,
  children,
  style,
  textStyle,
  colors = ['#667eea', '#764ba2'], // Default gradient from design spec
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const content = label || children;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={isDisabled ? ['#d1d5db', '#d1d5db'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          styles[`size_${size}`],
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text.inverse} />
        ) : (
          <Text
            style={[
              styles.text,
              styles[`textSize_${size}`],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {content}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg, // 16px
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingHorizontal: theme.spacing.lg, // 16px
    paddingVertical: theme.spacing.sm, // 8px
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: theme.spacing.xl, // 20px
    paddingVertical: theme.spacing.md, // 12px
    minHeight: 44,
  },
  size_lg: {
    paddingHorizontal: theme.spacing['2xl'], // 24px
    paddingVertical: theme.spacing.lg, // 16px
    minHeight: 52,
  },
  text: {
    fontFamily: theme.typography.fontFamily.default,
    fontWeight: theme.typography.fontWeight.semibold, // 600
    color: theme.colors.text.inverse,
  },
  textDisabled: {
    color: theme.colors.text.disabled,
  },
  textSize_sm: {
    fontSize: theme.typography.fontSize.sm, // 14px
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.base, // 15px
  },
  textSize_lg: {
    fontSize: theme.typography.fontSize.lg, // 18px
  },
});