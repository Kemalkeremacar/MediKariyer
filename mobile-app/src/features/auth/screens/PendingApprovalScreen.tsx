/**
 * @file PendingApprovalScreen.tsx
 * @description Admin onayı bekleme ekranı - Doktor kayıt sonrası veya onaysız giriş denemesi sonrası gösterilir
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖNEMLİ NOTLAR:**
 * - Polling interval: 30 saniye (performans optimizasyonu)
 * - Manuel "Durumu Kontrol Et" butonu ile anında kontrol imkanı
 * - RootNavigator otomatik olarak onaylı kullanıcıları App stack'e yönlendirir
 * - 403 hataları sessizce işlenir (beklenen durum)
 * 
 * **KULLANIM SENARYOLARI:**
 * 1. Yeni kayıt sonrası: Kullanıcı authenticated değil, sadece bilgilendirme
 * 2. Onaysız giriş denemesi: Kullanıcı authenticated ama onaysız, polling aktif
 * 
 * **Değişiklikler (Stabilizasyon Faz 2):**
 * - Polling interval 10 saniyeden 30 saniyeye çıkarıldı
 * - Manuel kontrol butonu eklendi
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
import { navigationRef } from '@/navigation/navigationRef';
import { useTranslation } from '@/hooks/useTranslation';
import type { AuthStackParamList } from '@/navigation/types';

/**
 * Polling interval sabiti
 * 30 saniye (10 saniyeden optimize edildi - sunucu yükünü azaltmak için)
 */
const POLLING_INTERVAL_MS = 30 * 1000;

/**
 * PendingApprovalScreen Bileşeni
 * 
 * Admin onayı bekleyen doktorlar için bilgilendirme ve durum kontrol ekranı.
 * İki farklı senaryoda kullanılır:
 * 1. Yeni kayıt sonrası (authenticated değil)
 * 2. Onaysız giriş denemesi (authenticated ama onaysız)
 * 
 * @returns {JSX.Element} Admin onay bekleme ekranı
 */
export const PendingApprovalScreen = () => {
  // Navigation ve hooks
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const logoutMutation = useLogout();
  const { t } = useTranslation();
  
  // Auth store state'leri
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  
  // Local state'ler
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  
  // Component mount/unmount tracking
  useEffect(() => {
    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);
  
  /**
   * Kullanıcının kayıt sonrası mı yoksa giriş denemesi sonrası mı olduğunu belirle
   * - Kayıt sonrası: authenticated değil (token yok)
   * - Giriş denemesi: authenticated ama onaysız (token var)
   */
  const isAfterRegistration = authStatus !== 'authenticated';

  /**
   * Onay durumunu kontrol et (manuel veya otomatik polling ile)
   * 
   * **AKIŞ:**
   * 1. Sadece authenticated kullanıcılar için çalışır
   * 2. Backend'den güncel kullanıcı bilgilerini çeker
   * 3. Onay durumunu kontrol eder (is_approved veya admin rolü)
   * 4. Onaylıysa store'u günceller, RootNavigator otomatik yönlendirir
   * 5. 403 hataları sessizce işlenir (beklenen durum)
   * 
   * **ÖNEMLİ:** RootNavigator otomatik olarak onaylı kullanıcıları App stack'e yönlendirir,
   * bu fonksiyon sadece store'u günceller.
   * 
   * @returns {Promise<void>}
   */
  const checkApprovalStatus = useCallback(async () => {
    // Sadece authenticated kullanıcılar için kontrol yap (token varsa)
    if (authStatus !== 'authenticated' || !user) {
      return;
    }

    // Eğer kullanıcı zaten onaylıysa, tekrar kontrol etme (loop önleme)
    const currentIsApproved = 
      user.is_approved === true || 
      user.is_approved === 1 || 
      user.is_approved === 'true' || 
      user.is_approved === '1';
    const currentIsAdmin = user.role === 'admin';
    
    if (currentIsApproved || currentIsAdmin) {
      return;
    }

    setIsChecking(true);
    try {
      // Backend'den güncel kullanıcı bilgilerini çek
      const updatedUser = await authService.getMe();
      
      // Onay durumunu kontrol et (farklı veri tiplerini destekle)
      const isApproved = 
        updatedUser.is_approved === true || 
        updatedUser.is_approved === 1 || 
        updatedUser.is_approved === 'true' || 
        updatedUser.is_approved === '1';
      const isAdmin = updatedUser.role === 'admin';
      
      if (isApproved || isAdmin) {
        // Kullanıcı onaylandı - store'u güncelle
        // RootNavigator otomatik olarak App stack'e yönlendirecek
        markAuthenticated(updatedUser);
        
        // Polling interval'i temizle (artık gerek yok)
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        // CRITICAL: Component'i hemen unmount etmek için navigation'ı force et
        // RootNavigator'ın state-based navigation'ını beklemek yerine manuel yönlendirme
        
        // BACKUP: Manuel navigation reset (RootNavigator'a ek olarak)
        setTimeout(() => {
          const currentRoute = navigationRef.getCurrentRoute();
          if (currentRoute?.name === 'PendingApproval') {
            if (navigationRef.isReady()) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          }
        }, 200);
        
        return;
      }
      
      // Son kontrol zamanını güncelle
      setLastCheckTime(new Date());
    } catch (error: any) {
      /**
       * Hata kontrolü
       * 403 hataları beklenen durumdur (kullanıcı henüz onaylanmamış)
       * Diğer hatalar loglanır ama kullanıcıya gösterilmez
       */
      const is403Error = error?.message?.includes('403') || 
                         error?.message?.includes('yetkiniz yok') ||
                         error?.message?.includes('admin onayını bekliyor') ||
                         error?.message?.includes('onaylanmadı') ||
                         error?.isSilent === true;
      
      if (is403Error) {
        // Beklenen hata - kullanıcı hala onay bekliyor
        // Sessizce polling'e devam et (alert gösterme)
        setLastCheckTime(new Date());
      } else {
        // Beklenmeyen hata - sessizce devam et
      }
      // Hata durumunda interval'i temizleme, polling'e devam et
    } finally {
      setIsChecking(false);
    }
  }, [authStatus, user?.id, user?.is_approved, user?.role, markAuthenticated]); // user yerine spesifik alanları kullan

  /**
   * Onay durumu için polling başlat (sadece authenticated kullanıcılar için)
   * 
   * **AKIŞ:**
   * 1. İlk kontrol hemen yapılır
   * 2. 30 saniyede bir otomatik kontrol yapılır
   * 3. Component unmount olduğunda interval temizlenir
   * 
   * **NOT:** Kayıt sonrası kullanıcılar için polling çalışmaz (authenticated değiller)
   */
  useEffect(() => {
    // Sadece authenticated ve onaysız kullanıcılar için polling yap
    if (authStatus === 'authenticated' && user) {
      const currentIsApproved = 
        user.is_approved === true || 
        user.is_approved === 1 || 
        user.is_approved === 'true' || 
        user.is_approved === '1';
      const currentIsAdmin = user.role === 'admin';
      
      // Eğer kullanıcı zaten onaylıysa polling başlatma
      if (currentIsApproved || currentIsAdmin) {
        return;
      }
      
      
      // İlk kontrol hemen yap
      checkApprovalStatus();
      
      // 30 saniyede bir otomatik kontrol başlat
      pollingIntervalRef.current = setInterval(() => {
        checkApprovalStatus();
      }, POLLING_INTERVAL_MS);
      
      // Component unmount olduğunda temizlik yap
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [authStatus, user?.id, user?.is_approved, user?.role, checkApprovalStatus]); // user yerine spesifik alanları kullan

  /**
   * Manuel kontrol butonu handler'ı
   * Kullanıcı istediği zaman onay durumunu kontrol edebilir
   */
  const handleManualCheck = useCallback(() => {
    checkApprovalStatus();
  }, [checkApprovalStatus]);

  /**
   * Giriş ekranına dön handler'ı
   * 
   * **AKIŞ:**
   * - Authenticated kullanıcılar: Logout yap (polling'i temizle)
   * - Kayıt sonrası kullanıcılar: Direkt login'e git
   * - Onaylı kullanıcılar: Logout yapma, RootNavigator yönlendirecek
   */
  const handleGoToLogin = useCallback(() => {
    // Eğer kullanıcı onaylıysa logout yapma
    if (user) {
      const currentIsApproved = 
        user.is_approved === true || 
        user.is_approved === 1 || 
        user.is_approved === 'true' || 
        user.is_approved === '1';
      const currentIsAdmin = user.role === 'admin';
      
      if (currentIsApproved || currentIsAdmin) {
        return;
      }
    }
    
    if (authStatus === 'authenticated') {
      // Polling'i temizle (logout öncesi)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Logout yap
      logoutMutation.mutate();
    } else {
      // Kayıt sonrası kullanıcılar direkt login'e git
      navigation.replace('Login');
    }
  }, [authStatus, user?.is_approved, user?.role, logoutMutation, navigation]);

  /**
   * Render
   * 
   * **EKRAN YAPISI:**
   * 1. Gradient header (hourglass icon)
   * 2. Başlık ve açıklama (kayıt/giriş durumuna göre)
   * 3. Bilgilendirme kartları (süreç adımları)
   * 4. Mesaj kartı (detaylı açıklama)
   * 5. Manuel kontrol butonu (sadece authenticated için)
   * 6. Giriş ekranına dön butonu
   */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
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
            {isAfterRegistration ? t('auth.pendingApproval.title') + ' 🎉' : t('auth.pendingApproval.title') + ' ⏳'}
          </Typography>

          <Typography variant="body" style={styles.subtitle}>
            {t('auth.pendingApproval.description')}
          </Typography>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Typography variant="body" style={styles.infoText}>
                {t('auth.pendingApproval.infoReceived')}
              </Typography>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
              <Typography variant="body" style={styles.infoText}>
                {t('auth.pendingApproval.waitingApproval')}
              </Typography>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color="#3B82F6" />
              <Typography variant="body" style={styles.infoText}>
                {t('auth.pendingApproval.emailNotification')}
              </Typography>
            </View>
          </View>

          <View style={styles.messageCard}>
            <Typography variant="body" style={styles.message}>
              {isAfterRegistration
                ? t('auth.pendingApproval.messageAfterRegistration')
                : t('auth.pendingApproval.messageAfterLogin')}
            </Typography>
            
            <Typography variant="bodySmall" style={styles.note}>
              {t('auth.pendingApproval.processingTime')}
            </Typography>
          </View>

          {/* Manuel Kontrol Butonu - Sadece authenticated kullanıcılar için */}
          {authStatus === 'authenticated' && (
            <View style={styles.checkSection}>
              <Button
                variant="outline"
                onPress={handleManualCheck}
                loading={isChecking}
                size="lg"
                style={styles.checkButton}
              >
                {isChecking ? t('auth.pendingApproval.checking') : t('auth.pendingApproval.checkStatus')}
              </Button>
              {lastCheckTime && (
                <Typography variant="caption" style={styles.lastCheckText}>
                  {t('auth.pendingApproval.lastCheck')}: {lastCheckTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )}
            </View>
          )}

          <Button
            variant="primary"
            onPress={handleGoToLogin}
            size="lg"
            loading={logoutMutation.isPending}
            style={styles.loginButton}
          >
            {t('auth.pendingApproval.logout')}
          </Button>
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
