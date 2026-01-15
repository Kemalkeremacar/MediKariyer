/**
 * @file ChangePasswordScreen.tsx
 * @description Şifre değiştirme ekranı - Güvenlik ayarları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖZELLİKLER:**
 * - Mevcut şifre doğrulama
 * - Yeni şifre güç göstergesi (zayıf, orta, güçlü, çok güçlü)
 * - Şifre görünürlük toggle (göz ikonu)
 * - Gerçek zamanlı validasyon
 * - Toast bildirimleri (modal değil)
 * 
 * **ŞİFRE KRİTERLERİ:**
 * - En az 8 karakter
 * - Büyük ve küçük harf
 * - En az bir rakam
 * - Özel karakter önerilir
 * 
 * **KULLANIM AKIŞI:**
 * 1. Mevcut şifre girişi
 * 2. Yeni şifre girişi (güç göstergesi ile)
 * 3. Yeni şifre tekrarı
 * 4. Başarılı değişiklik sonrası otomatik geri dönüş
 */
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
import { lightColors, spacing } from '@/theme';
import { useChangePassword } from '@/features/settings/hooks/useChangePassword';
import { useToast } from '@/providers/ToastProvider';

/**
 * Şifre gücünü hesaplayan fonksiyon
 * 
 * **PUANLAMA SİSTEMİ:**
 * - 8+ karakter: +25 puan
 * - 12+ karakter: +10 puan (ek)
 * - Küçük harf: +15 puan (zorunlu)
 * - Büyük harf: +15 puan (zorunlu)
 * - Rakam içeriyor: +15 puan (zorunlu)
 * - Özel karakter (@$!%*?&): +15 puan (zorunlu)
 * 
 * @param {string} password - Kontrol edilecek şifre
 * @returns {number} Şifre gücü (0-100)
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  // Minimum 6 karakter (zorunlu)
  if (password.length >= 6) strength += 20;
  // 8+ karakter bonus
  if (password.length >= 8) strength += 10;
  // 12+ karakter bonus
  if (password.length >= 12) strength += 10;
  // Küçük harf (zorunlu)
  if (/[a-z]/.test(password)) strength += 15;
  // Büyük harf (zorunlu)
  if (/[A-Z]/.test(password)) strength += 15;
  // Rakam (zorunlu)
  if (/\d/.test(password)) strength += 15;
  // Özel karakter (zorunlu - @$!%*?&)
  if (/[@$!%*?&]/.test(password)) strength += 15;
  return Math.min(strength, 100);
};

/**
 * Şifre gücü metnini döndüren fonksiyon
 * 
 * @param {string} password - Kontrol edilecek şifre
 * @returns {string} Güç metni (Zayıf, Orta, Güçlü, Çok Güçlü)
 */
const getPasswordStrengthText = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  if (strength < 50) return 'Zayıf';
  if (strength < 75) return 'Orta';
  if (strength < 95) return 'Güçlü';
  return 'Çok Güçlü';
};

/**
 * Şifre gücüne göre renk döndüren fonksiyon
 * 
 * @param {string} password - Kontrol edilecek şifre
 * @returns {string} Renk kodu (error, warning, primary, success)
 */
const getPasswordStrengthColor = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  if (strength < 50) return lightColors.error[500];
  if (strength < 75) return lightColors.warning[500];
  if (strength < 95) return lightColors.primary[500];
  return lightColors.success[500];
};

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ChangePassword'>;

/**
 * ChangePasswordScreen Bileşeni
 * 
 * Kullanıcının şifresini güvenli bir şekilde değiştirmesini sağlar.
 * Şifre gücü göstergesi ve gerçek zamanlı validasyon içerir.
 * 
 * @param {Props} props - Component props
 * @param {Object} props.navigation - React Navigation nesnesi
 * @returns {JSX.Element} Şifre değiştirme ekranı
 */
export const ChangePasswordScreen = ({ navigation }: Props) => {
  const { showToast } = useToast();
  
  // Form state'leri
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Şifre görünürlük state'leri
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Şifre değiştirme mutation'ı
  const changePasswordMutation = useChangePassword();

  /**
   * Form submit handler'ı
   * 
   * **AKIŞ:**
   * 1. Form validasyonu
   * 2. Şifre eşleşme kontrolü
   * 3. Backend'e istek gönder
   * 4. Başarılı ise toast göster ve geri dön
   */
  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Şifreler eşleşmiyor', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Yeni şifre en az 8 karakter olmalıdır', 'error');
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
          // Form'u temizle
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          
          /**
           * Toast göster (modal değil - touch events engellenmez)
           * Modal açık kalırsa navigation.goBack() çalışmaz
           */
          showToast('Şifreniz başarıyla değiştirildi', 'success');
          
          // Toast'un gösterilmesi için kısa bir gecikme sonrası geri dön
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        },
        onError: (error: any) => {
          // Backend'den gelen hata mesajını göster
          const errorMessage = error?.response?.data?.message 
            || error?.message 
            || 'Şifre değiştirilirken bir hata oluştu';
          showToast(errorMessage, 'error');
        },
      }
    );
  };

  /**
   * Form validasyon kontrolü
   * Tüm alanlar dolu ve şifreler eşleşiyor mu?
   */
  const isFormValid =
    currentPassword.length >= 1 &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
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
            <Ionicons name="lock-closed" size={32} color={lightColors.primary[600]} />
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
            <Ionicons name="checkmark-circle" size={20} color={lightColors.primary[600]} />
            <Typography variant="h3" style={styles.infoTitle}>
              Güçlü Şifre Kriterleri
            </Typography>
          </View>
          <View style={styles.infoList}>
            <Typography variant="caption" style={styles.infoItem}>
              • En az 8 karakter uzunluğunda olmalı
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
                  <Ionicons name="eye-off" size={20} color={lightColors.text.secondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={lightColors.text.secondary} />
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
                  <Ionicons name="eye-off" size={20} color={lightColors.text.secondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={lightColors.text.secondary} />
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
                  <Ionicons name="eye-off" size={20} color={lightColors.text.secondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={lightColors.text.secondary} />
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
    backgroundColor: lightColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: lightColors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: lightColors.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: spacing.xl,
    backgroundColor: lightColors.primary[50],
    borderColor: lightColors.primary[200],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: lightColors.primary[700],
    fontSize: 15,
    fontWeight: '600',
  },
  infoList: {
    gap: spacing.xs,
  },
  infoItem: {
    color: lightColors.primary[700],
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
    color: lightColors.text.primary,
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
    color: lightColors.error[600],
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
    color: lightColors.text.secondary,
    fontSize: 12,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
