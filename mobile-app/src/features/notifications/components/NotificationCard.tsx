import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { spacing, colors } from '@/theme';
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';

export interface NotificationCardProps {
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onPress?: () => void;
}

export const NotificationCard = ({
  message,
  timestamp,
  isRead,
  type = 'info',
  title,
  onPress,
}: NotificationCardProps) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { Icon: CheckCircle, color: colors.success[600], bgColor: colors.success[50] };
      case 'warning':
        return { Icon: AlertTriangle, color: colors.warning[600], bgColor: colors.warning[50] };
      case 'error':
        return { Icon: AlertCircle, color: colors.error[600], bgColor: colors.error[50] };
      default:
        return { Icon: Info, color: colors.primary[600], bgColor: colors.primary[50] };
    }
  };

  const { Icon, color, bgColor } = getIconAndColor();

  return (
    <Card
      variant="elevated"
      padding="lg"
      onPress={onPress}
      style={!isRead ? StyleSheet.flatten([styles.card, styles.unreadCard]) : styles.card}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.textContainer}>
          {title && (
            <Typography variant="body" style={styles.title}>
              {title}
            </Typography>
          )}
          <Typography variant="body" style={styles.message}>
            {message}
          </Typography>
          <Typography variant="caption" style={styles.timestamp}>
            {timestamp}
          </Typography>
        </View>
        {!isRead && <View style={styles.unreadDot} />}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  unreadCard: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[600],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  timestamp: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
    marginTop: 4,
  },
});
