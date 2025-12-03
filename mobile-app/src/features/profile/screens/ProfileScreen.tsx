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

export const ProfileScreen = () => {
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

  const completionPercent = profile?.completion_percent || 0;
  const needsCompletion = completionPercent < 100;

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
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statusRow: {
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
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
    marginBottom: spacing.xl,
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
