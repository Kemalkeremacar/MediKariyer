import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Briefcase,
  FileText,
  TrendingUp,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import type { AppTabParamList } from '@/navigation/types';
import { useDashboard } from '../hooks/useDashboard';

export const DashboardScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
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
        {/* Simple Greeting */}
        <View style={styles.greetingSection}>
          <Typography variant="h1" style={styles.greeting}>
            Hoş geldin, Dr. {user?.first_name?.trim() || 'Doktor'}
          </Typography>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('JobsTab')}
          >
            <Card variant="elevated" padding="2xl" style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <Briefcase size={32} color={colors.primary[600] as any} />
              </View>
              <Typography variant="h3" style={styles.actionLabel}>
                İlanlar
              </Typography>
              <Typography variant="caption" style={styles.actionSubtext}>
                {data.recommended_jobs?.length || 0} yeni ilan
              </Typography>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Applications')}
          >
            <Card variant="elevated" padding="2xl" style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <FileText size={32} color={colors.success[600] as any} />
              </View>
              <Typography variant="h3" style={styles.actionLabel}>
                Başvurularım
              </Typography>
              <Typography variant="caption" style={styles.actionSubtext}>
                {data.recent_applications?.length || 0} aktif başvuru
              </Typography>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Notifications / Quick Actions Section */}
        <View style={styles.notificationsSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Bildirimler & Hızlı Aksiyonlar
          </Typography>

          {/* Profile Completion */}
          {needsCompletion && (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Card variant="outlined" padding="lg" style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIcon}>
                    <TrendingUp size={20} color={colors.warning[600] as any} />
                  </View>
                  <View style={styles.notificationText}>
                    <Typography variant="body" style={styles.notificationTitle}>
                      Profilini Tamamla
                    </Typography>
                    <Typography variant="caption" style={styles.notificationSubtext}>
                      %{completionPercent} tamamlandı
                    </Typography>
                  </View>
                  <ChevronRight size={20} color={colors.text.secondary as any} />
                </View>
              </Card>
            </TouchableOpacity>
          )}

          {/* Recent Applications Summary */}
          {data.recent_applications && data.recent_applications.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
              <Card variant="outlined" padding="lg" style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIcon}>
                    <Clock size={20} color={colors.primary[600] as any} />
                  </View>
                  <View style={styles.notificationText}>
                    <Typography variant="body" style={styles.notificationTitle}>
                      Başvurun değerlendiriliyor
                    </Typography>
                    <Typography variant="caption" style={styles.notificationSubtext}>
                      {data.recent_applications[0].hospital_name}
                    </Typography>
                  </View>
                  <ChevronRight size={20} color={colors.text.secondary as any} />
                </View>
              </Card>
            </TouchableOpacity>
          )}

          {/* Recommended Jobs Summary */}
          {data.recommended_jobs && data.recommended_jobs.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('JobsTab')}>
              <Card variant="outlined" padding="lg" style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIcon}>
                    <Briefcase size={20} color={colors.success[600] as any} />
                  </View>
                  <View style={styles.notificationText}>
                    <Typography variant="body" style={styles.notificationTitle}>
                      Yeni ilanlar mevcut
                    </Typography>
                    <Typography variant="caption" style={styles.notificationSubtext}>
                      {data.recommended_jobs.length} ilan seni bekliyor
                    </Typography>
                  </View>
                  <ChevronRight size={20} color={colors.text.secondary as any} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        </View>
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
    padding: spacing.lg, // 16px horizontal padding (8px grid)
    paddingBottom: spacing['4xl'],
  },
  
  // Greeting Section
  greetingSection: {
    marginBottom: spacing['2xl'], // 24px spacing (8px grid)
  },
  greeting: {
    color: colors.text.primary,
  },

  // Main Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.lg, // 16px gap between buttons
    marginBottom: spacing['2xl'], // 24px spacing
  },
  actionButton: {
    flex: 1,
  },
  actionCard: {
    alignItems: 'center',
    minHeight: 120, // Sufficient height for prominent buttons
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: spacing.lg, // 16px rounded
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md, // 12px spacing
  },
  actionLabel: {
    marginBottom: spacing.xs, // 4px spacing
    textAlign: 'center',
  },
  actionSubtext: {
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Notifications Section
  notificationsSection: {
    marginBottom: spacing['2xl'], // 24px spacing
  },
  sectionTitle: {
    marginBottom: spacing.lg, // 16px spacing
  },
  notificationCard: {
    marginBottom: spacing.lg, // 16px spacing between cards
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 12px gap
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.sm, // 8px rounded
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: spacing.xs / 2, // 2px spacing
  },
  notificationSubtext: {
    color: colors.text.secondary,
  },
});
