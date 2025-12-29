import React, { useState, useMemo, ReactNode, memo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'underline';
  rightIcon?: ReactNode;
}

export const Input: React.FC<InputProps> = memo(({
  label,
  error,
  helperText,
  containerStyle,
  style,
  variant = 'default',
  rightIcon,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          style={[
            styles.input,
            variant === 'underline' && styles.inputUnderline,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            rightIcon ? styles.inputWithIcon : null,
            style,
          ]}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && <Text allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  // Only re-render if important props change
  const propsEqual = (
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.label === nextProps.label &&
    prevProps.variant === nextProps.variant &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.secureTextEntry === nextProps.secureTextEntry &&
    prevProps.rightIcon === nextProps.rightIcon
  );
  return propsEqual; // true = skip re-render, false = re-render
});

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 52,
    borderWidth: 0,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.neutral[100],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputWithIcon: {
    paddingRight: theme.spacing['3xl'],
  },
  rightIconContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputUnderline: {
    height: 'auto',
    minHeight: 44,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputFocused: {
    backgroundColor: theme.colors.neutral[50],
    // Modern: Soft shadow ile focus gösterimi
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: theme.colors.error[600],
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
