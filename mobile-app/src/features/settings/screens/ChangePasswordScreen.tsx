import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/ui/BackButton';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import { useChangePassword } from '@/features/settings/hooks/useChangePassword';
import { useToast } from '@/providers/ToastProvider';

// Password strength calculator
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 6) strength += 25;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
  return Math.min(strength, 100);
};

const getPasswordStrengthText = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  if (strength < 40) return 'Zayıf';
  if (strength < 70) return 'Orta';
  if (strength < 90) return 'Güçlü';
  return 'Çok Güçlü';
};

const getPasswordStrengthColor = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  if (strength < 40) return colors.error[500];
  if (strength < 70) return colors.warning[500];
  if (strength < 90) return colors.primary[500];
  return colors.success[500];
};

export const ChangePasswordScreen = ({ navigation }: any) => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
        confirmPassword,
      },
      {
        onSuccess: () => {
          // Reset form
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          
          // Show toast instead of alert (modal değil - touch events engellenmez)
          showToast('Şifreniz başarıyla değiştirildi', 'success');
          
          // Navigate back after a short delay (toast'un gösterilmesi için)
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        },
      }
    );
  };

  const isFormValid =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;

  return (
    <Screen scrollable={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="lock-closed" size={32} color={colors.primary[600]} />
          </View>
          <Typography variant="h2" style={styles.headerTitle}>
            Şifre Değiştir
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Hesabınızın güvenliği için güçlü bir şifre seçin
          </Typography>
        </View>

        {/* Info Card */}
        <Card variant="outlined" padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
            <Typography variant="h3" style={styles.infoTitle}>
              Güçlü Şifre Kriterleri
            </Typography>
          </View>
          <View style={styles.infoList}>
            <Typography variant="caption" style={styles.infoItem}>
              • En az 6 karakter uzunluğunda olmalı
            </Typography>
            <Typography variant="caption" style={styles.infoItem}>
              • Büyük ve küçük harf içermeli
            </Typography>
            <Typography variant="caption" style={styles.infoItem}>
              • En az bir rakam içermeli
            </Typography>
            <Typography variant="caption" style={styles.infoItem}>
              • Özel karakter içermesi önerilir
            </Typography>
          </View>
        </Card>

        {/* Form */}
        <Card variant="elevated" padding="lg" style={styles.formCard}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Typography variant="body" style={styles.label}>
              Mevcut Şifre
            </Typography>
            <View style={styles.passwordInputContainer}>
              <Input
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut şifrenizi girin"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <Ionicons name="eye-off" size={20} color={colors.text.secondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Typography variant="body" style={styles.label}>
              Yeni Şifre
            </Typography>
            <View style={styles.passwordInputContainer}>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni şifrenizi girin"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <Ionicons name="eye-off" size={20} color={colors.text.secondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>
            {newPassword.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthHeader}>
                  <Typography variant="caption" style={styles.strengthLabel}>
                    Şifre Gücü:
                  </Typography>
                  <Typography variant="caption" style={{ ...styles.strengthValue, color: getPasswordStrengthColor(newPassword) }}>
                    {getPasswordStrengthText(newPassword)}
                  </Typography>
                </View>
                <Progress
                  value={calculatePasswordStrength(newPassword)}
                />
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Typography variant="body" style={styles.label}>
              Yeni Şifre (Tekrar)
            </Typography>
            <View style={styles.passwordInputContainer}>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Yeni şifrenizi tekrar girin"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Ionicons name="eye-off" size={20} color={colors.text.secondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Typography variant="caption" style={styles.errorText}>
                Şifreler eşleşmiyor
              </Typography>
            )}
          </View>

          {/* Submit Button */}
          <Button
            label="Şifreyi Güncelle"
            onPress={handleSubmit}
            disabled={!isFormValid || changePasswordMutation.isPending}
            loading={changePasswordMutation.isPending}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: colors.primary[700],
    fontSize: 15,
    fontWeight: '600',
  },
  infoList: {
    gap: spacing.xs,
  },
  infoItem: {
    color: colors.primary[700],
    fontSize: 13,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  errorText: {
    color: colors.error[600],
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  passwordStrength: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
