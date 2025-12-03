import React, { useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

const TITLE_OPTIONS = ['Dr', 'Uz.Dr', 'Dr.Öğr.Üyesi', 'Doç.Dr', 'Prof.Dr'] as const;
const REGION_VALUES = ['ist_avrupa', 'ist_anadolu', 'ankara', 'izmir', 'diger', 'yurtdisi'] as const;
const REGION_OPTIONS = [
  { value: 'ist_avrupa', label: 'İstanbul (Avrupa)' },
  { value: 'ist_anadolu', label: 'İstanbul (Anadolu)' },
  { value: 'ankara', label: 'Ankara' },
  { value: 'izmir', label: 'İzmir' },
  { value: 'diger', label: 'Diğer (Türkiye)' },
  { value: 'yurtdisi', label: 'Yurtdışı' },
] as const;
const REGION_PICKER_ITEMS = REGION_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value,
}));

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    email: z.string().email('Geçerli bir e-posta girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    confirmPassword: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    title: z.enum(TITLE_OPTIONS),
    region: z.enum(REGION_VALUES),
    specialty_id: z.string().min(1, 'Lütfen branş seçin'),
    subspecialty_id: z.string().optional(),
    profile_photo: z.string().min(1, 'Profil fotoğrafı yüklemelisiniz'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface Specialty {
  id: number;
  name: string;
}

interface Subspecialty {
  id: number;
  name: string;
  specialty_id: number;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  isLoading?: boolean;
  serverError?: string | null;
  specialties?: Specialty[];
  subspecialties?: Subspecialty[];
  specialtiesLoading?: boolean;
  subspecialtiesLoading?: boolean;
  photoPreview?: string | null;
  onPhotoSelect: () => void;
  onPhotoChange: (base64: string) => void;
}

export const RegisterForm = ({
  onSubmit,
  isLoading = false,
  serverError,
  specialties = [],
  subspecialties = [],
  specialtiesLoading = false,
  subspecialtiesLoading = false,
  photoPreview,
  onPhotoSelect,
}: RegisterFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      title: 'Dr',
      region: 'diger',
      specialty_id: '',
      subspecialty_id: '',
      profile_photo: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const selectedSpecialtyId = watch('specialty_id');

  const filteredSubspecialties = useMemo(() => {
    const specialtyIdNumber = Number(selectedSpecialtyId);
    if (!specialtyIdNumber) {
      return [];
    }
    return subspecialties.filter(
      (item) => item.specialty_id === specialtyIdNumber,
    );
  }, [selectedSpecialtyId, subspecialties]);

  const renderTextField = (
    name: keyof RegisterFormValues,
    label: string,
    keyboardType: 'default' | 'email-address' = 'default',
    secure = false,
    autoCapitalize: 'none' | 'sentences' | 'words' = 'none',
  ) => (
    <FormField label={label} error={errors[name]?.message as string}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Input
            onChangeText={onChange}
            value={(value ?? '') as string}
            keyboardType={keyboardType}
            secureTextEntry={secure}
            autoCapitalize={autoCapitalize}
          />
        )}
      />
    </FormField>
  );

  const renderPickerField = (
    name: keyof RegisterFormValues,
    label: string,
    items: Array<{ label: string; value: string }>,
    enabled = true,
  ) => (
    <FormField label={label} error={errors[name]?.message as string}>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <View
            style={[
              styles.pickerContainer,
              !enabled && styles.pickerDisabled,
            ]}
          >
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => onChange(itemValue)}
              enabled={enabled}
            >
              <Picker.Item label="Seçiniz" value="" key="register-select" />
              {items.map((item, index) => (
                <Picker.Item
                  label={item.label}
                  value={item.value}
                  key={`register-${item.value}-${index}`}
                />
              ))}
            </Picker>
          </View>
        )}
      />
    </FormField>
  );

  return (
    <View>
      <Typography variant="heading">Doktor Kaydı</Typography>
      <Typography variant="bodySecondary" style={styles.subtitle}>
        Bilgilerini doldur, hesabın admin onayına gönderilsin.
      </Typography>

      {renderTextField('first_name', 'Ad', 'default', false, 'words')}
      {renderTextField('last_name', 'Soyad', 'default', false, 'words')}
      {renderTextField('email', 'E-posta', 'email-address')}
      {renderTextField('password', 'Şifre', 'default', true)}
      {renderTextField('confirmPassword', 'Şifre (Tekrar)', 'default', true)}

      {renderPickerField(
        'title',
        'Ünvan',
        TITLE_OPTIONS.map((title) => ({ label: title, value: title })),
      )}

      {renderPickerField('region', 'Bulunduğun Bölge', REGION_PICKER_ITEMS)}

      {renderPickerField(
        'specialty_id',
        'Branş',
        specialties.map((item) => ({
          label: item.name,
          value: String(item.id),
        })),
        !specialtiesLoading,
      )}

      {renderPickerField(
        'subspecialty_id',
        'Yan Dal (opsiyonel)',
        filteredSubspecialties.map((item) => ({
          label: item.name,
          value: String(item.id),
        })),
        filteredSubspecialties.length > 0 && !subspecialtiesLoading,
      )}

      <View style={styles.photoSection}>
        <Typography variant="subtitle">Profil Fotoğrafı</Typography>
        {photoPreview ? (
          <Image source={{ uri: photoPreview }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Typography variant="caption" style={styles.photoPlaceholderText}>
              1:1 oranında fotoğraf yükleyin
            </Typography>
          </View>
        )}
        <Button
          label="Fotoğraf Seç"
          variant="secondary"
          onPress={onPhotoSelect}
          fullWidth
          style={styles.photoButton}
        />
        {errors.profile_photo && (
          <Typography variant="caption" style={styles.errorText}>
            {errors.profile_photo?.message}
          </Typography>
        )}
      </View>

      {serverError && (
        <Typography variant="caption" style={styles.serverError}>
          {serverError}
        </Typography>
      )}

      <Button
        label="Kayıt Ol"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: spacing['2xl'],
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  pickerDisabled: {
    backgroundColor: colors.neutral[100],
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.error[600],
  },
  photoSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    height: 200,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  photoPlaceholderText: {
    color: colors.text.secondary,
  },
  photoButton: {
    marginBottom: spacing.xs,
  },
  serverError: {
    color: colors.error[600],
    marginBottom: spacing.md,
  },
});
