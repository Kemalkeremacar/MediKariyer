import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, typography } from '@/theme';
import type { NotificationItem } from '../types';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead?: (notificationId: number) => void;
  isMarkingAsRead?: boolean;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const typeVariantMap: Record<string, 'success' | 'warning' | 'error' | 'primary'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'primary',
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  isMarkingAsRead = false,
}) => {
  const badgeVariant = typeVariantMap[notification.type] ?? 'primary';
  const cardStyle = StyleSheet.flatten([
    styles.card,
    !notification.is_read ? styles.unreadCard : {},
  ]);

  return (
    <Card variant="elevated" padding="lg" style={cardStyle}>
      <View style={styles.header}>
        <Badge
          label={notification.type?.toUpperCase() ?? 'BİLDİRİM'}
          variant={badgeVariant}
          size="sm"
        />
        <Typography variant="caption" style={styles.dateText}>
          {formatDate(notification.created_at)}
        </Typography>
      </View>
      <Typography variant="h4" style={styles.title}>
        {notification.title || 'Bildirim'}
      </Typography>
      <Typography variant="body" color="secondary" style={styles.body}>
        {notification.body || '-'}
      </Typography>
      {!notification.is_read && onMarkAsRead && (
        <Button
          label="Okundu işaretle"
          variant="secondary"
          size="md"
          onPress={() => onMarkAsRead(notification.id)}
          loading={isMarkingAsRead}
          fullWidth
          style={styles.markReadButton}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  unreadCard: {
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  title: {
    marginBottom: spacing.xs,
  },
  body: {
    marginTop: spacing.xs,
  },
  markReadButton: {
    marginTop: spacing.md,
  },
});
