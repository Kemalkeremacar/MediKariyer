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

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  label?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: [string, string];
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  label,
  children,
  style,
  textStyle,
  gradientColors,
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const content = label || children;

  const getGradientColors = (): [string, string] => {
    if (gradientColors) {
      return gradientColors;
    }
    if (variant === 'gradient') {
      return ['#667eea', '#764ba2']; // Purple gradient (default)
    }
    if (variant === 'primary') {
      return ['#60A5FA', '#3B82F6']; // Modern light blue gradient
    }
    if (variant === 'secondary') {
      return ['#38BDF8', '#0EA5E9']; // Sky blue gradient
    }
    return ['transparent', 'transparent'];
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[600] : theme.colors.text.inverse}
        />
      ) : (
        <Text
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          style={[
            styles.text,
            styles[`text_${variant}`] || styles.text_primary,
            styles[`textSize_${size}`],
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {content}
        </Text>
      )}
    </>
  );

  if (variant === 'primary' || variant === 'secondary' || variant === 'gradient') {
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
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            styles[`size_${size}`],
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius?.lg || 16,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius?.lg || 16,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: theme.colors.primary[500], // #4F46E5
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    backgroundColor: theme.colors.secondary[500], // #764ba2
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
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
    includeFontPadding: false, // Android için
    textAlignVertical: 'center', // Android için
  },
  text_primary: {
    color: theme.colors.text.inverse,
  },
  text_secondary: {
    color: theme.colors.text.inverse,
  },
  text_outline: {
    color: '#4F46E5',
  },
  text_ghost: {
    color: theme.colors.primary[500],
  },
  text_gradient: {
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
