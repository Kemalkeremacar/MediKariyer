/**
 * Profile Feature Component - Profile Info Card
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/theme';

interface ProfileInfoCardProps {
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  subspecialty?: string | null;
  email?: string;
  completionPercent: number;
  onEditPress: () => void;
}

export const ProfileInfoCard = ({
  firstName,
  lastName,
  title,
  specialty,
  subspecialty,
  email,
  completionPercent,
  onEditPress,
}: ProfileInfoCardProps) => {
  const needsCompletion = completionPercent < 100;
  const fullName = `${firstName} ${lastName}`;

  return (
    <Card variant="elevated" padding="xl" style={styles.card}>
      <View style={styles.header}>
        <Avatar name={fullName} size="xl" style={styles.avatar} />
        <View style={styles.info}>
          <Typography variant="h2" style={styles.name}>
            {title} {firstName} {lastName}
          </Typography>
          <Typography variant="body" style={styles.specialty}>
            {specialty}
            {subspecialty && ` • ${subspecialty}`}
          </Typography>
          {email && (
            <Typography variant="caption" style={styles.email}>
              {email}
            </Typography>
          )}
        </View>
      </View>

      {needsCompletion && (
        <View style={styles.completionSection}>
          <View style={styles.completionHeader}>
            <Typography variant="body" style={styles.completionLabel}>
              Profil Tamamlanma
            </Typography>
            <Typography variant="h3" style={styles.completionPercent}>
              %{completionPercent}
            </Typography>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
          </View>
          <Typography variant="caption" style={styles.completionHint}>
            Profilini tamamlayarak daha fazla iş fırsatına ulaş
          </Typography>
        </View>
      )}

      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Edit size={16} color={colors.primary[600]} />
        <Typography variant="body" style={styles.editButtonText}>
          Profili Düzenle
        </Typography>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: spacing.xs,
  },
  specialty: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  email: {
    color: colors.text.secondary,
  },
  completionSection: {
    padding: spacing.lg,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completionLabel: {
    fontWeight: '500',
  },
  completionPercent: {
    color: colors.primary[600],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.primary[100],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  completionHint: {
    color: colors.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  editButtonText: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
