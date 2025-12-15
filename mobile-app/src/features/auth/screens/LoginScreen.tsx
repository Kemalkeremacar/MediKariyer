import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { useTheme } from '@/contexts/ThemeContext';
import type { AuthStackParamList } from '@/navigation/types';
import { Typography } from '@/components/ui/Typography';
import { GradientButton } from '@/components/ui/GradientButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '../hooks/useLogin';
import { useBiometricLogin } from '../hooks/useBiometricLogin';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const { theme } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  const { isAvailable, isEnabled, biometricTypes } = useBiometricAuth();
  const { loginWithBiometric, saveBiometricCredentials, isBiometricLoginAvailable } = useBiometricLogin();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricLoginAvailable();
    setShowBiometric(available);
  };

  const loginMutation = useLogin({
    onSuccess: async (data) => {
      setServerError(null);
      
      // Token'ları kaydet ve auth state'i güncelle
      try {
        await tokenManager.saveTokens(data.accessToken, data.refreshToken);
        markAuthenticated(data.user);
        
        // Biometric enabled ise email'i kaydet
        if (isEnabled && data.user.email) {
          await saveBiometricCredentials(data.user.email);
        }
      } catch (err) {
        setServerError('⚠️ Token kaydetme hatası. Lütfen tekrar deneyin.');
      }
    },
    onError: (error) => {
      let message = '❌ Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      
      if (error instanceof Error) {
        message = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message;
      }
      
      // Kullanıcı dostu hata mesajları
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('invalid')) {
        message = '❌ E-posta veya şifre hatalı';
      } else if (message.toLowerCase().includes('network')) {
        message = '🌐 İnternet bağlantınızı kontrol edin';
      } else if (message.toLowerCase().includes('timeout')) {
        message = '⏱️ İstek zaman aşımına uğradı. Tekrar deneyin.';
      }
      
      setServerError(message);
      Alert.alert('Giriş Başarısız', message);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometric.mutateAsync();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Biyometrik giriş başarısız';
      Alert.alert('Hata', message);
    }
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
        {/* Header with Gradient - Daha Mavi Tonlama */}
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
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>

          <Typography variant="body" style={styles.subtitle}>
            Hesabına giriş yap ve kariyer fırsatlarını keşfet
          </Typography>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Typography variant="bodySmall" style={styles.label}>
                E-posta
              </Typography>
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
                    style={styles.input}
                  />
                )}
              />
              {errors.email && (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.email.message}
                </Typography>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Typography variant="bodySmall" style={styles.label}>
                Şifre
              </Typography>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="••••••••"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                  />
                )}
              />
              {errors.password && (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.password.message}
                </Typography>
              )}
            </View>

            {serverError && (
              <Typography variant="caption" style={styles.serverError}>
                {serverError}
              </Typography>
            )}

            <Button
              variant="ghost"
              onPress={() => Alert.alert('Şifre Sıfırlama', 'Bu özellik yakında eklenecek.')}
              style={styles.forgotButton}
            >
              <Typography variant="bodySmall" style={styles.forgotText}>
                Şifreni mi unuttun?
              </Typography>
            </Button>

            <GradientButton
              label={loginMutation.isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              fullWidth
              size="lg"
              colors={['#4A90E2', '#2E5C8A']}
              style={styles.loginButton}
            />

            {/* Register Link */}
            <View style={styles.registerSection}>
              <Typography variant="bodySmall" style={styles.registerText}>
                Hesabın yok mu?{' '}
              </Typography>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Typography variant="bodySmall" style={styles.registerLink}>
                  Kayıt Ol
                </Typography>
              </TouchableOpacity>
            </View>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  errorText: {
    color: '#DC2626',
    marginTop: 4,
  },
  serverError: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    color: '#4A90E2',
  },
  loginButton: {
    marginBottom: 24,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  registerText: {
    color: '#6B7280',
  },
  registerLink: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
