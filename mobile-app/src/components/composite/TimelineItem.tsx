import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

export interface TimelineItemProps {
  title: string;
  subtitle?: string;
  date: string;
  description?: string;
  icon?: React.ReactNode;
  isLast?: boolean;
  status?: 'completed' | 'current' | 'upcoming';
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  subtitle,
  date,
  description,
  icon,
  isLast = false,
  status = 'completed',
}) => {
  const dotColor = {
    completed: colors.success[600],
    current: colors.primary[600],
    upcoming: colors.neutral[300],
  }[status];

  const lineColor = {
    completed: colors.success[300],
    current: colors.primary[300],
    upcoming: colors.neutral[200],
  }[status];

  return (
    <View style={styles.container}>
      {/* Timeline Line */}
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: dotColor }]}>
          {icon && <View style={styles.icon}>{icon}</View>}
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h3" style={styles.title}>
            {title}
          </Typography>
          <Typography variant="caption" style={styles.date}>
            {date}
          </Typography>
        </View>
        {subtitle && (
          <Typography variant="body" style={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
        {description && (
          <Typography variant="body" style={styles.description}>
            {description}
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: spacing.lg,
  },
  timeline: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  icon: {
    position: 'absolute',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
