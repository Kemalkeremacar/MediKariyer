import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  User,
  Mail,
  Lock,
  Bell,
  FileText,
  Trash2,
  Pause,
  ChevronLeft,
} from 'lucide-react-native';
import { SettingsItem } from '../components/SettingsItem';
import { useSettings } from '../hooks/useSettings';

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { 
    handleLogout, 
    handleAccountAction, 
    navigateToSection 
  } = useSettings();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing.md }
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Kişisel Bilgiler */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          <View style={styles.divider} />
          <SettingsItem
            icon={<User size={20} color={colors.primary[600]} />}
            label="Kişisel Bilgiler"
            onPress={() => navigateToSection('Kişisel Bilgiler')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Mail size={20} color={colors.primary[600]} />}
            label="İletişim Bilgileri"
            onPress={() => navigateToSection('İletişim Bilgileri')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Lock size={20} color={colors.primary[600]} />}
            label="Şifre Değişikliği"
            onPress={() => navigateToSection('Şifre Değişikliği')}
          />
        </Card>

        {/* Bildirimler */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.divider} />
          <SettingsItem
            icon={<Bell size={20} color={colors.primary[600]} />}
            label="E-posta Bildirimleri"
            onPress={() => navigateToSection('E-posta Bildirimleri')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Bell size={20} color={colors.primary[600]} />}
            label="SMS Bildirimleri"
            onPress={() => navigateToSection('SMS Bildirimleri')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Bell size={20} color={colors.primary[600]} />}
            label="Uygulama Bildirimleri"
            onPress={() => navigateToSection('Uygulama Bildirimleri')}
          />
        </Card>

        {/* Veri Politikası */}
        <Card style={styles.section}>
          <SettingsItem
            icon={<FileText size={20} color={colors.primary[600]} />}
            label="Veri Politikası"
            onPress={() => navigateToSection('Veri Politikası')}
          />
        </Card>

        {/* Hesap İşlemleri */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>
          <View style={styles.divider} />
          <SettingsItem
            icon={<Pause size={20} color={colors.warning[600]} />}
            label="Hesabını Dondur"
            onPress={() => handleAccountAction('freeze')}
            danger={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Trash2 size={20} color={colors.error[600]} />}
            label="Hesabını Sil"
            onPress={() => handleAccountAction('delete')}
            danger={true}
          />
        </Card>

        {/* Çıkış Yap */}
        <View style={styles.logoutContainer}>
          <Button
            variant="primary"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Çıkış Yap
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.md,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutButton: {
    backgroundColor: colors.primary[600],
    width: '100%',
  },
});
