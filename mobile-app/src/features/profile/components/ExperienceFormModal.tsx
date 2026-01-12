/**
 * @file ExperienceFormModal.tsx
 * @description Deneyim ekleme/düzenleme modal formu
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖZELLİKLER:**
 * - Pozisyon, kurum, uzmanlık, tarih aralığı girişi
 * - "Halen çalışıyorum" checkbox desteği
 * - Form validasyonu
 * - Lookup data ile uzmanlık seçimi
 * - DatePicker ile tarih seçimi
 * - Ekleme ve güncelleme işlemleri
 * - Navigation screen olarak çalışır (modal değil)
 * 
 * **FORM ALANLARI:**
 * - Pozisyon/Ünvan (zorunlu)
 * - Kurum Adı (zorunlu)
 * - Uzmanlık Alanı (zorunlu, dropdown)
 * - Başlangıç Tarihi (zorunlu, date picker)
 * - Bitiş Tarihi (opsiyonel, "halen çalışıyorum" varsa gizli)
 * - Halen Çalışıyorum (checkbox)
 * 
 * **NOT:** Root-level BottomSheetModalProvider kullanır (App.tsx)
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { colors, spacing } from '@/theme';
import { useSpecialties } from '@/hooks/useLookup';
import { useExperience } from '@/features/profile/hooks/useExperiences';
import { toDateString, parseDateOnly } from '@/utils/date';
import type { DoctorExperience, CreateExperiencePayload, UpdateExperiencePayload } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type ExperienceFormModalRouteProp = RouteProp<ProfileStackParamList, 'ExperienceFormModal'>;
type ExperienceFormModalNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ExperienceFormModal'>;

interface ExperienceFormModalProps {
  onSubmit?: (data: CreateExperiencePayload | UpdateExperiencePayload) => void;
  isLoading?: boolean;
}

export const ExperienceFormModal: React.FC<ExperienceFormModalProps> = ({
  onSubmit: onSubmitProp,
  isLoading: isLoadingProp = false,
}) => {
  const navigation = useNavigation<ExperienceFormModalNavigationProp>();
  const route = useRoute<ExperienceFormModalRouteProp>();
  const experience = route.params?.experience;

  const { data: specialties = [], isLoading: isLoadingSpecialties } = useSpecialties();
  const experienceMutations = useExperience();
  
  // Combined loading state
  const isLoading = isLoadingProp || experienceMutations.create.isPending || experienceMutations.update.isPending;

  const [formData, setFormData] = useState({
    role_title: '',
    organization: '',
    specialty_id: 0,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    is_current: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const specialtyOptions: SelectOption[] = useMemo(() => {
    return specialties.map((specialty) => ({
      label: specialty.name,
      value: specialty.id.toString(),
    }));
  }, [specialties]);

  useEffect(() => {
    if (experience) {
      setFormData({
        role_title: experience.role_title || '',
        organization: experience.organization || '',
        specialty_id: experience.specialty_id || 0,
        start_date: parseDateOnly(experience.start_date) || undefined,
        end_date: parseDateOnly(experience.end_date) || undefined,
        is_current: experience.is_current || false,
      });
    } else {
      setFormData({
        role_title: '',
        organization: '',
        specialty_id: 0,
        start_date: undefined,
        end_date: undefined,
        is_current: false,
      });
    }
    setErrors({});
  }, [experience]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.role_title.trim()) {
      newErrors.role_title = 'Pozisyon adı zorunludur';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Kurum adı zorunludur';
    }

    if (!formData.specialty_id || formData.specialty_id === 0) {
      newErrors.specialty = 'Uzmanlık alanı zorunludur';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Başlangıç tarihi zorunludur';
    }

    if (!formData.is_current && !formData.end_date) {
      newErrors.end_date = 'Bitiş tarihi zorunludur veya "Devam ediyor" işaretleyin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: CreateExperiencePayload = {
      role_title: formData.role_title,
      organization: formData.organization,
      specialty_id: formData.specialty_id,
      start_date: toDateString(formData.start_date) || '',
      end_date: formData.is_current ? null : toDateString(formData.end_date),
      is_current: formData.is_current,
    };

    // If external onSubmit provided, use it (for testing/custom handling)
    if (onSubmitProp) {
      onSubmitProp(payload);
      return;
    }

    // Use internal mutation hooks
    if (experience?.id) {
      // Update existing experience
      experienceMutations.update.mutate(
        { id: experience.id, data: payload },
        { onSuccess: () => navigation.goBack() }
      );
    } else {
      // Create new experience
      experienceMutations.create.mutate(payload, {
        onSuccess: () => navigation.goBack(),
      });
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  /**
   * ExperienceFormScreen - Experience form as navigation screen
   * 
   * NOTE: No local BottomSheetModalProvider needed.
   * The root-level provider in App.tsx handles all BottomSheetModal components.
   */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="h2" style={styles.title}>
            {experience ? 'Deneyim Düzenle' : 'Yeni Deneyim Ekle'}
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Pozisyon / Ünvan *"
            placeholder="Örn: Uzman Doktor"
            value={formData.role_title}
            onChangeText={(text) => setFormData({ ...formData, role_title: text })}
            error={errors.role_title}
          />

          <Input
            label="Kurum Adı *"
            placeholder="Hastane veya kurum adı"
            value={formData.organization}
            onChangeText={(text) => setFormData({ ...formData, organization: text })}
            error={errors.organization}
          />

          <View style={styles.formGroup}>
            <Typography variant="caption" style={styles.label}>
              Uzmanlık Alanı *
            </Typography>
            {isLoadingSpecialties ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.loadingText}>
                  Yükleniyor...
                </Typography>
              </View>
            ) : (
              <Select
                options={specialtyOptions}
                value={formData.specialty_id.toString()}
                onChange={(value) =>
                  setFormData({ ...formData, specialty_id: parseInt(value as string) })
                }
                placeholder="Uzmanlık alanı seçiniz"
              />
            )}
            {errors.specialty && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.specialty}
              </Typography>
            )}
          </View>

          <View style={styles.formGroup}>
            <DatePicker
              label="Başlangıç Tarihi *"
              placeholder="Başlangıç tarihini seçin"
              value={formData.start_date}
              onChange={(date) => setFormData({ ...formData, start_date: date })}
              maximumDate={new Date()}
            />
            {errors.start_date && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.start_date}
              </Typography>
            )}
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFormData({ ...formData, is_current: !formData.is_current })}
          >
            <View style={[styles.checkbox, formData.is_current && styles.checkboxChecked]}>
              {formData.is_current && (
                <Ionicons name="checkmark" size={16} color={colors.background.primary} />
              )}
            </View>
            <Typography variant="body" style={styles.checkboxLabel}>
              Halen bu pozisyonda çalışıyorum
            </Typography>
          </TouchableOpacity>

          {!formData.is_current && (
            <View style={styles.formGroup}>
              <DatePicker
                label="Bitiş Tarihi"
                placeholder="Bitiş tarihini seçin"
                value={formData.end_date}
                onChange={(date) => setFormData({ ...formData, end_date: date })}
                maximumDate={new Date()}
              />
              {errors.end_date && (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.end_date}
                </Typography>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="İptal"
            variant="outline"
            onPress={handleClose}
            style={styles.cancelButton}
            size="lg"
          />
          <Button
            label={experience ? 'Güncelle' : 'Ekle'}
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error[600],
    fontSize: 12,
    marginTop: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    flex: 1,
    minHeight: 56,
  },
  submitButton: {
    flex: 1.5,
    minHeight: 56,
  },
});
