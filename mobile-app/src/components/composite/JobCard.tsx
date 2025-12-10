import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { MapPin, Briefcase, Clock, Building2, ChevronRight, Zap } from 'lucide-react-native';
import type { JobListItem } from '@/types/job';

interface JobCardProps {
  job: JobListItem;
  onPress: () => void;
}

// Helper function to check if job is new (posted within last 3 days)
const isNew = (createdAt: string): boolean => {
  const jobDate = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="lg" style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar
            size="md"
            initials={job.hospital_name?.substring(0, 2).toUpperCase()}
          />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Typography variant="h4" style={styles.title}>
                {job.title}
              </Typography>
              {job.created_at && isNew(job.created_at) && (
                <Badge variant="success" size="sm">
                  YENİ
                </Badge>
              )}
            </View>
            <View style={styles.hospitalRow}>
              <Building2 size={14} color={colors.text.secondary} />
              <Typography variant="body" style={styles.hospital}>
                {job.hospital_name}
              </Typography>
            </View>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </View>

        <Divider spacing="sm" />
        
        {/* Details */}
        <View style={styles.details}>
          {job.city_name && (
            <Chip
              label={job.city_name}
              icon={<MapPin size={12} color={colors.primary[700]} />}
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
