import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {
  User,
  CheckCircle,
  Edit3,
  Bell,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '../hooks/useProfile';
import { getFullImageUrl } from '@/utils/imageUrl';
import type { ProfileStackParamList, AppTabParamList } from '@/navigation/types';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, error, refetch, isRefetching } = useProfile();

  const completionPercent = profile?.completion_percent || 0;
  const needsCompletion = completionPercent < 100;

  const renderContent = () => {
    if (!profile) return null;

    return (
      <>
        {/* Header with Edit and Notification Buttons */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ProfileEdit')}
            accessibilityLabel="Profil düzenle"
          >
            <Edit3 size={20} color={colors.primary[600]} />
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
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {/* Modern Profile Header */}
          <Card variant="elevated" padding="lg" style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatar}>
              {profile.profile_photo ? (
                <Image 
                  source={{ uri: getFullImageUrl(profile.profile_photo) || undefined }} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <User size={40} color={colors.primary[600]} />
              )}
            </View>
            {user?.is_approved && (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={20} color={colors.success[600]} />
              </View>
            )}
          </View>
          
          <Typography variant="h2" style={styles.profileName}>
            {profile.title} {profile.first_name} {profile.last_name}
          </Typography>
          
          {profile.specialty_name && (
            <Typography variant="body" style={styles.profileSpecialty}>
              {profile.specialty_name}
              {profile.subspecialty_name && ` • ${profile.subspecialty_name}`}
            </Typography>
          )}

          {/* Completion Progress */}
          {needsCompletion && (
            <View style={styles.completionContainer}>
              <View style={styles.completionHeader}>
                <Typography variant="caption" style={styles.completionLabel}>
                  Profil Tamamlanma
                </Typography>
                <Typography variant="caption" style={styles.completionPercent}>
                  %{completionPercent}
                </Typography>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${completionPercent}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </Card>

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {/* Education Section */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => {
              // Navigate to education detail
            }}
          >
            <View style={styles.sectionIconContainer}>
              <GraduationCap size={24} color={colors.primary[600]} />
            </View>
            <View style={styles.sectionContent}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Eğitim Bilgileri
              </Typography>
              <Typography variant="caption" style={styles.sectionSubtitle}>
                Üniversite, uzmanlık ve eğitimler
              </Typography>
            </View>
          </TouchableOpacity>

          {/* Experience Section */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => {
              // Navigate to experience detail
            }}
          >
            <View style={styles.sectionIconContainer}>
              <Briefcase size={24} color={colors.primary[600]} />
            </View>
            <View style={styles.sectionContent}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Deneyim Bilgileri
              </Typography>
              <Typography variant="caption" style={styles.sectionSubtitle}>
                İş deneyimleri ve pozisyonlar
              </Typography>
            </View>
          </TouchableOpacity>

          {/* Certificates Section */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => {
              // Navigate to certificates detail
            }}
          >
            <View style={styles.sectionIconContainer}>
              <Award size={24} color={colors.primary[600]} />
            </View>
            <View style={styles.sectionContent}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Sertifikalar
              </Typography>
              <Typography variant="caption" style={styles.sectionSubtitle}>
                Kurslar ve sertifikalar
              </Typography>
            </View>
          </TouchableOpacity>

          {/* Languages Section */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => {
              // Navigate to languages detail
            }}
          >
            <View style={styles.sectionIconContainer}>
              <Languages size={24} color={colors.primary[600]} />
            </View>
            <View style={styles.sectionContent}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Dil Bilgileri
              </Typography>
              <Typography variant="caption" style={styles.sectionSubtitle}>
                Yabancı dil seviyeleri
              </Typography>
            </View>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </>
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
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  // Profile Header Styles
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary[200],
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  profileSpecialty: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  completionContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  completionLabel: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  completionPercent: {
    color: colors.primary[600],
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
    borderRadius: 4,
  },

  // Sections Container
  sectionsContainer: {
    gap: spacing.md,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.md,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
});
