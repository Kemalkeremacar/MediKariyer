import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, Lock, ArrowRight, Fingerprint } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/utils/tokenManager';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { AuthStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
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
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.cardWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Stethoscope size={48} color={colors.primary[600]} strokeWidth={2.5} />
            </View>
            <Typography variant="heading" style={styles.title}>
              Tekrar Hoş Geldin!
            </Typography>
            <Typography variant="body" style={styles.headerSubtitle}>
              Hesabına giriş yap ve kariyer fırsatlarını keşfet
            </Typography>
          </View>

          <Card padding="2xl" shadow="lg" style={styles.formCard}>

            <FormField
              label="E-posta Adresi"
              error={errors.email?.message as string}
            >
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Mail size={20} color={colors.neutral[400]} />
                    </View>
                    <Input
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder="ornek@medikariyer.com"
                      value={value}
                      onChangeText={onChange}
                      style={styles.inputWithIcon}
                    />
                  </View>
                )}
              />
            </FormField>

            <FormField
              label="Şifre"
              error={errors.password?.message as string}
            >
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color={colors.neutral[400]} />
                    </View>
                    <Input
                      placeholder="••••••••"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      style={styles.inputWithIcon}
                    />
                  </View>
                )}
              />
            </FormField>

            <View style={styles.errorContainer}>
              {serverError && (
                <Typography variant="caption" style={styles.serverError}>
                  {serverError}
                </Typography>
              )}
            </View>

            <Button
              label={loginMutation.isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              fullWidth
              size="lg"
              style={styles.buttonSpacing}
            />

            {/* Biometric Login Button */}
            {showBiometric && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Typography variant="caption" style={styles.dividerText}>
                    veya
                  </Typography>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={loginWithBiometric.isPending}
                >
                  <Fingerprint size={24} color={colors.primary[600]} />
                  <Typography variant="body" style={styles.biometricButtonText}>
                    {loginWithBiometric.isPending 
                      ? 'Doğrulanıyor...' 
                      : `${biometricTypes[0] || 'Biyometrik'} ile Giriş Yap`
                    }
                  </Typography>
                </TouchableOpacity>
              </>
            )}

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Şifre Sıfırlama', 'Bu özellik yakında eklenecek.')}
            >
              <Typography variant="body" style={styles.forgotPasswordText}>
                Şifreni mi unuttun?
              </Typography>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Typography variant="caption" style={styles.dividerText}>
                veya
              </Typography>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Prompt */}
            <View style={styles.registerPrompt}>
              <Typography variant="body" style={styles.registerPromptText}>
                Hesabın yok mu?
              </Typography>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <View style={styles.registerLink}>
                  <Typography variant="body" style={styles.registerLinkText}>
                    Kayıt Ol
                  </Typography>
                  <ArrowRight size={16} color={colors.primary[600]} />
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
  flex: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    marginBottom: spacing['2xl'],
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
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
    fontWeight: '500',
  },
  buttonSpacing: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  forgotPasswordText: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  registerPromptText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerLinkText: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.md,
  },
  biometricButtonText: {
    color: colors.primary[600],
    fontSize: 15,
    fontWeight: '600',
  },
});
