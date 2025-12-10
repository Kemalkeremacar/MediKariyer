import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { DatePicker } from '@/components/ui/DatePicker';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { getFullImageUrl } from '@/utils/imageUrl';

export const ProfileEditScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, error, refetch } = useProfile();

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    birthDate: undefined as Date | undefined,
  });

  const handleSave = () => {
    Alert.alert('Yakında', 'Profil güncelleme özelliği yakında eklenecek', [
      {
        text: 'Tamam',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const renderContent = () => {
    if (!profile) return null;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Typography variant="h3" style={styles.headerTitle}>
            Profili Düzenle
          </Typography>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {profile.profile_photo ? (
              <Image 
                source={{ uri: getFullImageUrl(profile.profile_photo) || undefined }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <User size={40} color={colors.primary[600]} />
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={() => {
              navigation.navigate('PhotoManagement');
            }}
          >
            <Typography variant="body" style={styles.changePhotoText}>
              Fotoğrafı Değiştir
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Kişisel Bilgiler
          </Typography>

          <Card variant="outlined" style={styles.cardNoPadding}>
            {/* First Name */}
            <View style={styles.formItem}>
              <View style={styles.formIconContainer}>
                <User size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.formContent}>
                <Typography variant="caption" style={styles.formLabel}>
                  Ad
                </Typography>
                <Typography variant="body" style={styles.formValue}>
                  {formData.firstName || 'Belirtilmemiş'}
                </Typography>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Last Name */}
            <View style={styles.formItem}>
              <View style={styles.formIconContainer}>
                <User size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.formContent}>
                <Typography variant="caption" style={styles.formLabel}>
                  Soyad
                </Typography>
                <Typography variant="body" style={styles.formValue}>
                  {formData.lastName || 'Belirtilmemiş'}
                </Typography>
              </View>
            </View>
          </Card>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            İletişim Bilgileri
          </Typography>

          <Card variant="outlined" style={styles.cardNoPadding}>
            {/* Email */}
            <View style={styles.formItem}>
              <View style={styles.formIconContainer}>
                <Mail size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.formContent}>
                <Typography variant="caption" style={styles.formLabel}>
                  E-posta
                </Typography>
                <Typography variant="body" style={styles.formValue}>
                  {formData.email || 'Belirtilmemiş'}
                </Typography>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Phone */}
            <View style={styles.formItem}>
              <View style={styles.formIconContainer}>
                <Phone size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.formContent}>
                <Typography variant="caption" style={styles.formLabel}>
                  Telefon
                </Typography>
                <Typography variant="body" style={styles.formValue}>
                  {formData.phone || 'Belirtilmemiş'}
                </Typography>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Location */}
            <View style={styles.formItem}>
              <View style={styles.formIconContainer}>
                <MapPin size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.formContent}>
                <Typography variant="caption" style={styles.formLabel}>
                  Konum
                </Typography>
                <Typography variant="body" style={styles.formValue}>
                  {profile.residence_city_name || 'Belirtilmemiş'}
                </Typography>
              </View>
            </View>
          </Card>
        </View>

        {/* Birth Date Section */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Doğum Tarihi
          </Typography>

          <DatePicker
            label="Doğum Tarihi"
            placeholder="Doğum tarihinizi seçin"
            value={formData.birthDate}
            onChange={(date) => setFormData({ ...formData, birthDate: date })}
            maximumDate={new Date()}
          />
        </View>

        {/* Info Note */}
        <Card variant="outlined" padding="md" style={styles.infoCard}>
          <Typography variant="caption" style={styles.infoText}>
            💡 Profil düzenleme özellikleri yakında aktif olacak. Şu an sadece mevcut bilgilerinizi görüntüleyebilirsiniz.
          </Typography>
        </Card>

        {/* Save Button */}
        <Button
          label="Değişiklikleri Kaydet"
          onPress={handleSave}
          fullWidth
          size="lg"
        />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary[200],
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  changePhotoText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 14,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Form Item
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  formIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    flex: 1,
  },
  formLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 2,
  },
  formValue: {
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

  // Info Card
  infoCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
    marginBottom: spacing.xl,
  },
  infoText: {
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default ProfileEditScreen;
