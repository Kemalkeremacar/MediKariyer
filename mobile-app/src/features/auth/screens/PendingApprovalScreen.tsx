/**
 * @file PendingApprovalScreen.tsx - Stabilizasyon Faz 2
 * @description Admin onayı bekleme ekranı
 * 
 * Değişiklikler:
 * - Polling interval 10 saniyeden 30 saniyeye çıkarıldı
 * - Manuel "Durumu Kontrol Et" butonu eklendi
 * - Polling mekanizması optimize edildi
 * - RootNavigator ile çift kontrol kaldırıldı (sadece store update yeterli)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useLogout } from '../hooks/useLogout';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import type { AuthStackParamList } from '@/navigation/types';

// Polling interval: 30 seconds (optimized from 10 seconds)
const POLLING_INTERVAL_MS = 30 * 1000; // 30 seconds

export const PendingApprovalScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const logoutMutation = useLogout();
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  
  // Determine if this is after registration (not authenticated) or after login attempt (authenticated but not approved)
  const isAfterRegistration = authStatus !== 'authenticated';

  /**
   * Check approval status manually or via polling
   * RootNavigator will automatically handle navigation when user is approved
   */
  const checkApprovalStatus = useCallback(async () => {
    // Only check if authenticated (has tokens)
    if (authStatus !== 'authenticated' || !user) {
      return;
    }

    setIsChecking(true);
    try {
      const updatedUser = await authService.getMe();
      const isApproved = 
        updatedUser.is_approved === true || 
        updatedUser.is_approved === 1 || 
        updatedUser.is_approved === 'true' || 
        updatedUser.is_approved === '1';
      const isAdmin = updatedUser.role === 'admin';
      
      if (isApproved || isAdmin) {
        // User is approved - update store and RootNavigator will handle navigation automatically
        markAuthenticated(updatedUser);
        console.log('✅ User is approved, RootNavigator will navigate to App');
        
        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
      
      setLastCheckTime(new Date());
    } catch (error) {
      console.error('Error checking approval status:', error);
      // Don't clear interval on error, keep polling
    } finally {
      setIsChecking(false);
    }
  }, [authStatus, user, markAuthenticated]);

  /**
   * Start polling for approval status (only if authenticated)
   */
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      // Initial check
      checkApprovalStatus();
      
      // Start polling every 30 seconds
      pollingIntervalRef.current = setInterval(() => {
        checkApprovalStatus();
      }, POLLING_INTERVAL_MS);
      
      // Cleanup on unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [authStatus, user, checkApprovalStatus]);

  /**
   * Manual check button handler
   */
  const handleManualCheck = useCallback(() => {
    checkApprovalStatus();
  }, [checkApprovalStatus]);

  /**
   * Go to login handler
   */
  const handleGoToLogin = useCallback(() => {
    // Eğer authenticated ise logout yap, değilse sadece login'e git
    if (authStatus === 'authenticated') {
      // Clear polling before logout
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      logoutMutation.mutate();
    } else {
      navigation.replace('Login');
    }
  }, [authStatus, logoutMutation, navigation]);

  // Format last check time
  const lastCheckText = lastCheckTime
    ? `Son kontrol: ${lastCheckTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Henüz kontrol edilmedi';

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
            {isAfterRegistration ? 'Kayıt Başarılı! 🎉' : 'Admin Onayı Bekleniyor ⏳'}
          </Typography>

          <Typography variant="body" style={styles.subtitle}>
            {isAfterRegistration 
              ? 'Hesabınız başarıyla oluşturuldu'
              : 'Hesabınız henüz admin tarafından onaylanmadı'}
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
              {isAfterRegistration
                ? 'Hesabınız admin tarafından onaylandıktan sonra e-posta adresinize bildirim gelecek ve giriş yapabileceksiniz.'
                : 'Hesabınız admin tarafından onaylandıktan sonra e-posta adresinize bildirim gelecek ve otomatik olarak giriş yapabileceksiniz. Uygulamayı kapatıp açtığınızda da giriş yapmış olarak kalacaksınız.'}
            </Typography>
            
            <Typography variant="bodySmall" style={styles.note}>
              Bu işlem genellikle 24 saat içinde tamamlanır.
            </Typography>
          </View>

          {/* Manual Check Button - Only show if authenticated */}
          {authStatus === 'authenticated' && (
            <View style={styles.checkSection}>
              <Button
                variant="outline"
                label={isChecking ? "Kontrol Ediliyor..." : "Durumu Kontrol Et"}
                onPress={handleManualCheck}
                loading={isChecking}
                fullWidth
                size="md"
                style={styles.checkButton}
              />
              {lastCheckTime && (
                <Typography variant="caption" style={styles.lastCheckText}>
                  {lastCheckText}
                </Typography>
              )}
            </View>
          )}

          <Button
            variant="gradient"
            label="Giriş Ekranına Dön"
            onPress={handleGoToLogin}
            gradientColors={['#4A90E2', '#2E5C8A']}
            fullWidth
            size="lg"
            loading={logoutMutation.isPending}
            style={styles.loginButton}
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
    marginBottom: 24,
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
  checkSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  checkButton: {
    marginBottom: 8,
  },
  lastCheckText: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
  },
  loginButton: {
    marginBottom: 32,
  },
});
