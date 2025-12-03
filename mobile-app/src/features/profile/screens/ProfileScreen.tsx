import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Phone,
  MapPin,
  LogOut,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  Award,
} from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useProfile } from '../hooks/useProfile';
import { ProfileInfoCard, ProfileInfoRow, ProfileMenuItem } from '../components';

type TabType = 'personal' | 'education' | 'experience' | 'certificates' | 'languages';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const { data: profile, isLoading, error, refetch, isRefetching } = useProfile();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const completionPercent = profile?.completion_percent || 0;
  const needsCompletion = completionPercent < 100;

  const tabs = [
    { key: 'personal' as TabType, label: 'Kişisel Bilgiler' },
    { key: 'education' as TabType, label: 'Eğitim' },
    { key: 'experience' as TabType, label: 'Deneyim' },
    { key: 'certificates' as TabType, label: 'Sertifika' },
    { key: 'languages' as TabType, label: 'Diller' },
  ];

  const renderTabContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'personal':
        return (
          <>
            {/* Profile Info Card */}
            <ProfileInfoCard
              firstName={profile.first_name || ''}
              lastName={profile.last_name || ''}
              title={profile.title || ''}
              specialty={profile.specialty_name || ''}
              subspecialty={profile.subspecialty_name}
              email={user?.email}
              completionPercent={completionPercent}
              onEditPress={() => {
                Alert.alert('Yakında', 'Profil düzenleme özelliği yakında eklenecek');
              }}
            />

        {/* Account Info */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Hesap Bilgileri
          </Typography>

          <Card variant="outlined">
            {profile.phone && (
              <>
                <ProfileInfoRow icon={Phone} label="Telefon" value={profile.phone} />
                <View style={styles.divider} />
              </>
            )}

            {profile.residence_city_name && (
              <>
                <ProfileInfoRow
                  icon={MapPin}
                  label="Konum"
                  value={profile.residence_city_name}
                />
                <View style={styles.divider} />
              </>
            )}

            <ProfileInfoRow
              icon={Award}
              label="Durum"
              value={
                <View style={styles.statusRow}>
                  <Badge variant={user?.is_approved ? 'success' : 'warning'} size="sm">
                    {user?.is_approved ? 'Onaylı' : 'Onay Bekliyor'}
                  </Badge>
                </View>
              }
            />
          </Card>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Ayarlar
          </Typography>

          <Card variant="outlined">
            <ProfileMenuItem
              icon={Lock}
              label="Şifre Değiştir"
              onPress={() => {
                Alert.alert('Yakında', 'Şifre değiştirme özelliği yakında eklenecek');
              }}
            />
            <View style={styles.divider} />

            <ProfileMenuItem
              icon={Bell}
              label="Bildirim Ayarları"
              onPress={() => {
                Alert.alert('Yakında', 'Bildirim ayarları yakında eklenecek');
              }}
            />
            <View style={styles.divider} />

            <ProfileMenuItem
              icon={FileText}
              label="Gizlilik Politikası"
              onPress={() => {
                Alert.alert('Yakında', 'Gizlilik politikası yakında eklenecek');
              }}
            />
            <View style={styles.divider} />

            <ProfileMenuItem
              icon={HelpCircle}
              label="Yardım Merkezi"
              onPress={() => {
                Alert.alert('Yakında', 'Yardım merkezi yakında eklenecek');
              }}
            />
          </Card>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut size={20} color={colors.error[600]} />
          <Typography variant="body" style={styles.logoutText}>
            {logoutMutation.isPending ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </Typography>
        </TouchableOpacity>

            {/* App Version */}
            <View style={styles.footer}>
              <Typography variant="caption" style={styles.versionText}>
                MediKariyer Doktor v1.0.0
              </Typography>
            </View>
          </>
        );

      case 'education':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h3" style={styles.emptyTitle}>Eğitim Bilgileri</Typography>
            <Typography variant="body" style={styles.emptyText}>
              Eğitim bilgileriniz yakında eklenecek.
            </Typography>
          </View>
        );

      case 'experience':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h3" style={styles.emptyTitle}>Deneyim Bilgileri</Typography>
            <Typography variant="body" style={styles.emptyText}>
              Deneyim bilgileriniz yakında eklenecek.
            </Typography>
          </View>
        );

      case 'certificates':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h3" style={styles.emptyTitle}>Sertifikalar</Typography>
            <Typography variant="body" style={styles.emptyText}>
              Sertifikalarınız yakında eklenecek.
            </Typography>
          </View>
        );

      case 'languages':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h3" style={styles.emptyTitle}>Dil Bilgileri</Typography>
            <Typography variant="body" style={styles.emptyText}>
              Dil bilgileriniz yakında eklenecek.
            </Typography>
          </View>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!profile) return null;

    return (
      <View style={styles.container}>
        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Typography
                variant="body"
                style={activeTab === tab.key ? styles.activeTabLabel : styles.tabLabel}
              >
                {tab.label}
              </Typography>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <ScrollView
          style={styles.tabContentContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {renderTabContent()}
        </ScrollView>
      </View>
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
  
  // Tab Bar Styles
  tabBar: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabBarContent: {
    paddingHorizontal: spacing.lg, // 16px padding (8px grid)
    gap: spacing['2xl'], // 24px gap between tabs
  },
  tab: {
    paddingVertical: spacing.md, // 12px vertical padding
    position: 'relative',
  },
  activeTab: {
    // Active tab styling
  },
  tabLabel: {
    color: colors.text.secondary,
  },
  activeTabLabel: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3, // 3px indicator height
    backgroundColor: colors.primary[600],
    borderRadius: 2,
  },

  // Content Styles
  tabContentContainer: {
    flex: 1,
  },
  content: {
    padding: spacing.lg, // 16px padding (8px grid)
    paddingBottom: spacing['4xl'],
  },
  tabContent: {
    padding: spacing.xl, // 20px padding
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: spacing.sm, // 8px spacing
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },

  section: {
    marginBottom: spacing.xl, // 20px spacing
  },
  sectionTitle: {
    marginBottom: spacing.md, // 12px spacing
  },
  statusRow: {
    marginTop: spacing.xs, // 4px spacing
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm, // 8px gap
    padding: spacing.lg, // 16px padding
    backgroundColor: colors.error[50],
    borderRadius: 12, // 12px for buttons (8px grid compatible)
    borderWidth: 1,
    borderColor: colors.error[200],
    marginBottom: spacing.xl, // 20px spacing
  },
  logoutText: {
    color: colors.error[600],
    fontWeight: '600',
  },
  footer: {
    paddingVertical: spacing.xl, // 20px padding
    alignItems: 'center',
  },
  versionText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
