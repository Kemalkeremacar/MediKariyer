import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from './Typography';

export interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void; // Prefetch için
  style?: ViewStyle;
  variant?: 'default' | 'large';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  onPress,
  onPressIn,
  style,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const Container = onPress ? TouchableOpacity : View;
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Container
      style={[
        styles.base,
        styles[variant],
        style,
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Typography 
          variant={variant === 'large' ? 'bodyMedium' : 'bodySmall'} 
          style={styles.title}
        >
          {title}
        </Typography>
      </View>
    </Container>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl, // Modern: Daha yuvarlak köşeler
    // Modern: Border kaldırıldı, soft shadow eklendi
    ...theme.shadows.sm,
  },
  default: {
    padding: theme.spacing.lg, // 16px
    minHeight: 100,
    flex: 1,
    marginHorizontal: theme.spacing.xs, // 4px
  },
  large: {
    padding: theme.spacing.xl, // 20px
    minHeight: 120,
    width: '48%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.sm, // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
});