import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Typography, Badge } from '@/ui';
import { colors, spacing } from '@/theme';
import type { ApplicationListItem } from '@/types/application';

interface ApplicationCardProps {
  application: ApplicationListItem;
  onPress: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
}) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Typography variant="h4">{application.job_title ?? 'Başvuru'}</Typography>
      <Typography variant="bodySmall" color="secondary">
        {application.hospital_name ?? 'Kurum bilgisi yok'}
      </Typography>
      <View style={styles.footer}>
        <Badge 
          label={application.status ?? 'Durum yok'}
          variant="primary"
          size="sm"
        />
        <Typography variant="caption" color="secondary">
          {new Date(application.created_at).toLocaleDateString('tr-TR')}
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
