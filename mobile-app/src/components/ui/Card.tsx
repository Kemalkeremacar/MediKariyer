import React from 'react';
import { StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Box, Pressable } from '@gluestack-ui/themed';
import { spacing, borderRadius, colors, shadows } from '@/constants/theme';

type PaddingKey = keyof typeof spacing;

interface CardProps {
  children: React.ReactNode;
  padding?: PaddingKey;
  variant?: 'elevated' | 'flat' | 'outlined'; // Modern variant sistemi
  shadow?: 'none' | 'sm' | 'md' | 'lg'; // Eski shadow prop (backward compatibility)
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const SHADOWS: Record<Exclude<CardProps['shadow'], undefined>, ViewStyle | undefined> = {
  none: undefined,
  sm: shadows.sm,
  md: shadows.md,
  lg: shadows.lg,
};

export const Card = ({
  children,
  padding = 'md',
  variant = 'elevated', // Varsayılan modern gölgeli kart
  shadow,
  style,
  onPress,
}: CardProps) => {
  // Variant sistemi ile shadow'u belirle
  const effectiveShadow = shadow || (variant === 'elevated' ? 'md' : 'none');

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.white,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };
      case 'flat':
        return {
          backgroundColor: colors.neutral[50],
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const baseStyle: ViewStyle = {
    borderRadius: borderRadius.xl, // Daha modern, yuvarlak hatlar (16px)
    padding: spacing[padding],
    ...getVariantStyle(),
  };

  const content = (
    <Box style={[baseStyle, SHADOWS[effectiveShadow], style]}>
      {children}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={{ borderRadius: borderRadius.xl }}
        android_ripple={{ color: colors.neutral[100] }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

