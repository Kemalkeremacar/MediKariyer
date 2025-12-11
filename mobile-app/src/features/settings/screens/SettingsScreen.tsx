/**
 * @file SettingsScreen.tsx
 * @description Modern ve profesyonel ayarlar ekranı
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { getFullImageUrl } from '@/utils/imageUrl';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error';
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  showChevron = true,
  badge,
  badgeColor = 'primary',
  rightElement,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingIconContainer}>{icon}</View>
    <View style={styles.settingContent}>
      <View style={styles.settingTitleRow}>
        <Typography variant="body" style={styles.settingTitle}>
          {title}
        </Typography>
        {badge && (
          <Badge variant={badgeColor} size="sm">
            {badge}
          </Badge>
        )}
      </View>
      {subtitle && (
        <Typography variant="caption" style={styles.settingSubtitle}>
          {subtitle}
        </Typography>
      )}
      {value && (
        <Typography variant="caption" style={styles.settingValue}>
          {value}
        </Typography>
      )}
    </View>
    {rightElement || (
      showChevron &&
      onPress && <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
    )}
  </TouchableOpacity>
);

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    {icon && <View style={styles.sectionHeaderIcon}>{icon}</View>}
    <Typography variant="h4" style={styles.sectionTitle}>
      {title}
    </Typography>
  </View>
);

export const SettingsScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const { data: profile, isLoading, error, refetch, isRefetching } = useProfile();

  // Local state for switches (demo purposes)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Devam Et',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Son Onay',
              'Tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz!',
              [
                {
                  text: 'Vazgeç',
                  style: 'cancel',
                },
                {
                  text: 'Hesabı Sil',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Bilgi', 'Hesap silme özelliği yakında aktif olacak');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderContent = () => {
    if (!profile) return null;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[600]}
          />
        }
      >
        {/* Profile Header Card */}
        <Card variant="elevated" padding="lg" style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileHeader}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              {profile.profile_photo ? (
                <Image
                  source={{
                    uri: getFullImageUrl(profile.profile_photo) || undefined,
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={32} color={colors.primary[600]} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Typography variant="h3" style={styles.profileName}>
                {profile.title} {profile.first_name} {profile.last_name}
              </Typography>
              <Typography variant="caption" style={styles.profileEmail}>
                {user?.email}
              </Typography>
              {profile.specialty_name && (
                <View style={styles.profileBadge}>
                  <Typography variant="caption" style={styles.profileSpecialty}>
                    {profile.specialty_name}
                  </Typography>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>

          {/* Account Status */}
          <View style={styles.accountStatus}>
            <View style={styles.statusItem}>
              {user?.is_approved ? (
                <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
              ) : (
                <Ionicons name="time-outline" size={16} color={colors.warning[600]} />
              )}
              <Typography variant="caption" style={styles.statusText}>
                {user?.is_approved ? 'Onaylı Hesap' : 'Onay Bekliyor'}
              </Typography>
            </View>
            {profile.completion_percent !== undefined && (
              <View style={styles.statusItem}>
                <Typography variant="caption" style={styles.completionText}>
                  Profil: %{profile.completion_percent}
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Hesap Ayarları */}
        <View style={styles.section}>
          <SectionHeader
            title="Hesap Ayarları"
            icon={<Ionicons name="person-circle-outline" size={18} color={colors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="create-outline" size={22} color={colors.primary[600]} />}
              title="Profili Düzenle"
              subtitle="Kişisel bilgilerinizi güncelleyin"
              onPress={() => navigation.navigate('ProfileEdit')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="mail-outline" size={22} color={colors.primary[600]} />}
              title="E-posta"
              value={user?.email}
              showChevron={false}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="call-outline" size={22} color={colors.primary[600]} />}
              title="Telefon"
              value={profile.phone || 'Belirtilmemiş'}
              onPress={() => navigation.navigate('ProfileEdit')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="location-outline" size={22} color={colors.primary[600]} />}
              title="Konum"
              value={profile.residence_city_name || 'Belirtilmemiş'}
              onPress={() => navigation.navigate('ProfileEdit')}
            />
          </Card>
        </View>

        {/* Güvenlik */}
        <View style={styles.section}>
          <SectionHeader
            title="Güvenlik"
            icon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="lock-closed-outline" size={22} color={colors.primary[600]} />}
              title="Şifre Değiştir"
              subtitle="Hesap şifrenizi güncelleyin"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="finger-print-outline" size={22} color={colors.primary[600]} />}
              title="Biyometrik Giriş"
              subtitle="Parmak izi veya yüz tanıma"
              onPress={() => navigation.navigate('BiometricSettings')}
            />
          </Card>
        </View>

        {/* Bildirimler */}
        <View style={styles.section}>
          <SectionHeader
            title="Bildirimler"
            icon={<Ionicons name="notifications-outline" size={18} color={colors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="notifications-outline" size={22} color={colors.primary[600]} />}
              title="Push Bildirimleri"
              subtitle="Uygulama bildirimleri"
              showChevron={false}
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{
                    false: colors.neutral[300],
                    true: colors.primary[600],
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="mail-outline" size={22} color={colors.primary[600]} />}
              title="E-posta Bildirimleri"
              subtitle="İş ilanları ve başvuru güncellemeleri"
              showChevron={false}
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{
                    false: colors.neutral[300],
                    true: colors.primary[600],
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
          </Card>
        </View>

        {/* Görünüm */}
        <View style={styles.section}>
          <SectionHeader
            title="Görünüm"
            icon={<Ionicons name="color-palette-outline" size={18} color={colors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="moon-outline" size={22} color={colors.primary[600]} />}
              title="Karanlık Mod"
              subtitle="Gece teması"
              badge="Yakında"
              badgeColor="warning"
              showChevron={false}
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  disabled
                  trackColor={{
                    false: colors.neutral[300],
                    true: colors.primary[600],
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="language-outline" size={22} color={colors.primary[600]} />}
              title="Dil"
              value="Türkçe"
              badge="Yakında"
              badgeColor="warning"
              onPress={() =>
                Alert.alert('Bilgi', 'Dil seçimi özelliği yakında eklenecek')
              }
            />
          </Card>
        </View>

        {/* Destek ve Bilgi */}
        <View style={styles.section}>
          <SectionHeader
            title="Destek ve Bilgi"
            icon={<Ionicons name="help-circle-outline" size={18} color={colors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="star-outline" size={22} color={colors.warning[600]} />}
              title="Uygulamayı Değerlendir"
              subtitle="App Store'da puan verin"
              onPress={() =>
                Alert.alert('Bilgi', 'Değerlendirme özelliği yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="chatbubble-outline" size={22} color={colors.primary[600]} />}
              title="Geri Bildirim Gönder"
              subtitle="Önerilerinizi paylaşın"
              onPress={() =>
                Alert.alert('Bilgi', 'Geri bildirim özelliği yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="share-social-outline" size={22} color={colors.primary[600]} />}
              title="Uygulamayı Paylaş"
              subtitle="Arkadaşlarınızla paylaşın"
              onPress={() =>
                Alert.alert('Bilgi', 'Paylaşım özelliği yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="help-buoy-outline" size={22} color={colors.primary[600]} />}
              title="Yardım Merkezi"
              subtitle="SSS ve destek"
              onPress={() =>
                Alert.alert('Bilgi', 'Yardım merkezi yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="document-text-outline" size={22} color={colors.primary[600]} />}
              title="Gizlilik Politikası"
              subtitle="Veri koruma ve gizlilik"
              onPress={() =>
                Alert.alert('Bilgi', 'Gizlilik politikası yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="shield-checkmark-outline" size={22} color={colors.primary[600]} />}
              title="Kullanım Koşulları"
              subtitle="Hizmet şartları"
              onPress={() =>
                Alert.alert('Bilgi', 'Kullanım koşulları yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="information-circle-outline" size={22} color={colors.primary[600]} />}
              title="Hakkında"
              value="Versiyon 1.0.0"
              onPress={() =>
                Alert.alert(
                  'MediKariyer Doktor',
                  'Versiyon: 1.0.0\nGeliştirici: MediKariyer Ekibi\n\n© 2024 MediKariyer. Tüm hakları saklıdır.'
                )
              }
            />
          </Card>
        </View>

        {/* Tehlikeli İşlemler */}
        <View style={styles.section}>
          <SectionHeader
            title="Hesap Yönetimi"
            icon={<Ionicons name="warning-outline" size={18} color={colors.error[600]} />}
          />
          <Card variant="outlined" style={styles.dangerCard}>
            <SettingItem
              icon={<Ionicons name="trash-outline" size={22} color={colors.error[600]} />}
              title="Hesabı Sil"
              subtitle="Hesabınızı kalıcı olarak silin"
              onPress={handleDeleteAccount}
              showChevron={false}
            />
          </Card>
        </View>

        {/* Çıkış Yap */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error[600]} />
          <Typography variant="body" style={styles.logoutText}>
            {logoutMutation.isPending ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </Typography>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Typography variant="caption" style={styles.footerText}>
            MediKariyer Doktor
          </Typography>
          <Typography variant="caption" style={styles.footerText}>
            Versiyon 1.0.0 • © 2024
          </Typography>
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
    backgroundColor: colors.background.secondary,
  },
  content: {
    paddingBottom: spacing['4xl'],
  },

  // Profile Card
  profileCard: {
    margin: spacing.lg,
    marginBottom: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  profileBadge: {
    alignSelf: 'flex-start',
  },
  profileSpecialty: {
    color: colors.primary[700],
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  completionText: {
    color: colors.primary[600],
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Settings Card
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.lg + 40 + spacing.md,
  },

  // Danger Card
  dangerCard: {
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
    padding: 0,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.error[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  logoutText: {
    color: colors.error[600],
    fontWeight: '600',
    fontSize: 15,
  },

  // Footer
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: colors.text.tertiary,
    fontSize: 11,
    textAlign: 'center',
  },
});
