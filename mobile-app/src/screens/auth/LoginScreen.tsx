import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/auth.service';
import { tokenManager } from '@/utils/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing } from '@/constants/theme';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      setServerError(null);
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      setAuthState({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
    onError: (error) => {
      let message = 'Giriş sırasında bir hata oluştu';
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
      setServerError(message);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
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
          <Card padding="2xl" shadow="md">
            <Typography variant="heading">MediKariyer Doktor</Typography>
            <Typography variant="bodySecondary" style={styles.subtitle}>
              Mobile deneyime hoş geldin. Lütfen giriş yap.
            </Typography>

            <FormField
              label="E-posta"
              error={errors.email?.message as string}
            >
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

            <FormField
              label="Şifre"
              error={errors.password?.message as string}
            >
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Şifreniz"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </FormField>

            {serverError && (
              <Typography variant="caption" style={styles.serverError}>
                {serverError}
              </Typography>
            )}

            <Button
              label="Giriş Yap"
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              fullWidth
              style={styles.buttonSpacing}
            />
            <Button
              label="Hesabın yok mu? Kayıt ol"
              variant="ghost"
              fullWidth
              onPress={() => navigation.navigate('Register')}
            />
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
    paddingHorizontal: spacing['2xl'],
  },
  flex: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  serverError: {
    color: colors.error[600],
    marginBottom: spacing.sm,
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
});

