import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Edit3,
  Bell,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  FileText,
  ChevronRight,
  User,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Typography } from '@/components/ui/Typography';
import { IconButton } from '@/components/ui/IconButton';

import { Card } from '@/components/ui/Card';
import { ProfileCard } from '@/components/composite/ProfileCard';
import { SectionCard } from '@/components/composite/SectionCard';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '../hooks/useProfile';
import { useApplications } from '@/features/applications/hooks/useApplications';
import { getFullImageUrl } from '@/utils/imageUrl';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { ProfileStackParamList, AppTabParamList } from '@/navigation/types';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, error, refetch, isRefetching } = useProfile();
  const { data: applicationsData } = useApplications({});

  const completionPercent = profile?.completion_percent || 0;

  // Son 2 başvuruyu al
  const recentApplications = useMemo(() => {
    if (!applicationsData?.pages) return [];
    const allApplications = applicationsData.pages.flatMap((page) => page.data);
    return allApplications.slice(0, 2);
  }, [applicationsData]);

  // İlk dil bilgisini al
  const primaryLanguage = useMemo(() => {
    if (!profile?.languages || profile.languages.length === 0) return null;
    const lang = profile.languages[0];
    return `${lang.language || 'Dil'} (${lang.level || 'Seviye'})`;
  }, [profile]);

  const renderContent = () => {
    if (!profile) return null;

    const fullName = `${profile.title || ''} ${profile.first_name} ${profile.last_name}`.trim();

    return (
      <>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {/* Soft Gradient Header */}
          <LinearGradient
            colors={['#F5F7FF', '#EEF2FF', '#E0E7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerTop}>
              <IconButton
                icon={<Edit3 size={20} color={colors.primary[600]} />}
                onPress={() => navigation.navigate('ProfileEdit')}
                size="md"
                variant="ghost"
              />
              <Typography variant="h2" style={styles.headerTitle}>
                Profilim
              </Typography>
              <IconButton
                icon={<Bell size={20} color={colors.primary[600]} />}
                onPress={() => navigation.navigate('Notifications')}
                size="md"
                variant="ghost"
              />
            </View>

            {/* Enhanced Profile Card */}
            <View style={styles.profileCardContainer}>
              <ProfileCard
                name={fullName}
                specialty={profile.specialty_name ?? undefined}
                subspecialty={profile.subspecialty_name ?? undefined}
                photoUrl={getFullImageUrl(profile.profile_photo) || undefined}
                verified={!!user?.is_approved}
                completionPercent={completionPercent}
                onPress={() => navigation.navigate('ProfileEdit')}
              />
            </View>
          </LinearGradient>

          {/* Stats Cards Row - Soft Gradients */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#EEF2FF', '#E0E7FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <Sparkles size={20} color={colors.primary[600]} />
                </View>
                <Typography variant="h2" style={styles.statValue}>
                  {completionPercent}%
                </Typography>
                <Typography variant="caption" style={styles.statLabel}>
                  Profil Tamamlanma
                </Typography>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#F0FDF4', '#DCFCE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <FileText size={20} color={colors.success[600]} />
                </View>
                <Typography variant="h2" style={styles.statValue}>
                  {recentApplications.length}
                </Typography>
                <Typography variant="caption" style={styles.statLabel}>
                  Son Başvurular
                </Typography>
              </LinearGradient>
            </View>
          </View>

          {/* Profesyonel Bilgiler Kartı - Soft Gradient */}
          <Card variant="elevated" style={styles.professionalCard}>
            <LinearGradient
              colors={['#FEFEFE', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Briefcase size={20} color={colors.primary[600]} />
                </View>
                <Typography variant="h4" style={styles.cardTitle}>
                  Profesyonel Bilgiler
                </Typography>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconSmall}>
                    <Briefcase size={16} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      Çalışma Türü
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      Tam Zamanlı
                    </Typography>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <View style={styles.infoIconSmall}>
                    <GraduationCap size={16} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      Yan Dal
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      {profile.subspecialty_name || 'Belirtilmemiş'}
                    </Typography>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <View style={styles.infoIconSmall}>
                    <MapPin size={16} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      Şehir
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      {profile.residence_city_name || 'Belirtilmemiş'}
                    </Typography>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <View style={styles.infoIconSmall}>
                    <Languages size={16} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      Dil
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      {primaryLanguage || 'Belirtilmemiş'}
                    </Typography>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Card>

          {/* Hızlı Erişimler */}
          <View style={styles.quickAccessSection}>
            <View style={styles.sectionHeaderRow}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Hızlı Erişim
              </Typography>
            </View>
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity 
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('JobsTab', { screen: 'JobsList' })}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.primary[50] }]}>
                  <Briefcase size={24} color={colors.primary[600]} />
                </View>
                <Typography variant="caption" style={styles.quickAccessLabel}>
                  İlanlar
                </Typography>
                <Typography variant="caption" style={styles.quickAccessSubLabel}>
                  İş fırsatları
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Applications')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.success[50] }]}>
                  <FileText size={24} color={colors.success[600]} />
                </View>
                <Typography variant="caption" style={styles.quickAccessLabel}>
                  Başvurularım
                </Typography>
                <Typography variant="caption" style={styles.quickAccessSubLabel}>
                  Takip et
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.warning[50] }]}>
                  <Bell size={24} color={colors.warning[600]} />
                </View>
                <Typography variant="caption" style={styles.quickAccessLabel}>
                  Bildirimler
                </Typography>
                <Typography variant="caption" style={styles.quickAccessSubLabel}>
                  Güncellemeler
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('SettingsTab', { screen: 'SettingsMain' })}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.secondary[50] }]}>
                  <User size={24} color={colors.secondary[600]} />
                </View>
                <Typography variant="caption" style={styles.quickAccessLabel}>
                  Ayarlar
                </Typography>
                <Typography variant="caption" style={styles.quickAccessSubLabel}>
                  Hesap
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Son Başvurular Preview */}
          {recentApplications.length > 0 && (
            <View style={styles.recentApplicationsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.sectionHeaderIcon}>
                    <FileText size={18} color={colors.success[600]} />
                  </View>
                  <Typography variant="h4" style={styles.sectionTitle}>
                    Son Başvurular
                  </Typography>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
                  <Typography variant="caption" style={styles.seeAllLink}>
                    Tümünü Gör →
                  </Typography>
                </TouchableOpacity>
              </View>
              
              {recentApplications.map((application) => (
                <Card 
                  key={application.id} 
                  variant="elevated" 
                  padding="lg" 
                  style={styles.applicationPreviewCard}
                  onPress={() => navigation.navigate('Applications')}
                >
                  <View style={styles.applicationPreview}>
                    <View style={styles.applicationIconContainer}>
                      <Briefcase size={20} color={colors.primary[600]} />
                    </View>
                    <View style={styles.applicationPreviewContent}>
                      <Typography variant="body" style={styles.applicationTitle}>
                        {application.job_title || 'İlan Başlığı'}
                      </Typography>
                      <Typography variant="caption" style={styles.applicationSubtitle}>
                        {application.hospital_name || 'Hastane'}
                      </Typography>
                      <Typography variant="caption" style={styles.applicationDate}>
                        🕐 {formatDistanceToNow(new Date(application.created_at), { addSuffix: true, locale: tr })}
                      </Typography>
                    </View>
                    <ChevronRight size={20} color={colors.neutral[400]} />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Profile Sections */}
          <View style={styles.sectionsContainer}>
            <View style={styles.sectionHeaderRow}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Profil Detayları
              </Typography>
            </View>
            <View style={styles.sectionsGrid}>
              <SectionCard
                icon={<GraduationCap size={24} color={colors.primary[600]} />}
                title="Eğitim"
                subtitle="Üniversite ve uzmanlık"
                onPress={() => navigation.navigate('Education')}
              />

              <SectionCard
                icon={<Briefcase size={24} color={colors.success[600]} />}
                title="Deneyim"
                subtitle="İş deneyimleri"
                onPress={() => navigation.navigate('Experience')}
              />

              <SectionCard
                icon={<Award size={24} color={colors.warning[600]} />}
                title="Sertifikalar"
                subtitle="Kurslar"
                onPress={() => navigation.navigate('Certificates')}
              />

              <SectionCard
                icon={<Languages size={24} color={colors.secondary[600]} />}
                title="Diller"
                subtitle="Yabancı dil"
                onPress={() => navigation.navigate('Languages')}
              />
            </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingBottom: spacing['4xl'],
  },
  gradientHeader: {
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  profileCardContainer: {
    paddingHorizontal: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  quickPreview: {
    marginTop: spacing.xl,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  
  // Profesyonel Bilgiler Kartı
  professionalCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  infoGrid: {
    gap: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 52,
  },
  infoIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  // Hızlı Erişimler
  quickAccessSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAccessItem: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
    elevation: 2,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  quickAccessLabel: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickAccessSubLabel: {
    color: colors.text.tertiary,
    fontSize: 11,
    textAlign: 'center',
  },

  // Son Başvurular
  recentApplicationsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllLink: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '700',
  },
  applicationPreviewCard: {
    marginBottom: spacing.md,
  },
  applicationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  applicationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicationPreviewContent: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  applicationSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  applicationDate: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  sectionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
