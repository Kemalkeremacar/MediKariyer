import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Briefcase,
  FileText,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Clock,
  MapPin,
  Star,
} from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import type { AppTabParamList } from '@/navigation/types';
import { useDashboard } from '../hooks/useDashboard';
import { QuickStatCard, WelcomeHeader } from '../components';

export const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppTabParamList>>();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error, refetch, isRefetching } = useDashboard();

  const completionPercent = data?.stats?.profile_completion_percent || 0;
  const needsCompletion = completionPercent < 100;

  const renderContent = () => {
    if (!data) return null;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Welcome Header */}
        <WelcomeHeader
          firstName={user?.first_name || ''}
          lastName={user?.last_name || ''}
          unreadCount={data.stats?.unread_notifications_count || 0}
          onNotificationPress={() => {
            // TODO: Notifications ekranı TabNavigator'a eklendiğinde aktif edilecek
            // navigation.navigate('Notifications')
          }}
        />

        {/* Profile Completion Alert */}
        {needsCompletion && (
          <Card variant="elevated" padding="lg" style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <TrendingUp size={20} color={colors.warning[600]} />
              <Typography variant="h3" style={styles.completionTitle}>
                Profilini Tamamla
              </Typography>
            </View>
            <Typography variant="body" style={styles.completionText}>
              Profilin %{completionPercent} tamamlandı. Daha fazla iş fırsatı için
              profilini tamamla!
            </Typography>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${completionPercent}%` }]}
              />
            </View>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Typography variant="body" style={styles.completionButtonText}>
                Profili Tamamla
              </Typography>
              <ChevronRight size={16} color={colors.primary[600]} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <QuickStatCard
            icon={Briefcase}
            iconColor={colors.primary[600]}
            iconBgColor={colors.primary[50]}
            value={data.recommended_jobs?.length || 0}
            label="Önerilen İlan"
          />
          <QuickStatCard
            icon={FileText}
            iconColor={colors.success[600]}
            iconBgColor={colors.success[50]}
            value={data.recent_applications?.length || 0}
            label="Aktif Başvuru"
          />
          <QuickStatCard
            icon={Star}
            iconColor={colors.warning[600]}
            iconBgColor={colors.warning[50]}
            value={`${completionPercent}%`}
            label="Profil"
          />
        </View>

        {/* Recent Applications */}
        {data.recent_applications && data.recent_applications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="h3">Son Başvurular</Typography>
              <TouchableOpacity
                onPress={() => navigation.navigate('Applications')}
              >
                <Typography variant="body" style={styles.seeAll}>
                  Tümünü Gör
                </Typography>
              </TouchableOpacity>
            </View>

            {data.recent_applications.slice(0, 3).map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() => navigation.navigate('Applications')}
              >
                <Card
                  variant="outlined"
                  padding="lg"
                  style={styles.applicationCard}
                >
                  <View style={styles.applicationHeader}>
                    <View style={styles.applicationInfo}>
                      <Typography variant="h3" style={styles.jobTitle}>
                        {app.job_title}
                      </Typography>
                      <Typography variant="caption" style={styles.hospitalName}>
                        {app.hospital_name}
                      </Typography>
                    </View>
                    <Badge
                      variant={
                        app.status_label === 'Onaylandı' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {app.status_label}
                    </Badge>
                  </View>
                  <View style={styles.applicationFooter}>
                    <View style={styles.applicationMeta}>
                      <Clock size={14} color={colors.text.secondary} />
                      <Typography variant="caption">
                        {new Date(app.created_at).toLocaleDateString('tr-TR')}
                      </Typography>
                    </View>
                    <ChevronRight size={16} color={colors.text.secondary} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recommended Jobs */}
        {data.recommended_jobs && data.recommended_jobs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="h3">Önerilen İlanlar</Typography>
              <TouchableOpacity onPress={() => navigation.navigate('JobsTab')}>
                <Typography variant="body" style={styles.seeAll}>
                  Tümünü Gör
                </Typography>
              </TouchableOpacity>
            </View>

            {data.recommended_jobs.slice(0, 3).map((job) => (
              <TouchableOpacity
                key={job.id}
                onPress={() =>
                  navigation.navigate('JobsTab', {
                    screen: 'JobDetail',
                    params: { id: job.id },
                  })
                }
              >
                <Card
                  variant="outlined"
                  padding="lg"
                  style={styles.jobCard}
                >
                <View style={styles.jobHeader}>
                  <View style={styles.jobInfo}>
                    <Typography variant="h3" style={styles.jobTitle}>
                      {job.title}
                    </Typography>
                    <Typography variant="caption" style={styles.hospitalName}>
                      {job.hospital_name}
                    </Typography>
                  </View>
                  {job.is_applied && (
                    <View style={styles.appliedBadge}>
                      <CheckCircle size={16} color={colors.success[600]} />
                    </View>
                  )}
                </View>
                <View style={styles.jobFooter}>
                  <View style={styles.jobMeta}>
                    <MapPin size={14} color={colors.text.secondary} />
                    <Typography variant="caption">{job.city_name}</Typography>
                  </View>
                  {job.specialty_name && (
                    <Badge variant="secondary" size="sm">
                      {job.specialty_name}
                    </Badge>
                  )}
                </View>
                <View style={styles.jobAction}>
                  <ChevronRight size={16} color={colors.primary[600]} />
                </View>
              </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {data.recent_applications.length === 0 &&
          data.recommended_jobs.length === 0 && (
            <View style={styles.emptyState}>
              <Typography variant="h3" style={styles.emptyTitle}>
                Henüz içerik yok
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                İş ilanlarına göz atmaya başlayın!
              </Typography>
              <Button
                label="İlanları Gör"
                variant="primary"
                onPress={() => navigation.navigate('JobsTab')}
              />
            </View>
          )}
      </ScrollView>
    );
  };

  return (
    <Screen
      loading={isLoading}
      error={error as Error | null}
      onRetry={refetch}
      scrollable={false}
    >
      {renderContent()}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  completionCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.warning[50],
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  completionTitle: {
    color: colors.warning[700],
  },
  completionText: {
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.warning[100],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.warning[500],
  },
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  completionButtonText: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  applicationCard: {
    marginBottom: spacing.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  applicationInfo: {
    flex: 1,
  },
  jobTitle: {
    marginBottom: spacing.xs,
  },
  hospitalName: {
    color: colors.text.secondary,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobCard: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  jobInfo: {
    flex: 1,
  },
  appliedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobAction: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
