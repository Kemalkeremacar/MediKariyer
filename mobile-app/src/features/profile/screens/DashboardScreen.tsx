import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Typography } from '@/components/ui/Typography';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { getFullImageUrl } from '@/utils/imageUrl';
import type { ProfileStackParamList, AppTabParamList } from '@/navigation/types';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { data: profile, refetch, isRefetching } = useProfile();
  const { unreadCount } = useNotifications({ limit: 1 });

  const completionPercent = profile?.completion_percent || 0;
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={['#4A90E2', '#2E5C8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Header Top */}
          <View style={styles.headerTop}>
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
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={56} color="#4A90E2" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="create" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            
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

        {/* Care & Treatment Section */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Kariyer & Fırsatlar
          </Typography>
          
          <View style={styles.cardsRow}>
            <DashboardCard
              title="İş İlanları"
              icon={<Ionicons name="briefcase" size={32} color="#E91E63" />}
              onPress={() => navigation.navigate('JobsTab', { screen: 'JobsList' })}
              variant="large"
            />
            <DashboardCard
              title="Başvurularım"
              icon={<Ionicons name="document-text" size={32} color="#9C27B0" />}
              onPress={() => navigation.navigate('Applications')}
              variant="large"
            />
          </View>

          <View style={styles.cardsRow}>
            <DashboardCard
              title="Profilim"
              icon={<Ionicons name="person" size={32} color="#00BCD4" />}
              onPress={() => navigation.navigate('ProfileEdit')}
              variant="large"
            />
            <DashboardCard
              title="Bildirimler"
              icon={<Ionicons name="notifications" size={32} color="#FF9800" />}
              onPress={() => navigation.navigate('Notifications')}
              variant="large"
            />
          </View>
        </View>

        {/* Profile Details Section */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Profil Detayları
          </Typography>
          
          <View style={styles.cardsRow}>
            <DashboardCard
              title="Eğitim"
              icon={<Ionicons name="school" size={32} color="#4CAF50" />}
              onPress={() => navigation.navigate('Education')}
              variant="large"
            />
            <DashboardCard
              title="Deneyim"
              icon={<Ionicons name="briefcase" size={32} color="#2196F3" />}
              onPress={() => navigation.navigate('Experience')}
              variant="large"
            />
          </View>

          <View style={styles.cardsRow}>
            <DashboardCard
              title="Sertifikalar"
              icon={<Ionicons name="ribbon" size={32} color="#FF5722" />}
              onPress={() => navigation.navigate('Certificates')}
              variant="large"
            />
            <DashboardCard
              title="Diller"
              icon={<Ionicons name="language" size={32} color="#9C27B0" />}
              onPress={() => navigation.navigate('Languages')}
              variant="large"
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
    paddingTop: 60,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
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
});