/**
 * @file LoginScreen.tsx
 * @description Giriş yapma ekranı
 * 
 * Bu ekran kullanıcının e-posta ve şifre ile giriş yapmasını sağlar.
 * Başarılı girişte kullanıcı durumuna göre yönlendirme yapar.
 * 
 * **Akış:**
 * 1. Kullanıcı e-posta ve şifre girer
 * 2. Backend'e giriş isteği gönderilir
 * 3. Token'lar kaydedilir
 * 4. Kullanıcı durumu kontrol edilir:
 *    - Onaylı → App ekranına yönlendir
 *    - Onaysız → PendingApproval ekranına yönlendir
 *    - Pasif → AccountDisabled ekranına yönlendir
 * 
 * **ÖNEMLİ:** RootNavigator otomatik yönlendirme yapar,
 * bu ekran sadece login işlemini halleder.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';
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
import { getUserFriendlyErrorMessage, isAuthError, isNetworkError } from '@/utils/errorHandler';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Giriş yapma ekranı bileşeni
 */
export const LoginScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useTranslation();
  
  // Server hata mesajı için state
  const [serverError, setServerError] = useState<string | null>(null);
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * Form validasyon şeması - i18n ile
   */
  const loginSchema = useMemo(() => z.object({
    email: z.string().min(1, t('errors.emailRequired')).email(t('errors.invalidEmail')),
    password: z.string().min(1, t('errors.passwordRequired')),
  }), [t]);

  // Form değerleri tipi
  type LoginFormValues = z.infer<typeof loginSchema>;

  /**
   * NOT: Mount'ta otomatik PendingApproval yönlendirmesi yapmıyoruz.
   * Bu, kullanıcının LoginScreen'de kalmasına izin verir.
   * PendingApproval sadece başarılı login denemesinden sonra gösterilir.
   */

  /**
   * React Hook Form setup
   * E-posta ve şifre validasyonu ile form yönetimi
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  /**
   * Login mutation
   * 
   * **Başarı Durumu:**
   * - Kullanıcı onaylı mı kontrol et
   * - Onaysızsa PendingApproval'a yönlendir
   * - Onaylıysa RootNavigator otomatik App ekranını gösterir
   * 
   * **Hata Durumu:**
   * - Auth hatası → "E-posta veya şifre hatalı"
   * - Network hatası → "İnternet bağlantınızı kontrol edin"
   * - Diğer → Genel hata mesajı
   */
  const loginMutation = useLogin({
    onSuccess: (data) => {
      setServerError(null);
      
      // Kullanıcı onay durumunu kontrol et (tip güvenli)
      const isApproved = data.user.is_approved === true || data.user.is_approved === 1 || data.user.is_approved === 'true' || data.user.is_approved === '1';
      const isAdmin = data.user.role === 'admin';
      
      if (!isApproved && !isAdmin) {
        // Kullanıcı onaylı değil - RootNavigator otomatik PendingApproval'a yönlendirir
        // Alert gösterme - PendingApprovalScreen zaten bilgilendirme yapıyor
        // Manuel navigasyon gerekmez - state-based routing halleder
      }
      // Onaylıysa RootNavigator otomatik App ekranını gösterir
      // Manuel navigasyon gerekmez - conditional rendering halleder
    },
    onError: (error) => {
      let message: string;

      // Merkezi error util'leri ile hata sınıflandırma
      if (isAuthError(error)) {
        message = t('errors.invalidCredentials');
      } else if (isNetworkError(error)) {
        message = t('errors.network');
      } else {
        // Kullanıcı dostu mesajı al (logging olmadan)
        message = getUserFriendlyErrorMessage(error);
      }

      setServerError(message);
    },
  });

  /**
   * Form submit handler
   * E-posta ve şifre ile giriş yap
   */
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
            {t('auth.login.title')}
          </Typography>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Typography variant="bodySmall" style={styles.label}>
                {t('auth.login.email')}
              </Typography>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder={t('auth.login.emailPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    variant="underline"
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
                {t('auth.login.password')}
              </Typography>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t('auth.login.passwordPlaceholder')}
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    variant="underline"
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
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
            >
              <Typography variant="bodySmall" style={styles.forgotText}>
                {t('auth.login.forgotPassword')}
              </Typography>
            </Button>

            <Button
              variant="gradient"
              label={loginMutation.isPending ? t('common.loading') : t('auth.login.loginButton')}
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
                {t('auth.login.noAccount')}{' '}
              </Typography>
              <TouchableOpacity onPress={() => navigation.replace('Register')}>
                <Typography variant="bodySmall" style={styles.registerLink}>
                  {t('auth.login.register')}
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
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: theme.spacing.sm,
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
