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
import { Camera, Image as ImageIcon, User, Mail, Lock, Stethoscope, ChevronRight } from 'lucide-react-native';
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
    onSuccess: () => {
      setServerError(null);
      Alert.alert(
        '🎉 Kayıt Başarılı!',
        'Hesabınız başarıyla oluşturuldu.\n\nAdmin onayından sonra e-posta adresinize bildirim gelecek ve giriş yapabileceksiniz.',
        [
          {
            text: 'Giriş Ekranına Dön',
            onPress: () => navigation.navigate('Login'),
            style: 'default',
          },
        ]
      );
    },
    onError: (err) => {
      const errorMessage = err.message || 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.';
      setServerError(errorMessage);
      Alert.alert('❌ Kayıt Başarısız', errorMessage);
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    
    // Validation
    if (!selectedSpecialty) {
      setServerError('⚠️ Lütfen uzmanlık alanı seçin');
      Alert.alert('Eksik Bilgi', 'Lütfen uzmanlık alanınızı seçin.');
      return;
    }

    if (!profilePhotoUrl) {
      setServerError('⚠️ Lütfen profil fotoğrafı ekleyin');
      Alert.alert('Eksik Bilgi', 'Lütfen profil fotoğrafınızı ekleyin.');
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
    <ScreenContainer scrollable={true}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Stethoscope size={40} color={colors.primary[600]} />
            </View>
            <Typography variant="heading" style={styles.title}>
              MediKariyer'e Hoş Geldin
            </Typography>
            <Typography variant="body" style={styles.headerSubtitle}>
              Doktor hesabı oluştur ve kariyer fırsatlarını keşfet
            </Typography>
          </View>

          <Card padding="2xl" shadow="md" style={styles.formCard}>

            <View style={styles.sectionHeader}>
              <Typography variant="h4" style={styles.sectionTitle}>
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

            <View style={styles.sectionHeader}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Mesleki Bilgiler
              </Typography>
            </View>

            <FormField label="Uzmanlık Alanı *">
              {specialtiesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                  <Text style={styles.loadingText}>Branşlar yükleniyor...</Text>
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

            <View style={styles.sectionHeader}>
              <Typography variant="h4" style={styles.sectionTitle}>
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
                          <ActivityIndicator size="large" color={colors.background.primary} />
                          <Text style={styles.uploadingText}>Yükleniyor...</Text>
                        </View>
                      )}
                      <View style={styles.photoEditBadge}>
                        <Camera size={16} color={colors.background.primary} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <User size={48} color={colors.neutral[400]} />
                      <Text style={styles.photoPlaceholderText}>Fotoğraf Ekle</Text>
                      <Text style={styles.photoPlaceholderHint}>Kamera veya galeriden seç</Text>
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
              label={registerMutation.isPending ? "Kayıt Oluşturuluyor..." : "Hesap Oluştur"}
              onPress={handleSubmit(onSubmit)}
              loading={registerMutation.isPending}
              fullWidth
              size="lg"
              style={styles.buttonSpacing}
            />
            
            <View style={styles.loginPrompt}>
              <Typography variant="body" style={styles.loginPromptText}>
                Zaten hesabın var mı?
              </Typography>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Typography variant="body" style={styles.loginLink}>
                  Giriş Yap
                </Typography>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 15,
  },
  formCard: {
    marginBottom: spacing['2xl'],
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
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.neutral[200],
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
    fontWeight: '500',
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
    textAlign: 'center',
    fontSize: 14,
  },
  buttonSpacing: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    backgroundColor: colors.neutral[50],
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  photoTouchable: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary[600],
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  photoPlaceholderHint: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: colors.background.primary,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loginPromptText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[100],
  },
  sectionTitle: {
    color: colors.primary[700],
    fontWeight: '700',
    fontSize: 16,
  },
});
