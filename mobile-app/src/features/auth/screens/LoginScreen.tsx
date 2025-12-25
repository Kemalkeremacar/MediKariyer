import { useState, useMemo } from 'react';
import { showAlert } from '@/utils/alert';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthStackParamList } from '@/navigation/types';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/layout/Screen';
import { useTheme } from '@/contexts/ThemeContext';
import { useLogin } from '../hooks/useLogin';
import { handleApiError, isAuthError, isNetworkError } from '@/utils/errorHandler';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin({
    onSuccess: () => {
      setServerError(null);
    },
    onError: (error) => {
      let message: string;

      // Merkezî error util'leriyle sınıflandırma
      if (isAuthError(error)) {
        message = '❌ E-posta veya şifre hatalı';
      } else if (isNetworkError(error)) {
        message = '🌐 İnternet bağlantınızı kontrol edin';
      } else {
        // Varsayılan kullanıcı dostu mesaj + logging + toast
        message = handleApiError(
          error,
          '/auth/login',
          (msg) => showAlert.error(msg)
        );
      }

      setServerError(message);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
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
              onPress={() => showAlert.info('Bu özellik yakında eklenecek.')}
              style={styles.forgotButton}
            >
              <Typography variant="bodySmall" style={styles.forgotText}>
                Şifreni mi unuttun?
              </Typography>
            </Button>

            <Button
              variant="gradient"
              label={loginMutation.isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              fullWidth
              size="lg"
              gradientColors={(theme.colors.gradient as any).header || theme.colors.gradient.primary}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['4xl'],
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing['4xl'],
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error[600],
    marginTop: theme.spacing.xs,
  },
  serverError: {
    color: theme.colors.error[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing['3xl'],
  },
  forgotText: {
    color: theme.colors.primary[600],
  },
  loginButton: {
    marginBottom: theme.spacing['2xl'],
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing['4xl'],
  },
  registerText: {
    color: theme.colors.text.secondary,
  },
  registerLink: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
