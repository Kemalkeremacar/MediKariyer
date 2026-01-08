/**
 * @file SettingsScreen.tsx
 * @description Kurumsal tarzda ayarlar ekranı - Sadece uygulama ayarları
 */

import React, { useState } from 'react';
import { useAlertHelpers } from '@/utils/alertHelpers';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useMutation } from '@tanstack/react-query';
import { accountService } from '@/api/services/account.service';

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
  iconBgColor?: string;
  iconColor?: string;
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
  iconBgColor,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <Animated.View style={[styles.settingItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.settingIconContainer, iconBgColor && { backgroundColor: iconBgColor }]}>{icon}</View>
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
      </Animated.View>
    </Pressable>
  );
};

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    {icon && <View style={styles.sectionHeaderIcon}>{icon}</View>}
    <Typography variant="h3" style={styles.sectionTitle}>
      {title}
    </Typography>
  </View>
);

export const SettingsScreen = ({ navigation }: any) => {
  const logoutMutation = useLogout();
  const alert = useAlertHelpers();

  // Hesap kapatma mutation
  const deactivateAccountMutation = useMutation({
    mutationFn: () => accountService.deactivateAccount(),
    onSuccess: () => {
      // Toast kullan (modal değil - touch events engellenmez)
      // Logout zaten navigation yapacak, modal açık kalmasın
      // showToast kullanmak için useToast hook'u eklenmeli ama logout hemen yapılacak
      // Bu durumda showAlert yerine direkt logout yapalım, toast gerekmez
      // Backend zaten oturumları sonlandırdı, kullanıcıyı logout yap
      logoutMutation.mutate();
    },
    onError: () => {
      alert.error('Hesap kapatılırken bir hata oluştu. Lütfen tekrar deneyin.');
    },
  });

  // Bildirim ayarları
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [systemMessages, setSystemMessages] = useState(true);

  const handleLogout = () => {
    alert.confirmDestructive(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      () => logoutMutation.mutate(),
      undefined,
      'Çıkış Yap'
    );
  };

  const handleDeleteAccount = () => {
    alert.confirmDestructive(
      'Hesabı Kapat',
      'Hesabınızı kapatmak istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      () => {
        // İkinci onay
        alert.confirmDestructive(
          'Son Onay',
          'Hesabınız pasifleştirilecek ve tüm oturumlarınız sonlandırılacaktır. Bu işlem geri alınamaz!',
          () => {
            deactivateAccountMutation.mutate();
          },
          undefined,
          'Hesabı Kapat'
        );
      },
      undefined,
      'Devam Et'
    );
  };

  const renderContent = () => {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Gradient Header */}
        <GradientHeader
          title="Ayarlar"
          subtitle="Tercihler ve ayarlar"
          icon={<Ionicons name="settings-sharp" size={28} color="#FFFFFF" />}
          variant="primary"
          iconColorPreset="blue"
        />

        {/* Güvenlik */}
        <View style={styles.section}>
          <SectionHeader
            title="Güvenlik"
            icon={<Ionicons name="shield-checkmark-outline" size={16} color={colors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="lock-closed" size={20} color={colors.primary[600]} />}
              iconBgColor="#EEF2FF"
              title="Şifre Değiştir"
              subtitle="Hesap şifrenizi güncelleyin"
              onPress={() => navigation.navigate('ChangePassword')}
            />
          </Card>
        </View>

        {/* Bildirim Tercihleri */}
        <View style={styles.section}>
          <SectionHeader
            title="Bildirim Tercihleri"
            icon={<Ionicons name="notifications-outline" size={16} color="#6096B4" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="notifications" size={20} color="#6096B4" />}
              iconBgColor="#E0F2FE"
              title="Anlık Bildirimler"
              subtitle="Tarayıcı ve uygulama bildirimleri"
              showChevron={false}
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{
                    false: colors.neutral[300],
                    true: '#6096B4',
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="mail" size={20} color="#6096B4" />}
              iconBgColor="#E0F2FE"
              title="E-posta Bildirimleri"
              subtitle="Önemli güncellemeler e-posta ile"
              showChevron={false}
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{
                    false: colors.neutral[300],
                    true: '#6096B4',
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="document-text" size={20} color="#6096B4" />}
              iconBgColor="#E0F2FE"
              title="Başvuru Güncellemeleri"
              subtitle="Başvurularınızla ilgili bildirimler"
              showChevron={false}
              rightElement={
                <Switch
                  value={applicationUpdates}
                  onValueChange={setApplicationUpdates}
                  trackColor={{
                    false: colors.neutral[300],
                    true: '#6096B4',
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="briefcase" size={20} color="#6096B4" />}
              iconBgColor="#E0F2FE"
              title="İş İlanı Uyarıları"
              subtitle="Yeni iş ilanları hakkında bildirim"
              showChevron={false}
              rightElement={
                <Switch
                  value={jobAlerts}
                  onValueChange={setJobAlerts}
                  trackColor={{
                    false: colors.neutral[300],
                    true: '#6096B4',
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="megaphone" size={20} color="#6096B4" />}
              iconBgColor="#E0F2FE"
              title="Sistem Mesajları"
              subtitle="Önemli sistem duyuruları"
              showChevron={false}
              rightElement={
                <Switch
                  value={systemMessages}
                  onValueChange={setSystemMessages}
                  trackColor={{
                    false: colors.neutral[300],
                    true: '#6096B4',
                  }}
                  thumbColor={colors.background.primary}
                />
              }
            />
          </Card>
        </View>

        {/* Görünüm ve Dil */}
        <View style={styles.section}>
          <SectionHeader
            title="Görünüm ve Dil"
            icon={<Ionicons name="color-palette-outline" size={16} color="#EC4899" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="contrast" size={20} color="#EC4899" />}
              iconBgColor="#FCE7F3"
              title="Tema"
              subtitle="Açık, koyu veya sistem teması"
              value="Açık Tema"
              badge="Yakında"
              badgeColor="warning"
              onPress={() =>
                alert.info('Tema seçimi özelliği yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="language" size={20} color="#EC4899" />}
              iconBgColor="#FCE7F3"
              title="Dil"
              subtitle="Uygulama dili"
              value="Türkçe"
              badge="Yakında"
              badgeColor="warning"
              onPress={() =>
                alert.info('Dil seçimi özelliği yakında eklenecek')
              }
            />
          </Card>
        </View>

        {/* Hakkında ve Destek */}
        <View style={styles.section}>
          <SectionHeader
            title="Hakkında ve Destek"
            icon={<Ionicons name="information-circle-outline" size={16} color="#06B6D4" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="help-buoy" size={20} color="#06B6D4" />}
              iconBgColor="#CFFAFE"
              title="Yardım Merkezi"
              subtitle="SSS ve destek"
              onPress={() =>
                alert.info('Yardım merkezi yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="chatbubble-ellipses" size={20} color="#06B6D4" />}
              iconBgColor="#CFFAFE"
              title="Geri Bildirim"
              subtitle="Önerilerinizi paylaşın"
              onPress={() =>
                alert.info('Geri bildirim özelliği yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="star" size={20} color="#F59E0B" />}
              iconBgColor="#FEF3C7"
              title="Uygulamayı Değerlendir"
              subtitle="App Store'da puan verin"
              onPress={() =>
                alert.info('Değerlendirme özelliği yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="share-social" size={20} color="#06B6D4" />}
              iconBgColor="#CFFAFE"
              title="Uygulamayı Paylaş"
              subtitle="Arkadaşlarınızla paylaşın"
              onPress={() =>
                alert.info('Paylaşım özelliği yakında eklenecek')
              }
            />
          </Card>
        </View>

        {/* Yasal */}
        <View style={styles.section}>
          <SectionHeader
            title="Yasal"
            icon={<Ionicons name="document-text-outline" size={16} color="#64748B" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="shield-checkmark" size={20} color="#64748B" />}
              iconBgColor="#F1F5F9"
              title="Gizlilik Politikası"
              subtitle="Veri koruma ve gizlilik"
              onPress={() =>
                alert.info('Gizlilik politikası yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="document-text" size={20} color="#64748B" />}
              iconBgColor="#F1F5F9"
              title="Kullanım Koşulları"
              subtitle="Hizmet şartları"
              onPress={() =>
                alert.info('Kullanım koşulları yakında eklenecek')
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="information-circle" size={20} color="#64748B" />}
              iconBgColor="#F1F5F9"
              title="Uygulama Bilgisi"
              value="Versiyon 1.0.0"
              onPress={() =>
                alert.info('Versiyon: 1.0.0\nGeliştirici: MediKariyer Ekibi\n\n© 2024 MediKariyer. Tüm hakları saklıdır.')
              }
            />
          </Card>
        </View>

        {/* Hesap İşlemleri */}
        <View style={styles.section}>
          <SectionHeader
            title="Hesap İşlemleri"
            icon={<Ionicons name="warning-outline" size={16} color="#EF4444" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="log-out" size={20} color="#EF4444" />}
              iconBgColor="#FEE2E2"
              title="Çıkış Yap"
              subtitle="Hesabınızdan çıkış yapın"
              onPress={handleLogout}
              showChevron={false}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={deactivateAccountMutation.isPending 
                ? <ActivityIndicator size="small" color="#EF4444" />
                : <Ionicons name="trash" size={20} color="#EF4444" />}
              iconBgColor="#FEE2E2"
              title="Hesabı Kapat"
              subtitle="Hesabınızı kalıcı olarak kapatın"
              onPress={deactivateAccountMutation.isPending ? undefined : handleDeleteAccount}
              showChevron={false}
            />
          </Card>
        </View>

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
    <Screen scrollable={false}>
      {renderContent()}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  content: {
    paddingBottom: spacing['4xl'],
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
    paddingHorizontal: spacing.xs,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Settings Card
  settingsCard: {
    padding: 0,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: 3,
    lineHeight: 16,
  },
  settingValue: {
    fontSize: 13,
    color: colors.primary[600],
    marginTop: 3,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.lg + 48 + spacing.md,
    opacity: 0.4,
  },



  // Footer
  footer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.text.tertiary,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
  },
});
