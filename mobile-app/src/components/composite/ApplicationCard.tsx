import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '@/utils/date';

interface ApplicationCardProps {
  application: any;
  onPress: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  const dateToUse = application.applied_at || application.created_at;
  const timeAgo = formatRelativeTime(dateToUse) || null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="lg" style={styles.card}>
        {/* Header with Status Badge */}
        <View style={styles.header}>
          <Avatar
            size="md"
            initials={application.hospital_name?.substring(0, 2).toUpperCase()}
          />
          <View style={styles.headerContent}>
            <Typography variant="h3" style={styles.title}>
              {application.job_title || application.position_title}
            </Typography>
            <View style={styles.hospitalRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Typography variant="body" style={styles.hospital}>
                {application.hospital_name}
              </Typography>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Badge status={application.status || 'pending'} size="sm">
              {application.status}
            </Badge>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} style={{ marginTop: 4 }} />
          </View>
        </View>

        <Divider spacing="sm" />
        
        {/* Details */}
        <View style={styles.details}>
          {application.city && (
            <Chip
              label={application.city}
              icon={<Ionicons name="location" size={12} color={colors.primary[700]} />}
              variant="soft"
              color="primary"
              size="sm"
            />
          )}
          {timeAgo && (
            <Chip
              label={timeAgo}
              icon={<Ionicons name="calendar-outline" size={12} color={colors.neutral[600]} />}
              variant="soft"
              color="neutral"
              size="sm"
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hospital: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
});
