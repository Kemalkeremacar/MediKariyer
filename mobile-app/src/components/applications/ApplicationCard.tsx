import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing } from '@/theme';
import { MapPin, Briefcase, Calendar } from 'lucide-react-native';

interface ApplicationCardProps {
  application: any;
  onPress: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card padding="md" style={styles.card}>
        <View style={styles.header}>
          <Typography variant="h4" style={styles.title}>
            {application.job_title || application.position_title}
          </Typography>
          <Badge status={application.status || 'pending'}>
            {application.status}
          </Badge>
        </View>
        <Typography variant="body" style={styles.hospital}>
          {application.hospital_name}
        </Typography>
        
        <View style={styles.details}>
          {application.city && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={colors.text.secondary} />
              <Typography variant="caption" style={styles.detailText}>
                {application.city}
              </Typography>
            </View>
          )}
          {application.applied_at && (
            <View style={styles.detailItem}>
              <Calendar size={14} color={colors.text.secondary} />
              <Typography variant="caption" style={styles.detailText}>
                {new Date(application.applied_at).toLocaleDateString('tr-TR')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: spacing.sm,
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
