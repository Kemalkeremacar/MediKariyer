import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing } from '@/theme';
import { MapPin, Briefcase, Clock } from 'lucide-react-native';
import type { JobListItem } from '@/types/job';

interface JobCardProps {
  job: JobListItem;
  onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card padding="md" style={styles.card}>
        <Typography variant="h4" style={styles.title}>
          {job.position_title}
        </Typography>
        <Typography variant="body" style={styles.hospital}>
          {job.hospital_name}
        </Typography>
        
        <View style={styles.details}>
          {job.city && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={colors.text.secondary} />
              <Typography variant="caption" style={styles.detailText}>
                {job.city}
              </Typography>
            </View>
          )}
          {job.work_type && (
            <View style={styles.detailItem}>
              <Briefcase size={14} color={colors.text.secondary} />
              <Typography variant="caption" style={styles.detailText}>
                {job.work_type}
              </Typography>
            </View>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hospital: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
});

export default JobCard;
