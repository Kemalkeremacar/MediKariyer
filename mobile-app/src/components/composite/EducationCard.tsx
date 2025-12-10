import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { GraduationCap, Calendar } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { colors, spacing } from '@/theme';

export interface EducationCardProps {
  degree: string;
  institution: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  onPress?: () => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  degree,
  institution,
  field,
  startDate,
  endDate,
  current = false,
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <GraduationCap size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h4" style={styles.degree}>
              {degree}
            </Typography>
            <Typography variant="body" style={styles.institution}>
              {institution}
            </Typography>
            {field && (
              <Typography variant="caption" style={styles.field}>
                {field}
              </Typography>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Chip
            label={`${startDate} - ${current ? 'Devam Ediyor' : endDate}`}
            icon={<Calendar size={12} color={colors.neutral[600]} />}
            variant="soft"
            color="neutral"
            size="sm"
          />
        </View>
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
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
  content: {
    flex: 1,
    gap: 4,
  },
  degree: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  institution: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  field: {
    fontSize: 12,
    color: colors.primary[600],
  },
  footer: {
    marginTop: spacing.xs,
  },
});
