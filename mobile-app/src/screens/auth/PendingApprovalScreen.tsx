import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/auth.service';
import { colors, shadows, spacing, borderRadius } from '@/constants/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

export const PendingApprovalScreen = () => {
  const user = useAuthStore((state) => state.user);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);

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
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      <Card padding="3xl" shadow="md" style={styles.card}>
        <Typography variant="heading" style={styles.icon}>
          ⏳
        </Typography>
        <Typography variant="heading">Onay Bekleniyor</Typography>
        <Typography variant="bodySecondary" style={styles.message}>
          Hesabınız admin tarafından onaylanmayı bekliyor.
        </Typography>
        {user && (
          <View style={styles.userInfo}>
            <Typography variant="title" style={styles.userName}>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="bodySecondary" style={styles.userEmail}>
              {user.email}
            </Typography>
          </View>
        )}
        <Typography variant="bodySecondary" style={styles.subMessage}>
          Onaylandıktan sonra sisteme giriş yapabileceksiniz. Lütfen bekleyiniz.
        </Typography>
        <Button
          label="Çıkış Yap"
          variant="ghost"
          onPress={handleLogout}
          fullWidth
        />
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  userInfo: {
    width: '100%',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  userName: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    textAlign: 'center',
  },
  subMessage: {
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
});

