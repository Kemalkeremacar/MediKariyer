/**
 * @file ForgotPasswordScreen.tsx
 * @description Şifremi unuttum ekranı
 * 
 * Bu ekran kullanıcının e-posta adresine şifre sıfırlama linki gönderir.
 * Kullanıcı linke tıklayarak şifresini sıfırlayabilir.
 * 
 * **Akış:**
 * 1. Kullanıcı e-posta adresini girer
 * 2. Backend'e istek gönderilir
 * 3. Kullanıcıya e-posta gönderilir
 * 4. Başarı mesajı gösterilir
 * 5. Kullanıcı login ekranına dönebilir
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '@/navigation/types';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/layout/Screen';
import { useTheme } from '@/contexts/ThemeContext';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { handleApiError } from '@/utils/errorHandler';

/**
 * Form validasyon şeması
 * Zod ile e-posta validasyonu
 */
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta girin'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Şifremi unuttum ekranı bileşeni
 */
export const ForgotPasswordScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const alert = useAlertHelpers();
  
  // Server hata ve başarı mesajları için state
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * React Hook Form setup
   * E-posta validasyonu ile form yönetimi
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordSchema),
  });

  /**
   * Forgot password mutation
   * Başarılı olduğunda başarı mesajı göster
   * Hata olduğunda hata mesajı göster
   */
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: (data) => {
      try {
        setServerError(null);
        const message = data?.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.';
        setSuccessMessage(message);
        alert.success(message);
      } catch (error) {
        console.error('Error in forgot password success callback:', error);
        setServerError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    },
    onError: (error) => {
      const errorMessage = handleApiError(
        error,
        '/auth/forgot-password',
        (msg) => alert.error(msg)
      );
      setServerError(errorMessage);
      setSuccessMessage(null);
    },
  });

  /**
   * Form submit handler
   * E-posta adresini backend'e gönder
   */
  const onSubmit = (values: ForgotPasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    forgotPasswordMutation.mutate(values.email);
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
              Şifrenizi mi unuttunuz? Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
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
                      onChangeText={(text) => {
                        onChange(text);
                        if (serverError) setServerError(null);
                        if (successMessage) setSuccessMessage(null);
                      }}
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

              {serverError && (
                <Typography variant="caption" style={styles.serverError}>
                  {serverError}
                </Typography>
              )}

              {successMessage && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[600]} />
                  <Typography variant="bodySmall" style={styles.successText}>
                    {successMessage}
                  </Typography>
                </View>
              )}

              <Button
                variant="gradient"
                label={forgotPasswordMutation.isPending ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
                onPress={handleSubmit(onSubmit)}
                loading={forgotPasswordMutation.isPending}
                fullWidth
                size="lg"
                gradientColors={(theme.colors.gradient as any).header || theme.colors.gradient.primary}
                style={styles.submitButton}
              />

              {/* Back to Login Link */}
              <View style={styles.loginSection}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Typography variant="bodySmall" style={styles.loginLink}>
                    ← Giriş Ekranına Dön
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  successText: {
    color: theme.colors.success[700],
    flex: 1,
  },
  submitButton: {
    marginBottom: theme.spacing['2xl'],
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing['4xl'],
  },
  loginLink: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

