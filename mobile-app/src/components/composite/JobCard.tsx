import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { isWithinDays } from '@/utils/date';
import type { JobListItem } from '@/types/job';

interface JobCardProps {
  job: JobListItem;
  onPress: () => void;
  index?: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, index = 0 }) => {
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify().damping(15)}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card variant="elevated" padding="lg" style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar
            size="md"
            source={job.hospital_logo ?? undefined}
            initials={job.hospital_name?.substring(0, 2).toUpperCase()}
          />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Typography variant="h3" style={styles.title}>
                {job.title}
              </Typography>
              {job.created_at && isWithinDays(job.created_at, 3) && (
                <Badge variant="success" size="sm">
                  YENİ
                </Badge>
              )}
            </View>
            <View style={styles.hospitalRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Typography variant="body" style={styles.hospital}>
                {job.hospital_name}
              </Typography>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
        </View>

        <Divider spacing="sm" />
        
        {/* Details */}
        <View style={styles.details}>
          {job.city_name && (
            <Chip
              label={job.city_name}
              icon={<Ionicons name="location" size={12} color={colors.primary[700]} />}
              variant="soft"
              color="primary"
              size="sm"
            />
          )}
          {job.work_type && (
            <Chip
              label={job.work_type}
              variant="soft"
              color="secondary"
              size="sm"
            />
          )}
        </View>
      </Card>
      </TouchableOpacity>
    </Animated.View>
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
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
    flex: 1,
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

export default JobCard;
