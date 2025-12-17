import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { colors, spacing } from '@/theme';
import { formatExperiencePeriod } from '@/utils/date';

export interface EducationCardProps {
  degree: string;
  institution: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  degree,
  institution,
  field,
  startDate,
  endDate,
  current = false,
  onPress,
  onEdit,
  onDelete,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h3" style={styles.degree}>
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
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.error[600]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Chip
            label={formatExperiencePeriod(startDate, endDate, current)}
            icon={<Ionicons name="calendar" size={12} color={colors.neutral[600]} />}
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
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
});
