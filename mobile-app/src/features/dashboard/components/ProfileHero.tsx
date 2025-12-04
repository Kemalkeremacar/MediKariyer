import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

export interface ProfileHeroProps {
  profilePhoto?: string;
  title: string;
  fullName: string;
  specialty: string;
  city: string;
  completionPercentage: number;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  profilePhoto,
  title,
  fullName,
  specialty,
  city,
  completionPercentage,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Format professional name: "Unvan + İsim Soyisim"
  const professionalName = `${title} ${fullName}`;

  // Format specialty and location: "Uzmanlık · Şehir"
  const specialtyLocation = `${specialty} · ${city}`;

  return (
    <Card padding="xl" style={styles.container}>
      {/* Profile Photo */}
      <View style={styles.avatarContainer}>
        <Avatar
          source={profilePhoto ? { uri: profilePhoto } : undefined}
          name={fullName}
          size="xl"
          style={styles.avatar}
        />
      </View>

      {/* Professional Name */}
      <Text style={styles.professionalName}>{professionalName}</Text>

      {/* Specialty and Location */}
      <Text style={styles.specialtyLocation}>{specialtyLocation}</Text>

      {/* Profile Completion Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, completionPercentage))}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>%{completionPercentage}</Text>
      </View>
    </Card>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 88,
      height: 88,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    professionalName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    specialtyLocation: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    progressBarBackground: {
      flex: 1,
      height: 8,
      backgroundColor: theme.colors.neutral[200],
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary[600],
      borderRadius: theme.borderRadius.full,
    },
    progressText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.secondary,
      minWidth: 40,
    },
  });
