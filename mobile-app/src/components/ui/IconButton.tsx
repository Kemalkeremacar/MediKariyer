import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'ghost';
  color?: 'primary' | 'secondary' | 'error' | 'neutral';
  disabled?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: 32,
  md: 44,
  lg: 56,
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  color = 'primary',
  disabled = false,
  style,
}) => {
  const buttonSize = sizeMap[size];

  const getBackgroundColor = () => {
    if (variant === 'filled') return colors[color][600];
    if (variant === 'outlined') return 'transparent';
    return colors[color][50]; // ghost
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return colors[color][300];
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
