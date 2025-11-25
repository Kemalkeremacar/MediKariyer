import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '@/api/services/auth.service';
import { lookupService } from '@/api/services/lookup.service';
import { colors, shadows, spacing, borderRadius, typography } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import type { DoctorRegistrationPayload } from '@/types/auth';

const TITLE_OPTIONS = ['Dr.', 'Uz. Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.'] as const;
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

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      title: 'Dr.',
      region: 'diger',
      specialty_id: '',
      subspecialty_id: '',
      profile_photo: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const { data: specialties = [], isLoading: specialtiesLoading } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: lookupService.getSpecialties,
  });

  const { data: subspecialties = [], isLoading: subspecialtiesLoading } = useQuery({
    queryKey: ['lookup', 'subspecialties'],
    queryFn: lookupService.getSubspecialties,
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

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const payload: DoctorRegistrationPayload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        title: values.title,
        specialty_id: Number(values.specialty_id),
        subspecialty_id: values.subspecialty_id
          ? Number(values.subspecialty_id)
          : undefined,
        region: values.region,
        profile_photo: values.profile_photo,
      };
      return authService.registerDoctor(payload);
    },
    onSuccess: () => {
      Alert.alert(
        'Kayıt alındı',
        'Bilgilerin admin onayına gönderildi. Onay sonrası giriş yapabilirsin.',
        [
          {
            text: 'Giriş Yap',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
      setServerError(null);
      setPhotoPreview(null);
      reset({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        title: 'Dr.',
        region: 'diger',
        specialty_id: '',
        subspecialty_id: '',
        profile_photo: '',
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Kayıt işlemi sırasında bir hata oluştu';
      setServerError(message);
    },
  });

  const handleSelectPhoto = async () => {
    setServerError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      setServerError('Fotoğraf seçimi başarısız oldu. Tekrar deneyin.');
      return;
    }

    const mime = asset.mimeType ?? 'image/jpeg';
    const base64Image = `data:${mime};base64,${asset.base64}`;
    setPhotoPreview(asset.uri ?? null);
    setValue('profile_photo', base64Image, { shouldValidate: true });
  };

  const renderTextField = (
    name: keyof RegisterFormValues,
    label: string,
    keyboardType: 'default' | 'email-address' = 'default',
    secure = false,
    autoCapitalize: 'none' | 'sentences' | 'words' = 'none',
  ) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value as string}
            keyboardType={keyboardType}
            secureTextEntry={secure}
            autoCapitalize={autoCapitalize}
          />
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]?.message as string}</Text>
      )}
    </View>
  );

  const renderPickerField = (
    name: keyof RegisterFormValues,
    label: string,
    items: Array<{ label: string; value: string }>,
    enabled = true,
  ) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
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
              <Picker.Item label="Seçiniz" value="" />
              {items.map((item) => (
                <Picker.Item
                  label={item.label}
                  value={item.value}
                  key={item.value}
                />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]?.message as string}</Text>
      )}
    </View>
  );

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    registerMutation.mutate(values);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Doktor Kaydı</Text>
        <Text style={styles.subtitle}>
          Bilgilerini doldur, hesabın admin onayına gönderilsin.
        </Text>

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
          <Text style={styles.label}>Profil Fotoğrafı</Text>
          {photoPreview ? (
            <Image source={{ uri: photoPreview }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                1:1 oranında fotoğraf yükleyin
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSelectPhoto}
          >
            <Text style={styles.secondaryButtonText}>Fotoğraf Seç</Text>
          </TouchableOpacity>
          {errors.profile_photo && (
            <Text style={styles.errorText}>
              {errors.profile_photo?.message}
            </Text>
          )}
        </View>

        {serverError && <Text style={styles.serverError}>{serverError}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background.tertiary,
  },
  card: {
    backgroundColor: colors.background.primary,
    padding: spacing['2xl'],
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
  },
  formField: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
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
    fontSize: typography.fontSize.sm,
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
  button: {
    backgroundColor: colors.success[600],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.text.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  serverError: {
    color: colors.error[600],
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
  },
});

