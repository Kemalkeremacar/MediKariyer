import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Edit3, Bell } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import type { AppTabParamList } from '@/navigation/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { ProfileHero } from '../components/ProfileHero';
import { SpecialtyChips } from '../components/SpecialtyChips';
import { StatsSection } from '../components/StatsSection';
import { RecommendedJobCard } from '../components/RecommendedJobCard';

export const DashboardScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const user = useAuthStore((state) => state.user);

  const {
    profile,
    stats,
    recommendedJobs,
    completionPercentage,
    isLoading,
    error,
  } = useDashboardData();

  const renderContent = () => {
    if (!profile) return null;

    return (
      <>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'ProfileMain' })}
            accessibilityLabel="Profilim"
          >
            <Edit3 size={24} color={colors.primary[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Bildirimler"
          >
            <Bell size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero */}
          <ProfileHero
          profilePhoto={profile.profile_photo || undefined}
          title={profile.title || 'Dr.'}
          fullName={`${profile.first_name} ${profile.last_name}`}
          specialty={profile.specialty_name || 'Genel Pratisyen'}
          city={profile.residence_city_name || 'İstanbul'}
          completionPercentage={completionPercentage}
        />

        {/* Specialty Chips */}
        {profile.specialty_name && (
          <View style={styles.section}>
            <SpecialtyChips
              specialties={[profile.specialty_name, profile.subspecialty_name].filter(Boolean) as string[]}
              maxVisible={3}
              onViewAll={() => navigation.navigate('ProfileTab', { screen: 'ProfileMain' })}
            />
          </View>
        )}

        {/* Stats Section */}
        {stats && (
          <View style={styles.section}>
            <StatsSection
              activeJobsCount={stats.activeJobsCount || 0}
              pendingApplicationsCount={stats.pendingApplicationsCount || 0}
              pendingChangesCount={stats.pendingChangesCount || 0}
              profileCompletionPercent={completionPercentage}
            />
          </View>
        )}

        {/* Recommended Jobs */}
        {recommendedJobs && recommendedJobs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Önerilen İlanlar</Text>
              {recommendedJobs.length > 3 && (
                <TouchableOpacity onPress={() => navigation.navigate('JobsTab', { screen: 'JobsList' })}>
                  <Text style={styles.viewAllLink}>Tümünü gör</Text>
                </TouchableOpacity>
              )}
            </View>
            {recommendedJobs.slice(0, 5).map((job: any) => (
              <RecommendedJobCard
                key={job.id}
                hospitalName={job.hospital_name}
                positionTitle={job.position_title}
                city={job.city}
                workType={job.work_type}
                onDetailPress={() => navigation.navigate('JobsTab', { 
                  screen: 'JobDetail', 
                  params: { id: job.id } 
                })}
                onQuickApplyPress={() => {
                  // Quick apply logic
                  navigation.navigate('JobsTab', { 
                    screen: 'JobDetail', 
                    params: { id: job.id } 
                  });
                }}
              />
            ))}
          </View>
        )}
        </ScrollView>
      </>
    );
  };

  return (
    <Screen
      loading={isLoading}
      error={error as Error | null}
      scrollable={false}
    >
      {renderContent()}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['3xl'],
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
});
