import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Box, Pressable } from '@gluestack-ui/themed';
import { spacing, borderRadius } from '@/constants/theme';

type PaddingKey = keyof typeof spacing;

interface CardProps {
  children: React.ReactNode;
  padding?: PaddingKey;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const SHADOWS: Record<Exclude<CardProps['shadow'], undefined>, ViewStyle | undefined> = {
  none: undefined,
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
};

export const Card = ({
  children,
  padding = 'lg',
  shadow = 'sm',
  style,
  onPress,
}: CardProps) => {
  const baseStyle: ViewStyle = {
    borderRadius: borderRadius.lg,
    backgroundColor: '#ffffff',
    padding: spacing[padding],
  };

  const content = (
    <Box
      style={[baseStyle, SHADOWS[shadow], style]}
    >
      {children}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={{ borderRadius: borderRadius.lg }}
        android_ripple={{ color: '#e5e7eb' }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

