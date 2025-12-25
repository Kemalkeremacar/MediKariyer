/**
 * @file PendingApprovalScreen.tsx
 * @description Admin onayı bekleme ekranı
 */

import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useLogout } from '../hooks/useLogout';

export const PendingApprovalScreen = () => {
  const logoutMutation = useLogout();

  const handleGoToLogin = () => {
    // Logout yap, RootNavigator otomatik olarak Auth ekranına yönlendirecek
    logoutMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <LinearGradient
        colors={['#4A90E2', '#2E5C8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="hourglass-outline" size={64} color="#ffffff" />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Typography variant="h1" style={styles.title}>
          Kayıt Başarılı! 🎉
        </Typography>

        <Typography variant="body" style={styles.subtitle}>
          Hesabınız başarıyla oluşturuldu
        </Typography>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Typography variant="body" style={styles.infoText}>
              Bilgileriniz alındı
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color="#F59E0B" />
            <Typography variant="body" style={styles.infoText}>
              Admin onayı bekleniyor
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color="#3B82F6" />
            <Typography variant="body" style={styles.infoText}>
              Onay sonrası e-posta gelecek
            </Typography>
          </View>
        </View>

        <View style={styles.messageCard}>
          <Typography variant="body" style={styles.message}>
            Hesabınız admin tarafından onaylandıktan sonra e-posta adresinize bildirim gelecek ve giriş yapabileceksiniz.
          </Typography>
          
          <Typography variant="bodySmall" style={styles.note}>
            Bu işlem genellikle 24 saat içinde tamamlanır.
          </Typography>
        </View>

        <Button
          variant="gradient"
          label="Giriş Ekranına Dön"
          onPress={handleGoToLogin}
          gradientColors={['#4A90E2', '#2E5C8A']}
          fullWidth
          size="lg"
          loading={logoutMutation.isPending}
        />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  messageCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  message: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
