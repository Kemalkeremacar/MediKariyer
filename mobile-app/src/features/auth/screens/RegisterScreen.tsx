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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthStackParamList } from '@/navigation/types';
import { Typography } from '@/components/ui/Typography';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { useRegister } from '../hooks/useRegister';
import { lookupService } from '@/api/services/lookup.service';
import { uploadService } from '@/api/services/upload.service';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#4A90E2', '#2E5C8A']}
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
              <Typography variant="h3" style={styles.sectionTitle}>
                Mesleki Bilgiler
              </Typography>
            </View>

            <FormField label="Uzmanlık Alanı *">
              {specialtiesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4A90E2" />
                  <Text style={styles.loadingText}>Branşlar yükleniyor...</Text>
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
                    <ActivityIndicator size="small" color="#4A90E2" />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
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
                          <ActivityIndicator size="large" color="#ffffff" />
                          <Text style={styles.uploadingText}>Yükleniyor...</Text>
                        </View>
                      )}
                      <View style={styles.photoEditBadge}>
                        <Ionicons name="camera" size={16} color="#ffffff" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person" size={48} color="#9CA3AF" />
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

            <GradientButton
              label={registerMutation.isPending ? "Kayıt Oluşturuluyor..." : "Hesap Oluştur"}
              onPress={handleSubmit(onSubmit)}
              loading={registerMutation.isPending}
              fullWidth
              size="lg"
              colors={['#4A90E2', '#2E5C8A']}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    shadowOpacity: 0.15,
    elevation: 3,
  },
  chipText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorContainer: {
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: 8,
  },
  serverError: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonSpacing: {
    marginBottom: 24,
    marginTop: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 16,
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
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#4A90E2',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F9FAFB',
    borderWidth: 3,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  photoPlaceholderHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#6B7280',
  },
  loginLink: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  sectionHeaderFirst: {
    marginTop: 0,
  },
  sectionTitle: {
    color: '#2E5C8A',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});
