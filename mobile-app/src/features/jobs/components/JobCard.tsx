import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Typography, Badge, Button } from '@/ui';
import { spacing } from '@/theme';

export interface JobCardProps {
  title: string;
  hospital_name?: string;
  city_name?: string;
  specialty_name?: string;
  is_applied?: boolean;
  onPress?: () => void;
  onApply?: () => void;
}

export const JobCard = ({ 
  title, 
  hospital_name, 
  city_name, 
  specialty_name, 
  is_applied, 
  onPress, 
  onApply 
}: JobCardProps) => (
  <Card variant="elevated" padding="lg" onPress={onPress} style={styles.jobCard}>
    <View style={styles.jobHeader}>
      <Typography variant="h4" numberOfLines={2} style={styles.jobTitle}>
        {title}
      </Typography>
      {is_applied && <Badge label="Başvuruldu" variant="success" size="sm" />}
    </View>
    {hospital_name && (
      <Typography variant="body" color="secondary" style={styles.jobRow}>
        🏥 {hospital_name}
      </Typography>
    )}
    <View style={styles.jobDetails}>
      {city_name && (
        <Typography variant="bodySmall" color="secondary">
          📍 {city_name}
        </Typography>
      )}
      {specialty_name && (
        <Typography variant="bodySmall" color="secondary">
          ⚕️ {specialty_name}
        </Typography>
      )}
    </View>
    {!is_applied && onApply && (
      <Button 
        label="Başvur" 
        variant="primary" 
        size="md" 
        fullWidth 
        onPress={onApply} 
        style={styles.jobBtn} 
      />
    )}
  </Card>
);

const styles = StyleSheet.create({
  jobCard: { 
    marginBottom: spacing.md 
  },
  jobHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: spacing.sm, 
    gap: spacing.sm 
  },
  jobTitle: { 
    flex: 1 
  },
  jobRow: { 
    marginBottom: spacing.xs 
  },
  jobDetails: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.md, 
    marginTop: spacing.sm, 
    marginBottom: spacing.md 
  },
  jobBtn: { 
    marginTop: spacing.sm 
  },
});
