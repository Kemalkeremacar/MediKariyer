import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import {
  Box,
  VStack,
  HStack,
  Icon,
  Divider,
} from '@gluestack-ui/themed';
import {
  User,
  Mail,
  Lock,
  Bell,
  FileText,
  LogOut,
  Trash2,
  Pause,
  ChevronRight,
} from 'lucide-react-native';

type SettingsItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
};

const SettingsItem = ({
  icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
}: SettingsItemProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <HStack
      justifyContent="space-between"
      alignItems="center"
      py="$3"
      px="$4"
    >
      <HStack space="md" alignItems="center" flex={1}>
        <Box
          w={40}
          h={40}
          borderRadius="$lg"
          bg={danger ? colors.error[50] : colors.primary[50]}
          justifyContent="center"
          alignItems="center"
        >
          {icon}
        </Box>
        <Typography
          variant="body"
          style={[styles.settingsLabel, danger && styles.dangerText]}
        >
          {label}
        </Typography>
      </HStack>
      {showChevron && (
        <Icon
          as={ChevronRight}
          size="sm"
          color={danger ? colors.error[600] : colors.neutral[400]}
        />
      )}
    </HStack>
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation will handle redirect to auth
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm verilerin kalıcı olarak silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Bilgi', 'Hesap silme özelliği yakında eklenecek.');
          },
        },
      ],
    );
  };

  const handleFreezeAccount = () => {
    Alert.alert(
      'Hesabı Dondur',
      'Hesabını dondurduğunda profil görünmez olacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Dondur',
          onPress: () => {
            // TODO: Implement account freeze
            Alert.alert('Bilgi', 'Hesap dondurma özelliği yakında eklenecek.');
          },
        },
      ],
    );
  };

  return (
    <Box flex={1} bg="$backgroundLight50">
      {/* Header */}
      <Box
        bg="$white"
        px="$4"
        pt={insets.top + spacing.md}
        pb="$3"
        style={styles.header}
      >
        <HStack alignItems="center" space="md">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon as={ChevronRight} size="lg" color="$textDark900" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Typography variant="heading">Ayarlar</Typography>
        </HStack>
      </Box>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Kişisel Bilgiler */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="subtitle" style={styles.sectionTitle}>
            Kişisel Bilgiler
          </Typography>
          <Divider bg="$coolGray100" my="$2" />
          <SettingsItem
            icon={<User size={20} color={colors.primary[600]} />}
            label="Kişisel Bilgiler"
            onPress={() => {
              // TODO: Navigate to personal info edit
            }}
          />
          <Divider bg="$coolGray100" />
          <SettingsItem
            icon={<Mail size={20} color={colors.primary[600]} />}
            label="İletişim Bilgileri"
            onPress={() => {
              // TODO: Navigate to contact info edit
            }}
          />
          <Divider bg="$coolGray100" />
          <SettingsItem
            icon={<Lock size={20} color={colors.primary[600]} />}
            label="Şifre Değişikliği"
            onPress={() => {
              // TODO: Navigate to password change
            }}
          />
        </Card>

        {/* Bildirimler */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="subtitle" style={styles.sectionTitle}>
            Bildirimler
          </Typography>
          <Divider bg="$coolGray100" my="$2" />
          <SettingsItem
            icon={<Bell size={20} color={colors.primary[600]} />}
            label="E-posta Bildirimleri"
            onPress={() => {
              // TODO: Navigate to email notifications
            }}
          />
          <Divider bg="$coolGray100" />
          <SettingsItem
            icon={<Bell size={20} color={colors.primary[600]} />}
            label="SMS Bildirimleri"
            onPress={() => {
              // TODO: Navigate to SMS notifications
            }}
          />
          <Divider bg="$coolGray100" />
          <SettingsItem
            icon={<Bell size={20} color={colors.primary[600]} />}
            label="Uygulama Bildirimleri"
            onPress={() => {
              // TODO: Navigate to app notifications
            }}
          />
        </Card>

        {/* Veri Politikası */}
        <Card variant="elevated" style={styles.section}>
          <SettingsItem
            icon={<FileText size={20} color={colors.primary[600]} />}
            label="Veri Politikası"
            onPress={() => {
              // TODO: Open data policy
            }}
          />
        </Card>

        {/* Hesap İşlemleri */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="subtitle" style={styles.sectionTitle}>
            Hesap İşlemleri
          </Typography>
          <Divider bg="$coolGray100" my="$2" />
          <SettingsItem
            icon={<Pause size={20} color={colors.warning[600]} />}
            label="Hesabını Dondur"
            onPress={handleFreezeAccount}
            danger={false}
          />
          <Divider bg="$coolGray100" />
          <SettingsItem
            icon={<Trash2 size={20} color={colors.error[600]} />}
            label="Hesabını Sil"
            onPress={handleDeleteAccount}
            danger={true}
          />
        </Card>

        {/* Çıkış Yap */}
        <Box px="$4" py="$3">
          <Button
            label="Çıkış Yap"
            variant="primary"
            onPress={handleLogout}
            fullWidth
            style={styles.logoutButton}
          />
        </Box>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
    color: colors.neutral[700],
  },
  settingsLabel: {
    fontWeight: '500',
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.error[600],
  },
  logoutButton: {
    backgroundColor: colors.primary[600],
  },
});

