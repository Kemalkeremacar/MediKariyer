/**
 * Dashboard Feature Component - Quick Stat Card
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

interface QuickStatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: number | string;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export const QuickStatCard = ({
  icon: Icon,
  iconColor,
  iconBgColor,
  value,
  label,
  style,
}: QuickStatCardProps) => {
  return (
    <Card variant="elevated" padding="md" style={StyleSheet.flatten([styles.card, style])}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Typography variant="h2" style={styles.value}>
            {value}
          </Typography>
          <Typography variant="caption" style={styles.label}>
            {label}
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});
