import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { colors, spacing } from '@/theme';
import { useEducationTypes } from '@/hooks/useLookup';
import type { DoctorEducation, CreateEducationPayload, UpdateEducationPayload } from '@/types/profile';

interface EducationFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEducationPayload | UpdateEducationPayload) => void;
  education?: DoctorEducation | null;
  isLoading?: boolean;
}

export const EducationFormModal: React.FC<EducationFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  education,
  isLoading = false,
}) => {
  const { data: educationTypes = [], isLoading: isLoadingTypes } = useEducationTypes();

  const [formData, setFormData] = useState({
    education_type_id: 0,
    education_type: '',
    education_institution: '',
    field: '',
    graduation_year: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const educationTypeOptions: SelectOption[] = useMemo(() => {
    return educationTypes.map((type) => ({
      label: type.name,
      value: type.id.toString(),
    }));
  }, [educationTypes]);

  useEffect(() => {
    if (education) {
      setFormData({
        education_type_id: education.education_type_id || 0,
        education_type: education.education_type || '',
        education_institution: education.education_institution || '',
        field: education.field || '',
        graduation_year: education.graduation_year?.toString() || '',
      });
    } else {
      setFormData({
        education_type_id: 0,
        education_type: '',
        education_institution: '',
        field: '',
        graduation_year: '',
      });
    }
    setErrors({});
  }, [education, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.education_type_id || formData.education_type_id === 0) {
      newErrors.education_type = 'Eğitim türü zorunludur';
    }

    if (!formData.education_institution.trim()) {
      newErrors.education_institution = 'Kurum adı zorunludur';
    }

    if (!formData.field.trim()) {
      newErrors.field = 'Alan / Bölüm zorunludur';
    }

    if (!formData.graduation_year || !formData.graduation_year.trim()) {
      newErrors.graduation_year = 'Mezuniyet yılı zorunludur';
    } else if (!/^\d{4}$/.test(formData.graduation_year)) {
      newErrors.graduation_year = 'Geçerli bir yıl giriniz (örn: 2020)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const selectedType = educationTypes.find((t) => t.id === formData.education_type_id);

    const payload: any = {
      education_type_id: formData.education_type_id,
      education_type: selectedType?.name || formData.education_type,
      education_institution: formData.education_institution,
      field: formData.field || '',
      graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : new Date().getFullYear(),
    };

    onSubmit(payload);
  };

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="h2" style={styles.title}>
            {education ? 'Eğitim Düzenle' : 'Yeni Eğitim Ekle'}
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Typography variant="caption" style={styles.label}>
              Eğitim Türü *
            </Typography>
            {isLoadingTypes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.loadingText}>
                  Yükleniyor...
                </Typography>
              </View>
            ) : (
              <Select
                options={educationTypeOptions}
                value={formData.education_type_id.toString()}
                onChange={(value) => {
                  const typeId = parseInt(value as string);
                  const selectedType = educationTypes.find((t) => t.id === typeId);
                  setFormData({
                    ...formData,
                    education_type_id: typeId,
                    education_type: selectedType?.name || '',
                  });
                }}
                placeholder="Eğitim türü seçiniz"
              />
            )}
            {errors.education_type && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.education_type}
              </Typography>
            )}
          </View>

          <Input
            label="Kurum Adı *"
            placeholder="Üniversite veya kurum adı"
            value={formData.education_institution}
            onChangeText={(text) =>
              setFormData({ ...formData, education_institution: text })
            }
            error={errors.education_institution}
          />

          <Input
            label="Alan / Bölüm *"
            placeholder="Örn: Tıp, Kardiyoloji"
            value={formData.field}
            onChangeText={(text) => setFormData({ ...formData, field: text })}
            error={errors.field}
          />

          <Input
            label="Mezuniyet Yılı *"
            placeholder="Örn: 2020"
            value={formData.graduation_year}
            onChangeText={(text) =>
              setFormData({ ...formData, graduation_year: text })
            }
            error={errors.graduation_year}
            keyboardType="number-pad"
            maxLength={4}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="İptal"
            variant="outline"
            onPress={onClose}
            style={styles.cancelButton}
            size="lg"
          />
          <Button
            label={education ? 'Güncelle' : 'Ekle'}
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  label: {
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
