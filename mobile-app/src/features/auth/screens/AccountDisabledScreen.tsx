import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius } from '@/theme';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
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
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      <Card padding="3xl" shadow="md" style={styles.card}>
        <Typography variant="heading" style={styles.icon}>
          🚫
        </Typography>
        <Typography variant="heading">Hesap Pasif</Typography>
        <Typography variant="bodySecondary" style={styles.message}>
          Hesabınız sistem yöneticisi tarafından pasif duruma alınmıştır.
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
          Hesabınızın neden pasif duruma alındığını öğrenmek için lütfen sistem yöneticisi ile iletişime geçin.
        </Typography>
        <Button
          label="İletişime Geç"
          onPress={handleContact}
          fullWidth
          style={styles.button}
        />
        <Button
          label="Çıkış Yap"
          variant="ghost"
          onPress={handleLogout}
          fullWidth
          loading={logoutMutation.isPending}
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
  button: {
    marginBottom: spacing.md,
  },
});
