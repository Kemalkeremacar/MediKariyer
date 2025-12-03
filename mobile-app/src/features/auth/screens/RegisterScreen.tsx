import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import type { AuthStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { useRegister } from '../hooks/useRegister';
import { lookupService } from '@/api/services/lookup.service';
import { uploadService } from '@/api/services/upload.service';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const TITLES = [
  { label: 'Dr.', value: 'Dr' },
  { label: 'Uz. Dr.', value: 'Uz.Dr' },
  { label: 'Dr. Öğr. Üyesi', value: 'Dr.Öğr.Üyesi' },
  { label: 'Doç. Dr.', value: 'Doç.Dr' },
  { label: 'Prof. Dr.', value: 'Prof.Dr' },
] as const;



export const RegisterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<typeof TITLES[number]['value']>('Dr');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | undefined>();
  const [selectedSubspecialty, setSelectedSubspecialty] = useState<number | undefined>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Fetch specialties
  const { data: specialties = [], isLoading: specialtiesLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: lookupService.getSpecialties,
  });

  // Fetch subspecialties
  const { data: allSubspecialties = [], isLoading: subspecialtiesLoading } = useQuery({
    queryKey: ['subspecialties'],
    queryFn: lookupService.getSubspecialties,
  });

  // Filter subspecialties by selected specialty
  const filteredSubspecialties = selectedSpecialty
    ? allSubspecialties.filter((sub) => sub.specialty_id === selectedSpecialty)
    : [];

  // Reset subspecialty when specialty changes
  useEffect(() => {
    setSelectedSubspecialty(undefined);
  }, [selectedSpecialty]);

  // Show photo picker options
  const showPhotoOptions = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Fotoğraf nasıl eklemek istersiniz?',
      [
        {
          text: 'Kamera',
          onPress: takePhoto,
        },
        {
          text: 'Galeriden Seç',
          onPress: pickFromGallery,
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera izni gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        processImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılırken bir hata oluştu.');
    }
  };

  // Pick from gallery
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişim izni gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        processImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Process selected image
  const processImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setPhotoUri(asset.uri);
    
    if (!asset.base64) {
      Alert.alert('Hata', 'Fotoğraf verisi alınamadı');
      return;
    }
    
    setIsUploadingPhoto(true);
    
    try {
      // Check size
      const base64String = `data:image/jpeg;base64,${asset.base64}`;
      const sizeInBytes = base64String.length * 0.75;
      const sizeInKB = sizeInBytes / 1024;
      
      if (sizeInKB > 500) {
        Alert.alert('Uyarı', 'Fotoğraf çok büyük (max 500KB). Lütfen daha küçük bir fotoğraf seçin.');
        setPhotoUri('');
        return;
      }
      
      // Upload photo to server (base64)
      const uploadResult = await uploadService.uploadProfilePhoto(asset.uri, asset.base64);
      setProfilePhotoUrl(uploadResult.url);
      Alert.alert('Başarılı', 'Fotoğraf yüklendi');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Fotoğraf yüklenirken bir hata oluştu');
      setPhotoUri('');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister({
    onSuccess: (data) => {
      setServerError(null);
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız oluşturuldu. Admin onayından sonra giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    },
    onError: (err) => {
      setServerError(err.message || 'Kayıt başarısız');
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    
    // Validation
    if (!selectedSpecialty) {
      setServerError('Lütfen uzmanlık alanı seçin');
      return;
    }

    if (!profilePhotoUrl) {
      setServerError('Lütfen profil fotoğrafı ekleyin');
      return;
    }
    
    registerMutation.mutate({
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      password: values.password,
      title: selectedTitle,
      specialty_id: selectedSpecialty,
      subspecialty_id: selectedSubspecialty || null,
      profile_photo: profilePhotoUrl,
    });
  };

  return (
    <ScreenContainer scrollable={true}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Card padding="2xl" shadow="md">
            <Typography variant="heading">MediKariyer</Typography>
            <Typography variant="bodySecondary" style={styles.subtitle}>
              Doktor kaydı oluştur
            </Typography>

            <FormField label="Ad *" error={errors.firstName?.message}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Adınız"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
            </FormField>

            <FormField label="Soyad *" error={errors.lastName?.message}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Soyadınız"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
            </FormField>

            <FormField label="Unvan *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {TITLES.map((title) => (
                  <TouchableOpacity
                    key={title.value}
                    style={[
                      styles.chip,
                      selectedTitle === title.value && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedTitle(title.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedTitle === title.value && styles.chipTextSelected,
                      ]}
                    >
                      {title.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </FormField>

            <FormField label="Uzmanlık Alanı *">
              {specialtiesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                  <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
              ) : (
                <Select
                  options={specialties.map((s) => ({
                    label: s.name,
                    value: s.id,
                  }))}
                  value={selectedSpecialty}
                  onChange={(value) => setSelectedSpecialty(value as number)}
                  placeholder="Branş Seçiniz"
                  searchable
                />
              )}
            </FormField>

            {selectedSpecialty && filteredSubspecialties.length > 0 && (
              <FormField label="Yan Dal (Opsiyonel)">
                {subspecialtiesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary[600]} />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                  </View>
                ) : (
                  <Select
                    options={filteredSubspecialties.map((s) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                    value={selectedSubspecialty}
                    onChange={(value) => setSelectedSubspecialty(value as number)}
                    placeholder="Yan Dal Seçiniz"
                    searchable
                  />
                )}
              </FormField>
            )}

            <FormField label="E-posta *" error={errors.email?.message}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="ornek@medikariyer.com"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Şifre *" error={errors.password?.message}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="En az 6 karakter"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Şifre Tekrar *" error={errors.confirmPassword?.message}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Şifrenizi tekrar girin"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Profil Fotoğrafı *">
              <View style={styles.photoContainer}>
                {photoUri ? (
                  <TouchableOpacity onPress={showPhotoOptions} disabled={isUploadingPhoto}>
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                    {isUploadingPhoto && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>📷</Text>
                  </View>
                )}
                <View style={styles.photoButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.photoButton, isUploadingPhoto && styles.photoButtonDisabled]}
                    onPress={takePhoto}
                    disabled={isUploadingPhoto}
                  >
                    <Text style={styles.photoButtonText}>📸 Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoButton, isUploadingPhoto && styles.photoButtonDisabled]}
                    onPress={pickFromGallery}
                    disabled={isUploadingPhoto}
                  >
                    <Text style={styles.photoButtonText}>🖼️ Galeri</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FormField>

            <View style={styles.errorContainer}>
              {serverError && (
                <Typography variant="caption" style={styles.serverError}>
                  {serverError}
                </Typography>
              )}
            </View>

            <Button
              label="Kayıt Ol"
              onPress={handleSubmit(onSubmit)}
              loading={registerMutation.isPending}
              fullWidth
              style={styles.buttonSpacing}
            />
            <Button
              label="Zaten hesabın var mı? Giriş yap"
              variant="ghost"
              fullWidth
              onPress={() => navigation.navigate('Login')}
            />
          </Card>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.background.primary,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  chipText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  chipTextSelected: {
    color: colors.background.primary,
    fontWeight: '600',
  },
  errorContainer: {
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  serverError: {
    color: colors.error[600],
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary[600],
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  photoPlaceholderText: {
    fontSize: 40,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  photoButtonText: {
    color: colors.background.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  photoButtonDisabled: {
    opacity: 0.5,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
