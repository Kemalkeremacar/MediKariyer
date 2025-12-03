import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme';

export interface JobCardProps {
  title: string;
  hospital_name?: string;
  city_name?: string;
  specialty_name?: string;
  salary?: string | number;
  application_count?: number;
  is_applied?: boolean;
  onPress?: () => void;
  onApply?: () => void;
}

export const JobCard = ({ 
  title, 
  hospital_name, 
  city_name, 
  specialty_name,
  salary,
  application_count,
  is_applied, 
  onPress, 
  onApply 
}: JobCardProps) => (
  <Card variant="elevated" padding="lg" onPress={onPress} style={styles.jobCard}>
    <View style={styles.jobHeader}>
      <View style={styles.jobInfo}>
        {hospital_name && (
          <Typography variant="h3" style={styles.hospitalName}>
            {hospital_name}
          </Typography>
        )}
        <Typography variant="body" style={styles.jobTitle}>
          {specialty_name || title}
        </Typography>
      </View>
      {is_applied && <Badge variant="success" size="sm">Başvuruldu</Badge>}
    </View>
    
    <View style={styles.jobDetails}>
      {city_name && (
        <Typography variant="caption" style={styles.detailText}>
          📍 {city_name}
        </Typography>
      )}
      {salary && (
        <Typography variant="caption" style={styles.detailText}>
          💰 {salary}
        </Typography>
      )}
      {application_count !== undefined && (
        <Typography variant="caption" style={styles.detailText}>
          👥 {application_count} başvuru
        </Typography>
      )}
    </View>
    
    {!is_applied && onApply && (
      <Button 
        label="Başvur" 
        variant="primary" 
        size="md" 
        onPress={onApply} 
        style={styles.applyButton} 
      />
    )}
  </Card>
);

const styles = StyleSheet.create({
  jobCard: { 
    marginBottom: spacing.lg, // 16px spacing between cards (8px grid)
  },
  jobHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: spacing.sm, // 8px spacing
    gap: spacing.sm, // 8px gap
  },
  jobInfo: {
    flex: 1,
  },
  hospitalName: {
    marginBottom: spacing.xs / 2, // 2px spacing
  },
  jobTitle: { 
    flex: 1,
  },
  jobDetails: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.md, // 12px gap
    marginTop: spacing.sm, // 8px spacing
    marginBottom: spacing.md, // 12px spacing
  },
  detailText: {
    // Regular 14pt for details
  },
  applyButton: { 
    marginTop: spacing.sm, // 8px spacing
    alignSelf: 'flex-end', // Right-aligned
  },
});
