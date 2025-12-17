/**
 * @file ProfileEditScreen.tsx
 * @description Modern profil düzenleme ekranı
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useProfile, useUpdatePersonalInfo } from '../hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { getFullImageUrl } from '@/utils/imageUrl';
import { useToast } from '@/providers/ToastProvider';
import { toDateString, parseDateOnly } from '@/utils/date';

// Title options
const TITLE_OPTIONS: SelectOption[] = [
  { label: 'Dr', value: 'Dr' },
  { label: 'Uz.Dr', value: 'Uz.Dr' },
  { label: 'Dr.Öğr.Üyesi', value: 'Dr.Öğr.Üyesi' },
  { label: 'Doç.Dr', value: 'Doç.Dr' },
  { label: 'Prof.Dr', value: 'Prof.Dr' },
];

export const ProfileEditScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateMutation = useUpdatePersonalInfo();
  const { showToast } = useToast();

  // Lookup data
  const { data: specialties = [] } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: lookupService.getSpecialties,
    staleTime: 1000 * 60 * 30,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['lookup', 'cities'],
    queryFn: lookupService.getCities,
    staleTime: 1000 * 60 * 30,
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    specialty_id: undefined as number | undefined,
    subspecialty_id: undefined as number | undefined,
    phone: '',
    dob: undefined as Date | undefined,
    birth_place_id: undefined as number | undefined,
    residence_city_id: undefined as number | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        title: profile.title || '',
        specialty_id: profile.specialty_id || undefined,
        subspecialty_id: profile.subspecialty_id || undefined,
        phone: profile.phone || '',
        dob: parseDateOnly(profile.dob) || undefined,
        birth_place_id: profile.birth_place_id || undefined,
        residence_city_id: profile.residence_city_id || undefined,
      });
    }
  }, [profile]);

  // Get subspecialties for selected specialty
  const { data: subspecialties = [] } = useQuery({
    queryKey: ['lookup', 'subspecialties', formData.specialty_id],
    queryFn: () => lookupService.getSubspecialties(formData.specialty_id),
    enabled: !!formData.specialty_id,
    staleTime: 1000 * 60 * 30,
  });

  // Convert lookup data to select options
  const specialtyOptions: SelectOption[] = useMemo(
    () => specialties.map((s) => ({ label: s.name, value: s.id })),
    [specialties]
  );

  const subspecialtyOptions: SelectOption[] = useMemo(
    () => subspecialties.map((s) => ({ label: s.name, value: s.id })),
    [subspecialties]
  );

  const cityOptions: SelectOption[] = useMemo(
    () => cities.map((c) => ({ label: c.name, value: c.id })),
    [cities]
  );

  const birthPlaceOptions: SelectOption[] = useMemo(
    () => cities.map((c) => ({ label: c.name, value: c.id })),
    [cities]
  );

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ad zorunludur';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Soyad zorunludur';
    }

    if (!formData.title) {
      newErrors.title = 'Ünvan zorunludur';
    }

    if (!formData.specialty_id) {
      newErrors.specialty_id = 'Branş zorunludur';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) {
      showToast('Lütfen tüm zorunlu alanları doldurun', 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        title: formData.title,
        specialty_id: formData.specialty_id!,
        subspecialty_id: formData.subspecialty_id || null,
        phone: formData.phone || null,
        dob: toDateString(formData.dob),
        birth_place_id: formData.birth_place_id || null,
        residence_city_id: formData.residence_city_id || null,
      });
      
      showToast('Profil başarıyla güncellendi', 'success');
      navigation.goBack();
    } catch (err: any) {
      showToast(err.message || 'Profil güncellenirken bir hata oluştu', 'error');
    }
  };

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!profile) return false;
    
    const profileDob = toDateString(profile.dob);
    const formDob = toDateString(formData.dob);
    
    return (
      formData.first_name !== (profile.first_name || '') ||
      formData.last_name !== (profile.last_name || '') ||
      formData.title !== (profile.title || '') ||
      formData.specialty_id !== profile.specialty_id ||
      formData.subspecialty_id !== profile.subspecialty_id ||
      formData.phone !== (profile.phone || '') ||
      formData.birth_place_id !== profile.birth_place_id ||
      formData.residence_city_id !== profile.residence_city_id ||
      formDob !== profileDob
    );
  }, [formData, profile]);

  const renderContent = () => {
    if (!profile) return null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                <Ionicons name="person" size={40} color={colors.primary[600]} />
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => navigation.navigate('PhotoManagement')}
            >
              <Typography variant="body" style={styles.changePhotoText}>
                Fotoğrafı Değiştir
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Personal Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="person" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Kişisel Bilgiler
              </Typography>
            </View>

            <Card variant="outlined" padding="lg">
              <Input
                label="Ad *"
                placeholder="Adınızı giriniz"
                value={formData.first_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, first_name: text })
                }
                error={errors.first_name}
                autoCapitalize="words"
              />

              <Input
                label="Soyad *"
                placeholder="Soyadınızı giriniz"
                value={formData.last_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, last_name: text })
                }
                error={errors.last_name}
                autoCapitalize="words"
              />

              <View style={styles.formGroup}>
                <Typography variant="caption" style={styles.inputLabel}>
                  Ünvan *
                </Typography>
                <Select
                  options={TITLE_OPTIONS}
                  value={formData.title}
                  onChange={(value) =>
                    setFormData({ ...formData, title: value as string })
                  }
                  placeholder="Ünvan seçiniz"
                />
                {errors.title && (
                  <Typography variant="caption" style={styles.errorText}>
                    {errors.title}
                  </Typography>
                )}
              </View>
            </Card>
          </View>

          {/* Professional Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="briefcase" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Mesleki Bilgiler
              </Typography>
            </View>

            <Card variant="outlined" padding="lg">
              <View style={styles.formGroup}>
                <Typography variant="caption" style={styles.inputLabel}>
                  Branş *
                </Typography>
                <Select
                  options={specialtyOptions}
                  value={formData.specialty_id}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      specialty_id: value as number,
                      subspecialty_id: undefined, // Reset subspecialty
                    });
                  }}
                  placeholder="Branş seçiniz"
                  searchable
                />
                {errors.specialty_id && (
                  <Typography variant="caption" style={styles.errorText}>
                    {errors.specialty_id}
                  </Typography>
                )}
              </View>

              {formData.specialty_id && subspecialtyOptions.length > 0 && (
                <View style={styles.formGroup}>
                  <Typography variant="caption" style={styles.inputLabel}>
                    Yan Dal
                  </Typography>
                  <Select
                    options={subspecialtyOptions}
                    value={formData.subspecialty_id}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        subspecialty_id: value as number,
                      })
                    }
                    placeholder="Yan dal seçiniz (opsiyonel)"
                    searchable
                  />
                </View>
              )}
            </Card>
          </View>

          {/* Contact Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="call" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                İletişim Bilgileri
              </Typography>
            </View>

            <Card variant="outlined" padding="lg">
              <Input
                label="E-posta"
                placeholder={user?.email || 'E-posta'}
                value={user?.email || ''}
                editable={false}
                style={styles.disabledInput}
              />

              <Input
                label="Telefon"
                placeholder="Telefon numaranızı giriniz"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </Card>
          </View>

          {/* Location & Birth Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="location" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Konum ve Doğum Bilgileri
              </Typography>
            </View>

            <Card variant="outlined" padding="lg">
              <View style={styles.formGroup}>
                <Typography variant="caption" style={styles.inputLabel}>
                  İkamet Şehri
                </Typography>
                <Select
                  options={cityOptions}
                  value={formData.residence_city_id}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      residence_city_id: value as number,
                    })
                  }
                  placeholder="Şehir seçiniz"
                  searchable
                />
              </View>

              <View style={styles.formGroup}>
                <Typography variant="caption" style={styles.inputLabel}>
                  Doğum Yeri
                </Typography>
                <Select
                  options={birthPlaceOptions}
                  value={formData.birth_place_id}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      birth_place_id: value as number,
                    })
                  }
                  placeholder="Doğum yeri seçiniz"
                  searchable
                />
              </View>

              <View style={styles.formGroup}>
                <DatePicker
                  label="Doğum Tarihi"
                  placeholder="Doğum tarihinizi seçin"
                  value={formData.dob}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  maximumDate={new Date()}
                />
              </View>
            </Card>
          </View>

          {/* Additional Profile Sections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="document-text" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Ek Bilgiler
              </Typography>
            </View>

            <Card variant="outlined" padding="md">
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Experience')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.primary[50] }]}>
                    <Ionicons name="briefcase" size={20} color={colors.primary[600]} />
                  </View>
                  <Typography variant="body" style={styles.menuItemText}>
                    Deneyimler
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Education')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.success[50] }]}>
                    <Ionicons name="school" size={20} color={colors.success[600]} />
                  </View>
                  <Typography variant="body" style={styles.menuItemText}>
                    Eğitim
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Languages')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.secondary[50] }]}>
                    <Ionicons name="language" size={20} color={colors.secondary[600]} />
                  </View>
                  <Typography variant="body" style={styles.menuItemText}>
                    Diller
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Certificates')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.warning[50] }]}>
                    <Ionicons name="ribbon" size={20} color={colors.warning[600]} />
                  </View>
                  <Typography variant="body" style={styles.menuItemText}>
                    Sertifikalar
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Info Note */}
          {hasChanges && (
            <Card variant="outlined" padding="md" style={styles.infoCard}>
              <Typography variant="caption" style={styles.infoText}>
                💡 Değişikliklerinizi kaydetmeyi unutmayın
              </Typography>
            </Card>
          )}

          {/* Save Button */}
          <Button
            label="Değişiklikleri Kaydet"
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={updateMutation.isPending}
            disabled={!hasChanges || updateMutation.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Form
  formGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error[600],
    fontSize: 12,
    marginTop: spacing.xs,
  },
  disabledInput: {
    backgroundColor: colors.neutral[100],
    color: colors.text.tertiary,
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

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
});

export default ProfileEditScreen;
