/**
 * @file SettingsScreen.tsx
 * @description Profesyonel ayarlar ekranı
 * 
 * Özellikler:
 * - Şifre değiştirme
 * - Uygulama paylaşma, değerlendirme, geri bildirim
 * - Yasal sayfalar (gizlilik, kullanım koşulları)
 * - Hesap işlemleri (çıkış, hesap kapatma)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { lightColors, spacing } from '@/theme';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAppActions } from '@/features/settings/hooks/useAppActions';
import { useToast } from '@/providers/ToastProvider';

// ============================================================================
// TYPES
// ============================================================================

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
  disabled?: boolean;
  destructive?: boolean;
}

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

// ============================================================================
// COMPONENTS
// ============================================================================

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
  disabled = false,
  destructive = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (onPress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  }, [onPress, disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (onPress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [onPress, disabled, scaleAnim]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress || disabled}
      style={({ pressed }) => [
        pressed && onPress && !disabled && styles.settingItemPressed,
      ]}
    >
      <Animated.View style={[styles.settingItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[
          styles.settingIconContainer, 
          iconBgColor && { backgroundColor: iconBgColor },
          disabled && styles.settingIconDisabled,
        ]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <View style={styles.settingTitleRow}>
            <Typography 
              variant="body" 
              style={StyleSheet.flatten([
                styles.settingTitle,
                destructive && styles.settingTitleDestructive,
                disabled && styles.settingTitleDisabled,
              ])}
            >
              {title}
            </Typography>
            {badge && (
              <Badge variant={badgeColor} size="sm">
                {badge}
              </Badge>
            )}
          </View>
          {subtitle && (
            <Typography 
              variant="caption" 
              style={StyleSheet.flatten([styles.settingSubtitle, disabled && styles.settingSubtitleDisabled])}
            >
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
          showChevron && onPress && !disabled && (
            <Ionicons name="chevron-forward" size={20} color={lightColors.neutral[400]} />
          )
        )}
      </Animated.View>
    </Pressable>
  );
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    {icon && <View style={styles.sectionHeaderIcon}>{icon}</View>}
    <Typography variant="h3" style={styles.sectionTitle}>
      {title}
    </Typography>
  </View>
);

const Divider = () => <View style={styles.divider} />;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsMain'>;

export const SettingsScreen = ({ navigation }: Props) => {
  const { showToast } = useToast();
  const logoutMutation = useLogout();
  
  const {
    shareApp,
    rateApp,
    sendFeedback,
    getAppInfo,
  } = useAppActions();

  const appInfo = useMemo(() => getAppInfo(), [getAppInfo]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ]
    );
  }, [logoutMutation]);

  const handleShowAppInfo = useCallback(() => {
    Alert.alert(
      'Uygulama Bilgisi',
      `${appInfo.name}\n\nVersiyon: ${appInfo.version} (${appInfo.buildNumber})\nPlatform: ${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${appInfo.platformVersion}\n\n© 2026 MediKariyer\nTüm hakları saklıdır.`,
      [{ text: 'Tamam' }]
    );
  }, [appInfo]);


  return (
    <Screen scrollable={false}>
      {/* Header - Sabit (ScrollView dışında) */}
      <GradientHeader
        title="Ayarlar"
        subtitle="Tercihler ve hesap ayarları"
        icon={<Ionicons name="settings-sharp" size={28} color="#FFFFFF" />}
        variant="primary"
        iconColorPreset="blue"
      />

      {/* Content - ScrollView */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        {/* Yasal ve Bilgi */}
        <View style={styles.section}>
          <SectionHeader
            title="Yasal ve Bilgi"
            icon={<Ionicons name="document-text-outline" size={16} color="#64748B" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="shield-checkmark" size={22} color="#64748B" />}
              iconBgColor="#F1F5F9"
              title="Gizlilik Politikası"
              subtitle="Veri koruma ve gizlilik"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <Divider />
            <SettingItem
              icon={<Ionicons name="document-text" size={22} color="#64748B" />}
              iconBgColor="#F1F5F9"
              title="Kullanım Koşulları"
              subtitle="Hizmet şartları"
              onPress={() => navigation.navigate('TermsOfService')}
            />
            <Divider />
            <SettingItem
              icon={<Ionicons name="information-circle" size={22} color="#64748B" />}
              iconBgColor="#F1F5F9"
              title="Uygulama Bilgisi"
              value={`Versiyon ${appInfo.version}`}
              onPress={handleShowAppInfo}
            />
          </Card>
        </View>

        {/* Destek ve Geri Bildirim */}
        <View style={styles.section}>
          <SectionHeader
            title="Destek ve Geri Bildirim"
            icon={<Ionicons name="heart-outline" size={16} color="#06B6D4" />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="help-circle" size={22} color="#06B6D4" />}
              iconBgColor="#CFFAFE"
              title="Yardım Merkezi"
              subtitle="SSS ve kullanım kılavuzu"
              onPress={() => navigation.navigate('HelpCenter')}
            />
            <Divider />
            <SettingItem
              icon={<Ionicons name="chatbubble-ellipses" size={22} color="#06B6D4" />}
              iconBgColor="#CFFAFE"
              title="Geri Bildirim"
              subtitle="Önerilerinizi paylaşın"
              onPress={sendFeedback}
            />
            <Divider />
            <SettingItem
              icon={<Ionicons name="star" size={22} color="#F59E0B" />}
              iconBgColor="#FEF3C7"
              title="Uygulamayı Değerlendir"
              subtitle={Platform.OS === 'ios' ? "App Store'da puan verin" : "Play Store'da puan verin"}
              onPress={rateApp}
            />
            <Divider />
            <SettingItem
              icon={<Ionicons name="share-social" size={22} color="#06B6D4" />}
              iconBgColor="#CFFAFE"
              title="Uygulamayı Paylaş"
              subtitle="Arkadaşlarınızla paylaşın"
              onPress={shareApp}
            />
          </Card>
        </View>

        {/* Hesap ve Güvenlik */}
        <View style={styles.section}>
          <SectionHeader
            title="Hesap ve Güvenlik"
            icon={<Ionicons name="shield-checkmark-outline" size={16} color={lightColors.primary[600]} />}
          />
          <Card variant="outlined" style={styles.settingsCard}>
            <SettingItem
              icon={<Ionicons name="lock-closed" size={22} color={lightColors.primary[600]} />}
              iconBgColor="#EEF2FF"
              title="Şifre Değiştir"
              subtitle="Hesap şifrenizi güncelleyin"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <Divider />
            <SettingItem
              icon={<Ionicons name="trash" size={22} color="#DC2626" />}
              iconBgColor="#FEE2E2"
              title="Hesabı Sil"
              subtitle="Hesabınızı kalıcı olarak silin"
              onPress={() => navigation.navigate('DeleteAccount')}
              showChevron={true}
              destructive
            />
          </Card>
        </View>

        {/* Çıkış Yap Butonu */}
        <View style={styles.logoutSection}>
          <Pressable
            onPress={logoutMutation.isPending ? undefined : handleLogout}
            disabled={logoutMutation.isPending}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
              logoutMutation.isPending && styles.logoutButtonDisabled,
            ]}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            )}
            <Typography variant="body" style={styles.logoutButtonText}>
              {logoutMutation.isPending ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
            </Typography>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typography variant="caption" style={styles.footerText}>
            {appInfo.name}
          </Typography>
          <Typography variant="caption" style={styles.footerVersion}>
            Versiyon {appInfo.version} • © 2026
          </Typography>
        </View>
      </ScrollView>
    </Screen>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: spacing['4xl'],
  },
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
    backgroundColor: lightColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: lightColors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsCard: {
    padding: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  settingItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: lightColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDisabled: {
    opacity: 0.5,
  },
  settingContent: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: lightColors.text.primary,
  },
  settingTitleDestructive: {
    color: '#EF4444',
  },
  settingTitleDisabled: {
    opacity: 0.5,
  },
  settingSubtitle: {
    fontSize: 13,
    color: lightColors.text.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  settingSubtitleDisabled: {
    opacity: 0.5,
  },
  settingValue: {
    fontSize: 13,
    color: lightColors.primary[600],
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.neutral[200],
    marginLeft: spacing.lg + 48 + spacing.md,
  },
  logoutSection: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.md,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonPressed: {
    backgroundColor: '#DC2626',
    transform: [{ scale: 0.98 }],
  },
  logoutButtonDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: {
    color: lightColors.text.tertiary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerVersion: {
    color: lightColors.text.tertiary,
    fontSize: 12,
    opacity: 0.7,
  },
});
