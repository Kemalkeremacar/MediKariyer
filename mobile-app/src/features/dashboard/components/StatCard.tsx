/**
 * STAT CARD - Statistics card for dashboard
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'accent';
  onPress?: () => void;
}

export const StatCard = ({ title, value, icon, color = 'primary', onPress }: StatCardProps) => {
  const bgColors = {
    primary: colors.primary[500],
    success: colors.success[500],
    warning: colors.warning[500],
    accent: colors.accent[500],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
      style={[styles.container, { backgroundColor: bgColors[color] }, shadows.md]}
    >
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    opacity: 0.9,
  },
  value: {
    color: '#fff',
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
});
