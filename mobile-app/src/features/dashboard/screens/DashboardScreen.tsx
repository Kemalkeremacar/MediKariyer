/**
 * DASHBOARD SCREEN - Modern Ana Ekran
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { colors, spacing, borderRadius } from '@/theme';
import { Typography, JobCard, LoadingState, ErrorState, EmptyState } from '@/ui';
import { Screen, Section } from '@/layouts';
import { FadeIn, SlideIn, StaggerList } from '@/animations';
import { Bell, Briefcase, FileText } from 'lucide-react-native';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { StatCard } from '@/features/dashboard/components/StatCard';
import type { DashboardApplication, DashboardJob } from '@/features/dashboard/types';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (isLoading) return <LoadingState message="Dashboard yükleniyor..." />;
  if (isError) return <ErrorState title="Dashboard yüklenemedi" onRetry={refetch} />;
  if (!data) return <EmptyState title="Veri bulunamadı" />;

  return (
    <Screen scrollable refreshing={isRefetching} onRefresh={refetch}>
      {/* Header */}
      <FadeIn>
        <View style={styles.header}>
          <View>
            <Typography variant="bodySmall" color="secondary">Hoş geldin,</Typography>
            <Typography variant="h3">{user?.first_name} {user?.last_name}</Typography>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)}>
            <View style={styles.notificationBadge}>
              <Bell size={24} color={colors.text.primary} />
              {data.unread_notifications_count > 0 && (
                <View style={styles.badge}>
                  <Typography variant="caption" color="inverse" style={styles.badgeText}>
                    {data.unread_notifications_count}
                  </Typography>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* Stats Grid */}
      <Section title="İstatistikler" spacing="lg">
        <View style={styles.statsGrid}>
          <SlideIn direction="left" delay={100}>
            <StatCard
              title="Başvurularım"
              value={data.recent_applications?.length || 0}
              icon={<FileText size={20} color="#fff" />}
              color="primary"
              onPress={() => navigation.navigate('Applications' as never)}
            />
          </SlideIn>
          <SlideIn direction="right" delay={150}>
            <StatCard
              title="Yeni İlanlar"
              value={data.recommended_jobs?.length || 0}
              icon={<Briefcase size={20} color="#fff" />}
              color="success"
              onPress={() => navigation.navigate('Jobs' as never)}
            />
          </SlideIn>
        </View>
      </Section>

      {/* Son Başvurular */}
      {data.recent_applications && data.recent_applications.length > 0 && (
        <Section
          title="Son Başvurularım"
          action={{ label: 'Tümünü Gör', onPress: () => navigation.navigate('Applications' as never) }}
        >
          <StaggerList staggerDelay={80}>
            {data.recent_applications.slice(0, 3).map((app: DashboardApplication) => (
              <DashboardCard
                key={app.id}
                title={app.job_title || ''}
                subtitle={app.hospital_name || ''}
                status={app.status || undefined}
              />
            ))}
          </StaggerList>
        </Section>
      )}

      {/* Önerilen İlanlar */}
      {data.recommended_jobs && data.recommended_jobs.length > 0 && (
        <Section
          title="Senin İçin Önerilen İlanlar"
          action={{ label: 'Tümünü Gör', onPress: () => navigation.navigate('Jobs' as never) }}
        >
          <StaggerList staggerDelay={100}>
            {data.recommended_jobs.slice(0, 3).map((job: DashboardJob) => (
              <JobCard
                key={job.id}
                title={job.title || ''}
                hospital_name={job.hospital_name || undefined}
                city_name={job.city_name || undefined}
                is_applied={job.is_applied}
                onPress={() => navigation.navigate('JobDetail' as never, { jobId: job.id } as never)}
              />
            ))}
          </StaggerList>
        </Section>
      )}

      {/* Empty State */}
      {(!data.recent_applications || data.recent_applications.length === 0) &&
        (!data.recommended_jobs || data.recommended_jobs.length === 0) && (
          <EmptyState
            title="Henüz başvuru yok"
            description="İlk başvurunu yapmak için iş ilanlarına göz at"
            actionLabel="İlanları Gör"
            onAction={() => navigation.navigate('Jobs' as never)}
          />
        )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
