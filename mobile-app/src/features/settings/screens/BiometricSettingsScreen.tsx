/**
 * @file BiometricSettingsScreen.tsx
 * @description Biometric authentication settings screen
 * 
 * Features:
 * - Enable/disable biometric login
 * - Show available biometric types
 * - Test biometric authentication
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Switch } from '@/components/ui/Switch';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useBiometricLogin } from '@/features/auth/hooks/useBiometricLogin';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

export const BiometricSettingsScreen = () => {
  const { user } = useAuth();
  const {
    isAvailable,
    isEnabled,
    isLoading,
    biometricTypes,
    authenticate,
    enableBiometric,
    disableBiometric,
  } = useBiometricAuth();

  const { saveBiometricCredentials, clearBiometricCredentials } = useBiometricLogin();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      // Enable biometric
      setIsSaving(true);
      
      // Test biometric first
      const result = await authenticate('Biyometrik girişi etkinleştirmek için doğrulayın');
      
      if (result.success) {
        // Save user email for biometric login
        if (user?.email) {
          await saveBiometricCredentials(user.email);
        }
        await enableBiometric();
        Alert.alert('Başarılı', 'Biyometrik giriş etkinleştirildi.');
      } else {
        Alert.alert('Hata', result.error || 'Kimlik doğrulama başarısız.');
      }
      
      setIsSaving(false);
    } else {
      // Disable biometric
      await clearBiometricCredentials();
      await disableBiometric();
      Alert.alert('Başarılı', 'Biyometrik giriş devre dışı bırakıldı.');
    }
  };

  const handleTestBiometric = async () => {
    const result = await authenticate('Test için doğrulayın');
    
    if (result.success) {
      Alert.alert('Başarılı', 'Kimlik doğrulama başarılı!');
    } else {
      Alert.alert('Hata', result.error || result.warning || 'Kimlik doğrulama başarısız.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Yükleniyor..." />;
  }

  if (!isAvailable) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <Ionicons name="finger-print" size={64} color={colors.neutral[400]} />
          <Typography variant="h2" style={styles.emptyTitle}>
            Biyometrik Kimlik Doğrulama Kullanılamıyor
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Cihazınız biyometrik kimlik doğrulamayı desteklemiyor veya ayarlanmamış.
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.headerTitle}>
            Biyometrik Giriş
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Hızlı ve güvenli giriş için biyometrik kimlik doğrulamayı kullanın
          </Typography>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Available Biometric Types */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Kullanılabilir Yöntemler
            </Typography>
            <Card variant="filled" padding="lg" style={styles.methodsCard}>
              {biometricTypes.map((type, index) => (
                <View key={index} style={styles.methodRow}>
                  <Ionicons name="finger-print" size={20} color={colors.primary[600]} />
                  <Typography variant="body" style={styles.methodText}>
                    {type}
                  </Typography>
                </View>
              ))}
            </Card>
          </View>

          {/* Enable/Disable Toggle */}
          <View style={styles.section}>
            <Card variant="outlined" padding="lg">
              <View style={styles.toggleRow}>
                <View style={styles.toggleContent}>
                  <View style={styles.toggleHeader}>
                    <Typography variant="h3" style={styles.toggleTitle}>
                      Biyometrik Giriş
                    </Typography>
                    <Badge variant={isEnabled ? 'success' : 'neutral'} size="sm">
                      {isEnabled ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </View>
                  <Typography variant="caption" style={styles.toggleSubtitle}>
                    {isEnabled ? 'Hızlı giriş etkinleştirildi' : 'Şifre ile giriş yapılıyor'}
                  </Typography>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={handleToggleBiometric}
                  disabled={isSaving}
                />
              </View>
            </Card>
          </View>

          {/* Test Button */}
          {isEnabled && (
            <View style={styles.section}>
              <Button
                label="Biyometrik Doğrulamayı Test Et"
                onPress={handleTestBiometric}
                variant="outline"
                fullWidth
              />
            </View>
          )}

          {/* Info Card */}
          <Card variant="filled" padding="lg" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary[600]} />
              <Typography variant="h3" style={styles.infoTitle}>
                Bilgi
              </Typography>
            </View>
            <Divider spacing="sm" />
            <Typography variant="body" style={styles.infoText}>
              • Biyometrik giriş, şifrenizi girmeden hızlı giriş yapmanızı sağlar.{'\n'}
              • Şifreniz cihazınızda saklanmaz, sadece oturum bilgileri kullanılır.{'\n'}
              • Güvenlik için düzenli olarak şifre ile giriş yapmanız önerilir.
            </Typography>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  methodsCard: {
    backgroundColor: colors.neutral[50],
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  infoCard: {
    backgroundColor: colors.primary[50],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[700],
  },
  infoText: {
    fontSize: 14,
    color: colors.primary[800],
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
