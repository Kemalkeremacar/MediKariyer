import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { FeaturedJobCard } from '@/components/ui/FeaturedJobCard';
import { RecentApplicationItem } from '@/components/ui/RecentApplicationItem';
import { useProfile, useProfileCompletion } from '../hooks/useProfile';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useApplications } from '@/features/applications/hooks/useApplications';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { getFullImageUrl } from '@/utils/imageUrl';
import { profileService } from '@/api/services/profile';
import { colors } from '@/theme';
import type { ProfileStackParamList, AppTabParamList } from '@/navigation/types';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { data: profile, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useProfile();
  const { data: completionData, refetch: refetchCompletion, isRefetching: isRefetchingCompletion } = useProfileCompletion();
  const { unreadCount, refetch: refetchNotifications } = useNotifications({ limit: 1 });
  
  // Fetch Featured Jobs (Last 5 jobs)
  const { 
    data: jobsData, 
    isLoading: isLoadingJobs, 
    refetch: refetchJobs,
    isRefetching: isRefetchingJobs
  } = useJobs({ limit: 5 });

  // Fetch Recent Applications (Last 3 applications)
  const { 
    data: applicationsData, 
    isLoading: isLoadingApplications, 
    refetch: refetchApplications,
    isRefetching: isRefetchingApplications
  } = useApplications({ limit: 3 });

  const isRefetching = isRefetchingProfile || isRefetchingCompletion || isRefetchingJobs || isRefetchingApplications;

  const handleRefresh = () => {
    refetchProfile();
    refetchCompletion();
    refetchNotifications();
    refetchJobs();
    refetchApplications();
  };

  // Prefetch profile data when user hovers/focuses on cards
  const prefetchLanguages = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'languages'],
      queryFn: () => profileService.getLanguages(),
    });
  };

  const prefetchEducations = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'educations'],
      queryFn: () => profileService.getEducations(),
    });
  };

  const prefetchExperiences = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'experiences'],
      queryFn: () => profileService.getExperiences(),
    });
  };

  const prefetchCertificates = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'certificates'],
      queryFn: () => profileService.getCertificates(),
    });
  };

  const completionPercent = completionData?.completion_percent || 0;
  const unreadNotificationCount = unreadCount || 0;

  // Profil tamamlanma mesajı
  const getCompletionMessage = () => {
    if (completionPercent === 100) return '✨ Profilin tam! Harika görünüyor';
    if (completionPercent >= 80) return '🎯 Neredeyse tamamlandı! Devam et';
    if (completionPercent >= 50) return '📝 Profilini tamamlamaya devam et';
    return '🚀 Profilini tamamlayarak başla';
  };

  // Unvan + İsim + Soyisim
  const fullName = `${profile?.title || ''} ${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Kullanıcı';
  
  // Uzmanlık - Yan Dal
  const specialtyInfo = profile?.specialty_name 
    ? profile?.subspecialty_name 
      ? `${profile.specialty_name} - ${profile.subspecialty_name}`
      : profile.specialty_name
    : null;
  
  const photoUrl = getFullImageUrl(profile?.profile_photo);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={handleRefresh} 
            tintColor="#ffffff"
            colors={['#1D4ED8']}
          />
        }
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={['#1D4ED8', '#2563EB', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Header Top */}
          <View style={styles.headerTop}>
            <Typography variant="title" style={styles.appTitle}>
              medikariyer.net
            </Typography>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notifications')}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Typography variant="caption" style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={56} color="#4A90E2" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editBadge}
                onPress={() => navigation.navigate('ProfileEdit')}
              >
                <Ionicons name="pencil" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Typography variant="h1" style={styles.profileName}>
                {fullName}
              </Typography>
              {specialtyInfo && (
                <Typography variant="body" style={styles.profileSubtitle}>
                  {specialtyInfo}
                </Typography>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Typography variant="caption" style={styles.progressLabel}>
                Profil Tamamlanma
              </Typography>
              <Typography variant="caption" style={styles.progressPercent}>
                {completionPercent}%
              </Typography>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completionPercent}%` }]} />
            </View>
            <Typography variant="caption" style={styles.progressMessage}>
              {getCompletionMessage()}
            </Typography>
          </View>
        </LinearGradient>

        {/* Featured Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Vitrin İlanlar
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('JobsTab', { screen: 'JobsList' })}>
              <Typography variant="caption" style={styles.seeAllText}>
                Tümünü Gör
              </Typography>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {isLoadingJobs ? (
              // Loading skeletons could be here, for now just empty
              [1, 2].map((i) => (
                <View key={i} style={[styles.skeletonCard, { marginRight: 16 }]} />
              ))
            ) : jobsData?.pages[0]?.data.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Typography variant="bodySmall" style={styles.emptyStateText}>
                  Henüz ilan bulunmamaktadır.
                </Typography>
              </View>
            ) : (
              jobsData?.pages[0]?.data.map((job) => (
                <FeaturedJobCard
                  key={job.id}
                  job={job}
                  onPress={() => navigation.navigate('JobsTab', { 
                    screen: 'JobDetail', 
                    params: { id: job.id } 
                  })}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Hızlı Erişim
          </Typography>
          
          <View style={styles.cardsRow}>
            <DashboardCard
              title="Özgeçmiş"
              icon={<Ionicons name="document-text" size={28} color="#4A90E2" />}
              onPress={() => navigation.navigate('ProfileEdit')}
              variant="default"
              style={{ flex: 1 }}
            />
            <DashboardCard
              title="Fotoğraf"
              icon={<Ionicons name="camera" size={28} color="#9C27B0" />}
              onPress={() => navigation.navigate('PhotoManagement')}
              variant="default"
              style={{ flex: 1 }}
            />
            <DashboardCard
              title="Ayarlar"
              icon={<Ionicons name="settings" size={28} color="#607D8B" />}
              onPress={() => navigation.navigate('SettingsTab', { screen: 'SettingsMain' })}
              variant="default"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Recent Applications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Son Başvurular
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
              <Typography variant="caption" style={styles.seeAllText}>
                Tümünü Gör
              </Typography>
            </TouchableOpacity>
          </View>

          {isLoadingApplications ? (
            <View style={styles.skeletonList} />
          ) : applicationsData?.pages[0]?.data.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="document-text-outline" size={48} color={colors.neutral[300]} />
              <Typography variant="body" style={styles.emptyStateText}>
                Henüz bir başvuru yapmadınız.
              </Typography>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('JobsTab', { screen: 'JobsList' })}
              >
                <Typography variant="caption" style={styles.emptyStateButtonText}>
                  İlanlara Göz At
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.verticalList}>
              {applicationsData?.pages[0]?.data.map((application) => (
                <RecentApplicationItem
                  key={application.id}
                  application={application}
                  onPress={() => navigation.navigate('Applications')}
                />
              ))}
            </View>
          )}
        </View>

        {/* Profile Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Profil Detayları
            </Typography>
            <Ionicons name="person-circle" size={20} color="#1D4ED8" />
          </View>
          
          <View style={styles.cardsRow}>
            <DashboardCard
              title="Eğitim"
              icon={<Ionicons name="school" size={28} color="#4CAF50" />}
              onPress={() => navigation.navigate('Education')}
              onPressIn={prefetchEducations}
              variant="default"
              style={{ flex: 1 }}
            />
            <DashboardCard
              title="Deneyim"
              icon={<Ionicons name="briefcase" size={28} color="#2196F3" />}
              onPress={() => navigation.navigate('Experience')}
              onPressIn={prefetchExperiences}
              variant="default"
              style={{ flex: 1 }}
            />
          </View>

          <View style={styles.cardsRow}>
            <DashboardCard
              title="Sertifikalar"
              icon={<Ionicons name="ribbon" size={28} color="#FF5722" />}
              onPress={() => navigation.navigate('Certificates')}
              onPressIn={prefetchCertificates}
              variant="default"
              style={{ flex: 1 }}
            />
            <DashboardCard
              title="Diller"
              icon={<Ionicons name="language" size={28} color="#9C27B0" />}
              onPress={() => navigation.navigate('Languages')}
              onPressIn={prefetchLanguages}
              variant="default"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  profileSubtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressMessage: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 24,
  },
  skeletonCard: {
    width: Dimensions.get('window').width * 0.75,
    height: 140,
    backgroundColor: '#e1e4e8',
    borderRadius: 16,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  verticalList: {
    gap: 0,
  },
  skeletonList: {
    height: 100,
    backgroundColor: '#e1e4e8',
    borderRadius: 12,
  },
  emptyStateCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateButton: {
    marginTop: 12,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
});