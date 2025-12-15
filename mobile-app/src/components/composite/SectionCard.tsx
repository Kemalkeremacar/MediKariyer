import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

export interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string | number;
  onPress?: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      
      <View style={styles.content}>
        <Typography variant="h3" style={styles.title}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" style={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
      </View>

      {badge !== undefined && (
        <View style={styles.badge}>
          <Typography variant="caption" style={styles.badgeText}>
            {badge}
          </Typography>
        </View>
      )}

      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.background.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
