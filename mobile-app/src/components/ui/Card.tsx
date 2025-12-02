import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme } from '@/theme';

type Theme = typeof lightTheme;

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof Theme['spacing'];
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const Container = onPress ? TouchableOpacity : View;
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Container
      style={[
        styles.base,
        styles[variant],
        { padding: theme.spacing[padding] },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.primary,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filled: {
    backgroundColor: theme.colors.background.secondary,
  },
});
