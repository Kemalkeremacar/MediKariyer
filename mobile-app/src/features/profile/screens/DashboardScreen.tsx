/**
 * @file DashboardScreen.tsx
 * @description Ana dashboard ekranı - Profil özeti, vitrin ilanlar ve hızlı erişim
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖNEMLİ ÖZELLİKLER:**
 * - Profil özeti (fotoğraf, ad, soyad, uzmanlık)
 * - Profil tamamlanma oranı (backend'den)
 * - Vitrin ilanlar (son 5 ilan)
 * - Son başvurular (son 3 başvuru)
 * - Hızlı erişim kartları (özgeçmiş, fotoğraf, ayarlar)
 * - Profil detayları (eğitim, deneyim, sertifikalar, diller)
 * 
 * **AKIŞ:**
 * 1. Profil bilgileri ve tamamlanma oranı çekilir
 * 2. Vitrin ilanlar ve son başvurular gösterilir
 * 3. Kullanıcı hızlı erişim kartlarına tıklayarak ilgili sayfalara gider
 * 4. Profil detayları için prefetch yapılır (hover/focus)
 * 5. Pull-to-refresh ile tüm veriler yenilenir
 * 
 * **KRİTİK NOKTALAR:**
 * - useProfileCore ile sadece core profil bilgileri çekilir
 * - Backend'den gelen completion_percent kullanılır
 * - Prefetch ile navigation performansı artırılır
 * - Tab bar yüksekliği hesaplanarak scroll padding ayarlanır
 * - Gradient header ile modern görünüm
 * 
 * **PERFORMANS OPTİMİZASYONLARI:**
 * - Sadece core profil bilgileri çekilir (ad, soyad, fotoğraf, uzmanlık)
 * - Eğitim, deneyim vb. veriler prefetch ile yüklenir
 * - Pull-to-refresh ile manuel yenileme
 * - Skeleton loading ile kullanıcı deneyimi
 * 
 * **PROFİL TAMAMLANMA MESAJLARI:**
 * - %100: "✨ Profilin tam! Harika görünüyor"
 * - %80-99: "🎯 Neredeyse tamamlandı! Devam et"
 * - %50-79: "📝 Profilini tamamlamaya devam et"
 * - %0-49: "🚀 Profilini tamamlayarak başla"
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Skeleton } from '@/components/ui/Skeleton';
import { SideMenu } from '@/components/composite/SideMenu';
import { useProfileCore, useProfileCompletion } from '../hooks/useProfileCore';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useApplications } from '@/features/applications/hooks/useApplications';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { getFullImageUrl } from '@/utils/imageUrl';
import { educationService } from '@/api/services/profile/education.service';
import { experienceService } from '@/api/services/profile/experience.service';
import { certificateService } from '@/api/services/profile/certificate.service';
import { languageService } from '@/api/services/profile/language.service';
import { colors, spacing } from '@/theme';
import { formatFullName } from '@/utils/formatTitle';
import type { ProfileStackParamList, AppTabParamList } from '@/navigation/types';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  
  // Side menu state
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Core profil bilgileri (sadece ad, soyad, fotoğraf, unvan, uzmanlık)
  const { data: profile, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useProfileCore();
  
  // Profil tamamlanma oranı (backend'den gelen completion_percent)
  const { data: completionData, refetch: refetchCompletion, isRefetching: isRefetchingCompletion } = useProfileCompletion();
  
  // Bildirim sayıları (tek API çağrısı ile unread ve total)
  const { unreadCount, refetch: refetchNotifications } = useUnreadCount();
  
  // Featured Jobs (Last 5 jobs)
  const { 
    data: jobsData, 
    isLoading: isLoadingJobs, 
    refetch: refetchJobs,
    isRefetching: isRefetchingJobs
  } = useJobs({ limit: 5 });

  // Recent Applications (Last 3 applications)
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
  // Sadece navigation için prefetch yapıyoruz, Dashboard'da göstermiyoruz
  const prefetchLanguages = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'language'],
      queryFn: () => languageService.getLanguages(),
    });
  };

  const prefetchEducations = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'education'],
      queryFn: () => educationService.getEducations(),
    });
  };

  const prefetchExperiences = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'experience'],
      queryFn: () => experienceService.getExperiences(),
    });
  };

  const prefetchCertificates = () => {
    queryClient.prefetchQuery({
      queryKey: ['profile', 'certificate'],
      queryFn: () => certificateService.getCertificates(),
    });
  };

  // Backend'den gelen completion_percent kullanılıyor (frontend hesaplaması yok)
  const completionPercent = completionData?.completion_percent || 0;
  const unreadNotificationCount = unreadCount || 0;

  // Profil tamamlanma mesajı
  const getCompletionMessage = () => {
    if (completionPercent === 100) return '✨ Profilin tam! Harika görünüyor';
    if (completionPercent >= 80) return '🎯 Neredeyse tamamlandı! Devam et';
    if (completionPercent >= 50) return '📝 Profilini tamamlamaya devam et';
    return '🚀 Profilini tamamlayarak başla';
  };

  // Unvan + İsim + Soyisim (ünvanın sonuna nokta eklenir)
  const fullName = formatFullName(profile?.title, profile?.first_name, profile?.last_name);
  
  // Uzmanlık - Yan Dal
  const specialtyInfo = profile?.specialty_name 
    ? profile?.subspecialty_name 
      ? `${profile.specialty_name} - ${profile.subspecialty_name}`
      : profile.specialty_name
    : null;
  
  const photoUrl = getFullImageUrl(profile?.profile_photo);

  // Tab bar yüksekliği hesaplaması (TabNavigator ile aynı mantık)
  const TAB_BAR_HEIGHT = 56;
  const tabBarHeight = TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? insets.bottom : 12);
  // ScrollView için alt padding - tab bar'ın arkasında kalmaması için
  const scrollBottomPadding = tabBarHeight + 20;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
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
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
              <Ionicons name="eye-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Typography variant="title" style={styles.appTitle}>
              MediKariyer
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
              title="Temel Bilgiler"
              icon={<Ionicons name="person" size={28} color="#4A90E2" />}
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
              // Loading skeletons
              [1, 2].map((i) => (
                <View key={i} style={[styles.skeletonJobCard, { marginRight: 16 }]}>
                  <Skeleton width={280} height={140} borderRadius={16} />
                </View>
              ))
            ) : !jobsData?.pages?.[0]?.data || jobsData?.pages?.[0]?.data?.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Typography variant="bodySmall" style={styles.emptyStateText}>
                  Henüz ilan bulunmamaktadır.
                </Typography>
              </View>
            ) : (
              jobsData?.pages?.[0]?.data?.map((job) => (
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

        {/* Recent Applications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Son Başvurular
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('ApplicationsTab', { screen: 'ApplicationsList' })}>
              <Typography variant="caption" style={styles.seeAllText}>
                Tümünü Gör
              </Typography>
            </TouchableOpacity>
          </View>

          {isLoadingApplications ? (
            <View style={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height={80} borderRadius={12} style={{ marginBottom: spacing.md }} />
              ))}
            </View>
          ) : !applicationsData?.pages?.[0]?.data || applicationsData?.pages?.[0]?.data?.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="document-text-outline" size={48} color={colors.neutral[300]} />
              <Typography variant="body" style={styles.emptyStateText}>
                Henüz bir başvuru yapmadınız.
              </Typography>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('JobsTab', { screen: 'JobsList' } as any)}
              >
                <Typography variant="caption" style={styles.emptyStateButtonText}>
                  İlanlara Göz At
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.verticalList}>
              {applicationsData?.pages?.[0]?.data?.map((application) => (
                <RecentApplicationItem
                  key={application.id}
                  application={application}
                  onPress={() => navigation.navigate('ApplicationsTab', { screen: 'ApplicationsList' })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Side Menu */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={(screen) => {
          if (screen === 'Education') {
            navigation.navigate('Education');
          } else if (screen === 'Experience') {
            navigation.navigate('Experience');
          } else if (screen === 'Certificates') {
            navigation.navigate('Certificates');
          } else if (screen === 'Languages') {
            navigation.navigate('Languages');
          } else if (screen === 'Applications') {
            navigation.navigate('ApplicationsTab', { screen: 'ApplicationsList' });
          } else if (screen === 'SettingsMain') {
            navigation.navigate('SettingsTab', { screen: 'SettingsMain' } as any);
          } else if (screen === 'SavedJobs') {
            navigation.navigate('JobsTab', { screen: 'JobsList' } as any);
          } else if (screen === 'ProfileEdit') {
            navigation.navigate('ProfileEdit');
          } else if (screen === 'Notifications') {
            navigation.navigate('Notifications');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  scrollContent: {
    flexGrow: 1,
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
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 32,
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
    fontSize: 20,
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
    paddingBottom: 20,
    paddingRight: 24,
  },
  skeletonJobCard: {
    width: 280,
    height: 140,
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
    paddingVertical: spacing.sm,
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
