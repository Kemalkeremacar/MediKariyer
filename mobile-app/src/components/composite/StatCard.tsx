import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'primary',
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  const iconBgColor = colors[color][100];

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>
      
      <Typography variant="h2" style={styles.value}>
        {value}
      </Typography>

      {trend && (
        <View style={styles.trendContainer}>
          <Typography
            variant="caption"
            style={{
              ...styles.trend,
              color: trend.isPositive ? colors.success[600] : colors.error[600]
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Typography>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  trendContainer: {
    marginTop: 2,
  },
  trend: {
    fontSize: 11,
    fontWeight: '600',
  },
});
