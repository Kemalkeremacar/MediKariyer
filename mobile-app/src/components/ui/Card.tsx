import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme } from '@/theme';

type Theme = typeof lightTheme;

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof Theme['spacing'] | '2xl';
  shadow?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  shadow,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const Container = onPress ? TouchableOpacity : View;
  
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Handle padding value
  const paddingValue = padding === '2xl' ? theme.spacing.xl * 1.5 : theme.spacing[padding as keyof Theme['spacing']];
  
  // Handle shadow
  const shadowStyle = shadow ? theme.shadows[shadow] : undefined;

  return (
    <Container
      style={[
        styles.base,
        styles[variant],
        { padding: paddingValue },
        shadowStyle,
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
    borderRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.background.card,
  },
  elevated: {
    ...theme.shadows.md,
    backgroundColor: theme.colors.background.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border.light,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.card,
  },
  filled: {
    backgroundColor: theme.colors.background.card,
  },
});
