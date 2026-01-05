import React from 'react';
import { View, StyleSheet, Linking, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useLogout } from '../hooks/useLogout';
import { tokenManager } from '@/utils/tokenManager';

/**
 * AccountDisabledScreen - Hesap Pasif Durumda Ekranı
 * 
 * Bu ekran, kullanıcının hesabı sistem yöneticisi tarafından pasif duruma alındığında gösterilir.
 * Kullanıcı bu ekrandan çıkış yaparak başka bir hesapla giriş yapabilir.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */
export const AccountDisabledScreen = () => {
  const user = useAuthStore((state) => state.user);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const logoutMutation = useLogout();

  /**
   * Logout işlemi - Garanti için hem hook hem de manuel temizlik yapıyoruz
   */
  const handleLogout = async () => {
    try {
      // 1. useLogout hook'unu kullan (API çağrısı, token temizleme, cache temizleme)
      logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          // 2. Garanti olsun diye manuel olarak da temizlik yap
          await performManualCleanup();
        },
        onError: async () => {
          // API hatası olsa bile manuel temizlik yap
          await performManualCleanup();
        },
      });
    } catch (error) {
      // Hata durumunda da manuel temizlik yap
      await performManualCleanup();
    }
  };

  /**
   * Manuel temizlik - Garanti için ekstra temizlik adımları
   */
  const performManualCleanup = async () => {
    try {
      // Token'ları temizle
      await tokenManager.clearTokens();
      
      // Auth store'u temizle
      markUnauthenticated();
      
      console.log('✅ Manual cleanup completed');
    } catch (error) {
      console.error('❌ Manual cleanup error:', error);
      // Hata olsa bile store'u temizle
      markUnauthenticated();
    }
  };

  /**
   * Destek ile iletişime geç
   */
  const handleContact = () => {
    const email = 'destek@medikariyer.com';
    const subject = 'Hesap Pasif Durumda - Yardım Talebi';
    const body = user?.email 
      ? `Merhaba,\n\nHesabım (${user.email}) pasif duruma alınmış. Lütfen hesabımın durumunu kontrol edip bilgilendirebilir misiniz?\n\nTeşekkürler.`
      : 'Merhaba,\n\nHesabım pasif duruma alınmış. Lütfen hesabımın durumunu kontrol edip bilgilendirebilir misiniz?\n\nTeşekkürler.';
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`).catch(() => {
      Alert.alert(
        'E-posta Açılamadı',
        `Lütfen manuel olarak ${email} adresine e-posta gönderin.`,
        [{ text: 'Tamam' }]
      );
    });
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
        {/* Header with Gradient - Login/Register pattern ile tutarlı */}
        <LinearGradient
          colors={['#4A90E2', '#2E5C8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Typography variant="h1" style={styles.headerIcon}>
              🚫
            </Typography>
          </View>
          <Typography variant="h1" style={styles.headerTitle}>
            Hesap Pasif
          </Typography>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          <Typography variant="body" style={styles.message}>
            Hesabınız sistem yöneticisi tarafından pasif duruma alınmıştır.
          </Typography>

          <View style={styles.warningBox}>
            <Typography variant="title" style={styles.warningTitle}>
              ⚠️ Hesap Erişimi Engellendi
            </Typography>
            <Typography variant="bodySmall" style={styles.warningText}>
              Bu hesap ile giriş yapamazsınız. Hesabınızın durumu hakkında bilgi almak veya başka bir hesapla giriş yapmak için aşağıdaki seçenekleri kullanabilirsiniz.
            </Typography>
          </View>

          {user && (
            <View style={styles.userInfo}>
              {(user.first_name || user.last_name) && (
                <Typography variant="title" style={styles.userName}>
                  {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Kullanıcı'}
                </Typography>
              )}
              {user.email && (
                <Typography variant="bodySmall" style={styles.userEmail}>
                  {user.email}
                </Typography>
              )}
            </View>
          )}

          <Typography variant="body" style={styles.subMessage}>
            Hesabınızın neden pasif duruma alındığını öğrenmek veya hesabınızı tekrar aktif hale getirmek için destek ekibi ile iletişime geçebilirsiniz.
          </Typography>

          <Button
            variant="gradient"
            label="Destekle İletişime Geç"
            onPress={handleContact}
            fullWidth
            gradientColors={['#4A90E2', '#2E5C8A']}
            size="lg"
            style={styles.button}
          />

          <Button
            label="Çıkış Yap ve Başka Hesapla Giriş Yap"
            variant="outline"
            onPress={handleLogout}
            fullWidth
            loading={logoutMutation.isPending}
            disabled={logoutMutation.isPending}
            style={styles.logoutButton}
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
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 64,
    color: '#ffffff',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  message: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 16,
  },
  userInfo: {
    width: '100%',
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
  userName: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  userEmail: {
    textAlign: 'center',
    color: '#6B7280',
  },
  subMessage: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    marginBottom: 16,
  },
  warningBox: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningTitle: {
    marginBottom: 8,
    color: '#92400E',
    fontSize: 18,
    fontWeight: '600',
  },
  warningText: {
    color: '#78350F',
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 8,
  },
});
