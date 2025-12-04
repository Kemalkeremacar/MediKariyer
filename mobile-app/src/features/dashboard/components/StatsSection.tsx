import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';

export interface StatsSectionProps {
  activeJobsCount: number;
  pendingApplicationsCount: number;
  pendingChangesCount: number;
  profileCompletionPercent: number;
}

interface StatItemProps {
  value: number;
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const StatItem: React.FC<StatItemProps & { theme: any; showPercent?: boolean }> = ({ 
  value, 
  label, 
  variant = 'primary', 
  theme,
  showPercent = false 
}) => {
  const styles = useMemo(() => createStatItemStyles(theme), [theme]);
  
  const variantColors = {
    primary: theme.colors.primary[600],
    secondary: theme.colors.secondary[600],
    tertiary: theme.colors.accent[600],
  };

  return (
    <Card padding="md" style={styles.statCard}>
      <Text style={[styles.statValue, { color: variantColors[variant] }]}>
        {showPercent ? `%${value}` : value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({
  activeJobsCount,
  pendingApplicationsCount,
  pendingChangesCount,
  profileCompletionPercent,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bugünkü Durum</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <StatItem
          key="active-jobs"
          value={activeJobsCount}
          label="Aktif İlanlar"
          variant="primary"
          theme={theme}
        />
        <StatItem
          key="pending-applications"
          value={pendingApplicationsCount}
          label="Bekleyen Başvurular"
          variant="secondary"
          theme={theme}
        />
        <StatItem
          key="pending-changes"
          value={pendingChangesCount}
          label="Bekleyen Değişiklikler"
          variant="tertiary"
          theme={theme}
        />
        <StatItem
          key="profile-completion"
          value={profileCompletionPercent}
          label="Profil Tamamlanma"
          variant="primary"
          theme={theme}
          showPercent={true}
        />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    statsContainer: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });

const createStatItemStyles = (theme: any) =>
  StyleSheet.create({
    statCard: {
      minWidth: 140,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });
