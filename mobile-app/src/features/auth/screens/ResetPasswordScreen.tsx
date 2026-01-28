/**
 * @file ResetPasswordScreen.tsx
 * @description Şifre sıfırlama ekranı - E-posta ile gelen link üzerinden
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖZELLİKLER:**
 * - Token bazlı şifre sıfırlama
 * - Yeni şifre ve tekrar girişi
 * - Şifre görünürlük toggle
 * - Form validasyonu (Zod schema)
 * - Geçersiz token kontrolü
 * 
 * **ŞİFRE KRİTERLERİ:**
 * - En az 8 karakter
 * - Büyük ve küçük harf
 * - En az bir rakam
 * 
 * **KULLANIM AKIŞI:**
 * 1. E-posta ile gelen link tıklanır
 * 2. Token route params'tan alınır
 * 3. Yeni şifre girilir
 * 4. Başarılı ise Login ekranına yönlendirilir
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { useResetPassword } from '../hooks/useResetPassword';
import { passwordSchema } from '@/utils/validators';

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type RouteParams = {
  token?: string;
};

export const ResetPasswordScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Token'ı route params'tan veya deep link'ten al
  const routeParams = route.params as RouteParams | undefined;
  const tokenFromParams = routeParams?.token;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setServerError(null);
      // Başarılı olduğunda login ekranına yönlendir
      navigation.replace('Login');
    },
    onError: (error) => {
      setServerError(error.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu.');
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!tokenFromParams) {
      setServerError('Geçersiz veya eksik şifre sıfırlama bağlantısı.');
      return;
    }

    setServerError(null);
    resetPasswordMutation.mutate({
      token: tokenFromParams,
      password: values.password,
    });
  };

  if (!tokenFromParams) {
    return (
      <Screen scrollable={false} safeArea={true} safeAreaEdges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error[600]} />
          <Typography variant="h2" style={styles.errorTitle}>
            Geçersiz Bağlantı
          </Typography>
          <Typography variant="body" style={styles.errorMessage}>
            Şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen e-posta kutunuzdaki en güncel bağlantıyı kullanın.
          </Typography>
          <Button
            variant="gradient"
            label="Giriş Sayfasına Dön"
            onPress={() => navigation.replace('Login')}
            fullWidth
            size="lg"
            gradientColors={(theme.colors.gradient as any).header || theme.colors.gradient.primary}
            style={styles.backButton}
          />
        </View>
      </Screen>
    );
  }

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
                source={require('../../../../assets/logo.png')}
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
            <Typography variant="h2" style={styles.title}>
              Yeni Şifrenizi Belirleyin
            </Typography>
            <Typography variant="body" style={styles.subtitle}>
              Güvenliğiniz için güçlü bir şifre seçin ve hesabınıza tekrar erişin.
            </Typography>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Typography variant="bodySmall" style={styles.label}>
                  Yeni Şifre
                </Typography>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Input
                        secureTextEntry={!showPassword}
                        placeholder="Yeni şifrenizi girin"
                        value={value}
                        onChangeText={onChange}
                        variant="underline"
                        textContentType="newPassword"
                        passwordRules="minlength: 6; required: lower; required: upper; required: digit; required: special; allowed: special, [@$!%*?&];"
                        rightIcon={
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                              name={showPassword ? 'eye-off' : 'eye'}
                              size={20}
                              color={theme.colors.text.secondary}
                            />
                          </TouchableOpacity>
                        }
                      />
                    </View>
                  )}
                />
                {errors.password && (
                  <Typography variant="caption" style={styles.errorText}>
                    {errors.password.message}
                  </Typography>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Typography variant="bodySmall" style={styles.label}>
                  Şifre Tekrarı
                </Typography>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Input
                        secureTextEntry={!showConfirmPassword}
                        placeholder="Yeni şifrenizi tekrar girin"
                        value={value}
                        onChangeText={onChange}
                        variant="underline"
                        textContentType="newPassword"
                        passwordRules="minlength: 6; required: lower; required: upper; required: digit; required: special; allowed: special, [@$!%*?&];"
                        rightIcon={
                          <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={theme.colors.text.secondary}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        }
                      />
                    </View>
                  )}
                />
                {errors.confirmPassword && (
                  <Typography variant="caption" style={styles.errorText}>
                    {errors.confirmPassword.message}
                  </Typography>
                )}
              </View>

              {serverError && (
                <Typography variant="caption" style={styles.serverError}>
                  {serverError}
                </Typography>
              )}

              <Button
                variant="gradient"
                label={resetPasswordMutation.isPending ? 'Şifre Güncelleniyor...' : 'Yeni Şifreyi Kaydet'}
                onPress={handleSubmit(onSubmit)}
                loading={resetPasswordMutation.isPending}
                fullWidth
                size="lg"
                gradientColors={(theme.colors.gradient as any).header || theme.colors.gradient.primary}
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
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
    title: {
      textAlign: 'center',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
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
    submitButton: {
      marginBottom: theme.spacing['2xl'],
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing['2xl'],
    },
    errorTitle: {
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    errorMessage: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    backButton: {
      marginTop: theme.spacing.xl,
    },
  });

