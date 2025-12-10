import React from 'react';
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
  Lock,
  HelpCircle,
  FileText,
  User,
  Mail,
  CheckCircle,
  Clock,
  ChevronRight,
  Fingerprint,
} from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { SectionCard } from '@/components/composite/SectionCard';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useProfile } from '@/features/profile/hooks/useProfile';

export const SettingsScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const { data: profile, isLoading, error, refetch, isRefetching } = useProfile();

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
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: () => {
            // İkinci onay
            Alert.alert(
              'Son Onay',
              'Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?',
              [
                {
                  text: 'Vazgeç',
                  style: 'cancel',
                },
                {
                  text: 'Hesabı Sil',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Yakında', 'Hesap silme özelliği yakında eklenecek');
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <User size={28} color={colors.primary[600]} />
            </View>
            <View style={styles.headerText}>
              <Typography variant="h2" style={styles.headerTitle}>
                Hesabım
              </Typography>
              <Typography variant="caption" style={styles.headerSubtitle}>
                Hesap bilgileri ve ayarlar
              </Typography>
            </View>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Hesap Bilgileri
          </Typography>

          <Card variant="outlined" padding="lg">
            {user?.email && (
              <>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Mail size={20} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      E-posta
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      {user.email}
                    </Typography>
                  </View>
                </View>
                <Divider spacing="md" />
              </>
            )}

            {profile.phone && (
              <>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Phone size={20} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      Telefon
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      {profile.phone}
                    </Typography>
                  </View>
                </View>
                <Divider spacing="md" />
              </>
            )}

            {profile.residence_city_name && (
              <>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <MapPin size={20} color={colors.primary[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Typography variant="caption" style={styles.infoLabel}>
                      Konum
                    </Typography>
                    <Typography variant="body" style={styles.infoValue}>
                      {profile.residence_city_name}
                    </Typography>
                  </View>
                </View>
                <Divider spacing="md" />
              </>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                {user?.is_approved ? (
                  <CheckCircle size={20} color={colors.success[600]} />
                ) : (
                  <Clock size={20} color={colors.warning[600]} />
                )}
              </View>
              <View style={styles.infoContent}>
                <Typography variant="caption" style={styles.infoLabel}>
                  Hesap Durumu
                </Typography>
                <View style={styles.statusBadgeContainer}>
                  <Badge variant={user?.is_approved ? 'success' : 'warning'} size="sm">
                    {user?.is_approved ? 'Onaylı Hesap' : 'Onay Bekliyor'}
                  </Badge>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Genel Ayarlar */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Genel Ayarlar
          </Typography>

          <Card variant="outlined" padding="lg">
            {/* Push Bildirimleri */}
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Typography variant="body" style={styles.settingLabel}>
                  Push Bildirimleri
                </Typography>
                <Typography variant="caption" style={styles.settingDescription}>
                  Uygulama bildirimleri
                </Typography>
              </View>
              <View style={styles.settingSwitch}>
                <Typography variant="caption" style={styles.comingSoon}>
                  Yakında
                </Typography>
              </View>
            </View>
            <Divider spacing="md" />

            {/* E-posta Bildirimleri */}
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Typography variant="body" style={styles.settingLabel}>
                  E-posta Bildirimleri
                </Typography>
                <Typography variant="caption" style={styles.settingDescription}>
                  E-posta ile bildirim al
                </Typography>
              </View>
              <View style={styles.settingSwitch}>
                <Typography variant="caption" style={styles.comingSoon}>
                  Yakında
                </Typography>
              </View>
            </View>
            <Divider spacing="md" />

            {/* Dil Seçimi */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Yakında', 'Dil seçimi özelliği yakında eklenecek')}
            >
              <View style={styles.settingContent}>
                <Typography variant="body" style={styles.settingLabel}>
                  Dil
                </Typography>
                <Typography variant="caption" style={styles.settingDescription}>
                  Türkçe
                </Typography>
              </View>
              <ChevronRight size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
            <Divider spacing="md" />

            {/* Tema */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Yakında', 'Tema seçimi özelliği yakında eklenecek')}
            >
              <View style={styles.settingContent}>
                <Typography variant="body" style={styles.settingLabel}>
                  Tema
                </Typography>
                <Typography variant="caption" style={styles.settingDescription}>
                  Açık
                </Typography>
              </View>
              <ChevronRight size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Settings Menu - Using SectionCard */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Güvenlik
          </Typography>

          <View style={styles.sectionGroup}>
            <SectionCard
              icon={<Fingerprint size={24} color={colors.primary[600]} />}
              title="Biyometrik Giriş"
              subtitle="Parmak izi veya yüz tanıma"
              onPress={() => navigation.navigate('BiometricSettings')}
            />
            <SectionCard
              icon={<Lock size={24} color={colors.primary[600]} />}
              title="Şifre Değiştir"
              subtitle="Hesap şifrenizi güncelleyin"
              onPress={() => navigation.navigate('ChangePassword')}
            />
          </View>
        </View>

        {/* Help & Support - Using SectionCard */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Yardım ve Destek
          </Typography>

          <View style={styles.sectionGroup}>
            <SectionCard
              icon={<FileText size={24} color={colors.primary[600]} />}
              title="Gizlilik Politikası"
              subtitle="Veri koruma ve gizlilik"
              onPress={() => Alert.alert('Yakında', 'Gizlilik politikası yakında eklenecek')}
            />
            <SectionCard
              icon={<HelpCircle size={24} color={colors.primary[600]} />}
              title="Yardım Merkezi"
              subtitle="SSS ve destek"
              onPress={() => Alert.alert('Yakında', 'Yardım merkezi yakında eklenecek')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Typography variant="h4" style={{ ...styles.sectionTitle, color: colors.error[600] }}>
            Tehlikeli Bölge
          </Typography>

          <Card variant="outlined" padding="lg" style={styles.dangerCard}>
            <Typography variant="body" style={styles.dangerText}>
              ⚠️ Hesabınızı silmek geri alınamaz bir işlemdir. Tüm verileriniz kalıcı olarak silinecektir.
            </Typography>
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Typography variant="body" style={styles.deleteAccountText}>
                Hesabımı Sil
              </Typography>
            </TouchableOpacity>
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
    paddingBottom: spacing['4xl'],
  },

  // Header Styles
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    fontSize: 13,
  },

  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionGroup: {
    gap: spacing.md,
  },

  // Info Item Styles
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  statusBadgeContainer: {
    marginTop: spacing.xs,
  },

  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.lg + 40 + spacing.md,
  },

  cardNoPadding: {
    padding: 0,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  settingSwitch: {
    marginLeft: spacing.md,
  },
  comingSoon: {
    color: colors.warning[600],
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },

  dangerCard: {
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
  },
  dangerText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  deleteAccountButton: {
    padding: spacing.md,
    backgroundColor: colors.error[600],
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: colors.background.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.error[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error[200],
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  logoutText: {
    color: colors.error[600],
    fontWeight: '600',
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  versionText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
