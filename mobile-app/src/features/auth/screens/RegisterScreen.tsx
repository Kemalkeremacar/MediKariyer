import React, { useState, useEffect, useMemo } from 'react';
import { showAlert } from '@/utils/alert';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthStackParamList } from '@/navigation/types';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { Screen } from '@/components/layout/Screen';
import { useTheme } from '@/contexts/ThemeContext';
import { useRegister } from '../hooks/useRegister';
import { lookupService } from '@/api/services/lookup.service';
import { uploadService } from '@/api/services/upload.service';
import { handleApiError } from '@/utils/errorHandler';

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
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<typeof TITLES[number]['value']>('Dr');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | undefined>();
  const [selectedSubspecialty, setSelectedSubspecialty] = useState<number | undefined>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch specialties
  const { data: specialties = [], isLoading: specialtiesLoading } = useQuery({
    queryKey: queryKeys.lookup.specialties(),
    queryFn: lookupService.getSpecialties,
  });

  // Fetch subspecialties
  const { data: allSubspecialties = [], isLoading: subspecialtiesLoading } = useQuery({
    queryKey: queryKeys.lookup.subspecialties(),
    queryFn: () => lookupService.getSubspecialties(),
  });

  // Filter subspecialties by selected specialty
  const filteredSubspecialties = selectedSpecialty
    ? (allSubspecialties as any[]).filter((sub: any) => sub.specialty_id === selectedSpecialty)
    : [];

  // Reset subspecialty when specialty changes
  useEffect(() => {
    setSelectedSubspecialty(undefined);
  }, [selectedSpecialty]);

  // Show photo picker options
  const showPhotoOptions = () => {
    showAlert.custom(
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
        showAlert.error('Fotoğraf çekmek için kamera izni gerekiyor.');
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
      showAlert.error('Kamera açılırken bir hata oluştu.');
    }
  };

  // Pick from gallery
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert.error('Galeri erişim izni gerekiyor.');
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
      showAlert.error('Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Process selected image
  const processImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setPhotoUri(asset.uri);
    
    if (!asset.base64) {
      showAlert.error('Fotoğraf verisi alınamadı');
      return;
    }
    
    setIsUploadingPhoto(true);
    
    try {
      // Check size
      const base64String = `data:image/jpeg;base64,${asset.base64}`;
      const sizeInBytes = base64String.length * 0.75;
      const sizeInKB = sizeInBytes / 1024;
      
      if (sizeInKB > 500) {
        showAlert.error('Fotoğraf çok büyük (max 500KB). Lütfen daha küçük bir fotoğraf seçin.');
        setPhotoUri('');
        return;
      }
      
      // Upload photo to server (base64) - Register endpoint (no auth required)
      const uploadResult = await uploadService.uploadRegisterPhoto(asset.uri, asset.base64);
      setProfilePhotoUrl(uploadResult.url);
      showAlert.success('Fotoğraf yüklendi');
    } catch (error: any) {
      const message = handleApiError(
        error,
        '/upload/register-photo',
        (msg) => showAlert.error(msg)
      );
      // Ekstra olarak form üstünde de gösterebiliriz
      setServerError(message);
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
    onSuccess: () => {
      setServerError(null);
      // Navigate to pending approval screen
      navigation.navigate('PendingApproval');
    },
    onError: (err) => {
      const errorMessage = handleApiError(
        err,
        '/auth/register',
        (msg) => showAlert.error(msg)
      );
      setServerError(errorMessage);
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    
    // Validation
    if (!selectedSpecialty) {
      setServerError('⚠️ Lütfen uzmanlık alanı seçin');
      showAlert.error('Lütfen uzmanlık alanınızı seçin.');
      return;
    }

    if (!profilePhotoUrl) {
      setServerError('⚠️ Lütfen profil fotoğrafı ekleyin');
      showAlert.error('Lütfen profil fotoğrafınızı ekleyin.');
      return;
    }
    
    registerMutation.mutate({
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      password: values.password,
      password_confirmation: values.confirmPassword,
      phone: '', // TODO: Add phone field to form
      title: selectedTitle,
      specialty_id: selectedSpecialty,
      subspecialty_id: selectedSubspecialty || undefined,
      profile_photo: profilePhotoUrl,
    });
  };

  return (
    <Screen scrollable={false} safeArea={true} safeAreaEdges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={(theme.colors.gradient as any).header || theme.colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../../assets/logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* MediKariyer Yazısı */}
            <Typography variant="h1" style={styles.brandName}>
              MediKariyer
            </Typography>
            
            <Typography variant="body" style={styles.headerSubtitle}>
              Doktor hesabı oluştur
            </Typography>
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
          <View style={[styles.sectionHeader, styles.sectionHeaderFirst]}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Kişisel Bilgiler
            </Typography>
          </View>

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
                    <Typography
                      variant="bodySmall"
                      style={
                        selectedTitle === title.value
                          ? styles.chipTextSelected
                          : styles.chipText
                      }
                    >
                      {title.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </FormField>

            <View style={styles.sectionHeader}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Mesleki Bilgiler
              </Typography>
            </View>

            <FormField label="Uzmanlık Alanı *">
              {specialtiesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                  <Typography variant="bodySmall" style={styles.loadingText}>Branşlar yükleniyor...</Typography>
                </View>
              ) : (
                <Select
                  options={specialties.map((s: any) => ({
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
                    <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                    <Typography variant="bodySmall" style={styles.loadingText}>Yükleniyor...</Typography>
                  </View>
                ) : (
                  <Select
                    options={(filteredSubspecialties as any[]).map((s: any) => ({
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

            <View style={styles.sectionHeader}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Hesap Bilgileri
              </Typography>
            </View>

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
                <TouchableOpacity 
                  onPress={showPhotoOptions} 
                  disabled={isUploadingPhoto}
                  style={styles.photoTouchable}
                >
                  {photoUri ? (
                    <View style={styles.photoWrapper}>
                      <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                      {isUploadingPhoto && (
                        <View style={styles.uploadingOverlay}>
                          <ActivityIndicator size="large" color={theme.colors.text.inverse} />
                          <Typography variant="caption" style={styles.uploadingText}>Yükleniyor...</Typography>
                        </View>
                      )}
                      <View style={styles.photoEditBadge}>
                        <Ionicons name="camera" size={16} color={theme.colors.text.inverse} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person" size={48} color={theme.colors.text.tertiary} />
                      <Typography variant="bodySmall" style={styles.photoPlaceholderText}>Fotoğraf Ekle</Typography>
                      <Typography variant="caption" style={styles.photoPlaceholderHint}>Kamera veya galeriden seç</Typography>
                    </View>
                  )}
                </TouchableOpacity>
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
              variant="gradient"
              label={registerMutation.isPending ? "Kayıt Oluşturuluyor..." : "Hesap Oluştur"}
              onPress={handleSubmit(onSubmit)}
              loading={registerMutation.isPending}
              fullWidth
              size="lg"
              gradientColors={(theme.colors.gradient as any).header || theme.colors.gradient.primary}
              style={styles.buttonSpacing}
            />
            
          <View style={styles.loginPrompt}>
            <Typography variant="bodySmall" style={styles.loginPromptText}>
              Zaten hesabın var mı?{' '}
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Typography variant="bodySmall" style={styles.loginLink}>
                Giriş Yap
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: theme.spacing['5xl'],
    paddingBottom: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: theme.borderRadius.header,
    borderBottomRightRadius: theme.borderRadius.header,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 70,
    height: 70,
  },
  brandName: {
    color: theme.colors.text.inverse,
    ...theme.textVariants.title,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    color: theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    ...theme.textVariants.body,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['4xl'],
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.secondary,
    marginRight: theme.spacing.md + 2,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
    shadowOpacity: 0.15,
    elevation: 3,
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  chipTextSelected: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
  errorContainer: {
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  serverError: {
    color: theme.colors.error[600],
    textAlign: 'center',
    ...theme.textVariants.bodySmall,
  },
  buttonSpacing: {
    marginBottom: theme.spacing['2xl'],
    marginTop: theme.spacing['2xl'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    ...theme.textVariants.bodySmall,
    color: theme.colors.text.secondary,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  photoTouchable: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoPreview: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius['3xl'],
    borderWidth: 4,
    borderColor: theme.colors.primary[600],
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background.secondary,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius['3xl'],
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 3,
    borderColor: theme.colors.primary[600],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    ...theme.textVariants.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  photoPlaceholderHint: {
    ...theme.textVariants.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.overlay,
    borderRadius: theme.borderRadius['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: theme.colors.text.inverse,
    ...theme.textVariants.caption,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    color: theme.colors.text.secondary,
  },
  loginLink: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sectionHeader: {
    marginTop: theme.spacing['2xl'],
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary[600],
  },
  sectionHeaderFirst: {
    marginTop: 0,
  },
  sectionTitle: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.bold,
    ...theme.textVariants.h3,
    letterSpacing: 0.3,
  },
});
