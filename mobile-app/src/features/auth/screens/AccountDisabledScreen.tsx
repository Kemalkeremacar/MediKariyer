import React from 'react';
import { View, StyleSheet, Linking, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useLogout } from '../hooks/useLogout';

export const AccountDisabledScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleContact = () => {
    // E-posta ile iletişim
    Linking.openURL('mailto:destek@medikariyer.com?subject=Hesap Pasif Durumda');
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
            Hesabınızın neden pasif duruma alındığını öğrenmek için lütfen sistem yöneticisi ile iletişime geçin.
          </Typography>

          <Button
            variant="gradient"
            label="İletişime Geç"
            onPress={handleContact}
            fullWidth
            gradientColors={['#4A90E2', '#2E5C8A']}
            size="lg"
            style={styles.button}
          />

          <Button
            label="Çıkış Yap"
            variant="ghost"
            onPress={handleLogout}
            fullWidth
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
});
