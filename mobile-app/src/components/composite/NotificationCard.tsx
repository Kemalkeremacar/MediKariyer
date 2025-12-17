import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import { formatRelativeTime } from '@/utils/date';

export interface NotificationCardProps {
  id: number;
  type: 'application' | 'job' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  onPress?: () => void;
}

const iconMap = {
  application: 'checkmark-circle' as const,
  job: 'briefcase' as const,
  system: 'alert-circle' as const,
  message: 'notifications' as const,
};

const colorMap = {
  application: 'success',
  job: 'primary',
  system: 'warning',
  message: 'secondary',
} as const;

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  timestamp,
  read,
  onPress,
}) => {
  // Defensive: ensure type is valid
  const safeType = (type && iconMap[type]) ? type : 'system';
  const iconName = iconMap[safeType];
  const color = colorMap[safeType];
  
  // Merkezi date utility ile güvenli tarih formatı
  const timeAgo = formatRelativeTime(timestamp, { fallback: 'Bilinmiyor' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card 
        variant={read ? 'outlined' : 'elevated'} 
        padding="md" 
        style={!read ? { ...styles.card, ...styles.unreadCard } : styles.card}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors[color][50] }]}>
            <Ionicons name={iconName} size={20} color={colors[color][600]} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.header}>
              <Typography variant="h3" style={styles.title}>
                {title || 'Bildirim'}
              </Typography>
              {!read && <View style={styles.unreadDot} />}
            </View>
            
            <Typography variant="body" style={styles.message}>
              {message || ''}
            </Typography>
            
            <Typography variant="caption" style={styles.timestamp}>
              {timeAgo}
            </Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  unreadCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  content: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
  },
  message: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    color: colors.text.tertiary,
    fontSize: 11,
  },
});
