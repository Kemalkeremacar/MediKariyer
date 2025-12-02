import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Typography, Card } from '@/ui';
import { colors, spacing, borderRadius, typography } from '@/theme';
import type { CompleteProfile } from '@/types/profile';

interface ProfileHeaderProps {
  profile: CompleteProfile;
  completionPercent?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  completionPercent,
}) => {
  return (
    <Card padding="xl" style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar
          name={`${profile.first_name} ${profile.last_name}`}
          size="xl"
          color="primary"
        />
        <View style={styles.profileInfo}>
          <Typography variant="h4" style={styles.profileName}>
            {profile.title ? `${profile.title} ` : ''}
            {profile.first_name} {profile.last_name}
          </Typography>
          {profile.specialty_name && (
            <Typography variant="body" color="secondary" style={styles.profileSpecialty}>
              {profile.specialty_name}
            </Typography>
          )}
        </View>
      </View>

      {completionPercent !== undefined && (
        <View style={styles.completionSection}>
          <View style={styles.completionHeader}>
            <Typography variant="body">Profil Tamamlanma</Typography>
            <Typography variant="h4" style={styles.completionPercent}>
              {completionPercent}%
            </Typography>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionPercent}%`,
                  backgroundColor:
                    completionPercent >= 80
                      ? colors.success[500]
                      : completionPercent >= 50
                      ? colors.warning[500]
                      : colors.error[500],
                },
              ]}
            />
          </View>
          {completionPercent < 100 && (
            <Typography variant="caption" style={styles.completionHint}>
              Profilini tamamlayarak daha fazla fırsat yakala
            </Typography>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  profileName: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
  },
  profileSpecialty: {
    fontSize: 14,
  },
  completionSection: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionPercent: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
  },
  completionHint: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
