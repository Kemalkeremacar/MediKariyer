import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/auth.service';
import { colors, shadows, spacing, borderRadius, typography } from '@/constants/theme';
import { useNavigation } from '@react-navigation/native';

export const PendingApprovalScreen = () => {
  const user = useAuthStore((state) => state.user);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      markUnauthenticated();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.title}>Onay Bekleniyor</Text>
        <Text style={styles.message}>
          Hesabınız admin tarafından onaylanmayı bekliyor.
        </Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}
        <Text style={styles.subMessage}>
          Onaylandıktan sonra sisteme giriş yapabileceksiniz. Lütfen bekleyiniz.
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  content: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing['3xl'],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.md,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.lineHeight.relaxed,
  },
  userInfo: {
    width: '100%',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.lineHeight.normal,
  },
  logoutButton: {
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  logoutButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

