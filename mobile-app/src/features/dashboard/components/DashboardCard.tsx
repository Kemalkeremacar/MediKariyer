/**
 * DASHBOARD CARD - Application summary card for dashboard
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/ui';
import { colors, spacing, borderRadius } from '@/theme';

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  onPress?: () => void;
}

export const DashboardCard = ({ title, subtitle, status }: DashboardCardProps) => {
  const getStatusColor = (statusValue?: string) => {
    if (!statusValue) return colors.neutral[400];
    const l = statusValue.toLowerCase();
    if (l.includes('onay') || l.includes('kabul')) return colors.success[500];
    if (l.includes('red') || l.includes('iptal')) return colors.error[500];
    if (l.includes('bekle')) return colors.warning[500];
    return colors.primary[500];
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h4" numberOfLines={1}>{title}</Typography>
        {subtitle && (
          <Typography variant="bodySmall" color="secondary">{subtitle}</Typography>
        )}
      </View>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
});
