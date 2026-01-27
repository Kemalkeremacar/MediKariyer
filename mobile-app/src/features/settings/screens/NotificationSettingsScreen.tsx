/**
 * @file NotificationSettingsScreen.tsx
 * @description Bildirim ayarları ekranı
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/layout/Screen';
import { lightColors, spacing } from '@/theme';
import { useToast } from '@/providers/ToastProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'NotificationSettings'>;

const STORAGE_KEY = '@notification_preferences';

interface NotificationPreferences {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  messages: boolean;
  marketing: boolean;
}

export const NotificationSettingsScreen = (_props: Props) => {
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    jobAlerts: true,
    applicationUpdates: true,
    messages: true,
    marketing: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Sistem izni kontrolü
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');

      // Kayıtlı tercihleri yükle
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Bildirim tercihleri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Bildirim tercihleri kaydedilemedi:', error);
      showToast('Tercihler kaydedilemedi', 'error');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        showToast('Bildirimler açıldı', 'success');
      } else {
        Alert.alert(
          'Bildirim İzni',
          'Bildirim almak için cihaz ayarlarından izin vermeniz gerekmektedir.',
          [
            { text: 'Tamam' },
          ]
        );
      }
    } else {
      Alert.alert(
        'Bildirimleri Kapat',
        'Tüm bildirimleri kapatmak istediğinize emin misiniz? Önemli güncellemeleri kaçırabilirsiniz.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Kapat',
            style: 'destructive',
            onPress: () => {
              setNotificationsEnabled(false);
              showToast('Bildirimler kapatıldı', 'info');
            },
          },
        ]
      );
    }
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    savePreferences(newPreferences);
  };

  if (loading) {
    return (
      <Screen loading>
        <View />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="notifications" size={32} color={lightColors.primary[600]} />
          </View>
          <Typography variant="h2" style={styles.headerTitle}>
            Bildirim Ayarları
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Hangi bildirimleri almak istediğinizi seçin
          </Typography>
        </View>

        {/* Ana Bildirim Anahtarı */}
        <Card variant="outlined" padding="lg" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Typography variant="body" style={styles.settingTitle}>
                Tüm Bildirimler
              </Typography>
              <Typography variant="caption" style={styles.settingSubtitle}>
                Tüm bildirimleri aç/kapat
              </Typography>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
            />
          </View>
        </Card>

        {/* Bildirim Kategorileri */}
        {notificationsEnabled && (
          <>
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Bildirim Kategorileri
              </Typography>
            </View>

            <Card variant="outlined" padding="lg" style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="briefcase" size={22} color={lightColors.primary[600]} />
                    <Typography variant="body" style={styles.settingTitle}>
                      İş İlanları
                    </Typography>
                  </View>
                  <Typography variant="caption" style={styles.settingSubtitle}>
                    Yeni iş ilanları ve öneriler
                  </Typography>
                </View>
                <Switch
                  value={preferences.jobAlerts}
                  onValueChange={() => handleTogglePreference('jobAlerts')}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="document-text" size={22} color={lightColors.success[600]} />
                    <Typography variant="body" style={styles.settingTitle}>
                      Başvuru Güncellemeleri
                    </Typography>
                  </View>
                  <Typography variant="caption" style={styles.settingSubtitle}>
                    Başvurularınızın durum değişiklikleri
                  </Typography>
                </View>
                <Switch
                  value={preferences.applicationUpdates}
                  onValueChange={() => handleTogglePreference('applicationUpdates')}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="chatbubbles" size={22} color={lightColors.warning[600]} />
                    <Typography variant="body" style={styles.settingTitle}>
                      Mesajlar
                    </Typography>
                  </View>
                  <Typography variant="caption" style={styles.settingSubtitle}>
                    Yeni mesajlar ve yanıtlar
                  </Typography>
                </View>
                <Switch
                  value={preferences.messages}
                  onValueChange={() => handleTogglePreference('messages')}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="megaphone" size={22} color={lightColors.neutral[600]} />
                    <Typography variant="body" style={styles.settingTitle}>
                      Pazarlama
                    </Typography>
                  </View>
                  <Typography variant="caption" style={styles.settingSubtitle}>
                    Kampanyalar ve özel teklifler
                  </Typography>
                </View>
                <Switch
                  value={preferences.marketing}
                  onValueChange={() => handleTogglePreference('marketing')}
                />
              </View>
            </Card>
          </>
        )}

        {/* Bilgi Kartı */}
        <Card variant="outlined" padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={lightColors.primary[600]} />
            <Typography variant="h3" style={styles.infoTitle}>
              Bildirim İpuçları
            </Typography>
          </View>
          <Typography variant="caption" style={styles.infoText}>
            • Önemli güncellemeleri kaçırmamak için başvuru bildirimlerini açık tutun
          </Typography>
          <Typography variant="caption" style={styles.infoText}>
            • İş ilanı bildirimleri profilinize uygun fırsatları size önerir
          </Typography>
          <Typography variant="caption" style={styles.infoText}>
            • Cihaz ayarlarından bildirimleri tamamen kapatabilirsiniz
          </Typography>
        </Card>
      </ScrollView>
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
  backButtonContainer: {
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: lightColors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: lightColors.text.secondary,
    textAlign: 'center',
    fontSize: 15,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: lightColors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text.primary,
  },
  settingSubtitle: {
    fontSize: 13,
    color: lightColors.text.secondary,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.neutral[200],
    marginVertical: spacing.md,
  },
  infoCard: {
    backgroundColor: lightColors.primary[50],
    borderColor: lightColors.primary[200],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: lightColors.primary[700],
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    color: lightColors.primary[700],
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});
