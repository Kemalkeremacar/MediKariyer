import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { spacing, colors } from '@/theme';

export interface NotificationCardProps {
  message: string;
  timestamp: string;
  isRead: boolean;
  onPress?: () => void;
}

export const NotificationCard = ({
  message,
  timestamp,
  isRead,
  onPress,
}: NotificationCardProps) => (
  <Card
    variant="elevated"
    padding="lg"
    onPress={onPress}
    style={!isRead ? StyleSheet.flatten([styles.card, styles.unreadCard]) : styles.card}
  >
    <Typography variant="body" style={styles.message}>
      {message}
    </Typography>
    <Typography variant="caption" style={styles.timestamp}>
      {timestamp}
    </Typography>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg, // 16px spacing between cards (8px grid)
    backgroundColor: colors.background.primary, // White for read
  },
  unreadCard: {
    backgroundColor: colors.primary[50], // Light blue for unread
  },
  message: {
    marginBottom: spacing.sm, // 8px spacing
  },
  timestamp: {
    color: colors.text.secondary,
  },
});
