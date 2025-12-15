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
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { colors, spacing } from '@/theme';
import { useLanguages, useLanguageLevels } from '@/hooks/useLookup';
import type { DoctorLanguage, CreateLanguagePayload, UpdateLanguagePayload } from '@/types/profile';

interface LanguageFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLanguagePayload | UpdateLanguagePayload) => void;
  language?: DoctorLanguage | null;
  isLoading?: boolean;
}

export const LanguageFormModal: React.FC<LanguageFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  language,
  isLoading = false,
}) => {
  const { data: languages = [], isLoading: isLoadingLanguages } = useLanguages();
  const { data: levels = [], isLoading: isLoadingLevels } = useLanguageLevels();

  const [formData, setFormData] = useState({
    language_id: 0,
    level_id: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const languageOptions: SelectOption[] = useMemo(() => {
    return languages.map((lang) => ({
      label: lang.name,
      value: lang.id.toString(),
    }));
  }, [languages]);

  const levelOptions: SelectOption[] = useMemo(() => {
    return levels.map((level) => ({
      label: level.name,
      value: level.id.toString(),
    }));
  }, [levels]);

  useEffect(() => {
    if (language) {
      console.log('📝 Editing language:', {
        id: language.id,
        language_id: language.language_id,
        level_id: language.level_id,
        language: language.language,
        level: language.level,
      });
      setFormData({
        language_id: language.language_id || 0,
        level_id: language.level_id || 0,
      });
    } else {
      setFormData({
        language_id: 0,
        level_id: 0,
      });
    }
    setErrors({});
  }, [language, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.language_id || formData.language_id === 0) {
      newErrors.language = 'Dil seçimi zorunludur';
    }

    if (!formData.level_id || formData.level_id === 0) {
      newErrors.level = 'Seviye seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: any = {
      language_id: formData.language_id,
      level_id: formData.level_id,
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
            {language ? 'Dil Düzenle' : 'Yeni Dil Ekle'}
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
              Dil *
            </Typography>
            {isLoadingLanguages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.loadingText}>
                  Yükleniyor...
                </Typography>
              </View>
            ) : (
              <Select
                options={languageOptions}
                value={formData.language_id > 0 ? formData.language_id.toString() : undefined}
                onChange={(value) => {
                  console.log('🔄 Language changed:', value);
                  setFormData({ ...formData, language_id: parseInt(value as string) });
                }}
                placeholder="Dil seçiniz"
              />
            )}
            {errors.language && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.language}
              </Typography>
            )}
          </View>

          <View style={styles.formGroup}>
            <Typography variant="caption" style={styles.label}>
              Seviye *
            </Typography>
            {isLoadingLevels ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.loadingText}>
                  Yükleniyor...
                </Typography>
              </View>
            ) : (
              <Select
                options={levelOptions}
                value={formData.level_id > 0 ? formData.level_id.toString() : undefined}
                onChange={(value) =>
                  setFormData({ ...formData, level_id: parseInt(value as string) })
                }
                placeholder="Seviye seçiniz"
              />
            )}
            {errors.level && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.level}
              </Typography>
            )}
          </View>
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
            label={language ? 'Güncelle' : 'Ekle'}
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
