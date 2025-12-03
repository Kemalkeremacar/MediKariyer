import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge, BadgeStatus } from '@/components/ui/Badge';
import { spacing, colors } from '@/theme';

export interface ApplicationCardProps {
  hospitalName: string;
  position: string;
  status: BadgeStatus;
  statusLabel: string;
  date: string;
  onPress?: () => void;
}

export const ApplicationCard = ({
  hospitalName,
  position,
  status,
  statusLabel,
  date,
  onPress,
}: ApplicationCardProps) => (
  <Card variant="elevated" padding="lg" onPress={onPress} style={styles.card}>
    <View style={styles.header}>
      <View style={styles.info}>
        <Typography variant="h3" style={styles.hospitalName}>
          {hospitalName}
        </Typography>
        <Typography variant="body" style={styles.position}>
          {position}
        </Typography>
      </View>
      <Badge status={status} size="sm">
        {statusLabel}
      </Badge>
    </View>
    <Typography variant="caption" style={styles.date}>
      {date}
    </Typography>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg, // 16px spacing between cards (8px grid)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm, // 8px spacing
    gap: spacing.md, // 12px gap
  },
  info: {
    flex: 1,
  },
  hospitalName: {
    marginBottom: spacing.xs / 2, // 2px spacing
  },
  position: {
    // Medium 16pt for position
  },
  date: {
    color: colors.text.secondary,
  },
});
