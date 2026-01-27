/**
 * @file DeleteAccountScreen.tsx
 * @description Hesap silme ekranı - App Store/Play Store gereksinimi
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/layout/Screen';
import { lightColors, spacing } from '@/theme';
import { useToast } from '@/providers/ToastProvider';
import { useMutation } from '@tanstack/react-query';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { accountService } from '@/api/services/account.service';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'DeleteAccount'>;

export const DeleteAccountScreen = (_props: Props) => {
  const { showToast } = useToast();
  const logoutMutation = useLogout();
  
  const [understood, setUnderstood] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // Backend API çağrısı - hesabı pasifleştir
      await accountService.deactivateAccount();
    },
    onSuccess: () => {
      showToast('Hesabınız kapatıldı', 'success');
      setTimeout(() => {
        logoutMutation.mutate();
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Hesap kapatılırken bir hata oluştu';
      showToast(errorMessage, 'error');
    },
  });

  const handleDeleteAccount = () => {
    if (!understood) {
      showToast('Lütfen sonuçları anladığınızı onaylayın', 'error');
      return;
    }

    Alert.alert(
      'Son Onay',
      'Bu işlem geri alınamaz. Hesabınız pasifleştirilecek ve artık giriş yapamayacaksınız.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabı Kapat',
          style: 'destructive',
          onPress: () => deleteAccountMutation.mutate(),
        },
      ]
    );
  };

  const isFormValid = understood;

  return (
    <Screen scrollable={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="warning" size={32} color={lightColors.error[600]} />
          </View>
          <Typography variant="h2" style={styles.headerTitle}>
            Hesabı Sil
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Bu işlem geri alınamaz
          </Typography>
        </View>

        {/* Uyarı Kartı */}
        <Card variant="outlined" padding="lg" style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="alert-circle" size={24} color={lightColors.error[600]} />
            <Typography variant="h3" style={styles.warningTitle}>
              Dikkat!
            </Typography>
          </View>
          <Typography variant="body" style={styles.warningText}>
            Hesabınızı kapattığınızda:
          </Typography>
          <View style={styles.warningList}>
            <Typography variant="caption" style={styles.warningItem}>
              • Hesabınız pasifleştirilir ve giriş yapamazsınız
            </Typography>
            <Typography variant="caption" style={styles.warningItem}>
              • Tüm oturumlarınız sonlandırılır
            </Typography>
            <Typography variant="caption" style={styles.warningItem}>
              • Başvurularınız görüntülenemez
            </Typography>
            <Typography variant="caption" style={styles.warningItem}>
              • Verileriniz saklanır (silinmez)
            </Typography>
            <Typography variant="caption" style={styles.warningItem}>
              • Yeniden aktifleştirme için destek ekibiyle iletişime geçmelisiniz
            </Typography>
          </View>
        </Card>

        {/* Form */}
        <Card variant="elevated" padding="lg" style={styles.formCard}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              checked={understood}
              onPress={() => setUnderstood(!understood)}
              label="Hesabımın pasifleştirileceğini ve artık giriş yapamayacağımı anlıyorum"
            />
          </View>

          <Button
            label="Hesabı Kapat"
            onPress={handleDeleteAccount}
            disabled={!isFormValid || deleteAccountMutation.isPending}
            loading={deleteAccountMutation.isPending}
            variant="danger"
            fullWidth
            size="lg"
            style={styles.deleteButton}
          />
        </Card>

        {/* Alternatif Seçenekler */}
        <Card variant="outlined" padding="lg" style={styles.alternativeCard}>
          <Typography variant="h3" style={styles.alternativeTitle}>
            Alternatif Seçenekler
          </Typography>
          <Typography variant="caption" style={styles.alternativeText}>
            Hesabınızı silmek yerine:
          </Typography>
          <View style={styles.alternativeList}>
            <Typography variant="caption" style={styles.alternativeItem}>
              • Bildirim ayarlarınızı değiştirebilirsiniz
            </Typography>
            <Typography variant="caption" style={styles.alternativeItem}>
              • Gizlilik ayarlarınızı güncelleyebilirsiniz
            </Typography>
            <Typography variant="caption" style={styles.alternativeItem}>
              • Destek ekibimizle iletişime geçebilirsiniz
            </Typography>
          </View>
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
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightColors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: lightColors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: lightColors.error[600],
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  warningCard: {
    marginBottom: spacing.xl,
    backgroundColor: lightColors.error[50],
    borderColor: lightColors.error[200],
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  warningTitle: {
    color: lightColors.error[700],
    fontSize: 20,
    fontWeight: '700',
  },
  warningText: {
    color: lightColors.error[700],
    fontSize: 15,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  warningList: {
    gap: spacing.sm,
  },
  warningItem: {
    color: lightColors.error[700],
    fontSize: 14,
    lineHeight: 22,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    marginBottom: spacing.lg,
  },
  deleteButton: {
    marginTop: spacing.md,
  },
  alternativeCard: {
    backgroundColor: lightColors.neutral[50],
    borderColor: lightColors.neutral[200],
  },
  alternativeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: lightColors.text.primary,
    marginBottom: spacing.sm,
  },
  alternativeText: {
    color: lightColors.text.secondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  alternativeList: {
    gap: spacing.sm,
  },
  alternativeItem: {
    color: lightColors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
