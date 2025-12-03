import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, shadows, spacing, borderRadius, typography } from '@/theme';
import type {
  DoctorEducation,
  DoctorExperience,
  DoctorCertificate,
  DoctorLanguage,
  CreateEducationPayload,
  CreateExperiencePayload,
  CreateCertificatePayload,
  CreateLanguagePayload,
} from '@/types/profile';
import type {
  EducationType,
  Language,
  LanguageLevel,
  Specialty,
  Subspecialty,
} from '@/types/lookup';

type FormType = 'education' | 'experience' | 'certificate' | 'language';

interface ProfileFormModalProps {
  visible: boolean;
  type: FormType;
  data?: DoctorEducation | DoctorExperience | DoctorCertificate | DoctorLanguage | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  educationTypes?: EducationType[];
  specialties?: Specialty[];
  subspecialties?: Subspecialty[];
  languages?: Language[];
  languageLevels?: LanguageLevel[];
}

export const ProfileFormModal: React.FC<ProfileFormModalProps> = ({
  visible,
  type,
  data,
  onClose,
  onSubmit,
  isLoading = false,
  educationTypes = [],
  specialties = [],
  subspecialties = [],
  languages = [],
  languageLevels = [],
}) => {
  const [formData, setFormData] = useState<any>({});
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered subspecialties based on selected specialty
  const filteredSubspecialties = selectedSpecialtyId
    ? subspecialties.filter((sub) => sub.specialty_id === selectedSpecialtyId)
    : [];

  // Initialize form data
  useEffect(() => {
    if (visible) {
      if (data) {
        // Edit mode - populate with existing data
        setFormData(data);
        if (type === 'experience' && (data as DoctorExperience).specialty_id) {
          setSelectedSpecialtyId((data as DoctorExperience).specialty_id);
        }
      } else {
        // Create mode - initialize empty form
        const initialData: any = {};
        switch (type) {
          case 'education':
            initialData.education_type_id = '';
            initialData.education_institution = '';
            initialData.field = '';
            initialData.graduation_year = '';
            initialData.education_type = '';
            break;
          case 'experience':
            initialData.organization = '';
            initialData.role_title = '';
            initialData.specialty_id = '';
            initialData.subspecialty_id = '';
            initialData.start_date = '';
            initialData.end_date = '';
            initialData.is_current = false;
            initialData.description = '';
            break;
          case 'certificate':
            initialData.certificate_name = '';
            initialData.institution = '';
            initialData.certificate_year = '';
            break;
          case 'language':
            initialData.language_id = '';
            initialData.level_id = '';
            break;
        }
        setFormData(initialData);
        setSelectedSpecialtyId(null);
      }
      setErrors({});
    }
  }, [visible, data, type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (type) {
      case 'education':
        if (!formData.education_type_id) {
          newErrors.education_type_id = 'Eğitim türü seçilmelidir';
        }
        if (!formData.education_institution?.trim()) {
          newErrors.education_institution = 'Eğitim kurumu gereklidir';
        }
        if (!formData.field?.trim()) {
          newErrors.field = 'Alan gereklidir';
        }
        if (!formData.graduation_year) {
          newErrors.graduation_year = 'Mezuniyet yılı gereklidir';
        } else {
          const year = Number(formData.graduation_year);
          if (year < 1950 || year > new Date().getFullYear() + 5) {
            newErrors.graduation_year = 'Geçerli bir yıl giriniz';
          }
        }
        // Check if "Diğer" is selected (ID: 4)
        const selectedType = educationTypes.find(
          (t) => t.id === Number(formData.education_type_id),
        );
        if (selectedType && (selectedType.id === 4 || selectedType.name === 'Diğer')) {
          if (!formData.education_type?.trim()) {
            newErrors.education_type = 'Özel derece türü gereklidir';
          }
        }
        break;
      case 'experience':
        if (!formData.organization?.trim()) {
          newErrors.organization = 'Kurum gereklidir';
        }
        if (!formData.role_title?.trim()) {
          newErrors.role_title = 'Ünvan gereklidir';
        }
        if (!formData.specialty_id) {
          newErrors.specialty_id = 'Uzmanlık alanı seçilmelidir';
        }
        if (!formData.start_date) {
          newErrors.start_date = 'Başlangıç tarihi gereklidir';
        }
        if (formData.is_current && formData.end_date) {
          newErrors.end_date = 'Halen çalışıyorsanız bitiş tarihi boş olmalıdır';
        }
        if (!formData.is_current && !formData.end_date) {
          newErrors.end_date = 'Bitiş tarihi gereklidir';
        }
        if (
          formData.start_date &&
          formData.end_date &&
          new Date(formData.end_date) < new Date(formData.start_date)
        ) {
          newErrors.end_date = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
        }
        break;
      case 'certificate':
        if (!formData.certificate_name?.trim()) {
          newErrors.certificate_name = 'Sertifika türü gereklidir';
        }
        if (!formData.institution?.trim()) {
          newErrors.institution = 'Kurum gereklidir';
        }
        if (!formData.certificate_year) {
          newErrors.certificate_year = 'Sertifika yılı gereklidir';
        } else {
          const year = Number(formData.certificate_year);
          if (year < 1950 || year > new Date().getFullYear()) {
            newErrors.certificate_year = 'Geçerli bir yıl giriniz';
          }
        }
        break;
      case 'language':
        if (!formData.language_id) {
          newErrors.language_id = 'Dil seçilmelidir';
        }
        if (!formData.level_id) {
          newErrors.level_id = 'Seviye seçilmelidir';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare payload based on type
      let payload: any = { ...formData };

      // Convert string IDs to numbers
      if (type === 'education') {
        payload.education_type_id = Number(payload.education_type_id);
        payload.graduation_year = Number(payload.graduation_year);
        if (!payload.education_type) {
          payload.education_type = null;
        }
      } else if (type === 'experience') {
        payload.specialty_id = Number(payload.specialty_id);
        payload.subspecialty_id = payload.subspecialty_id
          ? Number(payload.subspecialty_id)
          : null;
        if (payload.is_current) {
          payload.end_date = null;
        }
        if (!payload.description) {
          payload.description = null;
        }
      } else if (type === 'certificate') {
        payload.certificate_year = Number(payload.certificate_year);
      } else if (type === 'language') {
        payload.language_id = Number(payload.language_id);
        payload.level_id = Number(payload.level_id);
      }

      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Form gönderilirken bir hata oluştu');
    }
  };

  const getTitle = () => {
    const titles = {
      education: 'Eğitim',
      experience: 'Deneyim',
      certificate: 'Sertifika',
      language: 'Dil',
    };
    return data ? `${titles[type]} Düzenle` : `Yeni ${titles[type]} Ekle`;
  };

  const renderField = (fieldName: string, label: string, required: boolean = false) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={String(value)}
          onChangeText={(text) => setFormData({ ...formData, [fieldName]: text })}
          placeholder={`${label} giriniz`}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const renderSelectField = (
    fieldName: string,
    label: string,
    options: any[],
    required: boolean = false,
    disabled: boolean = false,
  ) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={[styles.pickerContainer, disabled && styles.pickerDisabled]}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              const newData = { ...formData, [fieldName]: itemValue };
              if (fieldName === 'specialty_id') {
                setSelectedSpecialtyId(itemValue ? Number(itemValue) : null);
                newData.subspecialty_id = ''; // Reset subspecialty when specialty changes
              }
              setFormData(newData);
            }}
            enabled={!disabled}
            style={styles.picker}
          >
            <Picker.Item label="Seçiniz" value="" key={`${type}-option-select`} />
            {options.map((option, index) => (
              <Picker.Item
                key={`${type}-option-${option.id || option.value || index}`}
                label={option.name || option.label || String(option)}
                value={String(option.id || option.value || option)}
              />
            ))}
          </Picker>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const renderDateField = (
    fieldName: string,
    label: string,
    required: boolean = false,
    disabled: boolean = false,
    minDate?: string,
  ) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, error && styles.inputError, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [fieldName]: text })}
          placeholder="YYYY-MM-DD"
          editable={!disabled}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const renderNumberField = (
    fieldName: string,
    label: string,
    required: boolean = false,
    min?: number,
    max?: number,
  ) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={String(value)}
          onChangeText={(text) => {
            const numValue = text.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [fieldName]: numValue });
          }}
          keyboardType="numeric"
          placeholder={`${label} giriniz`}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const renderTextArea = (
    fieldName: string,
    label: string,
    required: boolean = false,
  ) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.textArea, error && styles.inputError]}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [fieldName]: text })}
          placeholder={`${label} giriniz`}
          multiline
          numberOfLines={4}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const renderSwitch = (fieldName: string, label: string) => {
    const value = formData[fieldName] || false;

    return (
      <View style={styles.switchContainer}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={value}
          onValueChange={(newValue) => {
            const newData = { ...formData, [fieldName]: newValue };
            if (newValue) {
              newData.end_date = null; // Clear end_date when is_current is true
            }
            setFormData(newData);
          }}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {type === 'education' && (
            <>
              {renderSelectField(
                'education_type_id',
                'Eğitim Türü',
                educationTypes,
                true,
              )}
              {(() => {
                const selectedType = educationTypes.find(
                  (t) => t.id === Number(formData.education_type_id),
                );
                const isOtherType =
                  selectedType && (selectedType.id === 4 || selectedType.name === 'Diğer');
                return isOtherType
                  ? renderField('education_type', 'Özel Derece Türü', true)
                  : null;
              })()}
              {renderField('education_institution', 'Eğitim Kurumu', true)}
              {renderField('field', 'Alan', true)}
              {renderNumberField('graduation_year', 'Mezuniyet Yılı', true, 1950, new Date().getFullYear() + 5)}
            </>
          )}

          {type === 'experience' && (
            <>
              {renderField('organization', 'Kurum', true)}
              {renderField('role_title', 'Ünvan', true)}
              {renderSelectField(
                'specialty_id',
                'Uzmanlık Alanı',
                specialties,
                true,
              )}
              {renderSelectField(
                'subspecialty_id',
                'Yan Dal Uzmanlığı',
                filteredSubspecialties,
                false,
                !selectedSpecialtyId || filteredSubspecialties.length === 0,
              )}
              {renderDateField('start_date', 'Başlangıç Tarihi', true)}
              {renderSwitch('is_current', 'Halen Çalışıyor')}
              {renderDateField(
                'end_date',
                'Bitiş Tarihi',
                !formData.is_current,
                formData.is_current,
                formData.start_date,
              )}
              {renderTextArea('description', 'Açıklama', false)}
            </>
          )}

          {type === 'certificate' && (
            <>
              {renderField('certificate_name', 'Sertifika Türü', true)}
              {renderField('institution', 'Kurum', true)}
              {renderNumberField('certificate_year', 'Sertifika Yılı', true, 1950, new Date().getFullYear())}
            </>
          )}

          {type === 'language' && (
            <>
              {renderSelectField('language_id', 'Dil', languages, true)}
              {renderSelectField('level_id', 'Seviye', languageLevels, true)}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.submitButtonText}>
                {data ? 'Güncelle' : 'Ekle'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error[500],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  inputDisabled: {
    backgroundColor: colors.neutral[100],
    color: colors.text.tertiary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  pickerDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  button: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

