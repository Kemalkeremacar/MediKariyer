import { View, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading?: boolean;
  serverError?: string | null;
  onRegisterPress?: () => void;
}

export const LoginForm = ({
  onSubmit,
  isLoading = false,
  serverError,
  onRegisterPress,
}: LoginFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  return (
    <View>
      <Typography variant="heading">MediKariyer Doktor</Typography>
      <Typography variant="bodySecondary" style={styles.subtitle}>
        Mobile deneyime hoş geldin. Lütfen giriş yap.
      </Typography>

      <FormField label="E-posta" error={errors.email?.message as string}>
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

      <FormField label="Şifre" error={errors.password?.message as string}>
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

      <View style={styles.errorContainer}>
        {serverError && (
          <Typography variant="caption" style={styles.serverError}>
            {serverError}
          </Typography>
        )}
      </View>

      <Button
        label="Giriş Yap"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        fullWidth
        style={styles.buttonSpacing}
      />
      {onRegisterPress && (
        <Button
          label="Hesabın yok mu? Kayıt ol"
          variant="ghost"
          fullWidth
          onPress={onRegisterPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
});
